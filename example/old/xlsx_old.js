/*
 * @Author: Shepherd.Lee 
 * @Date: 2020-08-07 22:21:59 
 * @Last Modified by: Shepherd.Lee
 * @Last Modified time: 2020-08-16 18:12:28
 */

var DATA = []; // 全局的读入的 xlsx 的数据
var DICT = []; // 全局的读入的编码规则数据
var ENCODE = []; // 全局的编码后的数据
var TARGET; // 当前需显示的数据对象 eg. DATA/DICT/ENCODE
var TYPE; // 当前显示的数据类型

// 关于编码时候的一些全局配置
var encodeConfig = {
    pass: ['timeStamp', 'actionType'], // 编码结果无视这些字段
    dimensions: [] // 编码维度
}


$(function() {
    delegate( $('#encode-row'), [
        {
            target: '#loaddbdata',
            event: 'click',
            handler: loadDBDataHandler
        },
        {
            target: '#loaddata',
            event: 'click',
            handler: loadDataHandler
        },
        {
            target: '#loaddictionary',
            event: 'click',
            handler: loadDictionaryHandler
        },
        {
            target: '#encode',
            event: 'click',
            handler: encodeHandler
        },
        {
            target: '#export',
            event: 'click',
            handler: exportHandler
        },
        {
            target: '#uploaddata',
            event: 'click',
            handler: uploadHandlerFactory('data')
        },
        {
            target: '#uploaddictionary',
            event: 'click',
            handler: uploadHandlerFactory('dictionary')
        },
        {
            target: '#uploadencode',
            event: 'click',
            handler: uploadHandlerFactory('encode')
        }
    ]);
});

/**
 * 加载数据库数据的事件处理函数
 */
function loadDBDataHandler() {
    const filteredDBData = getFilterDBData();
    if ( !filteredDBData['classid'].length || !filteredDBData['groupid'].length) {
        alert('请完善筛选条件！');
        return false;
    }
    
    $.get('./php/mysql/mysql_to_csv.php', 
        filteredDBData,
        res => {
        if (res) {
            console.log(res);
            alert('数据拉取成功！请加载数据！');
            location.reload();
        }
    });
    return false;
}

/**
 * 加载数据的事件处理函数
 */
function loadDataHandler() {
    const filteredData = getFilterData();
    if ( !filteredData['classid'].length || !filteredData['groupid'].length) {
        alert('请完善筛选条件！');
        return false;
    }
    const data_path = './xlsx/data.csv';
    listen('loadXLSX_finish', mkTable, ['data']);
    loadXLSX(data_path, 'data');
    // $.get('./php/mysql/get_data.php', 
    //     filteredData,
    //     res => {
    //     res = JSON.parse(res);
    //     allowTreeView = true;
    //     DATA = res;
    //     TARGET = DATA; // 按筛选条件过滤后的数据 见filter.js
    //     initSelect(); // 初始化参数设置中的分析单元与分析话语 
    //     trigger('loadXLSX_finish');
    // });
    return false;
}

/**
 * ajax 加载xlsx文件
 */
const loadXLSX = (function() {
    /**
     * ajax 加载xlsx文件
     * 
     * @param {String} xlsx_path xlsx文件的路径
     * @param {String} type = 'data' 读入的是数据还是编码词典
     */
    function loadXLSX(xlsx_path, type = 'data') {
        if (type == 'dictionary' && DICT.length) {
            TARGET = DICT;
            trigger('loadXLSX_finish');
            return;
        }

        $.ajax({
            url: xlsx_path + `?num=${random()}`,
            type: 'GET',
            dataType: 'blob', // 原始数据类文件对象
            success: res => {
                readXLSX(res, type);
            },
            error: err => {
                console.error(err);
                alert('所需文件尚未上传！');
            }
        });
    }

    /**
     * 以二进制形式打开文件(blob对象)读取数据
     * 
     * @param {Blob} file 
     * @param {String} type
     * @returns rows 读取数据的数组
     */
    function readXLSX(file, type) {
        let rows = []; // 存储获取的行数据数组;
        const fileReader = new FileReader();
        fileReader.onload = function(ev) {
            let workbook;
            
            try {
                const data = ev.target.result;

                workbook = XLSX.read(data, {
                    type: 'binary',
                    cellDates: true
                }); // 以二进制流方式读取得到整份excel表格对象
            } catch (err) {
                console.error('文件类型不正确！');
                return ;
            }

            // 表格范围，可用于判断表头是否数量是否正确
            let fromTo = ''; 
            // 遍历每张表读取数据
            for (let sheet in workbook.Sheets) {
                if (workbook.Sheets.hasOwnProperty(sheet)) {
                    fromTo = workbook.Sheets[sheet]['!ref'];
                    console.log('ReadXLSX fromTo:', fromTo); // eg. A1:H9691
                    rows = rows.concat(XLSX.utils.sheet_to_json(workbook.Sheets[sheet]));
                    break; // 默认只读取第一张表
                }
            }

            // 在控制台打印出来表格中的数据长度
            // console.log(rows);
            console.log('Data Length: ', rows.length);
            if (type == 'data') {
                allowTreeView = true;
                DATA = rows;
                TARGET = DATA; // 按筛选条件过滤后的数据 见filter.js
                initSelect(); // 初始化参数设置中的分析单元与分析话语
            } else if (type == 'dictionary') {
                DICT = rows;
                initDictionary(); // 初始化编码词典对象 见dictionary.js
                TARGET = DICT;
            }
            trigger('loadXLSX_finish');
        }

        // 以二进制方式打开文件
        fileReader.readAsBinaryString(file);
    }

    return loadXLSX;
})();

/**
 * 加载编码词典的事件处理函数
 */
function loadDictionaryHandler() {
    const dictionary_path = './xlsx/dictionary.csv';
    listen('loadXLSX_finish', mkTable, ['dictionary']);
    loadXLSX(dictionary_path, 'dictionary');
    return false;
}

/**
 * 编码的事件处理函数
 */
const encodeHandler = (function() { 
    /**
     * 对文本进行编码，调整one-hot数组值
     * 
     * @param {String} content 需编码的文本内容 
     * @param {Array<Number>} goals 编码内容的one-hot数组 
     */
    function encodeRow(content, goals) {
        // 理由未知，不显式转为 String 会报错
        content = String(content);
        let len = dict_single.length;

        for (let i = 0; i < len; i++) {
            // Step 1. 根据 dict_single 进行编码
            // flag 为 true 表示当前编码为1，应尽早结束冗余的编码过程
            let flag = false;
            if (dict_single[i].length) {
                for (let j = 0; j < dict_single[i].length && !flag; j++) {
                    if ( ~content.indexOf(dict_single[i][j]) ) {
                        goals[i] = 1; flag = true;
                    }
                }
            }

            // Step 2. 根据 dict_complex 进行编码
            if ( !flag && dict_complex[i].length) {
                for (let j = 0; j < dict_complex[i].length && !flag; j++) {
                    let dict = dict_complex[i][j];
                    let index = content.indexOf(dict[i]);
                    for (let k = 1; k < dict.length; k++) {
                        if ( !~index ) break;
                        index = content.indexOf(dict[k], index);
                    }
                    if ( ~index ) {
                        goals[i] = 1; flag = true;
                    }
                } // end for(let j)
            }
        } // end for(let i)
    }

    /**
     * 组装编码后的数据对象
     * 
     * @param {Object} row 原始的行数据 
     * @param {Array<Number>} goals 编码后的one-hot数组 
     * @returns row
     */
    function initEncodeRow(row, goals) {
        row = JSON.parse(JSON.stringify(row));
        for (let i = 0; i < goals.length; i++) {
            row[encodeConfig.dimensions[i]] = goals[i];
        }
        // 删除编码后不需显式的数据内容
        for (let key of encodeConfig.pass) {
            delete row[key];
        }
        return row;
    }

    /**
     * 点击编码后进行自动编码的事件处理
     */
    function autoEncode() {
        if (DATA.length == 0 || DICT.length == 0) return;
        ENCODE = []; // 清空ENCODE，避免二次编码时候累加

        let goals; // 存储 one-hot 数组
        let dictLen = DICT.length; // 编码维度数量
        let len = (DATA.length <= LIMIT) ? DATA.length : LIMIT; // 待编码的数据量
        for (let i = 0; i < len; i++) {
            goals = Array.from(Array(dictLen), (_) => 0);
            let row = DATA[i];
            encodeRow(row['Content'], goals); // 编码，调整goals
            ENCODE.push(initEncodeRow(row, goals));
            // console.log('Encoded! index:' , i+1);
            // console.log(goals);
        }

        TARGET = ENCODE;
        mkTable('encode'); // 绘制编码结果
        return false;
    }

    return autoEncode;
})();

/**
 * 导出xlsx的事件处理函数
 */
const exportHandler = (function() {
    /**
     * 将sheet对象再转为二进制的Blob对象
     * 
     * @param {Object} sheet table_to_sheet生成的sheet对象 
     * @param {String} sheetName = 'sheet1' sheet的名字
     * @returns blob
     */
    function sheet2blob(sheet, sheetName = 'sheet1') {
        const workbook = {
            SheetNames: [sheetName],
            Sheets: {}
        };
        // 生成excel的配置项
        workbook.Sheets[sheetName] = sheet;

        const wopts = {
            bookType: 'csv', // 生成的文件类型
            bookSST: false, // 是否生成Shared String Table，如果开启生成速度会下降，但有更好的兼容性
            type: 'binary'
        };
        const wbout = XLSX.write(workbook, wopts);
        const blob = new Blob([s2ab(wbout), {
            type: 'application/octet-stream'
        }]); // 字符串转ArrayBuffer

        function s2ab(s) {
            const buf = new ArrayBuffer(s.length);
            const view = new Uint8Array(buf);
            // 此处如果s.length不减一，在导出csv时候有bug
            // 导出xlsx时候，需要把减一去掉!!!
            for (let i = 0; i < s.length - 1; i++) {
                view[i] = s.charCodeAt(i) & 0xFF;
            }
            return buf;
        }

        return blob;
    }

    /**
     * 生成下载对话，下载该xlsx文件
     * 
     * @param {Blob} url xlsx对应的Blob对象 
     * @param {String} saveName = 'export.csv' 保存的文件名 
     */
    function openDownloadDialog(url, saveName = 'export.csv') {
        if (typeof url == 'object' && url instanceof Blob) {
            url = URL.createObjectURL(url); // 创建blob的地址
        }
        const aLink = document.createElement('a');
        aLink.href = url;
        aLink.download = saveName; // HTML5新增的属性，指定保存文件名，可以不要后缀
        aLink.click(); // 触发下载对话框，样式依浏览器
    }

    /**
     * 暴露出的xlsx的事件处理函数
     */
    function exportHandler() {
        if (isundef(TYPE)) {
            alert('请先选择显示的表格！');
            return;
        }
    
        // 将一个table对象转换成一个sheet对象
        const sheet = XLSX.utils.table_to_sheet( $('#table')[0] );
        openDownloadDialog(sheet2blob(sheet), `${TYPE}.csv`);
        return false;
    }

    return exportHandler;
})();

/**
 * 导出xlsx的事件处理函数的工厂函数
 * 
 * @param {String} type data/dictionary/encode 
 */
function uploadHandlerFactory(type) {
    return function() {
        const $file = $(`#upload${type}-file`);
        const $form = $('#buttonZone form');

        $file.off('change').change( () => {
            // 组装用于post的表单数据对象
            const formData = new FormData( $form[0] );
            formData.append('type', type);

            // 上传的ajax操作
            $.ajax({
                type: 'POST', 
                url:'./php/upload.php',
                data: formData, 
                cache: false, 
                dataType: 'json', 
                contentType: false, 
                processData: false,
                success: function(res) {
                    if (res) {
                        alert('上传成功!');
                        // 即上传的为数据时，需要重置筛选选项
                        $(`#load${type}`).click();
                    }
                    else alert('发生问题，请重新尝试!');
                }
            }); // end ajax
        });
        $file.click(); // 触发上传文件的文件系统文件选择界面
        return false;
    }
}
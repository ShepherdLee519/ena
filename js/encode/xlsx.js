/*
 * @Author: Shepherd.Lee 
 * @Date: 2020-08-07 22:21:59 
 * @Last Modified by: Shepherd.Lee
 * @Last Modified time: 2020-08-19 18:03:28
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
            event: 'click', handler: loadDBDataHandler
        },
        {
            target: '#loaddata',    
            event: 'click', handler: loadDataHandler
        },
        {
            target: '#loaddictionary',  
            event: 'click', handler: loadDictionaryHandler
        },
        {
            target: '#encode',  
            event: 'click', handler: encodeHandler
        },
        {
            target: '#export',  
            event: 'click', handler: exportHandler
        },
        {
            target: '#uploaddata',  
            event: 'click', handler: uploadHandlerFactory('data')
        },
        {
            target: '#uploaddictionary',    
            event: 'click', handler: uploadHandlerFactory('dictionary')
        },
        {
            target: '#uploadencode',    
            event: 'click', handler: uploadHandlerFactory('encode')
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

    $.get('./php/savefilter.php', 
        filteredDBData,
        res => {
        if (res) {
            console.log(res);
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
    listen('loadCSV_finish', mkTable, ['data']);
    loadCSV('data', filteredData);
    return false;
}

/**
 * ajax 加载xlsx文件
 */
const [loadCSV, pureLoadCSV] = (function() {
    /**
     * 将 Array<String> => Array<Object>
     * 
     * @param {Array<Array<String>>} json 
     */
    function dealWithJSON(json) {
        const colNames = json[0];
        const colLen = colNames.length;
        const arr = [];
        for (let i = 1; i < json.length; i++) {
            arr.push(dealWithJSONRow(json[i]));
        }

        function dealWithJSONRow(data) {
            const obj = {};
            for (let i = 0; i < colLen; i++) {
                obj[colNames[i]] = data[i];
            }
            return obj;
        }

        return arr;
    }

    /**
     * 筛选数据并返回筛选结果
     * 
     * @param {Array<Object>} json 
     * @param {Object} filter 
     */
    function filterJSON(json, filter) {
        if (filter['classid'][0] === 'all' &&
            filter['groupid'][0] === 'all') return json;

        const arr = [];
        for (let i = 0; i < json.length; i++) {
            if (fitClassid(json[i]) && fitGroupid(json[i])) {
                arr.push(json[i]);
            }
        }

        function fitClassid(data) {
            if (filter['classid'][0] === 'all') return true;
            for (let i = 0; i < filter['classid'].length; i++) {
                if (+data['classID'] == +filter['classid'][i]) return true;
            }
            return false;
        }

        function fitGroupid(data) {
            if (filter['groupid'][0] === 'all') return true;
            for (let i = 0; i < filter['groupid'].length; i++) {
                if (+data['gpID'] == +filter['groupid'][i]) return true;
            }
            return false;
        }

        return arr;
    }

    /**
     * ajax 加载csv文件
     * 
     * @param {String} type = 'data' 读入的是数据还是编码词典
     * @param {Object} filter = null 
     */
    function loadCSV(type = 'data', filter = null) {
        $.get('./php/loadcsv.php', {type: type}, res => {
            if (res) {
                let json = JSON.parse(res);
                console.log('Data Length: ', json.length);
                json = dealWithJSON(json);
                
                if (type == 'data') {
                    allowTreeView = true;
                    DATA = (filter) ? filterJSON(json, filter) : json;
                    TARGET = DATA; // 按筛选条件过滤后的数据 见filter.js
                    initSelect(); // 初始化参数设置中的分析单元与分析话语
                } else if (type == 'dictionary') {
                    DICT = json;
                    initDictionary(); // 初始化编码词典对象 见dictionary.js
                    TARGET = DICT;
                }

                trigger('loadCSV_finish');
            } else {
                alert('所需文件尚未上传！');
            }
        }); // end ajax-get
    }

    /**
     * 纯粹的读入csv文件, 无多余的处理
     * @param {String} type 
     */
    function pureLoadCSV(type = 'data') {
        $.get('./php/loadcsv.php', {type: type}, res => {
            if (res) {
                let json = JSON.parse(res);
                console.log('Data Length: ', json.length);
                json = dealWithJSON(json);
                
                if (type == 'data') {
                    DATA = json;
                } else if (type == 'dictionary') {
                    DICT = json;
                } else if (type == 'encode') {
                    ENCODE = json;
                }
                TARGET = json;
                trigger(`pureLoad${type}_finish`);
            } else {
                alert('所需文件尚未上传！');
            }
        }); // end ajax-get
    }

    return [loadCSV, pureLoadCSV];
})();

/**
 * 加载编码词典的事件处理函数
 */
function loadDictionaryHandler() {
    listen('loadCSV_finish', mkTable, ['dictionary']);
    loadCSV('dictionary');
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
     * 保存编码结果
     */
    function saveEncode() {
        const per_round = 60;
        let len = ENCODE.length;
        let round = 0;
        const target = (len < per_round) ? 
            ENCODE : ENCODE.slice(0, per_round);

        function saveEncodeRelay() {
            $.post('./php/savecsv_append.php',
                {data: ENCODE.slice(per_round*round, per_round*(round+1))},
                res => {
                if (res) {
                    console.log(`Save encode.csv! - relay-round:${round}`);
                    len -= per_round;
                    round++;
                    if (len > 0) {
                        saveEncodeRelay();
                    }   
                }
            }); // end post
        }
        
        // 保存至encode.csv
        $.post('./php/savecsv.php', 
            {data: target}, res => {
            if (res) {
                console.log('Save encode.csv!');
                len -= per_round;
                round++;
                if (len > 0) {
                    saveEncodeRelay();
                }   
            }     
        });
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
        saveEncode(); // 保存编码结果
        return false;
    }

    return autoEncode;
})();

/**
 * 暴露出的xlsx的事件处理函数
 */
function exportHandler() {
    if (isundef(TYPE)) {
        alert('请先选择显示的表格！');
        return;
    }

    const aLink = document.createElement('a');
    const saveName = TYPE + '.csv';
    const url = './xlsx/' + saveName;
    aLink.href = url;
    aLink.download = saveName; // HTML5新增的属性，指定保存文件名，可以不要后缀
    aLink.click(); // 触发下载对话框，样式依浏览器
    return false;
}

/**
 * 导出xlsx的事件处理函数的工厂函数
 * 
 * @param {String} type data/dictionary/encode 
 */
function uploadHandlerFactory(type) {
    function uploadSuccess(type) {
        if (type === 'data' || type === 'dictionary') {
            return function() {
                $(`#load${type}`).click();
                return false;
            }
        } else if (type === 'encode') {
            return function() {
                let mutex = 0;
                // 绘制 ENCODE 结果table
                listen('pureLoadencode_finish', mkTable, ['encode']);
                pureLoadCSV('encode');
                // 加载编码词典，初始化参设设置中的编码
                if (isundef(DICT) || DICT.length == 0) {
                    listen('pureLoaddictionary_finish', initDimension);
                    pureLoadCSV('dictionary');
                }

                const callInitSelect = () => {
                    mutex++;
                    if (mutex == 2) {
                        initSelect();
                        mutex = 0;
                    }
                }

                listen('pureLoadencode_finish', callInitSelect);
                listen('pureLoaddictionary_finish', callInitSelect);
            }
        } // end else if
    }

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
                        uploadSuccess(type)();
                    }
                    else alert('发生问题，请重新尝试!');
                }
            }); // end ajax
        });
        $file.click(); // 触发上传文件的文件系统文件选择界面
        return false;
    }
}
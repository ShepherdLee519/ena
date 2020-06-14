/*
 * @Author: Shepherd.Lee 
 * @Date: 2020-06-14 17:19:51 
 * @Last Modified by: Shepherd.Lee
 * @Last Modified time: 2020-06-14 17:28:20
 */

/*
 * 读入xlsx文件的逻辑实现，具体调用见handlers.js中的事件绑定
 */


var DATA = []; // 全局的读入的 xlsx 的数据
var DICT = []; // 全局的读入的编码规则数据
var ENCODE = []; // 全局的编码后的数据
var TARGET; // 当前需显示的数据对象
var TYPE; // 当前显示的数据类型

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
        url: xlsx_path,
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
            DATA = rows;
            TARGET = filterData(DATA); // 按筛选条件过滤后的数据 见filter.js
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
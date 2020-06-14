/*
 * @Author: Shepherd.Lee 
 * @Date: 2020-06-14 18:17:07 
 * @Last Modified by: Shepherd.Lee
 * @Last Modified time: 2020-06-14 18:18:48
 */

/*
 * 自动编码部分的按钮的事件绑定 
 */


$(function() {
    const data_path = './xlsx/data.xlsx';
    const dictionary_path = './xlsx/dictionary.xlsx';

    // 加载数据
    $('#loaddata').click( () => {
        listen('loadXLSX_finish', mkTable, ['data']);
        loadXLSX(data_path, 'data');
        return false;
    });
    
    // 加载编码词典
    $('#loaddictionary').click( () => {
        listen('loadXLSX_finish', mkTable, ['dictionary']);
        loadXLSX(dictionary_path, 'dictionary');
        return false;
    });

    // 自动编码
    $('#encode').click( () => {
        autoEncode();
        return false;
    });

    // 下载XLSX
    $('#export').click( () => {
        exportXLSX();
        return false;
    });

    // 上传数据
    $('#uploaddata').click( () => {
        upload('data');
        return false;
    });

    // 上传编码词典
    $('#uploaddictionary').click( () => {
        upload('dictionary');
        return false;
    });

    // 上传编码结果
    $('#uploadencode').click( () => {
        upload('encode');
        return false;
    });
});
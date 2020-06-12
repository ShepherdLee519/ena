var DATA = []; // 全局的读入的 xlsx 的数据
var DICT = []; // 全局的读入的编码规则数据
var ENCODE = []; // 全局的编码后的数据
var TARGET; // 当前需显示的数据对象
var TYPE; // 当前显示的数据类型

const $table = $('#table');
const $thead = $('#thead');
const $tbody = $('#tbody');
const $tableFixed = $('#table-fixed');
const $theadFixed = $('#thead-fixed');
const LIMIT = 100; // 显示的数据范围


$(function() {
    const xlsx_path = './xlsx/data.xlsx';
    const dictionary_path = './xlsx/dictionary.xlsx';

    $('#loaddata').click( () => {
        listen('loadXLSX_finish', mkTable, ['data']);
        loadXLSX(xlsx_path, 'data');
        return false;
    });
    
    $('#loaddict').click( () => {
        listen('loadXLSX_finish', mkTable, ['dictionary']);
        loadXLSX(dictionary_path, 'dictionary');
        return false;
    });

    $('#encode').click( () => {
        autoEncode();
        return false;
    });

    $('#export').click( () => {
        exportXLSX();
        return false;
    });

    $('#uploadencode').click( () => {
        upload('encode');
        return false;
    });
});
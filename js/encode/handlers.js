$(function() {
    const xlsx_path = './xlsx/data.xlsx';
    const dictionary_path = './xlsx/dictionary.xlsx';

    $('#loaddata').click( () => {
        listen('loadXLSX_finish', mkTable, ['data']);
        loadXLSX(xlsx_path, 'data');
        return false;
    });
    
    $('#loaddictionary').click( () => {
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

    $('#uploaddata').click( () => {
        upload('data');
        return false;
    });

    $('#uploaddictionary').click( () => {
        upload('dictionary');
        return false;
    });

    $('#uploadencode').click( () => {
        upload('encode');
        return false;
    });
});
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
    if (type == 'data' && DATA.length) {
        // TARGET = DATA;
        // trigger('loadXLSX_finish');
        // return;
    } else if (type == 'dictionary' && DICT.length) {
        TARGET = DICT;
        trigger('loadXLSX_finish');
        return;
    }

    $.ajax({
        url: xlsx_path,
        type: 'GET',
        dataType: 'blob',
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
                console.log(fromTo);
                rows = rows.concat(XLSX.utils.sheet_to_json(workbook.Sheets[sheet]));
                break; // 默认只读取第一张表
            }
        }

        // 在控制台打印出来表格中的数据
        console.log(rows);
        console.log(rows.length);
        if (type == 'data') {
            DATA = rows;
            // TARGET = DATA;
            TARGET = filterData(DATA);
        } else if (type == 'dictionary') {
            DICT = rows;
            initDictionary();
            TARGET = DICT;
        }
        trigger('loadXLSX_finish');
    }

    // 以二进制方式打开文件
    fileReader.readAsBinaryString(file);
}
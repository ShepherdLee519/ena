/**
 * 导出 xlsx 的事件处理
 */
function exportXLSX() {
    if (TYPE === void 0) {
        alert('请先选择显示的表格！');
        return;
    }

    // 将一个table对象转换成一个sheet对象
    const sheet = XLSX.utils.table_to_sheet( $table[0] );
    openDownloadDialog(sheet2blob(sheet), `${TYPE}.xlsx`);
}

/**
 * 将sheet对象再转为二进制的Blob对象
 * 
 * @param {Object} sheet table_to_sheet生成的sheet对象 
 * @param {*} sheetName = 'sheet1' sheet的名字
 */
function sheet2blob(sheet, sheetName = 'sheet1') {
    const workbook = {
        SheetNames: [sheetName],
        Sheets: {}
    };
    // 生成excel的配置项
    workbook.Sheets[sheetName] = sheet;

    const wopts = {
        bookType: 'xlsx', // 生成的文件类型
        bookSST: false, // 是否生成Shared String Table，如果开启生成速度会下降，但在低版本IOS设备上有更好的兼容性
        type: 'binary'
    };
    const wbout = XLSX.write(workbook, wopts);
    const blob = new Blob([s2ab(wbout), {
        type: 'application/octet-stream'
    }]); // 字符串转ArrayBuffer

    function s2ab(s) {
        const buf = new ArrayBuffer(s.length);
        const view = new Uint8Array(buf);
        for (let i = 0; i != s.length; i++) {
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
 * @param {String} saveName 保存的文件名 
 */
function openDownloadDialog(url, saveName = 'export.xlsx') {
    if (typeof url == 'object' && url instanceof Blob) {
        url = URL.createObjectURL(url); // 创建blob的地址
    }
    const aLink = document.createElement('a');
    aLink.href = url;
    aLink.download = saveName; // HTML5新增的属性，指定保存文件名，可以不要后缀
    aLink.click();
}
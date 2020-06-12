const $table = $('#table');
const $thead = $('#thead');
const $tbody = $('#tbody');
const $tableFixed = $('#table-fixed');
const $theadFixed = $('#thead-fixed');
const LIMIT = 100; // 显示的数据范围


// 关于表格显示的一些设置
var tableConfig = {
    showIndex: false, // 是否显示Index
    pass: [] // 无视这些属性
};

/**
 * 清空 table 中的内容
 */
function clsTable() {
    $thead.html('');
    $theadFixed.html('');
    $tbody.html('');
}

/**
 * 根据 DATA 中的全局xlsx数据，初始化table
 * 
 * @param {String} type 当期显示的数据类型 data/dictionary/encode 
 */
function mkTable(type) {
    clsTable(); // 清空表格内容
    $table.removeClass('hidden');
    $tableFixed.removeClass('hidden');
    TYPE = type; // 保存当前所显示的数据对象类型
    console.log('mktable: ', TARGET.length); 
    let keys = mkThead();
    mkTbody(keys);

    // 对编码显示的额外处理
    if (type == 'data') initFilterOptions();
    if (type == 'encode') highlightOneHot();
}

/**
 * 组装table中的thead
 */
function mkThead() {
    let str = '<tr>',
        keys = [];
    
    if (tableConfig.showIndex) {
        str += '<th>Index</th>';
    }
    for (let key of Object.keys(TARGET[0])) {
        if ( ~tableConfig.pass.indexOf(key) ) continue;
        str += `<th>${key}</th>`;
        keys.push(key);
    }

    str += '</tr>';
    $thead.append(str);
    $theadFixed.append(str);
    return keys;
}

/**
 * 按keys中的顺序组装tr完善tbody部分
 *  
 * @param {Array<String>} keys 键名数组
 */
function mkTbody(keys) {
    let str = '';

    for (let i = 0; i < TARGET.length && i < LIMIT; i++) {
        str += '<tr>';
        if (tableConfig.showIndex) {
            str += `<td>${i + 1}</td>`;
        }
        for (let key of keys) {
            if (key == 'timeStamp') {
                str += `<td>${formatDate(TARGET[i][key])}</td>`;
            } else {
                str += `<td>${TARGET[i][key]}</td>`;
            }
        }
        str += '</tr>';
    }

    $tbody.append(str);
    adjustThead();
}

/**
 * 组装完成table后调整thead-fixed中的th的宽度
 */
function adjustThead() {
    $tableFixed.css('width', $table.css('width'));
    $thead.find('th').each( (index, th) => {
        $theadFixed.find('th').eq(index).css('width', $(th).css('width'));
    });
}

/**
 * 转换时间戳的显示
 * 
 * @param {String} timeStamp 时间戳 
 */
function formatDate(timeStamp) {
    let time = new Date(timeStamp);
    
    let year = time.getFullYear(),
    	month = time.getMonth() + 1,
    	date = time.getDate(),
    	hour = time.getHours(),
    	minute = time.getMinutes(),
    	second = time.getSeconds();

    return `${year}/${month}/${date} ${hour}:${minute}:${second}`;
}

/**
 * 高亮显示one-hot编码中的1值
 */
function highlightOneHot() {
    let len = $tbody.find('tr').eq(0).children().length;
    for (let i = len - 6; i <= len; i++) {
        $tbody.find(`td:nth-child(${i}):contains('1')`).addClass('highlightonehot');
    }
}
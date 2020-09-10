/*
 * @Author: Shepherd.Lee 
 * @Date: 2020-06-14 18:07:44 
 * @Last Modified by: Shepherd.Lee
 * @Last Modified time: 2020-08-07 23:28:14
 */

/*
 * 绘制xlsx数据对应的html表格的逻辑实现
 */


const $table = $('#table');
const $thead = $('#thead');
const $tbody = $('#tbody');


// 关于表格显示的一些设置
var tableConfig = {
    showIndex: false, // 是否显示Index
    pass: [] // 无视这些属性
};

$(function() {
    showTheadHandler();
});


/**
 * 清空 table 中的内容
 */
function clsTable() {
    $thead.html('');
    $tbody.html('');
}

/**
 * 根据 DATA 中的全局xlsx数据，初始化table\
 * 在loadXLSX_finish事件触发后调用(即xlsx成功读入后)
 * 
 * @param {String} type 当期显示的数据类型 data/dictionary/encode 
 */
function mkTable(type) {
    clsTable(); // 清空表格内容
    show( $table );
    TYPE = type; // 保存当前所显示的数据对象类型
    console.log('mktable: ', TARGET.length); 
    const keys = mkThead(); // 表头数组
    mkTbody(keys);

    // 表格绘制成功后的额外处理
    if (type == 'encode') highlightOneHot(); // 高亮one-hot中的1
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
}

/**
 * 转换时间戳的显示
 * 
 * @param {String} timeStamp 时间戳 
 */
function formatDate(timeStamp) {
    const time = new Date(timeStamp);
    
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
    let dictLen = DICT.length; // 编码维度数
    for (let i = len - dictLen + 1; i <= len; i++) {
        $tbody.find(`td:nth-child(${i}):contains('1')`).addClass('highlightonehot');
    }
}

/**
 * 悬浮的显示表头的事件处理函数
 */
function showTheadHandler() {
    let $target, content;
    
    delegate( $tbody, [
        {
            target: 'tr',
            event: 'mouseover',
            handler: function() {
                if ( $(this).closest('tbody').children().length < 10 ) return;
                if ( !$(this).prev().length ) return false;
                $target = $(this).prev();
                $target.addClass('hover-thead');
                content = $target.html();
                $target.html( $thead.find('tr').html() );
                return false;
            }
        },
        {
            target: 'tr',
            event: 'mouseout',
            handler: function() {
                if ( $(this).closest('tbody').children().length < 10 ) return;
                if ( !$(this).prev().length ) return false;
                $target.removeClass('hover-thead');
                $target.html(content);
                return false;
            }
        }
    ]);
}
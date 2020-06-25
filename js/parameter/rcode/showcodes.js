/*
 * @Author: Shepherd.Lee 
 * @Date: 2020-06-14 20:14:41 
 * @Last Modified by: Shepherd.Lee
 * @Last Modified time: 2020-06-25 01:19:55
 */

/*
 * 显示对应R代码的实现 
 */


$(function() {
    initShowCodes(); // 初始化代码区域的显示
});


/**
 * 在右侧rcodeZone区域显示R代码的函数
 * 
 * @param {String} type eg.analysisUnit/analysisWords... 
 */
function showCodes(type) {
    const $target = $(`#rcode-${type}`);
    let str = '', values = getParameter(type);

    switch(type) {
        // 分析单元
        case 'analysisUnit': 
            // 跳过"请选择"的情况
            if ( !values.length ) {
                hide( $target );
                return;
            } 
            str +=
            '#确定分析单位是每个班级每个小组的每个学生\n' +
            `units = <b>STEM.data[,c(${decorateValues(values).join(',')})]</b>\n` +
            'head(units)';
            break;
        // 分析话语
        case 'analysisWords':
            // 跳过"请选择"的情况
            if ( !values.length ) {
                hide( $target );
                return;
            } 
            str += 
            '#确定会话是每个班每个小组的每次讨论活动\n' +
            `conversation = <b>STEM.data[,c(${decorateValues(values).join(',')})]</b>\n` +
            'head(conversation)';
            break;
        // 窗口大小
        case 'windowSize':
            str += 
            `#计算累计邻接向量，定义节的大小是<b>${values}</b>行\n` +
            'accum = ena.accumulate.data(\n' +
            '   units = units,\n' +
            '   conversation = conversation,\n' +
            '   codes = codes,\n' +
            `   <b>window.size.back = ${values}</b>\n` +
            ')';
            break;
        // 编码维度
        case 'encodeDimensions':
            str += 
            '#确定讨论内容的编码方案，包括的编码有：' +
            '学情分析能力、学习目标设计能力、学习情境设计能力、知识内容设计能力、\n' +
            '学习活动设计能力、技术整合能力、学习评价设计能力\n' +
            '<b>codeCols = c(\n' +
            `   ${decorateValues(values).join(',')}\n` +
            ')</b>\n' +
            'codes = STEM.data[,codeCols]\n' +
            'head(codes)';
            break;
        default:
            console.error(`WRONG type:<${type}>!`);
    }

    $target.html(str);
    show( $target );
}

/**
 * 显示R代码时候需要在字符串外包装引号:""
 * 
 * @param {Array<String>} values 
 */
function decorateValues(values) {
    if ( !Array.isArray(values) ) return `"${values}"`;
    else return values.map(v => `"${v}"`);
}

/**
 * 根据已选择的默认值，初始化代码显示区域
 */
function initShowCodes() {
    // 1. analysisUnit
    if( $('#parameter-analysisUnit').find('option:selected').length ) {
        showCodes('analysisUnit');
    }

    // 2. analysisWords
    if( $('#parameter-analysisWords').find('option:selected').length ) {
        showCodes('analysisWords');
    }

    // 3. windowSize
    let value = $('#parameter-windowSize input').val();
    if (value) showCodes('windowSize', value);

    // 4. encodeDimensions
    if ( $('#parameter-encodeDimensions').find('input:checked').length ) {
        showCodes('encodeDimensions');
    }
}
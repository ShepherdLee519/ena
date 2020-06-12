$(function() {
    initShowCodes();
});

/**
 * 在右侧rcodeZone区域显示R代码的函数
 * 
 * @param {String} type eg.analysisUnit/analysisWords... 
 * @param  {...any} paras 可能的参数内容
 */
function showCodes(type, ...paras) {
    const $target = $(`#rcode-${type}`);
    let str = '', values = [];

    switch(type) {
        case 'analysisUnit': 
            [...$('#parameter-analysisUnit').find('select')].forEach(select => {
                values.push(`"${$(select).find('option:selected').html()}"`);
            });
            if (values.length == 1 && values[0] === '"请选择"') {
                $target.addClass('hidden');
                return;
            } 
            str +=
            '#确定分析单位是每个班级每个小组的每个学生\n' +
            `units = <b>STEM.data[,c(${values.join(',')})]</b>\n` +
            'head(units)';
            break;
        case 'analysisWords':
            [...$('#parameter-analysisWords').find('select')].forEach(select => {
                values.push(`"${$(select).find('option:selected').html()}"`);
            });
            if (values.length == 1 && values[0] === '"请选择"') {
                $target.addClass('hidden');
                return;
            } 
            str += 
            '#确定会话是每个班每个小组的每次讨论活动\n' +
            `conversation = <b>STEM.data[,c(${values.join(',')})]</b>\n` +
            'head(conversation)';
            break;
        case 'windowSize':
            str += 
            `#计算累计邻接向量，定义节的大小是<b>${paras[0]}</b>行\n` +
            'accum = ena.accumulate.data(\n' +
            '   units = units,\n' +
            '   conversation = conversation,\n' +
            '   codes = codes,\n' +
            `   <b>window.size.back = ${paras[0]}</b>\n` +
            ')';
            break;
        case 'encodeDimensions':
            [...$('#parameter-encodeDimensions').find('input')].forEach(checkbox => {
                if (  $(checkbox).prop('checked') ) {
                    values.push(`"${$(checkbox).next().html()}"`);
                }
            });
            str += 
            '#确定讨论内容的编码方案，包括的编码有：' +
            '学情分析能力、学习目标设计能力、学习情境设计能力、知识内容设计能力、\n' +
            '学习活动设计能力、技术整合能力、学习评价设计能力\n' +
            '<b>codeCols = c(\n' +
            `   ${values.join(',')}\n` +
            ')</b>\n' +
            'codes = STEM.data[,codeCols]\n' +
            'head(codes)';
            break;
        default:
            console.error(`WRONG type:<${type}>!`);
    }

    $target.html(str);
    $target.removeClass('hidden');
}

function initShowCodes() {
    let value;
    // 1. analysisUnit
    if( $('#parameter-analysisUnit').find('option:selected').length ) {
        showCodes('analysisUnit');
    }

    // 2. analysisWords
    if( $('#parameter-analysisWords').find('option:selected').length ) {
        showCodes('analysisWords');
    }

    // 3. windowSize
    value = $('#parameter-windowSize input').val();
    if (value) showCodes('windowSize', value);

    // 4. encodeDimensions
    if ( $('#parameter-encodeDimensions').find('input:checked').length ) {
        showCodes('encodeDimensions');
    }
}
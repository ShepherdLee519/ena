/*
 * @Author: Shepherd.Lee 
 * @Date: 2020-06-24 23:15:17 
 * @Last Modified by: Shepherd.Lee
 * @Last Modified time: 2020-07-24 21:44:14
 */

/*
 * 获取参数部分的值的函数 
 */


/**
 * 获取参数设置部分的参数值并返回
 * 
 * @param {String} type eg.analysisUnit/analysisWords... 
 */
function getParameter(type) {
    let values = [];
    switch(type) {
        // 分析单元
        case 'analysisUnit': 
            [...$('#parameter-analysisUnit').find('select')].forEach(select => {
                values.push(`${$(select).find('option:selected').html()}`);
            });
            return values.filter(v => v !== '请选择');

        // 分析话语
        case 'analysisWords':
            [...$('#parameter-analysisWords').find('select')].forEach(select => {
                values.push(`${$(select).find('option:selected').html()}`);
            });
            return values.filter(v => v !== '请选择');

        // 窗口大小
        case 'windowSize':
            return $('#parameter-windowSize input').val();

        // 编码维度
        case 'encodeDimensions':
            [...$('#parameter-encodeDimensions').find('input')].forEach(checkbox => {
                if (  $(checkbox).prop('checked') ) {
                    values.push(`${$(checkbox).next().html()}`);
                }
            });
            return values;
            
        default:
            console.error(`WRONG type:<${type}>!`);
    }
}

/**
 * 收集参数设置部分的所有参数设置并以对象形式返回
 * 
 * @example
 * {
 *      units: ['classID', 'gpNO'], // 对应 analysisUnit
 *      conversation: ['classID', 'gpNO'], // 对应 analysisWords
 *      codecols: [''], // 对应 encodeDimensions
 *      windowsize: 5 // 对应 windowSize
 * }
 */
function gatherParameter() {
    return {
        units: getParameter('analysisUnit'),
        conversation: getParameter('analysisWords'),
        codecols: getParameter('encodeDimensions'),
        windowsize: getParameter('windowSize')
    };
}
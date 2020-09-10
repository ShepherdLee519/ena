/*
 * @Author: Shepherd.Lee 
 * @Date: 2020-07-24 21:30:22 
 * @Last Modified by: Shepherd.Lee
 * @Last Modified time: 2020-08-17 14:41:57
 */

/*
 * 初始化参数设置的分析单元与分析话语的选项
 */
const initSelect = once(function() {
    const $units = $('#analysisUnit-select');
    const $words = $('#analysisWords-select');
    const isEmpty = (target) => {
        return isundef(target) || target.length == 0;
    }
    let target = [];

    if (isEmpty(DATA)) {
        target = ENCODE[0];
        let obj = JSON.parse(JSON.stringify(target));
        encodeConfig.dimensions.forEach(d => {
            delete obj[d];
        });
        target = obj;
    } else {
        target = TARGET[0];
    }

    let str = '<option value="0">请选择</option>';
    Object.keys(target).forEach( (key, index) => {
        if (key.toLowerCase() == 'content') return;
        str += `<option value="${index + 1}">${key}</option>`;
    });
    $units.html(str);
    $words.html(str);
});
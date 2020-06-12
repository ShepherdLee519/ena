const $filterClass = $('#filterClass');
const $filterGroup = $('#filterGroup');
const classIDSet = new Set();
const gpIDSet = new Set();


/**
 * 第一次加载过数据后初始化筛选的option
 */
function initFilterOptions() {
    if (classIDSet.size && gpIDSet.size) return;

    for (let i = 0; i < DATA.length; i++) {
        classIDSet.add(DATA[i].classID);
        gpIDSet.add(DATA[i].gpID);
    }

    let str = '';
    [...classIDSet].sort().forEach( (classID, index) => {
        str += `<option value=${index+1}>${classID}</option>`;
    });
    $filterClass.append(str);
    str = '';
    [...gpIDSet].sort().forEach( (gpID, index) => {
        str += `<option value=${index+1}>${gpID}</option>`;
    });
    $filterGroup.append(str);
}

/**
 * 重置过滤条件中的Option
 */
function resetFilterOptions() {
    classIDSet.clear();
    gpIDSet.clear();
    $filterClass.find('option:not(:first)').remove();
    $filterGroup.find('option:not(:first)').remove();
}

/**
 *  按照选择的规则筛选数据并返回筛选后的数据
 *  
 * @param {Object} data 
 */
function filterData(data) {
    let classRule = $filterClass.find('option:selected').html();
    let groupRule = $filterGroup.find('option:selected').html();
    let data_filtered = [];
    for (let row of data) {
        let flag = true;
        if ( !(classRule === 'All' || row.classID == +classRule) ) flag = false; 
        if ( !(groupRule === 'All' || row.gpID == +groupRule) ) flag = false;
        if (flag) data_filtered.push(row);
    }
    return data_filtered;
}
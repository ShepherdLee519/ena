/*
 * @Author: Shepherd.Lee 
 * @Date: 2020-06-14 18:03:12 
 * @Last Modified by: Shepherd.Lee
 * @Last Modified time: 2020-06-14 18:07:19
 */

/*
 * 根据选择的选项条件筛选数据
 */


const $filterClass = $('#filterClass');
const $filterGroup = $('#filterGroup');
const classIDSet = new Set();
const gpIDSet = new Set();
const gpNOMap = new Map();


/**
 * 第一次加载过数据后初始化筛选的option
 */
function initFilterOptions() {
    if (classIDSet.size && gpIDSet.size) {
        // 避免重新初始化Set，直接进行树形控件的绘制
        trigger('treeview', true);
        return;
    }

    let classID, gpID, gpNO;
    let key = '';
    for (let i = 0; i < DATA.length; i++) {
        classID = DATA[i].classID
        gpID = DATA[i].gpID;
        gpNO = DATA[i].gpNO;
        key = `${classID}-${gpID}`;

        classIDSet.add(classID);
        gpIDSet.add(gpID);
        if ( !gpNOMap.has(key) ) gpNOMap.set(key, new Set());
        gpNOMap.get(key).add(gpNO);
    }
    trigger('treeview', true); // 绘制palette中的树形控件

    let str = '';
    // 集合内容均需排序
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
 * 重置过滤条件中的Option\
 * 调用于上传数据后
 */
function resetFilterOptions() {
    classIDSet.clear();
    gpIDSet.clear();
    gpNOMap.clear();
    // 删去除了 All 以外的选项
    $filterClass.find('option:not(:first)').remove();
    $filterGroup.find('option:not(:first)').remove();
}

/**
 * 按照选择的规则筛选数据并返回筛选后的数据\
 * 调用于loadxlsx.js -> readXLSX
 *  
 * @param {Object} data 
 * @returns data_filtered
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
    DATA = data_filtered; // 将DATA更新为筛选后的数据集
    return data_filtered;
}
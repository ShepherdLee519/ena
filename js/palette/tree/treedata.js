/*
 * @Author: Shepherd.Lee 
 * @Date: 2020-06-14 20:26:41 
 * @Last Modified by: Shepherd.Lee
 * @Last Modified time: 2020-06-14 20:28:10
 */

/*
 * treeview初始化所需的数据对象的组装等
 */


/**
 * 组装并返回treeview初始化所需的数据对象
 * 
 * @example
 * [{
 *      classID: 1,
 *      groups: [{
 *          gpID: 1,
 *          members: [1, 2, 3, 4]
 *      }]
 * }]
 * @returns treeData
 */
function getTreeData() {
    if ( !classIDSet.size || !gpIDSet.size) return;

    // $filterClass/$filterGroup见filter.js
    let classRule = $filterClass.find('option:selected').html();
    let groupRule = $filterGroup.find('option:selected').html();
    
    let treeData = [];
    [...classIDSet].sort().forEach(classID => {
        if ( !(classRule === 'All' || classID == +classRule) ) return;
        treeData.push({
            classID: classID,
            groups: []
        });
    });
    
    treeData.forEach(cls => {
        [...gpIDSet].sort().forEach(gpID => {
            if ( !(groupRule === 'All' || gpID == +groupRule) ) return;
            let key = `${cls.classID}-${gpID}`;
            if (gpNOMap.has(key)) {
                let gpNOSet = gpNOMap.get(key);
                let gpObj = {
                    gpID: gpID,
                    members: []
                };
                [...gpNOSet].sort().forEach(gpNO => {
                    if (gpNO == 0) return;
                    gpObj.members.push(gpNO);
                });
                cls.groups.push(gpObj);
            }
        });
    });
    return treeData;
}
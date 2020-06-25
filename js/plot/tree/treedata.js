/*
 * @Author: Shepherd.Lee 
 * @Date: 2020-06-14 20:26:41 
 * @Last Modified by: Shepherd.Lee
 * @Last Modified time: 2020-06-25 21:02:12
 */

/*
 * treeview初始化所需的数据对象的组装/以及获取单个节点数据等
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

/**
 * 获取单个节点的数据封装对象后返回
 * 
 * @example
 * {
 *      level: 3,
 *      classID: 1,
 *      gpID: 2,
 *      gpNO: 3,
 *      check: {
 *          net: true,
 *          mean: false,
 *          center: true
 *      },
 *      color: "#CCCCCC"
 * }
 * @param {Object} $tree 目标树对象
 * @param {Number} index 节点序号(from 0)
 */
function getTreeNodeData( $tree, index) {
    const nodeData = {
        level: 0, classID: -1, gpID: -1, gpNO: -1,
        check: { net: false, mean: false, center: false },
        color: ""
    };
    const $li = $tree.find('li').eq(index);

    // Step 1 确定 level(根据indent数量)
    const level = $li.find('.indent').length + 1;
    nodeData.level = level;

    // Step 2 结合 level 获取classID 等信息
    const info = $li.text().split(' ')[1].split('.'); // eg. "1.1.1" => ['1', '1', '1']
    nodeData.classID = info[0].trim();
    if (level >= 2) nodeData.gpID = info[1].trim();
    if (level == 3) nodeData.gpNO = info[2].trim();

    // Step 3 获取选择框确认情况
    ['net', 'mean', 'center'].forEach(key => {
        nodeData['check'][key] = $li.find(`span.${glyDict[key]}`).length > 0; 
    });

    // Step 4 获取颜色选择情况
    const $colorind = $li.find('.evo-colorind');
    nodeData.color = $colorind.data('color');
    
    return nodeData;
}

/**
 * 获取所有的节点数据打包返回
 * 
 * @param {Object} $tree 目标树对象
 */
function getAllTreeNodesData( $tree ) {
    const treeDatas = [];
    const len = $tree.find('li').length;
    for (let i = 0; i < len; i++) {
        treeDatas.push(getTreeNodeData( $tree, i));
    }
    return treeDatas;
}
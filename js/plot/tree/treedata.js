/*
 * @Author: Shepherd.Lee 
 * @Date: 2020-07-24 22:12:48 
 * @Last Modified by: Shepherd.Lee
 * @Last Modified time: 2020-08-17 14:44:28
 */


/**
 * 组装获取用于生成树形控件的数据
 */
const getTreedata = (function() {
    let units; // 分析单元所选项数组
    let treeData; // 树控件数据
    let rows = []; // 处理后的总数据

    /**
     * 处理分析单元中的第一元素
     * 
     * @param {Array<String>} units 
     */
    function dealwithFirstUnit(units) {
        const treeData = [];
        const type = units[0];
        const set = new Set();
        let obj;

        ENCODE.forEach(data => {
            obj = {};
            set.add(data[type]);
            units.forEach(unit => {
                obj[unit] = data[unit];
            });
            rows.push(obj);
        });

        [...set].sort().forEach(elem => {
            treeData.push({
                type: type,
                value: elem,
                next: []
            });
        });
        return treeData;
    }

    /**
     * 判断当前row对象是否满足rules中的条件
     * 
     * @param {Array<Object>} rules 
     * @param {Object} row 
     */
    function matchRow(rules, row) {
        let flag = true;
        for (let i = 0; i < rules.length; i++) {
            if (row[rules[i].type] != rules[i].value) {
                flag = false;
                break;
            }
        }
        return flag;
    }

    /**
     * 处理当前条件筛选的子级的树数据
     * 
     * @param {Array<Object>} rules 
     * @param {String} unit 
     */
    function dealWithUnit(rules, unit) {
        let set = new Set();
        rows.forEach(row => {
            if (matchRow(rules, row)) {
                set.add(row[unit]);
            }
        });
        let subTreeData = [];
        [...set].sort().forEach(elem => {
            if (isundef(elem)) return;
            subTreeData.push({
                type: unit,
                value: elem,
                next: []
            });
        });
        return subTreeData;
    }

    /**
     * 递归的处理子级的树形数据
     * 
     * @param {Object} data 
     * @param {Array<Object>} rules 
     * @param {Number} i 
     */
    function dealWithUnitRecursively(data, rules, i) {
        if (i < units.length) {
            data.next = dealWithUnit(rules, units[i]);

            data.next.forEach(d => {
                rules.push({
                    type: d.type,
                    value: d.value
                });
                dealWithUnitRecursively(d, rules, i + 1);
                rules.pop();
            });
        }
    }

    /**
     * 组装树形控件生成需要的数据并返回
     */
    function getTreedata(targets) {
        units = targets;
        treeData = dealwithFirstUnit(units);

        if (units.length > 1) {
            treeData.forEach(data => {
                let rules = [{
                    type: data.type,
                    value: data.value
                }];
                dealWithUnitRecursively(data, rules, 1);
            });
        }
        return treeData;
    }

    return getTreedata;
})();

/**
 * 获取单个树形结点的数据并返回
 * 
 * @example
 * {
 *      floor: 1,
 *      type: 'classID',
 *      value: '1',
 *      check: {
 *          net: ture, mean: false, center: true
 *      },
 *      color: '#CCCCCC'
 * }
 * @param {Number} index 
 */
function getTreeNodeData(index) {
    const $tree = $('#treeZone');
    const nodeData = {
        floor: -1, type: '', value: '',
        check: { net: false, mean: false, center: false },
        color: ''
    };
    const $li = $tree.find('li').eq(index);
    
    // Step 1 确定floor type value
    nodeData.floor = +($li.data('floor'));
    nodeData.type = $li.data('type');
    nodeData.value = $li.data('value');
    
    // Step 2 确定选择框确认情况
    ['net', 'mean', 'center'].forEach(key => {
        nodeData['check'][key] = $li.find(`span.${glyDict[key]}`).length > 0; 
    });

    // Step 3 获取颜色选择情况
    const $colorind = $li.find('.evo-colorind');
    nodeData.color = $colorind.data('color');
    
    return nodeData;
}

/**
 * 获取所有的树形结点的数据以数组形式返回
 */
function getAllTreeNodesData() {
    const $tree = $('#treeZone');
    const treeDatas = [];
    const len = $tree.find('li').length;
    for (let i = 0; i < len; i++) {
        treeDatas.push(getTreeNodeData(i));
    }
    return treeDatas;
}
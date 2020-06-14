/*
 * @Author: Shepherd.Lee 
 * @Date: 2020-06-14 20:28:25 
 * @Last Modified by: Shepherd.Lee
 * @Last Modified time: 2020-06-14 21:14:04
 */

/*
 * 组建treeview控件的实现
 */


const $tree = $('#treeZone');

$(function() {
    listen('treeview', initTreeView);
});


/**
 * 树形控件中显示的图标相关的类的词典
 */
const glyDict = {
    no_net: 'glyphicon-unchecked',
    net: 'glyphicon-check',
    no_mean: 'glyphicon-ban-circle',
    mean: 'glyphicon-record',
    no_center: 'glyphicon-eye-close',
    center: 'glyphicon-eye-open'
};

/**
 *  初始化树形控件\
 *  treeview事件触发后执行
 */
function initTreeView() {
    treeview( $tree, getTreeData() );
}

/**
 * 在指定区域下根据对象数组初始化树形控件
 * 
 * @param {Object} $tree 
 * @param {Array<Object>} data 
 */
function treeview( $tree, data ) {
    if (isundef(data)) return;

    let str = '<ul class="list-group">';
    data.forEach(cls => {
        let hasGroup = cls.groups.length != 0;
        let content = `Class ${cls.classID}`;
        str += generateTreeNode(hasGroup, 0, content);
        if ( !hasGroup ) return;

        cls.groups.forEach(group => {
            let hasMember = group.members.length != 0;
            let content = `Group ${cls.classID}.${group.gpID}`;
            str += generateTreeNode(hasMember, 1, content);
            if ( !hasMember ) return;

            group.members.forEach(member => {
                let content = `Student ${cls.classID}.${group.gpID}.${member}`;
                str += generateTreeNode(false, 2, content);
            });
        });
    });
    str += '</ul>';
    $tree.html('');
    $tree.append(str);
}

/**
 * 组装每个list-item并返回
 * 
 * @param {Boolean} hasChildren 是否有子节点 - 显示toggle-target
 * @param {Number} indentTimes 缩进级别
 * @param {String} content list-item的内容
 */
function generateTreeNode(hasChildren, indentTimes, content) {
    const minus = '<span class="toggle-target glyphicon glyphicon-minus"></span>';
    const indent = '<span class="indent"></span>';

    let str = `<li class="list-group-item" 
        data-istop=${indentTimes == 0?1:0}
        data-isparent=${hasChildren?1:0}>`;

    str += indent.repeat(indentTimes); // 缩进量
    if (hasChildren) str += minus; // 展开图标
    str += content; // 文本内容

    /**
     * 组装li中的选择按钮部分
     * 
     * @param {String} type eg. mean
     * @param {String} cls eg. glyDict.mean
     * @param {String} title 提示语 
     * @param {Boolean} active = true 是否添加unactive类(false则添加)
     */
    function generateGly(type, cls, title, active = true) {
        return `<span class="pull-right ${type} ${active ? '': 'unactive'}
            glyphicon ${cls}" title="${title}"></span>`;
    }

    str += generateGly('center', glyDict.center, '显示质心');
    if (indentTimes == 0) str += generateGly('mean', glyDict.mean, '显示平均质心');
    else if (indentTimes == 1) str += generateGly('mean', glyDict.no_mean, '显示平均质心', false);
    str += generateGly('net', glyDict.no_net, '显示网络图', false);

    str += '</li>';
    return str;
}
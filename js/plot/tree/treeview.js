/*
 * @Author: Shepherd.Lee 
 * @Date: 2020-07-24 22:07:05 
 * @Last Modified by: Shepherd.Lee
 * @Last Modified time: 2020-08-08 02:06:41
 */

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

// 允许绘制树形控件
let allowTreeView = false;

/**
 * 初始化树形控件的显示
 */
function initTreeView() {
    if ( !allowTreeView ) return;
    allowTreeView = false;

    let units = getParameter('analysisUnit');
    const treeData = getTreedata(units);
    if (isundef(treeData)) return;

    const $tree = $('#treeZone');
    let str = '<ul class="list-group">';

    /**
     * 
     * @param {Array<Object>} data 
     * @param {Number} floor 
     */
    function dealWithDataRecursively(data, floor) {
        if (data.length == 0) return;

        data.forEach(obj => {
            str += generateTreeNode(floor, obj.next.length != 0, obj.type, obj.value);
            dealWithDataRecursively(obj.next, floor + 1);
        });
    }

    dealWithDataRecursively(treeData, 0);
    str += '</ul>';
    $tree.html('');
    $tree.append(str);
    initColorpicker();
}

/**
 * 组装每个list-item并返回
 * 
 * @param {Number} floor 缩进级别
 * @param {Boolean} hasChildren 是否有子节点 - 显示toggle-target
 * @param {String} type
 * @param {String} value
 */
function generateTreeNode(floor, hasChildren, type, value) {
    const minus = '<span class="toggle-target glyphicon glyphicon-minus"></span>';
    const indent = '<span class="indent"></span>';

    let str = `<li class="list-group-item" 
        data-floor="${floor}" 
        data-type="${type}"
        data-value="${value}" >`;
    str += indent.repeat(floor); // 缩进量
    if (hasChildren) str += minus; // 展开图标
    let content = `${type} ${value}`;
    str += content; // 文本内容

    // 颜色选择器
    if (hasChildren) str += `<span class="pull-right">
        <input class="hidden colorpicker-container" /></span>`;

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

    str += generateGly('center', glyDict.no_center, '显示质心', false);
    if (floor == 0) str += generateGly('mean', glyDict.mean, '显示平均质心');
    else if (floor == 1) str += generateGly('mean', glyDict.no_mean, '显示平均质心', false);
    str += generateGly('net', glyDict.no_net, '显示网络图', false);

    str += '</li>';
    return str;
}

/**
 * 初始化颜色选择器的事件处理
 */
function initColorpicker() {
    const $container = $('.colorpicker-container');
    $container.colorpicker();
    $container.parent().addClass('colorpicker-wrapper');
    $container.next().data('color', '');
    $container.next().attr('title', '当前选择颜色为：<无>');
}
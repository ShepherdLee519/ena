/*
 * @Author: Shepherd.Lee 
 * @Date: 2020-06-14 20:42:43 
 * @Last Modified by: Shepherd.Lee
 * @Last Modified time: 2020-06-30 03:34:11
 */

/*
 * 树形空间区域有关的事件处理的实现与绑定
 */


$(function() {
    listen('initTreeviewFinish', initColorpicker);

    $('#resetTreeview').click( () => {
        initTreeView();
        return false;
    });

    multistep([
        toggleTreeNodeHandler,
        toggleTreeNodeOptionsHandler,
        treeNodePaletteHandler
    ], [[$tree], [$tree], [$tree]]);
});

/**
 * 初始化颜色选择器的事件处理
 */
function initColorpicker() {
    $('.colorpicker-container').colorpicker();
    $('.colorpicker-container').parent().addClass('colorpicker-wrapper');
    $('.colorpicker-container').next().data('color', '');
    $('.colorpicker-container').next().attr('title', '当前选择颜色为：<无>');
}

/**
 * 点击收缩树控件的事件处理
 * 
 * @param {Object} $tree 目标树形控件的容器
 */
function toggleTreeNodeHandler( $tree ) {
    const minus = 'glyphicon-minus';
    const plus = 'glyphicon-plus';

    delegate( $tree, [
        {
            target: '.toggle-target',
            event: 'click',
            handler: toggleTreeNode
        },
        {
            target: 'li',
            event: 'click',
            handler: logTreeNodeData
        }
    ]);

    /**
     * 树形级别收缩的事件处理函数
     */
    function toggleTreeNode() {
        const $this = $(this);
        const $node = $this.parent();
        const isTopLevel = $node.find('.indent').length == 0;
        const isOpen = $this.hasClass(minus); // true: open
        
        if ( !isTopLevel ) {
            if (isOpen) closeTreeNode( $node );
            else openTreeNode( $node );
        } else {
            let $temp = $node;
            while( $temp.next().length && !$temp.next().data('istop') ) {
                $temp = $temp.next();
                if ( $temp.data('isparent') ) {
                    if (isOpen) closeTreeNode( $temp, true );
                    else show( $temp );
                }
            }
            if (isOpen) $this.addClass(plus).removeClass(minus);
            else $this.addClass(minus).removeClass(plus);
        }
    }

    /**
     * 收缩树(最小级别)
     * 
     * @param {Object} $node 有toggle-target的节点对象 
     * @param {Boolean} self = flase 是否隐藏自己 
     */
    function closeTreeNode( $node, self = false ) {
        const $span = $node.find('span.toggle-target').eq(0);
        let $temp = $node;
        while( $temp.next().length && !$temp.next().data('isparent') ) {
            $temp = $temp.next();
            hide( $temp );
        }
        $span.removeClass(minus).addClass(plus);
        if (self) hide( $node );
    }

    /**
     * 展开树(最小级别)
     * 
     * @param {Object} $node 有toggle-target的节点对象 
     */
    function openTreeNode( $node ) {
        const $span = $node.find('span.toggle-target').eq(0);
        let $temp = $node;
        while( $temp.next().length && !$temp.next().data('isparent') ) {
            $temp = $temp.next();
            show( $temp );
        }
        $span.removeClass(plus).addClass(minus);
    }

    /**
     * 获取节点的数据并在控制台输出
     */
    function logTreeNodeData() {
        const index = $(this).index();
        console.log(getTreeNodeData( $tree, index ));
    }
    
} 

/**
 * 切换树结点下的选项的事件处理
 * 
 * @param {Object} $tree 
 */
function toggleTreeNodeOptionsHandler( $tree ) {
    delegate( $tree, [
        {
            target: '.net',
            event: 'click',
            handler: toggleOption('net')
        },
        {
            target: '.mean',
            event: 'click',
            handler: toggleOption('mean')
        },
        {
            target: '.center',
            event: 'click',
            // handler: toggleOption('center')
            handler: toggleOptionCenter
        }
    ]);

    /**
     * 切换图标显示的事件函数的工厂函数
     * 
     * @param {String} target net/mean/center 
     */
    function toggleOption(target) {
        return function() {
            const $this = $(this);
            if ( $this.hasClass('unactive') ) {
                if (target === 'net' && !checkNet()) return;
                $this.removeClass(glyDict[`no_${target}`]).addClass(glyDict[target]);
                $this.removeClass('unactive');
            } else {
                $this.addClass(glyDict[`no_${target}`]).removeClass(glyDict[target]);
                $this.addClass('unactive');
            }
        }
    }

    /**
     * 切换质心显示的事件处理
     */
    function toggleOptionCenter() {
        const $li = $(this).closest('li');
        const level = +$li.data('istop') + +$li.data('isparent') + 1;
        if (level == 1) {
            toggleOption('center').apply(this, null);
        } else {
            const state = $li.find('.center').hasClass(glyDict.no_center);

            ;(function( $li, flag, state) {
                const data_target = flag ? 'istop' : 'isparent';
                let $temp = $li;
                do {
                    if ( state ) {
                        $temp.find('.center')
                            .removeClass(glyDict.no_center)
                            .removeClass('unactive')
                            .addClass(glyDict.center);
                    } else {
                        $temp.find('.center')
                            .addClass(glyDict.no_center)
                            .addClass('unactive')
                            .removeClass(glyDict.center);
                    }
                    $temp = $temp.next();
                } while( $temp.length && $temp.data(data_target) != 1 )
            })( $li, +(level == 3), state);
        }
    }

    /**
     * 检查，确保网络图选中的数量不超过2
     * 
     * @returns flag
     */
    function checkNet() {
        let len = $tree.find('.net:not(.unactive)').length;
        let flag = len < 2;
        if ( !flag ) alert('最多只能选中两个对象绘制网络图！'); 
        return flag;
    }
}

/**
 * 颜色选择器的事件处理
 * 
 * @param {Object} $tree 
 */
function treeNodePaletteHandler( $tree ) {
    delegate( $tree, [
        {
            target: '.colorpicker-container',
            event: 'change.color',
            handler: colorChangeHandler
        }
    ]);

    /**
     * 颜色选择器的颜色变化后的事件处理
     * 
     * @param {Object} e
     * @param {String} color
     */
    function colorChangeHandler(e, color) {
        if (isundef(color)) return;
        const $colorind = $(this).next();
        let title = $colorind.attr('title');
        title = title.replace(/<(.*)>/u, `<${color}>`);
        $colorind.attr('title', title);
        $colorind.data('color', color);
    }
}
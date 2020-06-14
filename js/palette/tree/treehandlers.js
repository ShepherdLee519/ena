/*
 * @Author: Shepherd.Lee 
 * @Date: 2020-06-14 20:42:43 
 * @Last Modified by: Shepherd.Lee
 * @Last Modified time: 2020-06-14 21:23:44
 */

/*
 * 树形空间区域有关的事件处理的实现与绑定
 */


$(function() {
    multistep([
        toggleTreeNodeHandler,
        toggleTreeNodeOptionsHandler
    ], [[$tree], [$tree]]);
});


/**
 * 点击收缩树控件的事件处理
 * 
 * @param {Object} $tree 目标树形控件的容器
 */
function toggleTreeNodeHandler( $tree ) {
    const minus = 'glyphicon-minus';
    const plus = 'glyphicon-plus';

    delegate( $tree, {
        target: '.toggle-target',
        event: 'click',
        handler: toggleTreeNode
    });

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
            handler: toggleOption('center')
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
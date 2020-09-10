/*
 * @Author: Shepherd.Lee 
 * @Date: 2020-07-25 02:03:15 
 * @Last Modified by: Shepherd.Lee
 * @Last Modified time: 2020-08-08 01:59:59
 */

/*
 * 树形空间区域有关的事件处理的实现与绑定
 */
const initTreeHandlers = (function() {
    const $tree = $('#treeZone');

    /**
     * 点击收缩树控件的事件处理
     */
    function toggleTreeNode() {
        const minus = 'glyphicon-minus';
        const plus = 'glyphicon-plus';

        delegate( $tree, [
            {
                target: '.toggle-target',
                event: 'click',
                handler: toggleTreeNodeHandler
            }
        ]);

        /**
         * 树形级别收缩的事件处理函数
         */
        function toggleTreeNodeHandler() {
            const $this = $(this);
            const $node = $this.parent();
            const isOpen = $this.hasClass(minus); // true: open
            const floor = +($node.data('floor'));
            
            if (isOpen) {
                closeTreeNode( $node, floor );
            } else {
                openTreeNode( $node, floor );
            }
        }

        /**
         * 收缩树
         * 
         * @param {Object} $node 有toggle-target的节点对象 
         * @param {Number} floor
         */
        function closeTreeNode( $node, floor ) {
            const $span = $node.find('span.toggle-target');
            if ( !$span.length ) return;

            let $temp = $node;
            while( $temp.next().length && +($temp.next().data('floor')) > floor ) {
                $temp = $temp.next();
                let subFloor = +($temp.data('floor'));
                if ( subFloor == floor + 1) {
                    closeTreeNode( $temp, subFloor );
                    hide( $temp );
                }
            }
            $span.removeClass(minus).addClass(plus);
        }

        /**
         * 展开树
         * 
         * @param {Object} $node 有toggle-target的节点对象 
         * @param {Number} floor
         */
        function openTreeNode( $node, floor ) {
            const $span = $node.find('span.toggle-target');
            if ( !$span.length ) return;

            let $temp = $node;
            while( $temp.next().length && +($temp.next().data('floor')) > floor ) {
                $temp = $temp.next();
                let subFloor = +($temp.data('floor'));
                if ( subFloor == floor + 1) {
                    openTreeNode( $temp, subFloor );
                    show( $temp );
                }
            }
            $span.removeClass(plus).addClass(minus);
        }
    }

    /**
     * 切换树结点下的选项的事件处理
     * 
     * @param {Object} $tree 
     */
    function toggleTreeNodeOptions() {
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
         * 切换质心显示的事件处理\
         * 切换质心隐藏、显示的时候，需要广播到后代
         */
        function toggleOptionCenter() {
            const $li = $(this).closest('li');
            const floor = +($li.data('floor'));
            const state = $li.find('.center').hasClass(glyDict.no_center);
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
            } while( $temp.length && +($temp.data('floor')) > floor );
        }

        /**
         * 检查，确保网络图选中的数量不超过2
         * 
         * @returns {Boolean} flag
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
     */
    function treeNodePalette() {
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
            // 当前选择颜色为：<无> => 当前选择颜色为：<#DDDDDD>
            title = title.replace(/<(.*)>/u, `<${color}>`);
            $colorind.attr('title', title);
            $colorind.data('color', color);
        }
    }

    /**
     * 重置树形控件的事件处理
     */
    function resetTreeView() {
        $('#resetTreeview').click( () => {
            allowTreeView = true;
            initTreeView();
            return false;
        });
    }

    function initTreeHandlers() {
        multistep([
            toggleTreeNode, toggleTreeNodeOptions,
            treeNodePalette, resetTreeView
        ]);
    }

    return initTreeHandlers; 
})();

initTreeHandlers();
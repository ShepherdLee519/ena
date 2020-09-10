/*
 * @Author: Shepherd.Lee
 * @Date: 2020-08-07 23:28:36
 * @Last Modified by: Shepherd.Lee
 * @Last Modified time: 2020-08-19 19:33:07
 */

$(function() {
    filterHandler();
});

/**
 * 过滤数据的事件处理
 */
const [filterHandler, getFilterDBData, getFilterData] = (function() {
    const $filterDBClass = $('#filterdbClass');
    const $filterDBGroup = $('#filterdbGroup');
    const $filterClass = $('#filterClass');
    const $filterGroup = $('#filterGroup');
    let each_row_num = 5;

    /**
     * 组装选项菜单
     *
     * @param {Array<String>} data
     * @param {Object} $target
     */
    function initCheckboxes(data, $target) {
        data.map(v => +v);
        let str = '';
        data.sort().forEach( (d, index) => {
            str += `
            <label class="checkbox-inline">
                <input type="checkbox" class="normal-checkbox" checked value="${d}"> ${d}
            </label>
            `.trim();
            if (index % each_row_num == each_row_num - 1) str += '<br />';
        });
        $target.append(str);
    }

    /**
     * 复选菜单的事件处理 - 选中后取消all
     */
    function initCheckboxesHandler() {
        function changeHandler() {
            let flag = $(this)[0].checked;
            const $div = $(this).parent().parent();
            if ( $(this).hasClass('all-checkbox')) {
                if (flag)  {
                    [...$div.find('.normal-checkbox')].forEach(checkbox => {
                        checkbox.checked = true;
                    });
                } else {
                    [...$div.find('.normal-checkbox')].forEach(checkbox => {
                        checkbox.checked = false;
                    });
                }
            } else {
                if ( !flag ) {
                    $div.find('.all-checkbox')[0].checked = false;
                }
            }
        } // end changeHandler

        delegate( $('#filterForm'), [
            {
                target: '#filterClass input',
                event: 'change',
                handler: changeHandler
            },
            {
                target: '#filterGroup input',
                event: 'change',
                handler: changeHandler
            }
        ]);

        delegate( $('#filterdbForm'), [
            {
                target: '#filterdbClass input',
                event: 'change',
                handler: changeHandler
            },
            {
                target: '#filterdbGroup input',
                event: 'change',
                handler: changeHandler
            }
        ]);
    }

    /**
     * 组装过滤的选项菜单
     */
    function initFilterOptions() {
        $.get('./php/mysql/get_class.php', res => {
            initCheckboxes(JSON.parse(res), $filterDBClass);
        });
        $.get('./php/mysql/get_group.php', res => {
            initCheckboxes(JSON.parse(res), $filterDBGroup);
        });
        $.get('./data/filter.json?num=' + random(), res => {
            initCheckboxes(res.classid, $filterClass);
            initCheckboxes(res.groupid, $filterGroup);
        });
        initCheckboxesHandler();
    }

    /**
     * 生成过滤函数数据用的函数的工厂函数
     *
     * @param {String} type local/db
     */
    function getFilterDataFactory(type) {
        return function() {
            const filterDara = (t) => {
                let id = '';
                if (type === 'local') {
                    id = (t == 'class') ?
                        '#filterClass' : '#filterGroup';
                } else if (type === 'db') {
                    id = (t == 'class') ?
                        '#filterdbClass' : '#filterdbGroup';
                }

                let arr = [];
                if ( $(id).find('.all-checkbox')[0].checked) {
                    arr.push('all');
                }
                [...$(id).find('.normal-checkbox')].forEach(checkbox => {
                    if (checkbox.checked) {
                        arr.push( $(checkbox).val() );
                    }
                });
                return arr;
            }

            return {
                'classid': filterDara('class'),
                'groupid': filterDara('group')
            };
        }
    }

    return [
        initFilterOptions,
        getFilterDataFactory('db'), getFilterDataFactory('local')
    ];
})();
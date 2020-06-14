/*
 * @Author: Shepherd.Lee 
 * @Date: 2020-06-14 18:19:19 
 * @Last Modified by: Shepherd.Lee
 * @Last Modified time: 2020-06-14 18:26:45
 */

/*
 * 参数设置部分中的选择框的动态添加、删除的事件处理与绑定 
 */


$(function() {
    /**
     * 添加/删除选择单元的事件处理函数
     */
    delegate( $('#parameterZone'), [
        {
            target: '.add-unit',
            event: 'click',
            handler: addUnit 
        },
        {
            target: '.delete-unit',
            event: 'click',
            handler: deleteUnit
        }
    ]);
});

/**
 * 添加动态输入控件的事件处理
 */
function addUnit() {
    const $lastUnit = $(this).closest('.last-unit');
    const $clone = $lastUnit.prev().clone();
    $clone.find('select').val(0);
    $lastUnit.before( $clone ); // 新的选择框加在最末
    resetOption( $(this).closest('.units') );
    return false;
}

/**
 * 删除动态输入控件的事件处理
 */
function deleteUnit() {
    const $unit = $(this).closest('.unit');
    const $units = $unit.closest('.units');
    const type = $units.data('type');
    let len = $units.children('.unit').length;
    if (len == 1) {
        alert('当前选择框为最后一个，不能删除！');
        return false;
    }
    $unit.remove();
    showCodes(type); // 见showcodes.js
    resetOption( $units );
    return false;
}

/**
 * 重置 $units 下的option 的显示
 * 
 * @param {Object} $units 
 */
function resetOption( $units ) {
    let values = []; // 存放当前选中的所有值
    [...$units.find('option:selected')].forEach(opt => {
        values.push( $(opt).val() );
    });
    [...$units.find('.unit')].forEach(unit => {
        let selected = $(unit).find('option:selected').val(); // 当前选择框的所选值
        show( $(unit).find('option') ); // 先显示所有option
        values.forEach(value => {
            if (value == 0) return; // 跳过 "请选择"
            else if (value == selected) {
                show( $(unit).find(`option[value="${value}"]`) );
            } else {
                // 隐藏非本选择框选中的所选值(即由其他选择框选中的)
                hide( $(unit).find(`option[value="${value}"]`) );
            }
        });
    });
}
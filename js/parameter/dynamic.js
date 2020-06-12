/**
 * 添加/删除选择单元的事件处理函数
 */
delegate( $('#parameterZone'), [
    {
        target: '.delete-unit',
        event: 'click',
        handler: deleteUnit
    }, 
    {
        target: '.add-unit',
        event: 'click',
        handler: addUnit 
    }
]);

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
    showCodes(type);
    resetOption( $units );
    return false;
}

/**
 * 添加动态输入控件的事件处理
 */
function addUnit() {
    const $lastUnit = $(this).closest('.last-unit');
    const $clone = $lastUnit.prev().clone();
    $clone.find('select').val(0);
    $lastUnit.before( $clone );
    resetOption( $(this).closest('.units') );
    return false;
}

/**
 * 重置 $units 下的option 的显示
 * 
 * @param {Object} $units 
 */
function resetOption( $units ) {
    let values = [];
    [...$units.find('option:selected')].forEach(opt => {
        values.push( $(opt).val() );
    });
    [...$units.find('.unit')].forEach(unit => {
        let selected = $(unit).find('option:selected').val();
        $(unit).find('option').removeClass('hidden');
        values.forEach(value => {
            if (value == 0) return;
            else if (value == selected) {
                $(unit).find(`option[value="${value}"]`).removeClass('hidden');
            } else {
                $(unit).find(`option[value="${value}"]`).addClass('hidden');
            }
        });
    });
}
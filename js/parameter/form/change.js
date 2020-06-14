/*
 * @Author: Shepherd.Lee 
 * @Date: 2020-06-14 18:26:52 
 * @Last Modified by: Shepherd.Lee
 * @Last Modified time: 2020-06-14 20:24:17
 */

/* 
 * 参数设置区域的选择框/输入发生变化时的事件处理
 */


$(function() {
    delegate( $('#parameterZone'), [
        {
            target: 'select',
            event: 'change',
            handler: selectChange
        },
        {
            target: 'input[type="text"]',
            event: 'change',
            handler: inputChange
        },
        {
            target: 'input[type="text"]',
            event: 'focus',
            handler: inputFocus
        },
        {
            target: 'input[type="checkbox"]',
            event: 'change',
            handler: switchChange
        }
    ]); 
})

/**
 * 1. selectchange
 */
function selectChange() {
    const $this = $(this);
    let type = $this.closest('.units').data('type');
    let val = $this.find('option:selected').val();
    let index = $this.closest('.unit').index();
    
    showCodes(type); // 见showcodes.js
    adjustOptionChange( $this.closest('.units'), val, index);
    return false;
}

/**
 * select Change时候即时调整option的显示
 * 
 * @param {Object} $units 
 * @param {String} val
 * @param {Number} index
 */
function adjustOptionChange( $units, val, index ) {
    // 跳过 "请选择"
    if ( +val == 0) {
        resetOption( $units );
        return;
    }
    $units.find('.unit').each( (i, unit) => {
        if (i == index) return; // 当前select下的目标option不隐藏
        hide( $(unit).find(`option[value="${val}"]`) );
    });
}

/**
 * 2. inputchange
 */
function inputChange() {
    let type = $(this).data('type');
    
    showCodes(type); // 见showcodes.js
    return false;
}

/**
 * 避免input下回车触发别的事件
 */
function inputFocus() {
    $(this).bind('keydown', function(e) {
        if (e.which == 13) {
            e.preventDefault();
            $(this).blur();
        }
    })
}

/**
 * 3. switchchange
 */
function switchChange() {
    let type = $(this).data('type');

    showCodes(type); // 见showcodes.js
    return false;
}
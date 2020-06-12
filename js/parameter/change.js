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

// 1. selectchange
function selectChange() {
    let type = $(this).closest('.units').data('type');
    let val = $(this).find('option:selected').val();
    let index = $(this).closest('.unit').index();
    showCodes(type);
    adjustOptionChange( $(this).closest('.units'), val, index);
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
    if ( +val == 0) {
        resetOption( $units );
        return;
    }
    $units.find('.unit').each( (i, unit) => {
        if (i == index) return;
        $(unit).find(`option[value="${val}"]`).addClass('hidden');
    });
}

// 2. inputchange
function inputChange() {
    let type = $(this).data('type');
    let val = $(this).val();
    showCodes(type, val);
    return false;
}

// 避免input下回车触发别的事件
function inputFocus() {
    $(this).bind('keydown', function(e) {
        if (e.which == 13) {
            e.preventDefault();
            $(this).blur();
        }
    })
}

// 3. switchchange
function switchChange() {
    let type = $(this).data('type');
    let val = $(this).next().html();
    let state = $(this)[0].checked ? 'off' : 'on'; 
    showCodes(type, val, state);
}
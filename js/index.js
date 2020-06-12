$(function() {
    $('#navigator li').click(function() {
        $(this).siblings().removeClass('active');
        $(this).addClass('active');
        let type = $(this).data('type');
        toLocation({type: type});
        showZone(type);
        return false;
    });
    
    let type = getQuery('type');
    if ( !type ) {
        $(`#navigator li[data-type='encode']`).click();
    } else {
        showZone(type);
    }
});


/**
 * 根据页面类型显示对应的页面内容
 * 
 * @param {String} type 页面对应类型：encode/parameter/palette
 */
function showZone(type) {
    $(`#navigator li[data-type=${type}]`).addClass('active');
    $("#mainZone").children().addClass('hidden');
    $(`#${type}-row`).removeClass('hidden');
}
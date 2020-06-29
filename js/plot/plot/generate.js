/*
 * @Author: Shepherd.Lee 
 * @Date: 2020-06-20 21:49:55 
 * @Last Modified by: Shepherd.Lee
 * @Last Modified time: 2020-06-30 03:42:02
 */

/*
 * 点击#generate后通过php调用R进行绘图的逻辑实现
 */


$(function() {
    listen('prepareCodes', runR);

    $('#generate').click(function(e) {
        e.preventDefault();
        
        prepareRCodes();
        return false;
    });

    $('#refreshIframe').click( () => {
        if ( $('#iframe').hasClass('hidden')) return false;
        showIFrame();
        return false;
    });

    $('#showSourcecode').click( () => {
        $('#sourcecode').toggleClass('hidden');
        $('#iframe').toggleClass('hidden');
        return false;
    });
});

/**
 * 运行 R 代码的ajax的封装
 */
function runR() {
    $.get('./php/runr.php', res => {
        if (res) console.log('finish!');
        console.log(res);
        showIFrame();
    });
}

/**
 * 控制Iframe显示的事件处理
 */
function showIFrame() {
    const defaultPath = './output/output.html';
    const $iframe = $('#iframe');
    hide( $iframe );
    $iframe.attr('src', `${defaultPath}?num=${random()}`);
    show( [$iframe, $('#iframeBtns')] );
}
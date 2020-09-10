/*
 * @Author: Shepherd.Lee 
 * @Date: 2020-06-20 21:49:55 
 * @Last Modified by: Shepherd.Lee
 * @Last Modified time: 2020-07-31 03:31:38
 */

/*
 * 点击#generate后通过php调用R进行绘图的逻辑实现
 */


$(function() {
    // preparecodes -> saveCodes 后触发
    listen('prepareCodes', runR);

    /**
     * 点击后进行绘制的事件处理
     */
    $('#generate').click(function(e) {
        e.preventDefault();
        
        prepareRCodes();
        return false;
    });

    /**
     * 刷新iframe的事件处理
     */
    $('#refreshIframe').click( () => {
        if ( $('#iframe').hasClass('hidden')) return false;
        showIFrame();
        return false;
    });

    /**
     * 切换显示源代码的事件处理
     */
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
        if (res) console.log('runR finish!');
        console.log(res);

        $('#sourcecode').html(
            $('#sourcecode').html() 
                + `\n\nOutput:\n${res}`
        );
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
/*
 * @Author: Shepherd.Lee 
 * @Date: 2020-06-20 21:49:55 
 * @Last Modified by: Shepherd.Lee
 * @Last Modified time: 2020-06-24 20:51:19
 */

/*
 * 点击#generate后通过php调用R进行绘图的逻辑实现
 */


$(function() {
    $('#generate').click(function(e) {
        e.preventDefault();
        
        const colorA = '#0099CC', colorB = '#FF6666';
        $.get("./php/runr.php", {color1: colorA, color2: colorB}, res => {
            if (res) console.log('finish!');
            console.log(res);
            showIFrame();
        });
        return false;
    });
});

function showIFrame() {
    const $iframe = $('#iframe');
    if ( !$iframe.hasClass('hidden') ) {
        let src = $iframe.attr('src');
        $iframe.attr('src', '');
        $iframe.attr('src', src);
    }
    show( $iframe );
}
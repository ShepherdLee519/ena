/*
 * @Author: Shepherd.Lee 
 * @Date: 2020-06-20 20:47:14 
 * @Last Modified by: Shepherd.Lee
 * @Last Modified time: 2020-08-17 13:36:56
 */

/*
 * 点击按钮切换子页面显示的事件处理
 */


$(function() {
    const homePage = 'encode'; // 首页对应的类型

    $('#navigator li').click(function() {
        let type = $(this).data('type');

        const [flag, message] = ifPrepared(type, homePage);
        if (flag) {
            $(this).siblings().removeClass('active');
            $(this).addClass('active');
            // url 转至对应页面(带querystring)
            toLocation({type: type});
            // 显示目标区域
            showZone(type);
        } else {
            alert(message);
        }
        return false;
    });
    
    let type = getQuery('type');
    if (PAGELOCK || isundef(type)) {
        // 默认应显示自动编码界面
        $(`#navigator li[data-type='${homePage}']`).click();
    } else {
        $(`#navigator li[data-type='${type}']`).click();
    }
});


/**
 * 根据页面类型显示对应的页面内容
 * 
 * @param {String} type 页面对应类型：encode/parameter/plot
 */
function showZone(type) {
    if (type === 'parameter') initShowCodes();
    if (type === 'plot') initTreeView();

    $(`#navigator li[data-type=${type}]`).addClass('active');
    hide( $("#mainZone").children() ).show( $(`#${type}-row`) );
}


/**
 * 判断是否可以跳转至目标页面
 * 
 * @param {String} type 页面对应类型：encode/parameter/plot
 * @param {String} homePage 默认显示的主页面对应的类型名
 */
function ifPrepared(type, homePage) {
    if ( !PAGELOCK ) return [true, 'Success'];

    // 跳转至主页面无需额外的限制条件
    if (type === homePage) return [true, 'Success'];
    
    const isEmpty = (target) => {
        return isundef(target) || target.length == 0;
    }

    if (isEmpty(ENCODE)) {
        // 如果在自动编码界面没有读入数据并初始化自动编码结果，则不能跳转至其他界面
        return [false, '请先完成"自动编码"界面的操作!'];
    } else if (type === 'plot') {
        const para = gatherParameter();
        return [para.conversation.length && para.units.length, '请先完成<分析单元>与<分析话语>等的参数设置!'];
    } else {
        return [true, 'Success'];
    }
}
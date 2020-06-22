/*
 * @Author: Shepherd.Lee 
 * @Date: 2020-06-20 20:47:14 
 * @Last Modified by: Shepherd.Lee
 * @Last Modified time: 2020-06-22 11:23:02
 */

/*
 * 点击按钮切换子页面显示的事件处理
 */

// 控制能否自由切换子页面(无需验证)的开关
// 正式使用应设置成 true
// const PAGELOCK = true;
const PAGELOCK = false;


$(function() {
    const homePage = 'encode'; // 首页对应的类型

    $('#navigator li').click(function() {
        let type = $(this).data('type');

        if (ifPrepared(type, homePage)) {
            $(this).siblings().removeClass('active');
            $(this).addClass('active');
            // url 转至对应页面(带querystring)
            toLocation({type: type});
            // 显示目标区域
            showZone(type);
        } else {
            alert('请先完成"自动编码"界面的数据加载与编码!');
        }
        return false;
    });
    
    if (PAGELOCK) {
        // 默认应显示自动编码界面
        $(`#navigator li[data-type='${homePage}']`).click();
    } else {
        let type = getQuery('type');
        $(`#navigator li[data-type='${type}']`).click();
    }
});


/**
 * 根据页面类型显示对应的页面内容
 * 
 * @param {String} type 页面对应类型：encode/parameter/plot
 */
function showZone(type) {
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
    if ( !PAGELOCK ) return true;

    // 跳转至主页面无需额外的限制条件
    if (type === homePage) return true;
    
    const isEmpty = (target) => {
        return isundef(target) || target.length == 0;
    }

    if (isEmpty(DATA) || isEmpty(DICT) || isEmpty(ENCODE)) {
        // 如果在自动编码界面没有读入数据并初始化自动编码结果，则不能跳转至其他界面
        return false;
    } else {
        return true;
    }
}
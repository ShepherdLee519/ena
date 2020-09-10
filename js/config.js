/*
 * @Author: Shepherd.Lee 
 * @Date: 2020-07-04 04:21:04 
 * @Last Modified by: Shepherd.Lee
 * @Last Modified time: 2020-07-24 21:44:19
 */

/*
 * 全局性的设置 
 */


const LIMIT = 1000; // 显示的数据范围

// 控制部署到系统后的一些路径、设置的变化
const PRODUCTION = false;
// const PRODUCTION = true;

// 控制能否自由切换子页面(无需验证)的开关
// 正式使用应设置成 true
const PAGELOCK = PRODUCTION || true;
// const PAGELOCK = PRODUCTION || false;
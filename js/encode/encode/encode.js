/*
 * @Author: Shepherd.Lee 
 * @Date: 2020-06-14 17:47:14 
 * @Last Modified by: Shepherd.Lee
 * @Last Modified time: 2020-06-20 20:42:39
 */

/*
 * 与自动编码有关的逻辑处理，具体调用见handlers.js中的事件绑定
 */


// 关于编码时候的一些全局配置
var encodeConfig = {
    pass: ['timeStamp', 'actionType'], // 编码结果无视这些字段
    dimensions: [] // 编码维度
}


/**
 * 点击编码后进行自动编码的事件处理
 */
function autoEncode() {
    if (DATA.length == 0 || DICT.length == 0) return;
    ENCODE = []; // 清空ENCODE，避免二次编码时候累加

    let goals; // 存储 one-hot 数组
    let dictLen = DICT.length; // 编码维度数量
    let len = (DATA.length <= LIMIT) ? DATA.length : LIMIT; // 待编码的数据量
    for (let i = 0; i < len; i++) {
        goals = Array.from(Array(dictLen), (_) => 0);
        let row = DATA[i];
        encodeRow(row['Content'], goals); // 编码，调整goals
        ENCODE.push(initEncodeRow(row, goals));
        // console.log('Encoded! index:' , i+1);
        // console.log(goals);
    }

    TARGET = ENCODE;
    mkTable('encode'); // 绘制编码结果
}

/**
 * 对文本进行编码，调整one-hot数组值
 * 
 * @param {String} content 需编码的文本内容 
 * @param {Array<Number>} goals 编码内容的one-hot数组 
 */
function encodeRow(content, goals) {
    // 理由未知，不显式转为 String 会报错
    content = String(content);
    let len = dict_single.length;

    for (let i = 0; i < len; i++) {
        // Step 1. 根据 dict_single 进行编码
        // flag 为 true 表示当前编码为1，应尽早结束冗余的编码过程
		let flag = false;
		if (dict_single[i].length) {
			for (let j = 0; j < dict_single[i].length && !flag; j++) {
				if ( ~content.indexOf(dict_single[i][j]) ) {
					goals[i] = 1; flag = true;
				}
			}
		}

        // Step 2. 根据 dict_complex 进行编码
		if ( !flag && dict_complex[i].length) {
			for (let j = 0; j < dict_complex[i].length && !flag; j++) {
                let dict = dict_complex[i][j];
				let index = content.indexOf(dict[i]);
				for (let k = 1; k < dict.length; k++) {
					if ( !~index ) break;
					index = content.indexOf(dict[k], index);
				}
				if ( ~index ) {
					goals[i] = 1; flag = true;
				}
			} // end for(let j)
		}
	} // end for(let i)
}

/**
 * 组装编码后的数据对象
 * 
 * @param {Object} row 原始的行数据 
 * @param {Array<Number>} goals 编码后的one-hot数组 
 * @returns row
 */
function initEncodeRow(row, goals) {
    for (let i = 0; i < goals.length; i++) {
        row[encodeConfig.dimensions[i]] = goals[i];
    }
    // 删除编码后不需显式的数据内容
    for (let key of encodeConfig.pass) {
        delete row[key];
    }
    return row;
}

/**
 * 应于DICT填充后调用(调用于dictionary.js)
 */
function initDimension() {
    for (let i = 0; i < DICT.length; i++) {
        encodeConfig.dimensions.push(DICT[i]['维度']);
    }
}
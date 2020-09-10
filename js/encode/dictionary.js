/*
 * @Author: Shepherd.Lee 
 * @Date: 2020-06-14 17:38:35 
 * @Last Modified by: Shepherd.Lee
 * @Last Modified time: 2020-08-17 13:54:35
 */

var dict_single = []; // 单关键词编码词典
var dict_complex = []; // 复合关键词编码词典

/*
 * 初始化本地编码词典的事件处理\
 * 主要逻辑调用于readXLSX(from loadxlsx.js)中读入dictionary数据时 
 */
const [initDictionary, initDimension] = (function() {
    /**
     * 应于DICT填充后调用
     */
    function initDimension() {
        for (let i = 0; i < DICT.length; i++) {
            encodeConfig.dimensions.push(DICT[i]['维度']);
        }
    }

    /**
     * 初始化本地的编码词典数组\
     * 调用于loadxlsx.js -> readXLSX
     */
    function initDictionary() {
        initDimension(); // 详见encode.js
        for (let i = 0; i < DICT.length; i++) {
            let words = DICT[i]['关键词'];
            
            // step 1: 去空格, 矫正分隔号，分割成数组
            words = words.replace(/\s/g, '');
            words = words.replace(/,|，/g, '、');
            words = words.split('、');
            
            // step 2: 区分 放入对应数组中
            dict_single[i] = [];
            dict_complex[i] = [];
            for (let word of words) {
                if (word === '') continue;
                if ( !~word.indexOf('+')) {
                    dict_single[i].push(word);
                } else {
                    dealWithComplexWord(word, i);
                }
            }
        }
    } 

    /**
     * 处理复杂关键词
     * 
     * @param {String} word 复杂文本规则，eg."aa+bb/cc" 
     * @param {Number} index 该规则对应的维度位置 
     */
    function dealWithComplexWord(word, index) {
        let words = word.split('+');
        for (let i = 0; i < words.length; i++) {
            if ( ~words[i].indexOf('/') ) {
                words[i] = words[i].split('/');
            } 
            if ( !Array.isArray(words[i]) ) {
                words[i] = [words[i]];
            }
        }
        // eg. aa+bb/cc+dd/ee/ff => pos = [1, 2, 3];
        let pos = Array.from(Array(words.length), (_,k) => words[k].length);
        // indexes 里为元素坐标的全排列 eg. [[0,0,0], [0,0,1] ...];
        let indexes = [];
        initIndexes(indexes, pos, 0);

        // 根据全排列下标数组，组装可能的关键字排列组合
        for (let i = 0; i < indexes.length; i++) {
            let arr = [];
            for (let j = 0; j < pos.length; j++) {
                arr.push(words[j][ indexes[i][j] ]);
            }
            dict_complex[index].push(arr);
        }
    }

    /**
     * 递归的初始化下标的全排列数组
     * 
     * @param {Array<Array<Number>>} indexes 下标全排列数组 
     * @param {Array<Number>} pos 下标范围的数组 
     * @param {Number} index 当前处理的下标位 
     * @param {String} temp 下标组成的字符串 
     */
    function initIndexes(indexes, pos, index, temp = '') {
        // 基础条件 当前处理的下标位到达最后
        if (index == pos.length) {
            let arr = temp.split('+');
            arr.pop(); // 去除最末的''空字符串
            indexes.push(arr);
            return;
        }

        // 递归选择全排列中的下一位数字
        for (let i = 0; i < pos[index]; i++) {
            initIndexes(indexes, pos, index + 1, temp + `${i}+`);
        }
    }

    return [initDictionary, initDimension];
})();
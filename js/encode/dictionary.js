var dict_single = [];
var dict_complex = [];


/**
 * 初始化本地的编码词典数组
 */
function initDictionary() {
    initDimension();
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
 * 处理复杂规则
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
    let pos = Array.from(Array(words.length), (v,k) => words[k].length);
    // indexes 里为元素坐标的全排列 eg. [[0,0,0], [0,0,1] ...];
    let indexes = [];
    initIndexes(indexes, pos, 0);

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
	if (index == pos.length) {
		let arr = temp.split('+');
		arr.pop();
		indexes.push(arr);
		return;
	}

	for (let i = 0; i < pos[index]; i++) {
		initIndexes(indexes, pos, index + 1, temp + `${i}+`);
	}
}
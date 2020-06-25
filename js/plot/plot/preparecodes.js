/*
 * @Author: Shepherd.Lee 
 * @Date: 2020-06-24 21:10:25 
 * @Last Modified by: Shepherd.Lee
 * @Last Modified time: 2020-06-25 21:07:06
 */

/*
 * 组装 R 代码并写入 R 文件以待执行 
 */


/**
 * 生成R代码的相关全局配置，包含部分可修改部分的设置
 */
const rcodeConfig = {
    // 注意转义 \\\\ => \\ 注意末尾的反斜杠
    dataPath: 'C:\\\\wamp64\\\\www\\\\ena\\\\xlsx\\\\',
    dataName: 'encode.xlsx',
    outputName: 'output.html',
    rPath: '../R/', // 应当是相对于 saver.php的，注意末尾的斜杠
    rName: 'ena_auto.R'
};

/**
 * 组装生成 R 代码的实现，以共有部分的代码为主
 */
const prepareRCodes = (function() {
    /**
     * 组装注释信息并返回
     * 
     * @param {String} info 注释内容
     */
    function note(info) {
        return `# ${info}\n`;
    }

    /**
     * 组装基本部分的函数代码 包括读入-导出等
     * 
     * @returns [base, output]
     */
    function baseCodes() {
        let base = '', output = '';
        const libraries = [
            'rENA', 'rJava', 'xlsx', 
            'htmltools', 'plotly', 'dplyr', 'lme4'];
        
        libraries.forEach(lib => {
            base += `library(${lib}, warn.conflicts=F)\n`;
        });
        base += '\n';

        // load xlsx
        base += note('读入xlsx编码结果数据');
        base += `STEM.data = read.xlsx("${rcodeConfig.dataPath}${rcodeConfig.dataName}", 1)\n\n`;

        // output html
        output += `\nsetwd("../output")\n`;
        output += `htmlwidgets::saveWidget(enaplot$plot, file="./${rcodeConfig.outputName}")\n`;
        return [base, output];
    }
    
    /**
     * 组装与参数设置部分相关的代码
     */
    function parameterCodes() {
        let codes = '';
        const parameter = gatherParameter();
        if (parameter.units.length) {
            codes += note('确定分析单位');
            codes += `units = STEM.data[,c(${decorateValues(parameter.units).join(',')})]\n\n`;
        }
        if (parameter.conversation.length) {
            codes += note('确定会话');
            codes += `conversation = STEM.data[,c(${decorateValues(parameter.conversation).join(',')})]\n\n`
        }
        if (parameter.codecols.length) {
            codes += note('确定讨论内容的编码方案');
            codes += `codeCols = c(${decorateValues(parameter.codecols).join(',')})\n`;
            codes += 'codes = STEM.data[,codeCols]\n\n';
        }
        if (parameter.windowsize) {
            codes += note(`计算累计邻接向量，定义节的大小是${parameter.windowsize}行`);
            codes += 'accum = ena.accumulate.data(';
            codes += 'units = units,conversation = conversation,codes = codes,';
            codes += `window.size.back = ${parameter.windowsize})\n\n`;
            
            codes += note('计算绘制网络图的相关参数');
            codes += 'set = ena.make.set(enadata = accum)\n\n';
        }
        return codes;
    }

    /**
     * 保存R代码相关的代码
     * 
     * @param {String} codes 代码的字符串内容
     */
    function saveCodes(codes) {
        const path = rcodeConfig.rPath + rcodeConfig.rName;
        $.get('./php/saver.php', {codes: codes, path: path}, res => {
            if (res) {
                console.log(res);
                trigger('prepareCodes', true);
            }
        });
    }

    /**
     * 生成R代码的完整实现
     */
    function generateRCodes() {
        let [str, output] = baseCodes();
        str += parameterCodes();
        // 涉及具体绘图设置的代码见typecodes.js
        str += typeCodes();
        str += output;
        saveCodes(str);
    }

    return generateRCodes;
})();
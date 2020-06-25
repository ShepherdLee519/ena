/*
 * @Author: Shepherd.Lee 
 * @Date: 2020-06-25 21:02:50 
 * @Last Modified by: Shepherd.Lee
 * @Last Modified time: 2020-06-25 22:20:03
 */

/*
 * 根据树形控件中的数据分析当前对应的绘图类型以及相关代码的生成
 */


const typeCodes = (function() {
    /**
     * 组装注释信息并返回
     * 
     * @param {String} info 注释内容
     */
    function note(info) {
        return `# ${info}\n`;
    }

    /**
     * 确认是否有选中某种类型的绘图设置
     * 
     * @param {Array<Object>} arr 树形结点的数据集合的数组 
     */
    function hasType(arr) {
        const types = ['net', 'mean', 'center'];
        const flags = [];
        types.forEach(type => {
            let flag = false;
            for (let i = 0; i < arr.length; i++) {
                if (arr[i]['check'][type]) {
                    flag = true;
                    break;
                }
            }
            flags.push(flag);
        });
        return flags;
    }

    /**
     * 根据筛选的数据对象进一步组装其数据
     * 
     * @param {Object} data 
     * @param {Number} level 
     */
    function filterTypeData(data, level) {
        let arr = [];
        arr.push(`classID==${data.classID}`);
        if (level >= 2) {
            arr.push(`gpID==${data.gpID}`);
        }
        if (level == 3) {
            arr.push(`gpNO==${data.gpNO}`);
        }
        return arr;
    }
    
    /**
     * 筛选指定层级的符合指定类型的对象
     * 
     * @param {Array<Object>} arr 
     * @param {Number} level 
     * @param {String} type net/mean/center 
     */
    function filterType(arr, level, type) {
        const targets = [];
        arr.forEach(data => {
            if (data.level == level) {
                if (data['check'][type]) {
                    targets.push({
                        data: filterTypeData(data, level),
                        color: data.color 
                    });
                }
            }
        });
        return targets;
    }


    /**
     * 获取当前的类型信息与相关的数据内容并返回
     * 
     * @example
     * {
     *      level: 3,
     *      classID: 1,
     *      gpID: 2,
     *      gpNO: 3,
     *      check: {
     *          net: true,
     *          mean: false,
     *          center: true
     *      },
     *      color: "#CCCCCC"
     * }
     */
    function getTypeInfo() {
        const treeNodesData = getAllTreeNodesData( $tree );
        const [hasNet, hasMean, hasCenter] = hasType(treeNodesData);
        
        /**
         * TODO:根据上三者的真值决定类型，此处待补充
         */
        let type = '';
        if (hasMean) type = 'mean';
        else if(hasCenter) type = 'center';

        /**
         * TODO:获取目标对象
         */
        // const targets = ['classID==1','classID==2'];

        return [
            type, // 类型
            filterType(treeNodesData, 1, type) // 目标对象
        ];
    }

    /**
     * 组装与类型(mean/net/center)相关的代码
     * 
     */
    function typeCodes() {
        let codes = '', rules = [],
            [type, targets] = getTypeInfo();
            
        codes += note('绘制各个分析单位的质心');
        targets.forEach( (target, index) => {
            codes += `target${index+1}.points = as.matrix(set$points${target.data.map(v=>`[${v}]`).join('')})\n`;
        });
        codes += '\n';

        switch(type) {
            case 'center': 
                codes += note('绘制网络图的质心');
                codes += 'enaplot = ena.plot(set, scale.to = "points", title = "Groups of Units")  %>%\n';
                targets.forEach( (target, index) => {
                    rules.push(`  ena.plot.points(points = target${index+1}.points, colors = c("${target.color}")) `);
                });
                codes += rules.join('%>%\n');
                codes += '\n';
                return codes;
            case 'mean':
                codes += note('绘制平均质心及置信区间');
                codes += 'enaplot = ena.plot(set, scale.to = "points", title = "Groups and Means")  %>%\n';
                targets.forEach( (target, index) => {
                    rules.push(`  ena.plot.points(points = target${index+1}.points, confidence.interval = "box", colors = c("${target.color}")) `);
                    rules.push(`  ena.plot.group(point = target${index+1}.points, colors =c("${target.color}"), confidence.interval = "box") `);
                });
                codes += rules.join('%>%\n');
                codes += '\n';
                return codes;
            default: 
                console.error(`Wrong type! <${type}>`);
        }

        return codes;
    }

    return typeCodes;
})();
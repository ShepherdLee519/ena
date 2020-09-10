/*
 * @Author: Shepherd.Lee 
 * @Date: 2020-06-25 21:02:50 
 * @Last Modified by: Shepherd.Lee
 * @Last Modified time: 2020-08-15 03:19:57
 */

/*
 * 根据树形控件中的数据分析当前对应的绘图类型以及相关代码的生成
 */
const typeCodes = (function() {
    /**
     * 保存net/mean/center对应绘制设置与否的公有变量
     */
    let hasNet, hasMean, hasCenter;
    /**
     * 保存的本地所有树结点数据的公用变量
     */
    let treeNodesData;

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
     * @returns [hasNet, hasMean, hasCenter]
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
     * 获取当前的类型信息与相关的数据内容并返回
     */
    function getTypeInfo() {
        [hasNet, hasMean, hasCenter] = hasType(treeNodesData);
        let type = '';
        if (hasNet && hasMean) type = 'net_mean';
        else if (hasNet) type = 'net';
        else if (hasMean) type = 'mean';
        else type = 'center';  
        return type;
    }

    /**
     * 将树结点对象转为规则对象并返回
     * 
     * @example
     * {floor:2,type:'gpID',value:'1',...}
     *      =>
     * {target: '[classID==1][gpID==1]', color:'#CCCCCC'}
     * @param {Object} data 
     * @param {Number} i 
     */
    function toRuleData(data, i) {
        const ruleData = {
            target: '',
            color: data.color
        };
        let floor = data.floor;
        const targets = [];
        targets.push({
            type: data.type,
            value: data.value
        });
        // 将该结点的父级信息也加入数组
        while(floor) {
            floor--;
            for (let pos = i - 1; pos >= 0; pos--) {
                if (treeNodesData[pos].floor == floor) {
                    targets.push({
                        type: treeNodesData[pos].type,
                        value: treeNodesData[pos].value
                    });
                    break;
                }
            } // end for
        } // end while
        for (let j = 0; j < targets.length; j++) {
            targets[j] = `${targets[j].type}=='${targets[j].value}'`;
        }
        ruleData.target = targets.reverse().map(v => `[${v}]`).join('');
        return ruleData;
    }

    /**
     * 将树结点对象中的center数据转为规则对象并返回
     * 
     * @param {Array<Object>} arr 复制的树节点数据数组
     * @param {Number} i 当前处理的center目标的index
     */
    function toRuleCenterData(arr, i) {
        const ruleData = {
            target: '',
            color: arr[i].color
        };
        let floor = arr[i].floor;
        const targets = [];
        targets.push(
            `${arr[i].type}=='${arr[i].value}'`
        );
        // 处理其子节点中的非规则
        let flag = i < arr.length - 1 && arr[i + 1].floor > floor; // 是否需要处理子节点
        let bound = i + 1;
        if (flag) {
            // 更新边界为下一个同级节点位置
            for (let j = i + 1; j < arr.length; j++) {
                if (arr[j].floor <= floor) {
                    bound = j;
                    break;
                }
            } // end for
            if (bound == i + 1) bound = arr.length;
        } // end if

        /**
         * 返回pos位置对应的Center的“非”规则
         * 
         * @param {Number} pos 
         */
        function makeCenterRule(pos) {
            let rule = [];
            let floor = arr[pos].floor;
            for (let j = pos; j >= i; j--) {
                if (arr[j].floor == floor) {
                    rule.push(
                        `${arr[j].type}=='${arr[j].value}'`
                    );
                    floor--;
                } // end if
            } // end for
            let content = rule.reverse().join(' & ');
            return `!(${content})`;
        }

        /**
         * 删除pos位置节点的子节点\
         * 同时需要删除pos位置的节点本身
         * 
         * @param {Number} pos 
         */
        function adjustArr(pos) {
            const floor = arr[pos].floor;
            if (pos == arr.length - 1 || 
                arr[pos + 1].floor <= floor) {
                // 无后继节点下，只需删除节点本身
                arr.splice(pos, 1);
                bound--;
                return;
            }
            let from = pos, num = 1;
            for (let j = pos + 1; j < bound; j++) {
                if (arr[j].floor > floor) {
                    num++;
                } else if (arr[j].floor == floor) {
                    break;
                }
            }
            arr.splice(from, num);
            bound -= num;
            return;
        }

        while(flag) { // 存在子树节点
            floor++;
            flag = false;
            for (let j = i + 1; j < bound; j++) {
                if (arr[j].floor == floor) {
                    flag = true; // 存在子树结点
                    if ( !arr[j]['check']['center'] ) {
                        targets.push(makeCenterRule(j));
                        adjustArr(j); // 删除该子节点及其后继子节点
                        break;
                    }
                }
            } // end for
            for (let j = i + 1; j < bound; j++) {
                // 是否还存在该级floor待处理的非规则
                if (arr[j].floor == floor && 
                    !arr[j]['check']['center']) {
                    floor--;
                    break;
                }
            } // end for
        } // end while

        arr.splice(i, bound - i);
        ruleData.target = targets.map(v => `[${v}]`).join('');
        return ruleData;
    }

    /**
     * 从树结点数据数组中过滤指定类型的数据对象并组成数组返回
     * 
     * @example
     * [{
     *      target: '[classID==1][gpID==2][userName=='XX']',
     *      color: '#CCCCCC'
     * }]
     * @param {String} type net/mean/center
     */
    function filterTreeData(type) {
        const filteredData = [];
        if (type !== 'center') {
            treeNodesData.forEach( (data, i) => {
                if (data['check'][type]) {
                    filteredData.push(
                        toRuleData(data, i)
                    );
                }
            });
        } else {
            const cloneData = [...treeNodesData];
            let flag = true; // hasCenter
            do {
                flag = false;
                for (let i = 0; i < cloneData.length; i++) {
                    if (cloneData[i]['check']['center']) {
                        flag = true;
                        filteredData.push(
                            toRuleCenterData(cloneData, i)
                        );
                        break;
                    }
                }
            } while(flag);
        }
        return filteredData;
    }

    /**
     * 获取目标对象的数组数据
     * 
     * @param {String} type
     */
    function getTargets(type) {
        let [targets, centers] = [[], []];
        switch(type) {
            case 'mean':
            case 'net':
            case 'center':
                targets = filterTreeData(type);
                break;
            case 'net_mean':
                targets = [[], []];
                targets[0] = filterTreeData('net');
                targets[1] = filterTreeData('mean');
                break;
        }
        if (hasCenter && type !== 'center') {
            centers = filterTreeData('center');
        }
        return [targets, centers];
    }

    /**
     * 组装代码部分的质心设置\
     * 注意当type为net_mean时处理不同
     * 
     * @param {Array<Array<String>>} targets 
     * @param {Array<Array<String>>} centers 
     * @param {String} type 
     */
    function pointsCodes(targets, centers, type) {
        let codes = note('绘制各个分析单位的质心');
        if (type !== 'net_mean') {
            // net or mean
            targets.forEach( (target, index) => {
                codes += `target${index+1}.points = as.matrix(set$points${target.target})\n`;
            });
        } else {
            // net 对应的数据
            targets[0].forEach( (target, index) => {
                codes += `target0${index+1}.points = as.matrix(set$points${target.target})\n`;
            });
            // mean 对应的数据
            targets[1].forEach( (target, index) => {
                codes += `target1${index+1}.points = as.matrix(set$points${target.target})\n`;
            });
        }
        if (hasCenter && type !== 'center') {
            centers.forEach( (center, index) => {
                codes += `center${index+1}.points = as.matrix(set$points${center.target})\n`;
            });
        }
        codes += '\n';
        return codes;
    }

    /**
     * 组装代码中关于网络图边权重等的设置(仅当type为net或net_mean)
     * 
     * @param {Array<Array<String>>} targets
     * @param {String} type 
     */
    function edgeCodes(targets, type) {
        if (type !== 'net' && type !== 'net_mean') return '';
        let codes = note('网络图所有边的权重');
        if (type === 'net') {
            targets.forEach( (target, index) => {
                codes += `target${index+1}.lineweights = as.matrix(set$line.weights${target.target})\n`;
            });
            codes += '\n' + note('计算所有分析单位在每条边的平均权重');
            targets.forEach( (_, index) => {
                codes += `target${index+1}.mean = as.vector(colMeans(target${index+1}.lineweights))\n`;
            });
            if (targets.length == 2) {
                codes += '\n' + note('每条边的权重差');
                codes += 'subtracted.mean = target1.mean - target2.mean';
            }
        } else if (type === 'net_mean') {
            targets[0].forEach( (target, index) => {
                codes += `target0${index+1}.lineweights = as.matrix(set$line.weights${target.target})\n`;
            });
            codes += '\n' + note('计算所有分析单位在每条边的平均权重');
            targets[0].forEach( (_, index) => {
                codes += `target0${index+1}.mean = as.vector(colMeans(target0${index+1}.lineweights))\n`;
            });
            if (targets[0].length == 2) {
                codes += '\n' + note('每条边的权重差');
                codes += 'subtracted.mean = target01.mean - target02.mean\n';
            }
        }
        codes += '\n';
        return codes;
    }

    /**
     * 组装代码中关于具体的绘图设置的代码
     * 
     * @param {Array<Array<String>>} targets
     * @param {Array<Array<String>>} centers 
     * @param {String} type 
     */
    function plotCodes(targets, centers, type) {
        const title = $('#plotTitle').val() || $('#plotTitle').attr('placeholder');
        let rules = [];
        let codes = (type === 'net' || type === 'net_mean') ?
            `enaplot = ena.plot(set, font.size=15, title = "${title}")  %>%\n`:
            `enaplot = ena.plot(set, font.size=15, scale.to = "points", title = "${title}")  %>%\n`;

        /**
         * 根据centers数组去修改rules
         */
        function addCentersRule() {
            if (hasCenter && type !== 'center') {
                centers.forEach( (center, index) => {
                    rules.push(`  ena.plot.points(points = center${index+1
                        }.points, colors = c("${center.color}")) `);
                });
            }
        }
        
        switch (type) {
            case 'center':
                targets.forEach( (target, index) => {
                    rules.push(`  ena.plot.points(points = target${index+1}.points, colors = c("${target.color}")) `);
                });
                codes += rules.join('%>%\n');
                codes += '\n';
                break;
            case 'mean':
                targets.forEach( (target, index) => {
                    rules.push(`  ena.plot.group(point = target${index+1
                        }.points, colors = c("${target.color}"), confidence.interval = "box") `);
                });
                addCentersRule();
                codes += rules.join('%>%\n');
                codes += '\n';
                break;
            case 'net':
                if (targets.length == 1) {
                    rules.push(`  ena.plot.network(network = target1.mean, colors = c("${targets[0].color}"))`);
                } else {
                    console.log('net - subtracted!');
                    rules.push(`  ena.plot.network(network = subtracted.mean *8, colors = c("${
                        targets[0].color}","${targets[1].color}"))`);
                }
                addCentersRule();
                codes += rules.join('%>%\n');
                codes += '\n';
                break;
            case 'net_mean':
                targets[1].forEach( (target, index) => {
                    rules.push(`  ena.plot.group(point = target1${index+1
                        }.points, colors = c("${target.color}"), confidence.interval = "box") `);
                });
                addCentersRule();
                codes += rules.join('%>%\n');
                codes += '%>%\n';
                if (targets[0].length == 1) {
                    codes += `  ena.plot.network(network = target01.mean, colors = c("${targets[0][0].color}"))`;
                } else {
                    codes += `  ena.plot.network(network = subtracted.mean *8, colors = c("${targets[0][0].color}","${targets[0][1].color}"))`;
                }
                break;
        }

        return codes;
    }

    /**
     * 组装并返回具体的绘图代码
     */
    function typeCodes() {
        treeNodesData = getAllTreeNodesData();
        const type = getTypeInfo();
        const [targets, centers] = getTargets(type);
        let str = '';
        str += pointsCodes(targets, centers, type);
        str += edgeCodes(targets, type);
        str += plotCodes(targets, centers, type);
        return str;
    }

    return typeCodes;
})();
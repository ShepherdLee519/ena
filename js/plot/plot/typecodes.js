/*
 * @Author: Shepherd.Lee 
 * @Date: 2020-06-25 21:02:50 
 * @Last Modified by: Shepherd.Lee
 * @Last Modified time: 2020-06-30 02:32:12
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
     * 组装筛选规则并返回
     * 
     * @param {Array<String>} target 
     */
    function join(target) {
        return target.map(v=>`[${v}]`).join('');
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
     * 
     * @param {Array<Object>} treeNodesData
     */
    function getTypeInfo(treeNodesData) {
        const [hasNet, hasMean, hasCenter] = hasType(treeNodesData);
        let type = '';
        if ( !hasCenter ) type = 'nocenter';
        else if (hasNet && hasMean) type = 'net_mean';
        else if (hasNet) type = 'net';
        else if (hasMean) type = 'mean';
        else type = 'center';  
        return type;
    }

    /**
     * 将对象转换为对应的R筛选规则字符串
     * 
     * @example
     * {classID:1, gpID: 2, level: 2} => "classID==1", "gpID==2"
     * @param {Boolean} init 是否为初始化使用的 - 是则加入classID
     * @param {Array<String>} arr 修改的 Targets数组的子数组对象
     * @param {Object} obj 目标数据对象(树结点数据)
     * @param {Boolean} remove = false 是否是删除的筛选规则
     */
    function transformRule(init, arr, obj, remove = false) {
        const level = obj.level;
        if (remove) {
            if (level == 2) {
                arr.push(`gpID!=${obj.gpID}`);
            } else if (level == 3) {
                arr.push(`!(gpID==${obj.gpID} & gpNO==${obj.gpNO})`);
            }
        } else {
            if (init) arr.push(`classID==${obj.classID}`);
            if (level >= 2) arr.push(`gpID==${obj.gpID}`);
            if (level == 3) arr.push(`gpNO==${obj.gpNO}`);
        }
    }

    /**
     * 从树结点数据数组中过滤指定类型的数据对象并组成数组返回
     * 
     * @param {Array<Object>} treeNodesData 
     * @param {String} type net/mean/center
     */
    function filterTreeData(treeNodesData, type) {
        const filteredData = [];
        treeNodesData.forEach(data => {
            if (data['check'][type]) {
                filteredData.push(data);
            }
        });
        if (type === 'center') {
            const filteredCenterData = [];
            let classIDs = [];
            filteredData.forEach(data => {
                if (data.level == 1) {
                    classIDs.push(data.classID);
                    filteredCenterData.push(data);
                    groupIDs = [];
                } else if (data.level == 2) {
                    if ( !~classIDs.indexOf(data.classID) ) {
                        filteredCenterData.push(data);
                    }
                }
            });
            return filteredCenterData;
        }
        return filteredData;
    }

    /**
     * 从结点数据中进一步过滤规则
     * 
     * @param {Array<Object>} treeNodesData 
     * @param {Array<String>} arr 
     * @param {Object} obj 
     */
    function filterNodeData(treeNodesData, arr, obj) {
        /**
         * 过滤指定classID下的组，识别center的选中情况
         * 
         * @param {Array<String>} arr
         * @param {Array<Object>} treeNodesData 
         * @param {String} classID 
         */
        function filterGroups(arr, treeNodesData, classID) {
            // center 为true的group加入，准备进一步筛选members
            let groups = [];
            treeNodesData.forEach(data => {
                if (data.level == 2 && data.classID == classID) {
                    if (data['check']['center']) groups.push(data);
                    else transformRule(false, arr, data, true);
                }
            });
            // 进一步筛选groups下的members
            groups.forEach(group => {
                filterMembers(arr, treeNodesData, group.classID, group.gpID); 
            });
        }

        /**
         * 过滤指定classID，gpID下的成员，识别center的选中情况
         * 
         * @param {Array<String>} arr 
         * @param {Array<Object>} treeNodesData 
         * @param {String} classID 
         * @param {String} gpID 
         */
        function filterMembers(arr, treeNodesData, classID, gpID) {
            treeNodesData.forEach(data => {
                if (data.level == 3 && 
                    data.classID == classID && data.gpID == gpID) {
                    if ( !data['check']['center'] ) transformRule(false, arr, data, true);
                }
            });
        }

        if (obj.level == 1) {
            filterGroups(arr, treeNodesData, obj.classID);
        } else if (obj.level == 2) {
            filterMembers(arr, treeNodesData, obj.classID, obj.gpID);
        }
    }

    /**
     * 获取目标对象的数组数据
     * 
     * @param {Array<Object>} treeNodesData
     * @param {String} type
     */
    function getTargets(treeNodesData, type) {
        const targets = [];
        targets.colors = [];
        switch (type) {
            case 'mean':
            case 'net':
            case 'center':
                let datas = filterTreeData(treeNodesData, type);
                datas.forEach(data => {
                    let arr = [];
                    transformRule(true, arr, data);
                    filterNodeData(treeNodesData, arr, data);
                    targets.push(arr);
                    targets.colors.push(data.color);
                });
                break;
            case 'net_mean':
                let net_datas = filterTreeData(treeNodesData, 'net'),
                    mean_datas = filterTreeData(treeNodesData, 'mean');
                targets.push([], []);
                targets.colors.push([], []);
                net_datas.forEach(data => {
                    let arr = [];
                    transformRule(true, arr, data);
                    filterNodeData(treeNodesData, arr, data);
                    targets[0].push(arr);
                    targets.colors[0].push(data.color);
                });
                mean_datas.forEach(data => {
                    let arr = [];
                    transformRule(true, arr, data);
                    filterNodeData(treeNodesData, arr, data);
                    targets[1].push(arr);
                    targets.colors[1].push(data.color);
                });
                break;
        }
        return targets;
    } 

    /**
     * 组装代码部分的质心设置\
     * 注意当type为net_mean时处理不同
     * 
     * @param {Array<Array<String>>} targets 
     * @param {String} type 
     */
    function pointsCodes(targets, type) {
        let codes = note('绘制各个分析单位的质心');
        if (type !== 'net_mean') {
            targets.forEach( (target, index) => {
                codes += `target${index+1}.points = as.matrix(set$points${join(target)})\n`;
            });
        } else {
            // net 对应的数据
            targets[0].forEach( (target, index) => {
                codes += `target0${index+1}.points = as.matrix(set$points${join(target)})\n`;
            });
            // mean 对应的数据
            targets[1].forEach( (target, index) => {
                codes += `target1${index+1}.points = as.matrix(set$points${join(target)})\n`;
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
        console.log(type);
        let codes = note('网络图所有边的权重');
        if (type === 'net') {
            targets.forEach( (target, index) => {
                codes += `target${index+1}.lineweights = as.matrix(set$line.weights${join(target)})\n`;
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
                codes += `target0${index+1}.lineweights = as.matrix(set$line.weights${join(target)})\n`;
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
     * @param {String} type 
     */
    function plotCodes(targets, type) {
        const title = $('#plotTitle').val() || $('#plotTitle').attr('placeholder');
        let rules = [];
        let codes = (type === 'net' || type === 'net_mean') ?
            `enaplot = ena.plot(set, title = "${title}")  %>%\n`:
            `enaplot = ena.plot(set, scale.to = "points", title = "${title}")  %>%\n`;
        switch (type) {
            case 'center':
                targets.forEach( (_, index) => {
                    rules.push(`  ena.plot.points(points = target${index+1}.points, colors = c("${targets.colors[index]}")) `);
                });
                codes += rules.join('%>%\n');
                codes += '\n';
                break;
            case 'mean':
                targets.forEach( (_, index) => {
                    rules.push(`  ena.plot.points(points = target${index+1
                        }.points, confidence.interval = "box", colors = c("${targets.colors[index]}")) `);
                    rules.push(`  ena.plot.group(point = target${index+1
                        }.points, colors = c("${targets.colors[index]}"), confidence.interval = "box") `);
                });
                codes += rules.join('%>%\n');
                codes += '\n';
                break;
            case 'net':
                if (targets.length == 1) {
                    codes += `  ena.plot.points(points = target1.points, colors = c("${targets.colors[0]}")) %>%`;
                    codes += `  ena.plot.network(network = target1.mean, colors = c("${targets.colors[0]}"))\n`;
                } else {
                    codes += `  ena.plot.points(points = target1.points, colors = c("${targets.colors[0]}")) %>%`;
                    codes += `  ena.plot.points(points = target2.points, colors = c("${targets.colors[1]}")) %>%`;
                    codes += `  ena.plot.network(network = subtracted.mean *8, colors = c("${targets.colors[0]}","${targets.colors[0]}"))\n`;
                }
                break;
            case 'net_mean':
                targets[1].forEach( (_, index) => {
                    rules.push(`  ena.plot.points(points = target1${index+1
                        }.points, confidence.interval = "box", colors = c("${targets.colors[1][index]}")) `);
                    rules.push(`  ena.plot.group(point = target1${index+1
                        }.points, colors = c("${targets.colors[1][index]}"), confidence.interval = "box") `);
                });
                codes += rules.join('%>%\n');
                codes += '%>%\n';
                if (targets[0].length == 1) {
                    codes += `  ena.plot.network(network = target01.mean, colors = c("${targets.colors[0][0]}"))`;
                } else {
                    codes += `  ena.plot.network(network = subtracted.mean *8, colors = c("${targets.colors[0][0]}","${targets.colors[0][1]}"))`;
                }
                break;
        }
        return codes;
    }

    function typeCodes() {
        const treeNodesData = getAllTreeNodesData( $tree );
        const type = getTypeInfo(treeNodesData);
        const targets = getTargets(treeNodesData, type);
        let str = '';
        str += pointsCodes(targets, type);
        str += edgeCodes(targets, type);
        str += plotCodes(targets, type);
        return str;
    }

    return typeCodes;
})();
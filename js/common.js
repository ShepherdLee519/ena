/*
 * @Author: Shepherd.Lee 
 * @Date: 2020-06-14 17:13:08 
 * @Last Modified by: Shepherd.Lee
 * @Last Modified time: 2020-06-14 20:29:53
 */

/* 自定义的辅助函数:
 *
 * isundef()
 * exClass()
 * replaceClass()
 * hide() - show()
 * delegate()
 * listen() - trigger()
 * multistep()
 * getQuery() - saveQuery()
 * saveLocation() - toLocation()
 */


/*----------------对象相关-------------------*/
/**
 * 判断某个js对象是否为undefined的简写
 * 
 * @param {Object} target 检查对象
 * @returns {Boolean} true-是undefined
 */
function isundef(target) {
    return target === void 0;
}

/*----------------样式相关-------------------*/
/**
 * 交换两个对象的某个类 结果只有其中一个对象有目标类
 * 
 * @param {Object} $nodeA jQuery对象 
 * @param {Object} $nodeB jQuery对象 
 * @param {String} classname 
 */
function exClass( $nodeA, $nodeB, classname ) {
    if ( $nodeA.hasClass(classname) ){
        $nodeA.removeClass(classname);
        $nodeB.addClass(classname);
    } else if ( $nodeB.hasClass(classname) ) {
        $nodeB.removeClass(classname);
        $nodeA.addClass(classname);
    }
}

/**
 * 目标对象删去A类 换上B类
 * 
 * @param {Object} $node jQuery对象
 * @param {String} classA
 * @param {String} classB
 */
function replaceClass( $node, classA, classB ) {
    $node.removeClass(classA).addClass(classB);
}

/**
 * addClass("hidden") 的简写\
 * 可适用于节点数组 - 默认传入jQuery对象
 * 
 * @param {Object} $node 
 */
function hide( $node ) {
    if ( !Array.isArray( $node ) ) {
        $node.addClass('hidden');
    } else {
        $node.forEach( $target => {
            $target.addClass('hidden');
        });
    }
    return { show: show };
}

/**
 * removeClass("hidden") 的简写\
 * 可适用于节点数组 - 默认传入jQuery对象
 * 
 * @param {Object} $node 
 */
function show( $node ) {
    if ( !Array.isArray( $node ) ) {
        $node.removeClass('hidden');
    } else {
        $node.forEach( $target => {
            $target.removeClass('hidden');
        });
    }
    return { hide: hide };
}

/*----------------事件相关-------------------*/
/**
 * 在指定对象上委托多个事件的简写
 * 
 * @example
 * delegate($(target), {
 *      target: ".classname",
 *      event: "click",
 *      handler: handler
 * });
 * @param {Object} $target 
 * @param {Object} handlerObjs - target/event/handler
 */
function delegate( $target, handlerObjs ) {
    handlerObjs = ( !Array.isArray(handlerObjs) ) ? 
        [handlerObjs] : handlerObjs;
    
    handlerObjs.forEach(obj => { 
        if( !Array.isArray(obj.target) ) {
           $target.delegate(
                obj.target, obj.event, obj.handler
            ); 
        } else {
            obj.target.forEach(target => {
                $target.delegate(
                    target, obj.event, obj.handler
                );
            });
        }
    })
}

/**
 * 在document上监听事件
 * 
 * @param {String} eventType 监听的事件类型
 * @param {Function} fn 事件函数
 * @param {Array} args = [] 事件函数的参数
 */
function listen(eventType, fn, args = []) {
    $(document).bind(eventType, function() {
        fn.apply(null, args);
    });
}

/**
 * 在document上触发事件
 * 
 * @param {String} eventType 触发的事件类型
 * @param {Boolean} hold = false 默认不保持，即触发后就取消绑定
 */
function trigger(eventType, hold = false) {
    $(document).trigger(eventType);
    if ( !hold ) $(document).unbind(eventType);
}

/*----------------事件相关-------------------*/
/**
 * 分割任务异步调用的公用方法
 * 
 * @param {Array<Function>} steps 调用的函数数组
 * @param {Array<Array<*>>} argsArray 每个函数对应的参数列表的数组
 */
function multistep(steps, argsArray = []) {
    for (let i = 0, len = steps.length; i < len; i++) {
        setTimeout(function(){
            steps[i].apply(null, argsArray[i] || []);
        }, 25);
    }
}

/*----------------URL相关-------------------*/
/**
 * 根据变量名查询querystring值\
 * 默认情况下(无变量名)返回querystring的键值对对象
 * 
 * @param {String} variable = null 变量名 
 * @returns {Object} 键值对对象或某个键对应的值
 */
function getQuery(variable = null) {
    let querys = window.location.search.slice(1).split('&'),
        obj = {};

    querys.forEach(query => {
        query = query.split('=');
        obj[query[0]] = query[1];
    });
    return variable ? obj[variable] : obj;
}

/**
 * 将键值以key=value的格式存入location.search\
 * 有则修改，无则添加
 * 
 * @param {String} key 
 * @param {*} value 
 * @param {Boolean} refresh = false 默认不刷新
 */
function saveQuery(key, value, refresh = false) {
    let location = window.location,
        search = location.search,
        querystring = '',
        querys = location.search.slice(1).split('&');
    
    if (search === ''){
        querystring = `?${key}=${value}`;
    } else {
        if ( ~search.indexOf(key) ) {
            for (let i = 0; i < querys.length; i++){
                if ( ~querys[i].indexOf(key) ) {
                    querys[i] = `${key}=${value}`;
                    break;
                }
            }
            querystring = '?' + querys.join('&');
        } else {
            querystring = search + `&${key}=${value}`;
        }
    }
    saveLocation(refresh, querystring, {key:key, value:value});
}

/**
 * 保存search变化的工具函数\
 * 使用window.location.search 会触发刷新\
 * 使用history.pushState 不会刷新
 * 
 * @param {Boolean} refresh true - 刷新/false - 使用history 
 * @param {String} querystring 
 * @param {Object} data = null history.pushState中的对象
 */
function saveLocation(refresh, querystring, data = null) {
    if (refresh) {
        window.location.search = querystring;
    } else {
        history.pushState(data, '', querystring);
    }
}

/**
 * 根据传入的querystring对象组装url并跳转
 * 
 * @example
 * //http://localhost/AniNavi/index.php?page=1&year=2020&month=1
 * toLocation({page:1, year:2020, month:1})
 * @param {Array<Object>} queryObj querystring对象
 * @param {Boolean} refresh = false 默认不刷新
 */
function toLocation(queryObj, refresh = false) {
    let querys = [], querystring = '?';
    
    for (let key in queryObj) {
        querys.push(`${key}=${queryObj[key]}`);
    }
    querystring += querys.join('&');
    saveLocation(refresh, querystring, queryObj);
}
/*
 * @Author: Shepherd.Lee 
 * @Date: 2020-06-14 17:34:02 
 * @Last Modified by: Shepherd.Lee
 * @Last Modified time: 2020-06-25 22:26:39
 */

/*
 * 上传xlsx文件的逻辑实现，具体调用见handlers.js中的事件绑定
 */


/**
 * 上传 xlsx 的事件处理函数
 * 
 * @param {String} type data/dictionary/encode 
 */
function upload(type) {
    const $file = $(`#upload${type}-file`);
    const $form = $('#buttonZone form');

    $file.off('change').change( () => {
        // 组装用于post的表单数据对象
        const formData = new FormData( $form[0] );
        formData.append('type', type);

        // 上传的ajax操作
        $.ajax({
            type: 'POST', 
            url:'./php/upload.php',
            data: formData, 
            cache: false, 
            dataType: 'json', 
            contentType: false, 
            processData: false,
            success: function(res) {
                if (res) {
                    alert('上传成功!');
                    // 即上传的为数据时，需要重置筛选选项
                    if (type === 'data') resetFilterOptions();
                    $(`#load${type}`).click();
                }
                else alert('发生问题，请重新尝试!');
            }
        }); // end ajax
    });
    $file.click(); // 触发上传文件的文件系统文件选择界面
}
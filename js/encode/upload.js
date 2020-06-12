/**
 * 上传 xlsx 的事件处理函数
 * 
 * @param {String} type data/dictionary/encode 
 */
function upload(type) {
    $file = $(`#upload${type}-file`);
    $form = $('#formZone form');

    $file.off('change').change( () => {
        // 组装用于post的表单数据对象
        const formData = new FormData( $form[0] );
        formData.append('type', type);

        // 上传的ajax操作
        $.ajax({
            type: 'POST', url:'./php/upload.php',
            data: formData, cache: false, dataType: 'json',
            contentType: false, processData: false,
            success: function(res) {
                if (res) {
                    alert('上传成功!');
                    if (type === 'data') resetFilterOptions();
                }
                else alert('发生问题，请重新尝试!');
            }
        }); // end ajax
    });
    $file.click();
}
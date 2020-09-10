<?php

$type = $_POST['type'];
$filename = $type.'.csv';

$str = 'upload'.$type; // name(input)
$FILE_PATH = '../xlsx/';

if ( $_FILES[$str]['error'] > 0) {
    die(0);
}

setlocale(LC_ALL, 'zh_CN.UTF8'); // 设置编码格式否则中文文件乱码
$upload_file = $FILE_PATH.''.$filename;

if (is_uploaded_file( $_FILES[$str]['tmp_name'] )) {
    if ( !move_uploaded_file(
            $_FILES[$str]['tmp_name'], 
            iconv('UTF-8','gb2312', $upload_file)
        )) {
        echo 0;
    }
}

echo 1;

?>
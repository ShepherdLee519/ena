<?php 

$type = $_GET['type']; // data/dictionary/encode

// Step 1: 文件路径组装与句柄获取
$csvPath = '../xlsx/'.$type.'.csv';
if ( !file_exists( $csvPath ) ) {
    // 文件不存在则直接返回
    die(0);
}
$fp = fopen( $csvPath, 'r');

// Step 2: 数据逐行处理
$arr = array();
while ( ( $data = fgetcsv( $fp )) != false) {
    foreach ( $data as $key => $value) {
        $data[$key] = iconv('gb2312', 'utf-8', $value);
    }
   
    $arr[] = $data;
}

// Step 3: 善后与json数据返回
fclose( $fp );
echo json_encode( $arr );

?>
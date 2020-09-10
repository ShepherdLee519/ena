<?php 

require_once '../../php/helper.php';
$data = $_GET['data'];

// Step 1: 新建CSV文件并以a模式打开
$csv_file_name = 'table.csv';
$csv_path = '../data/';
$csv = $csv_path.''.$csv_file_name;

_deleteFile( $csv );
$fp = fopen( $csv , 'a');


// Step 2: 写入首行列名
$col_names = array();
foreach ( $data[0] as $key => $value ) {
    array_push( $col_names, iconv('utf-8', 'gbk', $key) );
}
fputcsv( $fp, $col_names );


// Step 3: 逐行写入剩余对象数据
$cnt = 0;
$limit = 2000;

foreach ( $data as $row) {
    $cnt++;
    if ( $limit == $cnt ) {
        ob_flush();
        flush();
        $cnt = 0;
    }

    foreach ( $row as $i => $v ) {
        $row[ $i ] = iconv('utf-8', 'gbk', $v);
    }

    fputcsv( $fp, $row );
}

// Step 4: 善后
fclose( $fp );
echo 1;

?>
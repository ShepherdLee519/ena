<?php 

require_once './helper.php';
$data = $_POST['data'];

// Step 1: 新建CSV文件并以a模式打开
$csv_file_name = 'encode.csv';
$csv_path = '../xlsx/';
$csv = $csv_path.''.$csv_file_name;
$fp = fopen( $csv , 'a');

// Step 2: 逐行写入剩余对象数据
foreach ( $data as $row) {
    foreach ( $row as $i => $v ) {
        $row[ $i ] = iconv('utf-8', 'gbk', $v);
    }

    fputcsv( $fp, $row );
}

// Step 3: 善后
fclose( $fp );
echo 1;

?>
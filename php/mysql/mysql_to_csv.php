<?php

require './mysqllink.php';
require_once '../helper.php';

$classid = $_GET['classid'];
$groupid = $_GET['groupid'];

header('Content-Type: application/vnd.ms-excel');
header('Content-Disposition: attachment;');
header('Cache-Control: max-age=0');

// Step 1: 从数据库拉数据
$json = "";
$data = array();

$sql = "SELECT timeStamp, classid as classID, groupid as gpID, 
    groupNO as gpNO, username as userName, actiontype as actionType, 
    taskid as taskID, content as Content
    FROM log
    WHERE actiontype = 'ChatMsg'
";

if ( $classid[0] === 'all' && $groupid[0] === 'all') {
    // empty
}
else if ( $groupid[0] === 'all' ) {
    if (count( $classid ) == 1) {
        $sql .= " AND classid = ".$classid[0];
    } else {
        $sql .= " AND (classid = ".$classid[0];
        for ( $i = 1; $i < count( $classid ); $i++) {
            $sql .= " OR classid = ".$classid[$i];
        }
        $sql .= ")";
    }
}
else if ( $classid[0] == 'all') {
    if (count( $groupid ) == 1) {
        $sql .= " AND groupid = ".$groupid[0];
    } else {
        $sql .= " AND (groupid = ".$groupid[0];
        for ( $i = 1; $i < count( $groupid ); $i++) {
            $sql .= " OR groupid = ".$groupid[$i];
        }
        $sql .= ")";
    }
} else {
    if (count($classid) == 1) {
        $sql .= " AND classid = ".$classid[0];
    } else {
        $sql .= " AND (classid = ".$classid[0];
        for ( $i = 1; $i < count($classid); $i++) {
            $sql .= " OR classid = ".$classid[$i];
        }
        $sql .= ")";
    }
    if (count($groupid) == 1) {
        $sql .= " AND groupid = ".$groupid[0];
    } else {
        $sql .= " AND (groupid = ".$groupid[0];
        for ( $i = 1; $i < count($groupid); $i++) {
            $sql .= " OR groupid = ".$groupid[$i];
        }
        $sql .= ")";
    }
}

$result = mysqli_query( $link, $sql );


// Step 2: 新建CSV文件并以a模式打开
$csv_file_name = 'data.csv';
$csv_path = '../../xlsx/';
$csv = $csv_path.''.$csv_file_name;

_deleteFile( $csv );
$fp = fopen( $csv , 'a');


// Step 3: 写入首行列名
$fieldinfo = mysqli_fetch_fields( $result );
$col_names = array();
foreach ( $fieldinfo as $val ) {
    array_push( $col_names, $val->name );
}
fputcsv( $fp, $col_names );


// Step 4: 逐行写入剩余数据
$cnt = 0;
$limit = 2000;

while ( $row = mysqli_fetch_array( $result, MYSQL_ASSOC) ) {
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


// Step 5: 善后处理
fclose( $fp );
mysqli_close( $link );
echo 1;

?>
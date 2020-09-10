<?php

// header("Content-Type:application/json");
require './mysqllink.php';

$classid = $_GET['classid'];
$groupid = $_GET['groupid'];

$json = "";
$data = array();

$query = "SELECT timeStamp, classid as classID, groupid as gpID, 
    groupNO as gpNO, username as userName, actiontype as actionType, 
    taskid as taskID, content as Content
    FROM log
    WHERE actiontype = 'ChatMsg'
";
if ( $classid[0] === 'all' && $groupid[0] === 'all') {
    // empty
}
else if ( $groupid[0] === 'all' ) {
    if (count($classid) == 1) {
        $query .= " AND classid = ".$classid[0];
    } else {
        $query .= " AND (classid = ".$classid[0];
        for ( $i = 1; $i < count($classid); $i++) {
            $query .= " OR classid = ".$classid[$i];
        }
        $query .= ")";
    }
}
else if ( $classid[0] == 'all') {
    if (count($groupid) == 1) {
        $query .= " AND groupid = ".$groupid[0];
    } else {
        $query .= " AND (groupid = ".$groupid[0];
        for ( $i = 1; $i < count($groupid); $i++) {
            $query .= " OR groupid = ".$groupid[$i];
        }
        $query .= ")";
    }
} else {
    if (count($classid) == 1) {
        $query .= " AND classid = ".$classid[0];
    } else {
        $query .= " AND (classid = ".$classid[0];
        for ( $i = 1; $i < count($classid); $i++) {
            $query .= " OR classid = ".$classid[$i];
        }
        $query .= ")";
    }
    if (count($groupid) == 1) {
        $query .= " AND groupid = ".$groupid[0];
    } else {
        $query .= " AND (groupid = ".$groupid[0];
        for ( $i = 1; $i < count($groupid); $i++) {
            $query .= " OR groupid = ".$groupid[$i];
        }
        $query .= ")";
    }
}

mysqli_query( $link, "set names 'utf8'"); // 在插入数据执行前添加

$result = mysqli_query( $link, $query );  

if ( $result ) {
    while ( $row = mysqli_fetch_array( $result, MYSQL_ASSOC) ) {
        $data[] = $row;
    }

    $json = json_encode( $data, JSON_UNESCAPED_UNICODE);
    echo $json;
}else{
    echo 0;
}

mysqli_close( $link );

?>
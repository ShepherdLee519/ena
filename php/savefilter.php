<?php

require_once './helper.php';

$classid = $_GET['classid'];
$groupid = $_GET['groupid'];

// Step 1: 读入json
$filter_path = '../data/filter.json';
$data = _jsonin( $filter_path );


// Step 2: 处理json - 保存classid与groupid数据
$classid_arr = array();
$groupid_arr = array();

for ( $i = 0; $i < count( $classid ); $i++) {
    if ( $classid[ $i ] !== 'all') {
        array_push( 
            $classid_arr, $classid[ $i ]
        );
    }
}

for ( $j = 0; $j < count( $groupid ); $j++) {
    if ( $groupid[ $j ] !== 'all') {
        array_push( 
            $groupid_arr, $groupid[ $j ]
        );
    }
}

$data['classid'] = $classid_arr;
$data['groupid'] = $groupid_arr;


// Step 3: 善后 - 保存json
_jsonout( $filter_path, $data );
echo 1;

?>
<?php 

$csvPath = '../../xlsx/data.csv';
$fp = fopen( $csvPath, 'r');

$arr = array();
while ( ( $data = fgetcsv( $fp )) != false) {
    foreach ( $data as $key => $value) {
        $data[$key] = iconv('gb2312', 'utf-8', $value);
    }
   

    // print_r( $data);
    $arr[] = $data;
}

// print_r( $arr );
echo json_encode( $arr );
fclose( $fp );

?>
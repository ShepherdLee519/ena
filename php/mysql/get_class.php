<?php

require './mysqllink.php';

$json = "";
$data = array();
$query = "SELECT DISTINCT classid
FROM log
WHERE actiontype = 'ChatMsg'
";

$result = mysqli_query( $link, $query );  

if ( $result ) {
    while ( $row = mysqli_fetch_array( $result, MYSQL_ASSOC) ) {
        $data[] = $row['classid'];
    }

    $json = json_encode( $data, JSON_UNESCAPED_UNICODE);
    echo $json;
}else{
    echo 0;
}

mysqli_close( $link );

?>
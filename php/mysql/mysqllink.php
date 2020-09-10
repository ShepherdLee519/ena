<?php

// -----------------mysql参数----------------------------------------------
// $servername = "47.96.146.26";
$servername = "localhost:3307";
$usern = "root";
// $passw = "B4F393c91945";
$passw = "hello";
$dbname = "database2";

// -----------------连接mysql服务器----------------------------------------------
$link = mysqli_connect( $servername, $usern, $passw );
$res = mysqli_set_charset( $link, 'utf8' );

// 选择数据库
mysqli_query( $link, 'use ' . $dbname );

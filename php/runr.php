<?php

// It will empty the output folder from the results of the previous simulation.
$files = glob('../output/*'); 
foreach( $files as $file ) { 
  if (is_file( $file ))
    unlink( $file ); 
}

// It will get the values submitted by the HTML form 
// and store it into variables to be passed as arguments required by R script
$colorA = $_GET["color1"];
$colorB = $_GET["color2"];

$RPath = "C:\\R\\R-4.0.0\\bin\\Rscript.exe";
$scriptPath = "C:\\wamp64\\www\\ena\\R\\";

function execR( $colorA, $colorB ) { 
    global $RPath;
    global $scriptPath;
    exec('"'.$RPath.'" '.$scriptPath.'ena.R '."$colorA $colorB");
    echo 1;
}

execR( $colorA, $colorB );

?>
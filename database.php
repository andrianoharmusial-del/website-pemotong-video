<?php

$hostname = "localhost";
$username = "root";
$password = "";
$database = "kode_user";

$db = new mysqli($hostname, $username, $password, $database);

if($db->connect_error) {
    echo "Gagal terhubung ke database";
    die("error!");
}

?>
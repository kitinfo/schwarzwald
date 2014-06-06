<?php
	$DB_HOST="fsmi-db";
	$DB_PORT="5432";
	$DB_NAME="proto";
	$DB_USER="proto";
	$DB_PASS="proto";

	try{
		$db=new PDO("pgsql:sslmode=require;host=".$DB_HOST.";port=".$DB_PORT.";dbname=".$DB_NAME.";user=".$DB_USER.";password=".$DB_PASS.";");
		$db->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_WARNING);
	}
	catch(PDOException $e){
		exit(json_encode(array("code" => 501, "message" => $e->getMessage())));
	}
?>

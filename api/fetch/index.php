<?php
	require("../db_conn.php");
	require("../read_post.php");

	//Fetch API Endpoint
	$retVal=array("code" => 200, "message" => "All is well.");

		switch($POST["content"]){
			case "lectures":
				$data=$db->query("SELECT vorlesung FROM public.klausuren GROUP BY vorlesung");
				//TODO: Error checking
				$retVal["content"]=$data->fetchAll(PDO::FETCH_COLUMN);
				break;
			case "professors":
				$data=$db->query("SELECT prof FROM public.klausuren GROUP BY prof");
				//TODO: Error checking
				$retVal["content"]=$data->fetchAll(PDO::FETCH_COLUMN);
				break;
			default:
				$retVal=array("code" => 503, "message" => "Invalid operation on endpoint.");
				break;
		}

	exit(json_encode($retVal));
?>

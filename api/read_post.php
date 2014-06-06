<?php
	$POST_RAW=file_get_contents("php://input");
	if(!empty($POST_RAW)){
		$POST=json_decode($POST_RAW, true);
		if($POST===NULL){
			exit(json_encode(array("code" => 502, "message" => "Failed to parse posted arguments.")));
		}
	}
?>

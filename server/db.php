<?php

/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */

require 'config.php';

//if (isset($user) && !empty($user)) {
$retVal['status'] = "no input (or buy id=0)";
$klausuren = $_GET['klausuren'];
    $vorlesungen = $_GET['vorlesungen'];
    $prof = $_GET['prof'];

    $db = new PDO('pgsql:host=' . $host . ';port=' . $port . ';dbname=' . $dbname . ';user=' . $user . ';password=' . $pass . 
';sslmode=require');
$db->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_WARNING);

	if (isset($klausuren)) {
	$retVal = getKlausuren($db, $klausuren);
    }
    if (isset($vorlesungen)) {
	$retVal["vorlesungen"] = getVorlesungen($db);
    }

    header("Access-Control-Allow-Origin: *");

echo json_encode($retVal);
    /* } else {

  header("WWW-Authenticate: Basic realm=\"FSMI DB Access (Invalid Credentials for " . $_SERVER['PHP_AUTH_USER'] . ")\"");
  header("HTTP/1.0 401 Unauthorized");

  echo '{"status": "wrong user/password"}';
  } */

function getKlausuren($db, $klausuren) {
    $retVal['status'] = "ok";

    $limit = $_GET['limit'];

    $begin = "SELECT id, vorlesung, datum, prof, kommentar, seiten FROM public.klausuren";

    if (isset($limit) && !empty($limit)) {
	$ende = " AND veraltet = false ORDER BY datum DESC LIMIT " . $limit;
    } else {
	$ende = " AND veraltet = false ORDER BY datum DESC";
    }


    if (empty($klausuren)) {
	$klausurenQuery = $begin . $ende;
	$stm = $db->prepare($klausurenQuery);
	$retVal['status'] = $stm->execute();
    } else {

	$klausurenQuery = $begin . " WHERE vorlesung ILIKE :p1" . $ende;

	$stm = $db->prepare($klausurenQuery);
	$klausurenMit = "%" . $klausuren . "%";
	$retVal['status'] = $stm->execute(array(
	    ":p1" => $klausurenMit
	));

    }

    $retVal['klausuren'] = $stm->fetchAll(PDO::FETCH_ASSOC);
    $stm->closeCursor();
    return $retVal;
}

function getVorlesungen($db) {

    return getGroup($db, "vorlesung");
}

function getProfs($db) {
    return getGroup($db, "prof");
}

function getGroup($db, $col) {
    $query = "SELECT " . $col . " FROM public.klausuren GROUP BY " . $col;

    $stmt = $db->query($query);

    $retVal = $stmt->fetchAll(PDO::FETCH_ASSOC);

    return $retVal;
}

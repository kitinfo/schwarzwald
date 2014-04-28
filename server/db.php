<?php

/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */

require 'config.php';
main();

abstract class TYPE {
    const PROTOCOL = 0;
    const EXAM = 1;
}


function main() {
    global $db, $output;

    // init
    $output = Output::getInstance();
    $db = new DB();

    // db connection
    if (!$db->connect()) {
	header("WWW-Authenticate: Basic realm=\"Garfield API Access (Invalid Credentials for " . $_SERVER['PHP_AUTH_USER'] . ")\"");
	header("HTTP/1.0 401 Unauthorized");

	die();
    }

    //klausuren
    if (isset($_GET["k"])) {
	$elem = new Klausuren();
	$output->add("type", TYPE::EXAM);
    }
    // protokolle
    else if (isset($_GET["p"])) {
	$output->add("type", TYPE::PROTOCOL);
	$elem = new Protokolle();
    } else {
	$output->write();
	die();
    }

    if (isset($_GET["search"])) {
	$elem->search($_GET["search"]);
    } else if (isset($_GET["vorlesungen"])) {
	$elem->getVorlesungen();
    } else if (isset($_GET["profs"])) {
	$elem->getProfs();
    } else {
	$elem->getAll();
    }

    $output->write();
}

class Klausuren {

    function search($klausuren) {
	global $db, $output, $orderBy;

	if (empty($klausuren)) {
	    return $this->getAll();
	} else {
	    $sql = "SELECT id, vorlesung, datum, prof, kommentar, seiten "
		    . "FROM public.klausuren WHERE vorlesung ILIKE :p1 AND "
		    . "veraltet = false";

	    $klausurenMit = "%" . $klausuren . "%";
	    $param = array(
		":p1" => $klausurenMit
	    );

	    if (isset($_GET["prof"]) && !empty($_GET["prof"])) {
		$sql .= " AND prof ILIKE :prof";
		$param[":prof"] = "%" . $_GET["prof"] . "%";
	    }
	    $db->setOrder("datum", "DESC");

	    $stm = $db->query($sql, $param);
	}
	$output->addStatus("search", $stm->errorInfo());
	if ($stm !== false) {

	    $output->add("search", $stm->fetchAll(PDO::FETCH_ASSOC));
	    $stm->closeCursor();
	}
    }

    public function getAll() {
	global $db, $output;

	$sql = "SELECT id, vorlesung, datum, prof, kommentar, seiten FROM "
		. "public.klausuren WHERE veraltet = false";
	$param = array();
	if (isset($_GET["prof"]) && !empty($_GET["prof"])) {
	    $sql .= " AND prof ILIKE :prof";
	    $param[":prof"] = $_GET["prof"];
	}

	$db->setOrder("datum", "DESC");
	$stm = $db->query($sql, $param);

	$output->addStatus("search", $stm->errorInfo());
	if ($stm !== false) {
	    $output->add("search", $stm->fetchAll(PDO::FETCH_ASSOC));
	    $stm->closeCursor();
	}
    }

    public function getVorlesungen() {
	$this->getGroups("vorlesung");
    }

    public function getProfs() {
	$this->getGroups("prof");
    }

    public function getGroups($col) {
	global $db, $output;

	$query = "SELECT " . $col . " FROM public.klausuren";
	$param = array();
	if (isset($_GET["vorlesung"]) && !empty($_GET["vorlesung"])) {
	    $query .= " WHERE vorlesung ILIKE :vorlesung";
	    $param[":vorlesung"] = "%" . $_GET["vorlesung"] . "%";
	}
	if (isset($_GET["prof"]) && !empty($_GET["prof"])) {
	    $query .= " WHERE prof ILIKE :prof";
	    $param[":prof"] = "%" . $_GET["prof"] . "%";
	}
	
	$query .= " GROUP BY " . $col;
	
	$stmt = $db->query($query, $param);

	$output->add($col, $stmt->fetchAll(PDO::FETCH_ASSOC));
    }

}

class Protokolle {

    public function parse($data) {
	
	$hashMap = array();
	
	
	foreach ($data as $elem) {
	    $id = $elem["id"];
	    if (!$hashMap[$elem["id"]]) {
		$hashMap[$elem["id"]] = $elem;
		$hashMap[$id]["prof"] = array($elem["prof"]);
		$hashMap[$id]["vorlesung"] = array($elem["vorlesung"]);
	    } else {
		$hashMap[$id]["prof"][] = $elem["prof"];
		$hashMap[$id]["vorlesung"][] = $elem["vorlesung"];
	    }
	}
	
	return $hashMap;
    }
    
    
    
    public function getAll() {

	global $db, $output;
	
	/*
	$query = "SELECT protokolle.id AS id, datum, seiten, dozent AS prof, vorlesung FROM protokolle"
	. " JOIN pruefungvorlesung"
		. " ON (protokollid = protokolle.id)"
	. " JOIN vorlesungen"
	    . " ON (vorlesungen.id = vorlesungsid)";
	*/
	
	$query = "SELECT protokolle.id AS id, datum, seiten, "
		. "string_agg(dozent, ', ') AS prof, "
		. "string_agg(vorlesung, ', ') AS vorlesung FROM protokolle"
	. " JOIN pruefungvorlesung"
	.	" ON (protokollid = protokolle.id)"
	. " JOIN vorlesungen"
	.	" ON (vorlesungen.id = vorlesungsid)";
	
	$db->setOrder("datum", "DESC");

	$param = array();
	if (isset($_GET["prof"]) && !empty($_GET["prof"])) {
	    $query .= " WHERE pruefername ILIKE :prof";
	    $param[":prof"] = "%" . $_GET["prof"] . "%";
	}
	
	$query .= " GROUP BY protokolle.id";

	$stm = $db->query($query, $param);

	$output->addStatus("search", $stm->errorInfo());
	if ($stm !== null) {

	    $output->add("search", $stm->fetchAll(PDO::FETCH_ASSOC));

	    $stm->closeCursor();
	}
    }

    public function search($search) {

	global $db, $output, $orderBy;

	if (empty($search)) {
	    return $this->getAll();
	} else {
	    $query = "SELECT protokolle.id AS id, datum, seiten, "
		. "string_agg(dozent, ', ') AS prof, "
		. "string_agg(vorlesung, ', ') AS vorlesung FROM protokolle"
	. " JOIN pruefungvorlesung"
	.	" ON (protokollid = protokolle.id)"
	. " JOIN vorlesungen" 
	.	" ON (vorlesungen.id = vorlesungsid)";

	    $searchNew = "%" . $search . "%";
	    $param = array(
		":vorlesung" => $searchNew
	    );

	    if (isset($_GET["prof"]) && !empty($_GET["prof"])) {
		$query .= " AND pruefername ILIKE :prof";
		$param[":prof"] = "%" . $_GET["prof"] . "%";
	    }
	    
	    $query .= " GROUP BY protokolle.id";
		
	    $query .= " HAVING string_agg(vorlesungen.vorlesung, ', ') ILIKE :vorlesung";
	    
	    $db->setOrder("datum", "DESC");
	    $stm = $db->query($query, $param);
	}
	$output->addStatus("search", $stm->errorInfo());
	if ($stm !== false) {

	    $output->add("search", $stm->fetchAll(PDO::FETCH_ASSOC));
	    $stm->closeCursor();
	}
    }

    public function getVorlesungen() {
	$this->getGroups("vorlesung", "vorlesung");
    }

    public function getProfs() {
	$this->getGroups("dozent", "prof");
    }

    public function getGroups($col, $table) {
	global $db, $output;

	if (isset($table) && !empty($table)) {
	    $erg = $col . " AS " . $table;
	} else {
	    $erg = $col;
	}
	/*
	$query = "SELECT " . $erg . " FROM protokolle JOIN gebiet ON "
		. "(protokolle.gebiet = gebiet.id) JOIN pruefungpruefer ON "
		. "(protokolle.id = protokollid) JOIN pruefer ON "
		. "(pruefungpruefer.prueferid = pruefer.id)";
		*/
	
	$query = "SELECT " . $erg . " FROM public.pruefungvorlesung "
		. "JOIN vorlesungen ON (vorlesungsid = vorlesungen.id)";
	
	$param = array();
	if (isset($_GET["vorlesung"]) && !empty($_GET["vorlesung"])) {
	    $query .= " WHERE vorlesung ILIKE :vorlesung";
	    $param[":vorlesung"] = "%" . $_GET["vorlesung"] . "%";
	}
	if (isset($_GET["prof"]) && !empty($_GET["prof"])) {
	    $query .= " WHERE dozent ILIKE :prof";
	    $param[":prof"] = "%" . $_GET["prof"] . "%";
	}
	
	$query .= " GROUP BY " . $col;
	

	$stmt = $db->query($query, $param);
	
	

	if (isset($table) && !empty($table)) {
	    $output->add($table, $stmt->fetchAll(PDO::FETCH_ASSOC));
	    $output->addStatus($table, $stmt->errorInfo());
	    return;
	}
	$output->addStatus($col, $stmt->errorInfo());
	$output->add($col, $stmt->fetchAll(PDO::FETCH_ASSOC));
	$stmt->closeCursor();
    }

}

class DB {

    private $db;
    private $order = "";

    function connect() {
	global $dbname, $user, $pass, $port, $host;

	try {
	    $this->db = new PDO('pgsql:host=' . $host . ';port=' . $port . ';dbname=' . $dbname . ';user=' . $user . ';password=' . $pass . ';sslmode=require');
	    $this->db->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_WARNING);
	} catch (PDOException $e) {


	    if (strpos($e->getMessage(), "user") !== false) {
		return false;
	    }
	    header("Status: 500 " . $e->getMessage());
	    echo $e->getMessage();
	    die();
	}

	return true;
    }

    function setOrder($tag, $order) {
	$this->order = " ORDER BY " . $tag . " " . $order;
    }

    function query($sql, $params) {
	global $output, $orderBy;

	if (strpos($sql, "SELECT") !== false) {

	    $sql .= $this->order;

	    if ($_GET["limit"] && !empty($_GET["limit"])) {
		$sql .= " LIMIT :limit";
		$params[":limit"] = $_GET["limit"];
	    }
	}

	$stm = $this->db->prepare($sql);

	if ($this->db->errorCode() > 0) {
	    $output->addStatus("db", $this->db->errorInfo());
	    return null;
	}

	$stm->execute($params);


	return $stm;
    }

}

/**
 * output functions
 */
class Output {

    private static $instance;
    public $retVal;

    /**
     * constructor
     */
    private function __construct() {
	$this->retVal['status']["db"] = "ok";
    }

    /**
     * Returns the output instance or creates it.
     * @return Output output instance
     */
    public static function getInstance() {
	if (!self::$instance) {
	    self::$instance = new self();
	}

	return self::$instance;
    }

    /**
     * Adds data for use to output.
     * @param type $table
     * @param type $output
     */
    public function add($table, $output) {
	$this->retVal[$table] = $output;
    }

    /**
     * Adds an status for output
     * @param type $table status table
     * @param type $output message (use an array with 3 entries ("id", <code>, <message>))
     */
    public function addStatus($table, $output) {

	if ($output[1]) {
	    $this->retVal["status"]["debug"][] = $output;
	    $this->retVal["status"]["db"] = "failed";
	}

	$this->retVal['status'][$table] = $output;
    }

    /**
     * Generates the output for the browser. General you call this only once.
     */
    public function write() {

	header("Content-Type: application/json");
	header("Access-Control-Allow-Origin: *");
	# Rückmeldung senden
	if (isset($_GET["callback"]) && !empty($_GET["callback"])) {
	    $callback = $_GET["callback"];
	    echo $callback . "('" . json_encode($this->retVal, JSON_NUMERIC_CHECK) . "')";
	} else {
	    echo json_encode($this->retVal, JSON_NUMERIC_CHECK);
	}
    }

}

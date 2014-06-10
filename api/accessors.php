<?php

class Protokolle {
	public function getAll() {
		global $db;
	
		$query = "SELECT protokolle.id AS id, datum, seiten, "
			. "'- ' || string_agg(DISTINCT dozent, '\n- ') AS prof, "
			. "'- ' || string_agg(DISTINCT vorlesung, '\n- ') AS vorlesung FROM protokolle"
			. " JOIN pruefungvorlesung"
			. " ON (protokollid = protokolle.id)"
			. " JOIN vorlesungen"
			. " ON (vorlesungen.id = vorlesungsid)";

		$db->setOrder("datum", "DESC");

		$param = array();
		if (isset($_GET["newest"]) && !empty($_GET["newest"])) {

		    $query .= " WHERE datum <= :newest";
		    $param[":newest"] = $_GET["newest"];
		    $whereFlag = true;
		}
		if (isset($_GET["oldest"]) && !empty($_GET["oldest"])) {

		    if (!$whereFlag) {
			$query .= " WHERE";
		    } else {
			$query .= " AND";
		    }

		    $query .= " datum >= :oldest";

		    $param[":oldest"] = $_GET["oldest"];
		}

		$query .= " GROUP BY protokolle.id";

		if (isset($_GET["prof"]) && !empty($_GET["prof"])) {
		    $query .= " HAVING :prof ILIKE ANY(array_agg(dozent))";
		    $param[":prof"] = $_GET["prof"];
		    $whereFlag = true;
		}

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

		    $output->addStatus("searchInput", $search);

		    $query = "SELECT protokolle.id AS id, datum, seiten, "
			    . "'- ' || string_agg(DISTINCT dozent, '\n- ') AS prof, "
			    . "'- ' || string_agg(DISTINCT vorlesung, '\n- ') AS vorlesung FROM protokolle"
			    . " JOIN pruefungvorlesung"
			    . " ON (protokollid = protokolle.id)"
			    . " JOIN vorlesungen"
			    . " ON (vorlesungen.id = vorlesungsid)";

		    $param = array();


		    if (isset($_GET["newest"]) && !empty($_GET["newest"])) {
			$query .= " WHERE datum <= :newest";
			$param[":newest"] = $_GET["newest"];
			$whereFlag = true;
		    }
		    if (isset($_GET["oldest"]) && !empty($_GET["oldest"])) {

			if (!$whereFlag) {
			    $query .= " WHERE";
			} else {
			    $query .= " AND";
			}
			$query .= " datum >= :oldest";

			$param[":oldest"] = $_GET["oldest"];
		    }


		    $query .= " GROUP BY protokolle.id";

		    $searchNew = explode(";AND;", $search);

		    $query .= " HAVING";

		    $oCounter = 0;

		    for ($i = 0; $i < count($searchNew); $i++) {

			if ($i != 0) {
			    $query .= " AND";
			}

			$query .= " (";

			$in = explode(";OR;", $searchNew[$i]);

			for ($j = 0; $j < count($in); $j++) {

			    if ($j != 0) {
				$query .= " OR";
			    }

			    $query .= " :v" . $oCounter . " ILIKE ANY(array_agg(vorlesungen.vorlesung))";
			    $param[":v" . $oCounter] = $in[$j];
			    $oCounter++;
			}

			$query .= ")";
		    }
		    $output->addStatus("debug", $query);

		    if (isset($_GET["prof"]) && !empty($_GET["prof"])) {
			$query .= " AND string_agg(dozent, ',') ILIKE :prof";
			$param[":prof"] = $_GET["prof"];
		    }

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
		    $param[":vorlesung"] = $_GET["vorlesung"];
		}
		if (isset($_GET["prof"]) && !empty($_GET["prof"])) {
		    $query .= " WHERE dozent ILIKE :prof";
		    $param[":prof"] = $_GET["prof"];
		}

		$query .= " GROUP BY " . $col;

		$db->setOrder($col, "ASC");

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

class Klausuren {
    function search($klausuren) {
	global $db;

        if (empty($klausuren)) {
            return $this->getAll();
        } else {
            $sql = "SELECT id, vorlesung, datum, prof, kommentar, seiten "
                    . "FROM public.klausuren "
                    . "WHERE veraltet = false";

            $param = array();

            if (isset($_GET["prof"]) && !empty($_GET["prof"])) {
                $sql .= " AND prof ILIKE :prof";
                $param[":prof"] = $_GET["prof"];
            }
            if (isset($_GET["newest"]) && !empty($_GET["newest"])) {
                $sql .= " AND datum <= :newest";
                $param[":newest"] = $_GET["newest"];
                $whereFlag = true;
            }
            if (isset($_GET["oldest"]) && !empty($_GET["oldest"])) {
                $sql .= " AND datum >= :oldest";
                $param[":oldest"] = $_GET["oldest"];
            }

            $searchNew = explode(";AND;", $klausuren);

            $oCounter = 0;

            for ($i = 0; $i < count($searchNew); $i++) {

                $sql .= " AND";

                $sql .= " (";

                $in = explode(";OR;", $searchNew[$i]);

                for ($j = 0; $j < count($in); $j++) {

                    if ($j != 0) {
                        $sql .= " OR";
                    }

                    $sql .= " vorlesung ILIKE :v" . $oCounter;
                    $param[":v" . $oCounter] = $in[$j];
                    $oCounter++;
                }

                $sql .= ")";
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
        if (isset($_GET["newest"]) && !empty($_GET["newest"])) {
            $sql .= " AND datum <= :newest";
            $param[":newest"] = $_GET["newest"];
            $whereFlag = true;
        }
        if (isset($_GET["oldest"]) && !empty($_GET["oldest"])) {
            $sql .= " AND datum >= :oldest";
            $param[":oldest"] = $_GET["oldest"];
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
            $param[":vorlesung"] = $_GET["vorlesung"];
        }
        if (isset($_GET["prof"]) && !empty($_GET["prof"])) {
            $query .= " WHERE prof ILIKE :prof";
            $param[":prof"] = $_GET["prof"];
        }

        $query .= " GROUP BY " . $col;

        $stmt = $db->query($query, $param);

        $output->add($col, $stmt->fetchAll(PDO::FETCH_ASSOC));
    }

}


?>
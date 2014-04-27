document.getElementById("status").textContent = "200";
if (!window.fsdeluxe) {
    var fsdeluxe = {};
}

fsdeluxe.exams = {
    /**
     * api url
     * @type String url to the api
     */
    apiUrl: "server/db.php",

    /**
     * price per page
     * @type Number page price;
     */
    pagePrice: 0.03,
    /**
     * Elements in search ouput
     * @type Array list of lecture objects in the search output
     */
    searchElements: [],
    /**
     * Elements in cart
     * @type Array list of lecture objects in cart
     */
    cartElements: [],
    // tags
    outputHTMLTag: "output",
    searchOutputTBody: "searchOutputBody",
    searchTag: "searchInput",
    limitTag: "limitInput",
    statusTag: "status",
    cartRemoveInput: "cartRemoveInput",
    cartTableBody: "cartOutputBody",
    /**
     * build td elements
     * @type class
     */
    columns: {
	/**
	 * Build a td with pages of the lecture object
	 * @param {lecture object} lecture object for building the td
	 * @returns {<td>} td element
	 */
	pageCol: function(val) {
	    var tdPages = document.createElement('td');
	    tdPages.classList.add('colSeiten');
	    tdPages.textContent = val.seiten;
	    return tdPages;
	},
	/**
	 * Build a td with the id of the lecture object.
	 * @param {lecture object} lecture object for building the td
	 * @returns {<td>} td element
	 */
	idCol: function(val) {
	    var tdID = document.createElement('td');
	    tdID.classList.add('colID');
	    tdID.textContent = val.id;
	    return tdID;
	},
	/**
	 * Build a td with the lecture name of the object
	 * @param {lecture object} lecture object for building the td
	 * @returns {<td>} td element
	 */
	lecturesCol: function(val) {
	    var tdLectures = document.createElement('td');
	    tdLectures.classList.add('colLectures');
	    tdLectures.textContent = val.vorlesung;
	    return tdLectures;
	},
	/**
	 * Build a td with a checkbox in it
	 * @param {lecture object} lecture object for building the td
	 * @param {String} place where we want this checkbox (search, ...)
	 * @returns {<td>} td element
	 */
	checkboxCol: function(val, place) {
	    var tdCheck = document.createElement('td');
	    var checkbox = document.createElement('input');
	    var checked = document.getElementById("allCheckbox").checked;
	    checkbox.setAttribute('type', 'checkbox');
	    if (checked) {
		checkbox.setAttribute('checked', checked);
	    }
	    checkbox.setAttribute('id', place + 'Checkbox' + val.id);
	    checkbox.setAttribute('class', place + 'Checkbox');
	    checkbox.addEventListener('change', function() {
		fsdeluxe.exams.calcPrice(place);
	    }, false);
	    tdCheck.appendChild(checkbox);
	    return tdCheck;
	},
	/**
	 * Build a td element with the price of the lecture.
	 * @param {lecture object} val object for building the td
	 * @param {type} place where we want this price td (search, cart)
	 * @returns {<td>} td element
	 */
	priceCol: function(val, place) {
	    var self = fsdeluxe.exams;
	    var tdPrice = document.createElement('td');
	    tdPrice.classList.add('col' + place + 'Price');
	    tdPrice.textContent = (val.seiten * self.pagePrice).toFixed(2);
	    return tdPrice;
	},
	/**
	 * Build a td element with the prof name of the lecture.
	 * @param {lecture object} lecture object for building the td
	 * @returns {<td>} td element
	 */
	profCol: function(val) {
	    var tdProf = document.createElement('td');
	    tdProf.classList.add('colProf');
	    tdProf.textContent = val.prof;
	    return tdProf;
	},
	/**
	 * Build a td element with datum of the lecture.
	 * @param {lecture object} lecture object for building the td
	 * @returns {<td>} td element
	 */
	datumCol: function(val) {
	    var tdDatum = document.createElement('td');
	    tdDatum.classList.add('colDatum');
	    tdDatum.textContent = val.datum;
	    return tdDatum;
	}
    },
    fillExams: function(xhr) {

	var self = fsdeluxe.exams;
	if (xhr.response === "") {
	    return;
	}
	var data = JSON.parse(xhr.response);

	document.getElementById(self.statusTag).textContent = xhr.status;

	var outputTable = document.getElementById(self.searchOutputTBody);

	outputTable.innerHTML = "";
	self.searchElements = [];

	data.search.forEach(function(val) {
	    var tr = document.createElement('tr');
	    tr.classList.add('searchRow' + val.id);

	    tr.appendChild(self.columns.checkboxCol(val, "search"));
	    tr.appendChild(self.columns.idCol(val));
	    tr.appendChild(self.columns.lecturesCol(val));
	    tr.appendChild(self.columns.datumCol(val));
	    tr.appendChild(self.columns.profCol(val));
	    tr.appendChild(self.columns.pageCol(val));
	    tr.appendChild(self.columns.priceCol(val));

	    outputTable.appendChild(tr);

	    self.searchElements.push(val);
	});

	self.calcPrice("search");
    },
    /**
     * toggles all checkboxes
     * @returns {void}
     */
    toggleAll: function() {

	var self = fsdeluxe.exams;
	var checkboxes = document.getElementsByClassName('searchCheckbox');
	var checked = document.getElementById("allCheckbox").checked;
	
	for (var i = 0; i < checkboxes.length; i++) {
	    checkboxes[i].checked = checked;
	}
	

/*	if (document.getElementById("allCheckbox").checked === true) {

	    for (var i = 0; i < checkboxes.length; i++) {
		checkboxes[i].checked = true;
	    }
	} else {
	    for (var i = 0; i < checkboxes.length; i++) {
		checkboxes[i].checked = false;
	    }
	}*/

	self.calcPrice("search");
    },
    /**
     * Fills the datalist with data from server
     * @param {XMLHttpRequest} xhr response from server
     * @returns {void}
     */
    fillLectureDatalist: function(xhr) {
	var datalist = document.getElementById("lecturesList");
	fsdeluxe.exams.fillDatalist(datalist, "vorlesung" ,xhr);
    },
    fillProfDatalist: function(xhr) {
	var datalist = document.getElementById("profList");
	fsdeluxe.exams.fillDatalist(datalist, "prof" ,xhr);
    },
    fillDatalist: function(datalist, tag, xhr) {
	var self = fsdeluxe.exams;
	var v = JSON.parse(xhr.response);

	document.getElementById(self.statusTag).textContent = xhr.status;

	datalist.innerHTML = "";

	v[tag].forEach(function(val) {
	    var item = document.createElement('option');
	    item.setAttribute('value', val[tag]);
	    datalist.appendChild(item);
	});
    },
    /**
     * starts a search action
     * @returns {void}
     */
    search: function() {
	var self = fsdeluxe.exams;
	var searchString = document.getElementById(self.searchTag).value;
	var limit = document.getElementById(self.limitTag).value;
	var type = document.getElementById("typeSelector").value;
	var prof = document.getElementById("profInput").value;
	ajax.asyncGet(this.apiUrl + "?" + type
		+ "&search=" + searchString
		+ "&prof=" + prof
		+ "&limit=" + limit,
		self.fillExams, self.error);
        return true;
    },
    /**
     * gets all lectures from the server
     * @returns {void}
     */
    getLectures: function() {
	var self = fsdeluxe.exams;
	var elem = document.getElementById("typeSelector");
        ajax.asyncGet(this.apiUrl + "?" + elem.value 
                + "&vorlesungen", self.fillLectureDatalist, self.error);
    },
    getProfs: function() {
	var self = fsdeluxe.exams;
	var elem = document.getElementById("typeSelector");
        ajax.asyncGet(this.apiUrl + "?" + elem.value 
                + "&profs", self.fillProfDatalist, self.error);
    },
    /**
     * Calculates the price for all checked lectures.
     * Also counts all checked exams.
     * @returns {void}
     */
    calcPrice: function(place) {
	var self = fsdeluxe.exams;
	var sumElem = document.getElementById(place + 'Sum');
	var counterElem = document.getElementById(place + 'Counter');
	var counter = 0;
	var sum = 0.00;
	var calc;

	if (place === "cart") {

	    calc = function(val) {
		var elemCounter = +(document.getElementById("cartCounter" + val.id).value);
		sum += val.seiten * self.pagePrice * elemCounter;
		counter += elemCounter;
	    };
	} else {
	    calc = function(val) {
		if (document.getElementById(place + 'Checkbox' + val.id).checked) {
		    sum += (val.seiten * self.pagePrice);
		    counter++;
		}
	    };
	}
	self[place + "Elements"].forEach(function(val) {
	    calc(val);
	});
	counterElem.textContent = counter;

	sumElem.textContent = sum.toFixed(2);
    },
    /**
     * Error handler for ajax requests
     * @param {XMLHttpRequest} xhr
     * @returns {undefined}
     */
    error: function(xhr) {
	console.log("Error getting request");
	console.log(xhr);
	document.getElementById("status").textContent = xhr.responseText;
	
    },
    addToCart: function() {
	var self = fsdeluxe.exams;

	var cartBody = document.getElementById(self.cartTableBody);

	self.searchElements.forEach(function(val) {

	    if (document.getElementById("searchCheckbox" + val.id).checked) {

		// check if element is in list
		if (self.cartElements[val.id]) {
		    // increase the counter
		    var counterElem = document.getElementById('cartCounter' + val.id);
		    var counter = parseInt(counterElem.value);
		    counter++;
		    counterElem.value = counter;

		} else {

		    var tr = document.createElement('tr');
		    tr.setAttribute('id', 'cartRow' + val.id);

		    var tdID = self.columns.idCol(val);

		    // brings the id to the cartRemoveInput field with a click
		    tdID.addEventListener('click', function() {
			document.getElementById(self.cartRemoveInput).value = val.id;
		    }, false);
		    tr.appendChild(tdID);


		    // counter field
		    var tdCounter = document.createElement('input');
		    tdCounter.classList.add('colCounter');
		    tdCounter.classList.add('cartCounter');
		    tdCounter.setAttribute('id', 'cartCounter' + val.id);
		    tdCounter.setAttribute('type', 'number');
		    tdCounter.setAttribute('value', 1);
		    tdCounter.addEventListener('change', function(event) {
			fsdeluxe.exams.calcPrice("cart");
		    });
		    tr.appendChild(tdCounter);


		    // rest of table row
		    tr.appendChild(self.columns.lecturesCol(val));
		    tr.appendChild(self.columns.datumCol(val));
		    tr.appendChild(self.columns.profCol(val));
		    tr.appendChild(self.columns.pageCol(val));

		    // price tag
		    var tdPrice = document.createElement('td');
		    tdPrice.classList.add('colCartPrice');
		    tdPrice.textContent = (val.seiten * self.pagePrice).toFixed(2);
		    tr.appendChild(tdPrice);

		    cartBody.appendChild(tr);
		    self.cartElements[val.id] = val;
		}
	    }
	});

	self.calcPrice("cart");
    },
    /**
     * Removes the element with id of the cartRemoveInput field from the list
     * @returns {void}
     */
    remCart: function() {
	var self = fsdeluxe.exams;
	var id = document.getElementById(self.cartRemoveInput).value;
	var row = document.getElementById("cartRow" + id);
	document.getElementById(self.cartTableBody).removeChild(row);
	self.cartElements.splice(id, id);

	self.calcPrice("cart");
    },
    typeChanged: function() {
	fsdeluxe.exams.getLectures();
	fsdeluxe.exams.getProfs();
	var elem = document.getElementById("typeSelector");
	document.getElementById("headerTitle").textContent = elem.options[elem.selectedIndex].text;
    }
};

// begin with Lectures
fsdeluxe.exams.typeChanged();
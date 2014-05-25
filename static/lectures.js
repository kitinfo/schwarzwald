var fsdeluxe = fsdeluxe || {};

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
        typeCol: function(type) {
            var tdType = document.createElement('td');
            tdType.classList.add('colType');
            tdType.textContent = type;
            return tdType;
        },
        /**
         * Build a td with the lecture name of the object
         * @param {lecture object} lecture object for building the td
         * @returns {<td>} td element
         */
        lecturesCol: function(val) {
            var tdLectures = document.createElement('td');
            tdLectures.classList.add('colLectures');
            //if (typeof val.prof === 'string') {
            tdLectures.innerText = val.vorlesung;
            /*} else {
             var ul = document.createElement('ul');
             val.vorlesung.forEach(function(val) {
             var li = document.createElement('li');
             li.textContent = val;
             ul.appendChild(li);
             });
             tdLectures.appendChild(ul);
             }*/
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
            var checked = gui.lm("allCheckbox").checked;
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
            //if (typeof val.prof === 'string') {
            tdProf.innerText = val.prof;
            /*} else {
             var ul = document.createElement('ul');
             val.prof.forEach(function(val) {
             var li = document.createElement('li');
             li.textContent = val;
             ul.appendChild(li);
             });
             tdProf.appendChild(ul);
             }*/
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
    TYPE: [
        {id: 0, name: "Protokoll"},
        {id: 1, name: "Klausur"}
    ],
    toggleCheckbox: function(id) {
        var checkbox = gui.lm('searchCheckbox' + id);
        checkbox.checked = !checkbox.checked;
        fsdeluxe.exams.calcPrice('search');
    },
    fillExams: function(xhr) {

        var self = fsdeluxe.exams;
        if (xhr.response === "") {
            return;
        }
        var data = JSON.parse(xhr.response);
        gui.lm(self.statusTag).textContent = xhr.status;
        var outputTable = gui.lm(self.searchOutputTBody);
        outputTable.innerHTML = "";
        self.searchElements = [];
        var type = "";
        self.TYPE.forEach(function(val) {
            if (val.id === data.type) {
                type = val;
            }
        });
        for (var index in data.search) {
            if (data.search.hasOwnProperty(index)) {
                var val = data.search[index];
                var tr = document.createElement('tr');
                tr.classList.add('searchRow' + val.id);
                tr.setAttribute('onclick', "fsdeluxe.exams.toggleCheckbox(" + val.id + ")");
                tr.appendChild(self.columns.checkboxCol(val, "search"));
                tr.appendChild(self.columns.idCol(val));
                tr.appendChild(self.columns.typeCol(type.name));
                tr.appendChild(self.columns.lecturesCol(val));
                tr.appendChild(self.columns.datumCol(val));
                tr.appendChild(self.columns.profCol(val));
                tr.appendChild(self.columns.pageCol(val));
                tr.appendChild(self.columns.priceCol(val));
                outputTable.appendChild(tr);
                val.type = type;
                self.searchElements.push(val);
            }
        }
        self.calcPrice("search");
    },
    /**
     * toggles all checkboxes
     * @returns {void}
     */
    toggleAll: function() {

        var self = fsdeluxe.exams;
        var checkboxes = document.getElementsByClassName('searchCheckbox');
        var checked = gui.lm("allCheckbox").checked;
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
    fillDatalist: function(datalist, tag, xhr) {
        var self = fsdeluxe.exams;
        var v = JSON.parse(xhr.response);
        gui.lm(self.statusTag).textContent = xhr.status;
        datalist.innerHTML = "";
        v[tag].forEach(function(val) {
            var item = document.createElement('option');
            item.setAttribute('value', val[tag]);
            datalist.appendChild(item);
        });
    },
    encode: function(string) {
        var encoded = string.replace(/"%"/g, "&#037;");
        console.log(encoded);
        return encoded;
    },
    /**
     * starts a search action
     * @returns {void}
     */
    search: function() {
        var self = fsdeluxe.exams;
        var searchTags = document.getElementsByClassName(self.searchTag);
        var searchString = gui.lm(self.searchTag + "0").value;
        for (var i = 0; i < searchTags.length; i++) {
            var tag = searchTags[i];
            if (tag.getElementsByTagName("input")[0].value !== "") {
                searchString += tag.getElementsByTagName("select")[0].value;
                searchString += self.encode(tag.getElementsByTagName("input")[0].value);
            }
        }
        console.log(searchString);
        var limit = gui.lm(self.limitTag).value;
        var type = gui.lm("select-mode").value;
        var prof = gui.lm("profInput").value;
        var url = this.apiUrl + "?" + type
                + "&search=" + searchString
                + "&prof=" + prof
                + "&limit=" + limit;
        if (gui.lm("newest").value !== "") {
            url += "&newest=" + gui.lm("newest").value;
        }
        if (gui.lm("oldest").value !== "") {
            url += "&oldest=" + gui.lm("oldest").value;
        }

        ajax.asyncGet(url, self.fillExams, self.error);
        return true;
    },
    /**
     * gets all lectures from the server
     * @returns {void}
     */
    getLectures: function() {
        var self = fsdeluxe.exams;
	//FIXME make this properly modular
        var elem = gui.lm("select-mode");
        ajax.asyncGet(this.apiUrl + "?" + elem.value
                + "&vorlesungen"
                + "&prof=" + gui.lm("profInput").value
                , function(xhr) {
                    self.fillDatalist(gui.lm("lecturesList"), "vorlesung", xhr);
                }, self.error);
    },
    getProfs: function() {
        var self = fsdeluxe.exams;
        var elem = gui.lm("select-mode");
        ajax.asyncGet(this.apiUrl + "?" + elem.value
                + "&profs"
                + "&vorlesung=" + gui.lm("searchInput0").value
                , function(xhr) {
                    fsdeluxe.exams.fillDatalist(gui.lm("profList"), "prof", xhr);
                }, self.error);
    },
    /**
     * Calculates the price for all checked lectures.
     * Also counts all checked exams.
     * @returns {void}
     */
    calcPrice: function(place) {
        var self = fsdeluxe.exams;
        var sumElem = gui.lm(place + 'Sum');
        var counterElem = gui.lm(place + 'Counter');
        var counter = 0;
        var sum = 0.00;
        var calc;
        if (place === "cart") {

            calc = function(val) {
                var elemCounter = +(gui.lm("cartCounter" + val.id).value);
                sum += val.seiten * self.pagePrice * elemCounter;
                counter += elemCounter;
            };
        } else {
            calc = function(val) {
                if (gui.lm(place + 'Checkbox' + val.id).checked) {
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
        gui.lm("status").textContent = xhr.responseText;
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
                    tr.appendChild(self.columns.typeCol(val.type.name));
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
        var id = gui.lm(self.cartRemoveInput).value;
        var row = gui.lm("cartRow" + id);
        gui.lm(self.cartTableBody).removeChild(row);
        self.cartElements.splice(id, id);
        self.calcPrice("cart");
    },
    typeChanged: function() {
        fsdeluxe.exams.getLectures();
        fsdeluxe.exams.getProfs();
	//FIXME:
        //var elem = gui.lm("select-mode");
        //gui.lm("headerTitle").textContent = elem.options[elem.selectedIndex].text;
    },
    saveCart: function() {

        var output = [];

        fsdeluxe.exams.cartElements.forEach(function(val) {
            output.push(
                    {
                        id: val.id,
                        type: val.type.id
                    }
            );
        });

        console.log(JSON.stringify(output));
        var xhr = ajax.syncPost(fsdeluxe.exams.apiUrl + "?save", JSON.stringify(output));
        console.log(xhr);
        
        var erg = JSON.parse(xhr.response);
        
        if (erg.cartid) {
            var cartElem = gui.lm("cartid");
            cartElem.textContent = erg.cartid;
            
            var cartNumber = gui.lm("cartNumber");
            fsdeluxe.exams.showAgain();
        }
    },
    mail: function() {
        
    },
    close: function() {
        gui.lm("cartNumber").classList.add("hidden");
        gui.lm("againButton").classList.remove("hidden");
        gui.lm("black").classList.add("hidden");
    },
    showAgain: function() {
        gui.lm("cartNumber").classList.remove("hidden");
        gui.lm("black").classList.remove("hidden");
    }
};
// begin with Lectures
fsdeluxe.exams.typeChanged();

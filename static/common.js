/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */

var gui = gui || {
    lm: function(elem) {
        return document.getElementById(elem);
    },
    cr: function(elem) {
        return document.createElement(elem);
    },
    option: function(elem) {
        var option = gui.cr('option');
        option.textContent = elem;
        return option;
    }
};

var fsdeluxe = fsdeluxe || {};

fsdeluxe.common = fsdeluxe.common || {
    encode: function(string) {
        var encoded = string.replace(/"%"/g, "&#037;");
        console.log(encoded);
        return encoded;
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
    }
}


fsdeluxe.gui = fsdeluxe.gui || {
    andorid: 1,
    addSearchField: function() {
        var span = gui.cr('span');
        span.setAttribute('id', 'searchInput' + this.andorid);
        span.setAttribute('class', "searchInput");
        //gui.lm('searchInputs').appendChild(gui.cr('br'));

        var selector = gui.cr('select');
        selector.setAttribute('id', 'andor' + fsdeluxe.gui.andorid);
        selector.setAttribute('class', 'andor');
        var option = gui.option('OR')
        option.setAttribute('value', ";OR;");
        selector.appendChild(option);
        option = gui.option('AND');
        option.setAttribute('value', ";AND;");
        selector.appendChild(option);
        span.appendChild(selector);
        var elem = gui.cr('input');
        elem.setAttribute('list', 'lecturesList');
        elem.onchange = fsdeluxe.exams.getProfs();
        elem.setAttribute('placeholder', 'Vorlesung');
        span.appendChild(elem);
        var rm = gui.cr('span');
        rm.setAttribute('class', 'button');
        rm.textContent = "-";
        rm.setAttribute('onclick', "fsdeluxe.gui.rmSearchField(" + (fsdeluxe.gui.andorid) + ")");
        span.appendChild(rm);
        gui.lm('searchInputs').appendChild(span);
        fsdeluxe.gui.andorid++;
    },
    rmSearchField: function(id) {
        console.log(id);
        gui.lm('searchInputs').removeChild(gui.lm('searchInput' + id));
    }
};

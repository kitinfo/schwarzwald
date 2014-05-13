/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */

var fsdeluxe = fsdeluxe || {};

fsdeluxe.insert = {
    fillExams: function() {
        ajax.asyncGet(this.apiUrl + "?"
                + "vorlesungen"
                , function(xhr) {
                    fsdeluxe.common.fillDatalist(gui.lm("lecturesList"), "vorlesung", xhr);
                }, fsdeluxe.common.error);
    },
    fillProfs: function() {
        ajax.asyncGet(this.apiUrl + "?"
                + "profs"
                , function(xhr) {
                    fsdeluxe.common.fillDatalist(gui.lm("profList"), "prof", xhr);
                }, fsdeluxe.common.error);  
    },
    init: function() {
        fillExams();
        fillProfs();
    }
}

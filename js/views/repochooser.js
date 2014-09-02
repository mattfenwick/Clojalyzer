'use strict';

var $ = require('jquery');


function RepoChooser() {
    this.listeners = [];
    var self = this;
    $("#clojalyze").click(function() {
        var username = $("#githubuser").val(),
            repo     = $("#githubrepo").val();
        self.notify(username, repo);
    });
}

RepoChooser.prototype.notify = function() {
    var args = Array.prototype.slice.call(arguments);
    this.listeners.forEach(function(f) {
        f.apply(null, args);
    });
};

RepoChooser.prototype.listen = function(l) {
    this.listeners.push(l);
};


module.exports = RepoChooser;


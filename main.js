'use strict';

var $        = require('jquery'),
    Github   = require('./js/github').Github,
    Model    = require('./js/model'),
    Analyzer = require('./js/views/analyzer'),
    FileChooser = require('./js/views/filechooser'),
    RepoChooser = require('./js/views/repochooser');

window.$ = $;
window.log = [];

var gh = new Github(window.log),
    model = new Model(gh),
    c = new FileChooser(),
    rc = new RepoChooser(),
    a = new Analyzer();

window.model = model;

$("#githubuser").val("clojure");
$("#githubrepo").val("clojure");
$("#githubbranch").val("master");

rc.listen(function(username, repo, branch) {
    model.setRepo(username, repo, branch);
});

model.listen(function(message) {
    a.clear();
    if ( message === 'setRepo' ) {
        c.setPaths(Object.keys(model.repo.response), model.repo.status);
    }
});

c.listen(function(filename) {
    model.setFile(filename);
});

model.listen(function(message) {
    if ( message === 'setFile' ) {
        a.displayFile(model.file.response, model.file.status);
    }
});


module.exports = {};


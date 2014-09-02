'use strict';

var $        = require('jquery'),
    Github   = require('./js/github').Github,
    Model    = require('./js/model'),
    Chooser  = require('./js/views/chooser'),
    Analyzer = require('./js/views/analyzer'),
    Core     = require('./js/core');

window.$ = $;
window.log = [];

var gh = new Github(window.log),
    model = new Model(gh),
    c = new Chooser(),
    a = new Analyzer();

window.model = model;

model.listen(function(message) {
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

model.setRepo('https://api.github.com/repos/clojure/clojure/git/trees/master?recursive=1');

module.exports = {};


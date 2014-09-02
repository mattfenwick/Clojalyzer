'use strict';

var $ = require('jquery'),
    Github = require('./js/github').Github,
    Model = require('./js/model'),
    Chooser = require('./js/views/chooser'),
    Analyzer = require('./js/views/analyzer'),
    Core = require('./js/core');

window.$ = $;
window.Github = Github;
window.Chooser = Chooser;
window.Analyzer = Analyzer;
window.Core = Core;

var gh = new Github(),
    model = new Model(gh),
    c = new Chooser(),
    a = new Analyzer();

model.listen(function(message) {
    if ( message === 'setRepo' ) {
        c.setPaths(Object.keys(model.repo.response));
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

model.setRepo('https://api.github.com/repos/clojure/clojure/contents/src/clj/clojure');

module.exports = {};


'use strict';

var $ = require('jquery'),
    GH = require('./js/github'),
    Chooser = require('./js/chooser'),
    Analyzer = require('./js/analyzer'),
    Core = require('./js/core');

window.$ = $;
window.GH = GH;
window.Chooser = Chooser;
window.Analyzer = Analyzer;
window.Core = Core;

var c = new Chooser(),
    a = new Analyzer();

GH.dir(c.setPaths.bind(c));

c.listen(function(url) {
    GH.file(a.displayFile.bind(a), url);
});


module.exports = {};


'use strict';

var $ = require('jquery'),
    G = require('genhtml-js'),
    elem = G.html.elem;

// tasks
//   1. receive a map of filename->url, and display them
//   2. respond to mouse clicks, sending off the appropriate file

function Chooser() {
    this.div = $("#input");
    this.listeners = [];
}

function getOptions(fileMap) {
    var opts = [];
    for (var key in fileMap) {
        opts.push(elem('option', {}, key));
    }
    return opts;
}

Chooser.prototype.setPaths = function(fileMap) {
    // put paths into a dropdown
    // add a change listener
    this.div.empty();
    var select = elem('select', {}, getOptions(fileMap)),
        self = this;
    this.div.append(G.serialize.serialize(select));
    var sel = this.div.find('select');
    sel.change(function() {
        self.notify(sel.val());
    }).change();
};

Chooser.prototype.notify = function() {
    // send event off to listeners
    var args = Array.prototype.slice.call(arguments);
    this.listeners.forEach(function(f) {
        f.apply(null, args);
    });
};

Chooser.prototype.listen = function(l) {
    this.listeners.push(l);
};


module.exports = Chooser;


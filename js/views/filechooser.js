'use strict';

var $ = require('jquery'),
    G = require('genhtml-js'),
    serialize = G.serialize.serialize,
    elem = G.html.elem;

// tasks
//   1. receive a map of filename->url, and display them
//   2. respond to mouse clicks, sending off the appropriate file

function FileChooser() {
    this.div = $("#input");
    this.listeners = [];
}

function pathsError(status) {
    return elem('div', {'class': 'error'}, status);
}

function getOption(filename) {
    return elem('option', {}, filename);
}

FileChooser.prototype.setPaths = function(filenames, status) {
    // put paths into a dropdown
    // add a change listener
    this.div.empty();
    if ( status !== 'success' ) {
        this.div.append(serialize(pathsError(status)));
        return;
    }
    var select = elem('select', {}, filenames.map(getOption));
    this.div.append(serialize(select));
    var s = this.div.find('select'),
        self = this;
    s.change(function() {
        self.notify(s.val());
    });
    s.val('');
};

FileChooser.prototype.notify = function() {
    var args = Array.prototype.slice.call(arguments);
    this.listeners.forEach(function(f) {
        f.apply(null, args);
    });
};

FileChooser.prototype.listen = function(l) {
    this.listeners.push(l);
};


module.exports = FileChooser;


'use strict';

var $ = require('jquery'),
    G = require('genhtml-js'),
    elem = G.html.elem;

// tasks
//   1. display file
//      what about parsing? parse errors? request, api, network errors?
//   2. respond to clicks by displaying more information

function Analyzer() {
    this.div = $("#output");
}

Analyzer.prototype.displayFile = function(response, status) {
    console.log('got a response -- ' + status);
    switch (status) {
        case 'request error':
        case 'api error':
//        case 'data error':
        case 'parse error':
            this.div.append(status);
            break;
        case 'success':
            this.div.append('<pre>' + response + '</pre>');
            break;
        default:
            throw new Error('unexpected status: ' + status);
    }
};

Analyzer.prototype.notify = function() {
    // send event off to listeners
    var args = Array.prototype.slice.call(arguments);
    this.listeners.forEach(function(f) {
        f.apply(null, args);
    });
};

Analyzer.prototype.listen = function(l) {
    this.listeners.push(l);
};


module.exports = Analyzer;


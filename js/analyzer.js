'use strict';

var $ = require('jquery'),
    G = require('genhtml-js'),
    H = G.html,
    elem = H.elem,
    Core = require('./core');

// tasks
//   1. display file
//      what about parsing? parse errors? request, api, network errors?
//   2. respond to clicks by displaying more information

function Analyzer() {
    this.div = $("#output");
}

function formatRow(rowData) {
    var pos = rowData.position;
    return H.tr({},
                H.td({}, rowData.name),
                H.td({}, pos[0] + ', ' + pos[1]),
                H.td({}, rowData.doc));
}

Analyzer.prototype.success = function(response) {
    var c = Core.parseAndExtract(response);
    if ( c.status !== 'success' ) {
        this.div.append('parse failure -- ' + JSON.stringify(c.value));
        return;
    }
    var header = H.tr({},
                      H.td({}, 'function name'),
                      H.td({}, 'line and column'),
                      H.td({}, 'doc string')),
        rows = [header].concat(c.value.map(formatRow)),
        table = elem('table', {}, rows);
    this.div.append(G.serialize.serialize(table));
};

Analyzer.prototype.displayFile = function(response, status) {
    console.log('got a response -- ' + status);
    this.div.empty();
    switch (status) {
        case 'request error':
        case 'api error':
        case 'data error':
            this.div.append(status);
            break;
        case 'success':
            this.success(response);
            break;
        default:
            throw new Error('unexpected status: ' + status + ' ' + JSON.stringify(response));
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


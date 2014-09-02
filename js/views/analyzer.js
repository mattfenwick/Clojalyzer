'use strict';

var $ = require('jquery'),
    G = require('genhtml-js'),
    H = G.html,
    elem = H.elem,
    Core = require('./../core');

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
                H.td({}, pos[0] + ''),
                H.td({}, H.pre({}, '\n' + rowData.doc)));
}

Analyzer.prototype.success = function(response) {
    var c = Core.parseAndExtract(response);
    if ( c.status !== 'success' ) {
        this.div.append('parse failure -- ' + JSON.stringify(c.value));
        return;
    }
    var header = H.tr({},
                      H.th({}, 'Function name'),
                      H.th({}, 'Line number'),
                      H.th({}, 'Documentation string')),
        rows = [header].concat(c.value.map(formatRow)),
        table = elem('table', {}, rows);
    this.div.append(G.serialize.serialize(table));
};

Analyzer.prototype.displayFile = function(response, status) {
    console.log('displayFile status -- ' + status);
    this.div.empty();
    switch (status) {
        case 'success':
            this.success(response);
            break;
        default:
            this.div.append(status);
            break;
    }
};

Analyzer.prototype.clear = function() {
    this.div.empty();
};


module.exports = Analyzer;


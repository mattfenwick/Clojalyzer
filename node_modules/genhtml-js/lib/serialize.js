'use strict';

var model = require('./model.js');


var ESCAPES = {
    '<': 'lt',
    '>': 'gt',
    '&': 'amp',
    '"': 'quot',
    "'": 'apos'
};

function escape(str) {
    var escd = Array.prototype.map.call(str, function(c) {
        if ( ESCAPES.hasOwnProperty(c) ) {
            return '&' + ESCAPES[c] + ';';
        }
        return c;
    });
    return escd.join('');
}

function ser_elem(node, lines, spaces) {
    var nextSize = spaces + '  ',
        attrs = [];
    node.attrs.map(function(a) {
        if ( a.value === null ) {
            attrs.push(' ' + a.key);
        } else {
            attrs.push(' ' + a.key + '="' + escape(a.value) + '"');
        }
    });
    
    lines.push(spaces + '<' + node.name + attrs.join('') + '>');
    
    node.children.map(function(c) {
        _serialize(c, lines, nextSize);
    });

    lines.push(spaces + '</' + node.name + '>');
}

function ser_root(node, lines, spaces) {
    lines.push('<!doctype' + ' ' + node.doctype + '>');
    node.children.map(function(c) {
        _serialize(c, lines, spaces);
    });
}

function _serialize(node, lines, spaces) {
    if ( node instanceof model.Root ) {
        ser_root(node, lines, spaces);
    } else if ( node instanceof model.Element ) {
        ser_elem(node, lines, spaces);
    } else if ( node instanceof model.Text ) {
        lines.push(spaces + escape(node.text));
    } else if ( node instanceof model.Comment ) {
        lines.push(spaces + '<!--' + node.text + '-->');
    } else {
        throw new Error('unrecognized node type -- ' + node);
    }
}

function serialize(node) {
    var lines = [];
    _serialize(node, lines, '');
    return lines.join('\n');
}


module.exports = {
    'serialize': serialize
};


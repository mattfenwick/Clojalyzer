'use strict';

var C = require('clojarse-js');


var parse = C.parseAst;

function isDefn(node) {
    if ( ( node.type !== 'list' ) ||
         ( node.elems.length === 0 ) ) {
        return false;
    }
    var first = node.elems[0];
    return ( first.type === 'symbol' ) &&
           ( first.ns   === null     ) &&
           ( first.name === 'defn'   );
}

function is2ndSymbol(node) {
    return ( node.elems.length >= 2 ) && ( node.elems[0].type === 'symbol' );
}

var simpleEscapes = {
    'b': '\b',
    't': '\t',
    'n': '\n',
    'f': '\f',
    'r': '\r',
    '"': '"',
    '\\': '\\'
};

function docString(node) {
    if ( node && ( node.type === 'string' ) ) {
        return node.value.map(function(c) {
            if ( typeof c === 'string' ) {
                return c;
            } else if ( c.kind === 'simple' ) {
                return simpleEscapes[c.value];
            }
            return '?';
        }).join('');
    }
    return '';
}

function extractFuncInfo(node) {
    return {
        'name'      : node.elems[1].name,
        'position'  : node.pos,
        'doc'       : docString(node.elems[2])
    };
}

function getToplevelDefns(ast) {
    var funcs = [];
    ast.elems.forEach(function(e) {
        if ( isDefn(e) && is2ndSymbol(e) ) {
            funcs.push(extractFuncInfo(e));
        }
    });
    return funcs;
}

function parseAndExtract(text) {
    return C.parseAst(text).fmap(getToplevelDefns);
}


module.exports = {
    'parse'           : parse           ,
    'parseAndExtract' : parseAndExtract ,
    'extractFuncInfo' : extractFuncInfo ,
    'getToplevelDefns': getToplevelDefns,
};


'use strict';

var P = require('./lib/parser'),
    A = require('./lib/ast'),
    B = require('./lib/astbuilder');


function parseCst(input) {
    return P.parse(input);
}

function cstToAst(cst) {
    return B.build(cst);
}

function parseAst(input) {
    var cstOrError = parseCst(input);
    return cstOrError.fmap(cstToAst);
}


module.exports = {
    // parser modules
    'parser'    : P,
    // ast modules
    'ast'       : A,
    'astbuilder': B,
    // convenience functions -- although seems redundant
    'parseCst'  : parseCst,
    'cstToAst'  : cstToAst,
    'parseAst'  : parseAst
};


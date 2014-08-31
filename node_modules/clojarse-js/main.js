'use strict';

var index = require('./index'),
    fs = require('fs');


var input = fs.readFileSync('/dev/stdin', {'encoding': 'utf8'}),
    cstOrError = index.parseCst(input),
    tree;

function dump(x) {
    return JSON.stringify(x, null, 2);
}

if ( process.argv[2] === 'cst' ) {
    tree = cstOrError.fmap(dump);
} else if ( process.argv[2] !== undefined ) {
    throw new Error('invalid arg -- can only be "cst": was ' + process.argv[2]);
} else {
    tree = cstOrError.fmap(index.cstToAst)
                     .fmap(index.ast.dump);
}

var o1 = tree.mapError(dump),
    output = o1.value;

process.stdout.write(output + "\n"); // TODO utf8?


module.exports = {

};


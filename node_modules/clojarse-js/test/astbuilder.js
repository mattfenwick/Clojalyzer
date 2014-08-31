"use strict";

var B = require('../lib/astbuilder'),
    P = require('../lib/parser'),
    assert = require('assert');

var module = describe,
    test = it,
    deepEqual = assert.deepEqual;


module("astbuilder", function() {

    test("simple", function() {
        var cst = P.parse('(a b)'),
            ast = B.build(cst.value),
            fst = ast.elems[0];
        deepEqual(fst.type, 'list');
        deepEqual(fst.elems.length, 2);
        deepEqual(fst.elems[0].type, 'symbol');
        deepEqual(fst.elems[0].name, 'a');
        deepEqual(fst.elems[1].type, 'symbol');
        deepEqual(fst.elems[1].name, 'b');
    });

    test("expand reader macros", function() {
        var cst = P.parse('@x ~y'),
            ast = B.build(cst.value),
            fst = ast.elems[0],
            snd = ast.elems[1];
        deepEqual(fst.type, 'list');
        deepEqual(fst.elems[0].name, 'deref');
        deepEqual(fst.elems[0].ns, 'clojure.core');
        deepEqual(fst.elems[1].name, 'x');
        deepEqual(fst.elems[1].ns, null);
        deepEqual(snd.elems[0].name, 'unquote');
        deepEqual(snd.elems[0].ns, 'clojure.core');
        deepEqual(snd.elems[1].name, 'y');
        deepEqual(snd.elems[1].ns, null);
    });
    
    test("metadata", function() {
        var cst = P.parse('^ outer ^ inner z'),
            ast = B.build(cst.value),
            fst = ast.elems[0];
        deepEqual(fst.name, 'z');
        deepEqual(fst.type, 'symbol');
        deepEqual(fst.meta.length, 2);
        var m1 = fst.meta[0],
            m2 = fst.meta[1];
        deepEqual(m1.type, 'symbol');
        deepEqual(m1.name, 'inner');
        deepEqual(m2.type, 'symbol');
        deepEqual(m2.name, 'outer');
    });

});


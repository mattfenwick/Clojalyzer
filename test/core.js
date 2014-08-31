"use strict";

var C = require('../js/core'),
    assert = require('assert'),
    deepEqual = assert.deepEqual;


describe("core functionality:", function() {

    var defs = [
            '(defn id [x] x)'               ,
            ''                              ,
            '(def a 4)'                     ,
            ''                              ,
            '(defn flip'                    ,
            '  "reverse the elements in a'  ,
            '  vector of length 2"'         ,
            '  [x y] [y x])'                ,
        ].join('\n'),
        
        m_ast = C.parse(defs);

    it("can parse Clojure code", function() {
        deepEqual(m_ast.status, 'success');
        deepEqual(m_ast.value.elems.length, 3);
        var fst = m_ast.value.elems[0];
        deepEqual(fst.type, 'list');
        deepEqual(fst.elems.length, 4);
        deepEqual(fst.elems[0].type, 'symbol');
        deepEqual(fst.elems[0].name, 'defn');
        deepEqual(fst.elems[1].type, 'symbol');
        deepEqual(fst.elems[1].name, 'id');
        deepEqual(fst.elems[1].pos, [1,7]);
    });
    
    it("can extract toplevel defn's while ignoring everything else", function() {
        var defns = C.getToplevelDefns(m_ast.value);
        deepEqual(defns.length, 2);
        deepEqual(defns[0], {'name': 'id', 'doc': '', 'position': [1,1]});
        deepEqual(defns[1], {'name': 'flip', 'position': [5,1],
                             'doc': 'reverse the elements in a\n  vector of length 2'});
    });
    
});


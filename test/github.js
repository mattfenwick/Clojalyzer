"use strict";

var G = require('../js/github'),
    assert = require('assert'),
    deepEqual = assert.deepEqual;


describe("github api:", function() {

    it("can shim endsWith", function() {
        var string = "abcdef",
            yeses = ['abcdef', 'bcdef', 'cdef', 'def', 'ef', 'f'],
            nos = ['.abcdef', 'e', 'de', 'defs'];
        yeses.forEach(function(y) {
            deepEqual(G.endsWith(string, y), true);
        });
        nos.forEach(function(n) {
            deepEqual(G.endsWith(string, n), false);
        });
    });
    
});


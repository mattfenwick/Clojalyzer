"use strict";

var S = require('../lib/set'),
    assert = require('assert');

var module = describe,
    test = it,
    deepEqual = assert.deepEqual;


module("set", function() {

    test("has", function() {
        var s = new S(['a', 'b', 'c']);
        deepEqual(s.has('a'), true);
        deepEqual(s.has('d'), false);
    });

});


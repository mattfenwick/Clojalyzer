"use strict";

var D = require('../lib/dict'),
    assert = require('assert');

var module = describe,
    test = it,
    deepEqual = assert.deepEqual;


module("dict", function() {

    test("has", function() {
        var d = new D({'a': 1, 'b': undefined, 'c': null});
        deepEqual(d.has('a'), true);
        deepEqual(d.has('b'), true);
        deepEqual(d.has('c'), true);
        deepEqual(d.has('d'), false);
    });

    test("get", function() {
        var d = new D({'a': 1, 'b': undefined, 'c': null});
        deepEqual(d.get('a'), 1);
        deepEqual(d.get('b'), undefined);
        deepEqual(d.get('c'), null);
    });

    test("set", function() {
        var d = new D({'a': 1, 'b': undefined, 'c': null});
        deepEqual(d.get('a'), 1);
        deepEqual(d.get('b'), undefined);
        deepEqual(d.get('c'), null);
        d.set('a', 42);
        deepEqual(d.get('a'), 42);
        deepEqual(d.get('b'), undefined);
        deepEqual(d.get('c'), null);
    });

    test("keys", function() {
        var d = new D({'a': 1, 'b': undefined, 'c': null});
        // TODO what about order ??
        deepEqual(d.keys().sort(), ['a', 'b', 'c']);
    });

});


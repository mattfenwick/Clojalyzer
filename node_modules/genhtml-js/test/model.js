"use strict";

var M = require('../lib/model'),
    assert = require('assert');

var module = describe,
    test = it,
    deepEqual = assert.deepEqual;


module("model", function() {

    test('Element', function() {
        //blar;
    });
    
    test('Comment', function() {
        assert.doesNotThrow(function() {new M.Comment('abc->');});
        assert.throws(function() {new M.Comment('ab--cd');});
    });
    
    test('Root', function() {
        assert.doesNotThrow(function() {new M.Root('html', new M.Element('div', [], []));});
    });
    
    test('Attribute -- needs non-empty string key', function() {
        assert.doesNotThrow(function() {new M.Attribute('abc', '123');});
        assert.throws(function() {new M.Attribute('', '123');});
        assert.throws(function() {new M.Attribute({}, '123');});
    });
    
    test('Attribute value -- string or null', function() {
        assert.doesNotThrow(function() {new M.Attribute('abc', 'def');});
        assert.doesNotThrow(function() {new M.Attribute('abc', null);});
        assert.throws(function() {new M.Attribute('abc', 123);});
        assert.throws(function() {new M.Attribute('abc');});
    });
    
    test("no duplicate attributes", function() {
        assert.throws(function() {
            new M.Element('div', 
                          [new M.Attribute('x', 'abc'),
                           new M.Attribute('x', 'def')],
                          []);
        },
        Error);
    });
    
    test('Text', function() {
        //dar;
    });

});


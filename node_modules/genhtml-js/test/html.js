"use strict";

var H = require('../lib/html'),
    M = require('../lib/model'),
    assert = require('assert');

var module = describe,
    test = it,
    deepEqual = assert.deepEqual;


module("html", function() {

    test("attributes", function() {
        deepEqual(H.html({'a': 'abc'}),
                  {"name": "html", 
                   "attrs": [{'key': 'a', 'value': 'abc'}], 
                   "children": []});
    });
    
    test("multiple children", function() {
        deepEqual(H.div({},
                        'abc', 
                        'def'),
                  {"name": "div", "attrs": [],
                   "children": [{"text": 'abc'}, {"text": "def"}]});
    });
    
    test("string child -> text node", function() {
        deepEqual(H.body({}, 'abc'),
                  {"name": "body", "attrs": [],
                   "children": [{"text": 'abc'}]});
    });
    
    test("root", function() {
        deepEqual(H.root('html',
                         H.html({})),
                  {"doctype": "html",
                   "children": [{"name": "html", "attrs": {}, "children": []}]});
    });
    
});


"use strict";

var S = require('../lib/serialize'),
    M = require('../lib/model'),
    assert = require('assert');

var module = describe,
    test = it,
    deepEqual = assert.deepEqual;


module("serialize", function() {

    test("root", function() {
        var t = new M.Root('html', []);
        deepEqual(S.serialize(t), '<!doctype html>');
    });
    
    test("empty tag", function() {
        var t = new M.Element('abc', [], []);
        deepEqual(S.serialize(t), '<abc>\n</abc>');
    });
    
    test("text node", function() {
        var t = new M.Text('qrs');
        deepEqual(S.serialize(t), 'qrs');
    });
    
    test("attributes", function() {
        var t = new M.Element('a', [new M.Attribute('b', 'c'), new M.Attribute('d', 'e')], []);
        deepEqual(S.serialize(t), '<a b="c" d="e">\n</a>');
    });
    
    test("indentation of nested elements", function() {
        var t = new M.Element('hi', [], [new M.Element('bye', [], [])]);
        deepEqual(S.serialize(t), '<hi>\n  <bye>\n  </bye>\n</hi>');
    });
    
    test("comment", function() {
        var t = new M.Comment('hello! -');
        deepEqual(S.serialize(t), '<!--hello! --->');
    });
    
    test("escaping in text nodes", function() {
        var t = new M.Element('abc', [], [new M.Text('a<&>"\'')]);
        deepEqual(S.serialize(t), '<abc>\n  a&lt;&amp;&gt;&quot;&apos;\n</abc>');
    });
    
    test("escaping in attribute values", function() {
        var t = new M.Element('abc', [new M.Attribute('qrs', 'd"ef')], []);
        deepEqual(S.serialize(t), '<abc qrs="d&quot;ef">\n</abc>');
    });
    
    test("no escaping in comments", function() {
        var t = new M.Comment('oops<>');
        deepEqual(S.serialize(t), '<!--oops<>-->');
    });
    
    test("all together", function() {
        var t = new M.Root('html', [new M.Element('html', 
                                                  [new M.Attribute('abc', 'd"ef'),
                                                   new M.Attribute('qrs', null)],
                                                  [new M.Text('som<e text'),
                                                   new M.Comment('a com<ment'),
                                                   new M.Element('div', [], [new M.Text('a div')])])]);
        deepEqual(S.serialize(t),
                  ['<!doctype html>'           ,
                   '<html abc="d&quot;ef" qrs>',
                   '  som&lt;e text'           ,
                   '  <!--a com<ment-->'       ,
                   '  <div>'                   ,
                   '    a div'                 ,
                   '  </div>'                  ,
                   '</html>'].join('\n'));
    });
    
});


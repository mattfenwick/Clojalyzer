"use strict";

var P = require('../lib/parser'),
    assert = require('assert');

var module = describe,
    test = it,
    deepEqual = assert.deepEqual;


module("parser/parseCst", function() {

    test("some chars", function() {
        var inp = '\\b \\u0041 \\backspace \\o101',
            out = P.parse(inp);
        deepEqual(out.status, 'success');
        deepEqual(out.value.forms.map(function(c) {return c._name;}), 
                  ['char', 'char', 'char', 'char']);
        deepEqual(out.value.forms.map(function(c) {return c.value._name;}),
                  ['simple', 'unicode', 'long', 'octal']);
    });
    
    test("multiple token errors", function() {
        var cases = ['4&', '5/a'];
        cases.map(function(c) {
            var out = P.parse(c);
            deepEqual(out.status, 'error');
//            deepEqual(out.value['token errors'].length, 3);
//            deepEqual(out.value.tree.body.slice(1), 
//                      [{'_name': 'token error', 'id': 0},
//                       {'_name': 'token error', 'id': 1},
//                       {'_name': 'token error', 'id': 2}]);
       });
    });
    /*
    test("char", function() {
        deepEqual(out.value.body.length, 4);
    });

    test("char simple", function() {
        deepEqual(out.value.body[0].value._name, 'simple');
    });

    test("char unicode", function() {
        deepEqual(out.value.body[1].value._name, 'unicode');
    });

    test("char long", function() {
        deepEqual(out.value.body[2].value._name, 'long');
    });

    test("char octal", function() {
        deepEqual(out.value.body[3].value._name, 'octal');
    });

    test("char error", function() {
        var out = F.fullParse("\\bac"); // also for \obac.  but is already correct for \ubac
        deepEqual(out.value.body[0].status, 'error');
        deepEqual(out.value.body[0].value[0][0], 'char');
    });

    var coarse = '1 1.2 1/3 x/y :x/y ::x/y "" #"" \\z \\tab';
    
    test("coarse test", function() {
        deepEqual(F.fullParse(coarse).body.map(function(x) {return x._name;}),
                  ['integer', 'float', 'ratio', 'symbol', 'keyword',
                   'autokey', 'string', 'regex', 'char', 'char']);
    });
    
    */
    var ints = '1 +1N 0 0756 -0756 0x32f 36r0az',
        errors = '08 100r0 0x0g';
    
    var floats = '8M 8.2';

});

module("parser/comment and whitespace", function() {
    var cases = [
        ["#! abc \n def", ' abc ', 'comment', P.comment],
        ["; tuv\n xyz", ' tuv', 'comment', P.comment],
        [", \r\f\n\t  qrs", ', \r\f\n\t  ', 'whitespace', P.whitespace]
    ];
    cases.map(function(c) {
        test('<' + c[0] + '>', function() {
            var parsed = c[3].parse(c[0], [1,1]);
            deepEqual(parsed.status, 'success');
            deepEqual(parsed.value.result._name, c[2]);
            deepEqual(parsed.value.result.value, c[1].split(''));
        });
    });
});

module("parser/char", function() {
    var cases = [
        ['\\b'          , 'simple', 'b'     , [1,3]],
        ['\\b""'        , 'simple', 'b'     , [1,3]],
        ['\\  '         , 'simple', ' '     , [1,3]],
        ['\\\t '        , 'simple', '\t'    , [1,3]],
        ['\\\n,'        , 'simple', '\n'    , [2,1]],
        ['\\blarghabag ', 'long'  , 'blarghabag', [1,12]],
        ['\\u1234~[]'   , 'unicode','1234'  , [1,7]],
        ['\\o123'       , 'octal' , '123'   , [1,6]],
//        ["\\a#'%{}"     , "a#'%", "only terminating macros and whitespace end a char"]
    ];
    cases.map(function(c) {
        test(c[0], function() {
            var parsed = parseForm(c[0]);
            deepEqual(parsed.status, 'success');
            var v = parsed.value;
            deepEqual(v._name, 'char');
            deepEqual(v.value._name, c[1]);
            deepEqual(v._end, c[3]);
        });
    });
});

module("parser/integer", function() {
    var cases = [
        ['0xdefN'   , null, 'base16', 'N' , 16, 'def'  , [1,7] ],
        ['-077'     , '-' , 'base8' , null, 8 , '77'   , [1,5] ],
        ['+123'     , '+' , 'base10', null, 10, '123'  , [1,5] ],
        ['0'        , null, 'zero'  , null, 10, '0'    , [1,2] ],
        ['36r123zZ' , null, 'baseN' , null, 36, '123zZ', [1,9] ],
        ['40r888'   , null, 'baseN' , null, 40, '888'  , [1,7] ]
    ];
    cases.map(function(c) {
        test(c[0], function() {
            var p = parseForm(c[0]);
            deepEqual(p.status, 'success');
            var v = p.value;
            deepEqual(v._name, 'number');
            deepEqual(v.sign, c[1]);
            var i = v.number;
            deepEqual(i._name, 'integer');
            deepEqual(i.suffix, c[3]);
            deepEqual(i.value._name, c[2]);
            // TODO test the rest of the fields
//            deepEqual(v.base, c[3]);
//            deepEqual(v.digits, c[4]);
//            deepEqual(v._end, c[5]);
        });
    });
});

function parseForm(str) {
    return P.form.parse(str, [1, 1]).fmap(function(x) {
        return x.result;
    });
}

module("parser/float", function() {
    var cases = [
        ['4M'           , null, '4'    , null , null        , 'M' , [1,3] ],
        ['-0.'          , '-' , '0'    , ''   , null        , null, [1,4] ],
        ['18e37'        , null, '18'   , null , [null, '37'], null, [1,6] ],
        ['+875.623e-22M', '+' , '875'  , '623', ['-', '22'] , 'M' , [1,14]],
        ['01238M'       , null, '01238', null , null        , 'M' , [1,7] ]
    ];
    cases.map(function(c) {
        test(c[0], function() {
            var p = parseForm(c[0]);
            deepEqual(p.status, 'success');
            var v = p.value;
            deepEqual(v.sign, c[1]);
            deepEqual(v._name, 'number');
            deepEqual(v.number._name, 'float');
            deepEqual(v.number.int, c[2].split(''));
            if ( c[3] !== null ) {
                deepEqual(v.number.decimal.int, c[3].split(''));
            } else {
                deepEqual(v.number.decimal, null);
            }
            if ( c[4] !== null ) {
                deepEqual(v.number.exponent.sign, c[4][0]);
                deepEqual(v.number.exponent.power, c[4][1].split(''));
            } else {
                deepEqual(v.number.exponent, null);
            }
            deepEqual(v.number.suffix, c[5]);
            deepEqual(v._end, c[6]);
        });
    });
});

module("parser/ratio", function() {
    var cases = [
        ['0/0'      , null, '0'     , '0', [1,4]  ],
        ['01238/1'  , null, '01238' , '1', [1,8]  ],
        ['-198/202' , '-', '198'    , '202', [1,9]],
        ['+18/34'   , '+', '18'     , '34', [1,7] ]
    ];
    cases.map(function(c) {
        test(c[0], function() {
            var p = parseForm(c[0]);
//            console.log(JSON.stringify(p));
            deepEqual(p.status, 'success');
            var v = p.value;
            deepEqual(v._name, 'number');
            deepEqual(v.sign, c[1]);
            deepEqual(v.number.numerator, c[2].split(''));
            deepEqual(v.number.denominator, c[3].split(''));
            deepEqual(v.number._name, 'ratio');
            deepEqual(v._end, c[4]);
        });
    });
});

module("parser/number errors", function() {
    var cases = [
        ['01238',   ['illegal following character', [1,5]] ],
        ['4/z',     ['denominator', [1,3]] ]
    ];
    cases.map(function(c) {
        test('<' + c[0] + '>  ->  ' + c[1], function() {
            var p = P.parse(c[0]);
            deepEqual(p.status, 'error');
            deepEqual(p.value[p.value.length - 1], c[1]);
        });
    });
});

module("parser/ident", function() {
    var cases = [
        ['x '           , 'symbol'       , [1,2]],
        [':x,'          , 'keyword'      , [1,3]],
        ['::x\t'        , 'autokey'     , [1,4]],
        ['%234\n'       , 'symbol'    , [1,5]],
        ["x'#%[]"       , "symbol"    , [1,5]],
        ['x/y '         , 'symbol'  , [1,4]],
        [':x/y '        , 'keyword' , [1,5]],
        ['::x/y '       , 'autokey' , [1,6]],
        // TODO figure out where the problem is with the following case
        // I don't understand it
//        [':///'     , ident('keyword', ''   , '//' )],
        ['a:/b/c '     , 'symbol' , [1,7]]
    ];
    cases.map(function(c) {
        test(c[0], function() {
            var p = parseForm(c[0]);
            deepEqual(p.status, 'success');
            deepEqual(p.value._name, 'ident');
            deepEqual(p.value.value._name, 'name');
            deepEqual(p.value.value.type, c[1]);
            deepEqual(p.value._end, c[2]);
        });
    });
    test('reserved', function() {
        var p = P.form.parse('nil ', [1,1]);
        deepEqual(p.status, 'success');
        var v = p.value.result;
        deepEqual(v._name, 'ident');
        deepEqual(v.value._name, 'reserved');
        deepEqual(v.value.value, 'nil');
        deepEqual(v._end, [1,4]);
    });
});


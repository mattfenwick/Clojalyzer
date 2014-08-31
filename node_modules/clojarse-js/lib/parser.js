'use strict';

var u = require('unparse-js'),
    C = u.combinators,
    Cst = u.cst;

var P = C.position,
    item = P.item, oneOf = P.oneOf,
    literal = P.literal, string = P.string,
    not1 = P.not1, not0 = C.not0,
    cut = Cst.cut, node = Cst.node,
    alt = C.alt, many0 = C.many0,
    many1 = C.many1, error = C.error,
    optional = C.optional, seq = C.seq,
    check = C.check, bind = C.bind,
    getState = C.getState, get = C.get,
    seq2R = C.seq2R, pure = C.pure,
    lookahead = C.lookahead,
    seq2L = C.seq2L, zero = C.zero; // be careful not to confuse this `zero` with any clojure parsers

var Dict = require('data-js').Dict;


function quantity(n, parser) {
    var ps = [];
    for ( var i = 0; i < n; i++) {
        ps.push(parser);
    }
    return seq.apply(null, ps);
}


var comment = node('comment',
        ['open' , alt(literal(';'), string('#!'))],
        ['value', many0(not1(oneOf('\n\r')))     ]),

    whitespace = node('whitespace',
        ['value', many1(oneOf(', \t\n\r\f'))]);
    

var _macro            = oneOf('";@^`~()[]{}\\\'%#'),

    _terminatingMacro = oneOf('";@^`~()[]{}\\');


var _0_7 = oneOf('01234567'),
    _0_9 = oneOf('0123456789'),
    _hex = oneOf('abcdefABCDEF0123456789'),
    _1_9 = oneOf('123456789'),
    _a_z = oneOf('abcdefghijklmnopqrstuvwxyz'),
    _A_Z = oneOf('ABCDEFGHIJKLMNOPQRSTUVWXYZ');

var _base16 = node('base16',
        ['open'  , seq(literal('0'), oneOf('xX'))],
        ['digits', cut('body', many1(_hex))      ]),
    
    _base8 = node('base8',
        ['open'  , literal('0')                  ],
        ['digits', many1(_0_7)                   ]),
//        ['end'   , cut('octal digit', not0(item))]), // TODO this is now wrong
    
    // couldn't this be folded in with octal?
    //   can't be folded into base10 b/c e.g. `09` is illegal
    _zero = node('zero',
        ['value', literal('0')]),
        
    _baseN = node('baseN',
        ['radix' , seq(_1_9, optional(_0_9))   ],
        ['r'     , oneOf('rR')                 ],
        ['digits', many1(alt(_0_9, _a_z, _A_Z))]), // TODO should commit to reaching end of input

    _base10 = node('base10',
        ['first', _1_9       ],
        ['rest' , many0(_0_9)]),
    
    integer = node('integer',
        ['value' , alt(_base16, _base8, _zero, _baseN, _base10)], // order *is* important here !!
        ['suffix', optional(literal('N'))                      ]);


var _int_10 = many1(_0_9),

    //"([-+]?[0-9]+)/([0-9]+)");
    ratio = node('ratio',
        ['numerator'  , _int_10                     ],
        ['slash'      , literal('/')                ],
        ['denominator', cut('denominator', _int_10) ]),
 
    _decimal = node('decimal',
        ['dot', literal('.')],
        ['int', many0(_0_9) ]),
    
    _exp = node('exponent',
        ['e'    , oneOf('eE')          ],
        ['sign' , optional(oneOf('+-'))],
        ['power', _int_10              ]),

    //"([-+]?[0-9]+(\\.[0-9]*)?([eE][-+]?[0-9]+)?)(M)?"
    _float = node('float',
        ['int'     , _int_10                ],
        ['decimal' , optional(_decimal)     ],
        ['exponent', optional(_exp)         ],
        ['suffix'  , optional(literal('M')) ]),
    
    float = check(function(n) {
        var names = ['decimal', 'exponent', 'suffix'];
        for (var i = 0; i < names.length; i++) {
            if ( n[names[i]] !== null ) {
                return true;
            }
        }
        return false;
    }, _float),

    _number_catchall = node('number catchall',
        ['first', oneOf('0123456789')      ],
        ['error', cut('unparseable number')]),
    
    number = node('number',
        ['sign'  , optional(oneOf('+-'))                        ],
        ['number', alt(ratio, float, integer, _number_catchall) ],
        ['follow', cut('illegal following character',
                       lookahead(alt(whitespace, _macro, not0(item))))]);
//        ['follow', not0(seq2L(not0(alt(whitespace, _macro)), cut('illegal following character', zero))) ]);


var ESCAPES = 'btnfr"\\',
    MACROS = '";@^`~()[]{}\\\'%#',
    WS = ', \t\n\r';

function IS_MACRO(ch) {
    return (MACROS.indexOf(ch) > -1);
}

function IS_WHITESPACE(ch) {
    return (WS.indexOf(ch) > -1);
}


var _simple_escape = node('simple',
        ['value', oneOf(ESCAPES)]),
    
    _unicode_escape = node('unicode',
        ['open' , literal('u')                              ],
        ['value', cut('4 hex characters', quantity(4, _hex))]),
    
    // 0-7:good  macro:done  end:done  other:error
    _octal_digit = bind(get, function(xs) {
        if ( xs.length === 0 ) {
            return pure(null);
        }
        var first = xs[0];
        if ( IS_MACRO(first) || IS_WHITESPACE(first) ) {
            return pure(null);
        }
        return cut('octal digit', _0_7);
    }),
    
    // good: \0, \10, \3\3 \232
    // bad: \9, \400, \3z 
    _octal_escape = node('octal',
        ['check' , cut('not 8 or 9', not0(oneOf('89'))) ],
        ['digits', seq(_0_7, _octal_digit, _octal_digit)]),

    _string_escape = node('escape',
        ['open' , literal('\\')],
        ['value', cut('escape sequence',
                      alt(_simple_escape, _unicode_escape, _octal_escape))]),
    
    _string_char = node('char',
        ['value', not1(oneOf('\\"'))]),
    
    clojure_string = node('string',
        ['open' , literal('"')                            ],
        ['chars', many0(alt(_string_char, _string_escape))],
        ['close', cut('"', literal('"'))                  ]),

    regex = node('regex',
        ['open' , string('#"')                        ],
        ['chars', many0(alt(not1(oneOf('\\"')),
                            seq(literal('\\'),
                                cut('escape', item))))],
        ['close', cut('"', literal('"'))              ]);


var _char_octal = node('octal',
        ['o'     , literal('o')],
        ['first' , _0_7        ],
        ['rest'  , cut('0-2 octal characters',
                       check(function(cs) {return (cs.length <= 2);},
                             many0(_0_7)))]),
    
    // can I just reuse unicode escape?  
    //   no, because `\u` is okay (but parsed by _char_simple)
    _char_unicode = node('unicode',
        ['open' , literal('u')                              ],
        ['first', _hex                                      ],
        ['rest' , cut('3 hex characters', quantity(3, _hex))]),
    
    _char_long = node('long',
        ['first', item],
        ['rest' , many1(not1(alt(whitespace, _terminatingMacro)))]),

    _char_simple = node('simple',
        ['value', item]),

    _char_extent = node('char catchall',
        ['first', cut('any character', item)                     ],
        ['rest' , many0(not1(alt(whitespace, _terminatingMacro)))]),
    
    _char_catchall = bind(_char_extent, function(n) {
            return cut(n, zero);
        }),
    
    _char_follow = alt(whitespace, _terminatingMacro, not0(item)),
    
    char = node('char',
        ['open' , literal('\\')                                ],
        ['value', alt(_char_octal, _char_unicode,
                      _char_long, _char_simple, _char_catchall)],
        ['follow', cut('illegal following character',
                       lookahead(_char_follow))                ]);
    

var _reserved = node('reserved',
        ['value' , alt(string("nil"), string("true"), string("false"))]),
    
    _ns = node('ns',
        ['value', many1(not1(literal('/')))],
        ['slash', literal('/')             ]),
        
    _name = node('name',
        ['type', alt(seq2R(string('::'), pure('autokey')),
                     seq2R(literal(':'), pure('keyword')),
                     pure('symbol'))],
        ['ns'  , optional(_ns)      ],
        ['name', many1(item)        ]),

    _ident = node('ident',
        ['value', alt(seq2L(_reserved, not0(item)), _name)]),
    
    _ident_pre = seq(alt(not1(alt(whitespace, _macro)), literal('%')),
                     many0(not1(alt(whitespace, _terminatingMacro)))),
    
    ident = bind(getState, function(pos) {
            return bind(_ident_pre, function(p) {
                var chars = p[0] + p[1].join('');
                // TODO I feel like there's a better way to do this
                var id = _ident.parse(chars, pos);
                switch (id.status) {
                    case 'success': return pure(id.value.result);
                    case 'error': return error(id.value);
                    case 'failure': return zero;
                    default: throw new Error('unexpected status -- ' + id.status);
                }
            });
        });

// to allow mutual recursion
var form = error('unimplemented'),
    discard = error('unimplemented');

var junk = many0(alt(whitespace, comment, discard));

function munch(tok) {
    return seq2L(tok, junk);
}

discard.parse = node('discard',
    ['open' , munch(string('#_'))],
    ['value', cut('form', form)  ]).parse;

function punc(str) {
    return munch(node(str,
        ['value', string(str)]));
}

// tokens:
//   - ( ) [ ] { } 
//   - regex, string, number, ident, char
//   - #( #{ #^ #_ #= #'
//   - ' ^ ` ~ ~@ @
//   - comment, whitespace
// not tokens:
//   - starts token: #" #!
//   - starts token: \ " ; %
//   - just weird: #<
var op    = punc('(')  ,
    cp    = punc(')')  ,
    os    = punc('[')  ,
    cs    = punc(']')  ,
    oc    = punc('{')  ,
    cc    = punc('}')  ,
    of    = punc('#(') ,
    oset  = punc('#{') ,
    ometa = punc('#^') ,
    oeval = punc('#=') ,
    ovar  = punc("#'") ,
    qt    = punc("'")  ,
    pow   = punc('^')  ,
    bt    = punc('`')  ,
    uqs   = punc('~@') ,
    uq    = punc('~')  ,
    at    = punc('@')  ;


var list = node('list',
        ['open' , op              ],
        ['body' , many0(form)     ],
        ['close', cut('close', cp)]),
    
    vector = node('vector',
        ['open' , os              ],
        ['body' , many0(form)     ],
        ['close', cut('close', cs)]),
    
    table = node('table',
        ['open' , oc              ],
        ['body' , many0(form)     ],
        ['close', cut('close', cc)]),

    quote = node('quote',
        ['open' , qt                ],
        ['value', cut('value', form)]),
                   
    deref = node('deref',
        ['open' , at                ],
        ['value', cut('value', form)]),
    
    unquoteSplicing = node('unquote-splicing',
        ['open' , uqs               ],
        ['value', cut('value', form)]),

    unquote = node('unquote',
        ['open' , uq                ],
        ['value', cut('value', form)]),
    
    syntaxQuote = node('syntax-quote',
        ['open' , bt                ],
        ['value', cut('value', form)]);


var function_ = node('function',
        ['open' , of              ],
        ['body' , many0(form)     ],
        ['close', cut('close', cp)]),
    
    set = node('set',
        ['open' , oset            ],
        ['body' , many0(form)     ],
        ['close', cut('close', cc)]),
    
    meta = node('metadata',
        ['open'    , alt(ometa, pow)      ],
        ['metadata', cut('metadata', form)],
        ['value'   , cut('value', form)   ]),

    eval_ = node('eval',
        ['open' , oeval             ],
        ['value', cut('value', form)]),
    
    var_ = node('var',
        ['open' , ovar              ],
        ['value', cut('value', form)]),
    
    unreadable = node('unreadable dispatch',
        ['open' , string('#<')         ],
        ['value', cut('anything', zero)]),
    
    dispatch = node('unknown dispatch',
        ['open' , literal('#')                 ],
        ['value', cut('dispatch character', zero)]);


form.parse = alt(
        munch(clojure_string), munch(number),
        munch(char), munch(ident), munch(regex),
        list, vector, set, table,
        function_, deref, quote,
        unquoteSplicing, unquote,
        syntaxQuote, meta,
        eval_, var_, unreadable, dispatch
    ).parse;


var clojure = node('clojure',
    ['junk' , junk       ],
    ['forms', many0(form)]);



var groups = new Dict({
    'clojure'   : 'clojure',
    
    'metadata'  : 'metadata',
    
    'number'    : 'token',
    'ident'     : 'token',
    'string'    : 'token',
    'regex'     : 'token',
    'char'      : 'token',
    
    'quote'     : 'hasValue',
    'deref'     : 'hasValue',
    'var'       : 'hasValue',
    'unquote'   : 'hasValue',
    'eval'      : 'hasValue',
    'syntax-quote': 'hasValue',
    'unquote-splicing': 'hasValue',
    
    'list'      : 'hasBody',
    'vector'    : 'hasBody',
    'table'     : 'hasBody',
    'function'  : 'hasBody',
    'set'       : 'hasBody',
});


function parse(input) {
    var init_position = [1, 1],
        parser = seq2L(clojure, cut('end', not0(item)));
    return parser.parse(input, init_position).fmap(function(value) {
        return value.result;
    });
}



module.exports = {
    // convenience functions
    'parse'         : parse         ,
    
    // "top-level" parsers
    'clojure'       : clojure       ,
    'form'          : form          ,
    // delimited parsers
    'list'          : list          ,
    'vector'        : vector        ,
    'set'           : set           ,
    'table'         : table         ,
    'function'      : function_     ,
    'deref'         : deref         ,
    'quote'         : quote         ,
    'unquote'       : unquote       ,
    'unquoteSplicing': unquoteSplicing,
    'syntaxQuote'   : syntaxQuote   ,
    'meta'          : meta          ,
    'eval'          : eval_         ,
    'var'           : var_          ,
    // token parsers
    'number'        : number        ,
    'ident'         : ident         ,
    'char'          : char          ,
    'string'        : clojure_string,
    'regex'         : regex         ,
    // `private` token helper parsers
    '_number': {
        '_integer': {
            'base16' : _base16 ,
            'base8'  : _base8  ,
            'base10' : _base10 ,
            'zero'   : _zero   ,
            'baseN'  : _baseN
        },
        'integer': integer,
        'ratio'  : ratio  ,
        'float'  : float  ,
    },
    // junk parsers
    'comment'       : comment       ,
    'whitespace'    : whitespace    ,
    'discard'       : discard       ,
    // additional parsers
    'unreadable'    : unreadable    ,
    'dispatch'      : dispatch      ,
    
    // not parsers -- divide node types into groups by fields
    'nodeGroups'    : groups        ,
};


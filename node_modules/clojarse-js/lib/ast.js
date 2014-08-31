'use strict';

var S = require('data-js').Set;


function _struct(type) {
    return function (pos, elems) {
        return {
            '_tag' : 'struct',
            'type' : type    ,
            'pos'  : pos     ,
            'meta' : []      ,
            'elems': elems
        };
    };
}

function _token(type, keys) {
    return function(/* arg ... */) {
        var tok = {
            '_tag': 'token',
            'meta': []     ,
            'type': type   ,
        };
        var extract = ['pos'].concat(keys);
        var args = Array.prototype.slice.call(arguments);
        // copy key/vals from node to tok, checking for dupes and missing keys
        extract.map(function(k, ix) {
            if ( tok.hasOwnProperty(k) ) {
                throw new Error('duplicate key in token: ' + k);
            } else if ( ix >= args.length ) {
                throw new Error('too few arguments while building AST token');
            }
            tok[k] = args[ix];
        });
        return tok;
    };
}


var dump = (function() {

    var ignore = new S(['_tag', 'type', 'meta', 'pos']);

    // make a copy of an object, minus certain keys
    function extract(token) {
        var obj = {};
        Object.keys(token).map(function(k) {
            if ( !ignore.has(k) ) {
                obj[k] = token[k];
            }
        });
        return obj;
    }

    function dump_help(node, lines, depth) {
        lines.push(depth + node.type + ' at ' + node.pos);
        node.meta.map(function(m) { dump_help(m, lines, depth + '        '); });
        if ( node._tag === 'struct' ) {
            node.elems.map(function(e) {
                dump_help(e, lines, depth + '  ');
            });
        } else if ( node._tag === 'token' ) {
            lines.push(depth + '  ' + JSON.stringify(extract(node)));
        } else {
            throw new Error('unrecognized node type -- ' + node._tag + JSON.stringify(node));
        }
    }

    function dump(node) {
        var lines = [];
        dump_help(node, lines, '');
        return lines.join('\n');
    }

    return dump;

})();


module.exports = {
    // structs
    'list'    : _struct('list')    ,
    'vector'  : _struct('vector')  ,
    'set'     : _struct('set')     ,
    'table'   : _struct('table')   ,
    'function': _struct('function'),
    'clojure' : _struct('clojure') ,
    // one-element structs
    'syntax-quote' : _struct('syntax-quote'),
    'eval'         : _struct('eval'),
    // tokens
    'integer' : _token('integer' , ['sign', 'suffix', 'base', 'digits'])             ,
    'ratio'   : _token('ratio'   , ['numerator', 'denominator', 'sign'])             ,
    'float'   : _token('float'   , ['sign', 'int', 'decimal', 'exponent', 'suffix']) ,
    'symbol'  : _token('symbol'  , ['ns', 'name'])   ,
    'keyword' : _token('keyword' , ['ns', 'name'])   ,
    'autokey' : _token('autokey' , ['ns', 'name'])   ,
    'char'    : _token('char'    , ['kind', 'value']),
    'string'  : _token('string'  , ['value'])        ,
    'regex'   : _token('regex'   , ['value'])        ,
    'reserved': _token('reserved', ['value'])        ,
    
    // utility functions
    'dump': dump // ast to string
};


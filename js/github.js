'use strict';


var $ = require('jquery'),
    Buff = require('buffer/').Buffer;

function extractPaths(items) {
    var paths = {};
    items.forEach(function(entry) {
        if ( entry.type === 'file' ) {
            paths[entry.name] = entry.url;
        }
    });
    return paths;
}

function dir(callback, path) {
    var response,
        stat;
    function f(data, status, _jqXHR) {
        if ( status === 'error' ) {
            callback(data, 'request error');
        } else if ( status === 'success' ) {
            if ( data.meta.status === 200 ) {
                try {
                    response = extractPaths(data.data);
                    stat = 'success';
                } catch(e) {
                    response = e;
                    stat = 'data error';
                }
                callback(response, stat);
            } else {
                callback(data, 'api error');
            }
        }
    }
    $.ajax({
        'url'       : path ? path : 'https://api.github.com/repos/clojure/clojure/contents/src/clj/clojure',
        'dataType'  : 'jsonp',
        'success'   : f      ,
        'error'     : f      ,
    });
}

function decode(base64string) {
    return new Buff(base64string, 'base64').toString();
}

function file(callback, path) {
    // callback receives 2 args:
    //   1. data
    //   2. status -- 'request error' | 'api error' | 'data error' | 'success'
    function f(data, status, _jqXHR) {
        // provides an adapter to simplify `callback`:
        //   1. doesn't pass the jqXHR
        //   2. three statuses:
        //      success, api error, request error
        //   3. for success, extracts and base64-decodes content
        var response,
            stat;
        if ( status === 'error' ) {
            callback(data, 'request error');
        } else if ( status === 'success' ) {
            if ( data.meta.status === 200 ) {
                try {
                    response = decode(data.data.content);
                    stat = 'success';
                } catch(e) {
                    response = e;
                    stat = 'data error';
                }
                callback(response, stat);
            } else {
                callback(data, 'api error');
            }
        }
    }
    $.ajax({
        'url'       : path ? path : 'https://api.github.com/repos/clojure/clojure/contents/src/clj/clojure/edn.clj',
        'dataType'  : 'jsonp',
        'success'   : f      ,
        'error'     : f      ,
    });
}


module.exports = {
    'dir'           : dir           ,
    'file'          : file          ,
    'decode'        : decode        ,
    'extractPaths'  : extractPaths  ,
    'Buffer'        : Buff          ,
    '$'             : $             ,
};


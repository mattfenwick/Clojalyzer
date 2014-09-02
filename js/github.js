'use strict';


var $ = require('jquery'),
    Buff = require('buffer/').Buffer;


function Github(log) {
    this.log = log;
}

function extractPaths(items) {
    var paths = {};
    items.forEach(function(entry) {
        if ( entry.path.endsWith('.clj') ) {
            paths[entry.path] = entry.url;
        }
    });
    return paths;
}

Github.prototype.dir = function(callback, path) {
    var self = this;
    function f(data, status, _jqXHR) {
        var response,
            stat;
        self.log.push({'type': 'AJAX tree request', 'data': data, 'status': status, 'jqXHR': _jqXHR});
        if ( status === 'error' ) {
            callback(data, 'request error');
        } else if ( status === 'success' ) {
            if ( data.meta.status === 200 ) {
                try {
                    response = extractPaths(data.data.tree);
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
        'url'       : path   ,
        'dataType'  : 'jsonp',
        'success'   : f      ,
        'error'     : f      ,
    });
};

function decode(base64string) {
    return new Buff(base64string, 'base64').toString();
}

Github.prototype.file = function(callback, path) {
    // callback receives 2 args:
    //   1. data
    //   2. status -- 'request error' | 'api error' | 'data error' | 'success'
    var self = this;
    function f(data, status, _jqXHR) {
        // provides an adapter to simplify `callback`:
        //   1. doesn't pass the jqXHR
        //   2. three statuses:
        //      success, api error, request error
        //   3. for success, extracts and base64-decodes content
        var response,
            stat;
        self.log.push({'type': 'AJAX file request', 'data': data, 'status': status, 'jqXHR': _jqXHR});
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
        'url'       : path   ,
        'dataType'  : 'jsonp',
        'success'   : f      ,
        'error'     : f      ,
    });
};


module.exports = {
    'Github'      : Github      ,
    'extractPaths': extractPaths,
    'decode'      : decode      ,
};


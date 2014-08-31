'use strict';

var model = require('./model.js');


function tag(name) {
    return function(attrs /* children */) {
        var wrapped_attrs = Object.keys(attrs).map(function(a) {
            return new model.Attribute(a, attrs[a]);
        });
        var children = Array.prototype.slice.call(arguments, 1);
        var kids = children.map(function(c) {
            if ( typeof c === 'string' ) { return new model.Text(c);}
            return c;
        });
        return new model.Element(name, wrapped_attrs, kids);
    };
}

function root(dtype /* children */) {
    // do we allow strings as children of root?  let's assume no for now
    return new model.Root(dtype, Array.prototype.slice.call(arguments, 1));
}

function elem(name, attrs, kids) {
    // escape hatch -- tag of any name
    // also handy to avoid having to `tagfunc.apply` tag functions
    return tag(name).apply(null, [attrs].concat(kids));
}


// list of more elements: https://developer.mozilla.org/en-US/docs/Web/HTML/Element
module.exports = {
    'root'    : root,
    'comment' : function(text) {return new model.Comment(text);},

    'html'  : tag('html'),
    'title' : tag('title'),
    'body'  : tag('body'),
    'head'  : tag('head'),

    'div'   : tag('div'),
    'p'     : tag('p')  ,
    'pre'   : tag('pre'),
    
    'ul'    : tag('ul'),
    'ol'    : tag('ol'),
    'li'    : tag('li'),

    'table' : tag('table'),
    'tr'    : tag('tr'),
    'th'    : tag('th'),
    'td'    : tag('td'),
    'tbody' : tag('tbody'),
    'tfoot' : tag('tfoot'),
    'thead' : tag('thead'),
    
    // escape hatches
    'tag'   : tag,
    'elem'  : elem,
};


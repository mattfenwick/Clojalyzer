'use strict';

var h = require('./html.js'),
    s = require('./serialize.js'),
    root = h.root, table = h.table,
    tr = h.tr, th = h.th, td = h.td,
    comment = h.comment;

var tree = root('html',
                table({},
                      tr({},
                         th({},
                            'hello!')),
                      tr({},
                         td({'hello': 'plunger',
                             'arg': 'fac<e',
                             'weasel': 'an animal has >&<\'" crazy chars',
                             'um': null},
                            'such silly text -- with &<>"\' crazy chars',
                            comment('crazy chars &<>"\' just passed')))));

console.log(JSON.stringify(tree));

module.exports = {
    'tree': tree,
    'string': s.serialize(tree)
};


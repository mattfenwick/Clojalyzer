'use strict';

var D = require('./dict');


function Set(elems) {
    this.dict = new D({});
    var self = this;
    elems.map(function(e) {
        self.add(e);
    });
}

Set.prototype.add = function(key) {
    this.dict.set(key, 1);
};

Set.prototype.has = function(key) {
    return this.dict.has(key);
};

Set.prototype.remove = function(key) {
    return this.dict.remove(key);
};

Set.prototype.keys = function() {
    return this.dict.keys();
};

Set.prototype.toJSON = function() {
    return {'type': 'Set', 'elements': this.keys()};
};

Set.prototype.toString = function() {
    return JSON.stringify(this.toJSON());
};


module.exports = Set;


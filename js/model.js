'use strict';


function Model(dataAccess) {
    this.dataAccess = dataAccess;
    this.listeners = [];
    this.repo = undefined;
    this.file = undefined;
}

Model.prototype.setRepo = function(path) {
    var self = this;
    function f(response, status) {
        self.repo = {
            'path'    : path    ,
            'response': response,
            'status'  : status  ,
        };
        self.notify('setRepo');
    }
    this.dataAccess.dir(f, path);
};

Model.prototype.setFile = function(filename) {
    var self = this,
        url = self.repo.path + '/' + filename;
    function f(response, status) {
        self.file = {
            'filename': filename,
            'response': response,
            'status'  : status  ,
        };
        self.notify('setFile');
    }
    this.dataAccess.file(f, url);
};

Model.prototype.notify = function() {
    // send event off to listeners
    var args = Array.prototype.slice.call(arguments);
    this.listeners.forEach(function(f) {
        f.apply(null, args);
    });
};

Model.prototype.listen = function(l) {
    this.listeners.push(l);
};



module.exports = Model;


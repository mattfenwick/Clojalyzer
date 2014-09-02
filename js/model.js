'use strict';


function Model(dataAccess) {
    this.dataAccess = dataAccess;
    this.listeners = [];
    this.repo = undefined;
    this.file = undefined;
}

Model.prototype.setRepo = function(user, repo, branch) {
    var self = this,
        path = 'https://api.github.com/repos/' + user + '/' + repo + '/git/trees/' + branch + '?recursive=1';
    function f(response, status) {
        self.repo = {
            'user'    : user    ,
            'repo'    : repo    ,
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
        url = self.repo.response[filename];
    if ( !url ) {
        self.file = {
            'filename': filename          ,
            'status'  : 'illegal filename',
        };
        self.notify('setFile');
        return;
    }
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
    var args = Array.prototype.slice.call(arguments);
    this.listeners.forEach(function(f) {
        f.apply(null, args);
    });
};

Model.prototype.listen = function(l) {
    this.listeners.push(l);
};



module.exports = Model;


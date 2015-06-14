'use strict';

var EventEmitter = require('events').EventEmitter;
var bitdog = require('../bitdog.js');
var logger = require('../logger.js');
var configuration = require('../configuration.js');
var temp = require('temp').track();
var fs = require('fs');
var util = require('util');
var userCodePath = '';
var userCodeServer = null;


function UserCodeServer() {

    this.storeCode = function (code) {
        this.stop();
        var tempFile = temp.openSync('botdog', 'w');
        var buffer = new Buffer(code, 'utf8');
        fs.writeSync(tempFile.fd, buffer, 0, buffer.length);
        fs.close(tempFile.fd);
        return userCodePath = tempFile.path;
    };

   
}

util.inherits(UserCodeServer, EventEmitter);


UserCodeServer.prototype.start = function () {

    bitdog.start();

};

UserCodeServer.prototype.stop = function () { 

};


process.on('disconnect', function () {
    process.kill();
});

process.on('message', function (message) {
    
    if (typeof message != 'undefined' && typeof message.name != 'undefined') {
        switch (message.name) {
            case 'start':
                userCodeServer.start();
                break;
            case 'stop':
                userCodeServer.stop();
                break;
            case 'message':
                break;
 
            
        }
    }

});

// Singleton export 
module.exports = userCodeServer = new UserCodeServer();
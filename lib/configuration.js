"use strict";
var constants = require('./constants.js');
var path = require('path');
var configFilePath = path.resolve(__dirname, '../bin', constants.CONFIGURATION_FILENAME);
var logFilePath = path.resolve(__dirname, '../log',constants.LOG_FILE_NAME);
var agentPidFilePath = path.resolve(__dirname, '../run', constants.AGENT_PID_FILE_NAME);

function Configuration() {
    var self = this;

    var _nconf = require('nconf');
    var defaults = {};
    
    try {
        _nconf.use('file', { file: configFilePath });
    }
    catch (ex) {
        console.log(ex);
    }
    
    try {
        _nconf.load();
    }
    catch (ex) {
        console.log(ex);
    }
    
    defaults[constants.AUTH_KEY_NAME] = '';
    defaults[constants.LOG_MESSAGES] = true;
    defaults[constants.LOG_CONNECTION_EVENTS] = true;
    defaults[constants.LOG_PROCESS_EVENTS] = true;
    
    _nconf.defaults(defaults);
        
    
    this.__defineGetter__('authKey', function () {
        _nconf.load();
        return _nconf.get(constants.AUTH_KEY_NAME);
    });;
    
    this.__defineSetter__('authKey', function (value) {
        _nconf.set(constants.AUTH_KEY_NAME, value)
        _nconf.save();
    });
    
    this.__defineGetter__('shouldLogMessages', function () {
        return _nconf.get(constants.LOG_MESSAGES);
    });
    
    this.__defineSetter__('shouldLogMessages', function (value) {
        _nconf.set(constants.LOG_MESSAGES, value);
        _nconf.save();
    });
   
    this.__defineGetter__('shouldLogConnectionEvents', function () {
        return _nconf.get(constants.LOG_CONNECTION_EVENTS);
    });
    
    this.__defineSetter__('shouldLogConnectionEvents', function (value) {
        _nconf.set(constants.LOG_CONNECTION_EVENTS, value);
        _nconf.save();
    });
    
    this.__defineGetter__('shouldLogProcessEvents', function () {
        return _nconf.get(constants.LOG_PROCESS_EVENTS);
    });

    this.__defineSetter__('shouldLogProcessEvents', function (value) {
        _nconf.set(constants.LOG_PROCESS_EVENTS, value);
        _nconf.save();
    });
    
    this.__defineGetter__('shouldSuppressLogo', function (value) {
        return _nconf.get(constants.LOG_SUPPRESS_LOGO);
    });

    this.__defineGetter__('passwordHash', function () {
        return _nconf.get(constants.PASSWORDHASH);
    });
    
    this.__defineSetter__('passwordHash', function (value) {
        _nconf.set(constants.PASSWORDHASH, value);
        _nconf.save();
    });

    this.__defineGetter__('userName', function () {
        return _nconf.get(constants.USERNAME);
    });
    
    this.__defineSetter__('userName', function (value) {
        _nconf.set(constants.USERNAME, value);
        _nconf.save();
    });

    this.__defineGetter__('webadminPort', function () {
        return _nconf.get(constants.WEBADMIN_PORT);
    });
    
    this.__defineGetter__('webadminEnable', function () {
        return _nconf.get(constants.WEBADMIN_ENABLE);
    });

    this.__defineGetter__('isRegistered', function () {
        return self.authKey.length > 30;
    });
    
    this.__defineGetter__('configFilePath', function () {
        return configFilePath;
    });

    this.__defineGetter__('logFilePath', function () {
        return logFilePath;
    });

    this.__defineGetter__('agentPidFilePath', function () {
        return agentPidFilePath;
    });
    
}

module.exports = new Configuration();

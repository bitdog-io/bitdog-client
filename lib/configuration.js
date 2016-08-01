"use strict";
var constants = require('./constants.js');
var path = require('path');
var configFilePath = path.resolve(__dirname, '../bin', constants.CONFIGURATION_FILENAME);
var logFilePath = path.resolve(__dirname, '../logs',constants.LOG_FILE_NAME);
var agentPidFilePath = path.resolve(__dirname, '../run', constants.AGENT_PID_FILE_NAME);

var _nconf = require('nconf');

function Configuration() {
    var self = this;

    
    var defaults = {
        "auth_key": "1",
        "logging": {
            "log_messages": true,
            "log_connection_events": true,
            "log_process_events": true,
            "log_suppress_logo": false,
            "log_file_path": logFilePath
        },
        "webadmin": {
            "enable": true,
            "port": "auto",
            "username": "admin",
            "password_hash": "sha512$1ecbdaf6c78e519e11746269c53a28861497611f517ee04a58221268ea2d58ae$4096$57022691166bfc94582290936f19aae79a15bca1bf86a3136a0965b499e964a29041fe9f0e8c277d854acf032b51471b882fcfa60c578a2092735c116f84ee2e"
        },
        "node_id": "",
        "data_collection": {
            "performace_poll_seconds": 300
        }

    };
    
    
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
    
    this.__defineGetter__('nodeId', function () {
        return _nconf.get(constants.NODE_ID);
    });
    
    this.__defineSetter__('nodeId', function (value) {
        _nconf.set(constants.NODE_ID, value);
        _nconf.save();
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
        return _nconf.get(constants.LOG_FILE_PATH);
    });

    this.__defineGetter__('agentPidFilePath', function () {
        return agentPidFilePath;
    });
    
    this.__defineGetter__('performancePollSeconds', function () {
        return _nconf.get(constants.PERFORMANCE_POLL_SECONDS);
    });

    
    
}

Configuration.prototype.set = function(key, value) {
    _nconf.set(key, value);
    _nconf.save();
}

Configuration.prototype.get = function(key) {
    return _nconf.get(key);
}

module.exports = new Configuration();

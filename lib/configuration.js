"use strict";
var fs = require('fs');

var constants = require('./constants.js');
var path = require('path');
var configFilePath = "";
var configPath = "";
var logFilePath = "";

var _nconf = require('nconf');

function Configuration() {
    var self = this;
    
    if (fs.existsSync(path.resolve(process.cwd(), 'logs'))) {
        logFilePath = path.resolve(process.cwd(), 'logs', constants.LOG_FILE_NAME);
    } else {
        logFilePath = path.resolve(process.cwd(), constants.LOG_FILE_NAME);
    }
    
    if (fs.existsSync(path.resolve(process.cwd(), 'config' , constants.CONFIGURATION_FILENAME))) {
        configFilePath = path.resolve(process.cwd(), 'config', constants.CONFIGURATION_FILENAME);
        configPath = path.resolve(process.cwd(), 'config');
    } else {
        configFilePath = path.resolve(process.cwd(), constants.CONFIGURATION_FILENAME);
        configPath = process.cwd();
    }
    

    var defaults = {
        "auth_key": "1",
        "logging": {
            "log_messages": true,
            "log_connection_events": true,
            "log_process_events": true,
            "log_suppress_logo": false,
            "log_file_path": logFilePath,
            "log_file_size": "3m",
            "log_file_keep_number_of_files": 5,
            "log_to_console": true
        },
        "node_id": "",
        "data_collection": {
            "performace_poll_seconds": 600
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

    this.__defineGetter__('shouldLogJson', function () {
        return _nconf.get(constants.LOG_JSON) === true;
    });

    this.__defineSetter__('shouldLogProcessEvents', function (value) {
        _nconf.set(constants.LOG_PROCESS_EVENTS, value);
        _nconf.save();
    });
    
    this.__defineGetter__('shouldSuppressLogo', function (value) {
        return _nconf.get(constants.LOG_SUPPRESS_LOGO);
    });

    this.__defineGetter__('nodeId', function () {
        _nconf.load();
        return _nconf.get(constants.NODE_ID);
    });
    
    this.__defineSetter__('nodeId', function (value) {
        _nconf.set(constants.NODE_ID, value);
        _nconf.save();
    });

    this.__defineGetter__('isRegistered', function () {
        return self.authKey.length > 30;
    });
    
    this.__defineGetter__('configFilePath', function () {
        return configFilePath;
    });

    this.__defineGetter__('configPath', function () {
        return configPath;
    });

    this.__defineGetter__('logFileSize', function () {
        return _nconf.get(constants.LOG_FILE_SIZE);
    });

    this.__defineGetter__('logFileKeep', function () {
        return _nconf.get(constants.LOG_FILE_KEEP);
    });

    this.__defineGetter__('logFilePath', function () {
        return _nconf.get(constants.LOG_FILE_PATH);
    });

    this.__defineSetter__('logFilePath', function (value) {
        _nconf.set(constants.LOG_FILE_PATH, value);
        _nconf.save();
        var logger = require('./logger.js');
        logger.reset();
    });

    this.__defineGetter__('performancePollSeconds', function () {
        return _nconf.get(constants.PERFORMANCE_POLL_SECONDS);
    });

    this.__defineGetter__('logToConsole', function () {
        return _nconf.get(constants.LOG_TO_CONSOLE);
    });

    this.__defineSetter__('logToConsole', function (value) {
        _nconf.set(constants.LOG_TO_CONSOLE, value);
        _nconf.save();
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

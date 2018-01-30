"use strict";
var configuration = require('./configuration.js');
var os = require('os');
var moment = require('moment');
var constants = require('./constants.js');
var logStream = require('logrotate-stream');


function Logger() {

    var logFormatters = [];
    var toLogFile = logStream({ file: configuration.logFilePath, size: configuration.logFileSize, keep: configuration.logFileKeep });

    // Diagnostic logging handler
    this.log = function (category, text, arg) {

        if (this.shouldLog(category)) {

            var logFormatHandled = false;
            var logText = null;

            for (var index = 0; index < logFormatters.length; index++) {
                logFormatHandled = logFormatters[index](category, text, arg);

                if (logFormatHandled === true)
                    return;
            }

            this.logFormatted(category, text, arg);

        }


    };

    this.logFormatted = function (category, text, arg) {
        if (configuration.shouldLogJson === true) {
            var json = { time: moment().format(), text: text, category: category, arg: arg };
            logText = JSON.stringify(arg, null, 2);
        }
        else {

            if (typeof arg !== typeof undefined) {
                logText = text + os.EOL + JSON.stringify(arg, null, 2);
            } else {
                logText = text;
            }

            logText = moment().format() + ' ' + category + ': ' + logText;
        }

        toLogFile.write(logText + os.EOL);

        if (configuration.logToConsole === true)
            console.log(logText);

    }

    this.logMessage = function (text, arg) {
        this.log(constants.LOG_CATEGORY_MESSAGE, text, arg);
    };

    this.logProcessEvent = function (processName, text, arg) {
        this.log(constants.LOG_CATEGORY_PROCESS_EVENT, processName + ' ' + text, arg);
    };

    this.reset = function () {
        toLogFile.end('reset log to ' + configuration.logFilePath);
        toLogFile = logStream({ file: configuration.logFilePath, size: configuration.logFileSize, keep: configuration.logFileKeep });
    }

    this.shouldLog = function (category) {
        switch (category) {
            case constants.LOG_CATEGORY_MESSAGE:
                return configuration.shouldLogMessages;
            case constants.LOG_CATEGORY_PROCESS_EVENT:
                return configuration.shouldLogProcessEvents;
            case constants.LOG_CATEGORY_CONNECTION_EVENT:
                return configuration.shouldLogConnectionEvents;
            default:
                return true;

        }
    };


    this.addLogFormatter = function (formatter) {
        logFormatters.push(formatter);
    };

    this.removeLogFormatter = function (formatter) {
        for (var index = 0; index < logFormatters.length; index++) {
            if (logFormatters[index] === formatter) {
                logFormatters.splice(index, 1);
                break;
            }
        }
    };
}

module.exports = new Logger();
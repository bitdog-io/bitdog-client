'use strict';
var Command = require('./command.js');
var HashTable = require('./hashtable.js');
var configuration = require('./configuration.js');
var logger = require('./logger.js');
var constants = require('./constants.js');
var CommandInterface = require('./commandInterface.js');

function CommandManager(session) {

    var _commands = new HashTable();
    var _isRunning = false;
    var _messageDefinitionCopyHeloer = require('./helpers.js').messageDefinitionCopyHeloer;

    
    this.add = function (name, messageSchema, executeCallback, startCallback, stopCallback, hidden) {

        if (typeof hidden === typeof undefined || hidden === null)
            hidden = false;

        var command = new Command(name, messageSchema, hidden);
        
        if(executeCallback)
            command.onExecute = executeCallback;
        if (startCallback)
            command.onStart = startCallback;
        if (stopCallback)
            command.onStop = stopCallback;

        _commands.put(command.getId(), command);

        return new CommandInterface(command);
    };

    this.start = function () {
        if (!_isRunning) {
            _isRunning = true;
			_commands.each(function (key, command) {
				command.start();
            });
        }
    };

    this.stop = function () {
        if (_isRunning) {
            _isRunning = false;
			_commands.each(function (key, command) {
                command.stop();
            });
        }
    };
    
    this.execute = function (message) {
        if (_isRunning) {
            var command = _commands.get(this.getId(message));
            
            if (command == null) {
                var errorMessage = 'Did not find command to execute with id of ' + this.getId(message);
                logger.log(constants.LOG_CATEGORY_ERROR, errorMessage, message);
                return { status: 'error', message: errorMessage, transactionId: message.c.x, destinationId: message.c.n };
            }
            else {
                return command.execute(message, configuration, logger);
            }

        }
    };
    
    this.getId = function(message) {
        return message.h.n;
    };

    this.__defineGetter__('connection', function () {
        return connection;
    });

    this.__defineGetter__('commands', function () {
        var values = _commands.values();
        values.copyTo = function (destination) {
            _messageDefinitionCopyHeloer(values, destination);
        };
        return values;
    });
};

module.exports = CommandManager;
var constants = require('./constants.js');
var logger = require('./logger.js');

function Command(name, messageSchema) {

    this.start = function (logger) {
        
        if (this.onStart) {
            
            try {
                this.onStart(logger);
            }
            catch (exception) {
                var errorMessage = 'Command: ' + this.name + ' threw exception on start.' + os.EOL + exception.stack;
                logger.log(constants.LOG_CATEGORY_ERROR, errorMessage);
            }
        }
    };
    
    this.execute = function (message, configuration, logger) {
        
        if (this.onExecute) {
            
            try {
                this.onExecute(message.d, configuration, logger);
            } catch (exception) {
                var errorMessage = 'Command: ' + this.name + ' threw exception on execute' + os.EOL + exception.stack;
                logger.log(constants.LOG_CATEGORY_ERROR, errorMessage);
            }

        }

    };
    
    this.stop = function (logger) {
        if (this.onStop) {
            try {
                this.onStop(logger);
            }
            catch (exception) {
                var errorMessage = 'Command: ' + this.name + ' threw exception on stop ' + os.EOL + exception.stack;
                logger.log(constants.LOG_CATEGORY_ERROR, errorMessage);

            }
        }
    };
    
    this.getId = function () {
        return name;
    };

    this.getMessageDefinition = function () {
        return messageSchema.getMessageDefinition(constants.MESSAGE_CLASS_COMMAND, name);
    };
    
    this.createMessage = function () {
        var message = messageSchema.createMessage(constants.MESSAGE_CLASS_COMMAND,name);
        return message;
    }

    // Getter Setters
 
    this.__defineGetter__('name', function () {
        return name;
    });
    
    this.__defineGetter__("messageSchema", function () {
        return messageSchema;
    });
};

module.exports = Command;
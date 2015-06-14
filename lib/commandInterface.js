var configuration = require('./configuration.js');
var logger = require('./logger.js');

function CommandInterface(command)
{
    this.execute = function (callback) {
        var message = command.createMessage();

        callback.call(null, message);

        command.execute(message, configuration, logger);
    };

}

module.exports = CommandInterface;
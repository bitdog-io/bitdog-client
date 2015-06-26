var constants = require('./constants.js');
var bitdog = require('./bitdog.js');
var os = require('os');

function CoreMessageSchemas()
{

    var _configurationMessageSchema = bitdog.createMessageSchema(constants.MESSAGE_SCHEMA_CONFIGURATION)
    // Add a array property
    .addArrayProperty('messageTypes', [])
    .addStringProperty('platform', process.platform)
    .addStringProperty('architecture', process.arch)
    .addObjectProperty('versions', process.versions)
    .addStringProperty('title', process.title)
    .addStringProperty('osType', os.type())
    .addStringProperty('filepath', process.mainModule.filename)
    .addStringProperty('macAddress','');
    
    var _sendConfigurationMessageSchema = bitdog.createMessageSchema(constants.MESSAGE_SCHEMA_SEND_CONFIGURATION);

    var _updateDataMessageSchema = bitdog.createMessageSchema(constants.MESSAGE_SCHEMA_UPDATE_DATA)
    .addStringProperty('dataId', '');

    var _logMessageSchema = bitdog.createMessageSchema(constants.MESSAGE_SCHEMA_LOG)
    // Add a string property
    .addStringProperty('text', '')
    // Add a object property
    .addObjectProperty('arguments', null);
    
    var _performanceMessageSchema = bitdog.createMessageSchema(constants.MESSAGE_SCHEMA_PERFORMANCE)
    // Returns the amount of free system memory in bytes. 
    .addNumberProperty('freeMemory', 0)
    // Returns the system uptime in seconds. 
    .addNumberProperty('uptime', 0)
    // Returns an array containing the 1, 5, and 15 minute load averages
    .addArrayProperty('loadAverage', [])
     // Returns the total amount of system memory in bytes. 
    .addNumberProperty('totalMemory', 0)
    // Returns the bitdog process uptime in seconds.
    .addNumberProperty('uptimeProcess', 0);
    
    var _subscriptionMessageSchema = bitdog.createMessageSchema(constants.MESSAGE_SCHEMA_SUBSCRIPTION)
    .addStringProperty('i', '*')
    .addStringProperty('n', '*')
    .addStringProperty('m', 'add', { values: ['add','remove'] } );

    var _questionMessageSchema = bitdog.createMessageSchema(constants.MESSAGE_SCHEMA_QUESTION)
    .addStringProperty('question', '')
    .addStringProperty('answer', '');

    
    this.__defineGetter__('questionMessageSchema', function () {
        return _questionMessageSchema;
    });

    this.__defineGetter__('configurationMessageSchema', function () {
        return _configurationMessageSchema;
    });

    this.__defineGetter__('logMessageSchema', function () {
        return _logMessageSchema;
    });

    this.__defineGetter__('performanceMessageSchema', function () {
        return _performanceMessageSchema;
    });

    this.__defineGetter__('subscriptionMessageSchema', function () {
        return _subscriptionMessageSchema;
    });

    this.__defineGetter__('sendConfigurationMessageSchema', function () {
        return _sendConfigurationMessageSchema;
    });

    this.__defineGetter__('updateDataMessageSchema', function () {
        return _updateDataMessageSchema;
    });

}

module.exports = new CoreMessageSchemas();
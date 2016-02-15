var constants = require('./constants.js');
var bitdog = require('./bitdog.js');
var os = require('os');

function CoreMessageSchemas()
{

    var _configurationMessageSchema = bitdog.createMessageSchema(constants.MESSAGE_SCHEMA_CONFIGURATION)
    // Add a array property
    .addArrayProperty('messageSchemas', [])
    .addStringProperty('platform', process.platform, {}, 'The base platform of the device', 'Platform' )
    .addStringProperty('architecture', process.arch, {}, 'The hardware architecture of the device', 'Architecture')
    .addObjectProperty('versions', process.versions)
    .addStringProperty('title', process.title)
    .addStringProperty('osType', os.type(), {}, 'The operating system type of the device','Operating System')
    .addStringProperty('filepath', process.mainModule.filename)
    .addStringProperty('applicationName', '')
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
    .addNumberProperty('freeMem', 0)
    // Returns the system uptime in seconds. 
    .addNumberProperty('uptime', 0)
    // Returns the cpu load average for the last minute 
    .addNumberProperty('loadAvg1min', 0)
    // Returns the cpu load average for the five minutes
    .addNumberProperty('loadAvg5min', 0)
    // Returns the cpu load average for the last 15 minutes 
    .addNumberProperty('loadAvg15min', 0)
     // Returns the total amount of system memory in bytes. 
    .addNumberProperty('totalMem', 0)
    // Returns the bitdog process uptime in seconds.
    .addNumberProperty('uptimeProcess', 0);
    
    var _subscriptionMessageSchema = bitdog.createMessageSchema(constants.MESSAGE_SCHEMA_SUBSCRIPTION)
    .addStringProperty('i', '*')
    .addStringProperty('n', '*')
    .addStringProperty('m', 'add', { values: ['add','remove'] } );


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
var constants = require('./constants.js');
var bitdog = require('./bitdog.js');
var os = require('os');

function CoreMessageSchemas()
{

    var _configurationMessageSchema = bitdog.createMessageSchema(constants.MESSAGE_SCHEMA_CONFIGURATION)
        // Add a array property
        .addArrayProperty('messageSchemas', [])
        .addStringProperty('platform', process.platform, {}, 'The base platform of the device.', 'Platform')
        .addStringProperty('architecture', process.arch, {}, 'The hardware architecture of the device.', 'Architecture')
        .addObjectProperty('versions', process.versions, {}, 'Library versions.', 'Library Versions')
        .addStringProperty('title', process.title, {},'The client process title','Process Title')
        .addStringProperty('osType', os.type(), {}, 'The operating system type of the device.', 'Operating System')
        .addStringProperty('filepath', process.mainModule.filename, {}, 'The file path of the executable.','File Path')
        .addStringProperty('applicationName', '', {}, 'The application name of the client','Application Name')
        .addStringProperty('macAddress', '', {},'MAC address of the client', 'MAC Address')
        .addObjectProperty('location', null, {}, 'The GPS location of client. This is used for scheduling of daylight hours.', 'Location');
        
    var _sendConfigurationMessageSchema = bitdog.createMessageSchema(constants.MESSAGE_SCHEMA_SEND_CONFIGURATION);

    var _updateDataMessageSchema = bitdog.createMessageSchema(constants.MESSAGE_SCHEMA_UPDATE_DATA)
    .addStringProperty('dataId', '');

    var _logMessageSchema = bitdog.createMessageSchema(constants.MESSAGE_SCHEMA_LOG)
    // Add a string property
    .addStringProperty('text', '')
    // Add a object property
    .addObjectProperty('arguments', null);
    
    var _performanceMessageSchema = bitdog.createMessageSchema(constants.MESSAGE_SCHEMA_PERFORMANCE)
    .addNumberProperty('freeMem', 0, {}, 'The amount of free device memory in kilobytes.','Free Memory', 'kb')
    .addNumberProperty('uptime', 0, {}, 'The system uptime in seconds.','Up Time', 's')
    .addNumberProperty('loadAvg1min', 0, {},'The cpu load average for the last minute.','One Minute Load Average', '%')
    .addNumberProperty('loadAvg5min', 0, {},'The cpu load average for the last five minutes.','Five Minute Load Average', '%')
    .addNumberProperty('loadAvg15min', 0, {}, 'The cpu load average for the last fifteen minutes.', 'Five Minute Load Average', '%')
    .addNumberProperty('totalMem', 0, {}, 'The total amount of device memory in kilobytes.', 'Total Memory', 'kb')
    .addNumberProperty('uptimeProcess', 0, {}, 'The node.js process uptime in seconds.', 'Process Uptime', 's');
    
    var _subscriptionMessageSchema = bitdog.createMessageSchema(constants.MESSAGE_SCHEMA_SUBSCRIPTION)
    .addStringProperty('i', '*')
    .addStringProperty('n', '*')
    .addStringProperty('m', 'add', { values: ['add','remove'] } );

    var _requestMessageSchema = bitdog.createMessageSchema(constants.MESSAGE_CLASS_REQUEST)
        .addObjectProperty('p', null);

    var _commandResultMessageSchema = bitdog.createMessageSchema(constants.MESSAGE_SCHEMA_COMMAND_RESULT)
        .addObjectProperty('result', null);

    this.__defineGetter__('commandResultMessageSchema', function () {
        return _commandResultMessageSchema;
    });

    this.__defineGetter__('configurationMessageSchema', function () {
        return _configurationMessageSchema;
    });
    
    this.__defineGetter__('requestMessageSchema', function () {
        return _requestMessageSchema;
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
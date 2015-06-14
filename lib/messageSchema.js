var HashTable = require('./hashtable.js');
var Uuid = require('node-uuid');

var bitdog = require('./bitdog.js');
var constants = require('./constants.js');

var Message = function (messageClass, messageName, messageSchemaName) {
    this.h = {};
    this.d = {};

    //this.h.t = messageSchemaName;
    
    if (messageClass)
        this.h.c = messageClass;
    
    if (messageName)
        this.h.n = messageName;
    
}

Message.prototype.toString = function () {
    JSON.stringify(_message);
};

function MessageSchema(name)
{
    // Private Memebers
    var _properties = new HashTable();
    var _messageSchemaName = name;

   
    
    // Public Methods

    this.addNumberProperty = function (name, defaultValue,limits) {
        _properties.put(name, { name: name, defaultValue: defaultValue, type: constants.NUMBER_DATA_TYPE , limits: limits});
        return this;
    };
    
    this.addStringProperty = function (name, defaultValue, limits) {
        _properties.put(name, { name: name, defaultValue: defaultValue, type: constants.STRING_DATA_TYPE, limits: limits });
        return this;
    };
    
    this.addDateTimeProperty = function (name, defaultValue, limits) {
        _properties.put(name, { name: name, defaultValue: defaultValue, type: constants.DATETIME_DATA_TYPE, limits: limits });
        return this;
    };
    
    this.addArrayProperty = function (name, defaultValue, limits) {
        _properties.put(name, { name: name, defaultValue: defaultValue, type: constants.ARRAY_DATA_TYPE, limits: limits });
        return this;
    };
    
    this.addObjectProperty = function (name, defaultValue, limits) {
        _properties.put(name, { name: name, defaultValue: defaultValue, type: constants.OBJECT_DATA_TYPE, limits: limits });
        return this;
    };

    this.getProperties = function () {
        return _properties.values();
    };

    this.createMessage = function (messageClassName, name) {
        var message = new Message(messageClassName, name, _messageSchemaName);
        
        _properties.each(function (key) {
            var property = _properties.get(key);
            Object.defineProperty(message.d, property.name, {
                value: property.defaultValue,
                writable: true,
                enumerable: true,
                configurable: false
            });
        });

        return message;
    };
    
    this.getMessageDefinition = function (messageClass, name) {
        return {
            messageSchema: _messageSchemaName,
            messageClass: messageClass,
            name: name,
            properties: this.getProperties()
        };
    };
    
    // Getters
    this.__defineGetter__("name", function () { return _messageSchemaName });

};

module.exports = MessageSchema;
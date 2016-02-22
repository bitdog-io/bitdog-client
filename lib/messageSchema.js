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

    this.addNumberProperty = function (name, defaultValue,limits, help, displayName) {
        _properties.put(name, new Property(name, displayName, defaultValue, constants.NUMBER_DATA_TYPE ,limits, help));
        return this;
    };
    
    this.addStringProperty = function (name, defaultValue, limits, help, displayName) {
        _properties.put(name, new Property(name, displayName, defaultValue, constants.STRING_DATA_TYPE , limits, help));
        return this;
    };
    
    this.addDateTimeProperty = function (name, defaultValue, limits, help, displayName) {
        _properties.put(name, new Property(name, displayName, defaultValue, constants.DATETIME_DATA_TYPE , limits, help));
        return this;
    };
    
    this.addArrayProperty = function (name, defaultValue, limits, help, displayName) {
        _properties.put(name, new Property(name, displayName, defaultValue, constants.ARRAY_DATA_TYPE , limits, help));
        return this;
    };
    
    this.addObjectProperty = function (name, defaultValue, limits, help, displayName) {
        _properties.put(name, new Property(name, displayName, defaultValue, constants.OBJECT_DATA_TYPE , limits, help));
        return this;
    };

    this.getProperties = function () {
        return _properties.values();
    };

    this.createMessage = function (messageClassName, name) {
        var message = new Message(messageClassName, name, _messageSchemaName);
        
        _properties.each(function (key) {
            var property = _properties.get(key);
            var defaultValue = property.defaultValue;
            
            if (property.type == 'array' && defaultValue != null)
                defaultValue = defaultValue.slice();

            Object.defineProperty(message.d, property.name, {
                value: defaultValue,
                writable: true,
                enumerable: true,
                configurable: false
            });
        });

        return message;
    };
    
    this.createDataMessage = function (name) {
        return this.createMessage(constants.MESSAGE_CLASS_DATA, name);
    };
    
    this.createCommandMessage = function (name) {
        return this.createMessage(constants.MESSAGE_CLASS_COMMAND, name);
    };
    
    this.getMessageDefinition = function (messageClass, name, hidden) {
        var _hidden = typeof hidden !== 'undefined' ? hidden : false;

        return {
            messageSchema: _messageSchemaName,
            messageClass: messageClass,
            name: name,
            properties: this.getProperties(),
            hidden: hidden
        };
    };
    
    // Getters
    this.__defineGetter__("name", function () { return _messageSchemaName });

}

function Property( name, displayName, defaultValue, type, limits, help ) {
    var _name = name;
    var _defaultValue = defaultValue;
    var _type = type;
    var _limits = limits;
    var _help = help;
    var _displayName = displayName;

    this.__defineGetter__("name", function () { return _name; });
    this.__defineGetter__("displayName", function () { return _displayName; });
    this.__defineGetter__("help", function () { return _help; });
    this.__defineGetter__("defaultValue", function () { return _defaultValue; });
    this.__defineGetter__("type", function () { return _type; });
    this.__defineGetter__("limits", function () { return _limits; });


}

module.exports = MessageSchema;
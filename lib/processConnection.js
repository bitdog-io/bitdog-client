var util = require('util');
var constants = require('./constants.js');
var Connection = require('./connection.js');


function ProcessConnection() {
    Connection.call(this);
}

util.inherits(ProcessConnection, Connection);

module.exports = ProcessConnection;
function messageDefinitionCopyHeloer(source, destination) {
    for (index = 0; index < source.length; index++) {
        destination.push(source[index].getMessageDefinition());
    }
};

module.exports.messageDefinitionCopyHeloer = messageDefinitionCopyHeloer;
var os = require('os');

function Constants()
{
    ////////////////// Message Classes /////////////////////
    this.MESSAGE_CLASS_COMMAND = 'command';
    this.MESSAGE_CLASS_DATA = 'data';
    this.MESSAGE_CLASS_SUBSCRIPTION = 'subscription';
    this.MESSAGE_CLASS_CONFIGURATION = 'configuration';
    this.MESSAGE_CLASS_REGISTRATION = 'register';
    this.MESSAGE_CLASS_RECONNECT = 'reconnect';
    this.MESSAGE_CLASS_LOG = "log";
    
    ////////////////// Message Schema //////////////////////
    this.MESSAGE_SCHEMA_POSITION = 'bitdog-position';
    this.MESSAGE_SCHEMA_ON_OFF = 'bitdog-on-off';
    this.MESSAGE_SCHEMA_ROTATION = 'bitdog-rotation';
    this.MESSAGE_SCHEMA_MAP_POSITION = 'bitdog-map-position';
    this.MESSAGE_SCHEMA_TEXT = 'bitdog-text';
    this.MESSAGE_SCHEMA_VALUE = 'bitdog-value';
    this.MESSAGE_SCHEMA_SUBSCRIPTION = 'bitdog-subscription';
    this.MESSAGE_SCHEMA_CONFIGURATION = 'bitdog-configuration';
    this.MESSAGE_SCHEMA_SEND_CONFIGURATION = 'bitdog-send-configuration';
    this.MESSAGE_SCHEMA_UPDATE_DATA = 'bitdog-update-data';
    this.MESSAGE_SCHEMA_LOG = "bitdog-log";
    this.MESSAGE_SCHEMA_PERFORMANCE = "bitdog-performance";

    /////////////////// Hub Information ///////////////////
    this.HUB_NAME = 'NodeHub';
    this.AGENT_HUB_NAME = 'AgentHub';
    this.CENTRAL_URL = 'https://preview.bitdog.io';
    this.REGISTER_PATH = '/realm/registernode';
    this.PAIR_PATH = '/realm/pair';
    this.HUB_GETURL_PATH = '/realm/gethuburl';

    /////////////////// Data Types ////////////////////////
    this.STRING_DATA_TYPE = 'string';
    this.NUMBER_DATA_TYPE = 'number';
    this.DATETIME_DATA_TYPE = 'datetime';
    this.ARRAY_DATA_TYPE = 'array';
    this.OBJECT_DATA_TYPE = 'object';
    
    //////////////////// Configuration ////////////////////
    this.CONFIGURATION_FILENAME = "config.json";
    this.LOG_FILE_NAME = "out.log";
    this.AGENT_PID_FILE_NAME = "agent.pid";
    this.AUTH_KEY_NAME = "auth_key";
    this.NODE_ID = "node_id";
    this.VERSION = "1.0.0";
    this.LOG_MESSAGES = 'logging:log_messages';
    this.LOG_CONNECTION_EVENTS = 'logging:log_connection_events';
    this.LOG_PROCESS_EVENTS = 'logging:log_process_events';
    this.LOG_SUPPRESS_LOGO = 'logging:log_suppress_logo';
    this.PASSWORDHASH = "webadmin:password_hash";
    this.USERNAME = "webadmin:username";
    this.WEBADMIN_PORT = "webadmin:port";
    this.WEBADMIN_ENABLE = "webadmin:enable";
 

    ////////////////// LOGGING CATEGORY //////////////////
    this.HELLOTXT = 'Connected to Bitdog, welcome! Go to https://bitdog.io to control this node and monitor what it is doing.';
    this.LOG_CATEGORY_ERROR = "Error";
    this.LOG_CATEGORY_MESSAGE = "Message";
    this.LOG_CATEGORY_CONNECTION_EVENT = "Connection event";
    this.LOG_CATEGORY_PROCESS_EVENT = "Process event";
    this.LOG_CATEGORY_STATUS = "Status";
    this.LOGOTXT = "           ,╖╦▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒╦╦┐.         " + os.EOL+
 "       .╖╪▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒╦┐          " + os.EOL+
 "     ┌╪▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒╦.       " + os.EOL+
 "   (╪▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒░      " + os.EOL+
 "  ╓▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒╝╩╩╝╣▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒.    " + os.EOL+
 " (▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒╬░  ` └┘╙╙╚╝╣▒▒▒▒╬┘       ╙╫▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒    " + os.EOL+
 " ╫▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒╩╠╬▒M            └╙           `╙╚╬▒▒▒▒▒▒▒▒▒▒▒▒▒░   " + os.EOL+
 "╓▒▒▒▒▒▒▒▒▒▒▒▒▒▒╬╙└   └╚▒▓╩┘ ╖╬┘                                └╚▒▒▒▒▒▒▒▒▒▒▒   " + os.EOL+
 "╠▒▒▒▒▒▒▒▒▒▒▒▒▒┘            (▒∩                    >┐             ╢▓▒▒▒▒▒▒▒▒▒─  " + os.EOL+
 "╠▒▒▒▒▒▒▒▒▒▓▒╙              ?╫, »∩                  ╠╗           .╢▓▒▒▒▒▒▒▒▒▒─  " + os.EOL+
 "╠▒▒▒▒▒▒▓▀╜└                 └╢╡                     ╠▒,         (▒▓▒▒▒▒▒▒▒▒▒─  " + os.EOL+
 "╠▓▓▓▓▓▓╬            (░                      .,╓╖╖╤╦╦╪╣╬╦        ├▓▓▓▓▓▓▓▓▓▓▒─  " + os.EOL+
 "╠▓▓▓▓▓▓▒            ╠╡   ..,,,,.      .╓╖#╛┘└       ╙▒╪▒▒,       ╫▓▓▓▓▓▓▓▓▓▒─  " + os.EOL+
 "╠▓▓▓▓▓▓▓▒        .╖#╣▒╩╚╙┘└└└└└┘╙╫▒▒▒▓▓▓╚   ╓∩ └▒╦   ╠▒∩╚▓▒,     `╫▓▓▓▓▓▓▓▓▒─  " + os.EOL+
 "╠▓▓▓▓▓▓▓▓▒        ╚@╬Ñ   ╓░ ?╗╖  (▒▒∩ ╙▒▒   ▒▒╦╪▓▒M  ╠╩  │▓▓▒╖,   (▒▓▓▓▓▓▓▓▒─  " + os.EOL+
 "║▓▓▓▓▓▓▓▓▓▒       ╓▓▓╡  (▒▒╦╦▒▓∩ {▒Ñ   '╫╗  └╚▀▀▀┘  ╓╬   ╓▓▓▓▓▓▓▒▒▒▓▓▓▓▓▓▓▓▒─  " + os.EOL+
 "║▓▓▓▓▓▓▓▓▓▓M     (╣▒╙╫╗  ╙▀▓▓▀Ñ (╣╚      └╜╗╦╖╓╓╖╦#╛┘    ╠▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▒─  " + os.EOL+
 "║▓▓▓▓▓▓▓▓▓▓M    (╣▓░ `╚▒╦╓y╓╓╓╤╡╜│╓╦#╜╜╜╜╜W╖,`          ╓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▒─  " + os.EOL+
 "║▓▓▓▓▓▓▓▓▓▓░  ┌╪▓▓▓▒┐    └└└└    └                      `╚▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▒─  " + os.EOL+
 "║▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓M           .╓Æ≡╙└└└└╙╪╕             ╚▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▒─  " + os.EOL+
 "║▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓╩            ╫▒,     .╖▒▓∩            (▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▒─  " + os.EOL+
 "║▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓M            ╙▓▓▓▒╗╦▒▓▓▓╬             (▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▒─  " + os.EOL+
 "║▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓░             └╚▓▓▓▓▓▓▓╜              ╠▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▒─  " + os.EOL+
 "║▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓┐                ╙╫▓┘               @▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓─  " + os.EOL+
 "╠▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓╦               .╫▓▒            .╓▒▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓─  " + os.EOL+
 "╠▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓╦,          .╓▒▓▀▀╩#╦╖╓╓╓╖╖╦╪▒▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓─  " + os.EOL+
 "└▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▒▒▒#╗▒#╜╜╙▀▀####╗ └╙╫╩└╚▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▒   " + os.EOL+
 " ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓╜ └▀▒╗,      #╝   .╩  └▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓Ñ   " + os.EOL+
 " └▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▒,    └╚╝╫▒╪#╣▌        (▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▒    " + os.EOL+
 "  ╙▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▒┐         ╙▓┐      ╓▒▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▀     " + os.EOL+
 "   '╫▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▒╦╦╖y╓╓╓╖╠▓▓▓▒▒▒▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓╜      " + os.EOL+
 "     └╫▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓╩        " + os.EOL+
 "       `╙▀▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▀╙          " + os.EOL+
 "           └╙▀▀▀▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▀▀▀╜╙              " + os.EOL;
                                                                                    
                                                                                    
}

module.exports = new Constants();  
#Pair message
Pair messages are sent from an administration application to the hub to place a realm into automatic node pairing mode. When received by the hub, the hub will record the IP address of the administration application's connection and associate the realm with that IP address. 

##Example pair message
 
	{
	// (h) Message header
	// This property is created by the administration application and describes the content of the data message
	"h": { 
			
			// (h.c) Message class
			// The message class defines the kind of message this is.
			"c":"pair",

			// (h.r) Realm Id
			// The id of the realm to on or off pair mode for.		
			"r":"555555555555-b07e-4ceb-b9e1-555555555555", 

			// (h.m) Pair mode.
			// The pair mode is either on or off.
			"m":"on",

			// (h.t) Off in seconds
			// The amount of time to leave pair mode on for
			// Only present when (h.m) has an "on" value
			// A value of "0" leaves the realm in pair mode "on" for
			// the life time of the administrative applications connection.
			"t":"300"
		},

	// (c) Hub header
	// This property is created by the hub when the message is received. It contains the meta
	// data about the message.
	"c": {
			// (c.t) Message receieved UTC ISO 8601 date time stamp 
			"t":"2015-06-08T16:25:56.506+00:00",

			// (c.i) Connection id the message arrived on
			"i":"55555555-9dab-419e-8511-555555555555",

			// (c.p) The message source node's ip address
			"p":"169.77.83.12",

			// (c.u) The user of the message source
			"u":"person@domain.com"

		}
	
	}
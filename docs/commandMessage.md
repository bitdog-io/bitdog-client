#Command message
Command messages are sent from a node to another node to invoke an action.

##Example command message
 
	{
	// (h) Message header
	// This property is created by the node and describes the content of the data message
	"h": { 
			
			// (h.c) Message class
			// The message class defines the kind of message this is.
			"c":"command",

			// (h.n) Message name
			// This is a unique name for the command on the node.		
			"n":"Turn on/off light", 

			// (h.d) Destination node id.
			// This is the node id of the node to send the command to.
			"d":"234234-234234-2342-23423-2342"
		},

	// (d) Message data
	// This property is created by the sending node and represents the commnad payload of the message.
	"d": {
			// Any data as defined by the message data type  
			"light":"on"  
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

			// (c.n) The node id of the message source
			"n":"555555555555-b07e-4ceb-b9e1-555555555555",

			// (c,r) The realm id of the message source node
			"r":"555555555555-d172-4121-bb68-555555555555"
		}
	
	}
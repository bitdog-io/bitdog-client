#Register message
Register messages are sent from hub to node to provide auth-key and nodeId.

##Example register message
 
	{
	// (h) Message header
	// This property is created by the hub and describes the content of the data message
	"h": { 
			
			// (h.c) Message class
			// The message class defines the kind of message this is.
			"c":"register",

			// (h.a) Auth key
			// This is the auth-key for the reciepent node.		
			"a":"234234-234234-2342-23423-2342", 

			// (h.n) Node id.
			// This is the auth-key for the reciepent node.
			"n":"234234-234234-2342-23423-2342"
		},

	// (c) Hub header
	// This property is created by the hub when the message is received. It contains the meta
	// data about the message.
	"c": {
			// (c.t) Message receieved UTC ISO 8601 date time stamp 
			"t":"2015-06-08T16:25:56.506+00:00",

			// (c.i) Connection id the message arrived on
			"i":"55555555-9dab-419e-8511-555555555555",

			// (c,r) The realm id of the message source node
			"r":"555555555555-d172-4121-bb68-555555555555"
		}
	
	}
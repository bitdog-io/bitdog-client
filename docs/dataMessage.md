#Data message
Data messages are sent from a node to notify of data changes or to periodically refresh data.

##Example data message
 
	{
	// (h) Message header
	// This property is created by the node and describes the content of the data message
	"h": { 
			
			// (h.c) Message class
			// The message class defines the kind of message this is.
			"c":"data",

			// (h.n) Message name
			// This is a unique name for the data source this message's data represents.		
			"n":"Rover Position" 
		},

	// (d) Message data
	// This property is created by the node and represents the data payload of the message.
	"d": {
			// Any data as defined by the message data type  
			"latitude":41,  
			"longitude":65
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
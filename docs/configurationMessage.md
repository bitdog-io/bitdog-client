#Configuration message
Configuration messages are sent from a node to notify of configuration changes minimally 
during initial connection with the hub.

##Example configuration message
 
	{
	// (h) Message header
	// This property is created by the node and describes the content of the configuration message
	"h": { 
			    
			// (h.c) Message class
			// The message class defines the kind of message this is.
			"c":"configuration",  

		},

	// (d) Message data
	// This property is created by the node and represents the data payload of the message.
	"d": {
			// (d.messageSchemas) Message schemas define the messages that a node can consume or emit.
			"messageSchemas":[
						{
							"messageClass":"data",
							"name":"Position",
							"properties":[
											{
												"name":"longitude",
												"defaultValue":-78.9055923,
												"type":"number"
											},
											{
												"name":"latitude",
												"defaultValue":42.9069,
												"type":"number"
											}
										]
						},
						{
							"messageClass":"command",
							"name":"Turn light on/off",
							"properties":[
											{
												"name":"value",
												"defaultValue":"off",
												"type":"string",
												"limits":{
															"values":[
																		"on",
																		"off"
																	]
															}
											}
										]
						},
						{
							"messageClass":"command",
							"name":"updateData",
							"properties":[
											{
												"name":"dataId",
												"defaultValue":"",
												"type":"string"
											}
										]
						},
						{
							"messageClass":"command",
							"name":"sendConfiguration",
							"properties":[]
						}
					],
			"platform":"linux",
			"architecture":"ARM",
			"versions":{
						"http_parser":"2.3",
						"node":"0.12.2",
						"v8":"3.28.73",
						"uv":"1.4.2-node1",
						"zlib":"1.2.8",
						"modules":"14",
						"openssl":"1.0.1m"
					},
			"title":"/opt/node/bin/node",
			"osType":"AIX",
			"filepath":"/opt/npm/npm-modules/bitodg-client/examples/example.js",
			"macAddress":"84-2B-2B-82-64-7D"

		}

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
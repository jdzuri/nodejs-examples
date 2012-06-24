// Main process

var server 		= require("./servers/server"),
	dispacher 	= require("./dispachers/dispacher"),
	handler 	= require("./handlers/handler");

var port = 8001;

console.log("Init program...");

// Passed port and distpacher as argument
server.init(port, dispacher.dispach, handler.handler);

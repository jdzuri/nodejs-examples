/*
 * NodeJS server module to listen in port 8888
 */

// Declare vars
var http 	= require("http"), 
	url 	= require("url");

// Functions

function init(port, dispach, handler) {
	function onRequest(request, response) {
		var pathname = url.parse(request.url).pathname;
		console.log("Request from "+pathname);
		
		dispach(handler, pathname, request, response);		
	}
	

	// This create and start the server
	http.createServer(onRequest).listen(port);

	console.log("Server running in port " + port + "...");
}

// Open http://localhost:8888/ url to test server.
// The first time, two requests are received by the server because the browser
// tries to load the favicon.

// To start server module
exports.init = init;

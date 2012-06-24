// Action or business logic depends of request path

// Request
var exec 		= require("child_process").exec,
	querystring = require("querystring"),	
	formidable 	= require("formidable"),	// External module: npm install formidable
	sys 		= require('sys'),
	fs 			= require("fs");

// Path - Action relation
var handle = {};
handle["/"]				= formData;
handle["/formData"]		= formData;
handle["/listProcess"]	= listProcess;
handle["/execCommand"]	= execCommand;
handle["/formCommand"]	= formCommand;
handle["/uploadData"] 	= uploadData;
handle["/uploadFile"] 	= uploadFile;
handle["/downloadFile"]	= downloadFile;


var fileData = "";

/*******************  FUNCTIONS *****************/
/*
 * Handler function.
 */
function handler(pathname, request, response){
	console.log("Handler to "+pathname+" has been called.");
	var func = handle[pathname];
	if(typeof func === 'function' )
		func(request, response);
	else {
		var error = 404;
		console.log("Error "+error+ ": No request handler found for " + pathname);
	    response.writeHead(error, {"Content-Type": "text/html"});
	    response.end(error+" Not found.");
	}
}

// Insert html code from server is incorrect. Later: Create the html pages (express?) 
function formData(request, response){
	console.log("Form data function!");
	var body = '<html>'+
				'<head>'+
				'<meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />'+
				'</head>'+
				'<body>'+
				'<form action="/uploadData" method="post">'+
				'<textarea name="text" rows="15" cols="40"></textarea>'+
				'<input type="submit" value="Submit text" />'+
				'</form>'+
				'</body>'+
				'</html>';

	response.writeHead(200, {"Content-Type": "text/html"});
	response.end(body);
}


function uploadData(request, response) {
  console.log("Upload data function!");
  
  request.addListener("data", function(partData) {
      fileData += partData;
      console.log("Recieved part of data: '" + partData + "'.");
  });

  request.addListener("end", function() {
	  console.log("All data function recieved: "+fileData);
	  response.writeHead(200, {"Content-Type": "text/html"});
	  var data = querystring.parse(fileData)["text"];
	  fileData = "";
	  response.write("Data send:  "+data);
	  response.end(data);	 
  });  
  
}

function formCommand(request, response){
	console.log("Form command function!");
	var body = '<html>'+
				'<head>'+
				'<meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />'+
				'</head>'+
				'<body>'+
				'<form action="/execCommand" method="get">'+
				'<span>Command: </span><input type="text" name="cmd" />'+
				'<input type="submit" value="Execute command" />'+
				'</form>'+
				'</body>'+
				'</html>';

	response.writeHead(200, {"Content-Type": "text/html"});
	response.end(body);
}


function execCommand(request, response) {
  console.log("Execute command function!");  
  // Default separator is &. Defined to ? because only have one. 
  // In other case you can required 'url' module or get only GET params from request.url string
  var cmd = querystring.parse( request.url.split('?')[1] )["cmd"]; 
  exec(cmd, function (error, stdout, stderr) {
	    response.writeHead(200, {"Content-Type": "text/plain"});
	    response.end(stdout);
	  });
}

function listProcess(request, response) {
  console.log("List system process function!");
  exec("ps -ef", function (error, stdout, stderr) {
	    response.writeHead(200, {"Content-Type": "text/plain"});
	    response.end(stdout);
	  });
}



// POST method to upload
function uploadFile(request, response){
	console.log("Upload file function!");
	if(request.method.toLowerCase() == 'post') {
		var form = new formidable.IncomingForm();
		form.parse(request, function(err, fields, files) {
			
			var title = (fields.title === "") ? "file_"+ new Date().getTime() : fields.title;
			var tmp_file = "/tmp/"+title;	
			console.log("tmp_file: "+tmp_file);
			// Fail in windows system.
			fs.rename(files.upload.path, tmp_file);
			
			response.writeHead(200, {'content-type': 'text/html'});
			response.write('Received upload file properties:\n\n');
			response.write("<div><pre>" + sys.inspect({fields: fields, files: files}) + "</pre></div>");
			response.write("<br />");
			response.write('<a href="/downloadFile?path='+tmp_file+'"> Download file </a>');
			response.end();
		});
	} else {
	   // Show the upload form
		response.writeHead(200, {'content-type': 'text/html'});
		response.end(
				'<form action="/uploadFile" enctype="multipart/form-data" method="post">'+				
				'<span>Image   : </span><input type="file" name="upload" multiple="multiple"><br>'+
				'<span>New name: </span><input type="text" name="title" /><br>'+
				'<input type="submit" value="Upload">'+
				'</form>'
				);
  }	 
	 
}

function downloadFile(request, response) {
	console.log("Download file function! :"+request.url);
	// Default separator is &. Defined to ? because only have one. 
	// In other case you can required 'url' module or get only GET params from request.url string
	var path = querystring.parse(request.url, '?')["path"]; 
	console.log("path: "+path);
	
	fs.readFile(path, "binary", function(error, file) {
    if(error) {
    	response.writeHead(500, {"Content-Type": "text/plain"});
    	response.write("Error 500:\n "+error + "\n");
    } else {
    	
    	
//    	
        var child = exec('file --mime-type ' + path, function (err, stdout, stderr) {
            var mimetype = stdout.substring(stdout.lastIndexOf(':') + 2, stdout.lastIndexOf('\n'));
            console.log("mime-type: "+mimetype);
            response.writeHead(200, {"Content-Type": mimetype});
        });
    	response.write(file, "binary");    	
    }
    response.end();
  });
}

// Exports

exports.handler = handler;

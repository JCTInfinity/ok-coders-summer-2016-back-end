const http = require('http');
const fs = require('fs');
const url = require('url');
const path = require('path');
server = http.createServer(requestCallback);
server.listen('3000', '127.0.0.1');
function requestCallback(req, res){
	console.log(req.url);
	var urlPath = url.parse(req.url).pathname;
	fileNotFound = () => {
		res.writeHead(404, {'Content-Type': 'text/plain'});
		res.end("File not found.");
	}
	if(urlPath.includes("..")) {
		res.writeHead(400, {'Content-Type': 'text/plain'});
		res.end("Bad request.");
	} else {
		var filePath = path.join("public", url.parse(req.url).pathname);
		fs.stat(filePath, (err, stat) => {
			if(err) {fileNotFound();}
			else{
				if(stat.isDirectory()) filePath = path.join(filePath, "index.html");
				fs.readFile(filePath, (err, data) => {
					if(err){
						fileNotFound();
					} else {
						res.writeHead(200);
						res.end(data);
					}
				});
			}
		});
	}
}
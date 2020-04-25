var http = require('http'),
    fs = require('fs');

/* Creating server */
var server = http.createServer(function (request, response) {
    if (request.url == '/' || request.url == '/public/index.html') {
        var fileStream = fs.createReadStream('./public/index.html');

        fileStream.pipe(response);
    } else {
        response.writeHead(200, {"Content-Type": "text/plain"});
        response.end("Files not found\n");
    }
});

/*Start listening*/
server.listen(8000);
const http = require('http');
const io = require('socket.io');
const fs = require('fs');
const inherits = require('util').inherits;
const EventEmitter = require('events').EventEmitter;
const path = require('path');

function SIOServer(port) {
    EventEmitter.call(this);
    this.port = port;
    this.socketio = null;
}

SIOServer.prototype.start = function() {
    const httpServer = http.createServer((req, res) => {
        var filePath = '.' + req.url;
        if (filePath == './')
            filePath = './index.html';
    
        var extname = path.extname(filePath);
        var contentType = 'text/html';
        switch (extname) {
            case '.js':
                contentType = 'text/javascript';
                break;
            case '.css':
                contentType = 'text/css';
                break;
            case '.json':
                contentType = 'application/json';
                break;
            case '.png':
                contentType = 'image/png';
                break;      
            case '.jpg':
                contentType = 'image/jpg';
                break;
            case '.wav':
                contentType = 'audio/wav';
                break;
        }
    
        fs.readFile(path.join(__dirname, "../public/", filePath), function(error, content) {
            if (error) {
                if(error.code == 'ENOENT'){
                    fs.readFile('./404.html', function(error, content) {
                        res.writeHead(200, { 'Content-Type': contentType });
                        res.end(content, 'utf-8');
                    });
                }
                else {
                    res.writeHead(500);
                    res.end('Sorry, check with the site admin for error: '+error.code+' ..\n');
                    res.end(); 
                }
            }
            else {
                res.writeHead(200, { 'Content-Type': contentType });
                res.end(content, 'utf-8');
            }
        });
    });
    httpServer.listen(this.port);

    const sio = io(httpServer);
    this.socketio = sio;

    sio.on('connection', socket => {
        this.emit('FROM_SIO', "CONNECTED");
        socket.on('FROM_FE', data => { this.emit('FROM_SIO', data); });
    });
}

SIOServer.prototype.send = function(trigger, message) {
    this.socketio.emit(trigger, message);
}

inherits(SIOServer, EventEmitter);

module.exports = SIOServer;
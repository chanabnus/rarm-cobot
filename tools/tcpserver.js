const net = require('net');
const inherits = require('util').inherits;
const EventEmitter = require('events').EventEmitter;

function TCPServer(port) {
    EventEmitter.call(this);
    this.port = port;
    this.socket = null;
}

TCPServer.prototype.start = function() {
    const server = net.createServer(socket => {
        this.socket = socket;
        this.emit('CONNECTED');
        this.socket.on('data', data => { this.emit('FROM_TCP', data.toString().split('\n')[0]);3 });
    });

    server.listen(this.port, () => console.log("Starting server at port: " + this.port));
};

TCPServer.prototype.send = function(message) {
    this.socket.write(message);
};

inherits(TCPServer, EventEmitter);

module.exports = TCPServer;
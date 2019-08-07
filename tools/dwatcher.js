const fs = require('fs');
const inherits = require('util').inherits;
const EventEmitter = require('events').EventEmitter;

let fileChanged = false;

function DWatcher(path) {
    EventEmitter.call(this);
    this.path = path;
    this.fileArray = [];
}

DWatcher.prototype.getPath = function() { return this.path; };
DWatcher.prototype.getFileArray = function() { return this.fileArray; };

DWatcher.prototype.start = function() {
    console.log("Monitoring: " + this.path);
    
    fs.readdir(this.path, (err, files) => {
        files.forEach(file => { this.fileArray.push(file); });
    });

    fs.watch(this.path, (eventType, filename) => {
        if(eventType === 'change' && filename.charAt(0) === '.') {
            fileChanged = true;
        }
        if(eventType === 'rename' && !this.fileArray.includes(filename) && filename.charAt(0) !== '.') {
            this.fileArray.push(filename);
            this.emit('add', filename, this.path);
        }
        else if(eventType === 'rename' && this.fileArray.includes(filename) && filename.charAt(0) !== '.') {
            if(fileChanged) {
                fileChanged = false;
                this.emit('change', filename, this.path);
            }
            else {
                this.fileArray.splice(this.fileArray.indexOf(filename), 1);
                this.emit('remove', filename, this.path);
            }
        }
    });
};

inherits(DWatcher, EventEmitter);

module.exports = DWatcher;
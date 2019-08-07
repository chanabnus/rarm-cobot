function ScanObj(id) {
    this.id = id;
    this.photos = [];
    this.defects = [];
}

ScanObj.prototype.isGood = function() { 
    if(this.defects.length > 0) return false;
    else return true;
}

ScanObj.prototype.addPhoto = function(filename) {
    this.photos.push(filename);
}

ScanObj.prototype.addDefect = function(defect) {
    this.defects.push(defect);
}

module.exports = ScanObj;
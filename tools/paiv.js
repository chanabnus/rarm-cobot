const fs = require('fs');
const request = require('request');

function PAIV(uri) {
    this.uri = uri;
}

PAIV.prototype.evaluateImage = async function(imagePath) {
    console.log("Evaluating image " + imagePath);
    let options = {
        method: 'POST',
        uri: this.uri,
        formData: {
            imagefile: fs.createReadStream(imagePath)
        }
    }

    return new Promise((resolve, reject) => {
        request(options, (err, res, body) => {
            if(err) {
                err.filename = imagePath;
                return reject(err);
            }
            let result = JSON.parse(body);
            result.imagePath = imagePath;
            resolve(result);
        });
    });
}

module.exports = PAIV;
const DWatcher = require('./tools/dwatcher');
const TCPServer = require('./tools/tcpserver');
const PAIV = require('./tools/paiv');
const SIOServer = require('./tools/sioserver');
const path = require('path');
const ScanObj = require('./scanobj');
const fs = require('fs');

let dwatcher = new DWatcher(process.env.WATCH_DIRECTORY);
let paiv = new PAIV(process.env.PAIV_URI);
let rarm = new TCPServer(process.env.R_SOCKET_PORT);
let sioserver = new SIOServer(process.env.FE_PORT);

let currObj = null;
let photosTaken = 0;

let defectConditions = [];
let defaultDefectCondition = 0.0;

fullreset();

dwatcher.start();
rarm.start();
sioserver.start();

dwatcher.on('add', processNewFile);

dwatcher.on('remove', (filename, location) => {
    console.log(`File removed: ${filename}, at ${location}`);
});

rarm.on('CONNECTED', () => {
    console.log("TCP connection established (BACK-END - COBOT)");
    rarm.send("Hello robot\n");
});

rarm.on('FROM_TCP', data => {
    console.log(`Received from TCP (ROBOT): ${data}`);

    // When COBOT sends TAKE:
    // - Send TAKE to UI for UI to take a photo
    if(data === "TAKE") {
        sioserver.send('FROM_SERVER', "TAKE");
        photosTaken++;
    }

    // When COBOT sends DONE:
    // - Check if object is good or not
    if(data === "DONE") {
        if(photosTaken === currObj.photos.length) {
            checkEndResult();
        }
        else if((photosTaken - currObj.photos.length) < 4){
            console.log("Wait 3 secs");
            setTimeout(checkEndResult, 3000);
        }
        else {
            console.log("Wait 5 secs");
            setTimeout(checkEndResult, 5000);
        }
    }
});

sioserver.on('FROM_SIO', data => {
    console.log(`Received from s.IO (FRONT-END): ${data}`);
    // sioserver.send('FROM_SERVER', data);

    // When UI sends an image {filename, data}
    if(data.data) {
        fs.writeFile(path.join(process.env.WATCH_DIRECTORY, data.filename), data.data, 'base64', (err) => {
            if(err) {
                console.log("FLAG 1!");
                console.log(err);
            }
        });
    }

    // When UI sends START:
    // - Send START to COBOT to start moving gripper to first array location
    if(data === "START") {
        console.log("Sending START to COBOT");
        rarm.send("START"); 
    }

    if(data.defectConditions) {
        defectConditions = data.defectConditions;
        defaultDefectCondition = data.defaultDefectCondition;
        console.log("Conditions: " + JSON.stringify(data));
    } 

    // When UI sends STOP:
    // - Send STOP to COBOT to stop current action and move to safe location
    if(data === "STOP") {
        rarm.send("FAIL");
    }

    // When UI sends TAKE_DONE:
    // - Send MOVE to COBOT to take next photo
    if(data === "MOVE") {
        rarm.send("MOVE");
    }

    // When UI sends RESET
    // - Send RESET to COBOT
    if(data === "RESET") {
        rarm.send("RESET");
        fullreset();
    }
});

function fullreset() {
    console.log("Performing full reset.");
    currObj = null;
    photosTaken = 0;

    // Remove all files from monitored directory
    console.log("Clearing watch directory: " + process.env.WATCH_DIRECTORY);
    fs.readdir(process.env.WATCH_DIRECTORY, (err, files) => {
        if (err) throw err;
        for (const file of files) {
            fs.unlink(path.join(process.env.WATCH_DIRECTORY, file), err => {
                if (err) throw err;
            });
        }
    });

    // Remove all files from objdetect folder
    console.log("Clearing objdetect folder: " + path.join(__dirname, "public/assets/objdetect"));
    fs.readdir(path.join(__dirname, "public/assets/objdetect"), (err, files) => {
        if (err) throw err;
        for (const file of files) {
            fs.unlink(path.join(__dirname, "public/assets/objdetect", file), err => {
                if (err) throw err;
            });
        }
    });
}

async function processNewFile(filename, location) {
    // FILE FORMAT: DIMM_YYYYMMDDnnnnnn-ooo.jpg
    console.log(`File added: ${filename} at ${location}`);
    if(!currObj) {
        currObj = new ScanObj(filename.split('-')[0]);
    }

    let eval = null;

    try {
        // Send image to PAIV to evaluate image
        eval = await paiv.evaluateImage(path.join(location, filename));
        let failCount = 0;
        while(eval.result === 'fail') {
            failCount++;
            if(failCount === 3) throw new Error(`Evaluation for ${filename} failed 3 times! Might be a bad file.`);
            console.log(`Evaluate failed. Fail count: ${failCount}. Retrying...`);
            eval = await paiv.evaluateImage(path.join(location, filename));
        }
    }
    catch(err) {
        console.log("FLAG 2");
        console.log(err);
        try {
            console.log("Trying one more time.");
            eval = await paiv.evaluateImage(path.join(location, filename));
        }
        catch(err) {
            console.log("FLAG 3");
            return err;
        }
    }

    // If there are still classifications detected, file them as defects
    if(eval.classified.length !== 0) {

        console.log("Defect Conditions: " + JSON.stringify(defectConditions));
        console.log("Default Defect Condition: " + defaultDefectCondition);

        for(let i=0; i<eval.classified.length; i++) {
            // if the label is found in defectConditions
            for(let j=0; j<defectConditions.length; j++) {
                console.log(eval.classified[i].label + " === " + defectConditions[j].label + " is " + (eval.classified[i].label === defectConditions[j].label));
                console.log(eval.classified[i].confidence + " > " + defectConditions[j].confidence + " is " + (eval.classified[i].confidence > defectConditions[j].confidence));
                if(eval.classified[i].label === defectConditions[j].label && eval.classified[i].confidence > defectConditions[j].confidence) {
                    eval.classified[i].filename = filename;
                    currObj.addDefect(eval.classified[i]);
                    fs.copyFile(path.join(location, filename), path.join("./public/assets/objdetect", filename), err => {
                        if(err) {
                            console.log(err);
                            return err;
                        }
                        console.log(path.join(location, filename) + " is copied to " + path.join("./public/assets/objdetect", filename));
                        sioserver.send('FROM_SERVER', {filename: filename, status: eval.classified});
                    });
                }    
            }

            // if label is not found, there shouldn't already be a .filename in eval.classified[i]. So set it as defaultDefectCondition
            if(!eval.classified[i].filename) {
                if(eval.classified[i].confidence > defaultDefectCondition) {
                    eval.classified[i].filename = filename;
                    currObj.addDefect(eval.classified[i]);
                    fs.copyFile(path.join(location, filename), path.join("./public/assets/objdetect", filename), err => {
                        if(err) {
                            console.log(err);
                            return err;
                        }
                        console.log(path.join(location, filename) + " is copied to " + path.join("./public/assets/objdetect", filename));
                        sioserver.send('FROM_SERVER', {filename: filename, status: eval.classified});
                    });
                }
            }
        }
    }
    currObj.addPhoto(filename);
    console.log(eval);
}

function checkEndResult() {
    if(photosTaken === currObj.photos.length) {
        if(currObj.isGood()) {
            console.log("Sending PASS to COBOT");
            rarm.send("PASS");
            console.log(`${currObj.id} has no defects.`);
            sioserver.send('FROM_SERVER', "PASS");
        }
        else {
            console.log("Sending FAIL to COBOT");
            rarm.send("FAIL");
            console.log(`${currObj.id} has defects.`);
            for (let i=0; i<currObj.defects.length; i++) console.log(currObj.defects[i]);
            sioserver.send('FROM_SERVER', "FAIL");
        }
    }
    else {
        console.log("Number of photos taken is not equals to number of results retrieved!");
        console.log("photosTaken: " + photosTaken);
        console.log("currObj.photos.length: " + currObj.photos.length);
        if(currObj.defects.length > 0) {
            rarm.send("FAIL");
            sioserver.send('FROM_SERVER', "FAIL");
        }
        else {
            rarm.send("PASS");
            sioserver.send('FROM_SERVER', "INCOMPLETE");
        }
    }
    sioserver.send('FROM_SERVER', "NEWDIMM");
    currObj = null;
    photosTaken = 0;
}
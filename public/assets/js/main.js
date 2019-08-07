// Grab elements, create settings, etc.
var dimmCounter = 0;
var imageCounter = 0;
var defectArray = [];
var canvasLimit = 30;
var currentDIMM = "";
var cardCount = 0;
var maxCard = 6;
var canvasCount = 0;

var configData = {
    defectConditions: [{
        label: "no_extra",
        confidence: 9
    },
    {
        label: "knock_off",
        confidence: 0.6
    },
    {
        label: "extra",
        confidence: 0.5
    }],
    defaultDefectCondition: 0.9
};

var video = document.getElementById('video');
var socket = io('http://localhost:12346');

document.getElementById("start").addEventListener("click", startCobot);
document.getElementById("stop").addEventListener("click", takeSnapshot);
document.getElementById("reset").addEventListener("click", reset);

drawCard();

// Get access to the camera!
navigator.mediaDevices.getUserMedia = (
    navigator.mediaDevices.getUserMedia ||
    navigator.mediaDevices.webkitGetUserMedia ||
    navigator.mediaDevices.mozGetUserMedia ||
    navigator.mediaDevices.msGetUserMedia
)
if(navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
    navigator.mediaDevices.getUserMedia({ video: true }).then(function(stream) {
        video.srcObject = stream;
        video.play();
    });
}

socket.on('FROM_SERVER', function (data) {
    if(data === "TAKE") {
        console.log("Received TAKE from server");
        setTimeout(takeSnapshot, 250);
    }
    else if(data === "NEWDIMM") {
        increaseDIMMCounter();
    }
    else if(data === "PASS") {
        document.getElementById("cardHeader" + cardCount).style = "background-color:green; border:none; font-size:1.3em;";
        document.getElementById("cardHeader" + cardCount).innerText = currentDIMM + " PASS";
        document.getElementById("cardBody" + cardCount).style = "";
        drawCard();
    }
    else if(data === "INCOMPLETE") {
        document.getElementById("cardHeader" + cardCount).style = "background-color:green; border:none; font-size:1.3em;";
        document.getElementById("cardHeader" + cardCount).innerText = currentDIMM + " PASS*";
        document.getElementById("cardBody" + cardCount).style = "";
        drawCard();
    }
    else if(data === "FAIL") {
        document.getElementById("cardHeader" + cardCount).innerText = currentDIMM + " FAIL";
        drawCard();
    }
    else {
        if(data.status) {
            console.log("Data: ");
            console.log(data);
            defectArray.push(data);
            console.log("defectArray[defectArray.length-1]");
            console.log(defectArray[defectArray.length-1]);
            if(defectArray.length > 1 && defectArray[defectArray.length-2].filename === data.filename) {
                console.log("Duplicate image detected.");
                console.log(defectArray[defectArray.length-1].filename);
            }
            else {
                drawDefectImage(data);
                document.getElementById("cardHeader" + cardCount).style = "background-color:red; border:none; font-size:1.3em;";
            }
            console.log("After: ");
        }
        else {
            console.log(data);
        }
    }    
});

function startCobot() {
    console.log("Sending configData: " + JSON.stringify(configData));
    socket.emit('FROM_FE', configData);
    socket.emit('FROM_FE', 'START');
}

function stopCobot() {
    socket.emit('FROM_FE', 'STOP');
}

function reset() {
    var list = document.getElementById("cardsection");

    while (list.hasChildNodes()) {  
        list.removeChild(list.firstChild);
    }

    socket.emit('FROM_FE', 'RESET');

    dimmCounter = 0;
    imageCounter = 0;
    defectArray = [];
    canvasLimit = 30;
    currentDIMM = "";
    cardCount = 0;
    maxCard = 5;
    canvasCount = 0;
    drawCard();
}

function takeSnapshot() {
    var cv = document.createElement("canvas");
    cv.width = video.width;
    cv.height = video.height;
    cv.getContext('2d').drawImage(video, 0, 0, cv.width, cv.height);
    var data = cv.toDataURL('image/jpeg', 1.0).replace(/^data:image\/\w+;base64,/, "");
    var filename = "DIMM_" + yyyymmdd() + dimmCounter.toString().padStart(5, "0") + "-" + imageCounter.toString().padStart(3, "0") + ".jpg";
    currentDIMM = "DIMM_" + yyyymmdd() + dimmCounter.toString().padStart(5, "0");
    document.getElementById("cardHeader"+cardCount).innerText = currentDIMM;
    imageCounter++;
    socket.emit('FROM_FE', 'MOVE');
    socket.emit('FROM_FE', {filename: filename, data: data});
}

function increaseDIMMCounter() {
    dimmCounter++;
    imageCounter = 0;
}

function drawDefectImage(data) {
    console.log("Draw defect image");
    var currCanvasID = drawCanvas();
    drawModal(data);
    var canvas = document.getElementById(currCanvasID);
    var context = canvas.getContext('2d');
    canvas.style.display = 'block';
    var img = new Image;
    img.onload = function() {
        context.drawImage(img, 0, 0, canvas.width, canvas.height);
    }
    img.src = "assets/objdetect/" + data.filename;

}

function drawModal(data) {
    console.log("Drawing Modal");
    let rightSide = document.getElementById('rightside');

    let modal = document.createElement('div');
    modal.id = "canvasModal_" + cardCount + "_" + canvasCount;
    modal.className = "modal fade";
    modal.tabIndex = "-1";
    modal.setAttribute("role", "dialog");
    modal.setAttribute("aria-labelledby", "canvasModalLabel");
    modal.setAttribute("aria-hidden", "false");

    let modalDialog = document.createElement('div');
    modalDialog.className = "modal-dialog";
    modalDialog.setAttribute("role", "document");

    let modalContent = document.createElement('div');
    modalContent.className = "modal-content";

    let modalHeader = document.createElement('div');
    modalHeader.className = "modal-header";

    let modalTitle = document.createElement('h5');
    modalTitle.className = "modal-title";
    modalTitle.id = "canvasModalLabel";
    modalTitle.innerText = "Defect(s) for " + data.filename;

    let closeButton = document.createElement('button');
    closeButton.className = "close";
    closeButton.setAttribute("data-dismiss", "modal");
    closeButton.setAttribute("aria-label", "Close");

    let xSpan = document.createElement('span');
    xSpan.setAttribute("aria-hidden", "true");
    xSpan.innerHTML = "&times;";

    let modalBody = document.createElement('div');
    modalBody.className = "modal-body";

    let imgCanvas = document.createElement('canvas');
    imgCanvas.id = "canvas_" + data.filename;
    imgCanvas.width = 800;
    imgCanvas.height = 600;
    imgCanvas.style.display = 'block';
    let imgContext = imgCanvas.getContext('2d');
    imgContext.strokeStyle = 'rgb(255, 0, 0)';
    imgContext.lineWidth = 3;
    let imgModal = new Image;
    imgModal.onload = function() {
        imgContext.drawImage(imgModal, 0, 0, imgCanvas.width, imgCanvas.height);
        for(let j=0; j<data.status.length; j++){
            imgContext.strokeRect(data.status[j].xmin, data.status[j].ymin, data.status[j].xmax-data.status[j].xmin, data.status[j].ymax-data.status[j].ymin);
            imgContext.font = "30px Scope One";
            imgContext.fillStyle = 'rgb(255, 0, 0)';
            imgContext.fillText("Defect " + j, data.status[j].xmax, data.status[j].ymin);
        }
    }
    imgModal.src = "assets/objdetect/" + data.filename;
    
    let modalFooter = document.createElement('div');
    modalFooter.className = "modal-footer";

    let dismissButton = document.createElement('button');
    dismissButton.className = "btn btn-secondary";
    dismissButton.setAttribute("data-dismiss", "modal");
    dismissButton.innerText = "Close";

    closeButton.appendChild(xSpan);
    modalHeader.appendChild(modalTitle);
    modalHeader.appendChild(closeButton);
    modalContent.appendChild(modalHeader);
    
    let spaceLabel = document.createElement('h5');
    spaceLabel.innerHTML = "&nbsp;";

    modalBody.appendChild(imgCanvas);
    modalBody.append(spaceLabel);

    for(let k=0; k<data.status.length; k++) {

        let labelLabel = document.createElement('h5');
        labelLabel.innerText = "Defect " + k;
    
        let defectLabel = document.createElement('p');
        defectLabel.innerText = data.status[k].label; // LABEL GOES HERE
    
        let confidenceLabel = document.createElement('h5');
        confidenceLabel.innerText = "Confidence"; 
    
        let confPercLabel = document.createElement('p');
        confPercLabel.innerText = (data.status[k].confidence * 100) + "%"; // CONFIDENCE % GOES HERE
    
        modalBody.appendChild(labelLabel);
        modalBody.appendChild(defectLabel);
        modalBody.appendChild(confidenceLabel);
        modalBody.appendChild(confPercLabel);
    }

    modalContent.appendChild(modalBody);

    modalFooter.appendChild(dismissButton);
    modalContent.appendChild(modalFooter);

    modalDialog.appendChild(modalContent);
    modal.appendChild(modalDialog);

    rightSide.appendChild(modal);
}

function drawCanvas() {
    canvasCount++;

    let cardBody = document.getElementById('cardBody' + cardCount);

    let a = document.createElement('a');
    a.setAttribute("href", "#");
    
    let canvas = document.createElement('canvas');
    canvas.id = "canvas_" + cardCount + "_" + canvasCount;
    canvas.className = "img-fluid img-thumbnail";
    canvas.style = "max-width:150px; display:none;";
    canvas.setAttribute("data-toggle", "modal");
    canvas.setAttribute("data-target", "#canvasModal_" + cardCount + "_" + canvasCount);

    a.appendChild(canvas);
    cardBody.appendChild(a);

    return "canvas_" + cardCount + "_" + canvasCount;    
}

function drawCard() {
    canvasCount = 0;
    cardCount++;
    if(cardCount > maxCard) {
        let oldestCard = document.getElementById('card' + (cardCount - maxCard));
        oldestCard.parentNode.removeChild(oldestCard);
    }

    let cardSection = document.getElementById('cardsection');

    let newCard = document.createElement('div');
    newCard.id = "card" + cardCount;
    newCard.className = "card";
    
    let cardHeader = document.createElement('div');
    cardHeader.className = "card-header";
    cardHeader.id = "cardHeader" + cardCount;
    cardHeader.style = "border:none; font-size:1.3em;";
    cardHeader.innerText = "Waiting for image evaluation";

    let cardBody = document.createElement('div');
    cardBody.className = "class-body";
    cardBody.id = "cardBody" + cardCount;
    cardBody.style = "min-height:80px;padding:12px;";

    newCard.appendChild(cardHeader);
    newCard.appendChild(cardBody);

    cardSection.insertBefore(newCard, cardSection.firstChild);
}

function yyyymmdd() {
    var now = new Date();
    return '' + now.getFullYear() + (now.getMonth() + 1).toString().padStart(2, "0") + (now.getDate()).toString().padStart(2, "0");
}
function timestamplabel() {
    var timestamp = new Date();
    return timestamp.toLocaleString();
}
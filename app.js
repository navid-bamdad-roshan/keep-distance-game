//
// Navid Bamdad Roshan
//
// Variables
var canvasWidth = 0; // Width of playgroung
var canvasHeight = 0; // Height of playgroung
var haveSameSpeed = true; // If all the objects have constant and same speed.
var speed = 0; // Speed of objects movement
var objectNumber = 0; // Number of objects
var legalDistance = 0; // The distance that objects have to keep among themselves
var legalDistanceOfCursor = 0; // The distance that objects have to keep with mouse cursor
var avoidRate = 0; // Describes how strict objects should keep the distance
var objectSize = 0; // Radius size of the objects (0 means random sizes)
var gameState = "pageLoad"; // Describes state of the game (pageLoad, run, stop)
var objects = [];
var points = []; // Absorbing or repelling points
var canvasPoints = []; // Absorbing or repelling points in canvas
var canv;
var gameLoop;
var canvas; // oCanvas object
// defining object type
var movingObject = /** @class */ (function () {
    function movingObject(x, y, r) {
        this.x = x;
        this.y = y;
        this.radius = r;
        this.moveX = 0;
        this.moveY = 0;
    }
    return movingObject;
}());
// defining object type
var absorbingRepellingPoint = /** @class */ (function () {
    function absorbingRepellingPoint(x, y, r, isAbsorbing, absorbAvoidRate, effectDistance) {
        this.x = x;
        this.y = y;
        this.radius = r;
        this.isAbsorbing = isAbsorbing;
        this.absorbAvoidRate = absorbAvoidRate;
        this.effectDistance = effectDistance;
    }
    return absorbingRepellingPoint;
}());
// Getting access to HTML elements
var objectNumberInput = document.getElementById("object-num-input");
objectNumber = Number(objectNumberInput.value);
var canvasWidthInput = document.getElementById("canvas-width-input");
canvasWidth = Number(canvasWidthInput.value);
var canvasHeightInput = document.getElementById("canvas-height-input");
canvasHeight = Number(canvasHeightInput.value);
var startBtn = document.getElementById("start-btn");
var pauseBtn = document.getElementById("pause-btn");
var resumeBtn = document.getElementById("resume-btn");
var speedInput = document.getElementById("speed-input");
speed = Number(speedInput.options[speedInput.selectedIndex].value);
var objectDistanceInput = document.getElementById("object-distance-input");
legalDistance = Number(objectDistanceInput.options[objectDistanceInput.selectedIndex].value);
var cursorDistanceInput = document.getElementById("cursor-distance-input");
legalDistanceOfCursor = Number(cursorDistanceInput.options[cursorDistanceInput.selectedIndex].value);
var avoidRateInput = document.getElementById("avoid-rate-input");
avoidRate = Number(avoidRateInput.options[avoidRateInput.selectedIndex].value);
var objectsHaveSameSpeedInput = document.getElementById("objects-have-same-speed-input");
var temp = (objectsHaveSameSpeedInput.options[objectsHaveSameSpeedInput.selectedIndex].value);
if (temp == "true") {
    haveSameSpeed = true;
}
else {
    haveSameSpeed = false;
}
var objectSizeInput = document.getElementById("object-size-input");
objectSize = Number(objectSizeInput.options[objectSizeInput.selectedIndex].value);
var warningElement = document.getElementById("warning");
var pointSettingsElement = document.getElementById("point-settings");
var pointSizeInput = document.getElementById("point-size-input");
var pointIsAbsorbingInput = document.getElementById("point-is-absorbing-input");
var pointEffectRateInput = document.getElementById("point-effect-rate-input");
var pointEffectDistanceInput = document.getElementById("point-effect-distance-input");
var deleteBtn = document.getElementById("delete-btn");
// get uniform random number between 0 and max
function getRandomNumber(max) {
    return (Math.random() * max);
}
// get distance between object A and object B
function getObjectDistance(A, B) {
    return (Math.sqrt(Math.pow((A.x - B.x), 2) + Math.pow((A.y - B.y), 2)));
}
// get distance between point A and point B
function getDistance(Ax, Ay, Bx, By) {
    return (Math.sqrt(Math.pow((Ax - Bx), 2) + Math.pow((Ay - By), 2)));
}
// get vector from positions of object A to object B
function getVector(A, B) {
    return ({ x: (B.x - A.x), y: (B.y - A.y) });
}
// To unify the lenght of movement vector to 1 in order to make speed of all objects same (if selected)
function modifyMovementVector(A) {
    if (haveSameSpeed) {
        var length_1 = getDistance(0, 0, A.moveX, A.moveY);
        A.moveX /= length_1;
        A.moveY /= length_1;
    }
}
function showPointSettings(index) {
    warningElement.style.visibility = "hidden";
    pointSettingsElement.style.visibility = "visible";
    for (var i = 0; i < pointSizeInput.options.length; i++) {
        if (Number(pointSizeInput.options[i].value) === points[index].radius) {
            pointSizeInput.selectedIndex = i;
            i = pointSizeInput.options.length;
        }
    }
    if (points[index].isAbsorbing) {
        pointIsAbsorbingInput.selectedIndex = 0;
    }
    else {
        pointIsAbsorbingInput.selectedIndex = 1;
    }
    for (var i = 0; i < pointEffectRateInput.options.length; i++) {
        if (Number(pointEffectRateInput.options[i].value) === points[index].absorbAvoidRate) {
            pointEffectRateInput.selectedIndex = i;
            i = pointEffectRateInput.options.length;
        }
    }
    for (var i = 0; i < pointEffectDistanceInput.options.length; i++) {
        if (Number(pointEffectDistanceInput.options[i].value) === points[index].effectDistance) {
            pointEffectDistanceInput.selectedIndex = i;
            i = pointEffectDistanceInput.options.length;
        }
    }
    deleteBtn.setAttribute("pointIndex", index.toString());
}
// setting the playgroung background image
var img = new Image();
img.src = 'img/background.jpg';
img.onload = function () {
    var canvas = document.getElementById('canvas');
    canvas.setAttribute("width", canvasWidth.toString());
    canvas.setAttribute("height", canvasHeight.toString());
    canvas.getContext("2d").drawImage(img, 0, 0, canvasWidth, canvasHeight);
};
// To add or remove absorbing or repelling point
function AddOrRemovePoint() {
    if (gameState == "run" || gameState == "stop") {
        var pointIndex = -1;
        warningElement.style.visibility = 'hidden';
        pointSettingsElement.style.visibility = "visible";
        // finding the clicked point
        for (var i = points.length - 1; i >= 0; i--) {
            if (getObjectDistance(canvas.mouse, points[i]) <= points[i].radius) {
                pointIndex = i;
                i = -1;
            }
        }
        if (pointIndex >= 0) { // Selecting the clicked point
            showPointSettings(pointIndex);
        }
        else { // adding point
            var p = new absorbingRepellingPoint(canvas.mouse.x, canvas.mouse.y, 15, true, 2.5, 100);
            var canvasPoint = canvas.display.ellipse({ x: p.x, y: p.y, radius: p.radius, fill: "#fff" });
            canvas.addChild(canvasPoint);
            canvasPoints.push(canvasPoint);
            points.push(p);
            showPointSettings(points.length - 1);
        }
    }
}
function start() {
    try {
        // stop previous canvas loop
        gameLoop.stop();
    }
    catch (error) {
        // This is not an error
    }
    gameState = "run";
    // reading values from HTML inputs
    objectNumber = Number(objectNumberInput.value);
    canvasWidth = Number(canvasWidthInput.value);
    canvasHeight = Number(canvasHeightInput.value);
    // getting the parent element of current HTML canvas element
    var canvasDiv = document.getElementById("canvas-container");
    try {
        var tempElement = document.getElementById("canvas");
        // Remove previous canvas element
        canvasDiv.removeChild(tempElement);
    }
    catch (_a) {
        // This is not an error
    }
    // initializing the canvas element
    canv = (document.createElement('canvas'));
    canv.setAttribute("id", "canvas");
    canv.setAttribute("width", canvasWidth.toString());
    canv.setAttribute("height", canvasHeight.toString());
    canv.setAttribute("style", "border:1px solid black");
    // using oCanvas library
    canvas = oCanvas.create({
        canvas: canv,
        fps: 40
    });
    // loading background image to oCanvas object
    var image = canvas.display.image({
        height: canvasHeight,
        width: canvasWidth,
        image: "img/background.jpg"
    });
    canvas.addChild(image);
    // adding oCanvas object to HTML
    canv.addEventListener("click", AddOrRemovePoint);
    canvasDiv.appendChild(canv);
    // crearing objects and adding them to oCanvas
    objects = [];
    for (var i_1 = 0; i_1 < objectNumber; i_1++) {
        var obj = new movingObject(Math.floor(getRandomNumber(canvasWidth)), Math.floor(getRandomNumber(canvasHeight)), objectSize);
        if (obj.radius === 0) {
            obj.radius = getRandomNumber(30);
        }
        var canvasObject = canvas.display.ellipse({ x: obj.x, y: obj.y, radius: obj.radius, fill: "#0ff" });
        canvas.addChild(canvasObject);
        objects.push(canvasObject);
    }
    canvasPoints = [];
    for (var i_2 = 0; i_2 < points.length; i_2++) {
        var p = points[i_2];
        var canvasPoint = canvas.display.ellipse({ x: p.x, y: p.y, radius: p.radius, fill: "#fff" });
        canvas.addChild(canvasPoint);
        canvasPoints.push(canvasPoint);
    }
    // Generating random movements for objects
    for (var i_3 = 0; i_3 < objectNumber; i_3++) {
        objects[i_3].moveX = getRandomNumber(2) - 1;
        objects[i_3].moveY = getRandomNumber(2) - 1;
        if (haveSameSpeed) {
            modifyMovementVector(objects[i_3]);
        }
    }
    // Creating a 2D array for storing the objects distance matrix
    var objectDistances = new Array(objectNumber);
    for (var i = 0; i < objectNumber; i++) {
        objectDistances[i] = new Array(objectNumber);
    }
    gameLoop = canvas.setLoop(function () {
        // Creating a 2D array for storing the objects and absorbing or repelling points distance matrix
        var objectPointDistances = new Array(points.length);
        for (var i = 0; i < points.length; i++) {
            objectPointDistances[i] = new Array(objectNumber);
        }
        // Calculating the distance of objects
        for (var i_4 = 0; i_4 < objectNumber; i_4++) {
            for (var j = i_4; j < objectNumber; j++) {
                var d = getObjectDistance(objects[i_4], objects[j]); // gets the distance of center points
                if (objectSize === 0) { // objects have random radiuses
                    var radiuses = objects[i_4].radius + objects[j].radius;
                    objectDistances[i_4][j] = d - (radiuses);
                    objectDistances[j][i_4] = d - (radiuses);
                }
                else {
                    objectDistances[i_4][j] = d - (objectSize);
                    objectDistances[j][i_4] = d - (objectSize);
                }
            }
        }
        // Calculating the distance of cursor from objects
        var cursorDistance = new Array(objectNumber);
        for (var i_5 = 0; i_5 < objectNumber; i_5++) {
            cursorDistance[i_5] = getObjectDistance(objects[i_5], canvas.mouse) - objects[i_5].radius;
        }
        // Calculating the distance of objects from absorbing or repelling points
        for (var i_6 = 0; i_6 < objectPointDistances.length; i_6++) {
            for (var j = 0; j < objectNumber; j++) {
                objectPointDistances[i_6][j] = getObjectDistance(points[i_6], objects[j]) - objects[j].radius - points[i_6].radius;
            }
        }
        // Changing the movement direction of the objects
        for (var i_7 = 0; i_7 < objectNumber; i_7++) {
            if (getRandomNumber(1) > 0.9) { // change previous moving direction a lot with probability of 0.1
                objects[i_7].moveX += (getRandomNumber(2) - 1);
                objects[i_7].moveY += (getRandomNumber(2) - 1);
            }
            else { // change previous moving direction a bit with probability of 0.9
                objects[i_7].moveX += (getRandomNumber(0.2) - 0.1);
                objects[i_7].moveY += (getRandomNumber(0.2) - 0.1);
            }
            // keeping movement vectors in -1 and 1 range
            if (Math.abs(objects[i_7].moveX) > 1) {
                objects[i_7].moveY /= Math.abs(objects[i_7].moveX);
                objects[i_7].moveX /= Math.abs(objects[i_7].moveX);
            }
            if (Math.abs(objects[i_7].moveY) > 1) {
                objects[i_7].moveX /= Math.abs(objects[i_7].moveY);
                objects[i_7].moveY /= Math.abs(objects[i_7].moveY);
            }
            modifyMovementVector(objects[i_7]);
        }
        // process of keeping distances and functioning of points
        for (var i_8 = 0; i_8 < objectNumber; i_8++) {
            var obj = objects[i_8];
            var nearObjects = [];
            var weights = [];
            var nearPoints = [];
            var pointsWeights = [];
            // finding nearby objects, points or cursor
            for (var j = 0; j < objectNumber; j++) {
                if ((objectDistances[i_8][j] < legalDistance) && !(i_8 == j)) {
                    nearObjects.push(j);
                    weights.push(((legalDistance) - objectDistances[i_8][j]) / (legalDistance)); // the closer objects are, the higher weight is (weight range:0 - 1)
                }
            }
            for (var j = 0; j < points.length; j++) {
                if ((objectPointDistances[j][i_8] < points[j].effectDistance)) {
                    nearPoints.push(j);
                    pointsWeights.push(((points[j].effectDistance) - objectPointDistances[j][i_8]) / (points[j].effectDistance)); // the closer objects are, the higher weight is (weight range:0 - 1)
                }
            }
            if (cursorDistance[i_8] < legalDistanceOfCursor) {
                nearObjects.push(-1);
                weights.push(((legalDistanceOfCursor) - cursorDistance[i_8]) / (legalDistanceOfCursor / 10)); // the closer object is to cursor, the higher weight (weight range:0 - 10) (avoiding the cursor is 10 times more important than the avoiding other objects)
            }
            // pushing objects away from each other and from the cursor
            for (var j = 0; j < nearObjects.length; j++) {
                var vector = void 0;
                if (nearObjects[j] >= 0) { // Near object is one of other objects (-1:cursor)
                    vector = getVector(objects[nearObjects[j]], obj);
                }
                else { // Near object is cursor
                    vector = getVector(canvas.mouse, obj);
                }
                var length_2 = getDistance(0, 0, vector.x, vector.y);
                vector.x /= length_2;
                vector.y /= length_2;
                vector.x *= avoidRate;
                vector.y *= avoidRate;
                obj.moveX += (vector.x * weights[j]);
                obj.moveY += (vector.y * weights[j]);
            }
            for (var j = 0; j < nearPoints.length; j++) {
                var vector = void 0;
                var p = points[nearPoints[j]];
                if (p.isAbsorbing) { // point is absorbing other objects
                    vector = getVector(obj, p);
                }
                else { // point is repelling other objects
                    vector = getVector(p, obj);
                }
                var length_3 = getDistance(0, 0, vector.x, vector.y);
                vector.x /= length_3;
                vector.y /= length_3;
                vector.x *= p.absorbAvoidRate;
                vector.y *= p.absorbAvoidRate;
                obj.moveX += (vector.x * pointsWeights[j]);
                obj.moveY += (vector.y * pointsWeights[j]);
            }
            // keeping movement vectors in -1 and 1 range
            if (Math.abs(obj.moveX) > 1) {
                obj.moveY /= Math.abs(obj.moveX);
                obj.moveX /= Math.abs(obj.moveX);
            }
            if (Math.abs(obj.moveY) > 1) {
                obj.moveX /= Math.abs(obj.moveY);
                obj.moveY /= Math.abs(obj.moveY);
            }
            modifyMovementVector(obj);
        }
        // Preventing objects from exiting the canvas
        for (var i_9 = 0; i_9 < objects.length; i_9++) {
            var obj = objects[i_9];
            if (obj.x + obj.moveX + obj.radius + 1 >= canvasWidth) {
                if (obj.y + obj.moveY + obj.radius + 1 >= canvasHeight) { // Bottom right corner
                    obj.moveX -= 1;
                    obj.moveY -= 1;
                    modifyMovementVector(obj);
                }
                else if (obj.y + obj.moveY - obj.radius - 1 <= 0) { // Up right corner
                    obj.moveX -= 1;
                    obj.moveY += 1;
                    modifyMovementVector(obj);
                }
                else { // Right border
                    obj.moveX -= 1;
                    modifyMovementVector(obj);
                }
            }
            else if (obj.x + obj.moveX - obj.radius - 1 <= 0) {
                if (obj.y + obj.moveY + obj.radius + 1 >= canvasHeight) { // Bottom left corner
                    obj.moveX += 1;
                    obj.moveY -= 1;
                    modifyMovementVector(obj);
                }
                else if (obj.y + obj.moveY - obj.radius - 1 <= 0) { // Up left corner
                    obj.moveX += 1;
                    obj.moveY += 1;
                    modifyMovementVector(obj);
                }
                else { // Left border
                    obj.moveX += 1;
                    modifyMovementVector(obj);
                }
            }
            else if (obj.y + obj.moveY + obj.radius + 1 >= canvasHeight) { // Bottom border
                obj.moveY -= 1;
                modifyMovementVector(obj);
            }
            else if (obj.y - obj.moveY - obj.radius - 1 <= 0) { // Up border
                obj.moveY += 1;
                modifyMovementVector(obj);
            }
        }
        // Move the objects in canvas
        for (var i_10 = 0; i_10 < objectNumber; i_10++) {
            var obj = objects[i_10];
            obj.move(obj.moveX * speed, obj.moveY * speed);
        }
    });
    gameLoop.start();
}
startBtn.addEventListener("click", start);
// pause / resume the game
function pause_resume() {
    if (gameState == "run") {
        gameLoop.stop();
        gameState = "stop";
    }
    else if (gameState == "stop") {
        gameLoop.start();
        gameState = "run";
    }
}
pauseBtn.addEventListener("click", pause_resume);
// tracking the changes in variables of the game in webpage
function speedChange() {
    speed = Number(speedInput.options[speedInput.selectedIndex].value);
}
speedInput.addEventListener("change", speedChange);
function objectDistanceChange() {
    legalDistance = Number(objectDistanceInput.options[objectDistanceInput.selectedIndex].value);
}
objectDistanceInput.addEventListener("change", objectDistanceChange);
function cursorDistanceChange() {
    legalDistanceOfCursor = Number(cursorDistanceInput.options[cursorDistanceInput.selectedIndex].value);
}
cursorDistanceInput.addEventListener("change", cursorDistanceChange);
function avoidRateChange() {
    avoidRate = Number(avoidRateInput.options[avoidRateInput.selectedIndex].value);
}
avoidRateInput.addEventListener("change", avoidRateChange);
function sameSpeedChange() {
    var temp = (objectsHaveSameSpeedInput.options[objectsHaveSameSpeedInput.selectedIndex].value);
    if (temp == "true") {
        haveSameSpeed = true;
    }
    else {
        haveSameSpeed = false;
    }
}
objectsHaveSameSpeedInput.addEventListener("change", sameSpeedChange);
function objectSizeChange() {
    objectSize = Number(objectSizeInput.options[objectSizeInput.selectedIndex].value);
    if (objectSize === 0) {
        for (var i = 0; i < objects.length; i++) {
            objects[i].radius = getRandomNumber(30);
        }
    }
    else {
        for (var i = 0; i < objects.length; i++) {
            objects[i].radius = objectSize;
        }
    }
}
objectSizeInput.addEventListener("change", objectSizeChange);
function deletePoint() {
    var index = Number(deleteBtn.getAttribute("pointIndex"));
    canvasPoints[index].remove();
    canvasPoints.splice(index, 1);
    points.splice(index, 1);
    pointSettingsElement.style.visibility = "hidden";
    warningElement.style.visibility = "visible";
}
deleteBtn.addEventListener("click", deletePoint);
function pointSizeChange() {
    var size = Number(pointSizeInput.options[pointSizeInput.selectedIndex].value);
    var index = Number(deleteBtn.getAttribute("pointIndex"));
    points[index].radius = size;
    canvasPoints[index].radius = size;
}
pointSizeInput.addEventListener("change", pointSizeChange);
function pointTypeChange() {
    var type = Number(pointIsAbsorbingInput.options[pointIsAbsorbingInput.selectedIndex].value);
    var index = Number(deleteBtn.getAttribute("pointIndex"));
    if (type === 0) {
        points[index].isAbsorbing = false;
    }
    else {
        points[index].isAbsorbing = true;
    }
}
pointIsAbsorbingInput.addEventListener("change", pointTypeChange);
function pointEffectRateChange() {
    var effectRate = Number(pointEffectRateInput.options[pointEffectRateInput.selectedIndex].value);
    var index = Number(deleteBtn.getAttribute("pointIndex"));
    points[index].absorbAvoidRate = effectRate;
}
pointEffectRateInput.addEventListener("change", pointEffectRateChange);
function pointEffectDistanceChange() {
    var effectDistance = Number(pointEffectDistanceInput.options[pointEffectDistanceInput.selectedIndex].value);
    var index = Number(deleteBtn.getAttribute("pointIndex"));
    points[index].effectDistance = effectDistance;
}
pointEffectDistanceInput.addEventListener("change", pointEffectDistanceChange);

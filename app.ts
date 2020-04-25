//
// Navid Bamdad Roshan
//


// Variables
var canvasWidth = 0;    // Width of playgroung
var canvasHeight = 0;   // Height of playgroung
var haveSameSpeed = true;       // If all the objects have constant and same speed.
var speed = 0;          // Speed of objects movement
var objectNumber = 0;   // Number of objects
var legalDistance = 0;  // The distance that objects have to keep among themselves
var legalDistanceOfCursor = 0;  // The distance that objects have to keep with mouse cursor
var avoidRate = 0;      // Describes how strict objects should keep the distance
var objectSize = 0;     // Radius size of the objects (0 means random sizes)
var gameState = "pageLoad";   // Describes state of the game (pageLoad, run, stop)

var objects = [];
declare var oCanvas: any;
var canv: any;
var gameLoop: any;


// Getting access to HTML elements
var objectNumberInput = <HTMLInputElement> document.getElementById("object-num-input");
objectNumber = Number(objectNumberInput.value);

var canvasWidthInput = <HTMLInputElement> document.getElementById("canvas-width-input");
canvasWidth = Number(canvasWidthInput.value);

var canvasHeightInput = <HTMLInputElement> document.getElementById("canvas-height-input");
canvasHeight = Number(canvasHeightInput.value);

var startBtn = <HTMLButtonElement> document.getElementById("start-btn");
var pauseBtn = <HTMLButtonElement> document.getElementById("pause-btn");
var resumeBtn = <HTMLButtonElement> document.getElementById("resume-btn");

var speedInput = <HTMLSelectElement> document.getElementById("speed-input");
speed = Number(speedInput.options[speedInput.selectedIndex].value);

var objectDistanceInput = <HTMLSelectElement> document.getElementById("object-distance-input");
legalDistance = Number(objectDistanceInput.options[objectDistanceInput.selectedIndex].value);

var cursorDistanceInput = <HTMLSelectElement> document.getElementById("cursor-distance-input");
legalDistanceOfCursor = Number(cursorDistanceInput.options[cursorDistanceInput.selectedIndex].value);

var avoidRateInput = <HTMLSelectElement> document.getElementById("avoid-rate-input");
avoidRate = Number(avoidRateInput.options[avoidRateInput.selectedIndex].value);

var objectsHaveSameSpeedInput = <HTMLSelectElement> document.getElementById("objects-have-same-speed-input");
let temp = (objectsHaveSameSpeedInput.options[objectsHaveSameSpeedInput.selectedIndex].value);
if (temp == "true"){
  haveSameSpeed = true;
}else{
  haveSameSpeed = false;
}

var objectSizeInput = <HTMLSelectElement> document.getElementById("object-size-input");
objectSize = Number(objectSizeInput.options[objectSizeInput.selectedIndex].value);




// defining object type
class movingObject{
  x: number;
  y: number;
  radius: number;
  moveX: number;
  moveY: number;
  constructor(x: number, y:number, r:number) {
      this.x = x;
      this.y = y;
      this.radius = r;
      this.moveX = 0;
      this.moveY = 0;
  }
}


// get uniform random number between 0 and max
function getRandomNumber(max: number):number {
  return (Math.random() * max);
}

// get distance between object A and object B
function getObjectDistance(A:any, B:any):number{
  return(Math.sqrt(Math.pow((A.x-B.x),2) + Math.pow((A.y-B.y),2)));
}

// get distance between point A and point B
function getDistance(Ax:number, Ay:number, Bx:number, By:number):number{
  return(Math.sqrt(Math.pow((Ax-Bx),2) + Math.pow((Ay-By),2)));
}

// get vector from positions of object A to object B
function getVector(A:any, B:any):any{
  return({x:(B.x-A.x), y:(B.y-A.y)});
}


// To unify the lenght of movement vector to 1 in order to make speed of all objects same (if selected)
function modifyMovementVector(A:any){
  if (haveSameSpeed) {
    let length = getDistance(0, 0, A.moveX, A.moveY);
    A.moveX /= length;
    A.moveY /= length;
  }
}


// setting the playgroung background image
var img = new Image();
img.src = 'img/background.jpg';
img.onload = function(){
  let canvas = <HTMLCanvasElement> document.getElementById('canvas');
  canvas.setAttribute("width",canvasWidth.toString());
  canvas.setAttribute("height",canvasHeight.toString());
  canvas.getContext("2d").drawImage(img,0,0,canvasWidth,canvasHeight);
}


function start(){

  try {
    // stop previous canvas loop
    gameLoop.stop();
  } catch (error) {
     // This is not an error
  }


  gameState = "run";


  // reading values from HTML inputs
  objectNumber = Number(objectNumberInput.value);
  canvasWidth = Number(canvasWidthInput.value);
  canvasHeight = Number(canvasHeightInput.value);


  // getting the parent element of current HTML canvas element
  var canvasDiv = <HTMLDivElement> document.getElementById("canvas-container");
  try {
    let tempElement = <HTMLCanvasElement> document.getElementById("canvas");
    // Remove previous canvas element
    canvasDiv.removeChild(tempElement);
  } catch{
    // This is not an error
  }


  // initializing the canvas element
  canv = <HTMLCanvasElement>(document.createElement('canvas'));
  canv.setAttribute("id","canvas");
  canv.setAttribute("width",canvasWidth.toString());
  canv.setAttribute("height",canvasHeight.toString());
  canv.setAttribute("style", "border:1px solid black");

  // using oCanvas library
  var canvas = oCanvas.create({
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
  canvasDiv.appendChild(canv);


  // crearing objects and adding them to oCanvas
  objects = [];
  for (let i=0; i<objectNumber; i++){
  	let obj = new movingObject(Math.floor(getRandomNumber(canvasWidth)),	Math.floor(getRandomNumber(canvasHeight)), objectSize);
    if (obj.radius === 0){
      obj.radius = getRandomNumber(30);
    }
    let canvasObject = canvas.display.ellipse({x: obj.x,    y: obj.y,   radius: obj.radius,   fill: "#0ff"});
    canvas.addChild(canvasObject);
    objects.push(canvasObject);
  }


  // Generating random movements for objects
  for (let i = 0; i < objectNumber; i++) {
    objects[i].moveX = getRandomNumber(2) - 1;
    objects[i].moveY = getRandomNumber(2) - 1;
    if(haveSameSpeed){
      modifyMovementVector(objects[i]);
    }
  }


  // Creating a 2D array for storing the objects distance matrix
  var objectDistances = new Array(objectNumber);
  for (var i = 0; i < objectNumber; i++) {
      objectDistances[i] = new Array(objectNumber);
  }



  gameLoop = canvas.setLoop(function () {
    // Calculating the distance of objects
    for(let i=0; i<objectNumber; i++){
      for(let j=i; j<objectNumber; j++){
        let d = getObjectDistance(objects[i], objects[j]);  // gets the distance of center points
        if(objectSize === 0){   // objects have random radiuses
          let radiuses = objects[i].radius + objects[j].radius;
          objectDistances[i][j] = d - (radiuses);
          objectDistances[j][i] = d - (radiuses);
        }else{
          objectDistances[i][j] = d - (objectSize);
          objectDistances[j][i] = d - (objectSize);
        }
      }
    }

    // Calculating the distance of cursor from objects
    var cursorDistance = new Array(objectNumber);
    for(let i=0; i<objectNumber; i++){
      cursorDistance[i] = getObjectDistance(objects[i], canvas.mouse) - objects[i].radius;
    }

    // Changing the movement direction of the objects
    for (let i = 0; i < objectNumber; i++) {
      if(getRandomNumber(1) > 0.9){     // change previous moving direction a lot with probability of 0.1
        objects[i].moveX += (getRandomNumber(2) - 1);
        objects[i].moveY += (getRandomNumber(2) - 1);
      }else{                            // change previous moving direction a bit with probability of 0.9
        objects[i].moveX += (getRandomNumber(0.2) - 0.1);
        objects[i].moveY += (getRandomNumber(0.2) - 0.1);
      }

      // keeping movement vectors in -1 and 1 range
      if (Math.abs(objects[i].moveX) > 1) {
        objects[i].moveY /= Math.abs(objects[i].moveX);
        objects[i].moveX /= Math.abs(objects[i].moveX);
      }
      if (Math.abs(objects[i].moveY) > 1) {
        objects[i].moveX /= Math.abs(objects[i].moveY);
        objects[i].moveY /= Math.abs(objects[i].moveY);
      }
      modifyMovementVector(objects[i]);
    }



    // process of keeping distance
    for (let i = 0; i < objectNumber; i++) {
      let obj = objects[i];
      var nearObjects = [];
      var weights = [];
      for (let j = 0; j<objectNumber; j++){
        if ((objectDistances[i][j] < legalDistance) && !(i==j)) {
          nearObjects.push(j);
          weights.push(((legalDistance)-objectDistances[i][j])/(legalDistance));  // the closer objects are, the higher weight (weight range:0 - 1)
        }
      }
      if (cursorDistance[i] < legalDistanceOfCursor) {
        nearObjects.push(-1);
        weights.push(((legalDistanceOfCursor)-cursorDistance[i])/(legalDistanceOfCursor/10)); // the closer object is to cursor, the higher weight (weight range:0 - 10) (avoiding the cursor is 10 times more important than the avoiding other objects)
      }


      // pushing objects away from each other and from the cursor
      for(let j = 0; j < nearObjects.length; j++){
        let vector:any;
        if (nearObjects[j]>=0) {    // Near object is one of other objects (-1:cursor)
          vector = getVector(objects[nearObjects[j]], obj);
        }else {                     // Near object is cursor
          vector = getVector(canvas.mouse, obj);
        }
        let length = getDistance(0, 0, vector.x, vector.y);
        vector.x /= length;
        vector.y /= length;
        vector.x *= avoidRate;
        vector.y *= avoidRate;
        obj.moveX += (vector.x * weights[j]);
        obj.moveY += (vector.y * weights[j]);
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
    for (let i = 0; i < objects.length; i++) {
      let obj = objects[i];
      if (obj.x + obj.moveX + obj.radius + 1 >= canvasWidth) {
        if (obj.y + obj.moveY + obj.radius + 1 >= canvasHeight) { // Bottom right corner
          obj.moveX -= 1;
          obj.moveY -= 1;
          modifyMovementVector(obj);
        }else if (obj.y + obj.moveY - obj.radius - 1 <= 0) {      // Up right corner
          obj.moveX -= 1;
          obj.moveY += 1;
          modifyMovementVector(obj);
        }else{                                        // Right border
          obj.moveX -= 1;
          modifyMovementVector(obj);
        }
      }
      else if (obj.x + obj.moveX - obj.radius - 1 <= 0) {
        if (obj.y + obj.moveY + obj.radius + 1 >= canvasHeight) { // Bottom left corner
          obj.moveX += 1;
          obj.moveY -= 1;
          modifyMovementVector(obj);
        }else if (obj.y + obj.moveY - obj.radius - 1 <= 0) {      // Up left corner
          obj.moveX += 1;
          obj.moveY += 1;
          modifyMovementVector(obj);
        }else{                                        // Left border
          obj.moveX += 1;
          modifyMovementVector(obj);
        }
      }
      else if(obj.y + obj.moveY + obj.radius + 1 >= canvasHeight){ // Bottom border
        obj.moveY -= 1;
        modifyMovementVector(obj);
      }else if(obj.y - obj.moveY - obj.radius - 1 <= 0){          // Up border
        obj.moveY += 1;
        modifyMovementVector(obj);
      }
    }

    // Move the objects in canvas
  	for (let i = 0; i<objectNumber; i++) {
      let obj = objects[i];
      obj.move(obj.moveX*speed,obj.moveY*speed);
    }});
  gameLoop.start()
}
startBtn.addEventListener("click",start);


// pause / resume the game
function pause_resume(){
  if(gameState == "run"){
    gameLoop.stop();
    gameState = "stop";
  }else if(gameState == "stop"){
    gameLoop.start();
    gameState = "run";
  }
}
pauseBtn.addEventListener("click",pause_resume);



// tracking the changes in variables of the game in webpage

function speedChange(){
  speed = Number(speedInput.options[speedInput.selectedIndex].value);
}
speedInput.addEventListener("change", speedChange);


function objectDistanceChange(){
  legalDistance = Number(objectDistanceInput.options[objectDistanceInput.selectedIndex].value);
}
objectDistanceInput.addEventListener("change", objectDistanceChange);


function cursorDistanceChange(){
  legalDistanceOfCursor = Number(cursorDistanceInput.options[cursorDistanceInput.selectedIndex].value);
}
cursorDistanceInput.addEventListener("change", cursorDistanceChange);


function avoidRateChange(){
  avoidRate = Number(avoidRateInput.options[avoidRateInput.selectedIndex].value);
}
avoidRateInput.addEventListener("change", avoidRateChange);


function sameSpeedChange(){
  let temp = (objectsHaveSameSpeedInput.options[objectsHaveSameSpeedInput.selectedIndex].value);
  if (temp == "true"){
    haveSameSpeed = true;
  }else{
    haveSameSpeed = false;
  }
}
objectsHaveSameSpeedInput.addEventListener("change", sameSpeedChange);


function objectSizeChange(){
  objectSize = Number(objectSizeInput.options[objectSizeInput.selectedIndex].value);
  if(objectSize === 0){
    for (let i = 0; i < objects.length; i++) {
        objects[i].radius = getRandomNumber(30);
    }
  }else{
    for (let i = 0; i < objects.length; i++) {
        objects[i].radius = objectSize;
    }
  }

}
objectSizeInput.addEventListener("change", objectSizeChange);

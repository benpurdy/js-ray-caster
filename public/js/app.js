var debug = false;

var TILE_SIZE = 16;
var GRID_SIZE = 64;

var VIEWPORT_WIDTH = 160;
var VIEWPORT_HEIGHT = 100;

var canvasD = document.getElementById("debug");
var ctxd = canvasD.getContext("2d");

var canvas = document.getElementById("output");
var ctx = canvas.getContext("2d");

if(debug){
	canvasD.style.display = "block";
	canvasD.width = WORLD_STRIDE * 32;
	canvasD.height = WORLD_STRIDE * 32;
	document.getElementById("resources").style.display = "block";
}

var stats = {
	frames: 0,
	pixelFill: 0,
	transparentRays: 0,
	sliceCount: 0
};

var debugLog = document.getElementById("debugLog");
var imgTexture = document.getElementById("texture");

var textureLookup = new Uint8ClampedArray(65536);

var textureLookup32 = new Uint32Array(128 * 128);


// get a reference to the imageData for the output canvas
var displayImgData = ctx.getImageData(0,0, VIEWPORT_WIDTH, VIEWPORT_HEIGHT);
var displayBuffer = displayImgData.data;


// buffer for drawing.
var buffer = new ArrayBuffer(VIEWPORT_WIDTH * VIEWPORT_HEIGHT * 4);

// two different views into the same buffer.
var buffer32 = new Uint32Array(buffer);
var buffer8 = new Uint8Array(buffer);

// depth buffer, probably way more precision than needed.
var depthBuffer = new Uint16Array(VIEWPORT_WIDTH * VIEWPORT_HEIGHT);


// player stuff
var playerX = 9 * GRID_SIZE + GRID_SIZE / 2;
var playerY = 7 * GRID_SIZE + GRID_SIZE / 2;

var playerDirection = toRadians(90);
var playerAngularVelocity = 0;
var targetPlayerDirection = toRadians(90);

var playerXDelta = 0;
var playerYDelta = 0;

var targetPlayerX = playerX;
var targetPlayerY = playerY;

var playerHeight = GRID_SIZE / 2;


// view and rendering stuff
var fov = toRadians(60);
var halfFov = fov / 2;
var halfViewHeight = Math.floor(VIEWPORT_HEIGHT / 2);
var halfViewWidth = Math.floor(VIEWPORT_WIDTH / 2);
var distanceToProjectionPlane = halfViewWidth / Math.tan(halfFov);

var bob = 0;

var ceilingColor = 0xff704030;
var floorColor = 0xff403040;


// render loop stuff
var lastTime = 0;
var delta = 0;
var frameAccum = 0;
var targetFrameTime = 1 / 30;
var maxFrameTime = targetFrameTime * 10;
var startTime = 0;



imgTexture.addEventListener("load", function() {
	var tempCanvas = document.createElement("canvas");

	tempCanvas.width = imgTexture.width;
	tempCanvas.height = imgTexture.height;

	var tempContext = tempCanvas.getContext("2d");

	currentTex = imgTexture;
	console.log("Texture loaded");
	
	tempContext.clearRect(0, 0, imgTexture.width, imgTexture.height);
	tempContext.drawImage(currentTex, 0, 0);

	var r,g,b,a;
	textureLookup = tempContext.getImageData(0, 0, imgTexture.width, imgTexture.height).data;
	for(var i = 0; i < textureLookup32.length; i++){
		r = textureLookup[i * 4];
		g = textureLookup[i * 4 + 1];
		b = textureLookup[i * 4 + 2];
		a = textureLookup[i * 4 + 3];
		
		textureLookup32[i] = (a<<24) | r | (g << 8) | (b << 16);
	}
});







function updatePlayer(delta) {
	
	playerAngularVelocity += ((targetPlayerDirection - playerDirection) * 50) * delta;
	playerAngularVelocity *= Math.pow(0.000001, delta);
	playerDirection += playerAngularVelocity * delta;

	playerXDelta += ((targetPlayerX - playerX) * 100) * delta;
	playerYDelta += ((targetPlayerY - playerY) * 100) * delta;
	
	var maxPlayerSpeed = 300;
	playerXDelta = Math.min(Math.max(-maxPlayerSpeed, playerXDelta), maxPlayerSpeed);
	playerYDelta = Math.min(Math.max(-maxPlayerSpeed, playerYDelta), maxPlayerSpeed);

	playerXDelta *= Math.pow(0.00000001, delta);
	playerYDelta *= Math.pow(0.00000001, delta);
	
	playerX += playerXDelta * delta;
	playerY += playerYDelta * delta;

	/*
	// player head-bob
	var d = distance(0,0, playerXDelta,playerYDelta);
	playerHeight = 32;
	if(d > 2) {
		d = Math.min(200, d) / 200;
		stats.moveSpeed = d;
		//d *= 0.01;
		bob += d * (delta * 10);
  	playerHeight += Math.floor(Math.abs(Math.sin(bob) * 5 * d));
	} else {
		bob = 0;
	}
	*/
}


/*
function swapTex(){
	if(currentTex == texA){
		texB.src = "http://swapshop.pixelsyntax.com/api/randomImage?" + Math.random();
	} else {
		texA.src = "http://swapshop.pixelsyntax.com/api/randomImage?" + Math.random();
	}
}
*/


function update(now) {

	delta = (now - lastTime) / 1000;
	lastTime = now;
	frameAccum += delta;

	if(frameAccum > maxFrameTime){
		frameAccum = 0;
	}

	// dear requestAnimationFrame, please don't go so fast.
	while(frameAccum > targetFrameTime) {

		if(debug) {
			ctxd.fillStyle = "white";
			ctxd.fillRect(0, 0, canvasD.width, canvasD.height);
			debugDrawWorld();
		}
		
		updatePlayer(targetFrameTime);
		renderWorld();
		renderSprites();
		applyLighting();
		showBuffer();
	
		if(debug) {
			stats.frames++;
			document.getElementById("status").innerHTML = (stats.frames / ((now - startTime) / 1000)).toPrecision(4) + " fps";
			if(stats.frames >= 100) {
				startTime = now;
				stats.frames = 0;
			}
		}
		frameAccum -= targetFrameTime;

	}
	window.requestAnimationFrame(update);
}


function init() {

	imgTexture.src = "images/example1.png";
	generateMap();

	canvas.width = VIEWPORT_WIDTH;
	canvas.height = VIEWPORT_HEIGHT;

	if(!debug){
		canvas.style.width="100%";		
	} else {
		canvas.style.float = "right";
	}

	initInputEvents();

	startTime = 0;
	update(0);
}

init();
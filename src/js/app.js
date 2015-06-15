// @ifdef DEBUG
// DEBUG MODE ENABLED
// @endif

// @ifndef DEBUG
// production build
// @endif

var TILE_SIZE = 16;
var GRID_SIZE = 64;

var VIEWPORT_WIDTH = 160;
var VIEWPORT_HEIGHT = 100;

// THESE MUST BE POWERS OF TWO (and must be large enough to contain viewport)
var BUFFER_WIDTH = 256;
var BUFFER_HEIGHT = 256;


var canvas = document.getElementById("output");

// @ifdef DEBUG
var canvasD = document.getElementById("debug");
var ctxd = canvasD.getContext("2d");
canvasD.style.display = "block";
canvasD.width = WORLD_STRIDE * 32;
canvasD.height = WORLD_STRIDE * 32;
document.getElementById("resources").style.display = "block";
// @endif

// @ifdef STATS
document.getElementById("status").style.display = "block";

var stats = {
	frames: 0,
	playerInBlock: 0,
	playerTileId:0,
	counters: { }
};

function resetStats() {
	for(itm in stats.counters){
		stats.counters[itm] = 0;
	}
}
// @endif

//var debugLog = document.getElementById("debugLog");
var imgTexture = document.getElementById("texture");

var textureLookup32 = new Uint32Array(128 * 128);

// buffer for drawing.
var buffer = new ArrayBuffer(BUFFER_WIDTH * BUFFER_HEIGHT * 4);

// two different views into the same buffer.
var buffer32 = new Uint32Array(buffer);
var buffer8 = new Uint8Array(buffer);

// depth buffer, probably way more precision than needed.
//var dbuffer = new ArrayBuffer(BUFFER_WIDTH * BUFFER_HEIGHT * 4);
var depthBuffer = new Float32Array(BUFFER_WIDTH * BUFFER_HEIGHT);


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
	//console.log("Texture loaded");
	
	tempContext.clearRect(0, 0, imgTexture.width, imgTexture.height);
	tempContext.drawImage(currentTex, 0, 0);

	var r,g,b,a;
	var textureLookup = tempContext.getImageData(0, 0, imgTexture.width, imgTexture.height).data;
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


function update(now) {

	delta = (now - lastTime) / 1000;
	lastTime = now;
	frameAccum += delta;

	if(frameAccum > maxFrameTime){
		frameAccum = 0;
	}

	// dear requestAnimationFrame, please don't go so fast.
	while(frameAccum > targetFrameTime) {

// @ifdef DEBUG
		if(debug) {
			ctxd.fillStyle = "white";
			ctxd.fillRect(0, 0, canvasD.width, canvasD.height);
			debugDrawWorld();
		}
// @endif
		
		var timeStamp1 = new Date().getTime();
		updatePlayer(targetFrameTime);

		renderWorld();
		renderSprites();

		loadColorTexture(buffer8);
		loadDepthTexture(depthBuffer);
		
// @ifdef DEBUG
		debugDrawWorld();
// @endif

		drawGL();
		var timeStamp2 = new Date().getTime();
	
		// @ifdef STATS
		var statList = [];

		for(itm in stats){
			if(itm != "counters"){
				statList.push(itm + " = " + stats[itm]);
			}
		}
		statList.push("------");

		for(itm in stats.counters){
			statList.push(itm + ": " + stats.counters[itm]);
		}
		var currentFPS = (stats.frames / ((now - startTime) / 1000)).toPrecision(4);
		statList.push("FPS: " + currentFPS);
		statList.push("Frame time: " + (timeStamp2 - timeStamp1).toPrecision(3) + " ms");

		stats.frames++;
		
		document.getElementById("status").innerHTML = statList.join("<br>");

		if(stats.frames >= 100) {
			startTime = now;
			stats.frames = 0;
		}
		resetStats();
		// @endif
	
		frameAccum -= targetFrameTime;
	}
	window.requestAnimationFrame(update);
}


function resizeViewport() {
	// @ifdef DEBUG
		return;
	// @endif
	
	var aspect = VIEWPORT_WIDTH / VIEWPORT_HEIGHT;
	
	canvas.width = window.innerWidth;
	canvas.height = ~~(canvas.width / aspect);
	
	initGL(canvas);
}

function initialize() {

	imgTexture.src = "images/example1.png";
	generateMap();

	var aspect = VIEWPORT_WIDTH / VIEWPORT_HEIGHT;
	canvas.width = window.innerWidth;
	canvas.height = ~~(canvas.width / aspect);
	
	// @ifdef DEBUG
		canvas.width = 300;
		canvas.height = ~~(canvas.width / aspect);
		canvas.style.float = "right";
	// @endif

	initGL(canvas);
	initInputEvents();

	window.addEventListener("resize", resizeViewport);

	startTime = 0;
	update(0);
	
	console.log("Initialized.");
}
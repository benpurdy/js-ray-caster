var keys = [];
for(var i = 0; i < 180; i++){
	keys[i] = false;
}

var KEY_W = 87;
var KEY_S = 83;
var KEY_D = 68;
var KEY_A = 65;
var KEY_Q = 81;
var KEY_E = 69;
var KEY_F = 70;

var KEY_UP = 38;
var KEY_DOWN = 40;
var KEY_LEFT = 37;
var KEY_RIGHT = 39;

var KEY_SPACE = 32;

var MOVE_EPSILON = 1;

function setKey(key, state){
	keys[key] = state;
}

function keyDown(evt){
	
	if(!keys[evt.keyCode]) {

		setKey(evt.keyCode, true);
		keyPressed(evt.keyCode);
	}
}

function keyPressed(code) {
	switch(code) {
		case KEY_W:
		case KEY_UP:
			forward();
		break;

		case KEY_S:
		case KEY_DOWN:
			backward();
		break;

		case KEY_A:
			straifLeft();
		break;

		case KEY_D:
			straifRight();
		break;

		case KEY_Q:
		case KEY_LEFT:
			turnLeft();
		break;

		case KEY_E:
		case KEY_RIGHT:
			turnRight();
		break;

		case KEY_F:
			action();
		break;

		default:
		//console.log("key: " + code);
		break;
	}
}


function keyUp(evt){
	setKey(evt.keyCode, false);
}

// 
function playerCanMove(targetX, targetY) {
	return ( (Math.abs(playerX - targetX) <= GRID_SIZE*2) && (Math.abs(playerY - targetY) <= GRID_SIZE*2) );
} 


function action(){
	var cosa = Math.cos(playerDirection);
	var sina = Math.sin(playerDirection);
	
	var useX = playerX + cosa * (GRID_SIZE * 0.75);
	var useY = playerY + sina * (GRID_SIZE * 0.75);
	
	// try to use the wall of the tile you're in
	var tileId1 = getWorld(playerX, playerY);
	var hitFace = intersectSides(world[tileId1], playerX, playerY, useX, useY);
	if((hitFace & world[tileId1].usableface) != 0) {
		use(world[tileId1], hitFace);
		return;
	}

	// try to use the neighboring wall
	var tileId2 = getWorld(useX, useY);
	var hitFace = intersectSides(world[tileId2], playerX, playerY, useX, useY);
	if((hitFace & world[tileId2].usableface) != 0) {
		use(world[tileId2], hitFace);
		return;
	}
}


function tryMove(oldX, oldY, newX, newY) {
	if(!playerCanMove(newX, newY)){
		return false;
	}

	var newTile = world[getWorld(newX, newY)];

	if(!isWalkable(newTile.flags)){
		return false;
	} else {

		var tx1 = ~~(oldX / GRID_SIZE);
		var ty1 = ~~(oldY / GRID_SIZE);
		
		var tx2 = ~~(newX / GRID_SIZE);
		var ty2 = ~~(newY / GRID_SIZE);
		
		var currentTile = world[getWorld(oldX, oldY)];
		
		var moveBitOutgoing = 0;
		var moveBitIncoming = 0;
		
		if(tx1 < tx2) {
			moveBitIncoming = TILE_FACE_W;
			moveBitOutgoing = TILE_FACE_E;
		} else if(tx1 > tx2) {
			moveBitIncoming = TILE_FACE_E;
			moveBitOutgoing = TILE_FACE_W;
		}

		if(ty1 < ty2) {
			moveBitIncoming = TILE_FACE_N;
			moveBitOutgoing = TILE_FACE_S;
		} else if(ty1 > ty2) {
			moveBitIncoming = TILE_FACE_S;
			moveBitOutgoing = TILE_FACE_N;
		}

		if( ((moveBitIncoming & newTile.walkableface) != 0) && 
			( (moveBitOutgoing & currentTile.walkableface) != 0) ){
			return true;
		} else {
			return false;
		}
	}
}

function turnRight(){
	targetPlayerDirection += toRadians(90);
}

function turnLeft(){
	targetPlayerDirection -= toRadians(90);
}

function straifLeft(){
	var rads = targetPlayerDirection - toRadians(90);
	var newX = targetPlayerX + Math.round(Math.cos(rads)) * GRID_SIZE;
	var newY = targetPlayerY + Math.round(Math.sin(rads)) * GRID_SIZE;
	if(tryMove(targetPlayerX, targetPlayerY, newX, newY)){
		targetPlayerX = newX;
		targetPlayerY = newY;
	}
}

function straifRight(){
	var rads = targetPlayerDirection + toRadians(90);
	var newX = targetPlayerX + Math.round(Math.cos(rads)) * GRID_SIZE;
	var newY = targetPlayerY + Math.round(Math.sin(rads)) * GRID_SIZE;
	if(tryMove(targetPlayerX, targetPlayerY, newX, newY)){
		targetPlayerX = newX;
		targetPlayerY = newY;
	}
}

function forward(){
	var rads = targetPlayerDirection;
	var newX = targetPlayerX + Math.round(Math.cos(rads)) * GRID_SIZE;
	var newY = targetPlayerY + Math.round(Math.sin(rads)) * GRID_SIZE;
	if(tryMove(targetPlayerX, targetPlayerY, newX, newY)){
		targetPlayerX = newX;
		targetPlayerY = newY;
	}
}

function backward(){
	var rads = targetPlayerDirection;
	var newX = targetPlayerX - Math.round(Math.cos(rads)) * GRID_SIZE;
	var newY = targetPlayerY - Math.round(Math.sin(rads)) * GRID_SIZE;
	if(tryMove(targetPlayerX, targetPlayerY, newX, newY)){
		targetPlayerX = newX;
		targetPlayerY = newY;
	}
}

function handleTouch(evt){
	var xMargin = window.innerWidth / 4;
	
	if(evt.touches[0].pageY < window.innerHeight / 2){
		// top half
		if(evt.touches[0].pageX < xMargin) {
			straifLeft(); 
		} else if (evt.touches[0].pageX > (window.innerWidth - xMargin)){
			straifRight();
		} else {
			forward();
		}
	} else {
		// bottom half
		if(evt.touches[0].pageX < xMargin) {
			turnLeft(); 
		} else if(evt.touches[0].pageX > (window.innerWidth - xMargin)){
			turnRight();
		} else {
			backward();
		}
	}
}

function initInputEvents() { 
	document.addEventListener("keydown", keyDown);
	document.addEventListener("keyup", keyUp);
	document.addEventListener("touchstart", handleTouch);
}
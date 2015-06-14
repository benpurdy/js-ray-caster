var keys = [];
for(var i = 0; i < 180; i++){
	keys[i] = false;
}

function setKey(key, state){
	keys[key] = state;
}

function keyDown(evt){
	
	if(!keys[evt.keyCode]) {

		setKey(evt.keyCode, true);
		
		if(keys[37] || keys[81]) {
			turnLeft();
		}

		if(keys[39] || keys[69]) {
			turnRight();
		}
		
		if(keys[65]) {
			straifLeft();
		}
		
		if(keys[68]) {
			straifRight();
		}

		if(keys[87]) {
			forward();
		}
		
		if(keys[83]) {
			backward()
		}
	}
}

function keyUp(evt){
	setKey(evt.keyCode, false);
}

function tryMove(oldX, oldY, newX, newY) {

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

		if( ((moveBitIncoming & newTile.walkableface) != 0) || 
			((moveBitOutgoing & currentTile.walkableface) != 0) ){
			return false;
		} else {
			return true;
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
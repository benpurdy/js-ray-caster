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
	return isWalkable(world[getWorld(newX, newY)].flags);
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
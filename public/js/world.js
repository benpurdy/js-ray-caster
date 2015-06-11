var WORLD_STRIDE = 15;

var world = [];
var sprites = [];

function generateMap() {

	world = [
		40, 40, 40, 40, 40, 40, 40, 40, 40, 40, 40, 40, 40, 40, 40,
		40,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0, 40,
		40,  0, 58,  0,  0,  0, 35,  0,  0,  0,  0,  0,  0,  0, 40,
		40,  0, 33,  0, 33,  0, 32,  0,  0,  0,  0,  0,  0,  0, 40,
		40,  0,  0,  0,  0,  0, 58,  0,  0,  0,  0,  0,  0,  0, 40,
		40, 58, 33, 58, 33,  0,  0,  0,  0,  0,  0,  0,  0,  0, 40,
		40,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0, 40,
		40,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0, 40,
		40,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0, 40,
		40,  0,  0,  0,  0,  0,  0, 58, 34, 57, 57, 34, 35,  0, 40,
		40,  0,  0,  0,  0,  0,  0, 33,  0,  0,  0,  0,  0,  0, 40,
		40,  0,  0,  0,  0,  0,  0, 32,  0,  0,  0,  0,  0,  0, 40,
		40,  0,  0,  0,  0,  0,  0, 34,  0,  0,  0,  0,  0,  0, 40,
		40,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0, 40,
		40, 40, 41, 40, 40, 40, 40, 40, 40, 40, 40, 40, 40, 40, 40,
	];

	// randomize edge walls for more interestingness.
	for(var i = 0; i < WORLD_STRIDE; i++){
		world[i] = randomInt(6) + 40;
		world[i*WORLD_STRIDE] = randomInt(6) + 40;
		world[i*WORLD_STRIDE+(WORLD_STRIDE-1)] = randomInt(6) + 40;
		world[WORLD_STRIDE*(WORLD_STRIDE-1)+i] = randomInt(6) + 40;
	}

	for(var i = 0; i < 20; i++){
		var x = 0;
		var y = 0;
		var found = false;
		var area = ((WORLD_STRIDE-2) * GRID_SIZE) + GRID_SIZE;

		while(!found) {
		  x = randomInt(area)
			y = randomInt(area);
			
			if(isWalkable(getWorld(x, y))){
				found = true;
			}
		}

		var tx = Math.floor(Math.random() * 8);
		var ty = Math.floor(Math.random() * 4);

		sprites.push({
				"x" : x, 
				"y" : y,
				"tileX" : tx,
				"tileY" : ty
			});
	}
}

// Get the grid index/uid for a given world-space coordinate
function getWorld(x, y){
	
	var tx = Math.floor(x / GRID_SIZE);
	var ty = Math.floor(y / GRID_SIZE);

	if((tx >= WORLD_STRIDE) || (ty >= WORLD_STRIDE) || (tx < 0) || (ty < 0)) {
		return -1;
	}

	return  tx + ty * WORLD_STRIDE;
}

function debugDrawWorld() {

	ctxd.fillStyle = "white";
	ctxd.strokeStyle = "black";

	ctxd.fillRect(0, 0, canvasD.width, canvasD.height);

	for(var y = 0; y < WORLD_STRIDE; y++){
		for(var x = 0; x < WORLD_STRIDE; x++){
			var tileId = x + y * WORLD_STRIDE;
			if(isSolid(tileId)) {
				ctxd.fillStyle = isTransparent(tileId) ? "#b0b0b0" : "#909090";
				ctxd.fillRect(x * 32,y * 32, 32, 32);

				if(!isWalkable(tileId)) {
					ctxd.strokeRect(x * 32+1, y * 32+1, 30, 30);
				}
			}
		}
	}
}


function isWalkable(tileId){
	return (world[tileId] == 0) || (world[tileId] == 58);
}

function isTransparent(tileId){
	var tile = world[tileId];
	return (tile == 56) || (tile == 57) || (tile == 58);
}

// returns true if a grid square should register a hit when ray casting
function isSolid(tileId){
	return world[tileId] > 0;
}
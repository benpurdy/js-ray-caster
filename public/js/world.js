var WORLD_STRIDE = 15;

var world = [];
var sprites = [];

var TILE_FLAGS_TRANSPARENT 	= 1 << 0;
var TILE_FLAGS_WALKABLE 		= 1 << 1;
var TILE_FLAGS_VISIBLE      = 1 << 2;

var TILE_FACE_N = 1 << 0;
var TILE_FACE_E = 1 << 1;
var TILE_FACE_S = 1 << 2;
var TILE_FACE_W = 1 << 3;

var TILE_FACE_ALL = TILE_FACE_N + TILE_FACE_E + TILE_FACE_S + TILE_FACE_W;


function generateMap() {

	var tmpWorld = [
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
	for(var i = 0; i < WORLD_STRIDE; i++) {
		tmpWorld[i] = randomInt(6) + 40;
		tmpWorld[i*WORLD_STRIDE] = randomInt(6) + 40;
		tmpWorld[i*WORLD_STRIDE+(WORLD_STRIDE-1)] = randomInt(6) + 40;
		tmpWorld[WORLD_STRIDE*(WORLD_STRIDE-1)+i] = randomInt(6) + 40;
	}


	// Placeholder until there's an editor.. convert the tile indeces into 
	// actual tile data.
	for(var i = 0; i < tmpWorld.length; i++) {
		var flags = 0;
		
		var frontface = 0;
		var backface = 0;

		if(tmpWorld[i] == 58) { // Vines
			flags |= TILE_FLAGS_TRANSPARENT;
			flags |= TILE_FLAGS_WALKABLE;
			flags |= TILE_FLAGS_VISIBLE;

			// assign a random face to be visible.
			var f1, f1;
			switch(randomInt(4)){
				case 0:
					f1 = TILE_FACE_S;
					f2 = TILE_FACE_N;
				break;
					case 1:
					f1 = TILE_FACE_N;
					f2 = TILE_FACE_S;
				break;
				case 2:
					f1 = TILE_FACE_E;
					f2 = TILE_FACE_W;
				break;
				case 3:
					f1 = TILE_FACE_W;
					f2 = TILE_FACE_E;
				break;
			}

			frontface |= f1;
			backface |= f2;
			
		} else if(tmpWorld[i] == 57) { // Fence
			flags += TILE_FLAGS_TRANSPARENT;
			flags += TILE_FLAGS_VISIBLE;
			
			frontface |= TILE_FACE_N;
			frontface |= TILE_FACE_S;
			backface |= TILE_FACE_N;
			backface |= TILE_FACE_S;
		} else if(tmpWorld[i] != 0) { // Flag all other non-empty tiles as visible.
			flags |= TILE_FLAGS_VISIBLE;
		}

		if(tmpWorld[i] == 0) { // make empty spaces walkable.
			flags |= TILE_FLAGS_WALKABLE;
		}

		world.push( {
			textureIndex:tmpWorld[i],
			flags: flags,
			frontface: frontface,
			backface: backface
		})
	}

	for(var i = 0; i < 20; i++) {
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
	stats.counters.getWorld++;
	var tx = ~~(x / GRID_SIZE);
	var ty = ~~(y / GRID_SIZE);

	if((tx >= WORLD_STRIDE) || (ty >= WORLD_STRIDE) || (tx < 0) || (ty < 0)) {
		return 0;
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


function isWalkable(tileFlags) {
	return (tileFlags & TILE_FLAGS_WALKABLE) == TILE_FLAGS_WALKABLE;
}

function isTransparent(tileFlags) {
	stats.counters.isTransparent++;
	return (tileFlags & TILE_FLAGS_TRANSPARENT) == TILE_FLAGS_TRANSPARENT;
}

// returns true if a grid square should register a hit when ray casting, it 
// still might not DRAW anything but it has the opportunity to...
function isVisible(tileFlags) {
	return (tileFlags & TILE_FLAGS_VISIBLE) == TILE_FLAGS_VISIBLE;
}
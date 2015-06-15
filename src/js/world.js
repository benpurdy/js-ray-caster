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
		40,  0, 33,  0,  0,  0, 58,  0,  0,  0,  0,  0,  0,  0, 40,
		40, 58, 33, 59, 33,  0,  0,  0,  0,  0,  0,  0,  0,  0, 40,
		40,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0, 40,
		40,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0, 40,
		40,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0, 40,
		40,  0,  0,  0,  0,  0,  0, 58,  0, 57, 57, 34, 35,  0, 40,
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
		var walkableface = 0;

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
			flags |= TILE_FLAGS_WALKABLE;
			
			frontface |= TILE_FACE_N;
			frontface |= TILE_FACE_S;
			walkableface = frontface;

			backface |= TILE_FACE_N;
			backface |= TILE_FACE_S;
		} else if(tmpWorld[i] == 59) { // Bars
			flags += TILE_FLAGS_TRANSPARENT;
			flags += TILE_FLAGS_VISIBLE;
			flags |= TILE_FLAGS_WALKABLE;
			
			frontface |= TILE_FACE_S
			walkableface = frontface;
			backface |= TILE_FACE_N;
		} else if(tmpWorld[i] != 0) { // Flag all other non-empty tiles as visible.
			flags |= TILE_FLAGS_VISIBLE;
			frontface = TILE_FACE_ALL;
		}

		if(tmpWorld[i] == 0) { // make empty spaces walkable.
			flags |= TILE_FLAGS_WALKABLE;
		}

		world.push( {
			textureIndex:tmpWorld[i],
			flags: flags,
			walkableface: walkableface,
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
	// @ifdef STATS
	stats.counters.getWorld++;
	// @endif
	var tx = ~~(x / GRID_SIZE);
	var ty = ~~(y / GRID_SIZE);

	if((tx >= WORLD_STRIDE) || (ty >= WORLD_STRIDE) || (tx < 0) || (ty < 0)) {
		return 0;
	}

	return  tx + ty * WORLD_STRIDE;
}


// @ifdef DEBUG
function debugDrawWorld() {

	ctxd.fillStyle = "#c0c0c0";
	ctxd.strokeStyle = "black";

	ctxd.fillRect(0, 0, canvasD.width, canvasD.height);
	
	var walls = [
		[0,0, 1,0], // N 
		[1,0, 1,1], // E
		[0,1, 1,1], // S
		[0,0, 0,1]  // W
	];
	var boxSize = 32;

	for(var y = 0; y < WORLD_STRIDE; y++) {
		for(var x = 0; x < WORLD_STRIDE; x++) {
			
			var tileId = x + y * WORLD_STRIDE;
			var px = x * boxSize;
			var py = y * boxSize;
			
			if(isVisible(world[tileId].flags)){
				var transparent = isTransparent(world[tileId].flags);
				
				
				ctxd.fillStyle = transparent ? "#86bcca" : "#695628";
				ctxd.fillRect(x * 32,y * 32, 32, 32);

				if(transparent) {
					ctxd.strokeStyle = "#557780";
					ctxd.lineWidth = 2;
					ctxd.beginPath();

					ctxd.save();
					ctxd.translate(px + boxSize/2, py + boxSize/2);
							
					for(var i = 0; i < walls.length; i++){
						
						if( (world[tileId].frontface & (1<<i)) != 0 ) {
							ctxd.save();
							ctxd.rotate(HALF_PI * (i-1));
							ctxd.moveTo( boxSize/2 - 2, -boxSize/2);
							ctxd.lineTo( boxSize/2 - 2, boxSize/2);
							ctxd.restore();
						}
					}

					ctxd.restore();
					ctxd.stroke();
					ctxd.lineWidth = 1;
				}

				if(!isWalkable(world[tileId].flags)) {
					ctxd.strokeStyle = "#202020";
					ctxd.strokeRect(px + 1, py + 1, 30, 30);
				}
			}
		}
	}
}
// @endif

function isWalkable(tileFlags) {
	return (tileFlags & TILE_FLAGS_WALKABLE) == TILE_FLAGS_WALKABLE;
}

function isTransparent(tileFlags) {
	// @ifdef STATS
	stats.counters.isTransparent++;
	// @endif
	return (tileFlags & TILE_FLAGS_TRANSPARENT) == TILE_FLAGS_TRANSPARENT;
}

// returns true if a grid square should register a hit when ray casting, it 
// still might not DRAW anything but it has the opportunity to...
function isVisible(tileFlags) {
	return (tileFlags & TILE_FLAGS_VISIBLE) == TILE_FLAGS_VISIBLE;
}
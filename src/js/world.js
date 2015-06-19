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

var barsTile;

function generateMap() {

	var tmpWorld = [
		40, 40, 40, 40, 40, 40, 40, 40, 40, 40, 40, 40, 40, 40, 40,
		40, 58,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0, 40,
		40,  0, 58,  0,  0,  0, 35,  0,  0,  0,  0,  0,  0,  0, 40,
		40, 58, 33,  0, 33,  0, 32,  0,  0,  0,  0,  0,  0,  0, 40,
		40,  0, 33,  0,  0,  0, 58,  0,  0,  0, 57,  0,  0,  0, 40,
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

	var emptyWorld = [
		40, 40, 40, 40, 40, 40, 40, 40, 40, 40, 40, 40, 40, 40, 40,
		40,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0, 40,
		40,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0, 40,
		40,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0, 40,
		40,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0, 40,
		40,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0, 40,
		40,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0, 40,
		40,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0, 40,
		40,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0, 40,
		40,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0, 40,
		40,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0, 40,
		40,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0, 40,
		40,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0, 40,
		40,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0, 40,
		40,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0, 40,
		40,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0, 40,
		40, 40, 41, 40, 40, 40, 40, 40, 40, 40, 40, 40, 40, 40, 59,
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
		
		var visibleface = 0;
		var walkableface = 0;
		var usableface = 0;

		var floorcolor = randomInt(80)+60 + ((randomInt(80)+60) << 8) + ((randomInt(80)+60) << 16);

		if(tmpWorld[i] == 58) { // Vines

			flags = TILE_FLAGS_TRANSPARENT | TILE_FLAGS_WALKABLE | TILE_FLAGS_VISIBLE;

			// assign a random face to be visible.
			var f1, f1;
			switch(randomInt(4)){
				case 0:
					visibleface = TILE_FACE_S;
				break;
					case 1:
					visibleface = TILE_FACE_N;
				break;
				case 2:
					visibleface = TILE_FACE_E;
				break;
				case 3:
					visibleface = TILE_FACE_W;
				break;
			}
			walkableface = TILE_FACE_ALL;
			floorcolor = 0x003000;

		} else if(tmpWorld[i] == 57) { // Fence
			
			flags = TILE_FLAGS_TRANSPARENT | TILE_FLAGS_VISIBLE | TILE_FLAGS_WALKABLE;
			visibleface = TILE_FACE_N | TILE_FACE_S;
			walkableface = TILE_FACE_E | TILE_FACE_W;

		} else if(tmpWorld[i] == 59) { // Bars
			barsTile = i;
			flags = TILE_FLAGS_TRANSPARENT | TILE_FLAGS_VISIBLE | TILE_FLAGS_WALKABLE;
			
			visibleface = TILE_FACE_S;

			walkableface = ~visibleface;
			usableface = visibleface;
		
		} else if(tmpWorld[i] != 0) { // Flag all other non-empty tiles as visible.
		
			flags = TILE_FLAGS_VISIBLE;

			visibleface = TILE_FACE_ALL;
			walkableface = 0;
		
		}

		if(tmpWorld[i] == 0) { // make empty spaces walkable.
			flags = TILE_FLAGS_WALKABLE;
			walkableface = TILE_FACE_ALL;
		}

		// Set up pairs of vectors for each wall segment to use for 
		// intersection testing later on.

		var x = i % WORLD_STRIDE;
		var y = ~~(i / WORLD_STRIDE);
		var faceVectors = [];
		var offsets = [
			[0,0, 1,0],
			[1,0, 1,1],
			[1,1, 0,1],
			[0,1, 0,0]
		];
		
		for(var f = 0; f < 4; f++) {
			var fx =  (offsets[f][0] + x) * GRID_SIZE;
			var fy =  (offsets[f][1] + y) * GRID_SIZE;
			var fx2 = (offsets[f][2] + x) * GRID_SIZE;
			var fy2 = (offsets[f][3] + y) * GRID_SIZE;

			faceVectors.push( [new Vec2(fx, fy), new Vec2(fx2,fy2)] );
		}
		var textureIndex = tmpWorld[i];
		var tileX = textureIndex % 8;
		var tileY = ~~(textureIndex / 8);
		var textureOffset = (tileX * TILE_SIZE) + ((tileY * TILE_SIZE) * TEXTURE_SIZE);

		var floor = (tmpWorld[i] == 0) && (Math.random() > 0.75) ? 40 : 39;

		world.push({
			floorcolor: floorcolor,
			gridx : x,
			gridy : y,
			flags: 				flags,
			walkableface: walkableface,
			visibleface:  visibleface,
			usableface:   usableface,
			faceVectors:  faceVectors,
			texOffsetX:   0,
			texOffsetY:   0,
			textureIndex: tmpWorld[i],
			floorTexture: floor,
			ceilingTexture: 41,
			tileTextureOffset: getPixelIndexForTexture(tmpWorld[i]),
			ceilingTextureOffset: getPixelIndexForTexture(41),
			floorHeight: (floor == 40) ? -6 : 0,
			floorTextureOffset: getPixelIndexForTexture(floor)

		});
	}

	for(var i = 0; i < 15; i++) {
		var x = 0;
		var y = 0;
		var found = false;
		var area = ((WORLD_STRIDE-3) * GRID_SIZE) + GRID_SIZE;

		while(!found) {
		  x = randomInt(area) + GRID_SIZE/2;
			y = randomInt(area) + GRID_SIZE/2;
			
			if(isWalkable(world[getWorld(x, y)].flags)){
				found = true;
			}
		}

		var tx = Math.floor(Math.random() * 16);
		var ty = Math.floor(Math.random() * 2);

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
		return -1;
	}

	return  tx + ty * WORLD_STRIDE;
}


function intersectSides(tile, x1,y1, x2,y2) {
	var testVec1 = new Vec2(x1, y1);
	var testVec2 = new Vec2(x2, y2);

	// see if any face are intersected.
	for(var i = 0; i < 4; i++) {
		var d = intersectVectors(tile.faceVectors[i][0], tile.faceVectors[i][1], testVec1, testVec2);
	//	console.log("wall " + i + ": " + d);
		if(d >= 0 && d <= 1){
			//console.log("HIT FACE:" + i + " at " + d);
			//TODO: this is dumb, changing the TILE_FACE bit values can break this.
			return (1 << i); 
		} 
	}

	return 0;
}

// @ifdef DEBUG

function debugDrawWorldGrid(){
	ctxd.fillStyle = "#d0d0d0";
	for(var i = 0; i < WORLD_STRIDE; i++) {
		ctxd.fillRect(i*GRID_SIZE, 0, 1, GRID_SIZE*WORLD_STRIDE);
		ctxd.fillRect(0, i*GRID_SIZE, GRID_SIZE*WORLD_STRIDE, 1);
	}
}


function debugDrawWorld() {

	ctxd.fillStyle = "#ffffff";
	ctxd.strokeStyle = "black";

	ctxd.fillRect(0, 0, GRID_SIZE*WORLD_STRIDE, GRID_SIZE*WORLD_STRIDE);
	
	var walls = [
		[0,0, 1,0], // N 
		[1,0, 1,1], // E
		[0,1, 1,1], // S
		[0,0, 0,1]  // W
	];


	for(var y = 0; y < WORLD_STRIDE; y++) {
		for(var x = 0; x < WORLD_STRIDE; x++) {
			
			var tileId = x + y * WORLD_STRIDE;
			var px = x * GRID_SIZE;
			var py = y * GRID_SIZE;
			
			if(isVisible(world[tileId].flags)){
				var transparent = isTransparent(world[tileId].flags);
				
				
				ctxd.fillStyle = transparent ? "#d0d0d0" : "#695628";
				ctxd.fillRect(x * GRID_SIZE, y * GRID_SIZE, GRID_SIZE, GRID_SIZE);

				if(transparent) {
					ctxd.strokeStyle = "#5d2b1b";
					ctxd.lineWidth = 2;
					ctxd.beginPath();

					ctxd.save();
					ctxd.translate(px + GRID_SIZE / 2, py + GRID_SIZE / 2);
							
					for(var i = 0; i < walls.length; i++){
						
						if( (world[tileId].visibleface & (1<<i)) != 0 ) {
							ctxd.save();
							ctxd.rotate(HALF_PI * (i-1));
							ctxd.moveTo( GRID_SIZE / 2 - 2, -GRID_SIZE / 2);
							ctxd.lineTo( GRID_SIZE / 2 - 2, GRID_SIZE / 2);
							ctxd.restore();
						}
					}

					ctxd.restore();
					ctxd.stroke();
					ctxd.lineWidth = 1;
				}

				if(!isWalkable(world[tileId].flags)) {
					ctxd.strokeStyle = "#202020";
					ctxd.strokeRect(px + 1, py + 1, GRID_SIZE-2, GRID_SIZE-2);
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


function use(tile, face) {
	if(tile.textureIndex == 59) {
		tile.isOpen = !tile.isOpen;
	}
}


function debugAnimateBars(now) {
	var target = world[barsTile].isOpen ? 0.95 : 0.00;
	
	if(world[barsTile].isOpen) {
		world[barsTile].texOffsetX = Math.min(target, world[barsTile].texOffsetX + 0.035);
	} else {
		world[barsTile].texOffsetX = Math.max(target, world[barsTile].texOffsetX - 0.035);
	}
	
	if(world[barsTile].texOffsetX > 0.8){
		world[barsTile].walkableface = TILE_FACE_ALL;
	} else {
		world[barsTile].walkableface = TILE_FACE_ALL & ~TILE_FACE_S;
	}
		
}
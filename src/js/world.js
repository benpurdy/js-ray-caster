var WORLD_STRIDE = 15;

var WORLD_WIDTH = 15;
var WORLD_HEIGHT = 15;

var world = [];
var sprites = [];

var TILE_FLAGS_TRANSPARENT 	= 1 << 0;
var TILE_FLAGS_WALKABLE 		= 1 << 1;
var TILE_FLAGS_VISIBLE      = 1 << 2;

var TILE_FACE_N = 1 << 1;
var TILE_FACE_E = 1 << 0;
var TILE_FACE_S = 1 << 3;
var TILE_FACE_W = 1 << 2;

var FACE_INDEX_N = 0;
var FACE_INDEX_E = 1;
var FACE_INDEX_S = 2;
var FACE_INDEX_W = 3;

var REPEAT = 1;
var CLAMP = 2;
var CUT = 3;

var NULL_TILE_ID = 0;

var TILE_FACE_ALL = TILE_FACE_N + TILE_FACE_E + TILE_FACE_S + TILE_FACE_W;

var barsTile;

var textures = [];

function initTextures() {
	var textureSteps = TEXTURE_SIZE / TILE_SIZE;
	var idx = 0;
	
	for(var y = 0; y < textureSteps; y++){
		for(var x = 0; x < textureSteps; x++){
			
			textures.push( {
				pixelOffset: getPixelIndexForTexture(idx),
				sourceX: x*TILE_SIZE,
				sourceY: y*TILE_SIZE
			} );	
			
			idx++;
		}
	}
}

function generateMap() {

	var tmpWorld = [
		40, 40, 40, 40, 40, 40, 40, 40, 40, 40, 40, 40, 40, 40, 40,
		40, 58,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0, 40,
		40,  0, 58,  0,  0,  0, 35,  0,  0,  0,  0,  0,  0,  0, 40,
		40, 58, 33,  0, 33,  0, 32,  0,  0,  0,  0,  0,  0,  0, 40,
		40,  0, 33,  0,  0,  0, 58,  0,  0,  0,  0,  0,  0,  0, 40,
		40, 58, 33, 59, 33,  0,  0,  0,  0,  0,  0,  0,  0,  0, 40,
		40,  0,  0,  0,  0,  0,  0,  0,  0,  0, 0,  0,  0,  0, 40,
		40,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0, 40,
		40,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0, 40,
		40,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0, 34, 35,  0, 40,
		40,  0,  0,  0, 32,  0,  0,  0,  0,  0,  0,  0,  0,  0, 40,
		40,  0,  0,  0,  0,  0,  0, 32,  0,  0,  0,  0,  0,  0, 40,
		40,  0,  0,  0,  0,  0,  0, 34,  0,  0,  0,  0,  0,  0, 40,
		40,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0, 40,
		40, 40, 41, 40, 40, 40, 40, 40, 40, 40, 40, 40, 40, 40, 40,
	];

	var tmpWo3rld = [
		40, 40, 40, 40, 40, 40, 40, 40, 40, 40, 40, 40, 40, 40, 40,
		40,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0, 40,
		40,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0, 40,
		40,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0, 40,
		40,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0, 40,
		40,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0, 40,
		40,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0, 40,
		40,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0, 40,
		40, 57, 57, 57, 57, 57,  0, 57, 57, 57, 57, 57, 57, 57, 40,
		40,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0, 40,
		40,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0, 40,
		40,  0,  0,  0,  0,  0,  0,  0,  0,  0, 57, 57, 57,  0, 40,
		40,  0,  0,  0,  0,  0,  0,  0,  0,  0, 57, 57, 57,  0, 40,
		40,  0,  0,  0,  0,  0,  0,  0,  0,  0, 57, 57, 57,  0, 40,
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
		
		var faceflags = [0, 0, 0, 0];

		var textureIndex = tmpWorld[i];

		var floorcolor = randomInt(80)+60 + ((randomInt(80)+60) << 8) + ((randomInt(80)+60) << 16);

		if(tmpWorld[i] == 58) { // Vines

			var face = randomInt(4);
			
			faceflags[face] |= TILE_FLAGS_VISIBLE;
			faceflags[face] |= TILE_FLAGS_TRANSPARENT;

			faceflags[0] |= TILE_FLAGS_WALKABLE;
			faceflags[1] |= TILE_FLAGS_WALKABLE;
			faceflags[2] |= TILE_FLAGS_WALKABLE;
			faceflags[3] |= TILE_FLAGS_WALKABLE;
			
			floorcolor = 0x003000;
		} else if(tmpWorld[i] == 57) { // Fence
			
			faceflags[0] |= (TILE_FLAGS_VISIBLE | TILE_FLAGS_TRANSPARENT);
			
			faceflags[1] |= TILE_FLAGS_WALKABLE;
			faceflags[3] |= TILE_FLAGS_WALKABLE;

		} else if(tmpWorld[i] == 59) { // Bars
			
			barsTile = i;
			
			faceflags[0] |= (TILE_FLAGS_VISIBLE | TILE_FLAGS_TRANSPARENT);
			
			faceflags[1] |= TILE_FLAGS_WALKABLE;
			faceflags[2] |= TILE_FLAGS_WALKABLE;
			faceflags[3] |= TILE_FLAGS_WALKABLE;
		} else if(tmpWorld[i] != 0) { // Flag all other non-empty tiles as visible.
			faceflags[0] |= TILE_FLAGS_VISIBLE;
			faceflags[1] |= TILE_FLAGS_VISIBLE;
			faceflags[2] |= TILE_FLAGS_VISIBLE;
			faceflags[3] |= TILE_FLAGS_VISIBLE;
		}

		if(tmpWorld[i] == 0) { // make empty spaces walkable.
			faceflags[0] |= TILE_FLAGS_WALKABLE;
			faceflags[1] |= TILE_FLAGS_WALKABLE;
			faceflags[2] |= TILE_FLAGS_WALKABLE;
			faceflags[3] |= TILE_FLAGS_WALKABLE;
		}

		// Set up pairs of vectors for each wall segment to use for 
		// intersection testing later on.

		var x = i % WORLD_STRIDE;
		var y = ~~(i / WORLD_STRIDE);
		var faceVectors = [];
		var offsets = [
			[1,1, 0,1],
			[1,0, 1,1],
			[0,0, 1,0],
			[0,1, 0,0]
		];
		
		for(var f = 0; f < 4; f++) {
			var fx =  (offsets[f][0] + x) * GRID_SIZE;
			var fy =  (offsets[f][1] + y) * GRID_SIZE;
			var fx2 = (offsets[f][2] + x) * GRID_SIZE;
			var fy2 = (offsets[f][3] + y) * GRID_SIZE;

			faceVectors.push( [new Vec2(fx, fy), new Vec2(fx2,fy2)] );
		}

		var isLava = ((tmpWorld[i] == 0) && (randomInt(3) == 0));
		var floor =  isLava ? 64 : 39;
		var floorHeight = 0;
		var ceilingHeight = 64;

		if(isLava) {
			floor = 40;
			visibleface = 0;
			textureIndex = 40;
			//floorHeight = (randomInt(6) - 6) * 8;
			//ceilingHeight = (randomInt(6) - 6) * 8 + 64;
			if(floorHeight < -8){
				floor = 64;
			}
		}

		world.push({
			
			gridx : x,
			gridy : y,
			
			faceVectors: faceVectors,
		
			brightness: 255,

			ceilingHeight: ceilingHeight,
			ceilingTexture: 41,
			ceilingTextureOffset: getPixelIndexForTexture(41),
			
			floorHeight: floorHeight,
			floorTexture: floor,
			floorTextureOffset: getPixelIndexForTexture(floor),

			faces: [
				{ 
					flags: faceflags[0],
					upper: {
						textureIndex: 41,
						textureSourceIndex: getPixelIndexForTexture(41),
						textureScale: [1,1],
						textureOffset: [0,0]
					},
					lower: {
						textureIndex: 41,
						textureSourceIndex: getPixelIndexForTexture(41),
						textureScale: [1, 1],
						textureOffset: [0, 0]
					},
					middle: {
						textureIndex: textureIndex,
						textureSourceIndex: getPixelIndexForTexture(textureIndex),
						textureScale: [1, 1],
						textureOffset: [0,0]
					}
				},
				{
					flags: faceflags[1],
				  upper: {
						textureIndex: 41,
						textureSourceIndex: getPixelIndexForTexture(41),
						textureScale: [1, 1],
						textureOffset: [0,0]
					},
					lower: {
						textureIndex: 41,
						textureSourceIndex: getPixelIndexForTexture(41),
						textureScale: [1, 1],
						textureOffset: [0,0]
					},
					middle: {
						textureIndex: textureIndex,
						textureSourceIndex: getPixelIndexForTexture(textureIndex),
						textureScale: [1, 1],
						textureOffset: [0,0]
					}
				},
				{ 
					flags: faceflags[2],
					upper: {
						textureIndex: 41,
						textureSourceIndex: getPixelIndexForTexture(41),
						textureScale: [1, 1],
						textureOffset: [0,0]
					},
					lower: {
						textureIndex: 41,
						textureSourceIndex: getPixelIndexForTexture(41),
						textureScale: [1, 1],
						textureOffset: [0,0]
					},
					middle: {
						textureIndex: textureIndex,
						textureSourceIndex: getPixelIndexForTexture(textureIndex),
						textureScale: [1, 1],
						textureOffset: [0,0]
					}
				},
				{ 
					flags: faceflags[3],
					upper: {
						textureIndex: 41,
						textureSourceIndex: getPixelIndexForTexture(41),
						textureScale: [1, 1],
						textureOffset: [0,0]
					},
					lower: {
						textureIndex: 41,
						textureSourceIndex: getPixelIndexForTexture(41),
						textureScale: [1, 1],
						textureOffset: [0,0]
					},
					middle: {
						textureIndex: textureIndex,
						textureSourceIndex: getPixelIndexForTexture(textureIndex),
						textureScale: [1,1],
						textureOffset: [0,0]
					}
				}
			]
		});
	}
	console.log("world loaded.");
	return;
	// Add lighting

	for(var x = 0; x < WORLD_STRIDE; x++){
		for(var y = 0; y < WORLD_STRIDE; y++){
		//	world[x+y*WORLD_STRIDE].brightness = ~~(Math.cos(x*0.6)*Math.sin(y*0.6) * 128 + 128);
		}
	}

	// Add sprites

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

	console.log("DONE WITH WORLD.");
}

// Get the grid index/uid for a given world-space coordinate
function getWorld(x, y){
//@ifdef STATS
	stats.counters.getWorld++;
//@endif	

	var tx = ~~(~~x / GRID_SIZE);
	var ty = ~~(~~y / GRID_SIZE);

	if((tx >= WORLD_STRIDE) || (ty >= WORLD_STRIDE) || (tx < 0) || (ty < 0)) {
		return NULL_TILE_ID;
	}

	return  tx + ty * WORLD_STRIDE;
}

function getWorldUnchecked(x, y){
//@ifdef STATS
	stats.counters.getWorld++;
//@endif	

	var tx = ~~(~~x / GRID_SIZE);
	var ty = ~~(~~y / GRID_SIZE);

	if((tx >= WORLD_STRIDE) || (ty >= WORLD_STRIDE) || (tx < 0) || (ty < 0)) {
		return NULL_TILE_ID;
	//	debugger;
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

	var tile;
	ctxd.lineWidth = 2;
	for(var y = 0; y < WORLD_STRIDE; y++) {
		for(var x = 0; x < WORLD_STRIDE; x++) {
			ctxd.lineWidth = 2;

			var tileId = x + y * WORLD_STRIDE;
			var px = x * GRID_SIZE;
			var py = y * GRID_SIZE;
			tile = world[tileId];
			
			var compositFlags = (tile.faces[0].flags | tile.faces[1].flags | tile.faces[2].flags | tile.faces[3].flags);

			if(isVisible(compositFlags)) {
				
				var transparent = isTransparent(compositFlags);
				
				ctxd.fillStyle = transparent ? "#d0d0d0" : "#695628";
				ctxd.fillRect(x * GRID_SIZE, y * GRID_SIZE, GRID_SIZE, GRID_SIZE);

				if(transparent) {
					ctxd.strokeStyle = "#5d2b1b";
					ctxd.lineWidth = 2;
					ctxd.beginPath();

					ctxd.save();
					ctxd.translate(px + GRID_SIZE / 2, py + GRID_SIZE / 2);
							
					/*for(var i = 0; i < walls.length; i++){
						
						if( (world[tileId].visibleface & (1<<i)) != 0 ) {
							ctxd.save();
							ctxd.rotate(HALF_PI * (i-1));
							ctxd.moveTo( GRID_SIZE / 2 - 2, -GRID_SIZE / 2);
							ctxd.lineTo( GRID_SIZE / 2 - 2, GRID_SIZE / 2);
							ctxd.restore();
						}
					}*/

					ctxd.restore();
					ctxd.stroke();
					ctxd.lineWidth = 1;
				}

				for(var f = 0; f < 4; f++) {
					if((tile.faces[f].flags & TILE_FLAGS_WALKABLE) == 0) {
						ctxd.strokeStyle = "#000000";
						ctxd.lineWidth = 4;
						ctxd.beginPath();
						ctxd.moveTo(tile.faceVectors[f][0].x, tile.faceVectors[f][0].y);
						ctxd.lineTo(tile.faceVectors[f][1].x, tile.faceVectors[f][1].y);
						ctxd.stroke();
					}	
				}
			}
		}
	}
	ctxd.lineWidth = 1;
}
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

function setCeilingTexture(tile, newTexture){
	tile.ceilingTexture = newTexture;
	tile.ceilingTextureOffset = getPixelIndexForTexture(newTexture);
}

function debugAnimateBars(now) {

for(var x = 0; x < WORLD_STRIDE; x++){
		for(var y = 0; y < WORLD_STRIDE; y++){
		//	world[x+y*WORLD_STRIDE].brightness = ~~(Math.cos(x*0.6+now*0.002)*Math.sin(y*0.6+now*0.001) * 128 + 128);
		}
	}

	var target = world[barsTile].isOpen ? 40 : 0.00;
	
	if(world[barsTile].isOpen) {
		world[barsTile].floorHeight = Math.min(target, world[barsTile].floorHeight + 1);
		//world[barsTile].texOffsetX = Math.min(target, world[barsTile].texOffsetX + 0.035);
	} else {
		world[barsTile].floorHeight = Math.max(target, world[barsTile].floorHeight - 1);
		//world[barsTile].texOffsetX = Math.max(target, world[barsTile].texOffsetX - 0.035);
	}
	
	if(world[barsTile].texOffsetX > 0.8){
		world[barsTile].walkableface = TILE_FACE_ALL;
	} else {
		world[barsTile].walkableface = TILE_FACE_ALL & ~TILE_FACE_S;
	}
		
}
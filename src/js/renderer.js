
function drawSprite(tileX, tileY, x, y, depth, width, height) {

	var texX = tileX * TILE_SIZE;
	var texY = (tileY * TILE_SIZE);

	var startX = constrain(x, 0, VIEWPORT_WIDTH - 1);
	var endX = constrain(~~(x + width), 0, VIEWPORT_WIDTH - 1);

	var startY = constrain(y, 0, VIEWPORT_HEIGHT - 1);
	var endY = constrain(~~(y + height ), 0, VIEWPORT_HEIGHT - 1);
	
	var px = 0;
	var py = 0;
	
	var xIndex = 0;
	var yIndex = 0;

	var pixelIndex = 0;
	var bufferIndex = 0;
	var textureSample = 0;

	// TODO: this routine sucks. scaling jumps all over the place.

	for(py = startY; py < endY; py++) {

		yIndex = ~~((py - y) / height * TILE_SIZE);
		
		for(px = startX; px < endX; px++) {
			
			xIndex = ~~((px - x) / width * TILE_SIZE);

			bufferIndex = (px) + ((py) * BUFFER_WIDTH);

			textureSample = textureLookup32[((texX + xIndex) + (texY + yIndex) * TEXTURE_SIZE)];
			
			if((depthBuffer[bufferIndex] > depth) && ((textureSample & 0xff000000) != 0)){
				buffer32[bufferIndex] = textureSample;
				depthBuffer[bufferIndex] = depth;
			}
		}

	}
}

function renderSprites() {

	// Margin beyond the FOV to cull sprites so they don't disappear while still 
	// peeking into the viewport.
	var viewMargin = toRadians(40);

	// length of these points is arbitrary for drawing debug lines. They're just
	// used to check if the sprites fall within the FOV.
	var pvx = Math.cos(playerDirection - viewMargin) * 1000 + playerX;
	var pvy = Math.sin(playerDirection - viewMargin) * 1000 + playerY;

	var pvx2 = Math.cos(playerDirection + viewMargin) * 1000 + playerX;
	var pvy2 = Math.sin(playerDirection + viewMargin) * 1000 + playerY;

	var eyeHeight = (GRID_SIZE / 2) - playerHeight;

	var cosa = Math.cos(-playerDirection);
	var sina = Math.sin(-playerDirection);

	for(var i = 0; i < sprites.length; i++) {
		var angleToSprite = angleBetween(playerX, playerY, sprites[i].x, sprites[i].y);

		var dx = Math.cos(angleToSprite) * 24 + sprites[i].x;
		var dy = Math.sin(angleToSprite) * 24 + sprites[i].y;
		
		var sx = sprites[i].x - playerX;
		var sy = sprites[i].y - playerY;

		var sx1 = (cosa * sx) - (sina * sy) + playerX;
		var sy1 = (sina * sx) + (cosa * sy) + playerY;

		// filter out sprites outside the view region.
		if(isLeft(playerX, playerY, pvx, pvy, sprites[i].x, sprites[i].y) && 
			!isLeft(playerX, playerY, pvx2, pvy2, sprites[i].x, sprites[i].y)) {
			
			angleToSprite = angleBetween(playerX, playerY, sx1, sy1);

			var distanceToPlayer = Math.sqrt(distance(playerX, playerY, sprites[i].x, sprites[i].y));
			
			var correctedDist = distanceToPlayer * Math.cos(angleToSprite);
			var viewOffsetY = ~~(eyeHeight / correctedDist * distanceToProjectionPlane);
			
			var x = Math.cos(-HALF_PI + angleToSprite) * distanceToPlayer;
			
			var viewX = x / correctedDist * distanceToProjectionPlane;

			var spriteHeight = GRID_SIZE;

			var projectedHeight = spriteHeight / correctedDist * distanceToProjectionPlane;

			projectedHeight = ~~(projectedHeight / 2 + 0.5) * 2 + 1;

			var screenX = ~~(halfViewWidth + viewX - (projectedHeight / 2));
			var screenY = ~~(halfViewHeight - (projectedHeight / 2) - viewOffsetY);

			drawSprite(
				sprites[i].tileX, 
				sprites[i].tileY, 

				screenX, 
				screenY, 
				
				distanceToPlayer, 
				projectedHeight, 
				projectedHeight);
			
			// @ifdef DEBUG
			// highlight "visible" sprites.
			ctxd.strokeStyle = "blue";
			ctxd.fillStyle = "blue";
			// @endif

		} else 
		{
			// @ifdef DEBUG
			ctxd.strokeStyle = "#808080";
			ctxd.fillStyle = "#808080";
			// @endif
		}

		// @ifdef DEBUG
		ctxd.fillRect(sprites[i].x - 2, sprites[i].y-2, 4, 4);
		ctxd.beginPath();
		ctxd.moveTo(sprites[i].x, sprites[i].y);
		ctxd.lineTo(dx, dy);
		ctxd.stroke();
		// @endif
	}

	// @ifdef DEBUG
	// draw FOV clip lines
	ctxd.strokeStyle = "#d0d0d0";
	ctxd.beginPath();
	ctxd.moveTo(pvx, pvy);
	ctxd.lineTo(playerX, playerY);
	ctxd.lineTo(pvx2, pvy2);
	ctxd.stroke();
	ctxd.fillRect(playerX-1,playerY-1,3,3);
	// @endif
}

function drawSlice(viewX, eyeHeight, slice, angle, correctedDistance, yClip, backPhase) {
	
	var result = {
		wallTop: 0,
		floorStart: VIEWPORT_HEIGHT,
		floorStop: VIEWPORT_HEIGHT
	};

	var tile = world[slice.tileId];

	var texCoordX = slice.sampleX + slice.texOffsetX;
	
	

	var ceiling = GRID_SIZE;
	var floor = slice.floorHeight;
	var backFloor = slice.backFloorHeight;
	
	var textureScaleY = (ceiling - floor) / GRID_SIZE;

	ceiling = halfViewHeight - ((ceiling - eyeHeight) / correctedDistance * distanceToProjectionPlane);
  floor = halfViewHeight - ((floor - eyeHeight) / correctedDistance * distanceToProjectionPlane);
	backFloor = halfViewHeight - ((backFloor - eyeHeight) / correctedDistance * distanceToProjectionPlane);  

	result.floorStop = (backFloor < floor) ? ~~backFloor : ~~floor;
	result.floorStart = (backFloor < floor) ? ~~backFloor : ~~floor;

	var y1 = ~~ceiling;
	var y2 = ~~(floor);

	var sliceDist = Math.sqrt(slice.distance);

	sliceHeight = y2 - y1;
	
	if(!slice.hasFace) {
		y1 = y2;
	}

	var y = Math.max(y1, 0);
	var stop = Math.min(y2, VIEWPORT_HEIGHT);
	
	result.wallTop = y2;
	if(!slice.transparent){
		result.wallTop = y;
	}

	var idx;
	if(((texCoordX >= 0) && (texCoordX < 1)) && ((!slice.isBackface && !slice.transparent) || backPhase) ){
		var textureY;
		
		var textureOffset = tile.tileTextureOffset;
		var textureX = ~~(texCoordX * TILE_SIZE);
		
		stop = Math.min(stop, yClip);
		
		while(y < stop) {

			textureY = 1 - (y2 - y) * textureScaleY / sliceHeight;
			textureY = ~~(Math.max(0,Math.min(textureY, 1)) * TILE_SIZE);
			

			var color = 0xff000000 + ~~(textureY * 8) + (~~(textureX * 8) << 8);
			
			idx = viewX + ~~y * BUFFER_WIDTH;
			
			textureSample = textureLookup32[textureOffset + textureX + textureY * 512];
			
			//if(backPhase || slice.transparent) {
			////	buffer32[idx] = slice.isBackface ? 0x00ff00 : 0xff0000;
			//	depthBuffer[idx] = sliceDist;
			//} else 
			if((textureSample & 0xff000000) != 0) {
				buffer32[idx] = textureSample;
				//buffer32[idx] = getDebugColor(slice.tileId);
				//buffer32[idx] = 0xff + (textureY*8);
				depthBuffer[idx] = sliceDist;
			}
			
			y++;
		}
	}
//	result.floorStart = stop;


	// draw LOWER wall.
	if(!backPhase && !slice.isBackface && (slice.floorHeight > slice.backFloorHeight) ) {
		

	  var lowerHeight = (slice.floorHeight - slice.backFloorHeight);		
	  var textureScale = lowerHeight / GRID_SIZE;
		
		lowerHeight = ~~(lowerHeight / correctedDistance * distanceToProjectionPlane);
		
		y = Math.max(y2-1, 0);
		
		y2 = y2 + lowerHeight;

		//result.wallTop = y;
		result.floorStop = y;

		stop = Math.min(y2, VIEWPORT_HEIGHT);
		
		texCoordX = slice.sampleX + slice.backTexOffsetX;
		textureOffset = slice.backTileTextureOffset;
		textureOffset += ~~(texCoordX * TILE_SIZE);
		
		stop = Math.min(yClip, stop);
		
		if(slice.transparent) {
			result.wallTop = y;
		}

		while((y < stop) ) {

			textureY = (1 - (y2 - y) / lowerHeight) * textureScale;
			textureY = ~~(Math.min(textureY, 1) * TILE_SIZE);
			
			idx = viewX + ~~y * BUFFER_WIDTH;
			textureSample = textureLookup32[textureOffset + textureY * TEXTURE_SIZE];

			//if(depthBuffer[idx] > sliceDist) {
				//if(backPhase){
				//	textureSample = 0xff000000 + (~~(texCoordX * 8) << 16) + (~~(textureY * 8));
			buffer32[idx] = textureSample
			//buffer32[idx] = getDebugLowerColor(slice.tileId);
			depthBuffer[idx] = sliceDist;
				//}
		//	}
			
			y++;
		} 

		result.floorStart = stop;
	}

	return result;
}

function getPixelIndexForTexture(textureIndex) {
	var ty = ~~(textureIndex / 16);
	var tx = textureIndex - (ty * 16);
	console.log(textureIndex, tx, ty);
	return (tx * TILE_SIZE ) + ((ty * TILE_SIZE ) * TEXTURE_SIZE);
	//return ((textureIndex % 16) * TILE_SIZE) + (~~(textureIndex / 16) * TILE_SIZE) * TEXTURE_SIZE;
}

function debugClearBuffers() {
	var x, y, idx;

	for(y = 0; y < VIEWPORT_HEIGHT; y++){
		for(x = 0; x < VIEWPORT_WIDTH; x++){
			idx = x+y*BUFFER_WIDTH;
			buffer32[idx] = 0xff00ff;
			depthBuffer[idx] = 100000000000;
		}
	}
}


function debugDrawDividers() {
	var x, y, idx;
	var middleY = ~~(VIEWPORT_HEIGHT / 2)

	for(y = middleY; y >= 0; y-=16){
		//for(x = 0; x < VIEWPORT_WIDTH; x++){
			idx = ~~(VIEWPORT_WIDTH/2) + y * BUFFER_WIDTH;
			buffer32[idx] = 0xffffffff;
			buffer32[idx+1] = 0xffaaaaaa;

			idx = ~~(VIEWPORT_WIDTH/2) + (middleY + y - 2) * BUFFER_WIDTH;
			buffer32[idx] = 0xffffffff;
			buffer32[idx+1] = 0xffaaaaaa;
		//	depthBuffer[idx] = 100000000;
		//}
	}
	y = ~~(VIEWPORT_HEIGHT / 2);
	for(x = 0; x < VIEWPORT_WIDTH; x+=16){
			idx = x + y * BUFFER_WIDTH;
			buffer32[idx] = 0xffffffff;
			buffer32[idx+BUFFER_WIDTH] = 0xffaaaaaa;
	}
}


function castRayRecursive(originX, originY, startX, startY, angle, result, maxSteps) {

	// @ifdef STATS
	stats.counters.rays++;
	// @endif

	var cosAngle = Math.cos(angle);
	var sinAngle = Math.sin(angle);
	var tanAngle = Math.tan(angle);

	var slice = {};
	
	var testX = startX;
	var testY = startY;

	var found = false;
	var stepY = 0;
	
	var tile;
	var tileId = -1;
	var steps = 0;

	var invertTextureCoordsV = false;
	var invertTextureCoordsH = false;

	var faceBitsFrontVertical = 0;
	var faceBitsBackVertical = 0;

	var faceBitsFrontHorizontal = 0;
	var faceBitsBackHorizontal = 0;

	var stepHX;
	var stepHY;
	
	var stepVX;
	var stepVY;

	var tileTestOffsetY = 0;
	var tileTestOffsetX = 0;
	
	var backfaceTestY = 0;
	var backfaceTestX = 0;

	var backTileVId = null;
	var backTileV;

	var backTileHId = null;
	var backTileH;

// Cast for horizontal walls

	if(sinAngle < 0) {
		testY = ~~(startY / GRID_SIZE) * GRID_SIZE;
		testX = startX + (testY - startY) / tanAngle;
		
		tileTestOffsetY = -0.1;
		backfaceTestY = 1;

		faceBitsFrontHorizontal = TILE_FACE_S;
		faceBitsBackHorizontal = TILE_FACE_N;

		stepHY = -GRID_SIZE;
		stepHX = -(GRID_SIZE / tanAngle);
	} else {
		testY = ~~(startY / GRID_SIZE) * GRID_SIZE + GRID_SIZE;
		testX = startX + (testY - startY) / tanAngle;

		tileTestOffsetY = 0.01;
		backfaceTestY = -1;

		faceBitsFrontHorizontal = TILE_FACE_N;
		faceBitsBackHorizontal = TILE_FACE_S;

		stepHY = GRID_SIZE;
		stepHX = (GRID_SIZE / tanAngle);

		invertTextureCoordsH = true;
	}

	steps = 0;
	
	while(!found && steps < maxSteps) {
		tileId = getWorld(testX, testY + tileTestOffsetY);
		tile = world[tileId];
		
		backTileHId = getWorld(testX, testY + tileTestOffsetY + (GRID_SIZE * backfaceTestY));
		backTileH = world[backTileHId];

		if(!tile && !backTileH) {
			break;
		} else if(isVisible(tile.flags) || isVisible(backTileH.flags) || 
			(tile && backTileH && (backTileH.floorHeight != tile.floorHeight) ) ) {
			found = true;
		} else {
			testX += stepHX;
			testY += stepHY;
		}
		steps++;
	}
	
	// Keep track of the horizontal ray hit.
	var hDist = distance(originX, originY, testX, testY);
	var hx = testX;
	var hy = testY;
	var htile = tileId;

	
// Cast for vertical walls

	
	if(cosAngle < 0) {
		testX = ~~(startX / GRID_SIZE) * GRID_SIZE;
		testY = startY + (testX - startX) * tanAngle;

		tileTestOffsetX = -0.1;
		backfaceTestX = 1;
		
		faceBitsFrontVertical = TILE_FACE_E;
		faceBitsBackVertical  = TILE_FACE_W;
		
		stepVY = -(GRID_SIZE * tanAngle);
		stepVX = -GRID_SIZE;

		invertTextureCoordsV = true;
	} else {
		testX = ~~(startX / GRID_SIZE) * GRID_SIZE + GRID_SIZE;
		testY = startY + (testX - startX) * tanAngle;

		tileTestOffsetX = 0.01;
		backfaceTestX = -1;
		
		faceBitsFrontVertical = TILE_FACE_W;
		faceBitsBackVertical  = TILE_FACE_E;
		
		stepVX = GRID_SIZE;
		stepVY = (GRID_SIZE * tanAngle);
	}

	steps = 0;
	found = false;

	while(!found && steps < maxSteps) {
		tileId = getWorld(testX + tileTestOffsetX, testY);
		tile = world[tileId];

		backTileVId = getWorld(testX + tileTestOffsetX + (GRID_SIZE * backfaceTestX), testY );
		backTileV = world[backTileVId];

		if(!tile && !backTileV) {
			break;
		} else if( isVisible(tile.flags) || isVisible(backTileV.flags) || 
			(tile && backTileV && (backTileV.floorHeight != tile.floorHeight) ) ){
			found = true;
		} else {
			testX += stepVX;
			testY += stepVY;
		}
		
		steps++;
	}

	var vDist = distance(originX, originY, testX, testY);
	var vx = testX;
	var vy = testY;	
	var vtile = tileId;

	// Casting done, decide what to do with results

	var faceBitsFront = 0;
	var faceBitsBack = 0;
	var tile = null;

	// Use the closer of the two results.

	var nextRayStartX = 0;
	var nextRayStartY = 0;

	var backTile;
	var backTileId;
	var floorOffset = 0;
	
	if(vDist >= hDist) {

		vx = hx;
		vy = hy;

		nextRayStartX = vx;
		nextRayStartY = vy + tileTestOffsetY;

		tile = world[htile];

		slice.tileId = htile;
		slice.sampleX = (vx % GRID_SIZE) / GRID_SIZE;
		slice.distance = hDist;
		slice.texOffsetX = tile.texOffsetX;
		slice.hitType = 1;
		slice.isBackface = false;

		faceBitsFront = faceBitsFrontHorizontal;
		faceBitsBack = faceBitsBackHorizontal;

		backTile = backTileH;
		backTileId = backTileHId;
	
		if(invertTextureCoordsH) {
			slice.sampleX = 1.0 - slice.sampleX;
		}
	} else {

		nextRayStartX = vx + tileTestOffsetX;
		nextRayStartY = vy;

		tile = world[vtile];

		slice.sampleX = (vy % GRID_SIZE) / GRID_SIZE;
		slice.tileId = vtile;
		slice.distance = vDist;
		slice.texOffsetX = tile.texOffsetX;
		slice.hitType = 2;
		slice.isBackface = false;

		faceBitsFront = faceBitsFrontVertical;
		faceBitsBack  = faceBitsBackVertical;

		backTile = backTileV;
		backTileId = backTileVId;


		if(invertTextureCoordsV) {
			slice.sampleX = 1.0 - slice.sampleX;
		}
	}	


	var floorOffset = tile.floorHeight; - backTile.floorHeight;

	slice.hasFace = ((tile.visibleface & faceBitsFront) != 0);
	slice.hasLower = (backTile.floorHeight < tile.floorHeight);
	slice.lower = floorOffset;

	slice.floorHeight = tile.floorHeight;
	slice.backFloorHeight = backTile.floorHeight;
	slice.transparent = isTransparent(tile.flags);
	slice.backTileTextureOffset = backTile.tileTextureOffset;
	slice.backTexOffsetX = backTile.texOffsetX;

	if(!tile && !backTile) {
		return;
	}

	var keepTracing = false;

	if( backTile && ((backTile.visibleface & faceBitsBack) != 0)) {
		
			var backSlice = {
				isBackface : true,
				hasLower : false,
				hasFace : ((backTile.visibleface & faceBitsBack) != 0),
				lower: 0,
				upper: 0,
				sampleX: 1.0 - slice.sampleX,
				tileId: backTileId,
				texOffsetX: backTile.texOffsetX,
				backTexOffsetX : backTile.texOffsetX,
				distance: slice.distance - 1,
				transparent: isTransparent(backTile.flags),
				floorHeight:0
			};

			result.push(backSlice);

			keepTracing = true;
	}


	//if((tile && isVisible(tile.flags)) || slice.hasLower){
		//if((tile.visibleface & faceBitsFront) != 0){
	
		result.push(slice);
	
		//}

		
		if(slice.transparent || !slice.hasFace) {
			keepTracing = true;
		}	else{
			keepTracing = false;
		}
//	}
	
	if(keepTracing) {
		castRayRecursive( originX, originY, nextRayStartX, nextRayStartY, angle, result, maxSteps-1);
	}

	// @ifdef DEBUG
	var r = ((maxSteps % 2) < 1) * 80;
	var g = ((maxSteps % 3) < 2) * 80;
	var b = ((maxSteps % 4) < 3) * 80;
	ctxd.strokeStyle = "rgba(" + r + "," + g + ", " + b + ", 0.4)";
	ctxd.beginPath();
	ctxd.moveTo(startX, startY);
	ctxd.lineTo(vx, vy);
	ctxd.stroke();
	// @endif
}

var offsetPlayerX;
var offsetPlayerY;

function castFloor(startY, stopY, screenX, angle, floorHeight, startTile) {
	var cosAngle = Math.cos(angle);
	
	var cosViewAngle = Math.cos(angle + playerDirection);
	var sinViewAngle = Math.sin(angle + playerDirection);

	var paralellDistanceToFloor;
	var distanceToFloor;
	var pixelIndex;

	var gx = 0;
	var gy = 0;

	var texX = 0;
	var texY = 0;

	var tileIndex;
	var tile;
	var sampleIndex = 0;

	
	for(var y = startY; y < stopY; y++) {
		
		paralellDistanceToFloor = ((playerHeight - floorHeight) / ((y+1) - halfViewHeight)) * distanceToProjectionPlane;
		distanceToFloor = paralellDistanceToFloor / cosAngle;

		gx = (distanceToFloor * cosViewAngle + offsetPlayerX);
		gy = (distanceToFloor * sinViewAngle + offsetPlayerY);
		
		var tileId = getWorld(gx, gy);
		tile = world[getWorld(gx, gy)];
		
		if(tile) {

			texX = ~~(gx % GRID_SIZE / 2); 
			texY = ~~(gy % GRID_SIZE / 2);
			
			pixelIndex = ((y) * BUFFER_WIDTH) + screenX;

		//	if(depthBuffer[pixelIndex] > ~~distanceToFloor) {
				sampleIndex = tile.floorTextureOffset + texX + (texY * TEXTURE_SIZE);
				//buffer32[pixelIndex] = 0xff0000 + getDebugColor(tileId);//textureLookup32[sampleIndex];
				buffer32[pixelIndex] = textureLookup32[sampleIndex];
				//buffer32[pixelIndex] = getDebugFloorColor(tileId);
				depthBuffer[pixelIndex] = ~~distanceToFloor;
		//	}
		}
	}
}


function castCeiling(stopY, screenX, angle) {
	var cosAngle = Math.cos(angle);

	var cosViewAngle = Math.cos(angle + playerDirection);
	var sinViewAngle = Math.sin(angle + playerDirection);

	var paralellDistanceToCeiling;
	var distanceToCeiling;
	var eyeHeight = (GRID_SIZE - playerHeight);
	var pixelIndex;

	var gx = 0;
	var gy = 0;

	var texX = 0;
	var texY = 0;

	var tileIndex;
	var tile;
	var color;
	var sampleIndex = 0;
	
	for(var y = 0; y < stopY; y++) {
		paralellDistanceToCeiling = (eyeHeight / (halfViewHeight - y)) * distanceToProjectionPlane;
		distanceToCeiling = (paralellDistanceToCeiling / cosAngle);

		gx = ~~(distanceToCeiling * cosViewAngle + offsetPlayerX);
		gy = ~~(distanceToCeiling * sinViewAngle + offsetPlayerY);

		texX = ~~(gx % GRID_SIZE / 2); 
		texY = ~~(gy % GRID_SIZE / 2);

		tile = world[getWorld(gx, gy)];
		if(tile){
			sampleIndex = tile.ceilingTextureOffset + texX + (texY * TEXTURE_SIZE);

			color = textureLookup32[sampleIndex];

			pixelIndex = (y * BUFFER_WIDTH) + screenX;
			buffer32[pixelIndex] = color;
			depthBuffer[pixelIndex] = ~~distanceToCeiling;
		}
	}
}

// render the walls/floors
function renderWorld() {

	// @ifdef STATS
	stats.playerAngle = ~~toDegrees(playerDirection);
	// @endif

// @ifdef DEBUG
	debugClearBuffers(); // Don't leave this enabled.. it can hide z-order bugs.
	debugDrawWorldGrid();
// @endif

	var step = fov / VIEWPORT_WIDTH;
	var halfStep = step/2;

	var start = playerDirection - (fov / 2) + halfStep;
	//var stop = playerDirection + (fov / 2) + halfStep;

	var slice = {};
	var i;
	var correctedDistance;
	
	var result = [];

	var eyeHeight =  playerHeight;
	var viewOffsetY;
	var slice;
	var r;

	offsetPlayerX = playerX;
	offsetPlayerY = playerY;

	offsetPlayerX -= Math.cos(playerDirection) * 30;
	offsetPlayerY -= Math.sin(playerDirection) * 30;

	// @ifdef STATS
	//stats.playerInBlock = playerInBlock;
	// @endif
	
	var cosSliceAngle;
	for(i = 0; i < VIEWPORT_WIDTH; i++) {
		
		result.length = 0;

		var rayAngle = (start + (i * step));

		cosSliceAngle = Math.cos(-halfFov + i * step + halfStep);
		castRayRecursive(offsetPlayerX, offsetPlayerY, offsetPlayerX, offsetPlayerY, rayAngle, result, 32);
	
		var floorStop = VIEWPORT_HEIGHT;
		var ceilingStart = VIEWPORT_HEIGHT;
		var sliceBoundaries = {
			floorStop : VIEWPORT_HEIGHT,
			wallTop : VIEWPORT_HEIGHT
		};
		// draw non-transparent walls front to back
		for(r = 0; r < result.length; r++) {
			slice = result[r];
			
			if(!slice.isBackface){
				correctedDistance = Math.sqrt(slice.distance) * cosSliceAngle;
				
				 sliceBoundaries = drawSlice(i, eyeHeight, slice, rayAngle - playerDirection, correctedDistance, floorStop, false);				 
				 slice.yClip = floorStop;	
				

				if(sliceBoundaries.floorStart > halfViewHeight) {
					castFloor(sliceBoundaries.floorStart, floorStop, i, rayAngle - playerDirection, slice.backFloorHeight, slice.tileId);
				}
				
				
			/*
				var pixelIndex = ((sliceBoundaries.floorStart) * BUFFER_WIDTH) + i;
				buffer32[pixelIndex] = 0x0000ff;
				depthBuffer[pixelIndex] = 1;

				var pixelIndex = ((sliceBoundaries.floorStop) * BUFFER_WIDTH) + i;
				buffer32[pixelIndex] = 0x00ff00;
				depthBuffer[pixelIndex] = 1;

				var pixelIndex = ((sliceBoundaries.wallTop) * BUFFER_WIDTH) + i;
				buffer32[pixelIndex] = 0xff0000;
				depthBuffer[pixelIndex] = 1;
			*/	
			}
		
			ceilingStart = Math.min( sliceBoundaries.wallTop, ceilingStart);
	
			floorStop = Math.min( Math.min(VIEWPORT_HEIGHT, sliceBoundaries.floorStop), floorStop);
			slice.yClip = floorStop;
		}

		castCeiling(ceilingStart, i, rayAngle-playerDirection); 

		// draw transparent faces back-to-front
		for(r = result.length-1; r >= 0; r--) {
			slice = result[r];
			if(slice.isBackface || slice.transparent) {
				correctedDistance = Math.sqrt(slice.distance) * cosSliceAngle;
				drawSlice(i, eyeHeight, slice, rayAngle - playerDirection, correctedDistance, slice.yClip, true);
			}
		}
	}

// @ifdef DEBUG
//	debugDrawDividers();
// @endif

}
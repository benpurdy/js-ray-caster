
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

			textureSample = textureLookup32[((texX + xIndex) + (texY + yIndex) * 128)];
			
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
		ctxd.fillRect(sprites[i].x / 2 - 2, sprites[i].y / 2-2, 4, 4);
		ctxd.beginPath();
		ctxd.moveTo(sprites[i].x / 2, sprites[i].y / 2);
		ctxd.lineTo(dx / 2, dy / 2);
		ctxd.stroke();
		// @endif
	}

	// @ifdef DEBUG
	// draw FOV clip lines
	ctxd.strokeStyle = "#d0d0d0";
	ctxd.beginPath();
	ctxd.moveTo(pvx / 2, pvy / 2);
	ctxd.lineTo(playerX / 2, playerY / 2);
	ctxd.lineTo(pvx2 / 2, pvy2 / 2);
	ctxd.stroke();
	ctxd.fillRect(playerX/2-1,playerY/2-1,3,3);
	// @endif
}


function drawSlice(tileId, slice, x, y1, y2, dist, sliceData) {

	// @ifdef STATS
	stats.counters.slices++;
	// @endif

	var tile = world[tileId];
	var tileX = tile.textureIndex % 8;
	var tileY = ~~(tile.textureIndex / 8);

	var idx = 0;
	var sliceTexOffsetX = slice;// + tile.texOffsetX) * TILE_SIZE;
	var texX = Math.round(Math.min((tileX * TILE_SIZE) + sliceTexOffsetX, (tileX * TILE_SIZE) + TILE_SIZE));
//	texX += ~~(tile.texOffset * TILE_SIZE);
	
	// bail if the texture offset means we're outside of a tile.
	if((sliceTexOffsetX < 0) || (sliceTexOffsetX >= TILE_SIZE)){
		return;
	}

	var texY = tileY * TILE_SIZE + ~~(tile.texOffsetY * TILE_SIZE);
	var pixelOffset = texX + (texY * 128);

	var sampleY = 0;
	var height = y2 - y1;
	
	var samplesPerPixel = TILE_SIZE / height;
	
	var pixel = Math.max(0, -y1);
	var halfHeight = height / 2;

	var textureSample = 0;

	while(pixel < halfHeight) {
	
		idx = (x + (pixel + y1) * BUFFER_WIDTH);
		sampleY = ~~(samplesPerPixel * pixel);
		textureSample = textureLookup32[pixelOffset + (sampleY * 128)];
		
		if(textureSample && 0xff000000 == 0xff000000) {
			buffer32[idx] = textureSample;
			depthBuffer[idx] = dist;
		}

		idx = (x + (y2 - pixel) * BUFFER_WIDTH);
		sampleY = (TILE_SIZE - 1) - sampleY;
		textureSample = textureLookup32[pixelOffset + (sampleY * 128)];

		if(textureSample && 0xff000000 == 0xff000000) {
			buffer32[idx] = textureSample;
			depthBuffer[idx] = dist;
		} 

		pixel++;
	}
}


function castRayRecursive(originX, originY, startX, startY, angle, result, maxSteps, inBlock, isBackFace, isStartTile) {
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
	
	var tileId = -1;
	var steps = 0;

	var invertTextureCoordsV = false;
	var invertTextureCoordsH = false;

	var faceBitsVertical = 0;
	var faceBitsHorizontal = 0;

	var insideBlock = (inBlock != null);

	var stepHX;
	var stepHY;
	
	var stepVX;
	var stepVY;

	var tileTestOffsetY = 0;


// Cast for horizontal walls

	if(sinAngle < 0) {
		testY = ~~(startY / GRID_SIZE) * GRID_SIZE;
		testX = startX - (startY - testY) / tanAngle;
		
		tileTestOffsetY = isBackFace ? 1 : -1;

		stepHY = -GRID_SIZE;
		stepHX = -GRID_SIZE / Math.tan(angle);
		
		invertTextureCoordsH = isBackFace;
		faceBitsHorizontal = isBackFace ? TILE_FACE_N : TILE_FACE_S;
	} else {
		testY = ~~(startY / GRID_SIZE) * GRID_SIZE + GRID_SIZE;
		testX = startX - (startY - testY) / tanAngle;
		
		tileTestOffsetY = isBackFace ? -1 : 1;

		stepHY = GRID_SIZE;
		stepHX = GRID_SIZE / tanAngle;
		
		invertTextureCoordsH = !isBackFace;
		faceBitsHorizontal = isBackFace ? TILE_FACE_S : TILE_FACE_N;
	}

	steps = 0;
	var tile;
	while(!found && steps < maxSteps) {
		tileId = getWorld(testX, testY + tileTestOffsetY);
		tile = world[tileId];
		if(!tile) {
			break;
		} else if( ( !isBackFace && isVisible(tile.flags) && (tileId != inBlock) ) ||
		    ( isBackFace && (tileId == inBlock) ) ) {
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
	
	var tileTestOffsetX = 0;
	if(cosAngle < 0) {
		testX = ~~(startX / GRID_SIZE) * GRID_SIZE;
		testY = startY - (startX - testX) * tanAngle;
		
		tileTestOffsetX = isBackFace ? 1 : -1;
	
		stepVY = -GRID_SIZE * tanAngle;
		stepVX = -GRID_SIZE;
		invertTextureCoordsV = !isBackFace;
		faceBitsVertical = isBackFace ? TILE_FACE_W : TILE_FACE_E;
	} else {
		testX = ~~(startX / GRID_SIZE) * GRID_SIZE + GRID_SIZE;
		testY = startY - (startX - testX) * tanAngle;

		tileTestOffsetX = isBackFace ? -1 : 1;
		
		stepVX = GRID_SIZE;
		stepVY = GRID_SIZE * tanAngle;
		invertTextureCoordsV = isBackFace;
		faceBitsVertical = isBackFace ? TILE_FACE_E : TILE_FACE_W;
	}

	steps = 0;
	found = false;

	while(!found && steps < maxSteps) {
		tileId = getWorld(testX + tileTestOffsetX, testY);
		tile = world[tileId];
		if(!tile) {
			break;
		} else if( ( !isBackFace && isVisible(tile.flags) && (tileId != inBlock) ) ||
		    ( isBackFace && (tileId == inBlock) ) ) {
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

	var faceBits = 0;
	var tile = null;

	// Use the closer of the two results.
	if(vDist > hDist) {
		vx = hx;
		vy = hy;


		slice.tileId = htile;
		slice.sampleX = (vx - ~~(vx / GRID_SIZE) * GRID_SIZE) / GRID_SIZE;
		slice.distance = Math.sqrt(hDist);
		tile = world[slice.tileId];

		faceBits = faceBitsHorizontal;

		if(invertTextureCoordsH) {
			slice.sampleX = 1.0 - slice.sampleX;
		}		
	} else {

		slice.sampleX = (vy - ~~(vy / GRID_SIZE) * GRID_SIZE) / GRID_SIZE;
		slice.tileId = vtile;
		slice.distance = Math.sqrt(vDist);
		faceBits = faceBitsVertical;
		tile = world[slice.tileId];

		if(invertTextureCoordsV) {
			slice.sampleX = 1.0 - slice.sampleX;
		}
	}	

	slice.transparent = isTransparent(tile.flags);

	// Add slices to result array
  if(isBackFace) {
  	if((faceBits & tile.backface) != 0) {
  		result.push(slice);
  	}
	} else{
		if(!slice.transparent || ((faceBits & tile.frontface) != 0) ) {
			result.push(slice);
		}
	}
		
	if(slice.transparent && !isBackFace) {
		// cast the back face of this transparent block
		castRayRecursive( originX, originY, vx, vy, angle, result, maxSteps - 1, slice.tileId, true);
		// cast on to find the next wall.
		castRayRecursive( originX, originY, vx, vy, angle, result, maxSteps - 1, slice.tileId, false);
	}

	// @ifdef DEBUG
	ctxd.strokeStyle = isBackFace ? "rgba(0,255,0,0.1)" : "rgba(0,0,0,0.1)";
	ctxd.beginPath();
	ctxd.moveTo(startX / 2, startY / 2);
	ctxd.lineTo(vx / 2, vy / 2);
	ctxd.stroke();
	// @endif
}


function castFloor(startY, screenX, angle) {
	var cosAngle = Math.cos(angle);

	var paralellDistanceToFloor;
	var distanceToFloor;
	var pixelIndex;

	for(var y = startY; y < VIEWPORT_HEIGHT; y++) {
		
		paralellDistanceToFloor = (playerHeight / (y - halfViewHeight)) * distanceToProjectionPlane;
		distanceToFloor = ~~(paralellDistanceToFloor / cosAngle);

		pixelIndex = (y * BUFFER_WIDTH) + screenX;
		buffer32[pixelIndex] = floorColor;
		depthBuffer[pixelIndex] = distanceToFloor;
	}
}


function castCeiling(stopY, screenX, angle) {
	var cosAngle = Math.cos(angle);

	var paralellDistanceToCeiling;
	var distanceToCeiling;
	var eyeHeight = (GRID_SIZE - playerHeight);
	var pixelIndex;

	for(var y = 0; y < stopY; y++) {
		paralellDistanceToCeiling = (eyeHeight / (halfViewHeight - y)) * distanceToProjectionPlane;
		distanceToCeiling = ~~(paralellDistanceToCeiling / cosAngle);

		pixelIndex = (y * BUFFER_WIDTH) + screenX;
		buffer32[pixelIndex] = ceilingColor;
		depthBuffer[pixelIndex] = distanceToCeiling;
	}
}



// render the walls/floors
function renderWorld() {

	var step = fov / VIEWPORT_WIDTH;

	var start = playerDirection - (fov / 2);
	var stop = playerDirection + (fov / 2);
	var slice = {};
	var i;
	var correctedDistance;
	var sliceHeight;
	var halfSlice;
	var y1, y2;

	var floorStartY = 0;
	var ceilingStopY = 0;
	var result = [];

	var eyeHeight = (GRID_SIZE / 2) - playerHeight;
	var viewOffsetY;
	var slice;
	var r;

	var offsetPlayerX = playerX;
	var offsetPlayerY = playerY;
	offsetPlayerX -= Math.cos(playerDirection) * 30;
	offsetPlayerY -= Math.sin(playerDirection) * 30;


	var currentTileId = getWorld(offsetPlayerX, offsetPlayerY);
	var playerTile = world[currentTileId];
	var playerInBlock = isTransparent(playerTile.flags);
	if(!playerInBlock){
		currentTileId = null;
	}
	
	// @ifdef STATS
	stats.playerInBlock = playerInBlock;
	// @endif

	for(i = 0; i < halfViewWidth; i++) {

		// Left side to middle

		result.length = 0;

		if(playerInBlock){
			castRayRecursive(offsetPlayerX, offsetPlayerY, offsetPlayerX, offsetPlayerY, start + (i * step), result, 32, currentTileId, playerInBlock);
		}

		castRayRecursive(offsetPlayerX, offsetPlayerY, offsetPlayerX, offsetPlayerY, start + (i * step), result, 32);

		for(r = result.length-1; r >= 0; r--) {
			
			slice = result[r];

			correctedDistance = slice.distance * Math.cos(-halfFov + i * step);
			sliceHeight = GRID_SIZE / correctedDistance * distanceToProjectionPlane;
			halfSlice = Math.round(sliceHeight / 2);

			viewOffsetY = ~~(eyeHeight / correctedDistance * distanceToProjectionPlane);

			y1 = halfViewHeight - halfSlice - viewOffsetY;
			y2 = halfViewHeight + halfSlice - 1 - viewOffsetY;

			drawSlice(
				slice.tileId, 
				~~((slice.sampleX + world[slice.tileId].texOffsetX) * TILE_SIZE), 
				i, 
				y1,
				y2,
				slice.distance,
				slice);

			if(r == result.length-1){
				floorStartY = y2 + 1;	
				ceilingStopY = y1;
				castCeiling(ceilingStopY, i, -halfFov + i * step);
				castFloor(floorStartY, i, -halfFov + i * step);
			}
		}

		// Right side to middle

		result.length = 0;

		if(playerInBlock){
			castRayRecursive(offsetPlayerX, offsetPlayerY, offsetPlayerX, offsetPlayerY, stop - (i * step), result, 32, currentTileId, playerInBlock);
		}

		castRayRecursive(offsetPlayerX, offsetPlayerY, offsetPlayerX, offsetPlayerY, stop - (i * step), result, 32 );

		for(r = result.length-1; r >= 0; r--) {
		
			slice = result[r];
		
			correctedDistance = slice.distance * Math.cos(-halfFov + i * step);
			sliceHeight = GRID_SIZE / correctedDistance * distanceToProjectionPlane;
			halfSlice = Math.round(sliceHeight / 2);

			viewOffsetY = ~~(eyeHeight / correctedDistance * distanceToProjectionPlane);

			y1 = halfViewHeight - halfSlice - viewOffsetY;
			y2 = halfViewHeight + halfSlice - 1 - viewOffsetY;

			drawSlice(
				slice.tileId, 
				~~((slice.sampleX + world[slice.tileId].texOffsetX) * TILE_SIZE), 
				VIEWPORT_WIDTH - i - 1, 
				y1,
				y2,
				slice.distance,
				slice);

			if(r == result.length - 1) {
				floorStartY = y2 + 1;	
				ceilingStopY = y1;
				castCeiling(ceilingStopY, VIEWPORT_WIDTH - i - 1,  -halfFov + i * step );
				castFloor(floorStartY, VIEWPORT_WIDTH - i - 1,  -halfFov + i * step);
			}
		}
	}
}

function drawSprite(tileX, tileY, x, y, depth, width, height) {

	var texX = tileX * TILE_SIZE;
	var texY = (tileY * TILE_SIZE);

	var startX = constrain(x, 0, VIEWPORT_WIDTH - 1);
	var endX = constrain(Math.ceil(x + width), 0, VIEWPORT_WIDTH - 1);

	var startY = constrain(y, 0, VIEWPORT_HEIGHT - 1);
	var endY = constrain(Math.ceil(y + height), 0, VIEWPORT_HEIGHT - 1);
	
	var px = 0;
	var py = 0;
	
	var xIndex = 0;
	var yIndex = 0;

	var pixelIndex = 0;
	var bufferIndex = 0;

	// TODO: this routine sucks. scaling jumps all over the place.

	for(py = startY; py < endY; py++) {

		yIndex = Math.floor((py - y) / height * TILE_SIZE);
		
		for(px = startX; px < endX; px++) {
			
			xIndex = Math.floor((px - x) / width * TILE_SIZE);

			bufferIndex = (px) + (( py) * VIEWPORT_WIDTH);

			pixelIndex = ((texX + xIndex) + (texY + yIndex) * 128);
			
			if((depthBuffer[bufferIndex] > depth) && ((textureLookup32[pixelIndex] & 0xff000000) != 0)){
				buffer32[bufferIndex] = textureLookup32[pixelIndex];
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

	for(var i = 0; i < sprites.length; i++) {
		var angleToSprite = angleBetween(playerX, playerY, sprites[i].x, sprites[i].y);

		var dx = Math.cos(angleToSprite) * 24 + sprites[i].x;
		var dy = Math.sin(angleToSprite) * 24 + sprites[i].y;

		var cosa = Math.cos(-playerDirection);
		var sina = Math.sin(-playerDirection);

		var sx = sprites[i].x - playerX;
		var sy = sprites[i].y - playerY;

		var sx1 = (cosa * sx) - (sina * sy) + playerX;
		var sy1 = (sina * sx) + (cosa * sy) + playerY;

		// filter out sprites outside the view region.
		if(isLeft(playerX, playerY, pvx, pvy, sprites[i].x, sprites[i].y) && 
			!isLeft(playerX, playerY, pvx2, pvy2, sprites[i].x, sprites[i].y)) {
			
			angleToSprite = angleBetween(playerX, playerY, sx1, sy1);

			var distanceToPlayer = distance(playerX, playerY, sprites[i].x, sprites[i].y);
			
			var correctedDist = distanceToPlayer * Math.cos(angleToSprite);
			var viewOffsetY = Math.floor(eyeHeight / correctedDist * distanceToProjectionPlane);
			
			var x = Math.cos(toRadians(-90) + angleToSprite) * distanceToPlayer;
			
			var viewX = x / correctedDist * distanceToProjectionPlane;

			var spriteHeight = GRID_SIZE;

			var projectedHeight = 2 * (spriteHeight / 2) / correctedDist * distanceToProjectionPlane;

			drawSprite(
				sprites[i].tileX, 
				sprites[i].tileY, 
				Math.floor(halfViewWidth + viewX - (projectedHeight / 2)), 
				Math.floor(halfViewHeight - (projectedHeight / 2) - viewOffsetY), 
				correctedDist, 
				projectedHeight, 
				projectedHeight);
			
				if(debug) {
					// highlight "visible" sprites.
					ctxd.strokeStyle = "blue";
					ctxd.fillStyle = "blue";
				}

		} else 
		{
			if(debug) {
				ctxd.strokeStyle = "#b0b0b0";
				ctxd.fillStyle = "#b0b0b0";
			}
		}

		if(debug) {
			ctxd.fillRect(sprites[i].x / 2 - 2, sprites[i].y / 2-2, 4, 4);
			ctxd.beginPath();
			ctxd.moveTo(sprites[i].x / 2, sprites[i].y / 2);
			ctxd.lineTo(dx / 2, dy / 2);
			ctxd.stroke();
		}
	}

	if(debug){
		// draw FOV clip lines
		ctxd.strokeStyle = "#d0d0d0";
		ctxd.beginPath();
		ctxd.moveTo(pvx / 2, pvy / 2);
		ctxd.lineTo(playerX / 2, playerY / 2);
		ctxd.lineTo(pvx2 / 2, pvy2 / 2);
		ctxd.stroke();
		ctxd.fillRect(playerX/2-1,playerY/2-1,3,3);
	}
}


function drawSlice(tileId, slice, x, y1, y2, dist, sliceData) {

	var textureIndex = world[tileId];

	var tileX = textureIndex % 8;
	var tileY = Math.floor(textureIndex / 8);

	var idx = 0;
	var texX =Math.round(Math.min((tileX * TILE_SIZE) + slice, (tileX * TILE_SIZE) + TILE_SIZE));
	var texY = tileY * TILE_SIZE;
	var pixelOffset = texX + (texY * 128);

	var sampleY = 0;
	var height = y2 - y1;
	
	var samplesPerPixel = TILE_SIZE / height;
	
	var pixel = Math.max(0, -y1);
	var halfHeight = height / 2;

	var textureSample = 0;
	while(pixel < halfHeight) {
	
		idx = (x + (pixel + y1) * VIEWPORT_WIDTH);
		sampleY = Math.floor(samplesPerPixel * pixel);
		textureSample = textureLookup32[pixelOffset + (sampleY << 7)];
		
		if(textureSample && 0xff000000 == 0xff000000) {
			buffer32[idx] = textureSample;
			depthBuffer[idx] = dist;
		}

		idx = (x + (y2 - pixel) * VIEWPORT_WIDTH);
		sampleY = (TILE_SIZE - 1) - sampleY;
		textureSample = textureLookup32[pixelOffset + (sampleY << 7)];

		if(textureSample && 0xff000000 == 0xff000000) {
			buffer32[idx] = textureSample;
			depthBuffer[idx] = dist;
		} 

		pixel++;
	}
}


function castRayRecursive(originX, originY, startX, startY, angle, result, maxSteps, inBlock, isBackFace) {

	var sx = Math.cos(angle);
	var sy = Math.sin(angle);

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

	// TODO: Constants, put these somewhere else.
	var N = 1;
	var S = 2;
	var E = 4;
	var W = 8;

	// TODO: Store in world data so these properties can be set per-tile.
	var faceBitsFront = N | E | 0 | 0;
	var faceBitsBack  = 0 | 0 | S | W;

	var insideBlock = (inBlock != null);

	var stepHX;
	var stepHY;
	
	var stepVX;
	var stepVY;

	var tileTestOffsetY = 0;


// Cast for horizontal walls

	if(sy < 0) {
		testY = Math.floor(startY / GRID_SIZE) * GRID_SIZE;
		testX = startX - (startY - testY) / Math.tan(angle);
		
		tileTestOffsetY = isBackFace ? 32 : -32;

		stepHY = -GRID_SIZE;
		stepHX = -GRID_SIZE / Math.tan(angle);
		
		invertTextureCoordsH = false;
		faceBitsHorizontal = N;
	} else {
		testY = Math.floor(startY / GRID_SIZE) * GRID_SIZE + GRID_SIZE;
		testX = startX - (startY - testY) / Math.tan(angle);
		
		tileTestOffsetY = isBackFace ? -32 : 32;

		stepHY = GRID_SIZE;
		stepHX = GRID_SIZE / Math.tan(angle);
		
		invertTextureCoordsH = true;
		faceBitsHorizontal = S;
	}

	steps = 0;
	while(!found && steps < maxSteps) {
			tileId = getWorld(testX, testY + tileTestOffsetY);
		
		if( ( !isBackFace && isSolid(tileId) && (tileId != inBlock) ) ||
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
	if(sx < 0) {
		testX = Math.floor(startX / GRID_SIZE) * GRID_SIZE;
		testY = startY - (startX - testX) * Math.tan(angle);
		
		tileTestOffsetX = isBackFace ? 32 : -32;
	
		stepVY = -GRID_SIZE * Math.tan(angle);
		stepVX = -GRID_SIZE;
		invertTextureCoordsV = true;
		faceBitsVertical = W;
	} else {
		testX = Math.floor(startX / GRID_SIZE) * GRID_SIZE + GRID_SIZE;
		testY = startY - (startX - testX) * Math.tan(angle);

		tileTestOffsetX = isBackFace ? -32 : 32;
		
		stepVX = GRID_SIZE;
		stepVY = GRID_SIZE * Math.tan(angle);
		invertTextureCoordsV = false;
		faceBitsVertical = E;
	}

	steps = 0;
	found = false;

	while(!found && steps < maxSteps) {
		tileId = getWorld(testX + tileTestOffsetX, testY);
		if( ( !isBackFace && isSolid(tileId) && (tileId != inBlock) ) ||
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

	// Use the closer of the two results.
	if(vDist > hDist) {
		vx = hx;
		vy = hy;

		slice.tileId = htile;
		slice.sampleX = (vx - Math.floor(vx / GRID_SIZE) * GRID_SIZE) / GRID_SIZE;
		
		faceBits = faceBitsHorizontal;

		if(invertTextureCoordsH) {
			slice.sampleX = 1.0 - slice.sampleX;
		}		
	} else {

		slice.sampleX = (vy - Math.floor(vy / GRID_SIZE) * GRID_SIZE) / GRID_SIZE;
		slice.tileId = vtile;

		faceBits = faceBitsVertical;
		
		if(invertTextureCoordsV) {
			slice.sampleX = 1.0 - slice.sampleX;
		}
	}	

	slice.distance    = distance(originX, originY, vx, vy);
	slice.wallType    = (vDist > hDist);
	slice.backFace    = isBackFace;
	slice.transparent = isTransparent(slice.tile);

	// Add slices to result array
  if(isBackFace){
  	if((faceBits & faceBitsBack) != 0) {
  		result.push(slice);
  	}
	} else{
		if(!isTransparent(slice.tileId) || ((faceBits & faceBitsFront) != 0) ) {
			result.push(slice);
		}
	}
		
	if(isTransparent(slice.tileId) && !isBackFace) {
		// cast the back face of this transparent block
		castRayRecursive( originX, originY, vx, vy, angle, result, maxSteps - 1, slice.tileId, true);

		// cast on to find the next wall.
		castRayRecursive( originX, originY, vx, vy, angle, result, maxSteps - 1, slice.tileId, false);
	}

	if(debug) {
		ctxd.strokeStyle = isBackFace ? "rgba(0,0,255,0.75)" : "rgba(0,0,0,0.2)";
		ctxd.beginPath();
		ctxd.moveTo(startX / 2, startY / 2);
		ctxd.lineTo(vx / 2, vy / 2);
		ctxd.stroke();
	}
}


function castFloor(startY, screenX, angle) {
	var cosAngle = Math.cos(angle);

	var paralellDistanceToFloor;
	var distanceToFloor;
	var pixelIndex;

	for(var y = startY; y < VIEWPORT_HEIGHT; y++) {
		
		paralellDistanceToFloor = (playerHeight / (y - halfViewHeight)) * distanceToProjectionPlane;
		distanceToFloor = Math.floor(paralellDistanceToFloor / cosAngle);

		pixelIndex = (y * VIEWPORT_WIDTH) + screenX;
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
		distanceToCeiling = Math.floor(paralellDistanceToCeiling / cosAngle)+1;

		pixelIndex = (y * VIEWPORT_WIDTH) + screenX;
		buffer32[pixelIndex] = ceilingColor;
		depthBuffer[pixelIndex] = distanceToCeiling;
	}
}


function applyLighting() {
	
	var falloffEnd = 1000;
	var falloffStart = 50;
	var falloffRange = falloffEnd - falloffStart;
	var falloffPower = 0.75;

	var brightnessSteps = 16;

	var fade = 0;

	var r = 0;
	var g = 0;
	var b = 0;
	var i;

	var pixel = 0;
	var depth = 0;

	var len = buffer32.length;

	// TODO: optimize. This whole routine seems clunky.
	for(i = 0; i < len; i++) {

		depth = depthBuffer[i];

		if(depth > falloffStart) {
			pixel = buffer32[i];

			fade = 1 - Math.pow((Math.min(depth, falloffEnd) - falloffStart) / falloffRange, falloffPower);
			fade = Math.floor(fade * brightnessSteps) / brightnessSteps;

			// unpack
			r = pixel & 0x000000ff;
			g = (pixel & 0x0000ff00) >> 8;
			b = (pixel & 0x00ff0000) >> 16;
			
			// darken
			r *= fade;
			g *= fade;
			b *= fade;

			// pack
			buffer32[i] = 0xff000000 | r | (g << 8) | (b << 16)
		}
	}
}


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

	for(i = 0; i < halfViewWidth; i++) {

		// Left side to middle

		result.length = 0;

		castRayRecursive(playerX, playerY, playerX, playerY, start + (i * step), result, 64 );

		for(r = result.length-1; r >= 0; r--) {
			
			slice = result[r];

			correctedDistance = slice.distance * Math.cos(-halfFov + i * step);
			sliceHeight = GRID_SIZE / correctedDistance * distanceToProjectionPlane;
			halfSlice = Math.round(sliceHeight / 2);

			viewOffsetY = Math.floor(eyeHeight / correctedDistance * distanceToProjectionPlane);

			y1 = halfViewHeight - halfSlice - viewOffsetY;
			y2 = halfViewHeight + halfSlice - 1 - viewOffsetY;

			drawSlice(
				slice.tileId, 
				Math.floor(slice.sampleX * TILE_SIZE), 
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
		castRayRecursive(playerX, playerY, playerX, playerY, stop - (i * step), result, 32 );

		for(r = result.length-1; r >= 0; r--) {
		
			slice = result[r];
		
			correctedDistance = slice.distance * Math.cos(-halfFov + i * step);
			sliceHeight = GRID_SIZE / correctedDistance * distanceToProjectionPlane;
			halfSlice = Math.round(sliceHeight / 2);

			viewOffsetY = Math.floor(eyeHeight / correctedDistance * distanceToProjectionPlane);

			y1 = halfViewHeight - halfSlice - viewOffsetY;
			y2 = halfViewHeight + halfSlice - 1 - viewOffsetY;

			drawSlice(
				slice.tileId, 
				Math.floor(slice.sampleX * TILE_SIZE), 
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

// TODO: I think webGL might be a better way to render the output buffer instead
// of using putImageData. It might even make sense to load the color and depth
// buffers into a texture and do the lighting in a shader as well.
function showBuffer(){
  var displayLen = displayBuffer.length;
	for(i = 0; i < displayLen; i++) {
		displayBuffer[i] = buffer8[i];
	}
	ctx.putImageData(displayImgData, 0, 0);
}
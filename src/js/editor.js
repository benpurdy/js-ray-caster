
var cursorX = 0;
var cursorY = 0;
var selectedTile = -1;
var cursorTile = -1;

var selectedTileData = {};
function setCursorTile(screenX, screenY) {

	/*var rayResult = castRayRecursive();
	var worldCoords = screenToGrid(screenX, screenY);

	var tileId = getWorld(worldCoords[0], worldCoords[1]);

	for(var i = 0; i < rayResult.length; i++) {

	}
	cursorTile = tileId;*/
}

function setSelectedTile(screenX, screenY) {
	var worldCoords = screenToGrid(screenX, screenY);
	
	var tileId = getWorld(worldCoords[0], worldCoords[1]);
	selectedTile = tileId;

	//updateSelectedTile();
}

function updateSelectedTile() {
}


function drawInWorld(x, y, height, color) {
	
	var cosa = Math.cos(-playerDirection);
	var sina = Math.sin(-playerDirection);

	var sx = x - cameraX;
	var sy = y - cameraY;

	var sx1 = (cosa * sx) - (sina * sy) + cameraX;
	var sy1 = (sina * sx) + (cosa * sy) + cameraY;
	
	var angleToVertex = angleBetween(cameraX, cameraY, sx1, sy1);
	var distanceToPlayer = Math.sqrt(distance(cameraX, cameraY, x, y));
	
	var maxViewAngle =  fov / 2;
	var minViewAngle = -fov / 2;

	if((angleToVertex < maxViewAngle) && (angleToVertex > minViewAngle)) {
		
		var correctedDist = distanceToPlayer * Math.cos(angleToVertex);
		var viewOffsetY = ((playerHeight - height) / correctedDist * distanceToProjectionPlane);
		
		var screenY = (VIEWPORT_HEIGHT/2) + viewOffsetY;

		var x = Math.cos(-HALF_PI + angleToVertex) * distanceToPlayer;

		var screenX = (VIEWPORT_WIDTH / 2) + ~~(x / correctedDist * distanceToProjectionPlane);

		var idx = ~~screenX + (~~screenY * BUFFER_WIDTH);
		
		if((idx > 0)){
			buffer32[idx] = color;
			depthBuffer[idx] = 0;
		}
	}
}

function renderEditor() {
	
	var tmpVec = new Vec2();

	if(selectedTile != -1) {
  	var tile = world[selectedTile];

  	var walls = tile.faceVectors;

		for(var i =0; i < walls.length; i++){
 
  		for(var t = 0; t < 16; t++){
  			tmpVec.copy(walls[i][0]);
  			tmpVec.lerp(walls[i][1], t/16);

  			drawInWorld(tmpVec.x, tmpVec.y, tile.floorHeight, 0xffffffff); 	
  			drawInWorld(tmpVec.x, tmpVec.y, tile.ceilingHeight, 0xffffffff); 	
  		}


  	}
  	
		

  	/*var offsetPlayerX = playerX;
		var offsetPlayerY = playerY;
		
		offsetPlayerX -= Math.cos(playerDirection) * 30;
		offsetPlayerY -= Math.sin(playerDirection) * 30;
		
		var cosa = Math.cos(-playerDirection);
		var sina = Math.sin(-playerDirection);

		var walls = world[selectedTile].faceVectors;
  	var minViewAngle = -fov / 2;
  	var maxViewAngle = fov / 2;
  	
  	for(var gy = 0; gy < 1; gy++) {
  		for(var gx = 0; gx < 1; gx++){

				var vertx = gx * GRID_SIZE;
				var verty = gy * GRID_SIZE;


				var sx = vertx - offsetPlayerX;
				var sy = verty - offsetPlayerY;

				var sx1 = (cosa * sx) - (sina * sy) + offsetPlayerX;
				var sy1 = (sina * sx) + (cosa * sy) + offsetPlayerY;
				
				var angleToVertex = angleBetween(offsetPlayerX, offsetPlayerY, sx1, sy1);

				var distanceToPlayer = Math.sqrt(distance(offsetPlayerX, offsetPlayerY, vertx, verty));
				
				if((angleToVertex < maxViewAngle) && (angleToVertex > minViewAngle)) {

					var correctedDist = distanceToPlayer * Math.cos(angleToVertex);
					var viewOffsetY = ((playerHeight+offset) / correctedDist * distanceToProjectionPlane);
					
					var screenY = (VIEWPORT_HEIGHT/2) + viewOffsetY;

					var x = Math.cos(-HALF_PI + angleToVertex) * distanceToPlayer;
		
					var screenX = (VIEWPORT_WIDTH / 2) + ~~(x / correctedDist * distanceToProjectionPlane);

					var idx = ~~screenX + (~~screenY * BUFFER_WIDTH);
					
					if((idx > 0)){
						buffer32[idx] = 0xffffff;
						depthBuffer[idx] = 0;
					}
				}
			}
			
  	}*/
  }
  
}

function screenToGrid(pixelX, pixelY) {

	var offsetPlayerX = playerX;
	var offsetPlayerY = playerY;
	offsetPlayerX -= Math.cos(playerDirection) * 30;
	offsetPlayerY -= Math.sin(playerDirection) * 30;

	var viewAngle = ((fov / VIEWPORT_WIDTH) * pixelX);
	viewAngle -= (fov / 2);

	var worldAngle =  (playerDirection - (fov/2)) + ((fov / VIEWPORT_WIDTH) * pixelX);

	var playerTile = world[getWorld(playerX, playerY)];
	var playerHeightAboveFloor = playerHeight - playerTile.floorHeight;

	var parelellDistanceToWorld = (distanceToProjectionPlane / Math.abs(pixelY - VIEWPORT_HEIGHT/2)) * playerHeightAboveFloor;

	var projectedPointX = offsetPlayerX + Math.cos(worldAngle) * parelellDistanceToWorld / Math.cos(viewAngle);
	var projectedPointY = offsetPlayerY + Math.sin(worldAngle) * parelellDistanceToWorld / Math.cos(viewAngle);


	return [projectedPointX, projectedPointY];
}

function getTileFace(pixelX, pixelY){
	var offsetPlayerX = playerX;
	var offsetPlayerY = playerY;
	offsetPlayerX -= Math.cos(playerDirection) * 30;
	offsetPlayerY -= Math.sin(playerDirection) * 30;

	var rayAngle = (playerDirection - (fov/2)) + ((fov / VIEWPORT_WIDTH) * pixelX);
	var result = [];
	castRayRecursive(offsetPlayerX, offsetPlayerY, offsetPlayerX, offsetPlayerY, rayAngle, result, 32);

	debugger;
}


function initializeEditor(){
	canvas.addEventListener("mousemove", function(evt) {
		var pixelX = VIEWPORT_WIDTH * (evt.offsetX / canvas.width);
		var pixelY = VIEWPORT_HEIGHT * (evt.offsetY / canvas.height);
		setCursorTile(Math.round(pixelX), Math.round(pixelY));
	});

	canvas.addEventListener("mousedown", function(evt) {
		var pixelX = VIEWPORT_WIDTH * (evt.offsetX / canvas.width);
		var pixelY = VIEWPORT_HEIGHT * (evt.offsetY / canvas.height);
		setSelectedTile(Math.round(pixelX), Math.round(pixelY));
	});

	renderCallback = renderEditor;
}

initializeEditor();
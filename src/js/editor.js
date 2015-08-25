
var cursorX = 0;
var cursorY = 0;
var selectedTile = -1;
var cursorTile = -1;

var selectedTileData = {};
var texturePicker;
var textureEditTarget;

var ceilingHeightInput;
var floorHeightInput;

var selection = [];

var activeFaces = [true, true, true, true];
var wallColors = [0xff0000ff, 0xff00ff00, 0xffff0000, 0xffff00ff];

function setSelectedTile(screenX, screenY) {
}


function updateSelectedTile() {
	updateEditorUI();
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

	for(var s = 0; s < selection.length; s++) {
		 	var tile = world[selection[s]];

	  	var walls = tile.faceVectors;
	  	//var wallColors = [0xff0000ff, 0xff00ff00, 0xffff0000, 0xffff00ff]
			for(var i = 0; i < walls.length; i++){
				
	  		for(var t = 0; t < 16; t++){
	  			
	  			var color = (activeFaces[i] || (t%4)==0) ? wallColors[i] : 0xff606060;

	  			tmpVec.copy(walls[i][0]);
	  			tmpVec.lerp(walls[i][1], (t / 16));

	  			drawInWorld(tmpVec.x, tmpVec.y, tile.floorHeight, color); 	
	  			drawInWorld(tmpVec.x, tmpVec.y, tile.ceilingHeight, color); 	
	  		}
	  	}
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

function applyToSelection(func) {
	for(var i = 0; i < selection.length; i++) {
		func(selection[i], world[selection[i]]);
	}
}

function setWallFlag(faceIndex, flag, state) {
	for(var i = 0; i < selection.length; i++) {
		if(state) {
			world[selection[i]].faces[faceIndex].flags |= flag;
		} else {
			world[selection[i]].faces[faceIndex].flags &= ~flag;
		}
	}
}

function initFaceCheckboxSet(property, bitFlag) {
	
	document.getElementById(property).addEventListener("click", function(evt) {
		for(var i = 0; i < 4; i++) {
			setWallFlag( i, bitFlag, evt.target.checked );
		}
		updateEditorUI();
	});

	for(var i = 0; i < 4; i++){
		document.getElementById(property + i).addEventListener("click", function(evt) {
			var faceIndex = evt.target.dataset.index;
			setWallFlag( faceIndex, bitFlag, evt.target.checked);
		});
		updateEditorUI();
	}
}

function setTileFaceTexture(tile, faceSection, faceIndex, newTextureIndex) {
	tile.faces[faceIndex][faceSection].textureIndex 		  = newTextureIndex;
	tile.faces[faceIndex][faceSection].textureSourceIndex = getPixelIndexForTexture(newTextureIndex);
}

function setTileFlatTexture(tile, flatType, newTextureIndex) {
	tile[flatType + "Texture"] 			 = newTextureIndex;
	tile[flatType + "TextureOffset"] = getPixelIndexForTexture(newTextureIndex);
}

function initializeEditor(){
	canvas.addEventListener("mousemove", function(evt) {
		var pixelX = VIEWPORT_WIDTH * (evt.offsetX / canvas.width);
		var pixelY = VIEWPORT_HEIGHT * (evt.offsetY / canvas.height);
//		setCursorTile(Math.round(pixelX), Math.round(pixelY));
	});

	canvas.addEventListener("mousedown", function(evt) {
		var pixelX = VIEWPORT_WIDTH * (evt.offsetX / canvas.width);
		var pixelY = VIEWPORT_HEIGHT * (evt.offsetY / canvas.height);

		var worldCoords = screenToGrid(pixelX, pixelY);
	
		var tileId = getWorld(worldCoords[0], worldCoords[1]);
		if(tileId == -1){
			return;
		}
		console.log(evt);

		if(evt.metaKey) {
			if(selection.indexOf(tileId) == -1) {
				selection.push(tileId);
			} else {
				selection.splice(selection.indexOf(tileId), 1);
			}
		} else {
			selection = [tileId];
		}
		updateSelectedTile();
	});

	for(var i = 0; i < 4; i++){
		document.getElementById("wallFace" + i).addEventListener("click", function(e){
			console.log(e.target.dataset.index);
			var index = parseInt(e.target.dataset.index, 10);
			activeFaces[index] = e.target.checked;
		});
	}
  
	initFaceCheckboxSet("visible",     TILE_FLAGS_VISIBLE);
	initFaceCheckboxSet("transparent", TILE_FLAGS_TRANSPARENT);
	initFaceCheckboxSet("walkable",    TILE_FLAGS_WALKABLE);

	renderCallback = renderEditor;

	texturePicker = document.getElementById("texturePicker");
	
	selectedTexture = document.getElementById("selectedTexture");
	selectedTexture.style.width = TILE_SIZE + "px";
	selectedTexture.style.height = TILE_SIZE + "px";

	texturePicker.addEventListener("mouseout", function(e) {
		texturePicker.style.display = "none";
	});

	texturePicker.addEventListener("mousemove", function(e) {
		var tx = ~~(e.offsetX / TILE_SIZE);
		var ty = ~~(e.offsetY / TILE_SIZE);

		selectedTexture.style.left = tx * TILE_SIZE + "px";
		selectedTexture.style.top  = ty * TILE_SIZE + "px";
		
		var idx = tx + ty * (TEXTURE_SIZE / TILE_SIZE);
		
		for(var i = 0; i < selection.length; i++) {
			
			// check to see where this texture selection originated
			if(textureEditTarget.type == "flat") {
				setTileFlatTexture( world[selection[i]], textureEditTarget.target, idx);
			} else if(textureEditTarget.type == "wall") {
				if(textureEditTarget.index == -1){
					for(var f = 0; f < 4; f++){
						setTileFaceTexture( world[selection[i]], textureEditTarget.target, f, idx);
					}
				}else{
					setTileFaceTexture( world[selection[i]], textureEditTarget.target, textureEditTarget.index, idx);
				}
			}
		}
		updateEditorUI();
	});
	
	var canvases = document.getElementById("editor").getElementsByTagName("canvas");
	
	for(var i = 0; i < canvases.length; i++) {
		canvases[i].addEventListener("mousedown", function(e) {
			texturePicker.appendChild(imgTexture);
			
			texturePicker.style.position = "absolute";
			texturePicker.style.top = e.target.offsetTop + "px";
			texturePicker.style.left = e.target.offsetLeft + "px";
			texturePicker.style.marginLeft = -TEXTURE_SIZE +"px";
			texturePicker.style.display = "block";

			textureEditTarget = {
				"type" : e.target.dataset.type,
				"target" : e.target.dataset.target,
				"index" : e.target.dataset.index
			};
		});

		canvases[i].addEventListener("mouseup", function(e) {
			texturePicker.style.display = "none";
		});
	}

	document.getElementById("ceilingHeight").addEventListener("change", function(e){
		applyToSelection(function(tileId, tile){
			tile.ceilingHeight = parseInt(e.target.value, 10);
		});
	});

	document.getElementById("floorHeight").addEventListener("change", function(e){
		applyToSelection(function(tileId, tile){
			tile.floorHeight = parseInt(e.target.value, 10);
		});
	});
	document.getElementById("brightness").addEventListener("change", function(e){
		applyToSelection(function(tileId, tile){
			tile.brightness = parseInt(e.target.value, 10);
		});
	});

	setCanvasWidth(600);
}


var textureSelectors = {
	"floor" : {
		canvas: null,
		context: null,
		set: function(tile, faceIndex, newTexIndex){
			tile.floorTexture = newTexIndex;
			tile.floorTextureOffset = getPixelIndexForTexture(newTexIndex);
		}
	},
	"ceiling" : {
		canvas: null,
		context: null,
		set: function(tile, faceIndex, newTexIndex){
			tile.ceilingTexture = newTexIndex;
			tile.ceilingTextureOffset = getPixelIndexForTexture(newTexIndex);
		}
	},

};

function updateEditorUI() {
	
	if(selection.length == 0){
		return;
	}

	var tile = world[selection[0]];

	var selectionState = {
		"floorHeight"   : tile.floorHeight,
		"ceilingHeight" : tile.ceilingHeight,
		
		"visible"     : true,
		"walkable"		: true,
		"transparent" : true,
		
		"textures" : {
			"floor"   : tile.floorTexture,
			"ceiling" : tile.ceilingTexture,
			"upper"   : tile.faces[0].upper.textureIndex,
			"middle"  : tile.faces[0].middle.textureIndex,
			"lower"   : tile.faces[0].lower.textureIndex
		}
	};

	var unknownTextureId = textures.length-1;

	// check to see if the values match all of the selected tiles.
	for(var i = 0; i < selection.length; i++) {
		
		tile = world[selection[i]];

		if(tile.floorTexture != selectionState.textures.floor){
			selectionState.textures.floor = unknownTextureId;
		}
		if(tile.ceilingTexture != selectionState.textures.ceiling){
			selectionState.textures.ceiling = unknownTextureId;
		}

		for(var f = 0; f < 4; f++) {

			if((tile.faces[f].flags & TILE_FLAGS_VISIBLE) == 0) {
				selectionState.visible = false;
			}

			if((tile.faces[f].flags & TILE_FLAGS_WALKABLE) == 0) {
				selectionState.walkable = false;
			}

			if((tile.faces[f].flags & TILE_FLAGS_TRANSPARENT) == 0) {
				selectionState.transparent = false;
			}

			if(tile.faces[f].upper.textureIndex != selectionState.textures.upper){
				selectionState.textures.upper = unknownTextureId;
			}
			if(tile.faces[f].middle.textureIndex != selectionState.textures.middle){
				selectionState.textures.middle = unknownTextureId;
			}
			if(tile.faces[f].lower.textureIndex != selectionState.textures.lower){
				selectionState.textures.lower = unknownTextureId;
			}
		}
	}

	document.getElementById("visible").checked     = selectionState.visible;
	document.getElementById("walkable").checked    = selectionState.walkable;
	document.getElementById("transparent").checked = selectionState.transparent;


	var canvases = document.getElementById("editor").getElementsByTagName("canvas");
	for(var i = 0; i < canvases.length; i++) {
		
		var ctx = canvases[i].getContext("2d");
		var type   = canvases[i].dataset.type;
		var target = canvases[i].dataset.target;
		var tex;

		if(type == "flat") {
			console.log(target);
			tex = textures[selectionState.textures[target]];
		} else if (type == "wall") {
			var faceIndex = parseInt(canvases[i].dataset.index, 10);
			if(faceIndex == -1){
				tex = textures[ selectionState.textures[target] ];
			} else {
				var faces = world[selection[0]].faces;
				var texIndex = faces[faceIndex][target].textureIndex;
				tex = textures[texIndex];
			}
		}
		
		ctx.clearRect(0,0,32,32);
		ctx.drawImage(imgTexture, tex.sourceX, tex.sourceY, TILE_SIZE, TILE_SIZE, 0, 0, 32, 32);
	}

	document.getElementById("ceilingHeight").value = selectionState.ceilingHeight;
	document.getElementById("floorHeight").value = selectionState.floorHeight;

	tile = world[selection[0]];
	for(var i = 0; i < 4; i++) {
		document.getElementById("visible" + i).checked     = (tile.faces[i].flags & TILE_FLAGS_VISIBLE) != 0;
		document.getElementById("walkable" + i).checked    = (tile.faces[i].flags & TILE_FLAGS_WALKABLE) != 0
		document.getElementById("transparent" + i).checked = (tile.faces[i].flags & TILE_FLAGS_TRANSPARENT) != 0
	}
}

initializeEditor();
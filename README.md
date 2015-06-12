# js-ray-caster

A little ray casting engine in javascript. All rasterizing is handled in javascript, webGL is used to get the pixels on the screen and apply depth-based lighting because the canvas putImageData() method is slooooowwww..

**Keyboard controls:**

	W - forward
	A - straif left
	S - backward
	D - straif right
	
	Q - turn left
	E - turn right

**Phone controls:**

The screen is split evenly into a 3x2 grid.

	top-center: forward
	bottom-center: backward
	
	top-left: straif left
	bottom-left: turn left
	
	top-right: straif right
	bottom-right: turn right



**Thanks to:**

Sprites/textures are from the base texture for [mini ludem dare #59](http://ludumdare.com/compo/minild-59/).

Thanks to [this great resource](http://www.permadi.com/tutorial/raycast/) for reference about old-school raycasting techniques.
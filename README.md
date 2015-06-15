# js-ray-caster

A little ray casting engine in javascript. All rasterizing is handled in javascript, webGL is used to get the pixels on the screen and apply depth-based lighting because the canvas putImageData() method is slooooowwww..

[Try the live demo](https://benpurdy.github.io/js-ray-caster/public/), maybe it will work on your computer/phone (no promises, this is very much a work in progres).

#### Keyboard controls

	W - forward
	A - straif left
	S - backward
	D - straif right
	
	Q - turn left
	E - turn right

#### Phone controls

The screen is split evenly into a 3x2 grid.

	top-center: forward
	bottom-center: backward
	
	top-left: straif left
	bottom-left: turn left
	
	top-right: straif right
	bottom-right: turn right

#### Setup and Build Instructions

This project uses Grunt, to install Grunt and the various Grunt related grunt stuff, you can use npm like so:

	npm install

##### Build

There are two build types `dev` and `dist` for development mode or distribution mode. Development mode leaves all the source files un-minified and un-concatenated. Distribution mode strips out all debug messages, minifies the files, and combines them into a single .js file.


	grunt dev
	
or..
	
	grunt dist


##### Running the game

The build process will spit out a folder called `public` which will contain the static assets needed to run the game. Simply host the `public` folder via any [standard HTTP server](https://github.com/indexzero/http-server) and then open that server URL in a browser.


#### Credits/Thanks To:

Sprites/textures are from the base texture for [mini ludem dare #59](http://ludumdare.com/compo/minild-59/).

Thanks to [this great resource](http://www.permadi.com/tutorial/raycast/) for reference about old-school raycasting techniques.

[WebGL Fundamentals](http://webglfundamentals.org/) and [TWGL](http://twgljs.org/) for a great set of documentation and explaination.

[Handmade Hero](https://handmadehero.org/) for inspiring me to avoid existing libraries.
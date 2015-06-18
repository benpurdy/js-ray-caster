# js-ray-caster

A little ray casting engine in javascript. All rasterizing is handled in javascript, webGL is used to get the pixels on the screen and apply depth-based lighting because the canvas putImageData() method is slooooowwww..

[**Try the live demo**](https://benpurdy.github.io/js-ray-caster/public/), maybe it will work on your computer/phone (no promises, this is very much a work in progres).

The live demo is updated every so often but might be a little behind the current source code.

### Keyboard controls

	W - forward
	A - straif left
	S - backward
	D - straif right
	
	Q - turn left
	E - turn right

### Phone controls

The screen is split evenly into a 3x2 grid.

	top-center: forward
	bottom-center: backward
	
	top-left: straif left
	bottom-left: turn left
	
	top-right: straif right
	bottom-right: turn right

## I Want to Mess With Code

### Setup

This project uses Grunt, to install Grunt and the various Grunt related grunt stuff, you can use npm to get all ready to build like so:

	npm install



### Building and Running the Game

Grunt can run a web server for you, it will also watch all the files in the `src` folder and will automatically re-build the game when any file is changed. To run the provided server use the `start` command:

	grunt start

Then open [http://localhost:8080](http://localhost:8080) in your browser.

The build process will spit out a folder called `public` which will contain the static assets needed to run the game. If you'd rather use a different web server instead of the one set up with Grunt, simply host the `public` folder somewhere and then open that server URL in a browser.


### Building without Running the Server

There are two build types `dev` and `dist` for development mode or distribution mode. Development mode leaves all the source files un-minified and un-concatenated. Distribution mode strips out all debug messages, minifies the files, and combines them into a single .js file. The default Grunt task is a `dev` build, so you can build like this:

	grunt
	
Or to do a minified 'release' build:
	
	grunt dist
	
**IMPORTANT NOTE:** To keep things tidy, the build process will **delete** both the `public` and `build` folders each time it's run. Don't put important stuff in either of those locations!


### Credits/Thanks To:

Sprites/textures are from the base texture for [mini ludem dare #59](http://ludumdare.com/compo/minild-59/).

Thanks to [this great resource](http://www.permadi.com/tutorial/raycast/) for reference about old-school raycasting techniques.

[WebGL Fundamentals](http://webglfundamentals.org/) and [TWGL](http://twgljs.org/) for a great set of documentation and explaination.

[Handmade Hero](https://handmadehero.org/) for inspiring me to avoid existing libraries.
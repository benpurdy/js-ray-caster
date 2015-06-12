var gl;
var bufferTexture;
var depthTexture;
var render;
var shader = {};
var screenGeometry = {
	uvs: null,
	verts: null
};

function initGL(canvas, viewportWidth, viewportHeight) {
	gl = canvas.getContext("experimental-webgl");
	
	var f = gl.getExtension("OES_texture_float");
	if (!f) {
		// TODO: What to do here? Show a sad error message?
		return;
	}

	initShader();

	bufferTexture = gl.createTexture();
	depthTexture = gl.createTexture();

	initViewport(viewportWidth, viewportHeight);
}

function drawGL() {
	gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);
	gl.drawArrays(gl.TRIANGLES, 0, 6);
}

function loadColorTexture(tex) {
	gl.bindTexture(gl.TEXTURE_2D, bufferTexture);
	gl.pixelStorei(gl.UNPACK_ALIGNMENT, 1);
	gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, BUFFER_WIDTH, BUFFER_HEIGHT, 0, gl.RGBA, gl.UNSIGNED_BYTE, tex );
	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);

	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);

}

function loadDepthTexture(textureData) {
	gl.bindTexture(gl.TEXTURE_2D, depthTexture);
	gl.pixelStorei(gl.UNPACK_ALIGNMENT, 1);
	gl.texImage2D(gl.TEXTURE_2D, 0, gl.LUMINANCE, BUFFER_WIDTH, BUFFER_HEIGHT, 0, gl.LUMINANCE, gl.FLOAT, textureData );
	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);

	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
  
}

function initViewport(width, height) {

	var txY = VIEWPORT_HEIGHT / BUFFER_HEIGHT;
	var txX = VIEWPORT_WIDTH / BUFFER_WIDTH;

	var verts = new Float32Array([
    -1.0, -1.0,
     1.0, -1.0,
    -1.0,  1.0,
    -1.0,  1.0,
     1.0, -1.0,
     1.0,  1.0]);

	var uvs = new Float32Array([
		0.0, txY,
    txX, txY,
    0.0, 0,
    0.0,  0,
    txX,  txY,
    txX,  0]);

	var positionLocation = gl.getAttribLocation(shader.program, "a_position");
	screenGeometry.verts = gl.createBuffer();

	gl.bindBuffer(gl.ARRAY_BUFFER, screenGeometry.verts);
	gl.bufferData( gl.ARRAY_BUFFER, verts, gl.STATIC_DRAW);
	
	gl.enableVertexAttribArray(positionLocation);
	gl.vertexAttribPointer(positionLocation, 2, gl.FLOAT, false, 0, 0);


	var uvLocation = gl.getAttribLocation(shader.program, "a_uv");
	screenGeometry.uvs = gl.createBuffer();
	
	gl.bindBuffer(gl.ARRAY_BUFFER, screenGeometry.uvs);
	gl.bufferData( gl.ARRAY_BUFFER, uvs, gl.STATIC_DRAW);
	
	gl.enableVertexAttribArray(uvLocation);
	gl.vertexAttribPointer(uvLocation, 2, gl.FLOAT, false, 0, 0);


  var u_locationColor = gl.getUniformLocation(shader.program, "u_image");
  var u_locationDepth = gl.getUniformLocation(shader.program, "u_depth");
 	
 	gl.uniform1i(u_locationColor, 0);
  gl.uniform1i(u_locationDepth, 1);

  	gl.activeTexture(gl.TEXTURE0);
	gl.bindTexture(gl.TEXTURE_2D, bufferTexture);
	
	gl.activeTexture(gl.TEXTURE1);
	gl.bindTexture(gl.TEXTURE_2D, depthTexture);
}

function initShader() {
	shader.vertex = compileShader(gl, "vertex-shader", gl.VERTEX_SHADER );
	shader.fragment = compileShader(gl, "fragment-shader", gl.FRAGMENT_SHADER );
	shader.program = createProgram(gl, shader.vertex, shader.fragment);
	gl.useProgram(shader.program);
}

function createProgram(gl, vertexShader, fragmentShader) {
  var program = gl.createProgram();

  gl.attachShader(program, vertexShader);
  gl.attachShader(program, fragmentShader);

  gl.linkProgram(program);
 
  var success = gl.getProgramParameter(program, gl.LINK_STATUS);
  if (!success) {
      throw ("program filed to link:" + gl.getProgramInfoLog (program));
  }
 
  return program;
};

function compileShader(gl, elementId, shaderType) {

  var source = document.getElementById(elementId).textContent;
  var result = gl.createShader(shaderType);
  
  gl.shaderSource(result, source);
  gl.compileShader(result);

  var success = gl.getShaderParameter(result, gl.COMPILE_STATUS);
  if (!success) {
		throw "could not compile shader:" + gl.getShaderInfoLog(result);
  }
 
  return result;
}
precision mediump float;

attribute vec2 a_position;
attribute vec2 a_uv;

varying vec2 UV;
 
void main() {
	UV = a_uv;
  gl_Position = vec4(a_position, 0, 1);
}
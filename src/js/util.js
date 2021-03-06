var debugColors = [0xF00000, 0x0000ff, 0xffff00, 0x00ffff, 0x0000ff, 0xffffff, 0xff8800, 0xffff88, 0x88ff00];
var debugFloorColors = [0xff0000, 0x000000];//, 0x0000ff, 0xffff00, 0x00ffff, 0x0000ff, 0xffffff, 0xff8800, 0xffff88, 0x88ff00];
var debugLowerColors = [0x00f000, 0x00d000];//, 0x0000ff, 0xffff00, 0x00ffff, 0x0000ff, 0xffffff, 0xff8800, 0xffff88, 0x88ff00];

function getDebugColor(idx) {
	return debugColors[idx % debugColors.length];
}
function getDebugLowerColor(idx) {
	return debugLowerColors[idx % debugLowerColors.length];
}
function getDebugFloorColor(idx) {
	return debugFloorColors[idx % debugFloorColors.length];
}

var PI_OVER_180 = Math.PI / 180;
var _180_OVER_PI = 180 / Math.PI;
var HALF_PI = Math.PI / 2;

function randomInt(max) {
	return ~~(Math.random() * max);
}

function toRadians(angle){
	return angle * PI_OVER_180;
}

function toDegrees(angle){
	return angle * _180_OVER_PI;
}

function constrain(val, min, max){
	return Math.min( Math.max(val, min), max);
}

// Returns true if point(px, py) is to the left of line (x1, y1)-(x2, y2)
function isLeft(x1, y1, x2, y2, px, py) {
	return ((x2 - x1) * (py - y1) - (y2 - y1) * (px - x1)) > 0;
}

function angleBetween(x1,y1, x2,y2){
	return Math.atan2(y2 - y1, x2 - x1);
}

function distance(x1,y1, x2,y2){
	return (x2-x1)*(x2-x1) + (y2-y1)*(y2-y1);
}


// Watch out, it's a 2D vector.

function Vec2(x, y){
	this.x = x;
	this.y = y;
}

Vec2.cross = function(v1, v2){
	return (v1.x * v2.y) - (v1.y * v2.x);
}

Vec2.subtract = function(v1, v2){
	return new Vec2(v1.x - v2.x, v1.y - v2.y);
}

Vec2.add = function(v1, v2){
	return new Vec2(v1.x + v2.x, v1.y + v2.y);
}

Vec2.multiplyScalar = function(v1, scalar) {
	var result = new Vec2();
	result.copy(v1);
	result.multiplyScalar(scalar);
	return result;
}

// instance methods

Vec2.prototype.copy = function(other) {
	this.x = other.x;
	this.y = other.y;
}

Vec2.prototype.add = function(other) {
	this.x += other.x;
	this.y += other.y;
}

Vec2.prototype.subtract = function(other) {
	this.x -= other.x;
	this.y -= other.y;
}

Vec2.prototype.lengthSq = function() { 
	return distance(0, 0, this.x, this.y);
}

Vec2.prototype.multiplyScalar = function(scalar) {
	this.x *= scalar;
	this.y *= scalar;
}

Vec2.prototype.lerp = function(other, amount){
	this.x = this.x + (other.x - this.x) * amount;
	this.y = this.y + (other.y - this.y) * amount;
}


function intersectVectors(p1, p2, s1, s2) {
	
	var s = Vec2.subtract(p2, p1);
	var r = Vec2.subtract(s1, s2); 

	return Vec2.cross(Vec2.subtract(s1, p1), s) / Vec2.cross(r, s);
}
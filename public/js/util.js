var PI_OVER_180 = Math.PI / 180;
var _180_OVER_PI = 180 / Math.PI;

function randomInt(max) {
	return Math.floor(Math.random() * max);
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
function isLeft(x1,y1, x2,y2, px,py){
	return ((x2 - x1) * (py - y1) - (y2 - y1) * (px - x1)) > 0;
}

function angleBetween(x1,y1, x2,y2){
	return Math.atan2(y2 - y1, x2 - x1);
}

function distance(x1,y1, x2,y2){
	return Math.sqrt( (x2-x1)*(x2-x1) + (y2-y1)*(y2-y1) );
}
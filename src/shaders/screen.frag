precision highp float;

varying vec2 UV;

uniform sampler2D u_image;
uniform sampler2D u_depth;

const float falloffStart = 128.0;
const float falloffEnd = 768.0;
const float falloffPower = 0.8;
const float colorSteps = 8.0;
const float fogMax = 1.0;
const vec3 fogColor = vec3(0.0, 0.0, 0.0);

void main() {
	
	float depthSample = texture2D(u_depth, UV).r;

	vec3 color = texture2D(u_image, UV).rgb;

	depthSample = smoothstep(falloffStart, falloffEnd, depthSample);
	depthSample = pow(depthSample, falloffPower);
	
	depthSample = ceil(depthSample * colorSteps) / colorSteps;
	
	depthSample = mix(0.0, fogMax, depthSample);
	color = mix(color, fogColor, depthSample);
	
	gl_FragColor = vec4(color, 1.0);
}
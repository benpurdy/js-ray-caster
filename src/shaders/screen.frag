precision highp float;

varying vec2 UV;

uniform sampler2D u_image;
uniform sampler2D u_depth;

const float falloffStart = 128.0;
const float falloffEnd = 1268.0;
const float falloffPower = 0.8;
const float colorSteps = 16.0;
const float fogMax = 1.0;
const vec3 fogColor = vec3(0.0, 0.0, 0.0);

void main() {
	
	float depthSample = texture2D(u_depth, UV).r;
	vec4 textureSample = texture2D(u_image, UV);

	float brightness = ceil(textureSample.a * colorSteps) / colorSteps;

	vec3 color = textureSample.rgb * brightness;

	float fallEnd = clamp(falloffEnd * textureSample.a, falloffStart, falloffEnd);

	depthSample = smoothstep(falloffStart, falloffEnd, depthSample);
	depthSample = pow(depthSample, falloffPower);
	
	depthSample = ceil(depthSample * colorSteps) / colorSteps;
	
	depthSample = mix(0.0, fogMax, depthSample);

	color = mix(color, fogColor, depthSample);
	//color = vec3(textureSample.a, textureSample.g, textureSample.b);
	gl_FragColor = vec4(color, 1.0);
}
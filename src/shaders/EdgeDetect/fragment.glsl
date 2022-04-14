#define PI 3.1415926538

uniform sampler2D u_incomingTexture;
uniform sampler2D u_depthTexture;
uniform sampler2D u_normalsTexture;
uniform sampler2D u_colorTexture;
uniform vec2 u_sampleSize;
uniform float u_depthCutoff;
uniform float u_normalsCutoff;
uniform float u_colorCutoff;
uniform float u_thickness;
uniform vec3 u_color;

varying vec2 v_uv;

float detectEdge(sampler2D sampleTexture, float cutoff) {
  vec2 stepSize = u_sampleSize * 0.1;
  float dist = 0.0;
  float sampleLength = length(u_sampleSize);
  for (vec2 sampleSize = vec2(0.0); length(sampleSize) <= sampleLength; sampleSize += stepSize) {
    dist = length(sampleSize) / (sampleLength * 0.9);
    vec2 halfSampleSize = sampleSize * u_thickness * 0.5;
    vec2 samples[4];
    samples[0] = v_uv - halfSampleSize;
    samples[1] = v_uv + halfSampleSize;
    samples[2] = v_uv + halfSampleSize * vec2(1.0, -1.0);
    samples[3] = v_uv + halfSampleSize * vec2(-1.0, 1.0);

    vec3 diff10 = texture2D(sampleTexture, samples[1]).xyz -
      texture2D(sampleTexture, samples[0]).xyz;
    vec3 diff32 = texture2D(sampleTexture, samples[3]).xyz -
      texture2D(sampleTexture, samples[2]).xyz;

    float edge = step(cutoff, sqrt(dot(diff10, diff10) + dot(diff32, diff32)));
    if (edge > 0.0) {
      break;
    }
  }
  
  return clamp(1.0 - dist, 0.0, 1.0);
}

void main() {
  float depthEdge = detectEdge(u_depthTexture, u_depthCutoff);
  float normalEdge = detectEdge(u_normalsTexture, u_normalsCutoff);
  float colorEdge = detectEdge(u_colorTexture, u_colorCutoff);
  float edge = clamp(depthEdge + normalEdge + colorEdge, 0.0, 1.0);

  vec3 color = clamp(texture2D(u_incomingTexture, v_uv).xyz - edge, 0.0, 1.0);
  color = clamp(color + u_color * edge, 0.0, 1.0);

  gl_FragColor = vec4(color, 1.0);
}

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
  vec2 halfSampleSize = u_sampleSize * u_thickness * 0.5;
  vec2 samples[4];
  samples[0] = v_uv - halfSampleSize;
  samples[1] = v_uv + halfSampleSize;
  samples[2] = v_uv + halfSampleSize * vec2(1.0, -1.0);
  samples[3] = v_uv + halfSampleSize * vec2(-1.0, 1.0);

  vec3 diff10 = texture2D(sampleTexture, samples[1]).xyz -
    texture2D(sampleTexture, samples[0]).xyz;
  vec3 diff32 = texture2D(sampleTexture, samples[3]).xyz -
    texture2D(sampleTexture, samples[2]).xyz;

  float edge = sqrt(dot(diff10, diff10) + dot(diff32, diff32));

  return step(cutoff, edge);

  // old version, should work fine-ish out of the box save for changing a few uinforms:
  /*
  vec4 horizontal = texture2D(sampleTexture, v_uv + vec2(-u_sampleSize.x, u_sampleSize.y)); // top left, factor +1
  horizontal -= texture2D(sampleTexture, v_uv + u_sampleSize);                              // top right, factor -1
  horizontal += texture2D(sampleTexture, v_uv - vec2(u_sampleSize.x, 0.0)) * 2.0;           // center left, factor +2
  horizontal -= texture2D(sampleTexture, v_uv + vec2(u_sampleSize.x, 0.0)) * 2.0;           // center right, factor -2
  horizontal += texture2D(sampleTexture, v_uv - u_sampleSize);                              // bottom left, factor +1
  horizontal -= texture2D(sampleTexture, v_uv + vec2(u_sampleSize.x, -u_sampleSize.y));     // bottom right, factor -1

  vec4 vertical = texture2D(sampleTexture, v_uv + vec2(-u_sampleSize.x, u_sampleSize.y));   // top left, factor +1
  vertical += texture2D(sampleTexture, v_uv + vec2(0.0, u_sampleSize.y)) * 2.0;             // top center, factor +2
  vertical += texture2D(sampleTexture, v_uv + u_sampleSize);                                // top right, factor +1
  vertical -= texture2D(sampleTexture, v_uv - u_sampleSize);                                // bottom left, factor -1
  vertical -= texture2D(sampleTexture, v_uv - vec2(0.0, u_sampleSize.y)) * 2.0;             // bottom center, factor -2
  vertical -= texture2D(sampleTexture, v_uv + vec2(u_sampleSize.x, -u_sampleSize.y));       // bottom right, factor -1

  float edge = sqrt(dot(horizontal, horizontal) + dot(horizontal, vertical));

  return step(cutoff, edge);
  */
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

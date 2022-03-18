uniform sampler2D tDiffuse;
uniform sampler2D u_depthTexture;
uniform sampler2D u_normalsTexture;
uniform sampler2D u_colorTexture;
uniform float u_sampleSize;
uniform vec3 u_color;

varying vec2 v_uv;

float detectEdge(sampler2D sampleTexture) {
  vec4 horizontal = texture2D(sampleTexture, v_uv + vec2(-u_sampleSize, u_sampleSize)); // top left, factor +1
  horizontal -= texture2D(sampleTexture, v_uv + u_sampleSize);                         // top right, factor -1
  horizontal += texture2D(sampleTexture, v_uv - vec2(u_sampleSize, 0.0)) * 2.0;        // center left, factor +2
  horizontal -= texture2D(sampleTexture, v_uv + vec2(u_sampleSize, 0.0)) * 2.0;        // center right, factor -2
  horizontal += texture2D(sampleTexture, v_uv - u_sampleSize);                         // bottom left, factor +1
  horizontal -= texture2D(sampleTexture, v_uv + vec2(u_sampleSize, -u_sampleSize));    // bottom right, factor -1

  vec4 vertical = texture2D(sampleTexture, v_uv + vec2(-u_sampleSize, u_sampleSize)); // top left, factor +1
  vertical += texture2D(sampleTexture, v_uv + vec2(0.0, u_sampleSize)) * 2.0;         // top center, factor +2
  vertical += texture2D(sampleTexture, v_uv + u_sampleSize);                          // top right, factor +1
  vertical -= texture2D(sampleTexture, v_uv - u_sampleSize);                          // bottom left, factor -1
  vertical -= texture2D(sampleTexture, v_uv - vec2(0.0, u_sampleSize)) * 2.0;         // bottom center, factor -2
  vertical -= texture2D(sampleTexture, v_uv + vec2(u_sampleSize, -u_sampleSize));     // bottom right, factor -1

  float edge = sqrt(dot(horizontal, horizontal) + dot(horizontal, vertical));

  return clamp(step(0.15, edge) * 0.05 + step(0.4, edge), 0.0, 1.0);
}

void main() {
  float depthEdge = detectEdge(u_depthTexture);
  float normalEdge = detectEdge(u_normalsTexture);
  float colorEdge = detectEdge(u_colorTexture);
  float edge = clamp(depthEdge + normalEdge + colorEdge, 0.0, 1.0);

  vec3 color = texture2D(tDiffuse, v_uv).xyz - edge;
  color += u_color * edge;

  gl_FragColor = vec4(color, 1.0);
}

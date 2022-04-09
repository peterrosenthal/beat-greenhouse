uniform float u_time;
uniform vec3 u_baseColor;
uniform vec3 u_gradientColor;

varying vec2 v_uv;

void main() {
  float amount = sin(v_uv.x + u_time);
  vec3 color = smoothstep(u_baseColor, u_gradientColor, vec3(amount));
  gl_FragColor = vec4(color, 1.0);
}

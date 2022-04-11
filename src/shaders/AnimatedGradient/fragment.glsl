uniform float u_time;
uniform vec3 u_baseColor;
uniform vec3 u_gradColor;

varying vec2 v_uv;

void main() {
  float amount = (sin(v_uv.x * 3.1 + u_time * 1.3) + 1.0) / 2.0;
  vec3 color = mix(u_baseColor, u_gradColor, amount);
  gl_FragColor = vec4(color, 1.0);
}

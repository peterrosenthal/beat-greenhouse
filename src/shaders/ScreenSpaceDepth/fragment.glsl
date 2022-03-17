uniform float u_near;
uniform float u_far;

varying float v_depth;

void main() {
  float color = 1.0 - smoothstep(u_near, u_far, v_depth);
  gl_FragColor = vec4(vec3(color), 1.0);
}

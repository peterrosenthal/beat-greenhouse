varying float v_depth;

void main() {
  vec4 modelViewPosition = modelViewMatrix * vec4(position, 1.0);
  gl_Position = projectionMatrix * modelViewPosition;

  v_depth = -modelViewPosition.z;
}

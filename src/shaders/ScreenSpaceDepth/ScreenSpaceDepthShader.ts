/* eslint-disable camelcase */
import vertexShader from './vertex.glsl';
import fragmentShader from './fragment.glsl';

export default {
  uniforms: {
    u_near: { value: 1.0 },
    u_far: { value: 1000.0 },
  },
  vertexShader,
  fragmentShader,
};

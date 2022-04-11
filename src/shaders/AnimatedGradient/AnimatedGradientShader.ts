/* eslint-disable camelcase */
import vertexShader from './vertex.glsl';
import fragmentShader from './fragment.glsl';

export default {
  uniforms: {
    u_time: { value: null },
    u_baseColor: { value: null },
    u_gradColor: { value: null },
  },
  vertexShader,
  fragmentShader,
};

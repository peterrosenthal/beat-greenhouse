/* eslint-disable camelcase */
import vertexShader from './vertex.glsl';
import fragmentShader from './fragment.glsl';

export default {
  uniforms: {
    tDiffuse: { value: null },
    u_depthTexture: { value: null },
    u_normalsTexture: { value: null },
    u_colorTexture: { value: null },
    u_sampleSize: { value: 0.0004 },
    u_color: { value: null },
  },
  vertexShader,
  fragmentShader,
};

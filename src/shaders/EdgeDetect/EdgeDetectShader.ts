/* eslint-disable camelcase */
import vertexShader from './vertex.glsl';
import fragmentShader from './fragment.glsl';

export default {
  uniforms: {
    u_incomingTexture: { value: null },
    u_depthTexture: { value: null },
    u_normalsTexture: { value: null },
    u_colorTexture: { value: null },
    u_sampleSize: { value: null },
    u_depthCutoff: { value: null },
    u_normalsCutoff: { value: null },
    u_colorCutoff: { value: null },
    u_thickness: { value: null },
    u_color: { value: null },
  },
  vertexShader,
  fragmentShader,
};

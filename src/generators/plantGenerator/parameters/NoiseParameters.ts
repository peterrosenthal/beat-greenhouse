import * as THREE from 'three';
import NoiseThreshold from './NoiseThreshold';

interface NoiseParameters {
  offset: THREE.Vector3,
  scale: number,
  threshold: NoiseThreshold,
}

export default NoiseParameters;

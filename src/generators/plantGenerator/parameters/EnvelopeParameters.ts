import * as THREE from 'three';
import EnvelopeHandles from './EnvelopeHandles';

interface EnvelopeParameters {
  radius: number,
  height: number,
  position: THREE.Vector3,
  handles: EnvelopeHandles,
}

export default EnvelopeParameters;

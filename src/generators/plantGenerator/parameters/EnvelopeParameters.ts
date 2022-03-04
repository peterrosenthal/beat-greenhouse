import * as THREE from 'three';
import EnvelopeHandles from './EnvelopeHandles';

interface EnvelopeParameters {
  size: number,
  position: THREE.Vector3,
  handles: EnvelopeHandles,
}

export default EnvelopeParameters;

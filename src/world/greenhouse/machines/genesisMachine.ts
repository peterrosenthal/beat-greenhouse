import * as THREE from 'three';
import { GLTF } from 'three/examples/jsm/loaders/GLTFLoader';
import * as ResourceManager from '../../../managers/resourceManager/resourceManager';
import * as Greenhouse from '../greenhouse';

export let object = new THREE.Group();

export function init(): void {
  object = (ResourceManager.items.genesisMachineModel as GLTF).scene.clone();
  object.position.set(13, 0, 8);
  object.rotation.y = Math.PI;

  Greenhouse.object.add(object);
}

import * as THREE from 'three';
import { GLTF } from 'three/examples/jsm/loaders/GLTFLoader';
import * as ResourceManager from '../../../managers/resourceManager/resourceManager';
import * as Greenhouse from '../greenhouse';

export let object = new THREE.Group();

export function init(): void {
  object = (ResourceManager.items.interpreterMachineModel as GLTF).scene.clone();
  object.position.set(17.5, 0, 7.5);
  object.rotation.y = 5 * Math.PI / 4;

  Greenhouse.object.add(object);
}

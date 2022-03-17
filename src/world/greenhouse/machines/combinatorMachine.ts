import * as THREE from 'three';
import { GLTF } from 'three/examples/jsm/loaders/GLTFLoader';
import * as ResourceManager from '../../../managers/resourceManager/resourceManager';
import * as Greenhouse from '../greenhouse';

export let object = new THREE.Group();

export function init(): void {
  object = (ResourceManager.items.combinatorMachineModel as GLTF).scene.clone();
  object.position.set(18, 0, 1);
  object.rotation.y = -Math.PI / 2;

  Greenhouse.object.add(object);
}

export function onMachineHover(intersection: THREE.Intersection): void {
  // first check if it's one of the levers
  const intersectedObject = intersection.object;
  if (intersectedObject !== object) {
    if (intersectedObject.name === 'left_lever') {
      console.log('left lever!');
      return;
    }
    if (intersectedObject.name === 'right_lever') {
      console.log('right lever!');
      return;
    }
  }
}

export function onMachineClick(intersection: THREE.Intersection): void {
  // handle click
}

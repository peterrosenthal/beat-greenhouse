import * as THREE from 'three';
import { GLTF } from 'three/examples/jsm/loaders/GLTFLoader';
import * as GameManager from '../../../managers/gameManager';
import * as ResourceManager from '../../../managers/resourceManager/resourceManager';
import * as Greenhouse from '../greenhouse';

export const object = new THREE.Group();

export function init(): void {
  object.copy((ResourceManager.items.interpreterMachineModel as GLTF).scene);
  object.position.set(17.5, 0, 7.5);
  object.rotation.y = 5 * Math.PI / 4;

  Greenhouse.object.add(object);
}

export function onMachineHover(intersection: THREE.Intersection): void {
  const intersectedObject = intersection.object;
  if (intersectedObject.name === 'play_button') {
    GameManager.highlightedObjects.push(intersectedObject);
    return;
  }
}

export function onMachineClick(intersection: THREE.Intersection): void {
  // handle click
}

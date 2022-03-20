import * as THREE from 'three';
import { GLTF } from 'three/examples/jsm/loaders/GLTFLoader';
import * as GameManager from '../../../managers/gameManager';
import * as ResourceManager from '../../../managers/resourceManager/resourceManager';
import * as PlayerController from '../../playerController/playerController';
import * as Greenhouse from '../greenhouse';

export let object = new THREE.Group();

export function init(): void {
  object = (ResourceManager.items.genesisMachineModel as GLTF).scene.clone();
  object.position.set(13, 0, 8);
  object.rotation.y = Math.PI;

  Greenhouse.object.add(object);
}

export function onMachineHover(intersection: THREE.Intersection): void {
  const intersectedObject = intersection.object;
  if (intersectedObject.name.includes('computer')) {
    object.traverse((child: THREE.Object3D) => {
      if (child.name.includes('computer')) {
        GameManager.highlightedObjects.push(child);
      }
    });
    return;
  }
}

export function onMachineClick(intersection: THREE.Intersection): void {
  if (intersection.object.name.includes('computer')) {
    // launch import dialog
    PlayerController.unlockControls();
  }
}

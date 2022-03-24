import * as THREE from 'three';
import { GLTF } from 'three/examples/jsm/loaders/GLTFLoader';
import * as GameManager from '../../../managers/gameManager';
import * as ResourceManager from '../../../managers/resourceManager/resourceManager';
import * as Greenhouse from '../greenhouse';
import * as PlayerController from '../../playerController/playerController';
import Plantsong from '../Plantsong';

export const object = new THREE.Group();

export let plantsong: Plantsong | undefined;

export function init(): void {
  object.copy((ResourceManager.items.interpreterMachineModel as GLTF).scene);
  object.position.set(17.5, 0, 7.5);
  object.rotation.y = 5 * Math.PI / 4;

  Greenhouse.object.add(object);
}

export function onMachineHover(intersection: THREE.Intersection): void {
  // first check if it's intersecting the button
  const intersectedObject = intersection.object;
  if (intersectedObject.name === 'play_button') {
    GameManager.highlightedObjects.push(intersectedObject);
    return;
  }
  // then if it's not the button, check if the player has a plantsong they can put down
  if (PlayerController.plantsong instanceof Plantsong && !(plantsong instanceof Plantsong)) {
    object.traverse(function(child: THREE.Object3D) {
      if (child.name.includes('plate')) {
        GameManager.highlightedObjects.push(child);
      }
    });
    return;
  }
  // then if not, check if the player can pick up a plant
  if (!(PlayerController.plantsong instanceof Plantsong) && plantsong instanceof Plantsong) {
    plantsong.highlight();
  }
}

export function onMachineClick(intersection: THREE.Intersection): void {
  // first check if it's intersecting the button
  const intersectedObject = intersection.object;
  if (intersectedObject.name === 'play_button') {
    // do nothing for now... need to implement this soooooooon!
    return;
  }
  // then if not, check if the player has a plantsong they can put down
  if (PlayerController.plantsong instanceof Plantsong && !(plantsong instanceof Plantsong)) {
    plantsong = PlayerController.plantsong;
    PlayerController.setPlantsong(undefined);
    plantsong.object.position.set(0, 2.2, 0);
    object.localToWorld(plantsong.object.position);
    return;
  }
  // then if not, chcek if the player can pick up a plant
  if (!(PlayerController.plantsong instanceof Plantsong) && plantsong instanceof Plantsong) {
    plantsong.pickUp();
  }
}

export function setPlantsong(plant: Plantsong | undefined): void {
  plantsong = plant;
}

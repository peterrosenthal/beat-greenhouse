import * as THREE from 'three';
import { GLTF } from 'three/examples/jsm/loaders/GLTFLoader';
import * as GameManager from '../../../managers/gameManager';
import * as ResourceManager from '../../../managers/resourceManager/resourceManager';
import * as Greenhouse from '../greenhouse';
import * as PlayerController from '../../playerController/playerController';
import Plantsong from '../Plantsong';

export const object = new THREE.Group();

export const plantsongs: Array<Plantsong | undefined> = [undefined, undefined];

let draggedHandle: THREE.Object3D | undefined;
let computer!: THREE.Object3D;

export function init(): void {
  object.copy((ResourceManager.items.combinatorMachineModel as GLTF).scene);
  object.position.set(18, 0, 1);
  object.rotation.y = -Math.PI / 2;

  Greenhouse.object.add(object);

  object.traverse(function(child: THREE.Object3D) {
    if (child.name === 'computer') {
      computer = child;
    }
  });
}

export function update(): void {
  if (draggedHandle instanceof THREE.Object3D) {
    PlayerController.raycaster.setFromCamera(new THREE.Vector2(), PlayerController.camera);
    const intersections = PlayerController.raycaster.intersectObject(computer);
    if (intersections.length > 0) {
      const point = draggedHandle.worldToLocal(intersections[0].point.clone());
      draggedHandle.position.y = THREE.MathUtils.clamp(
        draggedHandle.position.y + point.y / 800,
        1.6,
        2.45,
      );
      draggedHandle.position.z = THREE.MathUtils.lerp(
        0.96,
        0.705,
        (draggedHandle.position.y - 1.6) / 0.85,
      );
    }
  }
}

export function onMachineHover(intersection: THREE.Intersection): void {
  // first check if it's one of the levers
  if (draggedHandle instanceof THREE.Object3D) {
    GameManager.highlightedObjects.push(draggedHandle);
    return;
  }
  const intersectedObject = intersection.object;
  if (intersectedObject.name === 'left_lever' ||
      intersectedObject.name === 'right_lever') {
    GameManager.highlightedObjects.push(intersectedObject);
    return;
  }
  // then if it's not one of the levers, check if the player has a plantsong they can put down
  const intersectionLocal = object.worldToLocal(intersection.point.clone());
  const index = intersectionLocal.x < -1.75 ? 0 : 1;
  if (PlayerController.plantsong instanceof Plantsong && 
      !(plantsongs[index] instanceof Plantsong)) {
    const name = intersectionLocal.x < -1.75 ? 'left_plate' : 'right_plate';
    object.traverse(function(child: THREE.Object3D) {
      if (child.name.includes(name)) {
        GameManager.highlightedObjects.push(child);
      }
    });
    return;
  }
  // then if not, check if the player can pick up a plantsong
  if (!(PlayerController.plantsong instanceof Plantsong) &&
      plantsongs[index] instanceof Plantsong) {
    plantsongs[index]?.highlight();
  }
}

export function onMachineClick(intersection: THREE.Intersection): void {
  // first check if it's one of the levers
  const intersectedObject = intersection.object;
  if (intersectedObject.name === 'left_lever' ||
      intersectedObject.name === 'right_lever') {
    draggedHandle = intersectedObject;
    window.addEventListener('mouseup', stopDragging);
    return;
  }
  // then if not, check if the player has a plantsong they can put down
  const intersectionLocal = object.worldToLocal(intersection.point.clone());
  const index = intersectionLocal.x < -1.75 ? 0 : 1;
  if (PlayerController.plantsong instanceof Plantsong &&
      !(plantsongs[index] instanceof Plantsong)) {
    plantsongs[index] = PlayerController.plantsong;
    PlayerController.setPlantsong(undefined);
    const position = new THREE.Vector3(intersectionLocal.x < -1.75 ? -3.1 : -0.15, 1.25, 0.3);
    object.localToWorld(position);
    plantsongs[index]?.object.position.copy(position);
    return;
  }
  // then if not, check if the player can pick a plant up
  if (!(PlayerController.plantsong instanceof Plantsong) &&
      plantsongs[index] instanceof Plantsong) {
    plantsongs[index]?.pickUp();
  }
}

export function setPlantsong(index: number, plantsong: Plantsong | undefined): void {
  plantsongs[index] = plantsong;
}

function stopDragging(): void {
  draggedHandle = undefined;
  window.removeEventListener('mouseup', stopDragging);
}

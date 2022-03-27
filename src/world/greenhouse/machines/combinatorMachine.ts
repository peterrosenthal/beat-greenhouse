import * as THREE from 'three';
import { GLTF } from 'three/examples/jsm/loaders/GLTFLoader';
import * as GameManager from '../../../managers/gameManager';
import * as ResourceManager from '../../../managers/resourceManager/resourceManager';
import * as EventManager from '../../../managers/eventManager/eventManager';
import * as WorkerManager from '../../../managers/workerManager/workerManager';
import * as Greenhouse from '../greenhouse';
import * as PlayerController from '../../playerController/playerController';
import Plantsong from '../Plantsong';
import MusicParameters from '../../../generators/musicGenerator/musicParameters';
import { CombinePlantsongsRequest }
  from '../../../managers/workerManager/messages/CombinePlantsongs/CombinePlantsongsRequest';
import PlantsongPrimitive
  from '../../../managers/workerManager/messages/CombinePlantsongs/PlantsongPrimitive';

export const object = new THREE.Group();

export const plantsongs: Array<Plantsong | undefined> = [undefined, undefined];

let computer!: THREE.Object3D;
let leftLever!: THREE.Object3D;
let rightLever!: THREE.Object3D;
let activeLever: THREE.Object3D | undefined;

export let combining = false;

export function init(): void {
  object.copy((ResourceManager.items.combinatorMachineModel as GLTF).scene);
  object.position.set(18, 0, 1);
  object.rotation.y = -Math.PI / 2;

  Greenhouse.object.add(object);

  object.traverse(function(child: THREE.Object3D) {
    switch (child.name) {
      case 'computer':
        computer = child;
        break;
      case 'left_lever':
        leftLever = child;
        break;
      case 'right_lever':
        rightLever = child;
        break;
    }
  });
}

export function update(): void {
  if (activeLever instanceof THREE.Object3D) {
    PlayerController.raycaster.setFromCamera(new THREE.Vector2(), PlayerController.camera);
    const intersections = PlayerController.raycaster.intersectObject(computer);
    if (intersections.length > 0) {
      const point = activeLever.worldToLocal(intersections[0].point.clone());
      activeLever.position.y = THREE.MathUtils.clamp(
        activeLever.position.y + point.y / 400,
        1.6,
        2.45,
      );
      activeLever.position.z = THREE.MathUtils.lerp(
        0.96,
        0.705,
        (activeLever.position.y - 1.6) / 0.85,
      );
    }
  } else if (!combining &&
    leftLever.position.y > 1.62 &&
    rightLever.position.y > 1.62 &&
    plantsongs[0] instanceof Plantsong &&
    plantsongs[1] instanceof Plantsong) {
    cobmine();
  }
  if (combining) {
    // TODO: do some fancy animations
  }
}

export function onMachineHover(intersection: THREE.Intersection): void {
  // first: if the machine is actively combining, it can't be interacted with
  if (combining) {
    return;
  }
  // then check if it's one of the levers
  if (activeLever instanceof THREE.Object3D) {
    GameManager.highlightedObjects.push(activeLever);
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
  // first: if the machine is actively combining, it can't be interacted with
  if (combining) {
    return;
  }
  // then check if it's one of the levers
  const intersectedObject = intersection.object;
  if (intersectedObject.name === 'left_lever' ||
      intersectedObject.name === 'right_lever') {
    activeLever = intersectedObject;
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
  activeLever = undefined;
  window.removeEventListener('mouseup', stopDragging);
}

async function cobmine(): Promise<void> {
  // set the combining flag to true to trigger animations
  combining = true;

  // clear out all the workbenches in the greenhouse
  for (const bench of Greenhouse.workbenches) {
    bench.plantsongs[0]?.dispose();
    bench.plantsongs[1]?.dispose();
    bench.plantsongs[0] = undefined;
    bench.plantsongs[1] = undefined;
  }

  // set the balance parameter of the music generator based on the levers
  const leftLeverAmount = (leftLever.position.y - 1.6) / 0.85;
  const rightLeverAmount = (rightLever.position.y - 1.6) / 0.85;
  const balance = leftLeverAmount > rightLeverAmount ?
    rightLeverAmount / (leftLeverAmount * 2):
    1 - leftLeverAmount / (rightLeverAmount * 2);
  const parameters: MusicParameters  = {
    balance: balance,
    similarity: 0.5,
    temperature: 0.5,
  };

  const request: CombinePlantsongsRequest = {
    namespace: 'combinator',
    encodingA: plantsongs[0]!.encoding,
    encodingB: plantsongs[1]!.encoding,
    parameters: parameters,
  };
  EventManager.addEventListener('combine.combinator', fillBenches);
  console.log('senging message to worker');
  WorkerManager.worker.postMessage(request);
}

function fillBenches(primitives: PlantsongPrimitive[]): void {
  console.log('recieving message from worker');
  // find a random bench and place to put a plantsong onto, and
  // create the plantsong out of the plantsong primitive
  while (primitives.length > 0) {
    const primitive = primitives.pop()!;
    let indexOfBench = Math.floor(Math.random() * Greenhouse.workbenches.length);
    let indexOnBench = Math.floor(Math.random() * 2);
    // eslint-disable-next-line max-len
    while (Greenhouse.workbenches[indexOfBench].plantsongs[indexOnBench] instanceof Plantsong) {
      indexOfBench = Math.floor(Math.random() * Greenhouse.workbenches.length);
      indexOnBench = Math.floor(Math.random() * 2);
    }
    const position = new THREE.Vector3(indexOnBench === 0 ? -3 : 3, 2.5, 0);
    Greenhouse.workbenches[indexOfBench].object.localToWorld(position);
    const plantsong = new Plantsong(primitive.encoding, position, primitive.plant);
    Greenhouse.plantsongs.push(plantsong);
    Greenhouse.workbenches[indexOfBench].plantsongs[indexOnBench] = plantsong;
  }

  // return the lever positions to the bottom
  leftLever.position.y = 1.6;
  leftLever.position.z = 0.96;
  rightLever.position.y = 1.6;
  rightLever.position.z = 0.96;

  // return the combining flag to false at the end of the method
  combining = false;
}

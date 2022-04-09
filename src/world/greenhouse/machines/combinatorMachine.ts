import * as THREE from 'three';
import { GLTF } from 'three/examples/jsm/loaders/GLTFLoader';
import * as ApiManager from '../../../managers/apiManager';
import * as GameManager from '../../../managers/gameManager';
import * as TimeManager from '../../../managers/timeManager';
import * as ResourceManager from '../../../managers/resourceManager/resourceManager';
import * as Greenhouse from '../greenhouse';
import * as PlayerController from '../../playerController/playerController';
import * as MusicGenerator from '../../../generators/musicGenerator/musicGenerator';
import Plantsong from '../Plantsong';
import AnimatedGradientShader from '../../../shaders/AnimatedGradient/AnimatedGradientShader';
import { INoteSequence } from '@magenta/music/es6';
import { ShaderMaterial } from 'three';

export const object = new THREE.Group();

export const plantsongs: Array<Plantsong | undefined> = [undefined, undefined];

let computer!: THREE.Object3D;
let leftLever!: THREE.Object3D;
let rightLever!: THREE.Object3D;
let activeLever: THREE.Object3D | undefined;
let blueTube!: THREE.Mesh;
let orangeTube!: THREE.Mesh;

const leverMinY = 1.872;
const leverMaxY = 2.325;
const leverDiffY = leverMaxY - leverMinY;
const leverMinZ = 0.582;
const leverMaxZ = 0.719;

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
      case 'blue_tube':
        blueTube = child as THREE.Mesh;
        break;
      case 'orange_tube':
        orangeTube = child as THREE.Mesh;
        break;
    }
  });
  const blueGradientMaterial = new THREE.ShaderMaterial(AnimatedGradientShader);
  blueGradientMaterial.uniforms.u_time.value = 0;
  blueGradientMaterial.uniforms.u_baseColor.value = new THREE.Color(0x72a9e7);
  blueGradientMaterial.uniforms.u_gradientColor.value = new THREE.Color(0x00dfb9);
  blueTube.material = blueGradientMaterial;

  const orangeGradientMaterial = new THREE.ShaderMaterial(AnimatedGradientShader);
  orangeGradientMaterial.uniforms.u_time.value = 0;
  orangeGradientMaterial.uniforms.u_baseColor.value = new THREE.Color(0xe74c68);
  orangeGradientMaterial.uniforms.u_gradientColor.value = new THREE.Color(0xdd6300);
  orangeTube.material = orangeGradientMaterial;
}

export function update(): void {
  if (activeLever instanceof THREE.Object3D) {
    PlayerController.raycaster.setFromCamera(new THREE.Vector2(), PlayerController.camera);
    const intersections = PlayerController.raycaster.intersectObject(computer);
    if (intersections.length > 0) {
      const point = activeLever.worldToLocal(intersections[0].point.clone());
      activeLever.position.y = THREE.MathUtils.clamp(
        activeLever.position.y + point.y / 400, leverMinY, leverMaxY);
      activeLever.position.z = THREE.MathUtils.lerp(
        leverMaxZ, leverMinZ, (activeLever.position.y - leverMinY) / leverDiffY);
    }
  }
  if (combining) {
    (blueTube.material as ShaderMaterial).uniforms.u_time.value += TimeManager.delta / 1000;
    (orangeTube.material as ShaderMaterial).uniforms.u_time.value += TimeManager.delta / 1000;
  }
}

export function onMachineHover(intersection: THREE.Intersection): void {
  // first: if the machine is actively combining, it can't be interacted with
  if (combining) {
    return;
  }
  // then check if it's the combiner button
  const intersectedObject = intersection.object;
  if (intersectedObject.name === 'computer_button') {
    GameManager.highlightedObjects.push(intersectedObject);
    return;
  }
  // then check if it's one of the levers
  if (activeLever instanceof THREE.Object3D) {
    GameManager.highlightedObjects.push(activeLever);
    return;
  }
  if (intersectedObject.name === 'left_lever' ||
      intersectedObject.name === 'right_lever') {
    GameManager.highlightedObjects.push(intersectedObject);
    return;
  }
  // then if it's not the computer, check if the player has a plantsong they can put down
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
  // then check if it's the button
  const intersectedObject = intersection.object;
  if (intersectedObject.name === 'computer_button' &&
    rightLever.position.y > leverMinY &&
    leftLever.position.y > leverMinY &&
    plantsongs[0] instanceof Plantsong &&
    plantsongs[1] instanceof Plantsong) {
    combine();
    return;
  }
  // then check if it's one of the levers
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

async function combine(): Promise<void> {
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
  MusicGenerator.parameters.balance =  leftLeverAmount > rightLeverAmount ?
    rightLeverAmount / (leftLeverAmount * 2):
    1 - leftLeverAmount / (rightLeverAmount * 2);

  // decode the plantsongs that will be combined
  const parents = {
    a: await MusicGenerator.decode(plantsongs[0]!.encoding),
    b: await MusicGenerator.decode(plantsongs[1]!.encoding),
  };

  // combine the sequences with the api manager
  const sequences: INoteSequence[] = [];
  const parameters = {
    balance: MusicGenerator.parameters.balance,
    similarity: MusicGenerator.parameters.similarity,
    temperature: MusicGenerator.parameters.temperature,
  };
  let tries = 0;
  for (let i = 0; i < 9; i++) {
    try {
      const response = await ApiManager.post('combine', { parents, parameters });
      if (response instanceof Object && response.child instanceof Object) {
        try {
          sequences.push(response.child as INoteSequence);
        } catch (e) {
          // eslint-disable-next-line max-len
          console.error(`couldn't combine plants, response.child is not a note sequence. ${response.child}`);
          return;
        }
      } else if (response instanceof Object && typeof response.error === 'string') {
        console.error(`couldn't combine plants, api response: '${response.error}'`);
        return;
      } else {
        console.error(`couldn't combine plants, api response: '${response}'`);
        return;
      }
    } catch (e) {
      // an unexpected error occurred, log the error and try again
      console.error(`an unexpected error occurred, trying again. error: '${e}'`);
      i--;
      tries++;
      if (tries > 20) {
        // something really went wrong
        console.log('an unexpected error occurred too many times, abandoning attempts');
        return;
      }
    }
  }

  // find a random bench to put a plant on, encode the sequence,
  // create a plant out of the encoding, and rinse and repeat
  while (sequences.length > 0) {
    const sequence = sequences.pop()!;
    let indexOfBench = Math.floor(Math.random() * Greenhouse.workbenches.length);
    let indexOnBench = Math.floor(Math.random() * 2);
    // eslint-disable-next-line max-len
    while (Greenhouse.workbenches[indexOfBench].plantsongs[indexOnBench] instanceof Plantsong) {
      indexOfBench = Math.floor(Math.random() * Greenhouse.workbenches.length);
      indexOnBench = Math.floor(Math.random() * 2);
    }
    const encoding = await MusicGenerator.encode(sequence);
    const position = new THREE.Vector3(indexOnBench === 0 ? -3 : 3, 2.5, 0);
    Greenhouse.workbenches[indexOfBench].object.localToWorld(position);
    const plantsong = new Plantsong(encoding, position);
    Greenhouse.plantsongs.push(plantsong);
    Greenhouse.workbenches[indexOfBench].plantsongs[indexOnBench] = plantsong;
  }

  // return the lever positions to the bottom
  leftLever.position.y = leverMinY;
  leftLever.position.z = leverMaxZ;
  rightLever.position.y = leverMinY;
  rightLever.position.z = leverMaxZ;

  // return the combining flag to false at the end of the method
  combining = false;
}

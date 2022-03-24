import * as THREE from 'three';
import { PointerLockControls } from 'three/examples/jsm/controls/PointerLockControls.js';
import * as SizesManager from '../../managers/sizesManager';
import * as TimeManager from '../../managers/timeManager';
import * as GameManager from '../../managers/gameManager';
import * as RenderManager from '../../managers/renderManager';
import * as Greenhouse from '../greenhouse/greenhouse';
import * as CombinatorMachine from '../greenhouse/machines/combinatorMachine';
import * as GenesisMachine from '../greenhouse/machines/genesisMachine';
import * as InterpreterMachine from '../greenhouse/machines/interpreterMachine';
import MovementState from './MovementState';
import Bench from '../greenhouse/Bench';
import Plantsong from '../greenhouse/Plantsong';

export const acceleration = 30;
export const deacceleration = 15;
export const maxSpeed = 12.5;

export const state: MovementState = {
  forward: false,
  backward: false,
  left: false,
  right: false,
};

export const direction = new THREE.Vector3();
export const velocity = new THREE.Vector3();

export const camera = new THREE.PerspectiveCamera(
  45,
  SizesManager.aspectRatio,
  0.45,
  45
);
camera.position.set(10, 2.3, 0);

let controls!: PointerLockControls;
const raycaster = new THREE.Raycaster();

const title = document.createElement('h1');
title.innerText = 'Beat Greenhouse';

const instructions = document.createElement('p');
instructions.innerHTML = 
  'Move: WASD or arrow keys<br>Look: Move mouse<br>Press any key to play';

const content = document.createElement('div');
content.classList.add('menu-content');
content.appendChild(title);
content.appendChild(instructions);

export const menu = document.createElement('div');
menu.classList.add('pause-menu');
menu.appendChild(content);

export const crosshair = document.createElement('div');
crosshair.classList.add('crosshair');
crosshair.innerText = '.';

document.body.appendChild(menu);
document.body.appendChild(crosshair);

let overrideMenu = false;

export let plantsong: Plantsong | undefined;

export function init(): void {
  controls = new PointerLockControls(camera, RenderManager.canvas);

  GameManager.scene.add(camera);

  controls.domElement = RenderManager.canvas;
  controls.connect();
  GameManager.scene.add(controls.getObject());

  menu.addEventListener('click', lockControls);
  controls.addEventListener('lock', hideMenu);
  controls.addEventListener('lock', GenesisMachine.hideImportMenu);
  controls.addEventListener('unlock', showMenu);
  window.addEventListener('keydown', onKeyDown);
  window.addEventListener('keyup', onKeyUp);
  window.addEventListener('mousedown', onMouseDown);
}

export function resize(): void {
  camera.aspect = SizesManager.aspectRatio;
  camera.updateProjectionMatrix();
}

export function update(): void {
  if (!controls.isLocked) {
    return;
  }

  const delta = TimeManager.delta / 1000;

  /* move player */
  // update direction
  direction.z = Number(state.forward) - Number(state.backward);
  direction.x = Number(state.right) - Number(state.left);
  direction.normalize();

  // update z velocity
  if (state.forward || state.backward) {
    velocity.z += direction.z * acceleration * delta;
  } else {
    velocity.z -= velocity.z * deacceleration * delta;
  }

  // update x velocity
  if (state.left || state.right) {
    velocity.x += direction.x * acceleration * delta;
  } else {
    velocity.x -= velocity.x * deacceleration * delta;
  }

  // cannot exceed max speed
  velocity.clampLength(0, maxSpeed);

  // update controls
  controls.moveRight(velocity.x * delta);
  controls.moveForward(velocity.z * delta);

  /* mouse intersection behavior */
  raycaster.setFromCamera(new THREE.Vector2(), camera);
  const intersections = raycaster.intersectObject(GameManager.scene, true);
  let intersected = handlePlantsongIntersections(intersections, false);
  if (!intersected) {
    intersected = handleMachineIntersections(intersections, false);
    if (!intersected) {
      intersected = handleBenchIntersections(intersections, false);
    }
  }

  if (plantsong instanceof Plantsong) {
    plantsong.object.position.set(0, -3, -4.5);
    camera.localToWorld(plantsong.object.position);
  }
}

export function lockControls(): void {
  if (controls.isLocked) {
    return;
  }
  controls.lock();
}

export function unlockControls(showMenu = false): void {
  controls.unlock();
  GameManager.pause();
  if (!showMenu) {
    overrideMenu = true;
  }
}

export function hideMenu(): void {
  GameManager.play();
  overrideMenu = false;
  menu.style.display = 'none';
  showCrosshair();
}

export function showMenu(): void {
  if (overrideMenu) {
    return;
  }
  GameManager.pause();
  menu.style.display = 'block';
  hideCrosshair();
}

export function showCrosshair(): void {
  crosshair.style.display = 'block';
}

export function hideCrosshair(): void {
  crosshair.style.display = 'none';
}

function handlePlantsongIntersections(
  intersections: THREE.Intersection[],
  click: boolean,
): boolean {
  for (let i = 0; i < intersections.length; i++) {
    const intersection = intersections[i];
    const object = intersection.object;
    const plant = Greenhouse.findPlantsong(object);
    if (plant instanceof Plantsong && plant !== plantsong) {
      click ? plant.pickUp() : plant.highlight();
      return true;
    }
  }
  return false;
}

function handleMachineIntersections(
  intersections: THREE.Intersection[],
  click: boolean,
): boolean {
  for (let i = 0; i < intersections.length; i++) {
    const intersection = intersections[i];
    const object = intersection.object;

    let objectIsCombinator = false;
    if (object === CombinatorMachine.object) {
      objectIsCombinator = true;
    } else {
      CombinatorMachine.object.traverse(function(child: THREE.Object3D) {
        if (object === child) {
          objectIsCombinator = true;
        }
      });
    }
    if (objectIsCombinator) {
      if (click) {
        CombinatorMachine.onMachineClick(intersection);
      } else {
        CombinatorMachine.onMachineHover(intersection);
      }
      return true;
    }

    let objectIsGenesis = false;
    if (object === GenesisMachine.object) {
      objectIsGenesis = true;
    } else {
      GenesisMachine.object.traverse(function(child: THREE.Object3D) {
        if (object === child) {
          objectIsGenesis = true;
        }
      });
    }
    if (objectIsGenesis) {
      if (click) {
        GenesisMachine.onMachineClick(intersection);
      } else {
        GenesisMachine.onMachineHover(intersection);
      }
      return true;
    }

    let objectIsInterpreter = false;
    if (object === InterpreterMachine.object) {
      objectIsInterpreter = true;
    } else {
      InterpreterMachine.object.traverse(function(child: THREE.Object3D) {
        if (object === child) {
          objectIsInterpreter = true;
        }
      });
    }
    if (objectIsInterpreter) {
      if (click) {
        InterpreterMachine.onMachineClick(intersection);
      } else {
        InterpreterMachine.onMachineHover(intersection);
      }
      return true;
    }
  }
  return false;
}

function handleBenchIntersections(
  intersections: THREE.Intersection[],
  click: boolean,
): boolean {
  for (let i = 0; i < intersections.length; i++) {
    const intersection = intersections[i];
    const object = intersection.object;
    const bench = Greenhouse.findBench(object);
    if (bench instanceof Bench) {
      click ? bench.onBenchClick(intersection) : bench.onBenchHover(intersection);
      return true;
    }
  }
  return false;
}

function onMouseDown(): void {
  raycaster.setFromCamera(new THREE.Vector2(), camera);
  const intersections = raycaster.intersectObject(GameManager.scene, true);
  let intersected = handlePlantsongIntersections(intersections, true);
  if (!intersected) {
    intersected = handleMachineIntersections(intersections, true);
    if (!intersected) {
      intersected = handleBenchIntersections(intersections, true);
    }
  }
}

function onKeyDown(event: KeyboardEvent): void {
  updateMovementState(event.code, true);
}

function onKeyUp(event: KeyboardEvent): void {
  updateMovementState(event.code, false);
  if (event.code === 'Escape') {
    lockControls();
  }
}

function updateMovementState(code: string, value: boolean): void {
  switch (code) {
    case 'ArrowUp':
    case 'KeyW':
      state.forward = value;
      break;
    case 'ArrowDown':
    case 'KeyS':
      state.backward = value;
      break;
    case 'ArrowLeft':
    case 'KeyA':
      state.left = value;
      break;
    case 'ArrowRight':
    case 'KeyD':
      state.right = value;
      break;
  }
}

export function setPlantsong(plant: Plantsong | undefined): void {
  plantsong = plant;
}

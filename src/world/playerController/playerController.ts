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
  if (!handleMachineIntersections(intersections, false)) {
    const [bench, intersectionLocal] = getClosestBenchIntersection(intersections);
    if (bench !== undefined && intersectionLocal !== undefined) {
      bench.onBenchHover(intersectionLocal);
    }
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

function getClosestBenchIntersection(
  intersections: THREE.Intersection[],
): [Bench | undefined, THREE.Vector3 | undefined] {
  let bench: Bench | undefined;
  let intersectionLocal: THREE.Vector3 | undefined;
  for (let i = 0; i < intersections.length; i++) {
    if (bench !== undefined && intersectionLocal !== undefined) {
      break;
    }
    const object = intersections[i].object;
    for (const greenhouseBench of Greenhouse.allBenches) {
      if (object === greenhouseBench.object) {
        bench = greenhouseBench;
        intersectionLocal = intersections[i].point.clone();
        bench.object.worldToLocal(intersectionLocal);
        break;
      }
      let objectIsBenchChild = false;
      greenhouseBench.object.traverse(function(child: THREE.Object3D) {
        if (object === child) {
          objectIsBenchChild = true;
        }
      });
      if (objectIsBenchChild) {
        bench = greenhouseBench;
        intersectionLocal = intersections[i].point.clone();
        bench.object.worldToLocal(intersectionLocal);
        break;
      }
    }
  }
  return [bench, intersectionLocal];
}

function onMouseDown(): void {
  raycaster.setFromCamera(new THREE.Vector2(), camera);
  const intersections = raycaster.intersectObject(GameManager.scene, true);
  if (!handleMachineIntersections(intersections, true)) {
    const [bench, intersectionLocal] = getClosestBenchIntersection(intersections);
    if (bench !== undefined && intersectionLocal !== undefined) {
      bench.onBenchClick(intersectionLocal);
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

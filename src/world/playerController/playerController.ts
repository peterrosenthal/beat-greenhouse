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
import * as OwnersManual from './ownersManual';
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
export const raycaster = new THREE.Raycaster();

export const crosshair = document.createElement('div');
crosshair.classList.add('crosshair');
crosshair.innerText = '.';

document.body.appendChild(crosshair);

export let plantsong: Plantsong | undefined;

export function init(): void {
  controls = new PointerLockControls(camera, RenderManager.canvas);

  GameManager.scene.add(camera);

  controls.domElement = RenderManager.canvas;
  controls.connect();
  GameManager.scene.add(controls.getObject());

  OwnersManual.init();

  controls.addEventListener('lock', showCrosshair);
  controls.addEventListener('lock', OwnersManual.hideMenu);
  controls.addEventListener('lock', () => OwnersManual.overrideMenu(false));
  controls.addEventListener('lock', GenesisMachine.hideMenu);
  controls.addEventListener('lock', GameManager.play);
  controls.addEventListener('unlock', hideCrosshair);
  controls.addEventListener('unlock', OwnersManual.showMenu);
  controls.addEventListener('unlock', GameManager.pause);
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
    const sign = Math.sign(velocity.z);
    velocity.z -= velocity.z * deacceleration * delta;
    // eliminate bouncing
    if (Math.sign(velocity.z) !== sign) {
      velocity.z = 0;
    }
  }

  // update x velocity
  if (state.left || state.right) {
    velocity.x += direction.x * acceleration * delta;
  } else {
    const sign = Math.sign(velocity.x);
    velocity.x -= velocity.x * deacceleration * delta;
    if (Math.sign(velocity.x) !== sign) {
      velocity.x = 0;
    }
  }

  // cannot exceed max speed
  velocity.clampLength(0, maxSpeed);

  // update controls
  controls.moveRight(velocity.x * delta);
  controls.moveForward(velocity.z * delta);
  
  // check bounds
  // eslint-disable-next-line max-len
  const lowerX = camera.position.x > 6.6 && camera.position.z < 3.6 && camera.position.z > -0.7 ? 7 : -19.4;
  const upperX = camera.position.z > 6.7 ? 16.1 : 16.4;
  const lowerZ = camera.position.z < 0 ? -4.7 : camera.position.x < 6.6 ? 3.6 : -4.7;
  // eslint-disable-next-line max-len
  const upperZ = camera.position.x < 6.6 && camera.position.z < 0 ? -0.7 : camera.position.x < 9.5 && camera.position.x > 7 ? 9.4 : 7.1;
  camera.position.x = THREE.MathUtils.clamp(camera.position.x, lowerX, upperX);
  camera.position.z = THREE.MathUtils.clamp(camera.position.z, lowerZ, upperZ);

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
    plantsong.object.position.set(0, -1, -4.5);
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
  if (!showMenu) {
    OwnersManual.overrideMenu(true);
  }
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
  if (!GameManager.isPlaying) {
    return;
  }
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

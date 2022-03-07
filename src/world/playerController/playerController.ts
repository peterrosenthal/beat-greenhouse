import * as THREE from 'three';
import { PointerLockControls } from 'three/examples/jsm/controls/PointerLockControls.js';
import * as SizesManager from '../../managers/sizesManager';
import * as TimeManager from '../../managers/timeManager';
import * as GameManager from '../../managers/gameManager';
import * as Greenhouse from '../greenhouse/greenhouse';
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

export const camera = new THREE.PerspectiveCamera(55, SizesManager.aspectRatio, 0.01, 1000);
camera.position.set(10, 2.3, 0);

const controls = new PointerLockControls(camera);
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

export const pointer = document.createElement('div');
pointer.classList.add('pointer');
pointer.innerText = '.';

document.body.appendChild(menu);
document.body.appendChild(pointer);

export function init(): void {
  GameManager.scene.add(camera);

  controls.domElement = GameManager.canvas;
  controls.connect();
  GameManager.scene.add(controls.getObject());

  menu.addEventListener('click', lockControls);
  controls.addEventListener('lock', hideMenu);
  controls.addEventListener('unlock', showMenu);
  window.addEventListener('keydown', onKeyDown);
  window.addEventListener('keyup', onKeyUp);
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

  /* highlight the bench spot that the player is looking at */
  raycaster.setFromCamera(new THREE.Vector2(), camera);
  const intersections = raycaster.intersectObject(GameManager.scene, true);
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
  if (bench !== undefined && intersectionLocal !== undefined) {
    bench.highlightBenchSegment(intersectionLocal);
  }
}

export function lockControls(): void {
  controls.lock();
}

export function hideMenu(): void {
  menu.style.display = 'none';
  pointer.style.display = 'block';
}

export function showMenu(): void {
  pointer.style.display = 'none';
  menu.style.display = 'block';
}

function onKeyDown(event: KeyboardEvent): void {
  updateMovementState(event.code, true);
}

function onKeyUp(event: KeyboardEvent): void {
  updateMovementState(event.code, false);
}

function updateMovementState(code: string, value: boolean) {
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

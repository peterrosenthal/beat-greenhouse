import * as THREE from 'three';
import * as WorkerManager from './workerManager/workerManager';
import * as RenderManager from './renderManager';
import * as EventManager from './eventManager/eventManager';
import * as PlayerController from '../world/playerController/playerController';
import * as Environment from '../world/environment';
import * as Greenhouse from '../world/greenhouse/greenhouse';
import * as Grass from '../world/grass';

WorkerManager.worker.postMessage('hello world!');

export let isPlaying = false;

export const scene = new THREE.Scene();

// post-processing
export const highlightedObjects: THREE.Object3D[] = [];
export const highlightedScene = new THREE.Scene();

function resize(): void {
  PlayerController.resize();
  RenderManager.resize();
}

EventManager.addEventListener('resize', resize);

export function updateAllMaterials(): void {
  scene.traverse(function(object: THREE.Object3D) {
    if (object instanceof THREE.Mesh
     && object.material instanceof THREE.MeshStandardMaterial) {
      object.material.envMapIntensity = 2;
      object.material.needsUpdate = true;
    }
  });
}

export function init(): void {
  RenderManager.setupPostprocessing();

  Environment.init();
  PlayerController.init();
  Greenhouse.init();
  Grass.init();

  highlightedScene.add(Environment.directionalLight.clone());

  updateAllMaterials();

  RenderManager.render();
}

function update(): void {
  // update game objects
  Greenhouse.update();
  PlayerController.update();

  // add highlighted objects to highlighted scene
  const highlightedObjectClones: THREE.Object3D[] = [];
  for (let i = 0; i < highlightedObjects.length; i++) {
    const object = highlightedObjects[i];
    const worldPosition = object.getWorldPosition(new THREE.Vector3());
    const worldRotation = object.getWorldQuaternion(new THREE.Quaternion());
    const worldScale = object.getWorldScale(new THREE.Vector3());
    const clone = object.clone();
    clone.position.copy(worldPosition);
    clone.quaternion.copy(worldRotation);
    clone.scale.copy(worldScale);
    highlightedScene.add(clone);
    highlightedObjectClones.push(clone);
  }

  // render the scene
  RenderManager.render();

  // clear the highlighted scene to set up for next frame
  for (const clone of highlightedObjectClones) {
    clone.removeFromParent();
  }
  while (highlightedObjects.length > 0) {
    highlightedObjects.pop();
  }
}

export function play(): void {
  if (isPlaying) {
    return;
  }
  EventManager.addEventListener('update', update);
  isPlaying = true;
}

export function pause(): void {
  if (!isPlaying) {
    return;
  }
  EventManager.removeEventListener('update', update);
  isPlaying = false;
}

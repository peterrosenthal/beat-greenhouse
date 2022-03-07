import * as THREE from 'three';
import * as SizesManager from './sizesManager';
import * as EventManager from './eventManager/eventManager';
import * as PlantGenerator from '../generators/plantGenerator/plantGenerator';
import * as PlayerController from '../world/playerController/playerController';
import * as Environment from '../world/environment';
import * as Greenhouse from '../world/greenhouse/greenhouse';
import * as Grass from '../world/grass';

export const canvas = document.querySelector('canvas')!;
export const scene = new THREE.Scene();
export const renderer = new THREE.WebGLRenderer({
  canvas: canvas,
  antialias: true,
});
renderer.setSize(SizesManager.width, SizesManager.height);
renderer.setPixelRatio(SizesManager.pixelRatio);
renderer.physicallyCorrectLights = true;
renderer.outputEncoding = THREE.sRGBEncoding;
renderer.toneMapping = THREE.ReinhardToneMapping;
renderer.toneMappingExposure = 1.5;

function resize(): void {
  PlayerController.resize();

  renderer.setSize(SizesManager.width, SizesManager.height);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
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
  Environment.init();
  PlayerController.init();
  Greenhouse.init();
  Grass.init();

  EventManager.addEventListener('update', update);

  const plant = PlantGenerator.generatePlant();
  plant.object.position.set(0, 1.2, 1.7);
  scene.add(plant.object);
}

function update(): void {
  Greenhouse.update();
  PlayerController.update();

  renderer.render(scene, PlayerController.camera);
}

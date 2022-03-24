import * as THREE from 'three';
import { GLTF } from 'three/examples/jsm/loaders/GLTFLoader.js';
import * as ResourceManager from '../../managers/resourceManager/resourceManager';
import * as GameManager from '../../managers/gameManager';
import * as GenesisMachine from './machines/genesisMachine';
import * as CombinatorMachine from './machines/combinatorMachine';
import * as InterpreterMachine from './machines/interpreterMachine';
import Bench from './Bench';
import Workbench from './Workbench';
import Showbench from './Showbench';
import Plantsong from './Plantsong';

export const object = new THREE.Group();

export const workbenches: Workbench[] = [];
export const showbenches: Showbench[] = [];
export const allBenches: Bench[] = [];

export const plantsongs: Plantsong[] = [];

const workbenchesParent = new THREE.Group();
const showbenchesParent = new THREE.Group();

export function init(): void {
  const greenhouseModel = (ResourceManager.items.greenhouseModel as GLTF).scene.clone();

  greenhouseModel.traverse(function(object: THREE.Object3D) {
    if (object instanceof THREE.Mesh
     && object.material instanceof THREE.MeshStandardMaterial
     && object.material.name === 'window') {
      object.material.transparent = true;
    }
  });

  for (let i = 0; i < 4; i++) {
    for (let j = 0; j < 3; j++) {
      workbenches.push(new Workbench(
        workbenchesParent,
        new THREE.Vector3(-16.4 + 6.7 * i, 0, j > 0 ? j > 1 ? 0.4 : 2.6 : 8.5),
      ));
    }
  }

  for (let i = 0; i < 4; i++) {
    showbenches.push(new Showbench(
      showbenchesParent,
      new THREE.Vector3(-14.8 + 9.7 * i, 0, -6),
    ));
  }

  allBenches.push(...workbenches, ...showbenches);

  object.add(
    greenhouseModel,
    workbenchesParent,
    showbenchesParent,
  );
  GameManager.scene.add(object);

  GenesisMachine.init();
  CombinatorMachine.init();
  InterpreterMachine.init();
}

export function findBenchInList(objectsList: THREE.Object3D[]): Bench | undefined {
  // use "old school" for loop to absolutely ensure order is kept
  for (let i = 0; i < objectsList.length; i++) {
    const object = objectsList[i];
    for (const bench of allBenches) {
      if (object === bench.object) {
        return bench;
      }
      let objectIsBenchChild = false;
      bench.object.traverse(function(child: THREE.Object3D) {
        if (object === child) {
          objectIsBenchChild = true;
        }
      });
      if (objectIsBenchChild) {
        return bench;
      }
    }
  }

  return undefined;
}

export function update(): void {
  CombinatorMachine.update();
}

export function findPlantsong(object: THREE.Object3D): Plantsong | undefined {
  for (const plantsong of plantsongs) {
    if (plantsong.object === object) {
      return plantsong;
    }
    let isPlantsong = false;
    plantsong.object.traverse(function(child: THREE.Object3D) {
      if (child === object) {
        isPlantsong = true;
      }
    });
    if (isPlantsong) {
      return plantsong;
    }
  }
  return undefined;
}

export function findBench(object: THREE.Object3D): Bench | undefined {
  for (const bench of allBenches) {
    if (bench.object === object) {
      return bench;
    }
    let isBench = false;
    bench.object.traverse(function(child: THREE.Object3D) {
      if (child === object) {
        isBench = true;
      }
    });
    if (isBench) {
      return bench;
    }
  }
  return undefined;
}

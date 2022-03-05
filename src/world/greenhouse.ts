import * as THREE from 'three';
import { GLTF } from 'three/examples/jsm/loaders/GLTFLoader.js';
import * as ResourceManager from '../managers/resourceManager/resourceManager';
import * as GameManager from '../managers/gameManager';

export function init(): void {
  const greenhouseModel = ResourceManager.items.greenhouseModel as GLTF;
  const workbenchModel = ResourceManager.items.workbenchModel as GLTF;
  const showbenchModel = ResourceManager.items.showbenchModel as GLTF;
  const potModel = ResourceManager.items.potModel as GLTF;

  greenhouseModel.scene.traverse(function(object: THREE.Object3D) {
    if (object instanceof THREE.Mesh
     && object.material instanceof THREE.MeshStandardMaterial
     && object.material.name === 'window') {
      object.material.transparent = true;
    }
  });

  workbenchModel.scene.scale.set(0.62, 0.62, 0.62);
  showbenchModel.scene.scale.set(0.62, 0.62, 0.62);

  const workbenches = new THREE.Group();
  const workbench1 = workbenchModel.scene.clone();
  workbench1.position.set(-15, 0, 8);
  workbenches.add(workbench1);
  const workbench2 = workbenchModel.scene.clone();
  workbench2.position.set(-6.5, 0, 8);
  workbenches.add(workbench2);
  const workbench3 = workbenchModel.scene.clone();
  workbench3.position.set(2, 0, 8);
  workbenches.add(workbench3);
  const workbench4 = workbenchModel.scene.clone();
  workbench4.position.set(10.5, 0, 8);
  workbenches.add(workbench4);
  const workbench5 = workbenchModel.scene.clone();
  workbench5.position.set(-15, 0, 1.3);
  workbenches.add(workbench5);
  const workbench6 = workbenchModel.scene.clone();
  workbench6.position.set(-6.5, 0, 1.3);
  workbenches.add(workbench6);
  const workbench7 = workbenchModel.scene.clone();
  workbench7.position.set(2, 0, 1.3);
  workbenches.add(workbench7);
  const workbench8 = workbenchModel.scene.clone();
  workbench8.position.set(-15, 0, -1.3);
  workbenches.add(workbench8);
  const workbench9 = workbenchModel.scene.clone();
  workbench9.position.set(-6.5, 0, -1.3);
  workbenches.add(workbench9);
  const workbench10 = workbenchModel.scene.clone();
  workbench10.position.set(2, 0, -1.3);
  workbenches.add(workbench10);

  const showbenches = new THREE.Group();
  const showbench1 = showbenchModel.scene.clone();
  showbench1.position.set(-15, 0, -6.5);
  showbenches.add(showbench1);
  const showbench2 = showbenchModel.scene.clone();
  showbench2.position.set(-6.5, 0, -6.5);
  showbenches.add(showbench2);
  const showbench3 = showbenchModel.scene.clone();
  showbench3.position.set(2, 0, -6.5);
  showbenches.add(showbench3);
  const showbench4 = showbenchModel.scene.clone();
  showbench4.position.set(10.5, 0, -6.5);
  showbenches.add(showbench4);

  const pot = potModel.scene.clone();
  pot.position.set(0, 1.2, 1.7);

  GameManager.scene.add(
    greenhouseModel.scene,
    workbenches,
    showbenches,
    pot,
  );

  GameManager.updateAllMaterials();
}

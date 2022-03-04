import { GLTF } from 'three/examples/jsm/loaders/GLTFLoader.js';
import * as ResourceManager from '../managers/resourceManager/resourceManager';
import * as GameManager from '../managers/gameManager';

export function init(): void {
  const greenhouseModel = ResourceManager.items.greenhouseModel as GLTF;
  const workbenchModel = ResourceManager.items.workbenchModel as GLTF;
  const showbenchModel = ResourceManager.items.showbenchModel as GLTF;
  const potModel = ResourceManager.items.potModel as GLTF;

  workbenchModel.scene.position.z = 7.5;
  showbenchModel.scene.position.z = -4.5;

  GameManager.scene.add(
    greenhouseModel.scene,
    workbenchModel.scene,
    showbenchModel.scene,
    potModel.scene,
  );

  GameManager.updateAllMaterials();
}

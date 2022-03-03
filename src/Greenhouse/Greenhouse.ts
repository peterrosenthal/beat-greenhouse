import { GLTF } from 'three/examples/jsm/loaders/GLTFLoader';
import GameManager from '../Managers/GameManager';
import ResourceManager from '../Managers/ResourceManager/ResourceManager';

export default class Greenhouse {
  constructor() {
    const gameManager = GameManager.getInstance();
    const resourceManager = ResourceManager.getInstance();

    const greenhouseModel = resourceManager.items.greenhouseModel as GLTF;
    const workbenchModel = resourceManager.items.workbenchModel as GLTF;
    const showbenchModel = resourceManager.items.showbenchModel as GLTF;
    const potModel = resourceManager.items.potModel as GLTF;

    const scene = gameManager.scene;

    workbenchModel.scene.position.z = 7.5;
    showbenchModel.scene.position.z = -4.5;

    scene.add(greenhouseModel.scene);
    scene.add(workbenchModel.scene);
    scene.add(showbenchModel.scene);
    scene.add(potModel.scene);

    gameManager.updateAllObjectMaterials();
  }
}

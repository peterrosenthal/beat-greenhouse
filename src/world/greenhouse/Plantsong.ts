import * as THREE from 'three';
import { GLTF } from 'three/examples/jsm/loaders/GLTFLoader';
import * as ResourceManager from '../../managers/resourceManager/resourceManager';
import * as GameManager from '../../managers/gameManager';
import * as PlantGenerator from '../../generators/plantGenerator/plantGenerator';
import Plant from '../../generators/plantGenerator/Plant';

export default class Plantsong {
  encoding: Float32Array;

  plant: Plant;
  object: THREE.Group;
  pot: THREE.Group;

  constructor(encoding: Float32Array, position = new THREE.Vector3()) {
    this.encoding = encoding;

    const parameters = PlantGenerator.getParametersFromLatentSpaceVector(this.encoding);
    this.plant = PlantGenerator.generatePlant(parameters);

    this.pot = (ResourceManager.items.potModel as GLTF).scene.clone();
    this.pot.scale.set(0.8, 0.8, 0.8);

    this.object = new THREE.Group();
    this.object.add(this.pot, this.plant.object);
    this.object.position.copy(position);
    GameManager.scene.add(this.object);
  }
}

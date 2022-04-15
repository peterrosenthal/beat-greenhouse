import * as THREE from 'three';
import { GLTF } from 'three/examples/jsm/loaders/GLTFLoader';
import * as ResourceManager from '../../managers/resourceManager/resourceManager';
import * as GameManager from '../../managers/gameManager';
import * as PlantGenerator from '../../generators/plantGenerator/plantGenerator';
import * as PlayerController from '../playerController/playerController';
import * as Greenhouse from './greenhouse';
import * as GenesisMachine from './machines/genesisMachine';
import * as InterpreterMachine from './machines/interpreterMachine';
import * as CombinatorMachine from './machines/combinatorMachine';
import Plant from '../../generators/plantGenerator/Plant';

export default class Plantsong {
  encoding: Float32Array;

  plant?: Plant;
  object: THREE.Group;
  pot: THREE.Group;

  constructor(encoding: Float32Array, position = new THREE.Vector3()) {
    this.encoding = encoding;

    const parameters = PlantGenerator.getParametersFromEncoding(this.encoding);
    PlantGenerator.generatePlant(parameters).then(this.setPlant.bind(this));

    this.pot = (ResourceManager.items.potModel as GLTF).scene.clone();
    this.pot.scale.set(0.8, 0.8, 0.8);

    this.object = new THREE.Group();
    this.object.add(this.pot);
    this.object.position.copy(position);
    GameManager.scene.add(this.object);
  }

  public highlight(): void {
    if (CombinatorMachine.combining) {
      for (const plansong of CombinatorMachine.plantsongs) {
        if (plansong === this) {
          return;
        }
      }
    }
    GameManager.highlightedObjects.push(this.object);
  }

  public pickUp(): void {
    if (!(PlayerController.plantsong instanceof Plantsong)) {
      if (GenesisMachine.plantsong === this) {
        GenesisMachine.setPlantsong(undefined);
      }
      if (InterpreterMachine.plantsong === this) {
        InterpreterMachine.setPlantsong(undefined);
      }
      for (let i = 0; i < CombinatorMachine.plantsongs.length; i++) {
        if (CombinatorMachine.plantsongs[i] === this) {
          if (CombinatorMachine.combining) {
            return;
          }
          CombinatorMachine.setPlantsong(i, undefined);
        }
      }
      for (const bench of Greenhouse.allBenches) {
        bench.checkPlantsongsForRemoval(this);
      }
      PlayerController.setPlantsong(this);
    }
  }

  public dispose(): void {
    this.object.removeFromParent();
    this.plant?.dispose();
    Greenhouse.filterPlantsongs(this);
  }

  private setPlant(plant: Plant) {
    this.plant = plant;
    this.object.add(this.plant.object);
  }
}

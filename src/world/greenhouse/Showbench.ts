import * as THREE from 'three';
import * as PlantGenerator from '../../generators/plantGenerator/plantGenerator';
import Bench from './Bench';
import Plantsong from './Plantsong';

export default class Showbench extends Bench {
  plantsongs: Array<Plantsong | undefined>;

  constructor(parent: THREE.Group, position: THREE.Vector3) {
    super(parent, position);

    this.setObjectFromResources('showbenchModel');
    this.object.scale.set(0.78, 0.78, 0.78);

    this.selectionHighlight.scale.set(2.6, 2.6, 2.6);

    this.plantsongs = [undefined, undefined, undefined, undefined, undefined, undefined];
  }

  override onBenchHover(intersectLocation: THREE.Vector3): void {
    if (intersectLocation.x < -1.75) {
      if (intersectLocation.z < -1.2) {
        this.selectionHighlight.position.set(-3.75, 2.692, -2.5);
      } else {
        this.selectionHighlight.position.set(-3.75, 1.5, 0);
      }
    } else if (intersectLocation.x < 1.75) {
      if (intersectLocation.z < -1.2) {
        this.selectionHighlight.position.set(0, 2.692, -2.5);
      } else {
        this.selectionHighlight.position.set(0, 1.5, 0);
      }
    } else {
      if (intersectLocation.z < -1.2) {
        this.selectionHighlight.position.set(3.75, 2.692, -2.5);
      } else {
        this.selectionHighlight.position.set(3.75, 1.5, 0);
      }
    }
    this.object.add(this.selectionHighlight);
  }

  override onBenchClick(intersectionLocation: THREE.Vector3): void {
    let index = intersectionLocation.x < 1.75 ? intersectionLocation.x < -1.75 ?
      0 : 1 : 2;
    index += intersectionLocation.z < -1.2 ? 3 : 0;
    if (this.plantsongs[index] === undefined) {
      const latentSpaceVector = PlantGenerator.generateRandomLatentSpaceVector();
      const position = intersectionLocation.x < 1.75 ? intersectionLocation.x < -1.75 ?
        new THREE.Vector3(-3.75, 1.5, 0):
        new THREE.Vector3(0, 1.5, 0):
        new THREE.Vector3(3.75, 1.5, 0);
      if (intersectionLocation.z < -1.2) {
        position.y = 2.692;
        position.z = -2.5;
      }
      this.object.localToWorld(position);
      this.plantsongs[index] = new Plantsong(latentSpaceVector, position);
    } else {
      this.plantsongs[index]?.object.removeFromParent();
      this.plantsongs[index] = undefined;
    }
  }
}

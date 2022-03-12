import * as THREE from 'three';
import * as PlantGenerator from '../../generators/plantGenerator/plantGenerator';
import Bench from './Bench';
import Plantsong from './Plantsong';

export default class Workbench extends Bench {
  plantsongs: Array<Plantsong | undefined>;

  constructor(parent: THREE.Group, position: THREE.Vector3) {
    super(parent, position);

    this.setObjectFromResources('workbenchModel');
    this.object.scale.set(0.49, 0.49, 0.49);
    
    this.selectionHighlight.scale.set(3.5, 3.5, 3.5);

    this.plantsongs = [undefined, undefined];
  }

  override onBenchHover(intersectLocation: THREE.Vector3): void {
    this.selectionHighlight.position.set(intersectLocation.x < 0 ? -3 : 3, 2.5, 0);
    this.object.add(this.selectionHighlight);
  }

  override onBenchClick(intersectionLocation: THREE.Vector3): void {
    const index = intersectionLocation.x < 0 ? 0 : 1;
    const plantsong = this.plantsongs[index];
    if (plantsong === undefined) {
      const latentSpaceVector = PlantGenerator.generateRandomLatentSpaceVector();
      const position = new THREE.Vector3(intersectionLocation.x < 0 ? -3 : 3, 2.5, 0);
      this.object.localToWorld(position);
      this.plantsongs[index] = new Plantsong(latentSpaceVector, position);
    } else {
      plantsong.object.removeFromParent();
      this.plantsongs[index] = undefined;
    }
  }
}

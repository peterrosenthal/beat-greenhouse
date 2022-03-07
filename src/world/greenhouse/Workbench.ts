import * as THREE from 'three';
import Bench from './Bench';

export default class Workbench extends Bench {

  constructor(parent: THREE.Group, position: THREE.Vector3) {
    super(parent, position);

    this.setObjectFromResources('workbenchModel');
    this.object.scale.set(0.49, 0.49, 0.49);
  }

  override highlightBenchSegment(intersectLocation: THREE.Vector3): void {
    if (intersectLocation.x < -0.25) {
      this.selectionHighlight.position.set(-3, 2.5, 0);
    } else if (intersectLocation.x < 0.25) {
      this.selectionHighlight.position.set(0, 2.5, 0);
    } else {
      this.selectionHighlight.position.set(3, 2.5, 0);
    }
    this.object.add(this.selectionHighlight);
  }
}

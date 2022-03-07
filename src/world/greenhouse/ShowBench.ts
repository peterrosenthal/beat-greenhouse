import * as THREE from 'three';
import Bench from './Bench';

export default class Showbench extends Bench {
  constructor(parent: THREE.Group, position: THREE.Vector3) {
    super(parent, position);

    this.setObjectFromResources('showbenchModel');
    this.object.scale.set(0.78, 0.78, 0.78);
  }

  override highlightBenchSegment(intersectLocation: THREE.Vector3): void {
    if (intersectLocation.x < -1.5) {
      if (intersectLocation.z < -1.2) {
        this.selectionHighlight.position.set(-3, 2.692, -2.5);
      } else {
        this.selectionHighlight.position.set(-3, 1.5, 0);
      }
    } else if (intersectLocation.x < 1.5) {
      if (intersectLocation.z < -1.2) {
        this.selectionHighlight.position.set(0, 2.692, -2.5);
      } else {
        this.selectionHighlight.position.set(0, 1.5, 0);
      }
    } else {
      if (intersectLocation.z < -1.2) {
        this.selectionHighlight.position.set(3, 2.692, -2.5);
      } else {
        this.selectionHighlight.position.set(3, 1.5, 0);
      }
    }
    this.object.add(this.selectionHighlight);
  }
}

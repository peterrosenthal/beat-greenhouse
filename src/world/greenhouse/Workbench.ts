import * as THREE from 'three';
import * as GameManager from '../../managers/gameManager';
import * as PlayerController from '../playerController/playerController';
import Bench from './Bench';
import Plantsong from './Plantsong';

export default class Workbench extends Bench {
  constructor(parent: THREE.Group, position: THREE.Vector3) {
    super(parent, position);

    this.setObjectFromResources('workbenchModel');
    this.object.scale.set(0.49, 0.49, 0.49);

    this.plantsongs = [undefined, undefined];
  }

  override onBenchHover(intersection: THREE.Intersection): void {
    const intersectionLocal = this.object.worldToLocal(intersection.point.clone());
    const index = intersectionLocal.x < 0 ? 0 : 1;
    if (this.plantsongs[index] instanceof Plantsong) {
      this.plantsongs[index]?.highlight();
    } else {
      GameManager.highlightedObjects.push(this.object);
    }
  }

  override onBenchClick(intersection: THREE.Intersection): void {
    const intersectionLocal = this.object.worldToLocal(intersection.point.clone());
    const index = intersectionLocal.x < 0 ? 0 : 1;
    if (this.plantsongs[index] instanceof Plantsong &&
        !(PlayerController.plantsong instanceof Plantsong)) {
      this.plantsongs[index]?.pickUp();
    } else if (!(this.plantsongs[index] instanceof Plantsong) &&
        PlayerController.plantsong instanceof Plantsong) {
      this.plantsongs[index] = PlayerController.plantsong;
      PlayerController.setPlantsong(undefined);
      const position = new THREE.Vector3(intersectionLocal.x < 0 ? -3 : 3, 2.5, 0);
      this.object.localToWorld(position);
      this.plantsongs[index]?.object.position.copy(position);
    }
  }

  override checkPlantsongsForRemoval(plantsong: Plantsong): void {
    for (let i = 0; i < this.plantsongs.length; i++) {
      if (this.plantsongs[i] === plantsong) {
        this.plantsongs[i] = undefined;
      }
    }
  }
}

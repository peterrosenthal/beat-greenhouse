import * as THREE from 'three';
import * as GameManager from '../../managers/gameManager';
import * as PlayerController from '../playerController/playerController';
import Bench from './Bench';
import Plantsong from './Plantsong';

export default class Showbench extends Bench {
  constructor(parent: THREE.Group, position: THREE.Vector3) {
    super(parent, position);

    this.setObjectFromResources('showbenchModel');
    this.object.scale.set(0.78, 0.78, 0.78);

    this.plantsongs = [undefined, undefined, undefined, undefined, undefined, undefined];
  }

  override onBenchHover(intersection: THREE.Intersection): void {
    const intersectionLocal = this.object.worldToLocal(intersection.point.clone());
    let index = intersectionLocal.x < 1.75 ? intersectionLocal.x < -1.75 ?
      0 : 1 : 2;
    index += intersectionLocal.z < -1.2 ? 3 : 0;
    if (this.plantsongs[index] instanceof Plantsong) {
      this.plantsongs[index]?.highlight();
    } else {
      GameManager.highlightedObjects.push(this.object);
    }
  }

  override onBenchClick(intersection: THREE.Intersection): void {
    const intersectionLocal = this.object.worldToLocal(intersection.point.clone());
    let index = intersectionLocal.x < 1.75 ? intersectionLocal.x < -1.75 ?
      0 : 1 : 2;
    index += intersectionLocal.z < -1.2 ? 3 : 0;
    if (this.plantsongs[index] instanceof Plantsong &&
        !(PlayerController.plantsong instanceof Plantsong)) {
      this.plantsongs[index]?.pickUp();
    } else if (!(this.plantsongs[index] instanceof Plantsong) &&
        PlayerController.plantsong instanceof Plantsong) {
      this.plantsongs[index] = PlayerController.plantsong;
      PlayerController.setPlantsong(undefined);
      const position = intersectionLocal.x < 1.75 ? intersectionLocal.x < -1.75 ?
        new THREE.Vector3(-3.75, 1.5, 0):
        new THREE.Vector3(0, 1.5, 0):
        new THREE.Vector3(3.75, 1.5, 0);
      if (intersectionLocal.z < -1.2) {
        position.y = 2.692;
        position.z = -2.5;
      }
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

import * as THREE from 'three';
import * as ResourceManager from '../../managers/resourceManager/resourceManager';
import { GLTF } from 'three/examples/jsm/loaders/GLTFLoader';
import Plantsong from './Plantsong';

export default class Bench {
  parent: THREE.Group;
  position: THREE.Vector3;
  object: THREE.Object3D;
  plantsongs: Array<Plantsong | undefined>;

  constructor(parent: THREE.Group, position: THREE.Vector3) {
    this.parent = parent;
    this.position = position;

    this.object = new THREE.Mesh(new THREE.BoxGeometry(), new THREE.MeshBasicMaterial());
    this.object.position.copy(this.position);
    this.parent.add(this.object);

    this.plantsongs = [];
  }

  update(): void {
    // this method does nothing by default, but can be override by inherited classes
  }

  onBenchHover(intersection: THREE.Intersection): void {
    // this method does nothing by default, needs to be overridden by inherited classes
    console.log(intersection);
  }

  onBenchClick(intersection: THREE.Intersection): void {
    // this method does nothing by default, needs to be overriden by inherited classses
    console.log(intersection);
  }

  checkPlantsongsForRemoval(plantsong: Plantsong): void {
    // this method does nothing by default, needs to be overridden by inherited classes
    console.log(plantsong);
  }

  protected setObjectFromResources(resource: string): void {
    this.object.removeFromParent();
    if (this.object instanceof THREE.Mesh
     && this.object.material instanceof THREE.MeshBasicMaterial) {
      this.object.material.dispose();
      this.object.geometry.dispose();
    }
    this.object = (ResourceManager.items[resource] as GLTF).scene.clone();
    this.object.position.copy(this.position);
    this.parent.add(this.object);
  }
}

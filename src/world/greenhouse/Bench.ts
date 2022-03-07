import * as THREE from 'three';
import * as ResourceManager from '../../managers/resourceManager/resourceManager';
import { GLTF } from 'three/examples/jsm/loaders/GLTFLoader';

export default class Bench {
  parent: THREE.Group;
  position: THREE.Vector3;
  object: THREE.Object3D;
  selectionHighlight: THREE.Mesh;

  constructor(parent: THREE.Group, position: THREE.Vector3) {
    this.parent = parent;
    this.position = position;

    this.object = new THREE.Mesh(new THREE.BoxGeometry(), new THREE.MeshBasicMaterial());
    this.object.position.copy(this.position);
    this.parent.add(this.object);

    const selectionHighlightMaterial = new THREE.MeshBasicMaterial({
      color: 0x45fc8a,
      alphaMap: ResourceManager.items.selectionAlpha as THREE.Texture,
      side: THREE.DoubleSide,
    });
    selectionHighlightMaterial.transparent = true;
    this.selectionHighlight = new THREE.Mesh(
      new THREE.PlaneGeometry(),
      selectionHighlightMaterial,
    );
    this.selectionHighlight.rotation.x = -Math.PI / 2;
    this.selectionHighlight.scale.set(3.5, 3.5, 3.5);
  }

  update(): void {
    this.selectionHighlight.removeFromParent();
  }

  highlightBenchSegment(intersectLocation: THREE.Vector3): void {
    // this method does nothing by default, needs to be overridden by children
    console.log(intersectLocation);
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

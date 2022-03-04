import * as THREE from 'three';
import PlantParameters from './parameters/PlantParameters';
import PlantNode from './PlantNode';

export default class Plant {
  nodes: PlantNode[];
  parameters: PlantParameters;
  object: THREE.Group;

  constructor(nodes: PlantNode[], parameters: PlantParameters) {
    this.nodes = nodes;
    this.parameters = parameters;
    this.object = new THREE.Group();

    // branches and stems
    const cylinders = new THREE.Group();
    this.object.add(cylinders);

    // TODO: add color and roughness to plant parameters
    const branchMaterial = new THREE.MeshStandardMaterial({
      color: 0x6c441a,
      roughness: 0.8,
    });

    for (const node of this.nodes) {
      for (const child of node.children) {
        const geometry = new THREE.CylinderGeometry(
          child.radius,
          node.radius,
          this.parameters.growth.reach,
          64,
        );
        const cylinder = new THREE.Mesh(geometry, branchMaterial);
        const direction3d = child.position
          .clone()
          .sub(node.position)
          .normalize();
        const direction2d = new THREE.Vector3(direction3d.x, 0, direction3d.z).normalize();
        const position = node.position
          .clone()
          .add(child.position)
          .divideScalar(2);
        cylinder.rotateY(
          (direction2d.z <= 0 ? 1 : -1)
          * direction2d.angleTo(new THREE.Vector3(1, 0, 0)) + Math.PI / 2
        );
        cylinder.rotateX(direction3d.angleTo(new THREE.Vector3(0, 1, 0)));
        cylinder.position.copy(position);
        cylinders.add(cylinder);
      }
    }

    // leaves
    const leaves = new THREE.Group();
    this.object.add(leaves);

    // TODO: add leaf color and roughness to plant parameters
    const leafGeometry = new THREE.SphereGeometry(1, 32, 32);
    const leafMaterial = new THREE.MeshStandardMaterial({
      color: 0x35824a,
    });

    for (const node of this.nodes) {
      const parent = node.parent?.position ?? new THREE.Vector3();
      const child = node.children[0]?.position ?? new THREE.Vector3();
      for (const leaf of node.leaves) {
        const leafMesh = new THREE.Mesh(leafGeometry, leafMaterial);
        leafMesh.position.set(0, 1, 0);
        const leafParent = new THREE.Group();
        const direction3d = child
          .clone()
          .sub(node.position)
          .normalize();
        const direction2d = new THREE.Vector3(direction3d.x, 0, direction3d.z).normalize();
        const position = parent
          .clone()
          .lerp(node.position, leaf.height);
        leafParent.rotateY(
          (direction2d.z <= 0 ? 1 : -1)
          * direction2d.angleTo(new THREE.Vector3(1, 0, 0)) + Math.PI / 2
        );
        leafParent.rotateX(direction3d.angleTo(new THREE.Vector3(0, 1, 0)));
        leafParent.rotateY(leaf.theta);
        leafParent.rotateX(leaf.psi);
        leafParent.position.copy(position);
        leafParent.scale.set(leaf.size / 2, leaf.size, leaf.size / 10);
        leafParent.add(leafMesh);
        leaves.add(leafParent);
      }
    }
  }
}

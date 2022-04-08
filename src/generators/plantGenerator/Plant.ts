import * as THREE from 'three';
import * as BufferGeometryUtils from 'three/examples/jsm/utils/BufferGeometryUtils.js';
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
    const branches = new THREE.Group();
    this.object.add(branches);

    // TODO: add color and roughness to plant parameters
    const branchMaterial = new THREE.MeshStandardMaterial({
      color: 0x6c441a,
      roughness: 0.8,
      side: THREE.DoubleSide,
    });

    // render the branches of the plant
    // starting by finding the root node of the tree
    let root: PlantNode | undefined;
    for (const node of this.nodes) {
      if (node.parent === undefined) {
        root = node;
        break;
      }
    }
    if (root === undefined) {
      console.error('cannot render plant geometry because couldn\'t find root node.');
      return;
    }
    // using the root node, we draw branches down towards it from the tips of the plant
    // and continually merge the geometry in on itself as we go
    let branchGeometry: THREE.BufferGeometry | undefined;
    for (const node of this.nodes) {
      if (node.children.length === 0) {
        branchGeometry = this.generateBranchGeometry(node, root, branchGeometry);
      }
    }
    const branch = new THREE.Mesh(branchGeometry, branchMaterial);
    branches.add(branch);

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
          (direction2d.z <= 0 ? 1 : -1) *
          direction2d.angleTo(new THREE.Vector3(1, 0, 0)) + Math.PI / 2
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

  public dispose(): void {
    this.object.removeFromParent();
    this.object.traverse(function(child: THREE.Object3D) {
      if (child instanceof THREE.Mesh) {
        child.geometry.dispose();
        if (child.material instanceof THREE.Material) {
          child.material.dispose();
        } else {
          for (const material of child.material) {
            material.dispose();
          }
        }
      }
    });
  }

  private generateBranchGeometry(
    first: PlantNode,
    last: PlantNode,
    existingGeometry: THREE.BufferGeometry | undefined,
  ): THREE.BufferGeometry {
    // start by filling out the points array
    const points: THREE.Vector3[] = [];
    points.push(first.position);

    let previous = first;
    let current = first.parent!;
    let renderLast = true;
    while (current !== last) {
      const direction3d = previous.position
        .clone()
        .sub(current.position)
        .normalize();
      const direction2d = direction3d
        .clone()
        .setY(0)
        .normalize();

      const yAxis = new THREE.Vector3(0, 1, 0);
      const rAxis = direction2d
        .clone()
        .applyAxisAngle(yAxis, Math.PI / 4);
      const phi = direction3d.angleTo(yAxis);

      // push to points array
      for (let i = 0; i < 8; i++) {
        const theta = (Math.PI / 4) * i;
        const point = new THREE.Vector3(
          current.radius * Math.cos(theta),
          0,
          current.radius * Math.sin(theta),
        );
        point.applyAxisAngle(rAxis, phi);
        point.add(current.position);
        points.push(point);
      }
      previous = current;
      current = current.parent!;

      direction3d
        .copy(previous.position)
        .sub(current.position)
        .normalize();
      direction2d
        .copy(direction3d)
        .setY(0)
        .normalize();
      const nextPhi = direction3d.angleTo(yAxis);
      if (Math.abs(phi - nextPhi) > Math.PI / 3)  {
        renderLast = false;
        break;
      }
    }
    if (renderLast) {
    // we also need to add the points one last time now that 'current' === 'last'
      for (let i = 0; i < 8; i++) {
      // TODO: correct these points for the angle the branch is branching at
        const theta = (Math.PI / 4) * i;
        points.push(new THREE.Vector3(
          current.position.x + current.radius * Math.cos(theta),
          current.position.y,
          current.position.z + current.radius * Math.sin(theta),
        ));
      }
    }

    // now that our points array is filled up, we can use it to create our positions array
    const positions = new Float32Array((points.length - 9) * 18 + 72);
    // start with the top layer, all triangles include points[0]
    for (let i = 0; i < 8; i++) {
      const index = i * 9;

      // triangle top center
      positions[index + 0] = points[0].x;
      positions[index + 1] = points[0].y;
      positions[index + 2] = points[0].z;

      // triangle bottom right
      positions[index + 3] = points[i + 1].x;
      positions[index + 4] = points[i + 1].y;
      positions[index + 5] = points[i + 1].z;

      // triangle bottom left
      positions[index + 6] = points[(i + 1) % 8 + 1].x;
      positions[index + 7] = points[(i + 1) % 8 + 1].y;
      positions[index + 8] = points[(i + 1) % 8 + 1].z;
    }
    // the rest of the rows are the same, twice as many triangles are needed per i
    for (let i = 1; i < points.length - 15; i += 8) {
      for (let j = i; j < i + 7; j++) {
        const index = 54 + j * 18;

        // triangle top left
        positions[index + 0] = points[j + 0].x;
        positions[index + 1] = points[j + 0].y;
        positions[index + 2] = points[j + 0].z;

        // triangle bottom right
        positions[index + 3] = points[j + 8].x;
        positions[index + 4] = points[j + 8].y;
        positions[index + 5] = points[j + 8].z;

        // triangle bottom left
        positions[index + 6] = points[j + 9].x;
        positions[index + 7] = points[j + 9].y;
        positions[index + 8] = points[j + 9].z;

        // triangle top right
        positions[index +  9] = points[j + 1].x;
        positions[index + 10] = points[j + 1].y;
        positions[index + 11] = points[j + 1].z;

        // triangle bottom right
        positions[index + 12] = points[j + 0].x;
        positions[index + 13] = points[j + 0].y;
        positions[index + 14] = points[j + 0].z;

        // triangle top left
        positions[index + 15] = points[j + 9].x;
        positions[index + 16] = points[j + 9].y;
        positions[index + 17] = points[j + 9].z;
      }
      const index = 180 + i * 18;

      // triangle top left
      positions[index + 0] = points[i + 7].x;
      positions[index + 1] = points[i + 7].y;
      positions[index + 2] = points[i + 7].z;

      // triangle bottom right
      positions[index + 3] = points[i + 15].x;
      positions[index + 4] = points[i + 15].y;
      positions[index + 5] = points[i + 15].z;

      // triangle bottom left
      positions[index + 6] = points[i + 8].x;
      positions[index + 7] = points[i + 8].y;
      positions[index + 8] = points[i + 8].z;

      // triangle top right
      positions[index +  9] = points[i + 0].x;
      positions[index + 10] = points[i + 0].y;
      positions[index + 11] = points[i + 0].z;

      // triangle bottom right
      positions[index + 12] = points[i + 7].x;
      positions[index + 13] = points[i + 7].y;
      positions[index + 14] = points[i + 7].z;

      // triangle top left
      positions[index + 15] = points[i + 8].x;
      positions[index + 16] = points[i + 8].y;
      positions[index + 17] = points[i + 8].z;
    }

    // use the generated positions array to create and return a geometry
    let geometry = new THREE.BufferGeometry();
    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geometry = BufferGeometryUtils.mergeVertices(geometry);
    geometry.computeVertexNormals();
    geometry.computeBoundingBox();
    geometry.normalizeNormals();
    if (existingGeometry instanceof THREE.BufferGeometry) {
      geometry = BufferGeometryUtils.mergeBufferGeometries([ geometry, existingGeometry ]);
      geometry = BufferGeometryUtils.mergeVertices(geometry);
      geometry.computeVertexNormals();
      geometry.computeBoundingBox();
      geometry.normalizeNormals();
    }
    return geometry;
  }
}

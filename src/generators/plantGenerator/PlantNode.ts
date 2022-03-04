import Leaf from './Leaf';

interface PlantNode {
  parent?: PlantNode,
  children: PlantNode[],
  position: THREE.Vector3,
  attractors: THREE.Vector3[],
  radius: number,
  leaves: Leaf[],
}

export default PlantNode;

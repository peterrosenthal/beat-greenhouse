import Vector3Primitive from './Vector3Primitive';
import Leaf from '../Leaf';

interface PlantNodePrimitive {
  parent?: PlantNodePrimitive,
  children: PlantNodePrimitive[],
  position: Vector3Primitive,
  attractors: Vector3Primitive[],
  radius: number,
  leaves: Leaf[],
}

export default PlantNodePrimitive;

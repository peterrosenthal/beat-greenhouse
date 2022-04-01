import PlantPrimitive from '../../../../generators/plantGenerator/primitives/PlantPrimitive';

interface CombinePlantsongsResponse {
  namespace: string,
  plantPrimitives: PlantPrimitive[],
}

function isCombinePlantsongsResponse(object: Record<string, unknown>): boolean {
  return 'namespace' in object
      && 'plantPrimitives' in object;
}

export { CombinePlantsongsResponse, isCombinePlantsongsResponse };

import PlantsongPrimitive from './PlantsongPrimitive';

interface CombinePlantsongsResponse {
  namespace: string,
  plantsongPrimitives: PlantsongPrimitive[],
}

function isCombinePlantsongsResponse(object: Record<string, unknown>): boolean {
  return 'namespace' in object
      && 'plantsongPrimitives' in object;
}

export { CombinePlantsongsResponse, isCombinePlantsongsResponse };

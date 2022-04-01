import MusicParameters from '../../../../generators/musicGenerator/musicParameters';

interface CombinePlantsongsRequest {
  namespace: string,
  encodingA: Float32Array,
  encodingB: Float32Array,
  parameters: MusicParameters,
}

function isCombinePlantsongsRequest(object: Record<string, unknown>): boolean {
  return 'namespace' in object
      && 'encodingA' in object
      && 'encodingB' in object
      && 'parameters' in object;
}

export { CombinePlantsongsRequest, isCombinePlantsongsRequest };

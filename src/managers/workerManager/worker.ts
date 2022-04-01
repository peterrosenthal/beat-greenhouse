import * as PlantGenerator from '../../generators/plantGenerator/plantGenerator';
import * as MusicGenerator from '../../generators/musicGenerator/musicGenerator';
import { CombinePlantsongsRequest, isCombinePlantsongsRequest }
  from './messages/CombinePlantsongs/CombinePlantsongsRequest';
import { CombinePlantsongsResponse }
  from './messages/CombinePlantsongs/CombinePlantsongsResponse';
import PlantPrimitive from '../../generators/plantGenerator/primitives/PlantPrimitive';

self.addEventListener('message', parseMessage);

function parseMessage(message: MessageEvent): void {
  console.log('can I console log in a web worker?');
  console.log(message.data);
  console.log(typeof message.data);
  if (typeof message.data === 'object') {
    if (isCombinePlantsongsRequest(message.data)) {
      console.log('isCombinePlantsongsRequest');
      const data = message.data as CombinePlantsongsRequest;
      combinePlantsongs(data);
    }
  } else if (typeof message.data === 'string') {
    const data = message.data as string;
    self.postMessage('recieved "' + data + '" from main thread!');
  }
}

async function combinePlantsongs(request: CombinePlantsongsRequest): Promise<void> {
  const namespace = request.namespace;

  // decode the plantsongs that will be combined
  const sequenceA = await MusicGenerator.decode(request.encodingA);
  const sequenceB = await MusicGenerator.decode(request.encodingB);

  // combine the sequences with the music generator
  const sequences = await MusicGenerator.combine(sequenceA, sequenceB, request.parameters);

  // encode each of the sequences into a plantsong
  const plantPrimitives: PlantPrimitive[] = [];
  for (const sequence of sequences) {
    const encoding = await MusicGenerator.encode(sequence);
    const primitive = PlantGenerator.generatePrimitive(encoding);
    plantPrimitives.push(primitive);
  }

  // create and send the response
  self.postMessage({ namespace, plantPrimitives });
}

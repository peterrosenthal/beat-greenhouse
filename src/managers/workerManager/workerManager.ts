import * as EventManager from '../eventManager/eventManager';
import { CombinePlantsongsResponse, isCombinePlantsongsResponse }
  from './messages/CombinePlantsongs/CombinePlantsongsResponse';

export const worker = new Worker('./dist/worker.js');

worker.addEventListener('message', parseMessage);
function parseMessage(message: MessageEvent): void {
  if (typeof message.data === 'object') {
    if (isCombinePlantsongsResponse(message.data)) {
      const data = message.data as CombinePlantsongsResponse;
      EventManager.triggerEvent('combine.' + data.namespace, data.plantsongPrimitives);
    }
  } else if (typeof message.data === 'string') {
    const data = message.data as string;
    console.log('recieved "' + data + '" from worker!');
  }
}

import * as EventManager from './eventManager/eventManager';

export const start = Date.now();
export let current = start;
export let elapsed = 0;
export let delta = 9;

function update(): void {
  const now = Date.now();
  delta = now - current;
  elapsed = now - start;
  current = now;

  EventManager.triggerEvent('update');

  window.requestAnimationFrame(update);
}

export function init(): void {
  window.requestAnimationFrame(update);
}

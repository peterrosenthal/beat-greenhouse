import * as EventManager from './eventManager/eventManager';

export let width = window.innerWidth;
export let height = window.innerHeight;
export let pixelRatio = Math.min(window.devicePixelRatio, 2);
export let aspectRatio = width / height;

function resize(): void {
  width = window.innerWidth;
  height = window.innerHeight;
  pixelRatio = Math.min(window.devicePixelRatio, 2);
  aspectRatio = width / height;

  EventManager.triggerEvent('resize');
}

export function init(): void {
  window.addEventListener('resize', resize);
}

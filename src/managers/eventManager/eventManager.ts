/* eslint-disable @typescript-eslint/no-explicit-any */
import EventName from './EventName';

const callbacks :Record<string, Record<string, Array<(...args: unknown[]) => unknown>>> = {};
callbacks.base = {};

function resolveNames(names: string): string[] {
  return names
    .replace(/[^a-zA-Z0-9 ,/.]/g, '')
    .replace(/[,/]+/g, ' ')
    .split(' ');
}

function resolveName(name: string): EventName {
  const splits = name.split('.');
  return {
    original: name,
    value: splits[0],
    namespace: (splits.length > 1 && splits[1] !== '') ? splits[1] : 'base',
  };
}

export function addEventListener(
  _names: string,
  callback: (...args: any[]) => unknown,
): boolean {
  if (_names === '') {
    console.warn('Cannot add event listener; invalid event name(s) parameter.');
    return false;
  }
  if (callback === undefined) {
    console.warn('Cannot add event listener; invalid callback parameter.');
    return false;
  }

  const names = resolveNames(_names);

  for (const _name of names) {
    const name = resolveName(_name);

    // create namespace if it doesn't already exist
    if (!(callbacks[name.namespace] instanceof Object)) {
      callbacks[name.namespace] = {};
    }

    // create callback if it doesn't already exist
    if (!(callbacks[name.namespace][name.value] instanceof Array)) {
      callbacks[name.namespace][name.value] = [];
    }

    // add callback
    callbacks[name.namespace][name.value].push(callback);
  }

  return true;
}

export function clearEventLisntener(_names: string): boolean {
  if (_names === '') {
    console.warn('Cannot clear event listener; invalid event name(s) parameter.');
    return false;
  }

  const names = resolveNames(_names);

  for (const _name of names) {
    const name = resolveName(_name);

    if (name.namespace !== 'base' && name.value === '') {
      // remove all callbacks in namespace
      delete callbacks[name.namespace];
    } else if (name.namespace === 'base') {
      // remove all callbacks for this event name from all namespaces
      for (const namespace in callbacks) {
        if (callbacks[namespace] instanceof Object
         && callbacks[namespace][name.value] instanceof Array) {
          delete callbacks[namespace][name.value];

          // remove namespace if empty
          if (Object.keys(callbacks[namespace]).length === 0
           && namespace !== 'base') {
            delete callbacks[namespace];
          }
        }
      }
    } else if (callbacks [name.namespace] instanceof Object
            && callbacks [name.namespace][name.value] instanceof Array) {
      // remove all callbacks for this event name from just the specified namespace
      delete callbacks[name.namespace][name.value];

      // remove namespace if empty
      if (Object.keys(callbacks[name.namespace]).length === 0
       && name.namespace !== 'base') {
        delete callbacks[name.namespace];
      }
    }
  }

  return true;
}

export function removeEventListener(
  _names: string,
  callback: (...args: unknown[]) => unknown,
): boolean {
  if (_names === '') {
    console.warn('Cannot remove event listener; invalid event name(s) parameter.');
    return false;
  }
  if (callback === undefined) {
    console.warn('Cannot remove event listener; invalid callback parameter.');
    return false;
  }

  const names = resolveNames(_names);

  for (const _name of names) {
    const name = resolveName(_name);

    if (name.value === '') {
      console.warn('Cannot remove event listener; invalid name parameter.');
      return false;
    }

    if (name.namespace === 'base') {
      // remove specific callback for this event name from all namespaces
      for (const namespace in callbacks) { 
        if (callbacks[namespace] instanceof Object
         && callbacks[namespace][name.value] instanceof Array) {
          callbacks[namespace][name.value] =
            callbacks[namespace][name.value].filter(call => call !== callback);

          // remove event name if no more callbacks present
          if (callbacks[namespace][name.value].length === 0) {
            delete callbacks[namespace][name.value];
          }

          // remove namespace if no more event names present
          if (Object.keys(callbacks[namespace]).length === 0) {
            delete callbacks[namespace];
          }
        }
      }
    } else if (callbacks[name.namespace] instanceof Object
            && callbacks[name.namespace][name.value] instanceof Array) {
      // remove specific callback for this event name from specific namespace
      callbacks[name.namespace][name.value] =
        callbacks[name.namespace][name.value].filter(call => call !== callback);

      // remove event name if no more callbacks present
      if (callbacks[name.namespace][name.value].length === 0) {
        delete callbacks[name.namespace][name.value];
      }

      // remove namespace if no more event names present
      if (Object.keys(callbacks[name.namespace]).length === 0) {
        delete callbacks[name.namespace];
      }
    }
  }

  return true;
}

export function triggerEvent(_name: string, ..._args: unknown[]): unknown {
  if (_name === '') {
    console.warn('Cannot trigger event; invalid name parameter');
    return undefined;
  }

  // resolve name
  const names = resolveNames(_name);
  const name = resolveName(names[0]);
  if (name.value === '') {
    console.warn('Cannot trigger event; invalid name parameter');
    return undefined;
  }

  // default args
  const args = _args instanceof Array ? _args : [];
  
  // variable to store the result in
  let result: unknown = undefined;

  // trigger event
  if (name.namespace === 'base') {
    // trigger the callback in every namespace it is tied to an event in
    for (const namespace in callbacks) {
      if (callbacks[namespace] instanceof Object
       && callbacks[namespace][name.value] instanceof Array) {
        for (const callback of callbacks[namespace][name.value]) {
          if (result === undefined) {
            result = callback(...args);
          }
        }
      }
    }
  } else if (callbacks[name.namespace] instanceof Object
   && callbacks[name.namespace][name.value] instanceof Array) {
    for (const callback of callbacks[name.namespace][name.value]) {
      if (result === undefined) {
        result = callback(...args);
      }
    }
  }

  return result;
}

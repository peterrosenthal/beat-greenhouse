interface EventName {
  original: string,
  value: string,
  namespace: string,
}

export default class EventEmitter {
  private callbacks: Record<string, Record<
    string, Array<(...args: unknown[]) =>  unknown>>>;

  constructor() {
    this.callbacks = { base: {} };
  }

  resolveNames(names: string): string[] {
    return names
      .replace(/[^a-zA-Z0-9 ,/.]/g, '')
      .replace(/[,/]+/g, ' ')
      .split(' ');
  }

  resolveName(name: string): EventName {
    const splits = name.split('.');
    return {
      original: name,
      value: splits[0],
      namespace: (splits.length > 1 && splits[1] !== '') ? splits[1] : 'base',
    };
  }

  on(_names: string, callback: (...args: unknown[]) => unknown): EventEmitter | undefined {
    // handle errors
    if (_names === '') {
      console.warn('bad names');
      return undefined;
    }
    if (callback === undefined) {
      console.warn('bad callback');
      return undefined;
    }

    // resolve names
    const names = this.resolveNames(_names);

    // each name
    for (const _name of names) {
      // resolve name
      const name = this.resolveName(_name);

      // create namespace if it doesn't already exist
      if (!(this.callbacks[name.namespace] instanceof Object)) {
        this.callbacks[name.namespace] = {};
      }

      // create callback if it doesn't already exist
      if (!(this.callbacks[name.namespace][name.value] instanceof Array)) {
        this.callbacks[name.namespace][name.value] = [];
      }

      // add callback
      this.callbacks[name.namespace][name.value].push(callback);
    }

    return this;
  }

  off(_names: string): EventEmitter | undefined {
    // handle errors
    if (_names === '') {
      console.warn('bad names');
      return undefined;
    }

    // resolve names
    const names = this.resolveNames(_names);

    // each name
    for (const _name of names) {
      // resolve name
      const name = this.resolveName(_name);

      if (name.namespace !== 'base' && name.value === '') {
        // remove whitespace
        delete this.callbacks[name.namespace];
      } else {
        // remove specific callback in namespace
        if (name.namespace === 'base') {
          // default
          // try to remove from each namespace
          for (const namespace in this.callbacks) {
            if (this.callbacks[namespace] instanceof Object
             && this.callbacks[namespace][name.value] instanceof Array) {
              delete this.callbacks[namespace][name.value];

              // remove namespace if empty
              if (Object.keys(this.callbacks[namespace]).length === 0) {
                delete this.callbacks[namespace];
              }
            }
          }
        } else if (this.callbacks[name.namespace] instanceof Object
                && this.callbacks[name.namespace][name.value] instanceof Array) {
          // just remove from specified namespace
          delete this.callbacks[name.namespace][name.value];

          // remove namespace if empty
          if (Object.keys(this.callbacks[name.namespace]).length === 0) {
            delete this.callbacks[name.namespace];
          }
        }
      }
    }

    return this;
  }

  trigger(_name: string, ..._args: unknown[]): unknown {
    // handle errors
    if (_name === '') {
      console.warn('bad name');
      return undefined;
    }

    // default args
    const args = !(_args instanceof Array) ? [] : _args;

    let finalResult: unknown = null;
    let result: unknown = null;

    // resolve names (should only have one event name)
    const names = this.resolveNames(_name);
    // resolve name
    const name = this.resolveName(names[0]);
    if (name.value === '') {
      console.warn('bad name');
      return this;
    }

    // trigger event
    if (name.namespace === 'base') {
      // default namespace
      for (const namespace in this.callbacks) {
        // try to find callback in each namespace
        if (this.callbacks[namespace] instanceof Object
         && this.callbacks[namespace][name.value] instanceof Array) {
          for (const callback of this.callbacks[namespace][name.value]) {
            result = callback.apply(this, args);
            
            if (finalResult === null || finalResult === undefined) {
              finalResult = result;
            }
          }
        }
      }
    } else if (this.callbacks[name.namespace] instanceof Object
            && this.callbacks[name.namespace][name.value] instanceof Array) {
      // specific namespace
      for (const callback of this.callbacks[name.namespace][name.value]) {
        result = callback.apply(this, args);

        if (finalResult === null || finalResult === undefined) {
          finalResult = result;
        }
      }
    }

    return finalResult;
  }
}

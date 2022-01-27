import EventEmitter from '../Utils/EventEmitter';

export default class TimeManager extends EventEmitter {
  private static S?: TimeManager;
  static getInstance(): TimeManager {
    if (!(this.S instanceof TimeManager)) {
      this.S = new TimeManager();
    }
    return this.S;
  }

  start: number;
  current: number;
  elapsed: number;
  delta: number;

  private constructor() {
    super();

    this.start = Date.now();
    this.current = this.start;
    this.elapsed = 0;
    this.delta = 9;

    this.update = this.update.bind(this);
    window.requestAnimationFrame(this.update);
  }

  private update() {
    const now = Date.now();
    this.delta = now - this.current;
    this.elapsed = now - this.start;
    this.current = now;

    this.trigger('update');

    window.requestAnimationFrame(this.update);
  }
}

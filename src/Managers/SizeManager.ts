import EventEmitter from '../Utils/EventEmitter';

export default class SizeManager extends EventEmitter {
  private static S?: SizeManager;
  static getInstance(): SizeManager {
    if (!(this.S instanceof SizeManager)) {
      this.S = new SizeManager();
    }
    return this.S;
  }

  width!: number;
  height!: number;
  pixelRatio!: number;
  aspectRatio!: number;

  private constructor() {
    super();

    this.resize = this.resize.bind(this);
    this.resize();
    window.addEventListener('resize', this.resize);
  }

  private resize(): void {
    this.width = window.innerWidth;
    this.height = window.innerHeight;
    this.pixelRatio = Math.min(window.devicePixelRatio, 2);
    this.aspectRatio = window.innerWidth / window.innerHeight;

    this.trigger('resize');
  }
}

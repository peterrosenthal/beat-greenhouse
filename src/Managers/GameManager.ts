import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import * as lil from 'lil-gui';
import PlantGenerator from '../Generators/PlantGenerator';
import SizeManager from './SizeManager';
import TimeManager from './TimeManager';

export default class GameManager {
  private static S?: GameManager;
  static getInstance(): GameManager {
    if (!(this.S instanceof GameManager)) {
      this.S = new GameManager();
    }
    return this.S;
  }

  timeManager: TimeManager;
  sizeManager: SizeManager;

  scene: THREE.Scene;
  gui: lil.GUI;

  private canvas: HTMLCanvasElement;
  private camera: THREE.PerspectiveCamera;
  private controls: OrbitControls;
  private renderer: THREE.WebGLRenderer;

  private constructor() {
    // get the canvas dom element
    this.canvas = document.querySelector('canvas')!;

    // other managers that we need parallel access to
    // time manager
    this.timeManager = TimeManager.getInstance();
    this.update = this.update.bind(this);
    this.timeManager.on('update', this.update);

    this.sizeManager = SizeManager.getInstance();
    this.resize = this.resize.bind(this);
    this.sizeManager.on('resize', this.resize);

    // gui
    this.gui = new lil.GUI();

    // scene
    this.scene = new THREE.Scene();

    // camera
    this.camera = new THREE.PerspectiveCamera(
      35,
      this.sizeManager.aspectRatio,
      0.01,
      1000,
    );
    this.camera.position.set(0, 0, 4);
    this.camera.lookAt(new THREE.Vector3());

    // orbit controls
    this.controls = new OrbitControls(this.camera, this.canvas);
    this.controls.enableDamping = true;

    // renderer
    this.renderer = new THREE.WebGLRenderer({ canvas: this.canvas });
    this.renderer.setSize(this.sizeManager.width, this.sizeManager.height);
    this.renderer.setPixelRatio(this.sizeManager.pixelRatio);

    // test out plant generator
    const generator = new PlantGenerator();
    this.gui
      .add(generator, 'numAttractors')
      .name('numAttractors')
      .min(1)
      .max(10000)
      .step(1);
    this.gui
      .add(generator, 'envelopeSize')
      .name('envelopeSize')
      .min(0.01)
      .max(100)
      .step(0.01);
    this.gui
      .add(generator.envelopePosition, 'x')
      .name('envelopePositionX')
      .min(-10)
      .max(10)
      .step(0.01);
    this.gui
      .add(generator.envelopePosition, 'y')
      .name('envelopePositionY')
      .min(0)
      .max(20)
      .step(0.01);
    this.gui
      .add(generator.envelopePosition, 'z')
      .name('envelopePositionZ')
      .min(-10)
      .max(10)
      .step(0.01);
    this.gui
      .add(generator, 'numIterations')
      .name('numIterations')
      .min(0)
      .max(500)
      .step(1);
    this.gui
      .add(generator, 'attractionRadius')
      .name('attractionRadius')
      .min(0.01)
      .max(10000)
      .step(0.01);
    this.gui
      .add(generator, 'growthSpeed')
      .name('growthSpeed')
      .min(0.01)
      .max(50)
      .step(0.01);
    this.gui
      .add(generator, 'killDistance')
      .name('killDistance')
      .min(0.01)
      .max(100)
      .step(0.01);
    this.gui
      .add(generator, 'visualizeAttractors')
      .name('visualizeAttractors');
    this.gui
      .add(generator, 'visualizeNodes')
      .name('visualizeNodes');
    this.gui
      .add(generator, 'generate')
      .name('generate');
  }

  private update(): void {
    // update orbit controls
    this.controls.update();

    // render scene
    this.renderer.render(this.scene, this.camera);
  }

  private resize(): void {
    // resize camera
    this.camera.aspect = this.sizeManager.aspectRatio;
    this.camera.updateProjectionMatrix();

    // resize renderer
    this.renderer.setSize(this.sizeManager.width, this.sizeManager.height);
    this.renderer.setPixelRatio(this.sizeManager.pixelRatio);
  }
}

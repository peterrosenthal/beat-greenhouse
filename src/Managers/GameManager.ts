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
  private ambientLight: THREE.AmbientLight;
  private directionalLight: THREE.DirectionalLight;

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

    // lights
    this.ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
    this.directionalLight = new THREE.DirectionalLight(0xffffff, 0.7);
    this.directionalLight.position.set(1.5, 5, 1);
    this.scene.add(this.ambientLight, this.directionalLight);

    // test out plant generator
    const generator = new PlantGenerator();
    const envelopeFolder = this.gui.addFolder('envelope');
    envelopeFolder
      .add(generator, 'envelopeSize')
      .name('size')
      .min(0.01)
      .max(100)
      .step(0.01);
    const envelopePositionFolder = envelopeFolder.addFolder('position');
    envelopePositionFolder
      .add(generator.envelopePosition, 'x')
      .name('x')
      .min(-10)
      .max(10)
      .step(0.01);
    envelopePositionFolder
      .add(generator.envelopePosition, 'y')
      .name('x')
      .min(0)
      .max(20)
      .step(0.01);
    envelopePositionFolder
      .add(generator.envelopePosition, 'z')
      .name('x')
      .min(-10)
      .max(10)
      .step(0.01);
    const envelopeNodesFolder = envelopeFolder.addFolder('nodes');
    envelopeNodesFolder
      .add(generator.envelopeNodes, 'firstBot')
      .name('bot1')
      .min(0)
      .max(0.6)
      .step(0.001);
    envelopeNodesFolder
      .add(generator.envelopeNodes, 'secondBot')
      .name('bot2')
      .min(0)
      .max(0.6)
      .step(0.001);
    envelopeNodesFolder
      .add(generator.envelopeNodes, 'thirdBot')
      .name('bot3')
      .min(0)
      .max(0.6)
      .step(0.001);
    envelopeNodesFolder
      .add(generator.envelopeNodes, 'firstMid')
      .name('mid1')
      .min(0.4)
      .max(0.8)
      .step(0.001);
    envelopeNodesFolder
      .add(generator.envelopeNodes, 'secondMid')
      .name('mid2')
      .min(0.4)
      .max(0.8)
      .step(0.001);
    envelopeNodesFolder
      .add(generator.envelopeNodes, 'thirdMid')
      .name('mid3')
      .min(0.4)
      .max(0.8)
      .step(0.001);
    envelopeNodesFolder
      .add(generator.envelopeNodes, 'firstTop')
      .name('top1')
      .min(0.2)
      .max(1.0)
      .step(0.001);
    envelopeNodesFolder
      .add(generator.envelopeNodes, 'secondTop')
      .name('top2')
      .min(0.2)
      .max(1.0)
      .step(0.001);
    envelopeNodesFolder
      .add(generator.envelopeNodes, 'thirdTop')
      .name('top3')
      .min(0.2)
      .max(1.0)
      .step(0.001);
    const attractorsFolder = this.gui.addFolder('attractors');
    const noiseFolder = attractorsFolder.addFolder('noise source');
    const offsetFolder = noiseFolder.addFolder('offset');
    offsetFolder
      .add(generator.noiseOffset, 'x')
      .name('x')
      .min(-1000)
      .max(1000)
      .step(0.01);
    offsetFolder
      .add(generator.noiseOffset, 'y')
      .name('y')
      .min(-1000)
      .max(1000)
      .step(0.01);
    offsetFolder
      .add(generator.noiseOffset, 'z')
      .name('z')
      .min(-1000)
      .max(1000)
      .step(0.01);
    noiseFolder
      .add(generator, 'noiseScale')
      .name('scale')
      .min(0.1)
      .max(20)
      .step(0.1);
    noiseFolder
      .add(generator, 'noiseThreshold')
      .name('threshold')
      .min(0.6)
      .max(1)
      .step(0.001);
    const skewFolder = noiseFolder.addFolder('threshold skew');
    skewFolder
      .add(generator, 'noiseThresholdSkewLocation')
      .name('location')
      .min(0)
      .max(1)
      .step(0.001);
    skewFolder
      .add(generator, 'noiseThresholdSkewAmount')
      .name('amount')
      .min(-1)
      .max(1)
      .step(0.001);
    attractorsFolder
      .add(generator, 'attractionRadius')
      .name('attraction radius')
      .min(0.01)
      .max(10000)
      .step(0.01);
    attractorsFolder
      .add(generator, 'killDistance')
      .name('kill distance')
      .min(0.01)
      .max(100)
      .step(0.01);
    const growthFolder = this.gui.addFolder('growth');
    growthFolder
      .add(generator, 'numIterations')
      .name('iterations')
      .min(0)
      .max(500)
      .step(1)
      .onChange(() => generator.generate());
    growthFolder
      .add(generator, 'growthSpeed')
      .name('speed')
      .min(0.01)
      .max(50)
      .step(0.01);
    growthFolder
      .add(generator, 'thicknessGrowthFactor')
      .name('thickness fast growth')
      .min(0)
      .max(0.01)
      .step(0.00001);
    growthFolder
      .add(generator, 'slowThicknessGrowthFactor')
      .name('thickness slow growth')
      .min(0)
      .max(0.01)
      .step(0.00001);
    growthFolder
      .add(generator, 'thicknessCombinationFactor')
      .name('thickness combination factor')
      .min(0.01)
      .max(5)
      .step(0.01);
    const visualizeFolder = this.gui.addFolder('visualize');
    visualizeFolder
      .add(generator, 'visualizeEnvelope')
      .name('envelope');
    visualizeFolder
      .add(generator, 'visualizeAttractors')
      .name('attractors');
    visualizeFolder
      .add(generator, 'visualizeNodes')
      .name('nodes');
    visualizeFolder
      .add(generator, 'visualizeStems')
      .name('stems and branches');
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

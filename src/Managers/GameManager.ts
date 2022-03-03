import * as THREE from 'three';
import * as lil from 'lil-gui';
import PlantGenerator from '../Generators/PlantGenerator';
import SizeManager from './SizeManager';
import TimeManager from './TimeManager';
import Lights from '../Environment/Lights';
import Skybox from '../Environment/Skybox';
import ResourceManager from './ResourceManager/ResourceManager';
import Greenhouse from '../Greenhouse/Greenhouse';
import PlayerController from '../Player/PlayerController';

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
  canvas: HTMLCanvasElement;
  renderer: THREE.WebGLRenderer;

  // anything created in the init function must be non-null asserted
  lights!: Lights;
  skybox!: Skybox;
  playerController?: PlayerController;
  greenhouse!: Greenhouse;

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
    this.gui.hide();

    // scene
    this.scene = new THREE.Scene();

    // renderer
    this.renderer = new THREE.WebGLRenderer({ 
      canvas: this.canvas,
      antialias: true,
    });
    this.renderer.setSize(this.sizeManager.width, this.sizeManager.height);
    this.renderer.setPixelRatio(this.sizeManager.pixelRatio);
    this.renderer.physicallyCorrectLights = true;
    this.renderer.outputEncoding = THREE.sRGBEncoding;
    this.renderer.toneMapping = THREE.ReinhardToneMapping;
    this.renderer.toneMappingExposure = 2;

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
      .name('y')
      .min(0)
      .max(20)
      .step(0.01);
    envelopePositionFolder
      .add(generator.envelopePosition, 'z')
      .name('z')
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
    const leavesFolder = this.gui.addFolder('leaves');
    leavesFolder
      .add(generator, 'leafMaxBranchRadius')
      .name('max branch radius')
      .min(0)
      .max(0.8)
      .step(0.0001);
    leavesFolder
      .add(generator, 'leafSize')
      .name('size')
      .min(0.01)
      .max(1)
      .step(0.001);
    leavesFolder
      .add(generator, 'leafSeparationAngle')
      .name('angle around branch between leaves')
      .min(0)
      .max(Math.PI * 2)
      .step(0.0001);
    leavesFolder
      .add(generator, 'leafDensity')
      .name('density (leaves per node)')
      .min(0.01)
      .max(20)
      .step(0.0001);
    leavesFolder
      .add(generator, 'leafStemAngleAvg')
      .name('stem to leaf angle')
      .min(0)
      .max(Math.PI * 2)
      .step(0.0001);
    leavesFolder
      .add(generator, 'leafStemAngleVariance')
      .name('stem to leaf angle randomness')
      .min(0)
      .max(Math.PI)
      .step(0.0001);
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
    visualizeFolder
      .add(generator, 'visualizeLeaves')
      .name('leaves');
    this.gui
      .add(generator, 'generate')
      .name('generate');

    // resource manager must always be the last thing in the game manager's
    // constructor in order to avoid race condition issues
    this.init = this.init.bind(this);
    ResourceManager.getInstance().on('loaded', this.init);
  }

  updateAllObjectMaterials(): void {
    this.updateSingleObjectMaterial = this.updateSingleObjectMaterial.bind(this);
    this.scene.traverse(this.updateSingleObjectMaterial);
  }

  private updateSingleObjectMaterial(object: THREE.Object3D): void {
    if (object instanceof THREE.Mesh &&
        object.material instanceof THREE.MeshStandardMaterial) {
      object.material.envMap = this.scene.environment;
      object.material.envMapIntensity = 3;
      object.material.needsUpdate = true;
    }
  }

  private init(): void {
    // add environment to scene
    this.skybox = new Skybox();
    this.lights = new Lights();

    // create the player camera controller
    this.playerController = new PlayerController();

    // test out adding a greenhouse to the scene
    new Greenhouse();

    this.updateAllObjectMaterials();
  }

  private update(): void {
    if (this.playerController === undefined) {
      return;
    }
    
    // update player controller
    this.playerController.update();

    // render scene
    this.renderer.render(this.scene, this.playerController.camera);
  }

  private resize(): void {
    // resize player camera
    this.playerController?.resize();

    // resize renderer
    this.renderer.setSize(this.sizeManager.width, this.sizeManager.height);
    this.renderer.setPixelRatio(this.sizeManager.pixelRatio);
  }
}

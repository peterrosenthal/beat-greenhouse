// import * as THREE from 'three';
import * as THREE from 'three';
import GameManager from '../Managers/GameManager';
import ResourceManager from '../Managers/ResourceManager/ResourceManager';

export default class Skybox {
  private gameManager: GameManager;
  private resourceManager: ResourceManager;

  constructor() {
    this.gameManager = GameManager.getInstance();
    this.resourceManager = ResourceManager.getInstance();

    const scene = this.gameManager.scene;
    const renderer = this.gameManager.renderer;
    const texture = this.resourceManager.items.skyboxTexture as THREE.Texture;

    const target = new THREE.WebGLCubeRenderTarget(texture.image.height);
    target.fromEquirectangularTexture(renderer, texture);
    scene.background = target.texture;
  }
}

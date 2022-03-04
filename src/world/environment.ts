import * as THREE from 'three';
import * as GameManager from '../managers/gameManager';
import * as ResourceManager from '../managers/resourceManager/resourceManager';

export const directionalLight = new THREE.DirectionalLight(0xffffff, 3);
directionalLight.position.set(1, 1.7, 1);

export function init(): void {
  GameManager.scene.add(directionalLight);

  const texture = ResourceManager.items.skyboxTexture as THREE.Texture;
  const target = new THREE.WebGLCubeRenderTarget(texture.image.height);
  target.fromEquirectangularTexture(GameManager.renderer, texture);
  const environment: THREE.CubeTexture = target.texture;
  environment.encoding = THREE.sRGBEncoding;
  GameManager.scene.background = environment;
  GameManager.scene.environment = environment;
  GameManager.updateAllMaterials();
}

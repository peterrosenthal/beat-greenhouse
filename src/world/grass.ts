import * as THREE from 'three';
import * as ResourceManager from '../managers/resourceManager/resourceManager';
import * as GameManager from '../managers/gameManager';

const material = new THREE.MeshToonMaterial({ color: 0x2aea3c });
const grass = new THREE.Mesh(new THREE.PlaneGeometry(40, 20), material as THREE.Material);
grass.rotation.x = -Math.PI / 2;

let textureMaterial: THREE.MeshBasicMaterial | undefined;

export function init(): void {
  const texture = ResourceManager.items.grassTexture as THREE.Texture;
  texture.repeat.x = 12;
  texture.repeat.y = 6;
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  textureMaterial = new THREE.MeshBasicMaterial({ map: texture });

  GameManager.scene.add(grass);
  GameManager.updateAllMaterials();
}

export function prepareForOutlineRender(): void {
  if (!(textureMaterial instanceof THREE.Material)) {
    init();
    return;
  }
  grass.material = textureMaterial;
}

export function prepareForRegularRender(): void {
  grass.material = material;
}

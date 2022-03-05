import * as THREE from 'three';
import * as ResourceManager from '../managers/resourceManager/resourceManager';
import * as GameManager from '../managers/gameManager';

export function init(): void {
  const texture = ResourceManager.items.grassTexture as THREE.Texture;
  texture.repeat.x = 100;
  texture.repeat.y = 100;
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;

  const grass = new THREE.Mesh(
    new THREE.CircleGeometry(300),
    new THREE.MeshStandardMaterial({ map: texture }),
  );
  grass.rotation.x = -Math.PI / 2;

  GameManager.scene.add(grass);
  GameManager.updateAllMaterials();
}

import * as THREE from 'three';
import GameManager from '../Managers/GameManager';

export default class Lights {
  directional: THREE.DirectionalLight;
  ambient: THREE.AmbientLight;

  constructor() {
    this.directional = new THREE.DirectionalLight(0xffffff, 3);
    this.directional.position.set(1, 2, 1);

    this.ambient = new THREE.AmbientLight(0xffffff, 0.1);

    GameManager.getInstance().scene.add(this.directional, this.ambient);
  }
}

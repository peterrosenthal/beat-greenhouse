import * as THREE from 'three';
import GameManager from '../Managers/GameManager';

export default class Lights {
  directional: THREE.DirectionalLight;
  ambient: THREE.AmbientLight;

  constructor() {
    this.directional = new THREE.DirectionalLight(0xffffff, 0.65);
    this.directional.position.set(1.5, 5, 1);

    this.ambient = new THREE.AmbientLight(0xffffff, 0.5);

    GameManager.getInstance().scene.add(this.directional, this.ambient);
  }
}

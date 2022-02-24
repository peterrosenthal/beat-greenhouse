import * as THREE from 'three';
import { PointerLockControls } from 'three/examples/jsm/controls/PointerLockControls';
import GameManager from '../Managers/GameManager';
import SizeManager from '../Managers/SizeManager';
import TimeManager from '../Managers/TimeManager';

interface MovementState {
  forward: boolean;
  backward: boolean;
  left: boolean;
  right: boolean;
}

export default class PlayerController {
  static ACCELERATION = 30;
  static DEACCELERATION = 15;
  static MAX_SPEED = 12.5;

  private gameManager: GameManager;
  private timeManager: TimeManager;
  private sizeManager: SizeManager;

  raycaster: THREE.Raycaster;
  camera: THREE.PerspectiveCamera;
  controls: PointerLockControls;
  state: MovementState;
  velocity: THREE.Vector3;
  direction: THREE.Vector3;

  menu: HTMLDivElement;
  crosshair: HTMLDivElement;

  constructor() {
    this.gameManager = GameManager.getInstance();
    this.timeManager = TimeManager.getInstance();
    this.sizeManager = SizeManager.getInstance();

    // raycaster (not needed quite yet)
    this.raycaster = new THREE.Raycaster();

    // camera
    this.camera = new THREE.PerspectiveCamera(
      55,
      this.sizeManager.aspectRatio,
      0.01,
      1000,
    );
    this.camera.position.set(0, 2, 0);
    this.gameManager.scene.add(this.camera);
    
    // pointer lock controls
    this.controls = new PointerLockControls(this.camera, this.gameManager.canvas);
    this.gameManager.scene.add(this.controls.getObject());

    // movement state
    this.state = {
      forward: false,
      backward: false,
      left: false,
      right: false,
    };

    // velocity and direction
    this.velocity = new THREE.Vector3();
    this.direction = new THREE.Vector3();

    // dom elements
    this.menu = document.createElement('div');
    this.crosshair = document.createElement('div');

    const content = document.createElement('div');
    const title = document.createElement('h1');
    const instructions = document.createElement('p');

    title.innerText = 'Beat Greenhouse';
    instructions.innerHTML =
      'Move: WASD or arrow keys<br>Look: Move mouse<br>Press any key to play';
    content.classList.add('menu-content');
    content.appendChild(title);
    content.appendChild(instructions);

    this.menu.classList.add('pause-menu');
    this.menu.appendChild(content);

    this.crosshair.classList.add('crosshair');
    this.crosshair.innerText = '.';

    document.body.appendChild(this.menu);
    document.body.appendChild(this.crosshair);

    // bind event functions
    this.lockControls = this.lockControls.bind(this);
    this.hideMenu = this.hideMenu.bind(this);
    this.showMenu = this.showMenu.bind(this); 
    this.pushMovementState = this.pushMovementState.bind(this);
    this.filterMovementState = this.filterMovementState.bind(this);

    // add event listeners
    this.menu.addEventListener('click', this.lockControls);
    this.controls.addEventListener('lock', this.hideMenu);
    this.controls.addEventListener('unlock', this.showMenu);
    document.addEventListener('keydown', this.pushMovementState);
    document.addEventListener('keyup', this.filterMovementState);
  }

  update(): void {
    if (!this.controls.isLocked) {
      return;
    }
    
    const delta = this.timeManager.delta / 1000;

    this.direction.z = Number(this.state.forward) - Number(this.state.backward);
    this.direction.x = Number(this.state.right) - Number(this.state.left);
    this.direction.normalize();

    if (this.state.forward || this.state.backward) {
      this.velocity.z += this.direction.z * PlayerController.ACCELERATION * delta;
    } else {
      this.velocity.z -= this.velocity.z * PlayerController.DEACCELERATION * delta;
    }

    if (this.state.right || this.state.left) {
      this.velocity.x += this.direction.x * PlayerController.ACCELERATION * delta;
    } else {
      this.velocity.x -= this.velocity.x * PlayerController.DEACCELERATION * delta;
    }

    this.velocity.clampLength(0, PlayerController.MAX_SPEED);

    this.controls.moveRight(this.velocity.x * delta);
    this.controls.moveForward(this.velocity.z * delta);
  }

  resize(): void {
    this.camera.aspect = this.sizeManager.aspectRatio;
    this.camera.updateProjectionMatrix();
  }

  private lockControls(): void {
    this.controls.lock();
  }

  private hideMenu(): void {
    this.menu.style.display = 'none';
    this.crosshair.style.display = 'block';
  }

  private showMenu(): void {
    this.crosshair.style.display = 'none';
    this.menu.style.display = 'block';
  }

  private pushMovementState(event: KeyboardEvent): void {
    switch (event.code) {
      case 'ArrowUp':
      case 'KeyW':
        this.state.forward = true;
        break;
      case 'ArrowDown':
      case 'KeyS':
        this.state.backward = true;
        break;
      case 'ArrowLeft':
      case 'KeyA':
        this.state.left = true;
        break;
      case 'ArrowRight':
      case 'KeyD':
        this.state.right = true;
        break;
    }
  }

  private filterMovementState(event: KeyboardEvent): void {
    switch (event.code) {
      case 'ArrowUp':
      case 'KeyW':
        this.state.forward = false;
        break;
      case 'ArrowDown':
      case 'KeyS':
        this.state.backward = false;
        break;
      case 'ArrowLeft':
      case 'KeyA':
        this.state.left = false;
        break;
      case 'ArrowRight':
      case 'KeyD':
        this.state.right = false;
        break;
    }
  }
}

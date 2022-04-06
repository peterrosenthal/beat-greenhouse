import * as mm from '@magenta/music/es6';
import * as THREE from 'three';
import { GLTF } from 'three/examples/jsm/loaders/GLTFLoader';
import * as MusicGenerator from '../../../generators/musicGenerator/musicGenerator';
import * as GameManager from '../../../managers/gameManager';
import * as ResourceManager from '../../../managers/resourceManager/resourceManager';
import * as PlayerController from '../../playerController/playerController';
import * as Greenhouse from '../greenhouse';
import Plantsong from '../Plantsong';

export const object = new THREE.Group();

export let plantsong: Plantsong | undefined;

const fileReader = new FileReader();
fileReader.addEventListener('load', onFileReaderLoad);

const menu = document.createElement('div');
menu.classList.add('import-menu');
menu.style.display = 'none';
document.body.appendChild(menu);

const closeButton = document.createElement('button');
closeButton.classList.add('import-menu-close-button');
closeButton.innerText = 'Close the Genesis Machine';
closeButton.addEventListener('click', PlayerController.lockControls);
menu.appendChild(closeButton);

const content = document.createElement('div');
content.classList.add('import-menu-content');
menu.appendChild(content);

const label = document.createElement('label');
label.innerText = 'Select file to upload or drag and drop';
label.htmlFor = 'file-input';
content.appendChild(label);

const fileInput = document.createElement('input');
fileInput.style.display = 'none';
fileInput.type = 'file';
fileInput.id = label.htmlFor;
fileInput.name = label.htmlFor;
fileInput.addEventListener('change', onFileInputChange);
content.appendChild(fileInput);

const fileInteractionArea = document.createElement('img');
fileInteractionArea.src = 'resources/ui/upload-midi-button/default.png';
content.appendChild(fileInteractionArea);

export function init(): void {
  object.copy((ResourceManager.items.genesisMachineModel as GLTF).scene);
  object.position.set(13, 0, 8);
  object.rotation.y = Math.PI;

  Greenhouse.object.add(object);

  fileInteractionArea.addEventListener('click', onInteractionAreaClick);
  fileInteractionArea.addEventListener('dragenter', onInteractionAreaDrag);
  fileInteractionArea.addEventListener('dragover', onInteractionAreaDrag);
  fileInteractionArea.addEventListener('drop', onInteractionAreaDrop);
  fileInteractionArea.addEventListener('mouseenter', onInteractionAreaMouseEnter);
  fileInteractionArea.addEventListener('mouseleave', onInteractionAreaMouseLeave);
}

export function onMachineHover(intersection: THREE.Intersection): void {
  const intersectedObject = intersection.object;
  if (intersectedObject.name.includes('computer') &&
      !(PlayerController.plantsong instanceof Plantsong)) {
    object.traverse((child: THREE.Object3D) => {
      if (child.name.includes('computer')) {
        GameManager.highlightedObjects.push(child);
      }
    });
    return;
  }
  const intersectionLocal = object.worldToLocal(intersection.point.clone());
  if (intersectionLocal.x < 0.45 && plantsong instanceof Plantsong) {
    plantsong.highlight();
  }
}

export function onMachineClick(intersection: THREE.Intersection): void {
  if (intersection.object.name.includes('computer') &&
      !(PlayerController.plantsong instanceof Plantsong)) {
    showMenu();
    return;
  }
  const intersectionLocal = object.worldToLocal(intersection.point.clone());
  if (intersectionLocal.x < 0.45 && plantsong instanceof Plantsong) {
    plantsong.pickUp();
  }
}

export function showMenu(): void {
  PlayerController.unlockControls();
  menu.style.display = 'flex';
  PlayerController.hideCrosshair();
}

export function hideMenu(): void {
  menu.style.display = 'none';
  PlayerController.showCrosshair();
}

async function createPlant(sequence: mm.INoteSequence): Promise<void> {
  if (plantsong instanceof Plantsong) {
    console.error('cannot create new plantsong when one is already present on bench');
    return;
  }
  PlayerController.lockControls();
  const encoding = await MusicGenerator.encode(sequence);
  const position = new THREE.Vector3(-0.3, 1, -0.4);
  object.localToWorld(position);
  plantsong = new Plantsong(encoding, position);
  Greenhouse.plantsongs.push(plantsong);
}

function onFileReaderLoad(): void {
  if (fileReader.result instanceof ArrayBuffer) {
    const sequence = mm.sequences.quantizeNoteSequence(
      mm.midiToSequenceProto(fileReader.result),
      2,
    );
    createPlant(sequence);
  }
}

function onFileInputChange(): void {
  if (!(fileInput.files instanceof FileList)) {
    return;
  }
  for (const file of fileInput.files) {
    fileReader.readAsArrayBuffer(file);
  }
}

function onInteractionAreaClick(): void {
  fileInput.click();
}

function onInteractionAreaDrag(event: DragEvent): void {
  event.stopPropagation();
  event.preventDefault();
}

function onInteractionAreaDrop(event: DragEvent): void {
  event.stopPropagation();
  event.preventDefault();

  if (!(event.dataTransfer instanceof DataTransfer)) {
    return;
  }
  for (const file of event.dataTransfer.files) {
    fileReader.readAsArrayBuffer(file);
  }
}

function onInteractionAreaMouseEnter(): void {
  fileInteractionArea.src = 'resources/ui/upload-midi-button/hover.png';
}

function onInteractionAreaMouseLeave(): void {
  fileInteractionArea.src = 'resources/ui/upload-midi-button/default.png';
}

export function setPlantsong(plant: Plantsong | undefined) {
  plantsong = plant;
}

import * as THREE from 'three';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js';
import { ShaderPass } from 'three/examples/jsm/postprocessing/ShaderPass.js';
import { GammaCorrectionShader } from 'three/examples/jsm/shaders/GammaCorrectionShader.js';
import * as SizesManager from './sizesManager';
import * as EventManager from './eventManager/eventManager';
import * as PlayerController from '../world/playerController/playerController';
import * as Environment from '../world/environment';
import * as Greenhouse from '../world/greenhouse/greenhouse';
import * as Grass from '../world/grass';
import EdgeDetectHighlightShader from
  '../shaders/EdgeDetectHighlight/EdgeDetectHighlightShader';
import ScreenSpaceDepthShader from '../shaders/ScreenSpaceDepth/ScreenSpaceDepthShader';

export const canvas = document.querySelector('canvas')!;
export const scene = new THREE.Scene();
export const renderer = new THREE.WebGLRenderer({
  canvas: canvas,
});
renderer.setSize(SizesManager.width, SizesManager.height);
renderer.setPixelRatio(SizesManager.pixelRatio);
renderer.physicallyCorrectLights = true;
renderer.outputEncoding = THREE.sRGBEncoding;
renderer.toneMapping = THREE.ReinhardToneMapping;
renderer.toneMappingExposure = 1.5;

// post-processing
export const highlightedObjects: THREE.Object3D[] = [];
export const highlightedObjectsScene = new THREE.Scene();
const depthTextureRenderTarget = new THREE.WebGLRenderTarget(
  SizesManager.width,
  SizesManager.height,
  {
    minFilter: THREE.LinearFilter,
    magFilter: THREE.LinearFilter,
    format: THREE.RGBAFormat,
  },
);
const depthMaterial = new THREE.ShaderMaterial(ScreenSpaceDepthShader);
depthMaterial.uniforms.u_near.value = PlayerController.camera.near;
depthMaterial.uniforms.u_far.value = PlayerController.camera.far;
const normalsTextureRenderTarget = new THREE.WebGLRenderTarget(
  SizesManager.width,
  SizesManager.height,
  {
    minFilter: THREE.LinearFilter,
    magFilter: THREE.LinearFilter,
    format: THREE.RGBAFormat,
  },
);
const normalsMaterial = new THREE.MeshNormalMaterial();
const colorTextureRenderTarget = new THREE.WebGLRenderTarget(
  SizesManager.width,
  SizesManager.height,
  {
    minFilter: THREE.LinearFilter,
    magFilter: THREE.LinearFilter,
    format: THREE.RGBAFormat,
  },
);
export const composer = new EffectComposer(renderer);
const renderPass = new RenderPass(scene, PlayerController.camera);
composer.addPass(renderPass);
const edgeDetectHighlightPass = new ShaderPass(EdgeDetectHighlightShader);
edgeDetectHighlightPass.material.uniforms.u_depthTexture.value =
  depthTextureRenderTarget.texture;
edgeDetectHighlightPass.material.uniforms.u_normalsTexture.value =
  normalsTextureRenderTarget.texture;
edgeDetectHighlightPass.material.uniforms.u_colorTexture.value =
  colorTextureRenderTarget.texture;
edgeDetectHighlightPass.material.uniforms.u_color.value =
  new THREE.Color(0xefffcf);
composer.addPass(edgeDetectHighlightPass);
const gammaCorrectionPass = new ShaderPass(GammaCorrectionShader);
composer.addPass(gammaCorrectionPass);

function resize(): void {
  PlayerController.resize();

  renderer.setSize(SizesManager.width, SizesManager.height);
  renderer.setPixelRatio(SizesManager.pixelRatio);

  composer.setSize(SizesManager.width, SizesManager.height);
  composer.setPixelRatio(SizesManager.pixelRatio);

  depthTextureRenderTarget.setSize(SizesManager.width, SizesManager.height);
  normalsTextureRenderTarget.setSize(SizesManager.width, SizesManager.height);
  colorTextureRenderTarget.setSize(SizesManager.width, SizesManager.height);
}

EventManager.addEventListener('resize', resize);

export function updateAllMaterials(): void {
  scene.traverse(function(object: THREE.Object3D) {
    if (object instanceof THREE.Mesh
     && object.material instanceof THREE.MeshStandardMaterial) {
      object.material.envMapIntensity = 2;
      object.material.needsUpdate = true;
    }
  });
}

export function init(): void {
  Environment.init();
  PlayerController.init();
  Greenhouse.init();
  Grass.init();

  updateAllMaterials();

  EventManager.addEventListener('update', update);
}

function update(): void {
  Greenhouse.update();
  PlayerController.update();

  // render depth, normal, and (pre-post-proccessed) color textures
  const originalParents: THREE.Object3D[] = [];
  const originalPositions: THREE.Vector3[] = [];
  const originalRotations: THREE.Quaternion[] = [];
  const originalScales: THREE.Vector3[] = [];
  for (let i = 0; i < highlightedObjects.length; i++) {
    const object = highlightedObjects[i];
    originalParents.push(object.parent ?? scene);
    originalPositions.push(object.position.clone());
    originalRotations.push(object.quaternion.clone());
    originalScales.push(object.scale.clone());
    const worldPosition = new THREE.Vector3();
    object.getWorldPosition(worldPosition);
    const worldRotation = new THREE.Quaternion();
    object.getWorldQuaternion(worldRotation);
    const worldScale = new THREE.Vector3();
    object.getWorldScale(worldScale);
    object.position.copy(worldPosition);
    object.quaternion.copy(worldRotation);
    object.scale.copy(worldScale);
    highlightedObjectsScene.add(object);
  }
  highlightedObjectsScene.add(PlayerController.camera);
  highlightedObjectsScene.add(Environment.directionalLight);
  highlightedObjectsScene.overrideMaterial = depthMaterial;
  renderer.setRenderTarget(depthTextureRenderTarget);
  renderer.clear();
  renderer.render(highlightedObjectsScene, PlayerController.camera);
  highlightedObjectsScene.overrideMaterial = normalsMaterial;
  renderer.setRenderTarget(normalsTextureRenderTarget);
  renderer.render(highlightedObjectsScene, PlayerController.camera);
  highlightedObjectsScene.overrideMaterial = null;
  renderer.setRenderTarget(colorTextureRenderTarget);
  renderer.render(highlightedObjectsScene, PlayerController.camera);
  renderer.setRenderTarget(null);
  renderer.clear();
  for (let i = 0; i < highlightedObjects.length; i++) {
    const object = highlightedObjects[i];
    object.position.copy(originalPositions[i]);
    object.quaternion.copy(originalRotations[i]);
    object.scale.copy(originalScales[i]);
    originalParents[i].add(object);
  }
  scene.add(PlayerController.camera);
  scene.add(Environment.directionalLight);
  // clear the list of highlighted objects
  // (it will get filled again before next update cycle if we need)
  while (highlightedObjects.length > 0) {
    highlightedObjects.pop();
  }

  // render effects composer
  composer.render();
}

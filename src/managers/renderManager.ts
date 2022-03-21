import * as THREE from 'three';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js';
import { ShaderPass } from 'three/examples/jsm/postprocessing/ShaderPass.js';
import { GammaCorrectionShader } from 'three/examples/jsm/shaders/GammaCorrectionShader.js';
import EdgeDetectShader from '../shaders/EdgeDetect/EdgeDetectShader';
import ScreenSpaceDepthShader from '../shaders/ScreenSpaceDepth/ScreenSpaceDepthShader';
import * as GameManager from './gameManager';
import * as SizesManager from './sizesManager';
import * as TimeManager from './timeManager';
import * as PlayerController from '../world/playerController/playerController';

let postprocessing = false;

export const canvas = document.querySelector('canvas')!;
export const renderer = new THREE.WebGLRenderer({
  canvas: canvas,
});
renderer.setSize(SizesManager.width, SizesManager.height);
renderer.setPixelRatio(SizesManager.pixelRatio);
renderer.physicallyCorrectLights = true;
renderer.outputEncoding = THREE.sRGBEncoding;
renderer.toneMapping = THREE.ReinhardToneMapping;
renderer.toneMappingExposure = 1.5;

const renderTargets = {
  composer: new THREE.WebGLRenderTarget(
    SizesManager.width,
    SizesManager.height,
    {
      minFilter: THREE.LinearFilter,
      magFilter: THREE.LinearFilter,
      format: THREE.RGBAFormat,
    },
  ),
  fullScene: {
    color: new THREE.WebGLRenderTarget(
      SizesManager.width,
      SizesManager.height,
      {
        minFilter: THREE.LinearFilter,
        magFilter: THREE.LinearFilter,
        format: THREE.RGBAFormat,
      },
    ),
    normals: new THREE.WebGLRenderTarget(
      SizesManager.width,
      SizesManager.height,
      {
        minFilter: THREE.LinearFilter,
        magFilter: THREE.LinearFilter,
        format: THREE.RGBAFormat,
      },
    ),
    depth: new THREE.WebGLRenderTarget(
      SizesManager.width,
      SizesManager.height,
      {
        minFilter: THREE.LinearFilter,
        magFilter: THREE.LinearFilter,
        format: THREE.RGBAFormat,
      },
    ),
  },
  highlights: {
    color: new THREE.WebGLRenderTarget(
      SizesManager.width,
      SizesManager.height,
      {
        minFilter: THREE.LinearFilter,
        magFilter: THREE.LinearFilter,
        format: THREE.RGBAFormat,
      },
    ),
    normals: new THREE.WebGLRenderTarget(
      SizesManager.width,
      SizesManager.height,
      {
        minFilter: THREE.LinearFilter,
        magFilter: THREE.LinearFilter,
        format: THREE.RGBAFormat,
      },
    ),
    depth: new THREE.WebGLRenderTarget(
      SizesManager.width,
      SizesManager.height,
      {
        minFilter: THREE.LinearFilter,
        magFilter: THREE.LinearFilter,
        format: THREE.RGBAFormat,
      },
    ),
  },
};
renderTargets.composer.samples = 2;

export const composer = new EffectComposer(renderer, renderTargets.composer);
composer.setSize(SizesManager.width, SizesManager.height);
composer.setPixelRatio(SizesManager.pixelRatio);

const normalsMaterial = new THREE.MeshNormalMaterial();
const depthMaterial = new THREE.ShaderMaterial(ScreenSpaceDepthShader);
depthMaterial.uniforms.u_near.value = PlayerController.camera.near;
depthMaterial.uniforms.u_far.value = PlayerController.camera.far;

export function setupPostprocessing(): void {
  postprocessing = true;

  const renderPass = new RenderPass(GameManager.scene, PlayerController.camera);
  renderPass.setSize(SizesManager.width, SizesManager.height);
  composer.addPass(renderPass);

  const edgeDetectFullScenePass = new ShaderPass(EdgeDetectShader, 'u_incomingTexture');
  edgeDetectFullScenePass.uniforms.u_color.value = new THREE.Color(0x000000);
  edgeDetectFullScenePass.uniforms.u_depthTexture.value =
    renderTargets.fullScene.depth.texture;
  edgeDetectFullScenePass.uniforms.u_normalsTexture.value =
    renderTargets.fullScene.normals.texture;
  edgeDetectFullScenePass.uniforms.u_colorTexture.value =
    renderTargets.fullScene.color.texture;
  edgeDetectFullScenePass.uniforms.u_sampleSize.value = 0.0004;
  edgeDetectFullScenePass.uniforms.u_lowerCutoff.value = 0.5;
  edgeDetectFullScenePass.uniforms.u_upperCutoff.value = 0.75;
  composer.addPass(edgeDetectFullScenePass);

  const edgeDetectHighlightPass = new ShaderPass(EdgeDetectShader, 'u_incomingTexture');
  edgeDetectHighlightPass.uniforms.u_color.value = new THREE.Color(0x00eeff);
  edgeDetectHighlightPass.uniforms.u_depthTexture.value =
    renderTargets.highlights.depth.texture;
  edgeDetectHighlightPass.uniforms.u_normalsTexture.value =
    renderTargets.highlights.normals.texture;
  edgeDetectHighlightPass.uniforms.u_colorTexture.value =
    renderTargets.highlights.color.texture;
  edgeDetectHighlightPass.uniforms.u_lowerCutoff.value = 0.15;
  edgeDetectHighlightPass.uniforms.u_upperCutoff.value = 0.4;
  composer.addPass(edgeDetectHighlightPass);

  const gammaCorrectionPass = new ShaderPass(GammaCorrectionShader);
  composer.addPass(gammaCorrectionPass);
}

export function resize(): void {
  renderer.setSize(SizesManager.width, SizesManager.height);
  renderer.setPixelRatio(SizesManager.pixelRatio);

  composer.setSize(SizesManager.width, SizesManager.height);
  composer.setPixelRatio(SizesManager.pixelRatio);

  const effectiveWidth = SizesManager.width * SizesManager.pixelRatio;
  const effectiveHeight = SizesManager.height * SizesManager.pixelRatio;

  renderTargets.fullScene.depth.setSize(effectiveWidth, effectiveHeight);
  renderTargets.fullScene.normals.setSize(effectiveWidth, effectiveHeight);
  renderTargets.fullScene.color.setSize(effectiveWidth, effectiveHeight);

  renderTargets.highlights.depth.setSize(effectiveWidth, effectiveHeight);
  renderTargets.highlights.normals.setSize(effectiveWidth, effectiveHeight);
  renderTargets.highlights.color.setSize(effectiveWidth, effectiveHeight);

  render();
}

export function render(): void {
  if (!postprocessing) {
    renderer.render(GameManager.scene, PlayerController.camera);
    return;
  }

  renderer.setRenderTarget(renderTargets.fullScene.depth);
  GameManager.scene.overrideMaterial = depthMaterial;
  renderer.clear();
  renderer.render(GameManager.scene, PlayerController.camera);

  renderer.setRenderTarget(renderTargets.fullScene.normals);
  GameManager.scene.overrideMaterial = normalsMaterial;
  renderer.clear();
  renderer.render(GameManager.scene, PlayerController.camera);

  renderer.setRenderTarget(renderTargets.fullScene.color);
  GameManager.scene.overrideMaterial = null;
  renderer.clear();
  renderer.render(GameManager.scene, PlayerController.camera);

  GameManager.highlightedScene.add(PlayerController.camera);

  renderer.setRenderTarget(renderTargets.highlights.depth);
  GameManager.highlightedScene.overrideMaterial = depthMaterial;
  renderer.clear();
  renderer.render(GameManager.highlightedScene, PlayerController.camera);

  renderer.setRenderTarget(renderTargets.highlights.normals);
  GameManager.highlightedScene.overrideMaterial = normalsMaterial;
  renderer.clear();
  renderer.render(GameManager.highlightedScene, PlayerController.camera);

  renderer.setRenderTarget(renderTargets.highlights.color);
  GameManager.highlightedScene.overrideMaterial = null;
  renderer.clear();
  renderer.render(GameManager.highlightedScene, PlayerController.camera);

  GameManager.scene.add(PlayerController.camera);

  renderer.setRenderTarget(null);
  renderer.clear();

  composer.render(TimeManager.delta);
}
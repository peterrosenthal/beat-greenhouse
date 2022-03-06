import * as THREE from 'three';
import { GLTFLoader, GLTF } from 'three/examples/jsm/loaders/GLTFLoader.js';
import * as EventManager from '../eventManager/eventManager';
import resources from './resources';
import Resource from './Resource';
import ResourceType from './ResourceType';

export const items: Record<
  string, GLTF | THREE.Texture | THREE.Texture[] | THREE.CubeTexture> = {};

export const resourcesToLoad = resources.length;
export let resourcesLoaded = 0;

const gltfLoader = new GLTFLoader();
const textureLoader = new THREE.TextureLoader();
const cubeTextureLoader = new THREE.CubeTextureLoader();

export function loadResources(): void {
  for (const resource of resources) {
    switch (resource.type) {
      case ResourceType.GLTF_MODEL:
        if (typeof resource.path !== 'string') {
          break;
        }
        gltfLoader.load(
          resource.path,
          (gltf: GLTF) => resourceLoaded(resource, gltf),
        );
        break;
      case ResourceType.TEXTURE:
        if (typeof resource.path !== 'string') {
          break;
        }
        textureLoader.load(
          resource.path,
          (texture: THREE.Texture) => resourceLoaded(resource, texture),
        );
        break;
      case ResourceType.CUBE_TEXTURE:
        if (!(resource.path instanceof Array)) {
          break;
        }
        cubeTextureLoader.load(
          resource.path,
          (texture: THREE.CubeTexture) => resourceLoaded(resource, texture),
        );
        break;
      case ResourceType.ARRAY_TEXTURES:
        if (!(resource.path instanceof Array)) {
          break;
        }
        {
          const textures: Array<THREE.Texture | undefined> = [];
          for (let i = 0; i < resource.path.length; i++) {
            textures.push(undefined);
            const path = resource.path[i];
            textureLoader.load(
              path,
              (texture: THREE.Texture) => {
                textures[i] = (texture);
                if (textures.length === resource.path.length) {
                  let allTexturesLoaded = true;
                  for (const texture of textures) {
                    if (!(texture instanceof THREE.Texture)) {
                      allTexturesLoaded = false;
                    }
                  }
                  if (allTexturesLoaded) {
                    resourceLoaded(resource, textures as THREE.Texture[]);
                  }
                }
              }
            );
          }
        }
        break;
      default:
        break;
    }
  }
}

function resourceLoaded(
  resource: Resource,
  loaded: GLTF | THREE.Texture | THREE.Texture[] | THREE.CubeTexture,
): void {
  items[resource.name] = loaded;

  resourcesLoaded++;

  if (resourcesLoaded === resourcesToLoad) {
    EventManager.triggerEvent('loaded');
  } else {
    const percent = resourcesLoaded / resourcesToLoad;
    EventManager.triggerEvent('loading', percent);
  }
}

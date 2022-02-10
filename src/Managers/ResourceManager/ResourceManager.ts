import * as THREE from 'three';
import { GLTFLoader, GLTF } from 'three/examples/jsm/loaders/GLTFLoader';
import EventEmitter from '../../Utils/EventEmitter';
import resources from './resources';
import Resource from './Resource';
import ResourceType from './ResourceType';

export default class ResourceManager extends EventEmitter {
  private static S?: ResourceManager;
  static getInstance(): ResourceManager {
    if (!(this.S instanceof ResourceManager)) {
      this.S = new ResourceManager();
    }
    return this.S;
  }

  items: Record<string, GLTF | THREE.Texture | THREE.Texture[] | THREE.CubeTexture >;

  resourcesToLoad: number;
  resourcesLoaded: number;

  gltfLoader: GLTFLoader;
  textureLoader: THREE.TextureLoader;
  cubeTextureLoader: THREE.CubeTextureLoader;

  private constructor() {
    super();

    this.items = {};
    this.resourcesToLoad = resources.length;
    this.resourcesLoaded = 0;

    this.gltfLoader = new GLTFLoader();
    this.textureLoader = new THREE.TextureLoader();
    this.cubeTextureLoader = new THREE.CubeTextureLoader();
  }

  loadResources(): void {
    for (const resource of resources) {
      switch (resource.type) {
        case ResourceType.GLTF_MODEL:
          if (typeof resource.path !== 'string') {
            break;
          }
          this.gltfLoader.load(
            resource.path,
            (gltf: GLTF) => this.resourceLoaded(resource, gltf),
          );
          break;
        case ResourceType.TEXTURE:
          if (typeof resource.path !== 'string') {
            break;
          }
          this.textureLoader.load(
            resource.path,
            (texture: THREE.Texture) => this.resourceLoaded(resource, texture),
          );
          break;
        case ResourceType.CUBE_TEXTURE:
          if (!(resource.path instanceof Array)) {
            break;
          }
          this.cubeTextureLoader.load(
            resource.path,
            (texture: THREE.CubeTexture) => this.resourceLoaded(resource, texture),
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
              this.textureLoader.load(
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
                      this.resourceLoaded(resource, textures as THREE.Texture[]);
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

  private resourceLoaded(
    resource: Resource,
    loaded: GLTF | THREE.Texture | THREE.Texture[] | THREE.CubeTexture,
  ) {
    this.items[resource.name] = loaded;

    this.resourcesLoaded++;

    if (this.resourcesLoaded === this.resourcesToLoad) {
      this.trigger('loaded');
    } else {
      const percent = this.resourcesLoaded / this.resourcesToLoad;
      this.trigger('loading', percent);
    }
  }
}

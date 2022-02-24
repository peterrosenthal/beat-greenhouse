import Resource from './Resource';
import ResourceType from './ResourceType';

const resources: Resource[] = [
  {
    name: 'skyboxTexture',
    type: ResourceType.TEXTURE,
    path: 'resources/textures/skybox/skybox.png',
  },
  {
    name: 'workbenchModel',
    type: ResourceType.GLTF_MODEL,
    path: 'resources/models/workbench/workbench.gltf',
  },
  {
    name: 'showbenchModel',
    type: ResourceType.GLTF_MODEL,
    path: 'resources/models/showbench/showbench.gltf',
  },
  {
    name: 'potModel',
    type: ResourceType.GLTF_MODEL,
    path: 'resources/models/pot/pot.gltf',
  },
  {
    name: 'greenhouseModel',
    type: ResourceType.GLTF_MODEL,
    path: 'resources/models/greenhouse/greenhouse.gltf',
  },
];

export default resources;

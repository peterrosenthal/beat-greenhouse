import ResourceType from './ResourceType';

interface Resource {
  name: string,
  type: ResourceType,
  path: string | string[],
}

export default Resource;

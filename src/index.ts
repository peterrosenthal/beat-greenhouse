import * as EventManager from './managers/eventManager/eventManager';
import * as ResourceManager from './managers/resourceManager/resourceManager';
import * as SizesManager from './managers/sizesManager';
import * as TimeManager from './managers/timeManager';
import * as GameManager from './managers/gameManager';

SizesManager.init();
TimeManager.init();
EventManager.addEventListener('loaded', GameManager.init);
ResourceManager.loadResources();

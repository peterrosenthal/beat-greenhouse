import TimeManager from './Managers/TimeManager';
import SizeManager from './Managers/SizeManager';
import GameManager from './Managers/GameManager';
import ResourceManager from './Managers/ResourceManager/ResourceManager';

// instantiate all the managers
TimeManager.getInstance();
SizeManager.getInstance();
GameManager.getInstance();
ResourceManager.getInstance().loadResources();

import * as PlayerController from './playerController';

let override = false;

let index = 0;

const menu = document.createElement('div');
menu.classList.add('pause-menu');
document.body.appendChild(menu);

const content = document.createElement('div');
content.classList.add('pause-menu-content');
menu.appendChild(content);

const manual = document.createElement('div');
manual.classList.add('owners-manual');
content.appendChild(manual);

const buttons = {
  play: document.createElement('button'),
  left: document.createElement('button'),
  right: document.createElement('button'),
};
buttons.play.classList.add('play-button');
buttons.play.innerText = 'Play';
content.appendChild(buttons.play);

buttons.left.style.display = 'none';
buttons.left.classList.add('arrow-button');
buttons.right.classList.add('arrow-button');

const images = {
  left: document.createElement('img'),
  right: document.createElement('img'),
};

images.left.src = 'resources/ui/arrows/left.png';
images.left.alt = 'Previous page';
buttons.left.appendChild(images.left);

images.right.src = 'resources/ui/arrows/right.png';
images.right.alt = 'Next page';
buttons.right.appendChild(images.right);

const pages = [
  document.createElement('div'),
  document.createElement('div'),
  document.createElement('div'),
  document.createElement('div'),
  document.createElement('div'),
];
for (const page of pages) {
  page.classList.add('owners-manual-page');
}

// page 0: intro page
const beatGreenhouseHeader = document.createElement('h1');
beatGreenhouseHeader.innerText = 'Welcome to the Beat Greenhouse!';
pages[0].appendChild(beatGreenhouseHeader);
const ownersManualHeader = document.createElement('h2');
ownersManualHeader.innerText = 'Owner\'s Manual';
pages[0].appendChild(ownersManualHeader);
const introParagraph = document.createElement('p');
// eslint-disable-next-line max-len
introParagraph.innerText = 'Use the buttons on the side of the owner\'s manual to navigate through the various pages. Please feel free to read every page to really get to know how to use your new tool where you cultivate songs as plants, or just jump right in and explore it yourself!';
pages[0].appendChild(introParagraph);
const basicInstructionsLabel = document.createElement('p');
basicInstructionsLabel.innerText = 'Here are some basic instructions to get you started:';
pages[0].appendChild(basicInstructionsLabel);
const basicInstructions = document.createElement('ul');
pages[0].appendChild(basicInstructions);
const movementInstructions = document.createElement('li');
movementInstructions.innerText = 'WASD or arrow keys to move around.';
basicInstructions.appendChild(movementInstructions);
const lookInstructions = document.createElement('li');
lookInstructions.innerText = 'Move mouse to look around.';
basicInstructions.appendChild(lookInstructions);
const basicInteractInstructions = document.createElement('li');
basicInteractInstructions.innerText = 'Click on any highlighted object to interact with it.';
basicInstructions.appendChild(basicInteractInstructions);

// page 1: basic greenhouse elements
const basicGreenhouseElementsHeader = document.createElement('h1');
basicGreenhouseElementsHeader.innerText = 'Basic Greenhouse Elements';
pages[1].appendChild(basicGreenhouseElementsHeader);
const plantsongHeader = document.createElement('h2');
plantsongHeader.innerText = 'The Plantsong';
pages[1].appendChild(plantsongHeader);
const plantsongParagraph = document.createElement('p');
// eslint-disable-next-line max-len
plantsongParagraph.innerText = 'Plantsongs are what grow in the Beat Greenhouse, and they are both plants and songs at the same time. Plantsongs can be cultivated, chosen, and selectively bred for desireable characteristics just like any plant, but those characteristics aren\'t just limited to the visual plant-like aspects of the plantsong, they could be the song aspects too! You pick up a plantsong by clicking on it. Plantsongs can be imported from the Genesis Machine, and stored on the benches. You can play back the song component of a plantsong with the Interpreter Machine, or even use that same machine to download that song as a MIDI file. And finally you can combine plantssongs together using the Combinator Machine.';
pages[1].appendChild(plantsongParagraph);
const benchesHeader = document.createElement('h2');
benchesHeader.innerText = 'Benches';
pages[1].appendChild(benchesHeader);
const workbenchHeader = document.createElement('h3');
workbenchHeader.innerText = 'Workbenches';
pages[1].appendChild(workbenchHeader);
const workbenchParagraph = document.createElement('p');
// eslint-disable-next-line max-len
workbenchParagraph.innerText = 'Workbenches are the simpler looking benches of the two types in the Beat Greenhouse. They only hold two plantsongs per bench, but they are going to be the benches you will work with the most in the greenhouse (hence the name). You can place any plantsong you like on an open and available bench spot, as long as you have a plantsong in your hands to place down. But be aware that if you place a plantsong that you really like on a workbench, it will disappear between generations, as the Combinator Machine needs the space to fill with the new plantsong children of the next generation.';
pages[1].appendChild(workbenchParagraph);
const showbenchHeader = document.createElement('h3');
showbenchHeader.innerText = 'Showbenches';
const showbenchParagraph = document.createElement('p');
// eslint-disable-next-line max-len
showbenchParagraph.innerText = 'Showbenches are for collecting, showing off, and saving the plantsongs that you really like and don\'t want to lose between generations. They can hold up to six plantsongs each, and have two levels so you can show off your plantsongs from various different angles. Any plantsong you place on a showbench will remain there until you close the tab or move it off of the bench yourself.';
pages[1].appendChild(showbenchParagraph);

// page 2: genesis machine
const genesisMachineHeader = document.createElement('h1');
genesisMachineHeader.innerText = 'The Genesis Machine';
pages[2].appendChild(genesisMachineHeader);
const genesisMachineParagraph = document.createElement('p');
// eslint-disable-next-line max-len
genesisMachineParagraph.innerText = 'The Genesis Machine allows the you to import any MIDI file you want into the game and it will be transformed into a beautiful plantsong. To use the Genesis Machine:';
pages[2].appendChild(genesisMachineParagraph);
const genesisMachineInstructions = document.createElement('ul');
pages[2].appendChild(genesisMachineInstructions);
const genesisComputerInstruction = document.createElement('li');
// eslint-disable-next-line max-len
genesisComputerInstruction.innerText = 'Click on the computer on the far right of the Genesis Machine table to open up the import dialogue';
genesisMachineInstructions.appendChild(genesisComputerInstruction);
const uploadInstruction = document.createElement('li');
// eslint-disable-next-line max-len
uploadInstruction.innerText = 'Click on the \'Upload MIDI\' button, or drag and drop a MIDI file onto the button to upload the MIDI file. Note: In Chrome and Safari you may need to drag and drop if trying to upload that has already been uploaded, no known issues with Firefox.';
genesisMachineInstructions.appendChild(uploadInstruction);
const closeGenesisMachineInstruction = document.createElement('li');
// eslint-disable-next-line max-len
closeGenesisMachineInstruction.innerText = 'Click on the \'Close Genesis Machine\' button if it doesn\'t close automatically';
genesisMachineInstructions.appendChild(closeGenesisMachineInstruction);

// page 3: the interpreter machine
const interpreterMachineHeader = document.createElement('h1');
interpreterMachineHeader.innerText = 'The Interpeter Machine';
pages[3].appendChild(interpreterMachineHeader);
const interpreterMachineParagraph = document.createElement('p');
// eslint-disable-next-line max-len
interpreterMachineParagraph.innerText = 'The Interpreter Machine will interpret any plantsong as a song, and will either play that song back for you, or download the song as a MIDI file for you to import back into you usual music creating workflow. To use the Interpreter Machine:';
pages[3].appendChild(interpreterMachineParagraph);
const interpreterMachineInstructions = document.createElement('ul');
pages[3].appendChild(interpreterMachineInstructions);
const interpretPlantInstruction = document.createElement('li');
// eslint-disable-next-line max-len
interpretPlantInstruction.innerText = 'To get started: place a plantsong on top of the Interpreter Machine.';
interpreterMachineInstructions.appendChild(interpretPlantInstruction);
const playPlantInstruction = document.createElement('li');
// eslint-disable-next-line max-len
playPlantInstruction.innerText = 'To play the plantsong: click on the blue triangle button on the left of the front face of the Interpreter Machine.';
interpreterMachineInstructions.appendChild(playPlantInstruction);
const downloadPlantInstruction = document.createElement('li');
// eslint-disable-next-line max-len
downloadPlantInstruction.innerText = 'To download the plantsong as a MIDI file: click on the green downward pointing arrow on the right of the front face of the Interpreter Machine.';
interpreterMachineInstructions.appendChild(downloadPlantInstruction);

// page 4: the combinator machine
const combinatorMachineHeader = document.createElement('h1');
combinatorMachineHeader.innerText = 'The Combinator Machine';
pages[4].appendChild(combinatorMachineHeader);
const combinatorMachineParagraph = document.createElement('p');
// eslint-disable-next-line max-len
combinatorMachineParagraph.innerText = 'The Combinator Machine will take two parent plantsongs and combine them into a bunch of children plantsongs that share many shared characteristics, both visually and musically, with their parents. To use the Combinator Machine:';
pages[4].appendChild(combinatorMachineParagraph);
const combinatorMachineInstructions = document.createElement('ol');
pages[4].appendChild(combinatorMachineInstructions);
const placePlantsInstruction = document.createElement('li');
// eslint-disable-next-line max-len
placePlantsInstruction.innerText = 'Place the two plantsongs you wish to combine on the two plates on the left side of the machine.';
combinatorMachineInstructions.appendChild(placePlantsInstruction);
const adjustLeversInstruction = document.createElement('li');
// eslint-disable-next-line max-len
adjustLeversInstruction.innerText = 'Adjust the levers on the computer to the right side of the machine until they resemble the corresponding ratio of genetics to contribute from each parent plantsong.';
combinatorMachineInstructions.appendChild(adjustLeversInstruction);
const combinatorButtonInstruction = document.createElement('li');
// eslint-disable-next-line max-len
combinatorButtonInstruction.innerText = 'Press the button at the bottom center of the computer on the right side of the machine to get start the minute to two long combination process.';
combinatorMachineInstructions.appendChild(combinatorButtonInstruction);

manual.appendChild(buttons.left);
manual.appendChild(pages[0]);
manual.appendChild(buttons.right);

export function init(): void {
  buttons.play.addEventListener('click', PlayerController.lockControls);
  buttons.left.addEventListener('click', onLeftButtonClick);
  buttons.right.addEventListener('click', onRightButtonClick);
}

export function overrideMenu(value = true): void {
  override = value;
}

export function hideMenu(): void {
  menu.style.display = 'none';
}

export function showMenu(): void {
  if (override) {
    return;
  }
  menu.style.display = 'block';
}

function onLeftButtonClick(): void {
  switch (index) {
    case 0:
      console.error('cannot decrement owners manual page number below 0');
      return;
    case 1:
      buttons.left.style.display = 'none';
      break;
    case pages.length - 1:
      buttons.right.style.display = 'inline-block';
      break;
  }
  manual.removeChild(pages[index]);
  manual.removeChild(buttons.right);
  index --;
  manual.appendChild(pages[index]);
  manual.appendChild(buttons.right);
}

function onRightButtonClick(): void {
  console.log('right button click!');
  switch (index) {
    case 0:
      buttons.left.style.display = 'inline-block';
      break;
    case pages.length - 2:
      buttons.right.style.display = 'none';
      break;
    case pages.length - 1:
      console.error(`cannot increment owners manual page number above ${pages.length - 1}`);
      return;
  }
  manual.removeChild(pages[index]);
  manual.removeChild(buttons.right);
  index ++;
  manual.appendChild(pages[index]);
  manual.appendChild(buttons.right);
}

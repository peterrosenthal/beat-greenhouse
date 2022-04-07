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
];
for (const page of pages) {
  page.classList.add('owners-manual-page');
}
const header0 = document.createElement('h1');
header0.innerText = 'test page 0!';
pages[0].appendChild(header0);
const header1 = document.createElement('h1');
header1.innerText = 'test page 1!';
pages[1].appendChild(header1);
const header2 = document.createElement('h1');
header2.innerText = 'test page 2!';
pages[2].appendChild(header2);
const header3 = document.createElement('h1');
header3.innerText = 'test page 3!';
pages[3].appendChild(header3);

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

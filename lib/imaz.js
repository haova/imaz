import { add, multiply } from 'mathjs';
import Board from './board';
import { X, Y } from './constants';
import View from './view';

class Imaz {
  constructor(config = {}) {
    this.config = config;
  }
}

/*************** SYSTEM ****************/

Imaz.prototype.active = function () {
  // view
  const { view = document.createElement('div') } = this.config;
  this.view = new View({ view });

  // board prepare
  this.board = new Board();

  this.board.width = this.view.width;
  this.board.heigth = this.view.heigth;

  this.view.appendChild(this.board.view);

  // window events
  this.view.addEventListener('mousedown', this.mousedown.bind(this));
  this.view.addEventListener('wheel', this.wheel.bind(this));
  window.addEventListener('mouseup', this.mouseup.bind(this));
  window.addEventListener('mousemove', this.mousemove.bind(this));

  this.view.addEventListener('touchstart', this.mousedown.bind(this));
  window.addEventListener('touchend', this.mouseup.bind(this));
  window.addEventListener('touchmove', this.mousemove.bind(this));

  this.view.addEventListener('dragover', this.dragover.bind(this));
  this.view.addEventListener('drop', this.drop.bind(this));

  window.addEventListener('paste', this.paste.bind(this));

  this.isMouseDown = false;
  this.mouseAnchorPoint = [0, 0];
  this.viewAnchorPoint = [0, 0];
  this.scale = 1;
};

Imaz.prototype.destroy = function () {
  // window events
  this.view.removeEventListener('mousedown', this.mousedown);
  this.view.removeEventListener('wheel', this.wheel);
  window.removeEventListener('mouseup', this.mouseup);
  window.removeEventListener('mousemove', this.mousemove);

  this.view.removeEventListener('touchstart', this.mousedown);
  window.removeEventListener('touchend', this.mouseup);
  window.removeEventListener('touchmove', this.mousemove);

  this.view.removeEventListener('dragover', this.dragover);
  this.view.removeEventListener('drop', this.drop);

  window.removeEventListener('paste', this.paste);
};

/*************** COORDS ****************/

Imaz.prototype.toViewPoint = function (globalPoint) {
  return [globalPoint[X] - this.view.left, globalPoint[Y] - this.view.top];
};

/*************** SYSTEM CONTROLS ****************/

Imaz.prototype.preprocess = function (e) {
  if (e.changedTouches?.length) {
    return [e.changedTouches[0].pageX, e.changedTouches[0].pageY];
  }

  return [e.pageX, e.pageY];
};

Imaz.prototype.mousedown = function (e) {
  e.preventDefault();

  this.isMouseDown = true;
  this.mouseAnchorPoint = this.toViewPoint(this.preprocess(e));
  this.viewAnchorPoint = this.view.position;
};

Imaz.prototype.mousemove = function (e) {
  if (!this.isMouseDown) return;

  e.preventDefault();

  const mouseViewPoint = this.toViewPoint(this.preprocess(e));

  this.view.position = add(
    this.viewAnchorPoint,
    this.mouseAnchorPoint,
    multiply(mouseViewPoint, -1)
  );
};

Imaz.prototype.mouseup = function (e) {
  this.mousemove(e);

  this.isMouseDown = false;
};

Imaz.prototype.wheel = function (e) {
  e.preventDefault();

  if (e.deltaY < 0) {
    this.board.zoomIn();
  }

  if (e.deltaY > 0) {
    this.board.zoomOut();
  }
};

Imaz.prototype.dragover = function (e) {
  e.preventDefault();
};

Imaz.prototype.drop = function (e) {
  e.preventDefault();

  let file;
  if (e.dataTransfer.items) {
    const item = e.dataTransfer.items[0];
    if (item?.kind === 'file') file = item.getAsFile();
  } else {
    file = e.dataTransfer.files[0];
  }

  if (file) this.loadFromFile(file);
};

Imaz.prototype.paste = function (e) {
  const item = (e.clipboardData || e.originalEvent.clipboardData).items[0];

  if (item.kind !== 'file') return;

  const file = item.getAsFile();
  this.loadFromFile(file);
};

/*************** IMAGE ****************/

Imaz.prototype.loadFromFile = function (file) {
  return new Promise((resolve) => {
    const reader = new FileReader();
    const image = new Image();

    reader.addEventListener('load', () => {
      image.src = reader.result;
    });

    image.addEventListener('load', () => {
      this.board.load(image);
      this.view.position = this.view.size;
      this.board.scale = Math.min(
        this.view.width / this.board.width,
        this.view.height / this.board.height
      );
      resolve();
    });

    reader.readAsDataURL(file);
  });
};

export default Imaz;

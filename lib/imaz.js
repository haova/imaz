import { add, multiply, subtract } from 'mathjs';
import Board from './board';
import { DEFAULT_ACTION, SCALE_ACTION, X, Y } from './constants';
import { length } from './utils';
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

  this.moveAction = null;
  this.mouseAnchorPoint = [0, 0];
  this.viewAnchorPoint = [0, 0];
  this.touchAnchorPoints = [
    [0, 0],
    [0, 0],
  ];
  this.boardAnchorScale = 0;
  this.scale = 1;

  // local events
  this._on = {
    file() {},
    url() {},
  };
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

Imaz.prototype.on = function (name, fn) {
  this._on[name] = fn;
};

/*************** COORDS ****************/

Imaz.prototype.toViewPoint = function (globalPoint) {
  return [globalPoint[X] - this.view.left, globalPoint[Y] - this.view.top];
};

/*************** SYSTEM CONTROLS ****************/

Imaz.prototype.preprocess = function (e) {
  if (e.changedTouches?.length) {
    return {
      type: e.changedTouches.length === 1 ? DEFAULT_ACTION : SCALE_ACTION,
      points: [...e.changedTouches].map((p) => [p.pageX, p.pageY]),
    };
  }

  return {
    type: DEFAULT_ACTION,
    points: [[e.pageX, e.pageY]],
  };
};

Imaz.prototype.mousedown = function (e) {
  e.preventDefault();
  const res = this.preprocess(e);

  if (res.type === DEFAULT_ACTION) {
    this.moveAction = DEFAULT_ACTION;
    this.mouseAnchorPoint = this.toViewPoint(res.points[0]);
    this.viewAnchorPoint = this.board.position;
  }
};

Imaz.prototype.mousemove = function (e) {
  const res = this.preprocess(e);

  if (this.moveAction !== SCALE_ACTION && res.type === SCALE_ACTION) {
    this.moveAction = SCALE_ACTION;
    this.touchAnchorPoints = res.points
      .slice(0, 2)
      .map(this.toViewPoint.bind(this));
    this.boardAnchorScale = this.board.scale;
    this.viewAnchorPoint = this.board.position;
  }

  if (!this.moveAction) return;
  e.preventDefault();

  if (this.moveAction === DEFAULT_ACTION) {
    const mouseViewPoint = this.toViewPoint(res.points[0]);

    this.board.position = add(
      this.viewAnchorPoint,
      subtract(mouseViewPoint, this.mouseAnchorPoint)
    );
  }

  if (this.moveAction === SCALE_ACTION && res.type === SCALE_ACTION) {
    const touchViewPoints = res.points
      .slice(0, 2)
      .map(this.toViewPoint.bind(this));
    const originalSize = length(subtract(...this.touchAnchorPoints));
    const nextSize = length(subtract(...touchViewPoints));
    const scaleAmount = nextSize / originalSize;

    this.board.scale = this.boardAnchorScale * scaleAmount;

    const anchorPoint = multiply(add(...this.touchAnchorPoints), 0.5);
    const translatePoint = multiply(add(...touchViewPoints), 0.5);
    const directionVector = subtract(this.viewAnchorPoint, anchorPoint);

    this.board.position = add(
      anchorPoint,
      multiply(directionVector, scaleAmount),
      subtract(translatePoint, anchorPoint)
    );
  }
};

Imaz.prototype.mouseup = function (e) {
  this.mousemove(e);

  this.moveAction = null;
};

Imaz.prototype.wheel = function (e) {
  e.preventDefault();

  const lastWidth = this.board.actualWidth;

  if (e.deltaY < 0) {
    this.board.zoomIn();
  }

  if (e.deltaY > 0) {
    this.board.zoomOut();
  }

  const res = this.preprocess(e);

  const scaleAmount = this.board.actualWidth / lastWidth;
  const anchorPoint = this.toViewPoint(res.points[0]);
  const directionVector = subtract(this.board.position, anchorPoint);

  this.board.position = add(
    anchorPoint,
    multiply(directionVector, scaleAmount)
  );
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

Imaz.prototype.loadFromUrl = function (url) {
  this._on.url(url);

  return new Promise((resolve) => {
    const image = new Image();

    image.addEventListener('load', () => {
      this.board.load(image);
      this.board.scale = Math.min(
        this.view.width / this.board.width,
        this.view.height / this.board.height,
        1
      );

      this.board.position = multiply(
        subtract(this.view.size, this.board.actualSize),
        0.5
      );
      resolve();
    });

    image.src = url;
  });
};

Imaz.prototype.loadFromFile = function (file) {
  this._on.file(file);

  return new Promise((resolve) => {
    const reader = new FileReader();

    reader.addEventListener('load', () => {
      this.loadFromUrl(reader.result).then(resolve);
    });

    reader.readAsDataURL(file);
  });
};

/*************** TAGS ****************/
Imaz.prototype.clear = function (...args) {
  return this.board.clear(...args);
};

Imaz.prototype.addTag = function (...args) {
  return this.board.addTag(...args);
};

export default Imaz;

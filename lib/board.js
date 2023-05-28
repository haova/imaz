import { X, Y } from './constants';

class Board {
  constructor() {
    this.canvas = document.createElement('canvas');

    this.view = document.createElement('div');
    this.view.appendChild(this.canvas);
    this.view.style.position = 'absolute';

    this.ctx = this.canvas.getContext('2d');
    this._scale = 1;
    this._zoom = 0;
    this._rotate = 0;
  }
}

Board.prototype.transform = function () {
  this.view.style.width = `${this.canvas.width * this._scale}px`;
  this.view.style.height = `${this.canvas.height * this._scale}px`;
  this.canvas.style.transform = `translate(${
    (-(1 - this._scale) / 2) * this.canvas.width
  }px, ${(-(1 - this._scale) / 2) * this.canvas.height}px) rotate(${
    (this._rotate * 180) / Math.PI
  }deg) scale(${this._scale})`;
};

/*************** PROPERTIES ****************/

Object.defineProperty(Board.prototype, 'position', {
  get() {
    return [this.view.offsetLeft, this.view.offsetTop];
  },
  set(point) {
    this.view.style.left = `${point[X]}px`;
    this.view.style.top = `${point[Y]}px`;
  },
});

Object.defineProperty(Board.prototype, 'width', {
  get() {
    return this.canvas.width;
  },

  set(value) {
    this.canvas.width = value;
    this.transform();
  },
});

Object.defineProperty(Board.prototype, 'height', {
  get() {
    return this.canvas.height;
  },

  set(value) {
    this.canvas.height = value;
    this.transform();
  },
});

Object.defineProperty(Board.prototype, 'scale', {
  get() {
    return this._scale;
  },

  set(value) {
    this._scale = value;
    this._zoom = Math.round(Math.log(this._scale) / Math.log(2));
    this.transform();
  },
});

Object.defineProperty(Board.prototype, 'rotate', {
  get() {
    return this._rotate;
  },

  set(value) {
    this._rotate = value;
    this.transform();
  },
});

Object.defineProperty(Board.prototype, 'zoom', {
  get() {
    return this._zoom;
  },

  set(value) {
    this._zoom = value;
    this._scale = Math.pow(2, this._zoom);
    this.transform();
  },
});

Object.defineProperty(Board.prototype, 'actualWidth', {
  get() {
    return this.width * this.scale;
  },
});

Object.defineProperty(Board.prototype, 'actualHeight', {
  get() {
    return this.height * this.scale;
  },
});

Object.defineProperty(Board.prototype, 'actualSize', {
  get() {
    return [this.actualWidth, this.actualHeight];
  },
});

/*************** MANIPULATE ****************/

Board.prototype.zoomIn = function () {
  this.zoom += 1;
};

Board.prototype.zoomOut = function () {
  this.zoom -= 1;
};

/*************** IMAGE ****************/

Board.prototype.load = function (image) {
  this.width = image.width;
  this.height = image.height;
  this.ctx.drawImage(image, 0, 0);
};

export default Board;

class Board {
  constructor() {
    this.canvas = document.createElement('canvas');

    this.view = document.createElement('div');
    this.view.appendChild(this.canvas);
    this.view.style.overflow = 'hidden';

    this.ctx = this.canvas.getContext('2d');
    this._scale = 1;
    this._zoom = 0;
  }
}

/*************** PROPERTIES ****************/
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

/*************** MANIPULATE ****************/
Board.prototype.transform = function () {
  this.view.style.width = `${this.width * this.scale}px`;
  this.view.style.height = `${this.height * this.scale}px`;
  this.canvas.style.transform = `scale(${this.scale})`;
  this.canvas.style.transformOrigin = 'top left';
};

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

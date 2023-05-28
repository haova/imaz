import { FONT_BASE, X, Y } from './constants';
import { copyToClipboard } from './utils';

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

    this.tags = [];
    this.tagRoot = document.createElement('div');

    this.view.appendChild(this.tagRoot);
  }
}

Board.prototype.render = function () {
  // view
  this.view.style.fontSize = `${FONT_BASE * this._scale}px`;
  this.view.style.width = `${this.canvas.width * this._scale}px`;
  this.view.style.height = `${this.canvas.height * this._scale}px`;

  // canvas
  this.canvas.style.transform = `translate(${
    (-(1 - this._scale) / 2) * this.canvas.width
  }px, ${(-(1 - this._scale) / 2) * this.canvas.height}px) rotate(${
    (this._rotate * 180) / Math.PI
  }deg) scale(${this._scale})`;

  // tags
  this.tagRoot.innerHTML = '';
  for (const tag of this.tags) {
    const elm = document.createElement('div');
    elm.style.position = 'absolute';
    elm.style.left = `${tag.pos[X] * this._scale}px`;
    elm.style.top = `${tag.pos[Y] * this._scale}px`;
    elm.style.color = 'white';
    elm.style.cursor = 'pointer';

    elm.innerHTML = `<div style="width: ${
      tag.size[X] * this._scale
    }px; height: ${
      tag.size[Y] * this._scale
    }px; border: 1px solid white;"></div>${tag.text}`;

    elm.onclick = function () {
      copyToClipboard(tag.text);
    };

    this.tagRoot.appendChild(elm);
  }
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
    this.render();
  },
});

Object.defineProperty(Board.prototype, 'height', {
  get() {
    return this.canvas.height;
  },

  set(value) {
    this.canvas.height = value;
    this.render();
  },
});

Object.defineProperty(Board.prototype, 'scale', {
  get() {
    return this._scale;
  },

  set(value) {
    this._scale = value;
    this._zoom = Math.round(Math.log(this._scale) / Math.log(2));
    this.render();
  },
});

Object.defineProperty(Board.prototype, 'rotate', {
  get() {
    return this._rotate;
  },

  set(value) {
    this._rotate = value;
    this.render();
  },
});

Object.defineProperty(Board.prototype, 'zoom', {
  get() {
    return this._zoom;
  },

  set(value) {
    this._zoom = value;
    this._scale = Math.pow(2, this._zoom);
    this.render();
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

/*************** TAGS ****************/
Board.prototype.clear = function () {
  this.tags = [];
  this.render();
};

Board.prototype.addTag = function (pos, size, text) {
  this.tags.push({ pos, size, text });
  this.render();
};

export default Board;

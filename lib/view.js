import { X, Y } from './constants';

class View {
  constructor({ view }) {
    this.element = view;
    this.element.style.touchAction = 'none';
    this.element.style.overflow = 'hidden';

    this.box = this.element.getBoundingClientRect();
    this.width = this.box.width;
    this.height = this.box.height;
    this.top = this.box.top;
    this.left = this.box.left;

    this.inner = document.createElement('div');
    this.inner.style.width = 'max-content';
    this.inner.style.padding = `${this.height}px ${this.width}px`;
    this.element.appendChild(this.inner);
  }
}

/*************** SYSTEM ****************/

View.prototype.appendChild = function (child) {
  this.inner.appendChild(child);
};

View.prototype.addEventListener = function (...args) {
  this.element.addEventListener(...args);
};

View.prototype.removeEventListener = function (...args) {
  this.element.removeEventListener(...args);
};

/*************** PROPERTIES ****************/
Object.defineProperty(View.prototype, 'size', {
  get() {
    return [this.width, this.height];
  },

  set(point) {
    this.width = point[X];
    this.height = point[Y];
  },
});

Object.defineProperty(View.prototype, 'position', {
  get() {
    return [this.element.scrollLeft, this.element.scrollTop];
  },

  set(point) {
    this.element.scrollLeft = point[X];
    this.element.scrollTop = point[Y];
  },
});

export default View;

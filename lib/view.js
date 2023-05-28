import { X, Y } from './constants';

class View {
  constructor({ view }) {
    this.element = view;
    this.element.style.touchAction = 'none';
    this.element.style.overflow = 'hidden';
    this.element.style.position = 'relative';

    this.box = this.element.getBoundingClientRect();
    this.width = this.box.width;
    this.height = this.box.height;
    this.top = this.box.top;
    this.left = this.box.left;
  }
}

/*************** SYSTEM ****************/

View.prototype.appendChild = function (child) {
  this.element.appendChild(child);
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

// Object.defineProperty(View.prototype, 'position', {
//   get() {
//     return [
//       this.width - this.element.scrollLeft,
//       this.height - this.element.scrollTop,
//     ];
//   },

//   set(point) {
//     this.element.scrollLeft = this.width - point[X];
//     this.element.scrollTop = this.height - point[Y];
//   },
// });

export default View;

# ImazJS

## Usage

### Getting started

```js
import { Imaz } from 'imaz';

const im = new Imaz({
  view: /* element to working with, should a <div> elm */
});

// want to active
im.active();

// want to destroy
im.destroy();
```

### Load image

```js
im.load(file);
```

### Catch events

```js
im.on('eventName', fnHandle);
```

### Add tag

```js
im.clear();
im.addTag(posVector, sizeVector, content);
```

## Modes

### View (default)

- drag -> Move image around view.

## License

MIT.

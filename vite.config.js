import { resolve } from 'node:path';

export default {
  build: {
    lib: {
      entry: resolve(__dirname, 'lib/main.js'),
      name: 'imaz',
      fileName: (format) => `imaz.${format}.js`,
    },
  },
};

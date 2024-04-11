import type { SnapConfig } from '@metamask/snaps-cli';
// eslint-disable-next-line import/no-nodejs-modules
import { resolve } from 'path';

const config: SnapConfig = {
  bundler: 'webpack',
  input: resolve(__dirname, 'src/index.ts'),
  server: { port: 8080 },
  polyfills: {
    buffer: true,
    stream: true,
    crypto: true,
  },
  environment: {
    DAPP_ORIGIN_PRODUCTION: 'https://metamask.github.io/snap-watch-only/',
    DAPP_ORIGIN_DEVELOPMENT: 'http://localhost:8000/',
  },
  stats: {
    builtIns: {
      // The following builtins can be ignored. They are used by some of the
      // dependencies, but are not required by this snap.
      ignore: [
        'events',
        'http',
        'https',
        'zlib',
        'util',
        'url',
        'string_decoder',
        'punycode',
      ],
    },
  },
};

export default config;

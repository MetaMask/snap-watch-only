import * as nodeCrypto from 'crypto';

const config = {
  verbose: true,
  preset: '@metamask/snaps-jest',
  transform: {
    '^.+\\.(ts|tsx)$': 'ts-jest',
  },
  globals: {
    crypto: {
      getRandomValues: (arr: string | any[]) =>
        nodeCrypto.randomBytes(arr.length),
    },
    snap: {
      request: (request: any) => {
        return request;
      },
    },
  },
  coverageThreshold: {
    global: {
      branches: 0,
      functions: 0,
      lines: 0,
      statements: 0,
    },
  },
};

export default config;

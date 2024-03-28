module.exports = {
  preset: '@metamask/snaps-jest',

  // Since `@metamask/snaps-jest` runs in the browser, we can't collect
  // coverage information.
  collectCoverage: false,
  transform: {
    '^.+\\.(t|j)sx?$': 'ts-jest',
  },
  testTimeout: 20000,
  coveragePathIgnorePatterns: ['/node_modules/', '/test/'],

  setupFiles: ['./src/test/setup.ts'],
};

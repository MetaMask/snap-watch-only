const deepmerge = require('deepmerge');

const baseConfig = require('../../../../jest.config.base');

module.exports = deepmerge(baseConfig, {
  preset: '@metamask/snaps-jest',

  // Since `@metamask/snaps-jest` runs in the browser, we can't collect
  // coverage information.
  collectCoverage: false,
  transform: {
    '^.+\\.(t|j)sx?$': 'ts-jest',
  },
  testTimeout: 20000,
  coveragePathIgnorePatterns: [
    '/node_modules/',
    '/test/',
    'src/types/',
    'contracts',
    'artifacts',
  ],
});

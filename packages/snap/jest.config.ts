const config = {
  verbose: true,
  presets: '@metamask/snaps-jest',
  transform: {
    '^.+\\.(ts|tsx)$': 'ts-jest',
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

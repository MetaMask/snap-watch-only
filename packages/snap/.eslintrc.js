module.exports = {
  extends: ['../../.eslintrc.js'],

  overrides: [
    {
      files: ['*.ts'],
      extends: ['@metamask/eslint-config-typescript'],
      rules: {
        'import/no-nodejs-modules': ['error', { allow: ['buffer', 'crypto'] }],
      },
    },
    {
      files: ['*.test.ts', '*.test.js'],
      extends: [
        '@metamask/eslint-config-jest',
        '@metamask/eslint-config-nodejs',
      ],
    },
  ],

  ignorePatterns: ['!.eslintrc.js', 'dist/'],
};

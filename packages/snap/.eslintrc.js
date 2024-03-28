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
      files: ['**/*.test.ts', '**/*.test.js'],
      extends: ['@metamask/eslint-config-jest'],
      rules: {
        '@typescript-eslint/no-shadow': [
          'error',
          { allow: ['describe', 'expect', 'it'] },
        ],
        '@typescript-eslint/unbound-method': 'off',
      },
    },
  ],

  ignorePatterns: [
    '!.eslintrc.js',
    'dist/',
    'contracts/',
    'coverage/',
    'cache/',
    'artifacts/',
  ],
};

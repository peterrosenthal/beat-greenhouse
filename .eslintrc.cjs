module.exports = {
  root: true,
  extends: ['eslint:recommended', 'prettier'],
  plugins: ['svelte3'],
  overrides: [{ files: ['*.svelte'], processor: 'svelte3/svelte3' }],
  parserOptions: {
    sourceType: 'module',
    ecmaVersion: 2020,
  },
  env: {
    browser: true,
    es2017: true,
    node: true,
  },
  rules: {
    camelcase: 'error',
    'comma-dangle': ['error', 'always-multiline'],
    'comma-spacing': 'error',
    'eol-last': ['error', 'always'],
    eqeqeq: ['error', 'smart'],
    'func-style': ['error', 'declaration'],
    indent: ['error', 2],
    'linebreak-style': ['error', 'unix'],
    'max-len': [
      'error',
      {
        code: 95,
        ignoreComments: false,
        ignoreStrings: false,
        ignoreTemplateLiterals: false,
        ignoreUrls: true,
      },
    ],
    quotes: ['error', 'single'],
    semi: ['error', 'always'],
    'space-in-parens': ['error', 'never'],
  },
};

/**
 * @type {import('@types/eslint').Linter.BaseConfig}
 */
module.exports = {
  extends: [
    '@remix-run/eslint-config',
    '@remix-run/eslint-config/node',
    '@remix-run/eslint-config/jest-testing-library',
    'prettier',
    'plugin:storybook/recommended',
    'plugin:json/recommended',
    'plugin:tailwindcss/recommended',
  ],
  rules: {
    'eol-last': ['error', 'always'],
    'no-under': 'off',
    'no-console': 'warn',
    strict: ['error', 'never'],
    semi: ['error', 'never'],
    'react/react-in-jsx-scope': 'off',
    'react/prop-types': 'off',
    'react/display-name': 'off',
    'react/jsx-wrap-multilines': 'warn',
    'prefer-const': ['error'],
    'no-restricted-imports': [
      'warn',
      {
        paths: [
          {
            name: '@remix-run/node',
            importNames: ['LoaderFunction'],
            message:
              "Please import 'LoaderArgs' from instead of importing 'LoaderFunction' to have better typing.",
          },
        ],
      },
    ],
    'no-extra-parens': [
      'error',
      'all',
      { ignoreJSX: 'all', enforceForArrowConditionals: false },
    ],
    quotes: ['error', 'single', { avoidEscape: true }],
    'react/jsx-fragments': ['error', 'element'],
    'import/order': [
      'error',
      {
        alphabetize: {
          order: 'asc',
          caseInsensitive: false,
        },
        'newlines-between': 'always',
        groups: [
          'type',
          ['builtin', 'external'],
          'internal',
          'parent',
          ['sibling', 'index'],
        ],
        pathGroups: [
          {
            pattern: '@assets/**',
            group: 'index',
            position: 'after',
          },
        ],
      },
    ],
  },
  // we're using vitest which has a very similar API to jest
  // (so the linting plugins work nicely), but it we have to explicitly
  // set the jest version.
  settings: {
    jest: {
      version: 27,
    },
  },
}

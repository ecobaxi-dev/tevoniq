import js from '@eslint/js';
import ts from 'typescript-eslint';
import globals from 'globals';
import prettier from 'eslint-config-prettier';
export default [
  js.configs.recommended,
  ...ts.configs.recommended,
  { languageOptions: { globals: { ...globals.node, ...globals.browser } } },
  {
    files: ['**/*.ts', '**/*.tsx'],
    rules: { '@typescript-eslint/consistent-type-imports': 'error' },
  },
  prettier,
];

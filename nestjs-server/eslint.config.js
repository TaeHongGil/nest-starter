import { FlatCompat } from '@eslint/eslintrc';
import js from '@eslint/js';
import typescriptEslint from '@typescript-eslint/eslint-plugin';
import tsParser from '@typescript-eslint/parser';
import prettier from 'eslint-plugin-prettier';
import promise from 'eslint-plugin-promise';
import { defineConfig, globalIgnores } from 'eslint/config';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const compat = new FlatCompat({
  baseDirectory: __dirname,
  recommendedConfig: js.configs.recommended,
  allConfig: js.configs.all,
});

export default defineConfig([
  globalIgnores(['**/dist', '**/node_modules', '**/docker-local-db', '**/public', '**/ui', '**/metadata.ts']),
  {
    extends: compat.extends('eslint:recommended', 'plugin:@typescript-eslint/recommended', 'plugin:prettier/recommended', 'plugin:promise/recommended'),

    plugins: {
      '@typescript-eslint': typescriptEslint,
      prettier,
      promise,
    },

    languageOptions: {
      parser: tsParser,
      ecmaVersion: 5,
      sourceType: 'module',

      parserOptions: {
        project: './tsconfig.json',
        tsconfigRootDir: './',
      },
    },

    rules: {
      'prettier/prettier': [
        'error',
        {
          printWidth: 200,
          singleQuote: true,
          endOfLine: 'auto',
          trailingComma: 'all',
          tabWidth: 2,
        },
      ],

      'no-var': 'error',
      '@typescript-eslint/explicit-function-return-type': 'error',

      '@typescript-eslint/explicit-module-boundary-types': [
        'error',
        {
          allowArgumentsExplicitlyTypedAsAny: true,
        },
      ],

      '@typescript-eslint/no-unused-vars': 'off',
      '@typescript-eslint/no-explicit-any': 'off',

      'no-multiple-empty-lines': [
        'error',
        {
          max: 1,
        },
      ],

      'lines-between-class-members': [
        'error',
        'always',
        {
          exceptAfterSingleLine: true,
        },
      ],

      '@typescript-eslint/no-floating-promises': [
        'error',
        {
          ignoreVoid: false,
          ignoreIIFE: false,
        },
      ],
      '@typescript-eslint/no-misused-promises': [
        'error',
        {
          checksVoidReturn: false,
        },
      ],
      '@typescript-eslint/promise-function-async': 'error',

      'padding-line-between-statements': [
        'error',
        {
          blankLine: 'always',
          prev: 'function',
          next: 'function',
        },
        {
          blankLine: 'always',
          prev: '*',
          next: 'return',
        },
        {
          blankLine: 'always',
          prev: 'export',
          next: 'export',
        },
        {
          blankLine: 'always',
          prev: 'class',
          next: 'class',
        },
      ],
    },
  },
]);

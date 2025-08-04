import { FlatCompat } from '@eslint/eslintrc';
import js from '@eslint/js';
import { defineConfig, globalIgnores } from 'eslint/config';
import prettier from 'eslint-plugin-prettier';
import promise from 'eslint-plugin-promise';
import unusedImports from 'eslint-plugin-unused-imports';
import typescriptEslint from '@typescript-eslint/eslint-plugin';
import tsParser from '@typescript-eslint/parser';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import react from 'eslint-plugin-react';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const compat = new FlatCompat({
  baseDirectory: __dirname,
  recommendedConfig: js.configs.recommended,
  allConfig: js.configs.all,
});

export default defineConfig([
  globalIgnores(['**/dist', '**/node_modules', '**/docker-local-db', '**/public', '**/ui', '**/metadata.ts', 'modules']),
  {
    extends: compat.extends('eslint:recommended', 'plugin:@typescript-eslint/recommended', 'plugin:prettier/recommended', 'plugin:promise/recommended', 'plugin:react/recommended'),
    plugins: {
      '@typescript-eslint': typescriptEslint,
      prettier,
      promise,
      react,
      'unused-imports': unusedImports,
    },
    languageOptions: {
      parser: tsParser,
      parserOptions: {
        project: 'tsconfig.json',
        tsconfigRootDir: __dirname,
        sourceType: 'module',
      },
    },
    rules: {
      'react/react-in-jsx-scope': 'off',
      'react/jsx-uses-react': 'off',
      'unused-imports/no-unused-imports': 'error',
      'no-trailing-spaces': ['error'],
      'prettier/prettier': [
        'error',
        {
          trailingComma: 'all',
          singleQuote: true,
          arrowParens: 'always',
          tabWidth: 2,
          printWidth: 200,
          endOfLine: 'auto',
        },
      ],
      'no-var': 'error',
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
      '@typescript-eslint/no-misused-promises': [
        'error',
        {
          checksVoidReturn: false,
        },
      ],
      '@typescript-eslint/promise-function-async': 'error',
      '@typescript-eslint/no-empty-object-type': 'off',
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
    settings: {
      react: {
        version: 'detect',
      },
    },
  },
]);

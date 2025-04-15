import eslintPluginTypeScript from '@typescript-eslint/eslint-plugin';
import tsParser from '@typescript-eslint/parser';
import eslintPluginPrettier from 'eslint-plugin-prettier';
import eslintPluginReact from 'eslint-plugin-react';

export default [
  {
    files: ['**/*.ts', '**/*.tsx'],
    languageOptions: {
      parser: tsParser,
      parserOptions: {
        ecmaVersion: 'latest',
        sourceType: 'module',
      },
    },
    plugins: {
      react: eslintPluginReact,
      '@typescript-eslint': eslintPluginTypeScript,
      prettier: eslintPluginPrettier,
    },
    rules: {
      semi: ['error', 'always'],
      'object-curly-spacing': ['error', 'always'],
      'key-spacing': ['error', { beforeColon: false, afterColon: true }],
      'arrow-body-style': ['error', 'as-needed'],
      'eol-last': ['error', 'always'],
      'no-trailing-spaces': 'error',
      'react/prop-types': 'off',
      '@typescript-eslint/no-unused-vars': [
        'warn',
        { argsIgnorePattern: '^_', caughtErrorsIgnorePattern: '^_', destructuredArrayIgnorePattern: '^_' },
      ],
      '@typescript-eslint/explicit-module-boundary-types': 'off',
      '@typescript-eslint/no-explicit-any': 'off',
      '@typescript-eslint/ban-ts-comment': 'off',
      '@typescript-eslint/no-empty-function': 'off',
      '@typescript-eslint/no-empty-interface': 'off',
      'prettier/prettier': [
        'error',
        {
          singleQuote: true,
          semi: true,
          endOfLine: 'auto',
        },
      ],
    },
    settings: {
      react: {
        version: 'detect',
      },
    },
  },
  {
    files: ['vite.config.ts', '*.config.ts'],
    rules: {
      '@typescript-eslint/no-var-requires': 'off',
      '@typescript-eslint/no-unused-vars': 'off',
    },
  },
];

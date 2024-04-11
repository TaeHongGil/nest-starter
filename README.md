# Nest Starter

## Install
- npm install
- Run Docker (If You Want Local DB)
- Set Config (default docker db)
  - `./src/env`

## Environment
- VS Code
  - [EsLint](https://marketplace.visualstudio.com/items?itemName=dbaeumer.vscode-eslint)

## Docker
- Local DB (Mysql, Mongo, Redis) For Test
- Start docker daemon and Run Docker (Run And Debug)
  - `.vscode/launch.json`
  - `.vscode/tasks.json`

## Swagger
- Change `src/generate-metadata.ts` options (dtoFileNameSuffix, controllerFileNameSuffix)

- If you don't want it, you can exclude 'npm run swagger' from `package.json`.

# Nest Starter

## Install
1. **Install Dependencies**:
   - Run `npm install` to install the necessary packages.

2. **Docker Setup for Local Database**:
   - [Docker](#docker) (If you want a local db)

3. **Environment Configuration**:
   - Set up environment variables in the `./src/env` file according to your local setup (default is configured for local database).

## Environment
- VS Code
  - [EsLint](https://marketplace.visualstudio.com/items?itemName=dbaeumer.vscode-eslint)
  - [Prettier](https://marketplace.visualstudio.com/items?itemName=esbenp.prettier-vscode)

## Docker
- Start the Docker daemon.
- `Run Docker` from VS Code (Run And Debug)
  - `.vscode/launch.json`
  - `.vscode/tasks.json`

## Swagger Documentation

- **Configuration**:
  - Modify the `src/feature/swagger/generate-metadata.ts` script to adjust options like `dtoFileNameSuffix` and `controllerFileNameSuffix` based on your needs.
  - `npm run swagger or npm run swagger:watch`
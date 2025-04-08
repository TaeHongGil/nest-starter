# Nest Starter

## Stacks
<img src="https://img.shields.io/badge/typescript-3178C6?style=for-the-badge&logo=typescript&logoColor=white">
<img src="https://img.shields.io/badge/nestjs-E0234E?style=for-the-badge&logo=nestjs&logoColor=white">
<img src="https://img.shields.io/badge/swagger-85EA2D?style=for-the-badge&logo=swagger&logoColor=white">
<img src="https://img.shields.io/badge/ejs-B4CA65?style=for-the-badge&logo=ejs&logoColor=white">

<img src="https://img.shields.io/badge/mongoDB-47A248?style=for-the-badge&logo=MongoDB&logoColor=white">
<img src="https://img.shields.io/badge/redis-FF4438?style=for-the-badge&logo=redis&logoColor=white">

## Install
1. **Install Dependencies**:
   - Run `npm install` to install the necessary packages.

2. **Docker Setup for Local Database**:
   - [Docker](#docker) (If you want a local db)

3. **Environment Configuration**:
   - Set up environment variables in the `./src/env` file according to your setup

## Environment
- VS Code
  - [EsLint](https://marketplace.visualstudio.com/items?itemName=dbaeumer.vscode-eslint)
  - [Prettier](https://marketplace.visualstudio.com/items?itemName=esbenp.prettier-vscode)
  - [Prettier ESLint](https://marketplace.visualstudio.com/items?itemName=rvest.vs-code-prettier-eslint)

## Docker
- Modify the `docker-local-db/.env`
- Start the docker daemon.
- `Run Docker` from VS Code (Run And Debug)
  - `.vscode/launch.json`
  - `.vscode/tasks.json`
- Add your database

## Swagger Documentation
- **Configuration**:
  - Modify the `src/feature/swagger/generate-metadata.ts` script to adjust options like `dtoFileNameSuffix` and `controllerFileNameSuffix` based on your needs.
  - Modify the `src/feature/swagger/swagger.config.ts`
  - `npm run swagger or npm run swagger:watch`
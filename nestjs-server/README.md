# Nestjs Starter

## Stacks

![typescript](https://img.shields.io/badge/typescript-3178C6?style=for-the-badge&logo=typescript&logoColor=white)
![nestjs](https://img.shields.io/badge/nestjs-E0234E?style=for-the-badge&logo=nestjs&logoColor=white)
![swagger](https://img.shields.io/badge/swagger-85EA2D?style=for-the-badge&logo=swagger&logoColor=white)

![mongo](https://img.shields.io/badge/mongoDB-47A248?style=for-the-badge&logo=MongoDB&logoColor=white)
![redis](https://img.shields.io/badge/redis-FF4438?style=for-the-badge&logo=redis&logoColor=white)

## Install

1. **Install Dependencies**:

   - Run `npm install` to install the necessary packages.

2. **Environment Configuration**:
   - Set up environment variables in the `./src/env` file according to your setup

## Local DB

**Docker Setup for Local Database**:

- ./docker-local-db
- Modify the `docker-local-db/.env` and `src/env/local-config.json`
- Start the docker daemon.
- `Run Docker` from VS Code (Run And Debug)
  - `./.vscode/launch.json`
  - `./.vscode/tasks.json`

## Swagger Documentation

- **Configuration**:
  - Modify the `src/feature/swagger/generate-metadata.ts` script to adjust options like `dtoFileNameSuffix` and `controllerFileNameSuffix` based on your needs.
  - Modify the `src/feature/swagger/swagger.config.ts`
  - `npm run swagger or npm run swagger:watch`

## Server Configuration

- To change the `server_type`, update the `server_type` environment variable in `.vscode/launch.json`:
  ```json
  "env": {
    "server_type": "local"
  }
  ```
  Replace `"local"` with the desired server type (`"dev"`, `"qa"`, `"live"`, etc.).

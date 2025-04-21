# Nestjs Starter

## Stacks

![typescript](https://img.shields.io/badge/typescript-3178C6?style=for-the-badge&logo=typescript&logoColor=white)
![react](https://img.shields.io/badge/-React-61DAFB?logo=react&logoColor=white&style=for-the-badge)

## Install

1. **Install Dependencies**:

   - Run `npm install` to install the necessary packages.

## Debugging

- To configure debugging, modify the `.vscode/launch.json` file:
  - Ensure the `React Run` configuration points to the correct `npm` script.

## Server Configuration

- To change the `server_type`, update the `server_type` environment variable in `.vscode/launch.json`:
  ```json
  "env": {
    "server_type": "local"
  }
  ```
  Replace `"local"` with the desired server type (`"dev"`, `"qa"`, `"live"`, etc.).

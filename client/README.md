# Swagger Client

## 설치

1. **의존성 설치**
   - `npm install` 명령어로 패키지 설치

## 서버 설정

- `server_type` 변경 시 `.vscode/launch.json`의 환경 변수 수정
  ```json
  "env": {
    "server_type": "local"
  }
  ```
  src/core/define/define.ts -> SERVER_TYPE

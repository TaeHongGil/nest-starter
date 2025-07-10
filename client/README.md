# Client

## 설치

1. **의존성 설치**
   - `pnpm install`

## 서버 설정

- `server_type` 변경 시 `.vscode/launch.json`의 환경 변수 수정
  ```json
  "env": {
    "zone": "local",
  }
  ```
  src/core/define/define.ts -> ZONE_TYPE

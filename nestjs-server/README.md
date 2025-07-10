# NestJs

# 확장 프로그램

- [VSCode Task Explorer](https://marketplace.visualstudio.com/items?itemName=spmeesseman.vscode-taskexplorer)

## 설치

1. **의존성 설치**
   - `pnpm install`

2. **환경 변수 설정**
   - `./src/env` 경로에 환경 변수 파일 작성

## 로컬 DB (Mongo, Redis)

**로컬 데이터베이스(Docker) 실행 방법**

- 경로: `./docker-local-db`
- Docker 데몬 실행
- VS Code Tasks에서 `db-compose-up` 실행
- `docker-local-db/.env` 및 `src/env/local-config.json` 파일 수정

## ELK(Elasticsearch, Logstash, Kibana) 환경

**로컬 ELK 스택(Docker) 실행 방법**

- 경로: `./docker-elk`
- VS Code Tasks에서 `elk-compose-setup`, `elk-compose-up` 실행
- 로그, 모니터링, 데이터 시각화 등 개발 및 운영 환경에서 활용

## Swagger

- 설정 파일: `src/feature/swagger/generate-metadata.ts`, `src/feature/swagger/swagger.config.ts` 수정
- 옵션(dtoFileNameSuffix, controllerFileNameSuffix 등) 필요시 변경
- 명령어: `npm run swagger` 또는 `npm run swagger:watch`

## 서버 설정

- `server_type` 변경 시 `.vscode/launch.json`의 환경 변수 수정
  ```json
  "env": {
    "zone": "local",
    "server_type": "api"
  }
  ```

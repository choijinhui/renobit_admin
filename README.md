# renobit_admin

레노빗2의 관리자 프론트엔드 소스입니다.

### 개발모드 실행하기

```
npm run serve
```

개발모드로 실행하기 API서버의 주소가 필요하며 그 주소는 .env에 작성해야 합니다. 

## .env 파일 예시
```
SERVE_PORT=4201
PUBLIC_PATH=/renobit
API_PROXY_PATH=http://localhost:6277
USE_HOT_RELOAD=true
```

### 빌드하기

```
npm run build
```

빌드가 완료된 파일은 renobit_server 프로젝트의 빌드 결과물의 admin디렉토리에 넣어 사용합니다.
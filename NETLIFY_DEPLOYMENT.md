# Netlify 배포 가이드

## 📋 배포 전 준비사항

### ✅ 1. 빌드 확인 완료
```bash
npm run build
```
✅ 빌드가 성공적으로 완료되었습니다.

### 2. 백엔드 배포 상태
- ✅ 백엔드는 이미 Render에 배포되어 있습니다.
- 백엔드 URL: `https://ssak3-backend.onrender.com`
- 프론트엔드 코드에서 이미 이 URL을 사용하도록 설정되어 있습니다.

### 3. 환경 변수 확인
Netlify 대시보드에서 다음 환경 변수를 설정해야 합니다.

---

## 🚀 Netlify 배포 방법

### 방법 1: Netlify 웹 대시보드 사용 (권장)

1. **Netlify 계정 생성 및 로그인**
   - https://app.netlify.com 접속
   - GitHub 계정으로 로그인

2. **새 사이트 추가**
   - "Add new site" → "Import an existing project" 클릭
   - GitHub 저장소 선택

3. **빌드 설정**
   - **Base directory**: (비워두기)
   - **Build command**: `npm run build`
   - **Publish directory**: `build`

4. **환경 변수 설정**
   - "Site settings" → "Environment variables" 클릭
   - 다음 변수들을 추가:

   ```
   REACT_APP_API_URL = https://ssak3-backend.onrender.com
   REACT_APP_KAKAO_JAVASCRIPT_KEY = (카카오 JavaScript 키)
   REACT_APP_KAKAO_REDIRECT_URI = https://your-site.netlify.app/auth/kakao/callback
   NODE_ENV = production
   ```

   ⚠️ **중요**: 
   - `REACT_APP_KAKAO_REDIRECT_URI`는 Netlify 배포 후 실제 도메인으로 변경해야 합니다.
   - 예: `https://ssak3-frontend.netlify.app/auth/kakao/callback`

5. **배포 시작**
   - "Deploy site" 클릭
   - 자동으로 빌드 및 배포 시작

---

### 방법 2: Netlify CLI 사용

1. **Netlify CLI 설치**
   ```bash
   npm install -g netlify-cli
   ```

2. **로그인**
   ```bash
   netlify login
   ```

3. **사이트 초기화**
   ```bash
   netlify init
   ```
   - 기존 사이트 연결 또는 새 사이트 생성 선택
   - 빌드 명령어: `npm run build`
   - 배포 디렉토리: `build`

4. **환경 변수 설정**
   ```bash
   netlify env:set REACT_APP_API_URL "https://ssak3-backend.onrender.com"
   netlify env:set REACT_APP_KAKAO_JAVASCRIPT_KEY "your-kakao-key"
   netlify env:set REACT_APP_KAKAO_REDIRECT_URI "https://your-site.netlify.app/auth/kakao/callback"
   netlify env:set NODE_ENV "production"
   ```

5. **배포**
   ```bash
   netlify deploy --prod
   ```

---

## 🔧 환경 변수 상세 설정

### 필수 환경 변수

| 변수명 | 설명 | 예시 값 |
|--------|------|---------|
| `REACT_APP_API_URL` | 백엔드 API URL | `https://ssak3-backend.onrender.com` |
| `REACT_APP_KAKAO_JAVASCRIPT_KEY` | 카카오 JavaScript 키 | `N9TG3a6487uNd4mkvJhvSDHgjLDav6Cc` |
| `REACT_APP_KAKAO_REDIRECT_URI` | 카카오 리다이렉트 URI | `https://your-site.netlify.app/auth/kakao/callback` |
| `NODE_ENV` | 환경 설정 | `production` |

### 카카오 개발자 콘솔 설정

1. **카카오 개발자 콘솔 접속**
   - https://developers.kakao.com 접속
   - 내 애플리케이션 선택

2. **플랫폼 설정**
   - "플랫폼" → "Web 플랫폼 등록"
   - 사이트 도메인: `https://your-site.netlify.app`

3. **Redirect URI 설정**
   - "제품 설정" → "카카오 로그인" → "Redirect URI"
   - 추가: `https://your-site.netlify.app/auth/kakao/callback`

---

## 📁 생성된 파일

### 1. `netlify.toml`
```toml
[build]
  command = "npm run build"
  publish = "build"

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200
```

**설명:**
- 빌드 명령어 및 배포 디렉토리 설정
- SPA 라우팅을 위한 리다이렉트 설정 (모든 경로를 index.html로)

### 2. `public/_redirects`
```
/*    /index.html   200
```

**설명:**
- Netlify의 리다이렉트 규칙
- React Router의 클라이언트 사이드 라우팅 지원

---

## ✅ 배포 확인

### 1. 배포 상태 확인
- Netlify 대시보드의 "Deploys" 탭에서 빌드 로그 확인
- 성공적으로 배포되면 "Published" 상태 표시

### 2. 사이트 접속
- Netlify가 제공하는 URL로 접속
- 예: `https://ssak3-frontend.netlify.app`

### 3. 기능 테스트
- 카카오 로그인 동작 확인
- API 연동 확인
- 페이지 라우팅 확인

---

## 🔍 문제 해결

### 문제 1: 빌드 실패
**해결:**
- 로컬에서 `npm run build` 실행하여 오류 확인
- `package.json`의 빌드 스크립트 확인

### 문제 2: 404 오류 (페이지 새로고침 시)
**해결:**
- `netlify.toml`과 `public/_redirects` 파일 확인
- 리다이렉트 규칙이 올바르게 설정되었는지 확인

### 문제 3: API 연결 실패
**해결:**
- `REACT_APP_API_URL` 환경 변수 확인
- 백엔드 서버가 정상 작동하는지 확인
- CORS 설정 확인 (백엔드에서 Netlify 도메인 허용 필요)

### 문제 4: 카카오 로그인 실패
**해결:**
- `REACT_APP_KAKAO_JAVASCRIPT_KEY` 확인
- `REACT_APP_KAKAO_REDIRECT_URI`가 카카오 개발자 콘솔에 등록되어 있는지 확인
- 카카오 개발자 콘솔의 플랫폼 설정 확인

---

## 📝 체크리스트

배포 전 확인:
- [ ] `npm run build` 로컬에서 성공
- [ ] `netlify.toml` 파일 생성 완료
- [ ] `public/_redirects` 파일 생성 완료
- [ ] GitHub에 모든 파일 push 완료
- [ ] Netlify 환경 변수 설정 완료
- [ ] 카카오 개발자 콘솔 Redirect URI 설정 완료
- [ ] 백엔드 서버 정상 작동 확인

---

## 🎯 최종 설정 요약

| 항목 | 값 |
|------|-----|
| **Build command** | `npm run build` |
| **Publish directory** | `build` |
| **Backend URL** | `https://ssak3-backend.onrender.com` |
| **Redirect URI** | `https://your-site.netlify.app/auth/kakao/callback` |

---

## 📞 추가 도움말

- Netlify 공식 문서: https://docs.netlify.com
- React Router 배포 가이드: https://reactrouter.com/en/main/start/overview
- 카카오 로그인 가이드: https://developers.kakao.com/docs/latest/ko/kakaologin/rest-api


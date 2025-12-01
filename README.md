# SSAK3 Frontend

중고거래 플랫폼 SSAK3의 프론트엔드 애플리케이션입니다.

[![Netlify Status](https://api.netlify.com/api/v1/badges/c94a89d4-fc2c-4d4b-aa24-2b7633eff9b0/deploy-status)](https://app.netlify.com/projects/fancy-tanuki-129c30/deploys)

## 🚀 배포 상태

- **프론트엔드**: [Netlify](https://app.netlify.com/projects/fancy-tanuki-129c30)에 배포됨
- **백엔드**: [Render](https://ssak3-backend.onrender.com)에 배포됨

## 📋 주요 기능

- 카카오 소셜 로그인
- 상품 등록 및 조회
- 카테고리별 상품 검색
- 찜하기 기능
- 실시간 채팅 (준비 중)
- 마이페이지

## 🛠️ 기술 스택

- **Frontend**: React 19.1.1
- **Routing**: React Router DOM 7.9.2
- **Build Tool**: Create React App
- **Deployment**: Netlify

## 📦 설치 및 실행

### 필수 요구사항

- Node.js 16.x 이상
- npm 또는 yarn

### 설치

```bash
npm install
```

### 개발 서버 실행

```bash
npm start
```

개발 서버는 [http://localhost:3000](http://localhost:3000)에서 실행됩니다.

### 프로덕션 빌드

```bash
npm run build
```

빌드된 파일은 `build` 폴더에 생성됩니다.

## 🔧 환경 변수 설정

프로젝트 루트에 `.env` 파일을 생성하고 다음 변수들을 설정하세요:

```env
REACT_APP_API_URL=https://ssak3-backend.onrender.com
REACT_APP_KAKAO_JAVASCRIPT_KEY=your-kakao-javascript-key
REACT_APP_KAKAO_REDIRECT_URI=http://localhost:3000/auth/kakao/callback
```

### 환경 변수 설명

- `REACT_APP_API_URL`: 백엔드 API 서버 URL
- `REACT_APP_KAKAO_JAVASCRIPT_KEY`: 카카오 개발자 콘솔에서 발급받은 JavaScript 키
- `REACT_APP_KAKAO_REDIRECT_URI`: 카카오 로그인 후 리다이렉트될 URI

## 📁 프로젝트 구조

```
src/
├── components/          # React 컴포넌트
│   ├── MainPage.jsx     # 메인 페이지
│   ├── MyPage.jsx       # 마이페이지
│   ├── ProductDetailPage.jsx  # 상품 상세 페이지
│   ├── ProductPostPage.jsx    # 상품 등록 페이지
│   ├── LoginPage.jsx          # 로그인 페이지
│   ├── KakaoCallbackPage.jsx  # 카카오 로그인 콜백
│   └── ...
├── config/             # 설정 파일
│   └── api.js          # API 기본 URL 설정
├── lib/                 # 유틸리티 함수
│   ├── api.js          # API 요청 유틸리티
│   └── products.js     # 상품 관련 유틸리티
├── styles/             # CSS 스타일 파일
└── image/              # 이미지 리소스
```

## 🔗 API 연동

백엔드 API는 `src/config/api.js`에서 설정됩니다.

- **개발 환경**: `http://localhost:8080`
- **프로덕션 환경**: `https://ssak3-backend.onrender.com`

환경 변수 `REACT_APP_API_URL`이 설정되어 있으면 해당 값을 우선 사용합니다.

## 📝 배포 가이드

자세한 배포 가이드는 [NETLIFY_DEPLOYMENT.md](./NETLIFY_DEPLOYMENT.md)를 참고하세요.

## 🧪 테스트

```bash
npm test
```

## 📄 라이선스

이 프로젝트는 개인 프로젝트입니다.

## 👥 기여

이슈나 개선 사항이 있으면 이슈를 등록해주세요.

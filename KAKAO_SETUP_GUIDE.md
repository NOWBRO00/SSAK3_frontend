# 카카오 로그인 설정 가이드

## 🔗 접속 링크

### 1. 카카오 개발자 콘솔 접속
**👉 https://developers.kakao.com 접속**

1. 카카오 계정으로 로그인
2. "내 애플리케이션" 클릭
3. 사용 중인 애플리케이션 선택 (또는 새로 생성)

---

## 📍 Netlify 사이트 URL 확인 방법

### 방법 1: Netlify 대시보드에서 확인
1. **👉 https://app.netlify.com 접속**
2. 로그인 후 배포된 사이트 선택
3. 사이트 이름 옆에 표시된 URL 확인
   - 예: `https://fancy-tanuki-129c30.netlify.app`
   - 또는 커스텀 도메인이 있다면 해당 도메인

### 방법 2: 배포 로그에서 확인
- Netlify 대시보드 → "Deploys" 탭
- 최신 배포의 "Published" 상태 확인
- 배포된 URL이 표시됨

---

## ⚙️ 카카오 개발자 콘솔 설정 단계

### Step 1: 플랫폼 등록

1. **카카오 개발자 콘솔 접속**
   - https://developers.kakao.com
   - 내 애플리케이션 선택

2. **좌측 메뉴에서 "앱 설정" → "플랫폼" 클릭**

3. **"Web 플랫폼 등록" 클릭**

4. **사이트 도메인 입력**
   ```
   https://fancy-tanuki-129c30.netlify.app
   ```
   ⚠️ **주의**: `https://` 포함, 마지막 `/` 제외

5. **"저장" 클릭**

---

### Step 2: Redirect URI 설정

1. **좌측 메뉴에서 "제품 설정" → "카카오 로그인" 클릭**

2. **"Redirect URI" 섹션 찾기**

3. **"URI 추가" 또는 "+" 버튼 클릭**

4. **Redirect URI 입력**
   ```
   https://fancy-tanuki-129c30.netlify.app/auth/kakao/callback
   ```
   ⚠️ **중요**: 
   - 정확한 경로: `/auth/kakao/callback`
   - `https://` 포함
   - 마지막 `/` 제외

5. **"저장" 클릭**

---

### Step 3: JavaScript 키 확인

1. **"앱 설정" → "앱 키" 클릭**

2. **"JavaScript 키" 복사**
   - 예: `N9TG3a6487uNd4mkvJhvSDHgjLDav6Cc`

3. **Netlify 환경 변수에 설정**
   - Netlify 대시보드 → Site settings → Environment variables
   - `REACT_APP_KAKAO_JAVASCRIPT_KEY` = (복사한 JavaScript 키)

---

## ✅ 설정 확인 체크리스트

- [ ] 카카오 개발자 콘솔에 로그인 완료
- [ ] Netlify 사이트 URL 확인 완료
- [ ] Web 플랫폼 등록 완료 (사이트 도메인)
- [ ] Redirect URI 추가 완료 (`/auth/kakao/callback` 경로 포함)
- [ ] JavaScript 키 확인 및 Netlify 환경 변수 설정 완료
- [ ] Netlify 재배포 완료 (환경 변수 변경 후)

---

## 🔍 문제 해결

### 문제 1: "Redirect URI가 일치하지 않습니다" 오류
**해결:**
- 카카오 개발자 콘솔의 Redirect URI와 Netlify 환경 변수의 `REACT_APP_KAKAO_REDIRECT_URI`가 정확히 일치하는지 확인
- 대소문자, 슬래시(`/`) 위치 정확히 확인
- 환경 변수 변경 후 Netlify 재배포 필요

### 문제 2: JavaScript 키 오류
**해결:**
- 카카오 개발자 콘솔에서 JavaScript 키 다시 확인
- Netlify 환경 변수에 정확히 입력되었는지 확인
- 환경 변수 이름: `REACT_APP_KAKAO_JAVASCRIPT_KEY`

### 문제 3: 플랫폼 등록 오류
**해결:**
- 사이트 도메인에 `https://` 포함했는지 확인
- 마지막에 `/`가 없어야 함
- 예: `https://fancy-tanuki-129c30.netlify.app` ✅
- 예: `https://fancy-tanuki-129c30.netlify.app/` ❌

---

## 📝 설정 예시

### 카카오 개발자 콘솔 설정
```
플랫폼:
- Web: https://fancy-tanuki-129c30.netlify.app

Redirect URI:
- https://fancy-tanuki-129c30.netlify.app/auth/kakao/callback
```

### Netlify 환경 변수
```
REACT_APP_API_URL = https://ssak3-backend.onrender.com
REACT_APP_KAKAO_JAVASCRIPT_KEY = N9TG3a6487uNd4mkvJhvSDHgjLDav6Cc
REACT_APP_KAKAO_REDIRECT_URI = https://fancy-tanuki-129c30.netlify.app/auth/kakao/callback
NODE_ENV = production
```

---

## 🎯 빠른 링크

- **카카오 개발자 콘솔**: https://developers.kakao.com
- **Netlify 대시보드**: https://app.netlify.com
- **백엔드 API**: https://ssak3-backend.onrender.com


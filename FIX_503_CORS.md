# 503 및 CORS 오류 해결 가이드

## 🔴 문제 상황

- **CORS error**: Preflight 요청 실패
- **503 Service Unavailable**: 백엔드 서버 응답 없음

## ✅ 해결 방법

### 1. 백엔드 URL 확인 및 수정

**문제:**
- 프론트엔드 기본 URL: `https://ssak3-backend.onrender.com`
- 실제 백엔드 URL: `https://ssak3-backend-1.onrender.com` (로그에서 확인)

**해결:**
1. **프론트엔드 코드 수정** (완료)
   - `src/config/api.js`에서 기본 URL을 `https://ssak3-backend-1.onrender.com`으로 변경

2. **Netlify 환경 변수 설정** (필수)
   - Netlify 대시보드 → Site settings → Environment variables
   - `REACT_APP_API_URL = https://ssak3-backend-1.onrender.com` 설정
   - 환경 변수가 있으면 코드의 기본값보다 우선 적용됨

3. **재배포**
   - GitHub에 Push하여 자동 재배포
   - 또는 Netlify에서 수동 재배포

---

### 2. 503 오류 해결

**원인:**
- 백엔드 서버가 응답하지 않음
- Render 서버가 아직 완전히 시작되지 않음
- 백엔드 URL이 잘못됨

**해결:**
1. **Render 대시보드에서 백엔드 상태 확인**
   - 서비스가 "Live" 상태인지 확인
   - 로그에서 오류 확인

2. **백엔드 URL 확인**
   - Render 대시보드에서 실제 URL 확인
   - 프론트엔드와 일치하는지 확인

3. **백엔드 헬스 체크**
   - `https://ssak3-backend-1.onrender.com/api/health` 접속
   - 정상 응답 확인

---

### 3. CORS Preflight 요청 실패

**원인:**
- OPTIONS 요청이 실패
- 백엔드 CORS 설정이 제대로 적용되지 않음

**해결:**
1. **백엔드 CORS 설정 확인** (이미 완료)
   - `SecurityConfig.java`에서 Netlify 도메인 허용
   - OPTIONS 메서드 허용 확인

2. **백엔드 재배포 확인**
   - 최신 CORS 설정이 배포되었는지 확인
   - Render 로그에서 CORS 필터 로드 확인

---

## 📝 체크리스트

- [ ] 프론트엔드 코드에서 백엔드 URL 수정 완료
- [ ] Netlify 환경 변수 `REACT_APP_API_URL` 설정
- [ ] GitHub에 Push하여 재배포
- [ ] Render에서 백엔드 서비스 상태 확인
- [ ] 백엔드 헬스 체크 (`/api/health`) 확인
- [ ] 프론트엔드에서 카카오 로그인 재테스트

---

## 🚀 빠른 해결

### Step 1: Netlify 환경 변수 설정

1. **Netlify 대시보드 접속**
   - https://app.netlify.com
   - 사이트 선택

2. **Site settings → Environment variables**

3. **환경 변수 추가/수정:**
   ```
   REACT_APP_API_URL = https://ssak3-backend-1.onrender.com
   ```

4. **저장**

### Step 2: 재배포

1. **GitHub에 Push** (코드 변경사항)
2. **또는 Netlify에서 수동 재배포**
   - "Deploys" → "Trigger deploy" → "Clear cache and deploy site"

### Step 3: 테스트

1. 배포 완료 후 사이트 접속
2. 카카오 로그인 시도
3. 개발자 도구에서 오류 확인

---

## 💡 추가 확인 사항

### 백엔드 서버 상태

Render 대시보드에서:
- 서비스가 "Live" 상태인지 확인
- 최근 로그에서 오류 확인
- 헬스 체크 엔드포인트 확인

### 프론트엔드 빌드 확인

Netlify 배포 로그에서:
- 빌드 성공 확인
- 환경 변수가 제대로 주입되었는지 확인


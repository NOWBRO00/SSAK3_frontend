# 🚨 Netlify CORS 오류 빠른 해결

## 문제
- `http://localhost:8080`으로 API 요청을 보내고 있음
- CORS 오류 발생

## ✅ 즉시 해결 방법

### 1단계: Netlify 환경 변수 설정

1. **👉 https://app.netlify.com 접속**
2. **배포된 사이트 선택** (`fancy-tanuki-129c30`)
3. **Site settings → Environment variables 클릭**
4. **다음 변수 추가/수정:**

   ```
   REACT_APP_API_URL = https://ssak3-backend.onrender.com
   ```

   ⚠️ **중요**: 
   - 마지막에 `/` 없이 입력
   - `https://` 포함
   - 값 앞뒤 공백 없음

5. **"Save" 클릭**

### 2단계: 재배포 (필수!)

**환경 변수를 추가/수정한 후 반드시 재배포해야 합니다!**

1. **"Deploys" 탭 클릭**
2. **"Trigger deploy" → "Clear cache and deploy site" 클릭**
   - 또는 최신 배포의 "..." 메뉴 → "Clear cache and deploy site"
3. **배포 완료 대기** (약 2-3분)

### 3단계: 테스트

1. 배포 완료 후 `https://fancy-tanuki-129c30.netlify.app` 접속
2. 개발자 도구 (F12) → Console 탭
3. 상품 등록 시도
4. Network 탭에서 요청 URL 확인
   - ✅ 정상: `https://ssak3-backend.onrender.com/api/products/with-upload`
   - ❌ 오류: `http://localhost:8080/api/products/with-upload`

---

## 🔍 확인 사항

### Netlify 환경 변수 목록

다음 변수들이 모두 설정되어 있어야 합니다:

```
REACT_APP_API_URL = https://ssak3-backend.onrender.com
REACT_APP_KAKAO_JAVASCRIPT_KEY = (카카오 JavaScript 키)
REACT_APP_KAKAO_REDIRECT_URI = https://fancy-tanuki-129c30.netlify.app/auth/kakao/callback
NODE_ENV = production
```

---

## 🚨 여전히 localhost로 요청하는 경우

### 원인
- 빌드 캐시 문제
- 환경 변수가 빌드 시점에 주입되지 않음

### 해결
1. **"Clear cache and deploy site"로 재배포**
2. **또는 GitHub에 작은 변경사항 Push하여 자동 재배포**

---

## 📝 백엔드 CORS 설정도 확인 필요

백엔드가 Netlify 도메인을 허용하도록 설정되어 있는지 확인:

```java
@CrossOrigin(origins = {
    "http://localhost:3000",
    "https://fancy-tanuki-129c30.netlify.app"
})
```

백엔드 코드를 확인하고 필요하면 수정하세요.


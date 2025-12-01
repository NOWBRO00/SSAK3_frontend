# Netlify CORS 및 API URL 오류 해결 가이드

## 🔴 문제 상황

```
Access to fetch at 'http://localhost:8080/api/products/with-upload' 
from origin 'https://fancy-tanuki-129c30.netlify.app' 
has been blocked by CORS policy
```

**원인**: Netlify에 배포된 사이트가 여전히 `localhost:8080`으로 API 요청을 보내고 있음

---

## ✅ 해결 방법

### Step 1: Netlify 환경 변수 설정 확인

1. **Netlify 대시보드 접속**
   - https://app.netlify.com
   - 배포된 사이트 선택 (`fancy-tanuki-129c30`)

2. **Site settings → Environment variables 클릭**

3. **다음 환경 변수가 설정되어 있는지 확인:**
   ```
   REACT_APP_API_URL = https://ssak3-backend.onrender.com
   REACT_APP_KAKAO_JAVASCRIPT_KEY = (카카오 JavaScript 키)
   REACT_APP_KAKAO_REDIRECT_URI = https://fancy-tanuki-129c30.netlify.app/auth/kakao/callback
   NODE_ENV = production
   ```

4. **환경 변수가 없다면 추가:**
   - "Add a variable" 클릭
   - Key: `REACT_APP_API_URL`
   - Value: `https://ssak3-backend.onrender.com`
   - "Save" 클릭

---

### Step 2: Netlify 재배포

**중요**: 환경 변수를 추가하거나 수정한 후에는 **반드시 재배포**해야 합니다!

1. **방법 1: 자동 재배포 (권장)**
   - GitHub에 작은 변경사항 Push
   - Netlify가 자동으로 재배포

2. **방법 2: 수동 재배포**
   - Netlify 대시보드 → "Deploys" 탭
   - "Trigger deploy" → "Deploy site" 클릭
   - 또는 최신 배포의 "..." 메뉴 → "Clear cache and deploy site"

---

### Step 3: 배포 완료 후 확인

1. **배포 완료 대기** (약 2-3분)

2. **브라우저에서 테스트**
   - `https://fancy-tanuki-129c30.netlify.app` 접속
   - 개발자 도구 (F12) → Console 탭 열기
   - 상품 등록 시도
   - API 요청이 `https://ssak3-backend.onrender.com`으로 가는지 확인

3. **Network 탭에서 확인**
   - 개발자 도구 → Network 탭
   - 상품 등록 시도
   - 요청 URL이 `https://ssak3-backend.onrender.com/api/products/with-upload`인지 확인

---

## 🔍 문제 진단

### 환경 변수가 설정되지 않은 경우

**증상:**
- API 요청이 `http://localhost:8080`으로 감
- CORS 오류 발생
- 401 Unauthorized 오류 발생

**해결:**
- Netlify 환경 변수에 `REACT_APP_API_URL` 추가
- 재배포

### 환경 변수가 설정되었지만 여전히 localhost로 요청하는 경우

**원인:**
- 빌드 시 환경 변수가 주입되지 않음
- 캐시된 빌드 사용

**해결:**
- "Clear cache and deploy site"로 재배포
- 또는 GitHub에 Push하여 새로 빌드

---

## 📝 체크리스트

- [ ] Netlify 환경 변수 `REACT_APP_API_URL` 설정 확인
- [ ] 값이 `https://ssak3-backend.onrender.com`인지 확인 (마지막 `/` 없음)
- [ ] 환경 변수 저장 완료
- [ ] Netlify 재배포 완료
- [ ] 배포 완료 후 브라우저에서 테스트
- [ ] 개발자 도구에서 API 요청 URL 확인

---

## 🚨 추가 확인 사항

### 백엔드 CORS 설정 확인

백엔드가 Netlify 도메인을 허용하도록 설정되어 있는지 확인:

```java
// 백엔드 CORS 설정 예시
@CrossOrigin(origins = {
    "http://localhost:3000",
    "https://fancy-tanuki-129c30.netlify.app"
})
```

또는

```java
@CrossOrigin(origins = "*") // 개발용 (프로덕션에서는 특정 도메인만 허용 권장)
```

---

## 💡 빠른 해결 (권장 순서)

1. **Netlify 환경 변수 확인 및 설정**
2. **"Clear cache and deploy site"로 재배포**
3. **배포 완료 후 테스트**
4. **여전히 문제가 있으면 백엔드 CORS 설정 확인**

---

## 📞 백엔드 CORS 설정이 필요한 경우

백엔드 코드에서 Netlify 도메인을 허용하도록 설정해야 합니다:

```java
@CrossOrigin(origins = "https://fancy-tanuki-129c30.netlify.app")
```

또는 전역 CORS 설정에서:

```java
@Configuration
public class CorsConfig {
    @Bean
    public WebMvcConfigurer corsConfigurer() {
        return new WebMvcConfigurer() {
            @Override
            public void addCorsMappings(CorsRegistry registry) {
                registry.addMapping("/api/**")
                    .allowedOrigins(
                        "http://localhost:3000",
                        "https://fancy-tanuki-129c30.netlify.app"
                    )
                    .allowedMethods("GET", "POST", "PUT", "DELETE", "OPTIONS")
                    .allowedHeaders("*")
                    .allowCredentials(true);
            }
        };
    }
}
```


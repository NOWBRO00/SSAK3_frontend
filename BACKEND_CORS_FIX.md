# 백엔드 CORS 설정 수정 가이드

## 🔴 문제 상황

```
Access to fetch at 'https://ssak3-backend.onrender.com/api/auth/kakao' 
from origin 'https://fancy-tanuki-129c30.netlify.app' 
has been blocked by CORS policy
```

## ✅ 해결 방법

### 1. 백엔드 CORS 설정 수정

`SecurityConfig.java` 파일을 수정하여 Netlify 도메인을 명시적으로 허용했습니다.

**변경 사항:**
- `setAllowedOriginPatterns("*")` → `setAllowedOrigins(특정 도메인 목록)`
- Netlify 도메인 추가: `https://fancy-tanuki-129c30.netlify.app`
- 로컬 개발 환경 유지: `http://localhost:3000`
- Preflight 요청 캐시 시간 설정

### 2. 백엔드 재배포

수정된 코드를 백엔드에 배포해야 합니다.

**Render 배포 방법:**
1. GitHub에 백엔드 코드 Push
2. Render가 자동으로 재배포 시작
3. 배포 완료 대기 (약 5-10분)

---

## 📝 수정된 CORS 설정

```java
// 허용할 오리진 설정
configuration.setAllowedOrigins(Arrays.asList(
    "http://localhost:3000",                              // 로컬 개발
    "https://fancy-tanuki-129c30.netlify.app",            // Netlify 배포
    "https://*.netlify.app"                                // 모든 Netlify 서브도메인
));

// 인증 정보 포함 허용
configuration.setAllowCredentials(true);
```

---

## 🚀 배포 후 확인

1. **백엔드 재배포 완료 대기**

2. **프론트엔드에서 테스트**
   - `https://fancy-tanuki-129c30.netlify.app` 접속
   - 카카오 로그인 시도
   - 개발자 도구 (F12) → Network 탭에서 CORS 오류 확인

3. **성공 확인**
   - CORS 오류가 사라짐
   - API 요청이 정상적으로 처리됨

---

## 🔍 문제 원인

### 와일드카드와 Credentials 충돌

`setAllowCredentials(true)`와 `setAllowedOriginPatterns("*")`를 함께 사용하면:
- 브라우저가 CORS 정책 위반으로 판단
- Preflight 요청이 실패
- 실제 요청이 차단됨

### 해결책

특정 도메인을 명시적으로 허용:
- `setAllowedOrigins()` 사용
- 필요한 도메인만 목록에 추가

---

## 📋 체크리스트

- [ ] `SecurityConfig.java` 파일 수정 완료
- [ ] GitHub에 백엔드 코드 Push
- [ ] Render 자동 재배포 시작 확인
- [ ] 배포 완료 대기 (5-10분)
- [ ] 프론트엔드에서 카카오 로그인 테스트
- [ ] CORS 오류 해결 확인

---

## 💡 추가 도메인 추가 방법

다른 도메인을 추가하려면 `SecurityConfig.java`의 `setAllowedOrigins()` 목록에 추가:

```java
configuration.setAllowedOrigins(Arrays.asList(
    "http://localhost:3000",
    "https://fancy-tanuki-129c30.netlify.app",
    "https://your-custom-domain.com"  // 커스텀 도메인 추가
));
```


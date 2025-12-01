# Netlify 404 오류 해결 가이드

## 🔴 문제 상황
- `/login` 같은 직접 URL 접속 시 404 오류 발생
- 다른 컴퓨터에서 접속해도 404 발생

## ✅ 해결 방법

### 방법 1: Netlify 재배포 (가장 확실한 방법)

1. **GitHub에 현재 코드 Push**
   ```bash
   git add .
   git commit -m "Fix Netlify redirects for SPA routing"
   git push origin main
   ```

2. **Netlify 자동 재배포 확인**
   - Netlify 대시보드 → "Deploys" 탭
   - 자동으로 재배포가 시작됨
   - 배포 완료까지 대기 (약 2-3분)

3. **배포 완료 후 테스트**
   - `https://fancy-tanuki-129c30.netlify.app/login` 접속
   - 정상 작동 확인

---

### 방법 2: Netlify 대시보드에서 수동 재배포

1. **Netlify 대시보드 접속**
   - https://app.netlify.com
   - 배포된 사이트 선택

2. **"Deploys" 탭 클릭**

3. **"Trigger deploy" → "Deploy site" 클릭**
   - 또는 최신 배포의 "..." 메뉴 → "Clear cache and deploy site"

4. **배포 완료 대기**

---

### 방법 3: Netlify 설정 확인

1. **Site settings → Build & deploy → Build settings 확인**
   - Build command: `npm run build`
   - Publish directory: `build`

2. **Site settings → Build & deploy → Post processing 확인**
   - "Asset optimization" 활성화되어 있는지 확인

---

## 🔍 확인 사항

### 1. `_redirects` 파일 위치 확인
- ✅ `public/_redirects` 파일 존재 확인
- ✅ `build/_redirects` 파일 존재 확인 (빌드 후 자동 생성)

### 2. `netlify.toml` 설정 확인
```toml
[build]
  command = "npm run build"
  publish = "build"

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200
```

### 3. 빌드 후 `build/_redirects` 파일 확인
```bash
npm run build
cat build/_redirects
```
출력: `/*    /index.html   200`

---

## 🚨 여전히 404가 발생하는 경우

### 추가 확인 사항

1. **브라우저 캐시 삭제**
   - Ctrl + Shift + Delete (Windows)
   - Cmd + Shift + Delete (Mac)
   - 캐시된 이미지 및 파일 삭제

2. **시크릿 모드에서 테스트**
   - 새 시크릿 창에서 접속 테스트

3. **Netlify Functions 사용 중인지 확인**
   - Netlify Functions를 사용한다면 별도 설정 필요

4. **커스텀 도메인 사용 시**
   - DNS 설정 확인
   - SSL 인증서 확인

---

## 📝 체크리스트

- [ ] `public/_redirects` 파일 존재
- [ ] `netlify.toml` 파일 존재 및 설정 확인
- [ ] `npm run build` 실행 후 `build/_redirects` 파일 확인
- [ ] GitHub에 코드 Push 완료
- [ ] Netlify 재배포 완료
- [ ] 브라우저 캐시 삭제 후 테스트
- [ ] 시크릿 모드에서 테스트

---

## 💡 예상 원인

1. **첫 배포 시 `_redirects` 파일이 없었음**
   - 해결: 재배포 필요

2. **Netlify가 `_redirects` 파일을 인식하지 못함**
   - 해결: `netlify.toml`의 리다이렉트 설정 확인

3. **빌드 시 `_redirects` 파일이 복사되지 않음**
   - 해결: `public/_redirects` 파일 확인 및 재배포

---

## 🎯 빠른 해결 (권장)

**가장 빠른 해결 방법:**

1. GitHub에 Push
2. Netlify 자동 재배포 대기
3. 배포 완료 후 테스트

이 방법으로 대부분의 경우 해결됩니다.


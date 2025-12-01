# Netlify 자동 배포 확인 가이드

## 🔍 자동 배포 확인 방법

### 방법 1: Netlify 대시보드에서 확인

1. **👉 https://app.netlify.com 접속**
2. **배포된 사이트 선택** (`fancy-tanuki-129c30`)
3. **Site settings → Build & deploy 클릭**
4. **"Continuous Deployment" 섹션 확인**

**확인 사항:**
- ✅ **"Build settings"** 섹션
  - Branch: `main` (또는 `master`)
  - Build command: `npm run build`
  - Publish directory: `build`

- ✅ **"Deploy notifications"** 섹션
  - GitHub push 시 자동 배포 활성화 여부

---

## ✅ 자동 배포가 활성화된 경우

### 증상
- GitHub에 `git push`하면 자동으로 배포 시작
- Netlify 대시보드의 "Deploys" 탭에 새 배포가 나타남
- 배포 상태: "Building..." → "Deploying..." → "Published"

### 확인 방법
1. Netlify 대시보드 → "Deploys" 탭
2. 최근 배포 내역 확인
3. "Triggered by" 컬럼에서 "Git push" 확인

---

## ❌ 자동 배포가 비활성화된 경우

### 증상
- GitHub에 Push해도 배포가 시작되지 않음
- "Deploys" 탭에 새 배포가 나타나지 않음

### 해결 방법

1. **Netlify 대시보드 접속**
   - https://app.netlify.com

2. **Site settings → Build & deploy 클릭**

3. **"Continuous Deployment" 섹션 확인**
   - "Link to Git provider" 버튼이 있으면 클릭
   - GitHub 저장소 연결 확인

4. **자동 배포 활성화**
   - "Deploy settings" → "Auto-deploy" 활성화 확인
   - Branch: `main` (또는 `master`) 선택

---

## 🚀 수동 배포 방법

자동 배포가 작동하지 않을 때 수동으로 배포:

1. **Netlify 대시보드 접속**
2. **"Deploys" 탭 클릭**
3. **"Trigger deploy" → "Deploy site" 클릭**
   - 또는 "Clear cache and deploy site" (캐시 삭제 후 배포)

---

## 📝 현재 설정 확인

### GitHub 저장소 연결 확인
```bash
git remote -v
```

출력 예시:
```
origin  https://github.com/NOWBRO00/SSAK3_frontend.git (fetch)
origin  https://github.com/NOWBRO00/SSAK3_frontend.git (push)
```

### 최근 커밋 확인
```bash
git log --oneline -5
```

---

## 🔧 자동 배포 설정 방법

### 처음 설정하는 경우

1. **Netlify 대시보드 접속**
   - https://app.netlify.com

2. **"Add new site" → "Import an existing project"**

3. **GitHub 선택 및 저장소 연결**

4. **빌드 설정**
   - Build command: `npm run build`
   - Publish directory: `build`

5. **"Deploy site" 클릭**

6. **자동 배포 활성화 확인**
   - Site settings → Build & deploy
   - "Auto-deploy" 활성화 확인

---

## 💡 빠른 확인

### 자동 배포 테스트

1. **작은 변경사항 만들기**
   ```bash
   echo "# Test" >> README.md
   git add README.md
   git commit -m "Test auto-deploy"
   git push origin main
   ```

2. **Netlify 대시보드 확인**
   - "Deploys" 탭에서 새 배포 시작 확인
   - 약 2-3분 후 배포 완료 확인

---

## 🎯 결론

**자동 배포가 활성화되어 있으면:**
- GitHub에 Push할 때마다 자동으로 배포됨
- Netlify 대시보드에서 배포 상태 확인 가능

**자동 배포가 비활성화되어 있으면:**
- 수동으로 "Trigger deploy" 클릭 필요
- 또는 설정에서 자동 배포 활성화


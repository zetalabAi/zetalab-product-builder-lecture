# ZetaLab 도메인 연결 가이드 (zetalab.im)

**목표**: `zetalab.im` → ZetaLab 프로덕션 배포

---

## 📋 사전 준비

### 1. Firebase 프로젝트 생성 (아직 안 했다면)

1. https://console.firebase.google.com/ 접속
2. "프로젝트 추가" 클릭
3. 프로젝트 ID: `zetalab-product-builder` (또는 원하는 이름)
4. Google Analytics 설정 (선택사항)

### 2. Firebase 서비스 활성화

#### Authentication
1. 좌측 메뉴 > "Authentication" 클릭
2. "시작하기" 클릭
3. "Sign-in method" 탭
4. "Google" 제공업체 활성화

#### Firestore Database
1. 좌측 메뉴 > "Firestore Database" 클릭
2. "데이터베이스 만들기" 클릭
3. 위치: `asia-northeast3 (Seoul)` 선택
4. 보안 규칙: "프로덕션 모드에서 시작"

#### Storage
1. 좌측 메뉴 > "Storage" 클릭
2. "시작하기" 클릭
3. 위치: Firestore와 동일

---

## 🔑 Step 1: Firebase 설정 파일 가져오기

### 1-1. 웹 앱 추가

1. 프로젝트 설정 (⚙️) > "프로젝트 설정"
2. "앱" 섹션에서 웹 아이콘 (`</>`) 클릭
3. 앱 닉네임: "ZetaLab Web"
4. "Firebase Hosting 설정" 체크 ✅
5. "앱 등록" 클릭

### 1-2. Firebase 구성 복사

표시되는 `firebaseConfig` 객체를 복사:

```javascript
const firebaseConfig = {
  apiKey: "AIza...",
  authDomain: "zetalab-product-builder.firebaseapp.com",
  projectId: "zetalab-product-builder",
  storageBucket: "zetalab-product-builder.appspot.com",
  messagingSenderId: "123456789",
  appId: "1:123456789:web:abcdef"
};
```

### 1-3. Service Account 키 생성

1. 프로젝트 설정 > "서비스 계정" 탭
2. "새 비공개 키 생성" 클릭
3. JSON 키 다운로드
4. 파일 이름을 `serviceAccountKey.json`으로 변경
5. 프로젝트 루트에 저장 (`/home/user/zetalabai/serviceAccountKey.json`)

⚠️ **중요**: 절대 Git에 커밋하지 마세요! (`.gitignore`에 포함됨)

---

## 📝 Step 2: 환경 변수 설정

`.env` 파일을 프로덕션 모드로 수정:

```bash
# ====================================
# 프로덕션 환경 설정
# ====================================

NODE_ENV=production
PORT=3000

# 개발 모드 자동 로그인 비활성화
DEV_AUTO_LOGIN=false

# ====================================
# Firebase Server-side (백엔드)
# ====================================

FIREBASE_PROJECT_ID=zetalab-product-builder
FIREBASE_STORAGE_BUCKET=zetalab-product-builder.appspot.com
GOOGLE_APPLICATION_CREDENTIALS=./serviceAccountKey.json

# ====================================
# Firebase Client-side (프론트엔드)
# ====================================
# 위에서 복사한 firebaseConfig 값으로 채우기

VITE_FIREBASE_API_KEY=AIza...
VITE_FIREBASE_AUTH_DOMAIN=zetalab-product-builder.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=zetalab-product-builder
VITE_FIREBASE_STORAGE_BUCKET=zetalab-product-builder.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=123456789
VITE_FIREBASE_APP_ID=1:123456789:web:abcdef

# ====================================
# Google Gemini API
# ====================================

GEMINI_API_KEY=AIzaSyAvwn-WnWUf-f9sGXeL7-_raimgXTjan-M
```

---

## 🏗️ Step 3: Firebase Hosting 설정

### 3-1. Firebase CLI 설치

```bash
npm install -g firebase-tools
```

### 3-2. Firebase 로그인

```bash
firebase login
```

### 3-3. Firebase 초기화

```bash
firebase init hosting
```

설정 옵션:
- **What do you want to use as your public directory?** → `dist`
- **Configure as a single-page app?** → `Yes`
- **Set up automatic builds with GitHub?** → `No` (나중에 설정 가능)

### 3-4. `firebase.json` 확인

자동 생성된 `firebase.json` 파일을 다음과 같이 수정:

```json
{
  "hosting": {
    "public": "dist",
    "ignore": [
      "firebase.json",
      "**/.*",
      "**/node_modules/**"
    ],
    "rewrites": [
      {
        "source": "/api/**",
        "function": "api"
      },
      {
        "source": "**",
        "destination": "/index.html"
      }
    ],
    "headers": [
      {
        "source": "/api/**",
        "headers": [
          {
            "key": "Cache-Control",
            "value": "no-cache, no-store, must-revalidate"
          }
        ]
      }
    ]
  },
  "firestore": {
    "rules": "firestore.rules",
    "indexes": "firestore.indexes.json"
  },
  "storage": {
    "rules": "storage.rules"
  }
}
```

---

## 🚀 Step 4: 프로덕션 빌드 및 배포

### 4-1. 프로덕션 빌드

```bash
# 의존성 설치 (처음만)
npm install

# 프로덕션 빌드
npm run build
```

빌드 성공 확인:
- `dist/` 폴더가 생성됨
- `dist/index.html` 파일이 있음

### 4-2. Firebase에 배포

```bash
# Firestore 보안 규칙 배포
firebase deploy --only firestore:rules

# Storage 보안 규칙 배포
firebase deploy --only storage

# Hosting 배포 (웹사이트)
firebase deploy --only hosting
```

배포 완료 후 표시되는 URL 확인:
```
✔  Deploy complete!

Hosting URL: https://zetalab-product-builder.web.app
```

### 4-3. 배포된 사이트 테스트

1. 제공된 URL로 접속
2. Google 로그인 테스트
3. 프롬프트 생성 테스트
4. 모든 기능 작동 확인

---

## 🌐 Step 5: 커스텀 도메인 연결 (`zetalab.im`)

### 5-1. Firebase Hosting에 도메인 추가

1. Firebase Console > Hosting
2. "도메인 추가" 클릭
3. 도메인 입력: `zetalab.im`
4. "계속" 클릭

### 5-2. DNS 레코드 설정

Firebase가 제공하는 DNS 레코드를 도메인 등록업체(가비아, Cloudflare 등)에 추가:

#### A 레코드 (IPv4)
```
Type: A
Name: @
Value: 151.101.1.195
Value: 151.101.65.195
```

#### AAAA 레코드 (IPv6, 선택사항)
```
Type: AAAA
Name: @
Value: 2a04:4e42::223
Value: 2a04:4e42:200::223
```

#### TXT 레코드 (도메인 소유권 확인)
```
Type: TXT
Name: @
Value: (Firebase가 제공한 값, 예: google-site-verification=xyz...)
```

### 5-3. 기존 Manus DNS 레코드 삭제

⚠️ **중요**: `zetalab.im`을 가리키는 기존 DNS 레코드를 삭제하거나 변경해야 합니다.

1. 도메인 DNS 설정 페이지 접속
2. `zetalab.im` (@ 또는 루트)를 가리키는 기존 A/CNAME 레코드 찾기
3. **삭제** 또는 주석 처리
4. 위의 Firebase A 레코드 추가

### 5-4. DNS 전파 대기

DNS 변경이 전파되려면 시간이 걸립니다:
- 빠르면: 5-10분
- 보통: 1-2시간
- 최대: 24-48시간

**DNS 전파 확인 방법**:
```bash
# 터미널에서 실행
dig zetalab.im

# 또는
nslookup zetalab.im
```

결과에 Firebase IP (`151.101.1.195`)가 표시되면 성공!

### 5-5. Firebase에서 도메인 확인

1. Firebase Console > Hosting > 도메인
2. `zetalab.im` 상태가 "연결됨" (Connected)으로 표시될 때까지 대기
3. SSL 인증서 자동 발급 (몇 분 소요)

---

## ✅ Step 6: 최종 확인

### 6-1. 도메인 접속 테스트

1. https://zetalab.im 접속
2. 자동 HTTPS 리다이렉트 확인
3. SSL 인증서 확인 (주소창 자물쇠 아이콘)

### 6-2. 전체 기능 테스트

- [ ] Google 로그인 작동
- [ ] Intent Clarification 작동
- [ ] 프롬프트 생성 작동
- [ ] 프롬프트 저장/편집 작동
- [ ] 히스토리 조회 작동

---

## 🔧 추가 설정 (선택사항)

### www 서브도메인 리다이렉트

`www.zetalab.im` → `zetalab.im` 리다이렉트 설정:

1. Firebase Hosting > "도메인 추가"
2. 도메인: `www.zetalab.im` 입력
3. "리다이렉트" 옵션 선택
4. 대상: `zetalab.im`

DNS 설정:
```
Type: CNAME
Name: www
Value: zetalab.im
```

### GitHub Actions 자동 배포

`.github/workflows/firebase-hosting.yml` 파일 생성:

```yaml
name: Deploy to Firebase Hosting

on:
  push:
    branches:
      - main

jobs:
  build_and_deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '20'
      - run: npm ci
      - run: npm run build
      - uses: FirebaseExtended/action-hosting-deploy@v0
        with:
          repoToken: '${{ secrets.GITHUB_TOKEN }}'
          firebaseServiceAccount: '${{ secrets.FIREBASE_SERVICE_ACCOUNT }}'
          channelId: live
          projectId: zetalab-product-builder
```

---

## 📱 모니터링

### Firebase Console에서 확인

1. **Hosting**: 배포 기록, 트래픽 통계
2. **Authentication**: 사용자 수, 로그인 통계
3. **Firestore**: 데이터베이스 사용량
4. **Storage**: 파일 저장 용량

### 로그 확인

```bash
# Firebase 함수 로그 (서버 측)
firebase functions:log

# Hosting 로그
firebase hosting:channel:deploy preview
```

---

## ❓ 트러블슈팅

### 문제: "도메인 소유권을 확인할 수 없습니다"
**해결**: TXT 레코드가 제대로 설정되었는지 확인
```bash
dig TXT zetalab.im
```

### 문제: "SSL 인증서 대기 중"
**해결**: DNS 전파 완료까지 대기 (최대 24시간)

### 문제: "Firebase 앱이 초기화되지 않았습니다"
**해결**: `.env` 파일의 `VITE_FIREBASE_*` 값이 올바른지 확인

### 문제: "403 Forbidden" 또는 권한 오류
**해결**:
1. `DEV_AUTO_LOGIN=false` 확인
2. `GOOGLE_APPLICATION_CREDENTIALS` 경로 확인
3. Service Account 키가 올바른지 확인

---

## 📞 도움이 필요하면

1. Firebase 공식 문서: https://firebase.google.com/docs/hosting
2. 커스텀 도메인 가이드: https://firebase.google.com/docs/hosting/custom-domain
3. 이 파일의 각 단계를 순서대로 진행

---

**문서 버전**: 1.0
**최종 업데이트**: 2026년 2월 7일
**대상 도메인**: zetalab.im

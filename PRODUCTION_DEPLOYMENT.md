# ZetaLab 프로덕션 배포 가이드

## 📋 목차
1. [Firebase 프로젝트 설정](#firebase-프로젝트-설정)
2. [환경 변수 설정](#환경-변수-설정)
3. [로그인/로그아웃 시스템 확인](#로그인로그아웃-시스템-확인)
4. [배포 전 체크리스트](#배포-전-체크리스트)

---

## Firebase 프로젝트 설정

### 1. Firebase Console 접속
https://console.firebase.google.com/

### 2. 새 프로젝트 생성
1. "프로젝트 추가" 클릭
2. 프로젝트 이름: `zetalab-product-builder` (또는 원하는 이름)
3. Google Analytics 설정 (선택사항)
4. 프로젝트 생성 완료

### 3. Authentication 설정
1. 좌측 메뉴에서 "Authentication" 선택
2. "시작하기" 클릭
3. "Sign-in method" 탭 선택
4. "Google" 제공업체 활성화
   - 공개용 프로젝트 이름 입력
   - 프로젝트 지원 이메일 선택
   - 저장

### 4. Firestore Database 설정
1. 좌측 메뉴에서 "Firestore Database" 선택
2. "데이터베이스 만들기" 클릭
3. 위치 선택: `asia-northeast3 (Seoul)` 권장
4. 보안 규칙: "프로덕션 모드에서 시작" 선택
5. 데이터베이스 생성

### 5. Storage 설정
1. 좌측 메뉴에서 "Storage" 선택
2. "시작하기" 클릭
3. 보안 규칙 선택
4. 위치: Firestore와 동일한 위치 선택

### 6. 웹 앱 추가
1. 프로젝트 설정 (⚙️) > "프로젝트 설정"
2. "앱" 섹션에서 웹 아이콘 (`</>`) 클릭
3. 앱 닉네임: "ZetaLab Web"
4. Firebase Hosting 설정 (선택사항)
5. "앱 등록" 클릭
6. **Firebase 구성 객체 복사** (다음 단계에서 사용)

```javascript
// 이런 형태로 표시됩니다
const firebaseConfig = {
  apiKey: "AIza...",
  authDomain: "zetalab-product-builder.firebaseapp.com",
  projectId: "zetalab-product-builder",
  storageBucket: "zetalab-product-builder.appspot.com",
  messagingSenderId: "123456789",
  appId: "1:123456789:web:abcdef"
};
```

### 7. Service Account 키 생성
1. 프로젝트 설정 > "서비스 계정" 탭
2. "새 비공개 키 생성" 클릭
3. JSON 키 다운로드
4. 파일 이름을 `serviceAccountKey.json`으로 변경
5. 프로젝트 루트에 저장 (또는 안전한 위치에 보관)
   - ⚠️ **절대 Git에 커밋하지 마세요!**
   - `.gitignore`에 추가되어 있는지 확인

---

## 환경 변수 설정

### 1. `.env` 파일 생성

프로젝트 루트에 `.env` 파일을 생성하고 다음 내용을 입력:

```bash
# ====================================
# 프로덕션 환경 설정
# ====================================

# Node Environment
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
# Firebase Console에서 복사한 값으로 대체

VITE_FIREBASE_API_KEY=AIza...
VITE_FIREBASE_AUTH_DOMAIN=zetalab-product-builder.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=zetalab-product-builder
VITE_FIREBASE_STORAGE_BUCKET=zetalab-product-builder.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=123456789
VITE_FIREBASE_APP_ID=1:123456789:web:abcdef

# ====================================
# Google Gemini API
# ====================================
# https://makersuite.google.com/app/apikey 에서 발급

GEMINI_API_KEY=your_gemini_api_key_here
```

### 2. Gemini API 키 발급
1. https://makersuite.google.com/app/apikey 접속
2. "API 키 만들기" 클릭
3. 생성된 키를 `.env`의 `GEMINI_API_KEY`에 입력

---

## 로그인/로그아웃 시스템 확인

### ✅ 구현된 기능

#### 1. **클라이언트 사이드 (Firebase Auth)**
- **파일**: `client/src/lib/firebase.ts`
- **기능**:
  - Google Sign-In 팝업
  - ID 토큰 발급
  - 세션 쿠키 생성 요청
  - 로그아웃

#### 2. **백엔드 (Firebase Admin SDK)**
- **파일**: `server/_core/firebase-auth.ts`
- **엔드포인트**:
  - `POST /api/auth/session` - ID 토큰으로 세션 쿠키 생성
  - `POST /api/auth/logout` - 세션 쿠키 삭제
  - `POST /api/auth/verify` - 세션 검증

#### 3. **tRPC 인증**
- **파일**: `server/_core/context.ts`
- **기능**:
  - 모든 tRPC 요청에서 세션 쿠키 검증
  - 사용자 정보 조회
  - `protectedProcedure`로 인증 보호

#### 4. **UI 컴포넌트**
- **LoginModal**: Firebase 로그인 모달
- **Sidebar/Header**: 로그아웃 버튼
- **로그인 게이트**: 프롬프트 생성 시 자동 로그인 유도

### 로그인 플로우

```
1. 사용자가 "Google로 계속하기" 클릭
   ↓
2. Firebase Google Sign-In 팝업 표시
   ↓
3. 사용자가 Google 계정 선택
   ↓
4. Firebase ID 토큰 발급
   ↓
5. POST /api/auth/session (ID 토큰 전송)
   ↓
6. 백엔드에서 ID 토큰 검증
   ↓
7. 세션 쿠키 생성 (1년 유효)
   ↓
8. Firestore에 사용자 정보 저장
   ↓
9. 쿠키 설정 완료
   ↓
10. 사용자 인증 완료 ✅
```

### 로그아웃 플로우

```
1. 사용자가 로그아웃 버튼 클릭
   ↓
2. trpc.auth.logout.useMutation() 호출
   ↓
3. 백엔드에서 세션 쿠키 삭제
   ↓
4. 클라이언트 상태 초기화
   ↓
5. 로그아웃 완료 ✅
```

---

## 배포 전 체크리스트

### 🔒 보안

- [ ] `.env` 파일이 `.gitignore`에 포함되어 있는지 확인
- [ ] `serviceAccountKey.json`이 Git에 커밋되지 않았는지 확인
- [ ] Firestore 보안 규칙 설정 (`firestore.rules` 적용)
- [ ] Storage 보안 규칙 설정 (`storage.rules` 적용)
- [ ] 프로덕션 환경 변수 설정 확인

### 🧪 테스트

- [ ] 개발 모드에서 로그인/로그아웃 테스트
- [ ] `.env`에서 `DEV_AUTO_LOGIN=false` 설정 후 실제 로그인 테스트
- [ ] Google Sign-In 작동 확인
- [ ] 세션 유지 테스트 (페이지 새로고침)
- [ ] 프롬프트 생성 전체 플로우 테스트
- [ ] 로그아웃 후 보호된 페이지 접근 차단 확인

### 🚀 Firebase 배포

```bash
# Firebase CLI 설치
npm install -g firebase-tools

# Firebase 로그인
firebase login

# 프로젝트 초기화 (이미 완료됨)
# firebase init

# Firestore 보안 규칙 배포
firebase deploy --only firestore:rules

# Storage 보안 규칙 배포
firebase deploy --only storage

# 인덱스 배포
firebase deploy --only firestore:indexes

# (선택) Functions 배포
# firebase deploy --only functions

# (선택) Hosting 배포
# firebase deploy --only hosting
```

### 📦 프로덕션 빌드

```bash
# 의존성 설치
npm install

# 프로덕션 빌드
npm run build

# 프로덕션 서버 실행
npm start
```

---

## 트러블슈팅

### 문제: "Permission denied on resource project"
**해결**: Service Account 키가 올바르게 설정되었는지 확인

### 문제: "Firebase app not initialized"
**해결**: 클라이언트 환경 변수 (`VITE_FIREBASE_*`)가 올바르게 설정되었는지 확인

### 문제: "Session cookie verification failed"
**해결**:
1. 서버와 클라이언트가 같은 도메인을 사용하는지 확인
2. 쿠키 설정이 올바른지 확인 (`httpOnly`, `secure`, `sameSite`)

### 문제: Google Sign-In 팝업이 차단됨
**해결**: 브라우저 팝업 차단 설정 해제

---

## 추가 개선 사항 (선택)

### 1. 이메일/비밀번호 로그인 추가
```typescript
// lib/firebase.ts에 추가
import { signInWithEmailAndPassword } from 'firebase/auth';

export async function signInWithEmail(email: string, password: string) {
  const result = await signInWithEmailAndPassword(auth, email, password);
  // 세션 생성 로직...
}
```

### 2. 소셜 로그인 추가 (GitHub, Apple, Microsoft)
```typescript
// 각 Provider 설정
const githubProvider = new GithubAuthProvider();
const appleProvider = new OAuthProvider('apple.com');
```

### 3. 이메일 인증
```typescript
import { sendEmailVerification } from 'firebase/auth';

await sendEmailVerification(user);
```

### 4. 비밀번호 재설정
```typescript
import { sendPasswordResetEmail } from 'firebase/auth';

await sendPasswordResetEmail(auth, email);
```

---

## 문의 및 지원

문제가 발생하면 다음을 확인하세요:
1. Firebase Console 로그
2. 브라우저 개발자 도구 콘솔
3. 서버 로그 (`npm run dev`)

**문서 버전**: 1.0
**최종 업데이트**: 2026년 2월 7일

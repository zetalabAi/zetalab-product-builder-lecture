# ZetaLab Product Builder

ZetaLab Product Builder는 Google Firebase와 Gemini AI를 활용한 프로덕트 빌더 플랫폼입니다.

## 🚀 기술 스택

### 프론트엔드
- **React 19** - UI 라이브러리
- **TypeScript** - 타입 안정성
- **Vite** - 빌드 도구
- **Tailwind CSS** - 스타일링
- **shadcn/ui** - UI 컴포넌트
- **tRPC** - 타입 안전 API 클라이언트
- **TanStack Query** - 서버 상태 관리

### 백엔드
- **Firebase Authentication** - Google 로그인
- **Firestore** - NoSQL 데이터베이스
- **Firebase Storage** - 파일 저장소
- **Firebase Cloud Functions** - 서버리스 함수
- **Google Gemini API** - AI 통합

### 개발 도구
- **pnpm** - 패키지 관리자
- **Vitest** - 테스트 프레임워크
- **Prettier** - 코드 포매터

## 📦 설치

```bash
# 의존성 설치
pnpm install

# 환경 변수 설정
cp .env.example .env
# .env 파일을 편집하여 Firebase 및 Gemini API 키 설정
```

## 🔧 환경 변수

`.env` 파일에 다음 변수들을 설정하세요:

```env
# Firebase Configuration
FIREBASE_PROJECT_ID=your-project-id
FIREBASE_STORAGE_BUCKET=your-project-id.appspot.com

# Google Gemini API
GEMINI_API_KEY=your_gemini_api_key

# Node Environment
NODE_ENV=development
PORT=3000
```

### API 키 발급 방법

1. **Firebase 프로젝트 생성**
   - [Firebase Console](https://console.firebase.google.com/)에서 프로젝트 생성
   - Authentication에서 Google 로그인 활성화
   - Firestore Database 생성
   - Storage 활성화

2. **Gemini API 키 발급**
   - [Google AI Studio](https://aistudio.google.com/)에서 API 키 발급
   - 또는 [Google Cloud Console](https://console.cloud.google.com/)에서 Vertex AI API 활성화

## 🛠️ 개발

```bash
# 개발 서버 시작
pnpm dev

# 타입 체크
pnpm check

# 테스트 실행
pnpm test

# 코드 포맷팅
pnpm format
```

## 🚀 배포

### Firebase 배포

```bash
# Firebase CLI 설치 (한 번만)
npm install -g firebase-tools

# Firebase 로그인
firebase login

# Firebase 프로젝트 초기화 (한 번만)
firebase init

# 빌드 및 배포
pnpm build
firebase deploy
```

### Firebase Emulator로 로컬 테스트

```bash
# Emulator 시작
pnpm firebase:serve
```

## 📁 프로젝트 구조

```
zetalab-product-builder/
├── client/                 # 프론트엔드
│   ├── src/
│   │   ├── components/     # React 컴포넌트
│   │   ├── pages/          # 페이지 컴포넌트
│   │   ├── hooks/          # 커스텀 훅
│   │   ├── lib/            # 유틸리티
│   │   └── main.tsx        # 엔트리 포인트
│   └── public/             # 정적 파일
├── server/                 # 백엔드
│   ├── _core/              # 코어 유틸리티
│   │   ├── llm.ts          # Gemini AI 통합
│   │   ├── trpc.ts         # tRPC 설정
│   │   └── context.ts      # tRPC 컨텍스트
│   ├── routers.ts          # API 라우터
│   └── storage.ts          # Firebase Storage 헬퍼
├── shared/                 # 공유 코드
│   ├── types.ts            # 공유 타입
│   └── const.ts            # 공유 상수
├── firebase.json           # Firebase 설정
├── firestore.rules         # Firestore 보안 규칙
├── firestore.indexes.json  # Firestore 인덱스
├── storage.rules           # Storage 보안 규칙
├── package.json            # 의존성
└── tsconfig.json           # TypeScript 설정
```

## 📚 주요 기능

- ✅ Google 로그인 인증
- ✅ Firestore 기반 데이터 관리
- ✅ Firebase Storage 파일 업로드
- ✅ Gemini AI 통합
- ✅ 타입 안전 API (tRPC)
- ✅ 실시간 데이터 동기화
- ✅ 반응형 UI (Tailwind CSS)
- ✅ 다크 모드 지원

## 🔒 보안

- Firebase Authentication으로 사용자 인증
- Firestore Security Rules로 데이터 접근 제어
- Storage Rules로 파일 업로드 제한
- tRPC protectedProcedure로 API 보호

## 📖 문서

- [ARCHITECTURE.md](./ARCHITECTURE.md) - 아키텍처 문서
- [Firebase Documentation](https://firebase.google.com/docs)
- [Gemini API Documentation](https://ai.google.dev/docs)
- [tRPC Documentation](https://trpc.io/)

## 🤝 기여

기여는 언제나 환영합니다! Pull Request를 보내주세요.

## 📄 라이선스

MIT License

## 🔗 링크

- [GitHub Repository](https://github.com/zetalabAi/zetalab-product-builder-lecture)
- [Firebase Console](https://console.firebase.google.com/)
- [Google AI Studio](https://aistudio.google.com/)

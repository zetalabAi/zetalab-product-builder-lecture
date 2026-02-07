# ZetaLab TODO

## 데이터베이스 스키마
- [x] 프롬프트 히스토리 테이블 추가
- [x] Intent 템플릿 테이블 추가

## 백엔드 API
- [x] Intent Clarification 질문 생성 API (템플릿 기반)
- [x] Intent 답변 처리 API
- [x] 프롬프트 생성 API (LLM 활용)
- [x] 프롬프트 수정 API
- [x] 프롬프트 히스토리 조회 API

## 프론트엔드 UI
- [x] 메인 페이지 최소 UI 구현 (중앙 입력창 + 문구)
- [x] 좌측 사이드바 Builder Box 구현
- [x] Builder Box 준비중 모달 구현
- [x] Intent Clarification 단계별 UI 구현
- [x] 프롬프트 결과 화면 구현
- [x] 프롬프트 편집 기능 구현
- [x] 프롬프트 복사 기능 구현
- [x] 관련 서비스 추천 UI 구현
- [x] 프롬프트 히스토리 페이지 구현
- [x] 반응형 디자인 적용

## 통합 및 테스트
- [x] 전체 워크플로우 통합 테스트
- [x] 모바일 반응형 테스트
- [x] 프롬프트 품질 검증 테스트
- [x] Builder Box 클릭 시 준비중 알림 테스트

## 배포 준비
- [x] 최종 체크포인트 생성
- [x] 배포 문서 작성

## 디자인 개편 및 신규 기능
- [x] 밝은/어두운 테마 전환 기능 추가
- [x] Claude.ai 스타일 폰트 적용 (system fonts)
- [x] Claude.ai 스타일 컴러 시스템 적용
- [x] Claude.ai 스타일 인터페이스 디자인 적용
- [x] 프롬프트 템플릿 라이브러리 데이터베이스 스키마 추가
- [x] 프롬프트 템플릿 CRUD API 구현
- [x] 프롬프트 템플릿 UI 구현 (생성, 조회, 수정, 삭제)
- [x] 템플릿 활용 워크플로우 통합
- [x] Builder Box를 드롭다운 버튼으로 변경
- [x] Builder Box 드롭다운 애니메이션 구현
- [x] Builder Box 클릭 시 새 창 열기 준비 (현재는 준비중 알림)
- [x] 전체 UI/UX 개선 및 통합 테스트

## UI/UX 전면 개편 (Claude.ai 스타일)
- [x] 모든 이모지 제거
- [x] 프로필 이미지 적용
- [x] Inter 폰트로 변경
- [x] 좌측 사이드바 패널 구현
  - [x] 새 채팅 버튼
  - [x] 검색 기능
  - [x] 채팅 목록
  - [x] 프로젝트 메뉴
  - [x] 아티팩트 메뉴
  - [x] 코드 메뉴
- [x] 사이드바 토글 버튼 구현
- [x] 사이드바 너비 조절 기능
- [x] 사이드바 하단 프로필 표시
- [x] 프로필 클릭 시 메뉴 (설정, 언어, 도움 받기)
- [x] 설정 페이지 구현
  - [x] 일반 설정
  - [x] 계정 설정
  - [x] 개인정보보호 설정
  - [x] 결제 설정
  - [x] 기능 설정 (준비중)
  - [x] 커넥터 설정 (준비중)

## 사이드바 UI 개선
- [x] 토글 버튼 위치 수정 (패널 우측 바깥에 고정, 토글 시 따라다니기)
- [x] "코드" 메뉴를 Builder Box 드롭다운으로 교체 (이모지 제거)

## PromptResult 페이지 색상 수정
- [x] 원본 질문 텍스트 색상 흰색으로 변경
- [x] 버튼 텍스트 색상 검은색으로 변경

## UI 전면 리뉴얼 (Japandi + Neo-Brutalism)
- [x] Pretendard 폰트 적용
- [x] 다크 그라데이션 배경 적용
- [x] Glassmorphism 카드 스타일 구현
- [x] Bento Grid 레이아웃으로 대시보드 재구성
- [x] Home 페이지 UI 리뉴얼
- [ ] IntentClarification 페이지 UI 리뉴얼
- [ ] PromptResult 페이지 UI 리뉴얼
- [ ] History 페이지 UI 리뉴얼
- [ ] Templates 페이지 UI 리뉴얼
- [ ] Settings 페이지 UI 리뉴얼
- [ ] Sidebar UI 리뉴얼
- [ ] 데스크톱 그리드 뷰 최적화
- [ ] 모바일 스택 뷰 및 하단 플로팅 메뉴 구현
- [ ] 모든 기존 기능 및 로직 보존 확인

## ChatGPT 스타일 UI 전면 리뉴얼
- [x] 사이드바 Partial Collapse 기능 구현
  - [x] 토글 버튼을 패널 내부 우측으로 이동
  - [x] 축소 시 아이콘만 남기는 기능
  - [x] 확장/축소 애니메이션
- [x] 메인 컨텐츠 영역 대화형 UI 재설계
  - [x] Bento Grid 제거
  - [x] ChatGPT 스타일 화이트/라이트 모드
  - [x] 질문 입력창 강조
  - [x] 대화형 레이아웃
- [ ] 전체 페이지 ChatGPT 스타일 적용
  - [x] Home 페이지
  - [x] IntentClarification 페이지
  - [x] PromptResult 페이지
  - [x] History 페이지
  - [x] Templates 페이지
  - [x] Settings 페이지

## 다크/라이트 모드 색상 시스템 수정
- [x] CSS 변수 색상 시스템 오류 분석
- [x] 다크 모드 배경/텍스트 색상 수정
- [x] 라이트 모드 배경/텍스트 색상 수정
- [x] 모든 페이지 색상 일관성 확인
- [x] 테마 전환 시 색상 대비 검증

## BuilderBox 레이아웃 분리 및 고정 탭 구조 개선
- [x] Sidebar 구조 분석 및 BuilderBox 위치 파악
- [x] BuilderBox를 좌측 상단 고정 탭 영역으로 분리
- [x] 최근 항목 영역을 독립 스크롤 컸테이너로 분리
- [x] BuilderBox 확장 시 최근 항목 영역 가리지 않도록 수정
- [x] 레이아웃 점프(CLS) 방지 확인
- [x] 전체 UX 테스트 및 검증

## BuilderBox 아이콘 변경
- [x] BuilderBox 아이콘을 Box에서 Container로 변경

## Home.tsx 프롬프트 예시 텍스트 수정
- [x] "SEO 최적화된 블로그 글을 어떻게 쓸까요?" → "2026년 트랜드에 대해 블로그 글을 써줘"
- [x] "독특한 유튜브 컨텐츠 아이디어를 추천해주세요" → "유튜브 쇼츠 대본을 만들어주세요"
- [x] "추가 질문 없이 결과 도출" → "질문에 답만해도 완성"

## IntentClarification 질문 개선
- [x] 현재 IntentClarification 페이지 로직 분석
- [x] Builder 타입별 맞춤형 질문 세트 설계
  - [x] 블로그/글쓰기용 질문
  - [x] 영상/쇼츠용 질문
  - [x] PPT/프레젠테이션용 질문
  - [x] UI/UX 디자인용 질문
  - [x] 기타 컨텐츠용 질문
- [x] 질문 1: "구체적으로 어떤 도움이 필요하신가요?" 개선
- [x] 질문 2: "이 작업의 최종 목표는 무엇인가요?" 개선
- [x] 질문 3: "현재 어떤 단계에 있나요?" 개선
- [x] 질문 4: "특별히 고려해야 할 제약 사항이 있나요?" 개선
- [x] 질문 5: "결과물의 형식은 어떻게 받고 싶은가요?" 개선
- [x] 수정된 질문으로 IntentClarification 페이지 업데이트
- [x] 테스트 및 검증

## 무한 로그인 루프 문제 해결
- [x] 문제 재현 및 시나리오 파악
- [x] 브라우저 네트워크 로그 분석
- [x] 서버 로그 분석
- [x] OAuth 콜백 로직 검토
- [x] 세션 쿠키 설정 확인
- [x] 리다이렉트 로직 수정
- [x] 테스트 및 검증

## 사이드바 구조 재편성 및 기능 개선
- [x] 최근 항목 → "모든 작업"으로 명칭 변경
- [x] 더미 데이터 3개 삭제 (마리본드 AI, AI 감지기, 유튜브 채널)
- [x] 제타랩 철학/기능 설명 컨텐츠 작성 및 추가
- [x] 사이드바 메뉴 순서 변경:
  - [x] 새 채팅
  - [x] 검색
  - [x] 채팅
  - [x] 아티팩트 (프롬프트 저장 기능)
  - [x] 프로젝트 (폴더 관리 기능)
  - [x] Builder Box

## 프로젝트 기능 구현 (폴더 관리)
- [ ] 프로젝트 데이터베이스 스키마 설계
- [ ] 프로젝트 생성/수정/삭제 API 구현
- [ ] 프로젝트 목록 UI 구현
- [ ] 작업을 프로젝트에 할당하는 기능 구현
- [ ] 프로젝트별 작업 필터링 기능

## 아티팩트 기능 구현 (프롬프트 저장)
- [ ] 아티팩트 데이터베이스 스키마 설계
- [ ] 프롬프트 저장 API 구현
- [ ] 저장된 프롬프트 목록 UI 구현
- [ ] 프롬프트 재사용 기능 구현
- [ ] 프롬프트 검색/필터링 기능

## 테마 토글 버튼 추가
- [x] 우측 상단에 태양/달 아이콘 토글 버튼 추가
- [x] 테마 전환 애니메이션 구현
- [x] 테마 설정 로컬 스토리지 저장

## 불필요한 페이지 제거
- [x] Templates 페이지 기능 확인 및 제거 여부 결정
- [x] IntentClarification 페이지 라우팅 확인 (유지)
- [x] PromptResult 페이지 기능 확인 (유지)
- [x] History 페이지 기능 확인 (유지)
- [x] 사용하지 않는 라우트 제거 (Templates 제거 완료)

## 사용자 정보 수집 개선
- [ ] OAuth 로그인 시 이메일, 이름, 전화번호 수집
- [ ] 사용자 프로필 데이터베이스 스키마 확장
- [ ] 사용자 정보 표시 UI 개선

## 구독결제 시스템 아이디어
- [x] 구독 플랜 설계 (무료/프리미엄/프로/엔터프라이즈)
- [x] 결제 시스템 아이디어 브리핑 문서 작성

## SEO 최적화 개선
- [x] 메타 태그 추가 (description, keywords, og:tags)
- [x] 페이지 제목 30-60자로 조정
- [x] H2 제목 추가
- [x] 키워드 최적화
- [x] 이미지 alt 텍스트 추가
- [x] SEO 검증 및 테스트

## SEO 고급 최적화
- [x] Schema.org JSON-LD 추가 (Organization, WebSite, WebPage)
- [x] sitemap.xml 생성
- [x] robots.txt 생성
- [x] 이미지 lazy loading 구현
- [x] 폰트 최적화 (preload, font-display: swap)
- [x] CSS/JS 번들 크기 분석 및 최적화
- [x] Core Web Vitals 측정 및 개선

## 사이드바 및 홈 페이지 UI 개선
- [x] 사이드바 "모든 작업" 섹션에서 가이드 항목 3개 제거
- [x] 실제 대화 내역만 표시하도록 수정
- [x] 홈 페이지 "ZetaLab의 특별한 기능" 카드를 가로형 레이아웃으로 변경
- [x] 카드 높이 축소 및 컴팩트한 디자인 적용

## 로고 이미지 교체
- [x] 새 로고 이미지를 public 폴더로 복사
- [x] Sidebar 컴포넌트에서 로고 경로 업데이트 (이미 설정됨)
- [x] 로고 표시 확인 및 테스트

## 대화 내역 API 연동 및 검색 기능
- [x] 데이터베이스 스키마 설계 (promptHistory 테이블 활용)
- [x] 마이그레이션 SQL 생성 및 실행 (기존 테이블 사용)
- [x] tRPC 프로시저 구현 (searchHistory, deleteHistory 추가)
- [x] 프론트엔드 Sidebar에서 API 연동
- [x] 검색 기능 구현 (제목/내용 필터링)
- [x] 최근 순 정렬 적용
- [x] 빈 상태 메시지 추가
- [x] 테스트 작성 및 실행 (7개 테스트 통과)

## 대화 삭제 기능 UI 구현
- [x] Sidebar 대화 항목에 삭제 버튼 추가 (hover 시 표시)
- [x] 삭제 확인 다이얼로그 구현
- [x] deleteHistory API 연동
- [x] 삭제 후 목록 자동 갱신
- [x] 삭제 성공/실패 토스트 메시지

## 대화 상세 페이지 구현
- [x] /history/:id 라우트 추가
- [x] 대화 상세 정보 표시 (원본 질문, Intent 답변, 생성된 프롬프트)
- [x] 프롬프트 편집 기능 통합
- [x] 프롬프트 복사 기능
- [x] 관련 서비스 추천 표시
- [x] 뒤로가기 버튼 추가

## 프로젝트 폴더 기능 구현
- [x] 프로젝트 데이터베이스 스키마 설계 (projects 테이블)
- [x] 프로젝트-대화 관계 테이블 설계 (project_conversations)
- [x] 마이그레이션 SQL 생성 및 실행
- [x] 프로젝트 CRUD API 구현 (생성, 조회, 수정, 삭제)
- [x] 대화를 프로젝트에 할당/해제하는 API
- [x] Sidebar에 프로젝트 메뉴 활성화
- [x] 프로젝트 생성/수정/삭제 UI
- [x] 프로젝트별 대화 필터링 기능
- [x] 프로젝트 목록 페이지 및 상세 페이지
- [x] 테스트 작성 및 검증 (9개 테스트 통과)

## 로그인/로그아웃 시스템 문제 해결
- [x] 현재 인증 시스템 코드 분석 (useAuth, Sidebar 로그아웃 버튼)
- [x] 로그아웃 API 엔드포인트 확인
- [x] 쿠키 처리 로직 검토
- [x] 문제 원인 파악 (로그아웃 후 리다이렉션 누락)
- [x] 로그아웃 기능 수정 (useAuth에 리다이렉션 추가)
- [x] 테스트 작성 및 검증 (2개 테스트 통과)

## 프로젝트 문서화 (spec.md, ARCHITECTURE.md)
- [x] 현재 구현된 기능, 데이터 흐름, 폴더 구조 분석
- [x] spec.md 작성 - 실제 동작하는 기능만 명세
- [x] ARCHITECTURE.md 작성 - 기술 스택, 폴더 구조, 코딩 컨벤션, 패턴 정리
- [x] 위험 요소 파악 및 문서에 반영
- [x] 체크포인트 생성

## 인증 버그 완전 수정 (최우선)
- [x] AuthTrace 진단 로깅 추가 (프론트: 세션 체크, authState 변경, userPanel 렌더)
- [x] AuthTrace 진단 로깅 추가 (서버: /api/auth/session 응답 직전)
- [x] 프론트: authStatus 3상태 강제 (unknown, guest, authed)
- [x] 프론트: 로그아웃 후 홈 유지 (로그인 모달 자동 표시 금지)
- [x] 프론트: 좌측 하단 유저 패널 렌더 규칙 적용
- [x] 원인 분기 테스트 (시크릿 모드, 새 브라우저)
- [x] 원인 분기 판정 (F: 프론트 문제 - localStorage)
- [x] 프론트: 하드코딩/데모 유저 전수 제거 (main.tsx localStorage 정리)
- [x] 프론트: 홈 Public 화 (로딩 화면 제거, 전역 리다이렉션 제거)
- [x] 프론트: 로그인 게이트 행동 시점으로 제한 (Home.tsx handleSubmit)
- [x] 서버: 세션 키/스토어 점검 (정상 - sdk.authenticateRequest)
- [x] 서버: 쿠키 설정 점검 및 수정 (sameSite: lax로 변경)
- [x] 서버: 캐시/프록시 오염 방지 (auth.me에 Cache-Control 헤더 추가)
- [x] 서버: 로그아웃 서버 동작 확인 (clearCookie 정상)
- [x] 최종 검증: TC1 통과 (localStorage 정리 성공, 쿠키 없음, 홈 Public 접근)
- [ ] 최종 검증: TC2~TC6 테스트 (사용자 직접 테스트 필요)
- [x] 체크포인트 생성 (b4d4df54)

## 로그인 모달 구현 (긴급)
- [x] 로그인 모달 컴포넌트 생성 (LoginModal.tsx)
- [x] OAuth 버튼 (Google, Microsoft, Apple) 추가
- [x] Sidebar 로그인 버튼 클릭 시 모달 표시
- [x] Home handleSubmit에서 모달 표시
- [x] 모달 디자인 (Manus 스타일 참고)
- [x] 테스트 및 체크포인트 생성 (00199a83)

## 접힌 사이드바 프로필 아이콘 Manus IM 이동 문제 (긴급)
- [x] Sidebar.tsx 접힌 상태 하단 프로필 아이콘 찾기
- [x] 프로필 아이콘 클릭 시 로그인 모달 표시로 변경
- [x] 테스트 및 체크포인트 생성 (5273a196)

## Manus 친구 초대 시스템 연동 (신규 가입자 → 소유자 크레딧 500개)
- [x] Manus API 문서 검색 - 레퍼럴/친구 초대 시스템 확인
- [x] OAuth 로그인 URL에 레퍼럴 코드 파라미터 추가 (https://manus.im/invitation/9Q3K8IKETUZIDE)
- [x] 로그인 모달에 "ZetaLab 가입 시 Manus 계정도 함께 생성됩니다" 안내 문구 추가
- [x] 테스트 및 체크포인트 생성 (a7ec7421)

## 모바일 최적화 (우선순위 높음)
- [x] 모바일 레이아웃 분석 및 반응형 브레이크포인트 확인 (768px)
- [x] 햄버거 메뉴 Drawer 컴포넌트 생성 (MobileDrawer.tsx)
- [x] 모뱔일에서 사이드바 숨김 처리 (MainLayout.tsx)
- [x] 모바일 홈 화면 최적화 - 입력창 강조, CTA 버튼 크기 조정 (Home.tsx)
- [x] Intent Clarification 단계형 UX 구현 (한 화면 = 한 질문) - 모바일 최적화 완료
- [x] 모바일 성능 최적화 - Lazy Load 적용 (App.tsx React.lazy)
- [ ] 불필요한 컴포넌트 제거 (에디터, 카드 UI, 프리뷰)
- [x] 터치 UX 개선 - 버튼 최소 44px, 입력창 자동 조정
- [x] 키보드 올라올 때 화면 가려짐 방지 (scrollIntoView 추가)
- [ ] 모바일 테스트 (iPhone, Android)
- [ ] 체크포인트 생성

## MobileDrawer Builder Box 복원 (긴급)
- [x] 웹 버전 Sidebar의 Builder Box 구조 분석
- [x] MobileDrawer에 Builder Box 동일하게 복원
- [x] 드롭다운 기능 포함
- [x] 준비중 모달 연동
- [x] 체크포인트 생성

## MobileDrawer 전체 구조 구현 (최우선)
- [x] 웹 Sidebar 전체 구조 분석 (새 채팅, 검색, 채팅, 아티팩트, 프로젝트, Builder Box, 모든 작업)
- [x] MobileDrawer에 새 채팅 버튼 추가
- [x] MobileDrawer에 검색 기능 추가
- [x] MobileDrawer에 채팅/아티팩트/프로젝트 메뉴 추가
- [x] MobileDrawer에 모든 작업 (대화 목록) 추가
- [x] 각 메뉴 클릭 시 동작 연동
- [x] 체크포인트 생성

## 홈 화면 레이아웃 수정
- [x] Home.tsx에서 명령어 입력창을 위로 이동 (타이틀 바로 아래)
- [x] 레이아웃 순서: 타이틀 → 서브타이틀 → 입력창 → 예시 카드 → 특별한 기능
- [x] 체크포인트 생성

## 모바일 앱 버전 예시 카드 수정 (웹은 유지)
- [x] Home.tsx에서 모바일(768px 이하)만 2x2 그리드 적용
- [x] 모바일에서만 설명(description) 숨김
- [x] 웹 버전(768px 이상)은 기존 레이아웃 유지
- [x] 체크포인트 생성

## 모바일 앱 버전 스크롤바 시각화 제거
- [x] index.css에 모바일 전용 스크롤바 숨김 CSS 추가
- [x] webkit, Firefox, IE 모두 지원
- [x] 스크롤 기능은 유지
- [x] 체크포인트 생성

## Builder Box UI 개선 (웹 + 앱)
- [x] Sidebar.tsx에 Builder Box 아래 "준비중. 진짜 곳 나와요!" 메시지 고정 표시
- [x] Sidebar.tsx의 Builder Box 항목들 회색(비활성화) 스타일 적용
- [x] 기존 토스트 알림 제거
- [x] MobileDrawer.tsx에 Builder Box 아래 "준비중. 진짜 곳 나와요!" 메시지 고정 표시
- [x] MobileDrawer.tsx의 Builder Box 항목들 회색(비활성화) 스타일 적용
- [x] 체크포인트 생성

## Builder Box 호버 시 준비중 아이콘 추가
- [x] Sidebar.tsx Builder Box 타이틀에 호버 시 시계 아이콘 표시
- [x] MobileDrawer.tsx Builder Box 타이틀에 호버 시 시계 아이콘 표시
- [x] 체크포인트 생성

## OAuth 로그인 플로우 수정 (최우선)
- [x] 현재 OAuth 콜백 URL 확인 및 ZetaLab 리다이렉트로 수정
- [x] Manus 연동 동의 모달 컴포넌트 구현 (ManusConsentModal.tsx)
- [x] user 테이블에 manusLinked 필드 추가 (DB 마이그레이션 완료)
- [x] 첫 로그인 시 동의 모달 표시 로직 (Home.tsx)
- [x] 동의 시: manusLinked=1 업데이트 + Manus 초대 링크로 이동 + 1800 크레딧 안내
- [x] 거절 시: ZetaLab 홈으로 (다음 로그인 시 다시 모달)
- [x] 웹과 모바일 앱 모두 적용 (Home.tsx에 구현, 모든 페이지에서 접근 가능)
- [x] 테스트 및 체크포인트 생성

## 일반 로그인 시스템 구현 (최우선)
- [x] Manus 레퍼럴 관련 코드 제거 (ManusConsentModal, manusLinked 필드 등)
- [x] LoginModal을 일반 OAuth 로그인으로 수정
- [x] 헤더에 로그인/로그아웃 버튼 시각화 (Sidebar 하단 프로필 영역)
- [x] 프로필 페이지 구현 (/profile)
- [x] 프로필 페이지에서 사용자 정보 표시 (이름, 이메일, 가입일, 역할)
- [x] 개인정보 보호 로직 (로그인하지 않은 사용자 접근 불가)
- [x] 로그아웃 버튼 추가 (Sidebar 드롭다운 메뉴)
- [x] 웹과 모바일 앱 모두 적용 (Sidebar + MobileDrawer)
- [x] 테스트 및 체크포인트 생성

## Home 페이지 로그인 에러 수정 (긴급)
- [x] Home.tsx에서 로그인 요구 API 호출 찾기 (useAuth import 누락)
- [x] 비로그인 상태에서도 접근 가능하도록 수정 (useAuth import 추가)
- [x] 테스트 및 체크포인트 생성

## 모바일 프로필 설정 화면 네이티브 앱 스타일 재구성 (최우선)
- [x] 현재 Settings 페이지 구조 분석
- [x] 모바일 전용 Settings Home 화면 구현 (프로필 카드 + 설정 리스트 + 로그아웃)
- [x] 각 설정 항목별 독립 화면 구현 (계정, 개인정보 보호, 결제, 기능, 커넥터)
- [x] 네이티브 앱 스타일 네비게이션 (뒤로가기 + 타이틀)
- [x] 터치 영역 최소 44px 확보 (minHeight: 44px)
- [x] 웹 레이아웃은 절대 수정하지 않음 (768px 이상 hidden md:block)
- [x] 테스트 및 체크포인트 생성

## Profile 페이지 제거 및 프로필 클릭 시 Settings로 직접 이동
- [x] Profile.tsx 페이지 파일 삭제
- [x] App.tsx에서 /profile 라우트 제거
- [x] Sidebar의 프로필 클릭 시 /settings로 이동하도록 수정
- [x] MobileDrawer의 프로필 클릭 시 /settings로 이동하도록 수정
- [x] 테스트 및 체크포인트 생성

## Settings 페이지 더미 결제 데이터 제거 (긴급)
- [x] Settings.tsx에서 더미 청구서 데이터 제거 (2개 항목 삭제)
- [x] 실제 결제 내역이 없으면 "결제 내역이 없습니다" 표시
- [x] 체크포인트 생성

## Settings 페이지 더미 결제 데이터 제거 (긴급)
- [x] Settings.tsx에서 더미 청구서 데이터 제거 (2개 항목 삭제)
- [x] 실제 결제 내역이 없으면 "결제 내역이 없습니다" 표시
- [x] 체크포인트 생성

## 모바일 홈 화면 간소화 (최우선)
- [x] Home.tsx에서 모바일 버전만 수정 (데스크톱은 유지)
- [x] 모바일: "AI 프롬프트 생성 예시" 섹션 제거 (md:hidden)
- [x] 모바일: "ZetaLab의 특별한 기능" 섹션 제거 (md:hidden)
- [x] 모바일: 타이틀 + 서브타이틀 + 입력창만 남기고 중앙 정렬 유지
- [x] 모바일: "Shift + Enter로 줄바꾸, Enter로 전송" 안내문구도 숨김
- [x] 데스크톱: 기존 레이아웃 그대로 유지
- [x] 체크포인트 생성

## 모바일 키보드 대응 (Keyboard-aware Layout) - 최상위 레벨 구현
- [x] App.tsx에 KeyboardAwareLayout 컴포넌트 추가
- [x] visualViewport API로 키보드 높이 감지
- [x] 키보드 높이를 CSS 변수(--keyboard-height)로 전달
- [x] 포커스된 입력창 자동 스크롤 (scrollIntoView)
- [x] blur 시 원래 레이아웃 복원 (--keyboard-height: 0px)
- [x] body padding-bottom으로 하단 여백 자동 조정
- [x] 모든 페이지에 자동 적용 (페이지별 예외 처리 없음)
- [x] 체크포인트 생성

## MobileDrawer 로고 영역 홈 링크 추가
- [x] MobileDrawer.tsx의 ZetaLab 로고 영역을 Link로 감싸기
- [x] 터치 시 메인 홈페이지(/)로 이동
- [x] 터치 피드백 추가 (hover:opacity-80)
- [x] touch-manipulation 클래스 추가
- [x] 체크포인트 생성

## 모바일 홈 화면 "ⓘ 사용법" 버튼 및 Bottom Sheet 추가
- [x] UsageBottomSheet 컴포넌트 생성 (client/src/components/UsageBottomSheet.tsx)
- [x] 하단 슬라이드 업 애니메이션 구현 (slide-in-from-bottom)
- [x] 우측 상단 ✕ 버튼 추가
- [x] 배경 dim 처리 (bg-black/40) 및 바깥 영역 탭 시 닫힘
- [x] 팝업 내용: "막연하게 질문해도 괜찮아요. AI가 다시 질문할 거예요. 답변만 해주면 완벽한 프롬프트가 완성됩니다!"
- [x] Home.tsx에 "Info 사용법" 버튼 추가 (입력창 우측 하단)
- [x] 버튼 스타일: text-muted-foreground, hover:text-foreground, hover:bg-secondary
- [x] 모바일 터치 영역: px-3 py-2 + touch-manipulation
- [x] 닫을 때 입력창 포커스 복귀 (300ms delay)
- [x] ESC 키로 닫기 기능 추가
- [x] 바디 스크롤 방지 (overflow: hidden)
- [x] 체크포인트 생성

## 웹 페이지 UI/UX 문제 해결 (긴급)
### Sidebar 프로필 영역 수정
- [x] 새 사용자 프로필 이미지: ZetaLab 브랜드 로고 제거 → 사용자 이름 첫 글자로 변경
- [x] 드롭다운 메뉴: "프로필" 항목 제거 → "설정", "도움받기", "로그아웃"만 유지
- [x] 도움받기: "준비 중" 제거 → zetalabai@gmail.com 메일 작성 링크
- [x] 드롭다운 화살표: ChevronDown → ChevronUp으로 변경
- [x] 드롭다운 방향: side="top" 추가 (위로 열림)
- [x] 프로필 버튼 레이아웃: 닉네임과 "무료 요금제" 중앙 정렬 (items-center justify-center text-center)
- [x] Expanded + Collapsed 두 상태 모두 수정 완료

### 더미 데이터 확인
- [x] promptHistory 테이블 조회 - 6개 데이터 확인
- [x] 사용자가 언급한 "PDF 이력서" 데이터는 실제 사용자 데이터로 확인

### 프로젝트 페이지 레이아웃 수정
- [x] 프로젝트 페이지 여백 추가: px-4 md:px-6
- [x] 헤더 마진 증가: mb-6 → mb-8
- [x] 빈 상태 카드 여백: mt-4, py-16
- [x] 디자인 일관성 유지

### 체크포인트
- [x] 체크포인트 생성

## 대한민국 법 기준 법적 문서 업데이트 (최우선)
- [x] 서비스 이용약관 작성 (개인정보보호위원회 표준안 기반)
- [x] 개인정보 처리방침 작성 (KISA 가이드 기반)
- [x] AI 서비스 특성 반영 (면책 조항, 저작권 관련)
- [x] 결제 기능 활성화 시 자동 업데이트 조항 포함
- [x] 개인정보 보호책임자 정보 포함 (zetalabai@gmail.com)
- [x] Privacy.tsx 페이지에 적용
- [x] Terms.tsx 페이지에 적용
- [x] 브라우저에서 페이지 확인
- [x] 체크포인트 생성

## ZetaLab 공개 전 필수 작업 (최우선)
- [x] 개인정보 보호 정책 페이지 작성 및 구현 (Privacy.tsx)
- [x] 이용약관 페이지 작성 및 구현 (Terms.tsx)
- [x] 피드백 채널 구축 (Feedback.tsx + server/routers.ts feedback 프로시저)
- [x] 404 에러 페이지 개선 (NotFound.tsx 한국어 번역 및 디자인 개선)
- [x] 500 에러 페이지 추가 (ServerError.tsx)
- [x] 로딩 상태 UI 확인 (기존 구현 정상 작동)
- [x] Footer 컴포넌트 추가 (MainLayout에 통합)
- [x] 체크포인트 생성

## 모바일 MobileDrawer 대화 기록 long press 메뉴 추가 (최우선)
- [x] MobileDrawer.tsx에 대화 기록 항목 long press 이벤트 추가 (0.5초)
- [x] Long press 시 Dialog 메뉴 표시
- [x] 메뉴 항목: "이름 변경하기", "고정하기/고정 해제하기", "삭제하기"
- [x] Long press 시각적 피드백: 배경 하이라이트 (bg-secondary/80) + haptic feedback (vibrate 50ms)
- [x] 이름 변경하기 기능: Dialog + Input + 확인/취소 버튼
- [x] 고정하기 기능: pinPrompt mutation + isPinned 토글 + Pin 아이콘 표시
- [x] 삭제하기 기능: AlertDialog + 확인/취소 + deletePrompt mutation
- [x] 백엔드 API 추가: renamePrompt, pinPrompt, deletePrompt
- [x] 데이터베이스 스키마: isPinned 필드 추가
- [x] 대화 목록 정렬: isPinned DESC, createdAt DESC
- [x] MobileHeader 컴포넌트 생성
- [x] 체크포인트 생성

## 웹 버전 레이아웃 여백 개선 (긴급)
- [x] 대화 상세 페이지 (ConversationDetail.tsx): px-6 md:px-8 여백 추가
- [x] 프로젝트 페이지 (Projects.tsx): px-6 md:px-8 여백 추가
- [x] 설정 페이지 (Settings.tsx): 기본 탭을 "일반"으로 설정
- [x] 설정 페이지: 컨텐츠 영역 px-6 md:px-8 여백 추가
- [x] 일관된 여백 패턴 적용 (px-6 md:px-8)
- [x] 체크포인트 생성

## 웹 버전 콘텐츠 중앙 정렬 수정 (긴급)
- [x] 대화 상세 페이지 (ConversationDetail.tsx): mx-auto 추가하여 중앙 정렬
- [x] 프로젝트 페이지 (Projects.tsx): mx-auto 추가하여 중앙 정렬
- [x] 설정 페이지 (Settings.tsx): 이미 mx-auto 적용됨
- [x] 체크포인트 생성

## 데스크톱 Sidebar 대화 기록 우클릭 메뉴 추가
- [x] Sidebar.tsx에 ContextMenu import 및 우클릭 이벤트 추가
- [x] ContextMenu로 메뉴 구현 (이름 변경, 고정/고정 해제, 삭제)
- [x] renamePrompt, pinPrompt mutation 추가 (모바일과 동일한 API 사용)
- [x] Rename Dialog 추가 (Input + 확인/취소)
- [x] Pin 아이콘 표시 (isPinned 상태에 따라)
- [x] 대화 목록 정렬: isPinned DESC, createdAt DESC

## 프롬프트 생성 플로우 페이지 중앙 정렬
- [x] IntentClarification.tsx: max-w-3xl mx-auto (이미 적용됨)
- [x] PromptResult.tsx: max-w-4xl mx-auto (이미 적용됨)
- [x] 일관된 레이아웃 패턴 적용

## 페이지별 최적 max-width 설정
- [x] Home.tsx: max-w-4xl 설정
- [x] ConversationDetail.tsx: max-w-4xl (이미 설정됨)
- [x] IntentClarification.tsx: max-w-3xl (이미 설정됨)
- [x] PromptResult.tsx: max-w-4xl (이미 설정됨)
- [x] Projects.tsx: max-w-6xl (이미 설정됨)
- [x] Settings.tsx: max-w-3xl (이미 설정됨)

## 체크포인트
- [x] 체크포인트 생성

## 프로젝트 페이지 로그인 오류 수정 (긴급)
- [x] Projects.tsx에 useAuth() 훅 추가
- [x] useEffect로 로그인 상태 확인 및 홈으로 리다이렉트
- [x] trpc query에 enabled: isAuthenticated 옵션 추가
- [x] 체크포인트 생성

## 인증 필요 페이지에서 비로그인 시 로그인 모달 자동 표시
- [x] Projects.tsx: navigate("/") → setLoginModalOpen(true)로 변경
- [x] ConversationDetail.tsx: useAuth + LoginModal 추가, enabled: isAuthenticated
- [x] Settings.tsx: useAuth + LoginModal 추가
- [x] IntentClarification.tsx: navigate("/") → setLoginModalOpen(true)로 변경
- [x] PromptResult.tsx: navigate("/") → setLoginModalOpen(true)로 변경
- [x] 일관된 UX: 모든 페이지에서 동일한 LoginModal 컴포넌트 사용
- [x] 체크포인트 생성

## 모바일 프로필 네비게이션 수정 (긴급)
- [x] MobileDrawer.tsx: 프로필 버튼 링크를 `/settings` → `/settings?tab=account`로 변경
- [x] Settings.tsx: URL 쿼리 파라미터 `tab` 읽어서 해당 탭을 기본값으로 설정
- [x] 모바일에서 프로필 → 계정설정으로 바로 이동 확인
- [x] 체크포인트 생성

## 모바일 프로필 버튼 링크 수정 (긴급)
- [x] MobileDrawer.tsx: 프로필 버튼 링크를 `/settings?tab=account` → `/settings`로 변경
- [x] Settings.tsx: activeSection 기본값을 null로 변경 (모바일에서 메뉴 목록 표시)
- [x] Settings.tsx: 데스크톱에서는 기본적으로 general 탭 표시
- [x] 모바일에서 프로필 → 설정 메뉴 목록 페이지로 바로 이동 확인
- [x] 체크포인트 생성

## 모바일 Settings 페이지 뒤로가기 네비게이션 수정 (긴급)
- [x] Settings.tsx: URL 기반 네비게이션으로 변경 (탭 선택 시 URL 업데이트)
- [x] Settings.tsx: popstate 이벤트 리스너 추가 (브라우저 뒤로가기/iOS 스와이프 감지)
- [x] handleSectionClick: navigate(`/settings?tab=${sectionId}`) 사용하여 URL 히스토리 추가
- [x] handleBack: navigate("/settings") 사용하여 URL 히스토리 기반 뒤로가기
- [x] updateActiveSectionFromURL 함수 추가 (URL 파라미터 기반 activeSection 업데이트)
- [x] 브라우저에서 뒤로가기 동작 테스트 (데스크톱)
- [x] 체크포인트 생성

## 모바일 설정 메뉴 준비중 항목 클릭 오류 수정 (긴급)
- [ ] Settings.tsx handleSectionClick: 준비중 항목은 navigate() 호출하지 않고 toast만 표시
- [ ] 모바일에서 개인정보보호/결제 버튼 클릭 시 toast만 표시되고 히스토리 추가 안 됨 확인
- [ ] 뒤로가기 버튼 클릭 시 올바른 페이지로 이동 확인
- [ ] 체크포인트 생성

## 모바일 Settings 페이지 브라우저 뒤로가기 수정 (완료)
- [x] Settings.tsx: handleSectionClick에서 navigate 후 setTimeout으로 updateActiveSectionFromURL 호출
- [x] Settings.tsx: handleBack을 window.history.back()으로 변경
- [x] popstate 이벤트 리스너 추가 (브라우저 뒤로가기/iOS 스와이프 감지)
- [x] 브라우저에서 탭 전환 및 뒤로가기 테스트 (데스크톱)
- [x] 체크포인트 생성

## ZetaLab 공개 전 필수 작업 (최우선)
- [ ] 개인정보 보호 정책 페이지 작성 및 구현
  - [ ] 수집하는 개인정보 항목 명시
  - [ ] 개인정보 수집 및 이용 목적
  - [ ] 개인정보 보유 및 이용 기간
  - [ ] 개인정보 제3자 제공 (해당 시)
  - [ ] 개인정보 파기 절차 및 방법
  - [ ] 사용자 권리 및 행사 방법
  - [ ] /privacy 라우트 추가
- [ ] 이용약관 페이지 작성 및 구현
  - [ ] 서비스 이용 규칙
  - [ ] 사용자 의무 및 책임
  - [ ] 서비스 제공자의 의무 및 책임
  - [ ] 서비스 이용 제한 및 중지
  - [ ] 면책 조항
  - [ ] 분쟁 해결 및 관할 법원
  - [ ] /terms 라우트 추가
- [ ] 연락처/피드백 채널 구축
  - [ ] 이메일 연락처 표시 (zetalabai@gmail.com)
  - [ ] 피드백 폼 페이지 구현 (/feedback)
  - [ ] 폼 제출 시 이메일 전송 기능
  - [ ] Footer에 연락처 링크 추가
- [ ] 에러 페이지 개선
  - [ ] 404 Not Found 페이지 디자인
  - [ ] 500 Internal Server Error 페이지 디자인
  - [ ] 사용자 친화적 에러 메시지
  - [ ] 홈으로 돌아가기 버튼
- [ ] 로딩 상태 개선
  - [ ] 프롬프트 생성 중 진행률 표시 (IntentClarification)
  - [ ] 스켈레톤 로딩 UI 추가 (History, Projects)
  - [ ] 로딩 스피너 통일
- [ ] 전체 테스트 및 체크포인트 생성

## Footer 중첩 `<a>` 태그 오류 수정 (긴급)
- [x] Footer.tsx에서 중첩된 `<a>` 태그 찾기 (Link 안에 a 태그 중첩)
- [x] Link 컴포넌트 구조 수정 (Link에 직접 className 적용)
- [x] 브라우저 콘솔 오류 확인
- [x] 체크포인트 생성

## 대한민국 법 기준 법적 문서 업데이트 (최우선)
- [ ] 서비스 이용약관 작성 (개인정보보호위원회 표준안 기반)
- [ ] 개인정보 처리방침 작성 (KISA 가이드 기반)
- [ ] AI 서비스 면책 조항 포함
- [ ] 결제 기능 활성화 시 자동 업데이트 로직 추가
- [ ] TERMS_OF_SERVICE.md 업데이트
- [ ] PRIVACY_POLICY.md 업데이트
- [ ] Terms.tsx 페이지 업데이트
- [ ] Privacy.tsx 페이지 업데이트
- [ ] 체크포인트 생성

## Settings 개인정보보호 탭 버튼 링크 연결 (긴급)
- [x] Privacy.tsx에 섹션 ID 추가 (#security, #purpose)
- [x] Settings.tsx 개인정보보호 탭의 "데이터 보호 방법" 버튼 → /privacy#security 링크
- [x] Settings.tsx 개인정보보호 탭의 "데이터 사용 방법" 버튼 → /privacy#purpose 링크
- [x] wouter Link import 추가
- [x] 브라우저에서 버튼 클릭 테스트
- [x] 체크포인트 생성

## 프로필 "도움받기" → "피드백" 변경 및 이메일 복사 모달 구현 (긴급)
- [x] FeedbackModal 컴포넌트 생성 (이메일 복사 기능 포함)
- [x] Sidebar "도움 받기" → "피드백" 변경 및 모달 연결
- [x] MobileDrawer 프로필 섹션에 "피드백" 버튼 추가 및 모달 연결
- [x] 이메일 클릭 시 복사 기능 구현 (navigator.clipboard.writeText)
- [x] "이메일이 복사되었습니다" toast 알림 표시
- [x] 웹/모바일 모두 동일하게 작동 확인
- [x] 브라우저에서 실제 테스트
- [x] 체크포인트 생성

## Settings 페이지를 전체 화면 모달로 변경 (ChatGPT 스타일)
- [ ] SettingsModal 컴포넌트 생성 (전체 화면 모달)
- [ ] Settings.tsx의 모든 코드를 SettingsModal로 이동
- [ ] 웹 버전: 좌측 사이드바 + 우측 콘텐츠 레이아웃 유지
- [ ] 모바일 버전: 메뉴 목록 → 상세 화면 레이아웃 유지
- [ ] X 버튼으로 모달 닫기 기능
- [ ] Sidebar 설정 버튼 → 모달 열기로 변경
- [ ] MobileDrawer 프로필 버튼 → 모달 열기로 변경
- [ ] /settings 라우트는 자동으로 모달 열기로 리다이렉트
- [ ] 브라우저 테스트 (웹/모바일)
- [ ] 체크포인트 생성

## Settings 모달 구현 (ChatGPT 스타일)
- [x] SettingsModal 컴포넌트 생성 (전체 화면 모달)
- [x] Settings.tsx의 모든 코드를 SettingsModal로 이동
- [x] 웹 버전: 좌측 사이드바 + 우측 콘텐츠 레이아웃 유지
- [x] 모바일 버전: 메뉴 목록 → 상세 화면 레이아웃 유지
- [x] X 버튼으로 모달 닫기 기능
- [x] Sidebar 설정 버튼 → 모달 열기로 변경
- [x] MobileDrawer 프로필 버튼 → 모달 열기로 변경
- [x] /settings 라우트는 자동으로 모달 열기로 리다이렉트
- [x] 브라우저 테스트 (웹/모바일)
- [x] 체크포인트 생성

## 앱 버전 설정 모달 뒤로가기 동작 수정
- [x] 현재 동작 분석 (뒤로가기 시 모달이 닫히지 않는 문제)
- [x] 해결 방안 설계 (뒤로가기 시 모달 닫고 MobileDrawer 열린 상태로 복귀)
- [x] MobileDrawer 상태 관리 로직 수정
- [x] SettingsModal onOpenChange 핸들러 수정
- [x] 브라우저 테스트 (앱 버전)
- [x] 체크포인트 생성

## 모바일 브라우저 히스토리 관리 구현
- [x] 문제 분석: 뒤로가기 시 브라우저 히스토리로 이동하는 문제
- [x] 해결 방안 설계: history.pushState()와 popstate 이벤트 사용
- [x] MobileDrawer 열림/닫힘 시 히스토리 상태 추가
- [x] SettingsModal 열림/닫힘 시 히스토리 상태 추가
- [x] SettingsModal 내부 섭션 전환 시 히스토리 상태 추가
- [x] popstate 이벤트 핸들러 구현
- [x] 브라우저 테스트 (실제 모바일 기기)
- [x] 체크포인트 생성


## 프롬프트 저장 + 버전 관리 기능 (사용 빈도 증대 전략)
- [x] 데이터베이스 스키마 설계 (promptAssets, promptVersions 테이블)
- [x] 마이그레이션 SQL 작성 및 실행
- [ ] 백엔드 API 구현 (저장, 조회, 버전 조회)
- [ ] 프롬프트 결과 화면에 저장 버튼 추가
- [ ] My Work 페이지 구현 (저장된 프롬프트 목록)
- [ ] 버전 관리 UI 구현 (v1, v2, v3... 표시)
- [ ] 마지막 사용일 / 성공 여부 표시
- [ ] 테스트 및 체크포인트 생성


## Phase 5: 버전 관리 UI 상세 구현
- [x] PromptVersions.tsx 페이지 생성 (버전 상세 화면)
- [x] My Work에서 버전 클릭 시 PromptVersions로 이동
- [x] 버전 목록 표시 (v1, v2, v3...)
- [x] 버전별 생성일시 표시
- [x] 버전별 성공 상태 배지 표시 (성공/실패/미평가)
- [x] 버전 확장/축소 기능
- [x] 생성된 프롬프트 표시 및 복사 기능
- [x] 수정된 프롬프트 표시 및 복사 기능
- [x] 사용된 LLM 메타데이터 표시
- [ ] 버전 비교 기능 (v1 vs v2 비교)
- [ ] 버전 복원 기능 (이전 버전으로 되돌리기)
- [ ] 새 버전 생성 기능 (기존 프롬프트 기반)
- [ ] 테스트 작성 및 검증

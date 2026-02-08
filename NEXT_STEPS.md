# 🚀 다음 단계 가이드

## 🔴 지금 당장 해야 할 일

### 1. Firebase Authorized Domains 추가 (5분 소요)

**로그인이 작동하려면 필수입니다!**

1. **Firebase Console 접속**
   👉 https://console.firebase.google.com/project/zetalabai-4e5d3/authentication/settings

2. **"Authorized domains" 섹션으로 스크롤**

3. **"Add domain" 버튼 클릭하여 다음 도메인 추가**:
   ```
   zetalabai-4e5d3.web.app
   zetalabai-4e5d3.firebaseapp.com
   zetalab.im
   www.zetalab.im
   ```

4. **저장**

---

## ⏰ 30분 후 확인할 것

### DNS 전파 확인

1. **DNS 확인 사이트 접속**
   👉 https://dnschecker.org/#A/zetalab.im

2. **전 세계적으로 `199.36.158.100` 반환 확인**

3. **브라우저에서 접속 테스트**:
   - https://zetalab.im
   - https://www.zetalab.im

---

## 🧪 테스트 시나리오

### 로그인 테스트 (Authorized Domains 추가 후)

1. **사이트 접속**
   - https://zetalabai-4e5d3.web.app (또는 zetalab.im)

2. **로그인 버튼 클릭**
   - "구글 계정으로 로그인" 선택

3. **Google 계정 선택**
   - zetalabai@gmail.com 또는 원하는 계정

4. **로그인 확인**
   - 페이지가 리다이렉트됨
   - "로그인 성공!" 토스트 알림 표시
   - 우상단에 사용자 프로필 표시

5. **개발자 도구 확인** (선택사항)
   - F12 → Application → Local Storage
   - `firebase_id_token` 키가 있는지 확인

---

## 🎨 다음 개발 작업

### 로그인 작동 확인 후 시작

**내가 말할 키워드**:
```
"디자인 가이드라인 확인해줘"
또는
"3패널 레이아웃 구현하자"
```

**구현 순서**:
1. Phase 1: 3패널 기본 레이아웃 구조
2. Phase 2: 다크/라이트 모드 컬러 시스템
3. Phase 3: 반응형 레이아웃
4. Phase 4: 마이크로 인터랙션

---

## 📞 문제 발생 시

### 로그인 오류
- Authorized Domains가 제대로 추가되었는지 확인
- 브라우저 캐시 삭제 후 재시도
- 콘솔에 오류 메시지 확인 (F12)

### 도메인 접속 안됨
- DNS 전파 대기 시간 추가 필요 (최대 24시간)
- Cloudflare DNS 설정 재확인
- Firebase Custom Domain 상태 확인

### 배포 문제
- `firebase deploy --only hosting` 재실행
- `npm run build` 후 재배포

---

## 📋 빠른 체크리스트

- [ ] Firebase Authorized Domains 4개 추가
- [ ] 30분 후 DNS 전파 확인
- [ ] zetalab.im 접속 테스트
- [ ] 로그인 기능 테스트
- [ ] 정상 작동 확인되면 "디자인 가이드라인 확인해줘" 요청

---

**현재 상태 상세 보고서**: `CURRENT_STATUS.md` 참조
**디자인 가이드라인**: `/home/user/.claude/projects/-home-user-zetalabai/memory/design-guidelines.md`

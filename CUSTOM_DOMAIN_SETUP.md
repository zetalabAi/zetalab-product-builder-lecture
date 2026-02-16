# 🌐 zetalab.ai 커스텀 도메인 설정 가이드

## 📋 준비사항
- ✅ zetalab.ai 도메인 구입 완료
- ✅ Firebase 프로젝트: zetalabai-4e5d3
- ✅ 도메인 등록 업체 접근 권한 (DNS 레코드 수정용)

---

## 🚀 1단계: Firebase Console에서 커스텀 도메인 추가

### 1-1. Firebase Console 접속
```
https://console.firebase.google.com/project/zetalabai-4e5d3/hosting/sites
```

### 1-2. 커스텀 도메인 추가
1. **Hosting** 섹션으로 이동
2. **"도메인 추가"** 또는 **"커스텀 도메인 추가"** 버튼 클릭
3. 도메인 입력 옵션에서 **2가지 선택**:

#### 옵션 A: 루트 도메인 (권장)
```
zetalab.ai
```
- ✅ 짧고 기억하기 쉬움
- ✅ SEO에 유리
- ⚠️ A 레코드 설정 필요

#### 옵션 B: www 서브도메인
```
www.zetalab.ai
```
- ✅ 전통적인 방식
- ✅ CNAME 레코드 설정 가능

**권장 설정**: 두 도메인 모두 추가하고, www → zetalab.ai로 리다이렉트

---

## 🔧 2단계: DNS 레코드 설정

Firebase Console에서 제공하는 DNS 레코드를 도메인 등록 업체에 추가합니다.

### 2-1. Firebase가 제공할 레코드 (예시)

#### A 레코드 (zetalab.ai)
| 타입 | 호스트 | 값 | TTL |
|------|--------|-----|-----|
| A | @ | `151.101.1.195` | 3600 |
| A | @ | `151.101.65.195` | 3600 |

#### TXT 레코드 (소유권 확인)
| 타입 | 호스트 | 값 | TTL |
|------|--------|-----|-----|
| TXT | @ | `firebase=zetalabai-4e5d3` | 3600 |

#### CNAME 레코드 (www.zetalab.ai - 선택사항)
| 타입 | 호스트 | 값 | TTL |
|------|--------|-----|-----|
| CNAME | www | `zetalabai-4e5d3.web.app.` | 3600 |

⚠️ **중요**: 실제 값은 Firebase Console에서 확인하세요!

### 2-2. 도메인 등록 업체별 설정 방법

#### Namecheap
1. [Namecheap Dashboard](https://ap.www.namecheap.com/domains/list/) 접속
2. zetalab.ai 옆 "Manage" 클릭
3. "Advanced DNS" 탭 클릭
4. "Add New Record" 버튼으로 레코드 추가

#### GoDaddy
1. [GoDaddy DNS Management](https://dcc.godaddy.com/manage/dns) 접속
2. zetalab.ai 선택
3. DNS 레코드 추가

#### Cloudflare (추천)
1. [Cloudflare Dashboard](https://dash.cloudflare.com/) 접속
2. zetalab.ai 선택
3. DNS 탭에서 레코드 추가
4. ⚠️ **Proxy 상태**: "DNS only" (회색 구름) 선택
   - Firebase SSL과 충돌 방지

#### Route 53 (AWS)
1. [Route 53 Console](https://console.aws.amazon.com/route53/) 접속
2. Hosted zones → zetalab.ai 선택
3. Create record 클릭

#### Cafe24
1. [Cafe24 도메인 관리](https://www.cafe24.com/) 접속
2. 도메인 관리 → DNS 설정
3. 레코드 추가

---

## 🔐 3단계: SSL 인증서 프로비저닝

DNS 레코드 설정 후:

1. **자동 확인 대기** (5-10분)
   - Firebase가 DNS 레코드를 확인합니다
   - 소유권 확인 완료 시 체크마크 표시

2. **SSL 인증서 발급** (최대 24시간)
   - Firebase가 Let's Encrypt 인증서 자동 발급
   - 보통 1-2시간 내 완료
   - 상태: "프로비저닝 중..." → "연결됨"

---

## ✅ 4단계: 배포 및 확인

### 4-1. 앱 배포
```bash
# 먼저 빌드
npm run build

# Firebase 배포
firebase deploy
```

### 4-2. 도메인 접속 확인
```bash
# DNS 전파 확인
nslookup zetalab.ai
dig zetalab.ai

# HTTPS 접속 테스트
curl -I https://zetalab.ai
```

브라우저에서 확인:
- https://zetalab.ai
- https://www.zetalab.ai (설정했다면)

---

## 🌍 5단계: 리다이렉트 설정 (선택사항)

### www → zetalab.ai 리다이렉트

Firebase Console에서 자동으로 처리되지만, 수동으로 확인하려면:

1. Firebase Console → Hosting → 도메인 탭
2. www.zetalab.ai의 설정 확인
3. "zetalab.ai로 리다이렉트" 옵션 활성화

---

## 📊 전파 시간 및 문제 해결

### DNS 전파 시간
- **일반적**: 1-2시간
- **최대**: 48시간
- **확인 도구**:
  - https://dnschecker.org/#A/zetalab.ai
  - https://www.whatsmydns.net/#A/zetalab.ai

### 일반적인 문제

#### 1. DNS 레코드가 확인되지 않음
```bash
# DNS 캐시 클리어
# Windows
ipconfig /flushdns

# macOS
sudo dscacheutil -flushcache; sudo killall -HUP mDNSResponder

# Linux
sudo systemd-resolve --flush-caches
```

#### 2. SSL 인증서 프로비저닝 실패
- **원인**: Cloudflare Proxy가 활성화된 경우
- **해결**: Cloudflare에서 "DNS only" (회색 구름) 설정

#### 3. 도메인 연결 후 404 오류
- **원인**: 배포되지 않음
- **해결**: `firebase deploy` 재실행

---

## 🔍 환경 변수 업데이트

도메인 변경 후 환경 변수 업데이트가 필요할 수 있습니다:

### .env 파일 확인
```bash
# 현재 설정
VITE_FIREBASE_AUTH_DOMAIN=zetalabai-4e5d3.firebaseapp.com

# 변경 여부 확인 (선택사항)
# VITE_FIREBASE_AUTH_DOMAIN=zetalab.ai
```

⚠️ **주의**: Firebase Auth는 기본적으로 `*.firebaseapp.com`를 사용하므로, 변경하지 않는 것이 안전합니다.

### Firebase Console에서 승인된 도메인 추가
1. Firebase Console → Authentication → Settings
2. "Authorized domains" 섹션
3. zetalab.ai 추가
4. www.zetalab.ai 추가 (선택사항)

---

## 📝 체크리스트

### Firebase Console
- [ ] Hosting → 도메인 추가 클릭
- [ ] zetalab.ai 입력
- [ ] DNS 레코드 확인 (A, TXT)
- [ ] www.zetalab.ai 추가 (선택사항)

### 도메인 등록 업체
- [ ] A 레코드 추가 (zetalab.ai → Firebase IP)
- [ ] TXT 레코드 추가 (소유권 확인)
- [ ] CNAME 레코드 추가 (www → zetalab.ai)

### Firebase
- [ ] DNS 소유권 확인 완료 대기 (5-10분)
- [ ] SSL 인증서 프로비저닝 완료 대기 (1-24시간)
- [ ] 상태: "연결됨" 확인

### 배포
- [ ] `firebase deploy` 실행
- [ ] https://zetalab.ai 접속 확인
- [ ] 모든 페이지 작동 확인

### Firebase Authentication
- [ ] Authorized domains에 zetalab.ai 추가
- [ ] Google OAuth 리다이렉트 URI 확인

---

## 🎉 완료!

설정이 완료되면:

1. **기본 URL**: https://zetalabai-4e5d3.web.app (계속 작동)
2. **커스텀 도메인**: https://zetalab.ai (새 주소!)
3. **리다이렉트**: https://www.zetalab.ai → https://zetalab.ai

---

## 🆘 도움이 필요하면

1. Firebase Console에서 실시간 상태 확인
2. DNS 전파 확인: https://dnschecker.org
3. Firebase Support: https://firebase.google.com/support

**배포 성공을 기원합니다!** 🚀

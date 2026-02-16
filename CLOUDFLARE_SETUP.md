# ☁️ Cloudflare → Firebase Hosting 연결 가이드 (zetalab.ai)

## 🎯 개요
Cloudflare에서 구매한 **zetalab.ai** 도메인을 Firebase Hosting에 연결합니다.

⚠️ **중요**: Cloudflare Proxy는 **반드시 비활성화**해야 합니다!

---

## 🚀 Step 1: Firebase Console에서 도메인 추가

### 1-1. Firebase Console 접속
```
https://console.firebase.google.com/project/zetalabai-4e5d3/hosting/sites
```

### 1-2. 커스텀 도메인 추가
1. **"도메인 추가"** 또는 **"Add custom domain"** 클릭
2. 도메인 입력: **`zetalab.ai`**
3. **"계속"** 클릭

### 1-3. DNS 레코드 복사
Firebase가 제공하는 DNS 레코드를 메모장에 복사하세요:

```
예시 (실제 값은 다를 수 있음):

A 레코드:
호스트: @
값: 151.101.1.195
TTL: Auto

A 레코드:
호스트: @
값: 151.101.65.195
TTL: Auto

TXT 레코드:
호스트: @
값: firebase=zetalabai-4e5d3
TTL: Auto
```

⚠️ **주의**: 위 IP는 예시입니다. **Firebase Console에서 제공하는 실제 값을 사용하세요!**

---

## ☁️ Step 2: Cloudflare DNS 설정

### 2-1. Cloudflare Dashboard 접속
```
https://dash.cloudflare.com/
```

### 2-2. zetalab.ai 도메인 선택
1. 대시보드에서 **zetalab.ai** 클릭
2. 왼쪽 메뉴에서 **"DNS"** → **"Records"** 클릭

### 2-3. 기존 레코드 삭제 (있다면)
zetalab.ai의 기존 A 레코드나 CNAME 레코드가 있다면 삭제:
- `@` (root)의 A 레코드
- `@` (root)의 CNAME 레코드
- Cloudflare Parking Page 관련 레코드

### 2-4. Firebase DNS 레코드 추가

#### A 레코드 추가 (첫 번째)
1. **"Add record"** 버튼 클릭
2. 다음과 같이 입력:
   ```
   Type: A
   Name: @ (또는 zetalab.ai)
   IPv4 address: 151.101.1.195 (Firebase에서 제공한 첫 번째 IP)
   Proxy status: DNS only (회색 구름 ⚠️ 중요!)
   TTL: Auto
   ```
3. **"Save"** 클릭

#### A 레코드 추가 (두 번째)
1. **"Add record"** 버튼 클릭
2. 다음과 같이 입력:
   ```
   Type: A
   Name: @
   IPv4 address: 151.101.65.195 (Firebase에서 제공한 두 번째 IP)
   Proxy status: DNS only (회색 구름 ⚠️ 중요!)
   TTL: Auto
   ```
3. **"Save"** 클릭

#### TXT 레코드 추가 (소유권 확인)
1. **"Add record"** 버튼 클릭
2. 다음과 같이 입력:
   ```
   Type: TXT
   Name: @
   Content: firebase=zetalabai-4e5d3 (Firebase에서 제공한 값)
   TTL: Auto
   ```
3. **"Save"** 클릭

### 2-5. www 서브도메인 추가 (선택사항)

www.zetalab.ai도 사용하려면:

#### 방법 1: CNAME (추천)
```
Type: CNAME
Name: www
Target: zetalab.ai (또는 zetalabai-4e5d3.web.app)
Proxy status: DNS only (회색 구름)
TTL: Auto
```

#### 방법 2: Firebase Console에서 별도 추가
Firebase Console에서 www.zetalab.ai를 별도로 추가하고 DNS 레코드 받기

---

## ⚠️ Step 3: Cloudflare Proxy 설정 (중요!)

### 3-1. Proxy 상태 확인
모든 A 레코드의 Proxy 상태가 **"DNS only"** (회색 구름)인지 확인:

```
✅ 올바른 설정:
zetalab.ai  A  151.101.1.195  🔘 DNS only (회색)
zetalab.ai  A  151.101.65.195 🔘 DNS only (회색)

❌ 잘못된 설정:
zetalab.ai  A  151.101.1.195  🟠 Proxied (주황색)
```

### 3-2. Proxy를 비활성화해야 하는 이유
- Firebase가 자체 SSL 인증서를 발급해야 함
- Cloudflare Proxy가 활성화되면 Firebase SSL과 충돌
- SSL 프로비저닝이 실패하거나 무한 대기 상태

### 3-3. Proxy 전환 방법
1. DNS 레코드 옆의 **주황색 구름** 🟠 클릭
2. **회색 구름** 🔘 (DNS only)로 변경
3. 자동 저장됨

---

## 🔐 Step 4: Cloudflare SSL/TLS 설정

### 4-1. SSL/TLS 설정 확인
1. Cloudflare Dashboard → **SSL/TLS** 탭
2. **Overview** 클릭
3. 암호화 모드 확인

### 4-2. 권장 설정
```
Encryption mode: Full (strict) 또는 Full
```

- ✅ **Full (strict)**: 가장 안전 (Firebase는 유효한 SSL 인증서 제공)
- ✅ **Full**: 안전
- ⚠️ **Flexible**: 권장하지 않음 (무한 리다이렉트 발생 가능)
- ❌ **Off**: 절대 사용 금지

### 4-3. 설정 변경 방법
1. 원하는 모드 선택
2. 자동 저장
3. 변경 즉시 적용 (최대 5분)

---

## ✅ Step 5: Firebase Console에서 확인

### 5-1. DNS 소유권 확인 대기
1. Firebase Console로 돌아가기
2. "DNS 레코드 확인" 또는 "Verify" 버튼 클릭
3. 확인 대기 (보통 **1-5분**)
   - Cloudflare는 DNS 전파가 매우 빠름!
   - 성공 시: ✅ "소유권이 확인되었습니다"
   - 실패 시: DNS 레코드 다시 확인

### 5-2. SSL 인증서 프로비저닝 대기
DNS 확인 후 자동으로 SSL 발급 시작:
- 상태: **"프로비저닝 중..."** 또는 **"Provisioning"**
- 예상 시간: **1-2시간** (최대 24시간)
- 완료 시: **"연결됨"** 또는 **"Connected"**

---

## 🚀 Step 6: Firebase Authentication 설정

### 6-1. Authorized Domains 추가
1. Firebase Console → **Authentication** → **Settings**
2. **"Authorized domains"** 섹션으로 스크롤
3. **"도메인 추가"** 버튼 클릭
4. **`zetalab.ai`** 입력 후 추가
5. (선택) **`www.zetalab.ai`** 추가

### 6-2. Google OAuth 설정 확인
1. Google Cloud Console → **APIs & Services** → **Credentials**
2. OAuth 2.0 Client ID 선택
3. **"Authorized redirect URIs"**에 추가:
   ```
   https://zetalab.ai/__/auth/handler
   https://www.zetalab.ai/__/auth/handler (선택)
   ```

---

## 📦 Step 7: 앱 배포

### 7-1. 빌드 및 배포
```bash
# 1. 빌드
npm run build

# 2. Firebase 배포
firebase deploy

# 3. 완료 메시지 확인
# ✔  Deploy complete!
#
# Project Console: https://console.firebase.google.com/project/zetalabai-4e5d3/overview
# Hosting URL: https://zetalabai-4e5d3.web.app
```

### 7-2. 접속 테스트
```bash
# DNS 확인
nslookup zetalab.ai

# HTTPS 테스트
curl -I https://zetalab.ai
```

브라우저에서 확인:
- ✅ https://zetalab.ai
- ✅ https://www.zetalab.ai (설정했다면)
- ✅ https://zetalabai-4e5d3.web.app (계속 작동)

---

## 🔍 문제 해결

### 문제 1: DNS 소유권 확인 실패
```
원인: DNS 레코드가 아직 전파되지 않음
해결:
1. Cloudflare DNS 레코드 다시 확인
2. 5-10분 대기 후 재시도
3. DNS 전파 확인: https://dnschecker.org/#A/zetalab.ai
```

### 문제 2: SSL 인증서 프로비저닝 무한 대기
```
원인: Cloudflare Proxy가 활성화됨
해결:
1. Cloudflare Dashboard → DNS
2. A 레코드의 주황색 구름 → 회색 구름으로 변경
3. Firebase Console에서 10분 대기
4. 여전히 실패 시 도메인 제거 후 재추가
```

### 문제 3: 무한 리다이렉트 루프
```
원인: Cloudflare SSL 설정이 "Flexible"
해결:
1. Cloudflare → SSL/TLS → Overview
2. "Full" 또는 "Full (strict)"로 변경
3. 5분 대기 후 재접속
```

### 문제 4: Google OAuth 로그인 실패
```
원인: Authorized domains에 도메인 미추가
해결:
1. Firebase Console → Authentication → Settings
2. zetalab.ai를 Authorized domains에 추가
3. Google Cloud Console에서 Redirect URI 추가
```

### 문제 5: 404 오류
```
원인: 배포되지 않음
해결:
firebase deploy
```

---

## 🎨 Step 8: Cloudflare 추가 최적화 (선택사항)

### 8-1. Caching 설정
SSL 발급 완료 후 Proxy를 다시 활성화할 수 있습니다:

1. Firebase SSL이 **"연결됨"** 상태인지 확인
2. Cloudflare DNS에서 A 레코드의 Proxy를 **"Proxied"** (주황색)로 변경
3. 장점:
   - ✅ DDoS 보호
   - ✅ CDN 캐싱 (더 빠른 로딩)
   - ✅ 무료 Bot 관리

⚠️ **주의**: SSL 발급 완료 후에만 활성화하세요!

### 8-2. Page Rules (선택사항)
www → root 리다이렉트 강제:

1. Cloudflare → **Rules** → **Page Rules**
2. **"Create Page Rule"** 클릭
3. 설정:
   ```
   URL: www.zetalab.ai/*
   Setting: Forwarding URL
   Status Code: 301 - Permanent Redirect
   Destination URL: https://zetalab.ai/$1
   ```
4. **"Save and Deploy"**

---

## 📊 최종 체크리스트

### Cloudflare DNS
- [ ] A 레코드 (첫 번째 IP) 추가
- [ ] A 레코드 (두 번째 IP) 추가
- [ ] TXT 레코드 (소유권 확인) 추가
- [ ] **Proxy 상태: DNS only (회색 구름)** ⚠️ 중요
- [ ] CNAME 레코드 (www) 추가 (선택)

### Cloudflare SSL/TLS
- [ ] 암호화 모드: Full 또는 Full (strict)

### Firebase Console
- [ ] 도메인 추가: zetalab.ai
- [ ] DNS 소유권 확인 완료
- [ ] SSL 인증서 프로비저닝 완료 (1-24시간)
- [ ] 상태: "연결됨"

### Firebase Authentication
- [ ] Authorized domains에 zetalab.ai 추가
- [ ] (선택) www.zetalab.ai 추가

### 배포
- [ ] `npm run build` 실행
- [ ] `firebase deploy` 실행
- [ ] https://zetalab.ai 접속 확인
- [ ] Google OAuth 로그인 테스트

---

## 🎉 완료!

설정이 완료되면:

- ✅ **메인 도메인**: https://zetalab.ai
- ✅ **기본 URL**: https://zetalabai-4e5d3.web.app (계속 작동)
- ✅ **www 리다이렉트**: https://www.zetalab.ai → https://zetalab.ai
- ✅ **SSL**: Let's Encrypt 자동 발급
- ✅ **Cloudflare**: DDoS 보호 & CDN (Proxy 재활성화 시)

---

## ⏱️ 예상 소요 시간

| 단계 | 소요 시간 |
|------|----------|
| Firebase에서 도메인 추가 | 1분 |
| Cloudflare DNS 설정 | 3-5분 |
| DNS 소유권 확인 대기 | 1-5분 (Cloudflare는 빠름!) |
| SSL 인증서 프로비저닝 | 1-2시간 (최대 24시간) |
| 앱 배포 | 2-3분 |
| **총 소요 시간** | **1-2시간** |

---

## 🆘 도움이 필요하면

- **Cloudflare 커뮤니티**: https://community.cloudflare.com/
- **Firebase Support**: https://firebase.google.com/support
- **DNS 전파 확인**: https://dnschecker.org/#A/zetalab.ai
- **SSL 체커**: https://www.ssllabs.com/ssltest/analyze.html?d=zetalab.ai

**성공을 기원합니다!** 🚀☁️

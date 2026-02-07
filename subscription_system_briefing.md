# ZetaLab 구독결제 시스템 아이디어 브리핑

## 1. 구독 플랜 설계

### 1.1 무료 플랜 (Free)
**타겟:** 신규 사용자, 가벼운 사용자, 테스트 사용자

**제공 기능:**
- 월 20회 프롬프트 생성 제한
- 기본 Builder 7종 모두 사용 가능
- 아티팩트 저장 최대 10개
- 프로젝트 생성 최대 3개
- 커뮤니티 지원 (FAQ, 포럼)

**제한 사항:**
- 고급 프롬프트 템플릿 미제공
- 우선 지원 없음
- API 액세스 없음

---

### 1.2 프리미엄 플랜 (Premium)
**가격:** 월 $9.99 / 연 $99 (17% 할인)
**타겟:** 개인 크리에이터, 프리랜서, 소규모 팀

**제공 기능:**
- **무제한 프롬프트 생성**
- 기본 Builder 7종 + 고급 템플릿 제공
- 아티팩트 저장 무제한
- 프로젝트 생성 무제한
- 프롬프트 히스토리 무제한 보관
- 우선 이메일 지원 (24시간 내 응답)
- 프롬프트 공유 기능
- 커스텀 Builder 설정 (베타)

**추가 혜택:**
- 새로운 Builder 우선 체험
- 월간 프롬프트 트렌드 리포트 제공

---

### 1.3 프로 플랜 (Pro)
**가격:** 월 $29.99 / 연 $299 (17% 할인)
**타겟:** 기업, 에이전시, 대규모 팀

**제공 기능:**
- 프리미엄 플랜 모든 기능 포함
- **팀 협업 기능**
  - 팀 멤버 최대 10명 추가
  - 프로젝트 공유 및 협업
  - 팀 아티팩트 라이브러리
- **API 액세스**
  - 월 10,000 API 호출
  - Webhook 지원
  - 커스텀 통합 가능
- **고급 분석**
  - 프롬프트 성능 분석
  - 사용 패턴 인사이트
  - 팀 생산성 대시보드
- **전담 지원**
  - 우선 채팅 지원 (1시간 내 응답)
  - 월 1회 컨설팅 세션
  - 온보딩 지원

**추가 혜택:**
- 커스텀 Builder 개발 지원
- 화이트 라벨 옵션 (추가 비용)

---

### 1.4 엔터프라이즈 플랜 (Enterprise)
**가격:** 맞춤 견적 (문의 필요)
**타겟:** 대기업, 특수 요구사항이 있는 조직

**제공 기능:**
- 프로 플랜 모든 기능 포함
- 무제한 팀 멤버
- 무제한 API 호출
- 전용 서버 옵션
- SSO (Single Sign-On) 지원
- 커스텀 SLA (Service Level Agreement)
- 전담 계정 매니저
- 맞춤형 교육 및 온보딩
- 우선 기능 개발 요청

---

## 2. 결제 시스템 기술 구현

### 2.1 Stripe 연동
**선택 이유:**
- Manus 템플릿에서 `webdev_add_feature(feature="stripe")` 지원
- 글로벌 결제 지원 (신용카드, 디지털 월렛 등)
- 구독 관리 자동화
- 세금 계산 자동화
- 보안 및 PCI 준수

**구현 단계:**
1. `webdev_add_feature(feature="stripe")` 호출
2. Stripe 대시보드에서 제품 및 가격 설정
3. Webhook 설정 (결제 성공, 실패, 구독 취소 등)
4. 사용자 대시보드에 결제 관리 UI 추가

---

### 2.2 데이터베이스 스키마 확장

```typescript
// 구독 정보 테이블
export const subscriptions = sqliteTable('subscriptions', {
  id: text('id').primaryKey(),
  userId: text('user_id').notNull().references(() => users.id),
  plan: text('plan').notNull(), // 'free', 'premium', 'pro', 'enterprise'
  status: text('status').notNull(), // 'active', 'canceled', 'past_due'
  stripeCustomerId: text('stripe_customer_id'),
  stripeSubscriptionId: text('stripe_subscription_id'),
  currentPeriodStart: integer('current_period_start', { mode: 'timestamp' }),
  currentPeriodEnd: integer('current_period_end', { mode: 'timestamp' }),
  cancelAtPeriodEnd: integer('cancel_at_period_end', { mode: 'boolean' }),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull(),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).notNull(),
});

// 사용량 추적 테이블
export const usage = sqliteTable('usage', {
  id: text('id').primaryKey(),
  userId: text('user_id').notNull().references(() => users.id),
  month: text('month').notNull(), // 'YYYY-MM' 형식
  promptCount: integer('prompt_count').notNull().default(0),
  apiCallCount: integer('api_call_count').notNull().default(0),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull(),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).notNull(),
});

// 결제 이력 테이블
export const payments = sqliteTable('payments', {
  id: text('id').primaryKey(),
  userId: text('user_id').notNull().references(() => users.id),
  amount: integer('amount').notNull(), // 센트 단위
  currency: text('currency').notNull().default('usd'),
  status: text('status').notNull(), // 'succeeded', 'failed', 'refunded'
  stripePaymentIntentId: text('stripe_payment_intent_id'),
  description: text('description'),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull(),
});
```

---

### 2.3 기능 제한 로직

**미들웨어 구현:**
```typescript
// server/middleware/checkSubscription.ts
export const checkPromptLimit = async (userId: string) => {
  const subscription = await db.query.subscriptions.findFirst({
    where: eq(subscriptions.userId, userId),
  });

  // 무료 플랜 사용자만 제한
  if (subscription?.plan === 'free') {
    const currentMonth = new Date().toISOString().slice(0, 7); // 'YYYY-MM'
    const usage = await db.query.usage.findFirst({
      where: and(
        eq(usage.userId, userId),
        eq(usage.month, currentMonth)
      ),
    });

    const promptCount = usage?.promptCount || 0;
    if (promptCount >= 20) {
      throw new TRPCError({
        code: 'FORBIDDEN',
        message: '월 프롬프트 생성 한도를 초과했습니다. 프리미엄 플랜으로 업그레이드하세요.',
      });
    }
  }

  return true;
};
```

**프로시저에 적용:**
```typescript
// server/routers.ts
zetaAI: {
  init: protectedProcedure
    .input(z.object({ question: z.string() }))
    .mutation(async ({ ctx, input }) => {
      // 구독 제한 확인
      await checkPromptLimit(ctx.user.id);
      
      // 프롬프트 생성 로직...
      
      // 사용량 증가
      await incrementUsage(ctx.user.id, 'promptCount');
      
      return { sessionId };
    }),
}
```

---

## 3. UI/UX 설계

### 3.1 가격 페이지 (/pricing)
**레이아웃:**
- 3-4개 플랜 카드 (Free, Premium, Pro, Enterprise)
- 월간/연간 토글 스위치
- 각 플랜별 기능 비교 표
- FAQ 섹션
- "지금 시작하기" CTA 버튼

**디자인 참고:**
- Notion, ChatGPT Plus, Grammarly 가격 페이지

---

### 3.2 업그레이드 유도 UI

**제한 도달 시 모달:**
```
┌─────────────────────────────────────┐
│  🚀 월 프롬프트 한도 초과           │
│                                     │
│  이번 달 20개 프롬프트를 모두       │
│  사용했습니다.                      │
│                                     │
│  프리미엄 플랜으로 업그레이드하면   │
│  무제한 프롬프트를 생성할 수 있어요!│
│                                     │
│  [프리미엄 보기]  [나중에]          │
└─────────────────────────────────────┘
```

**사이드바 배지:**
- 무료 사용자: "무료 요금제 (15/20 사용)"
- 프리미엄 사용자: "프리미엄 💎"
- 프로 사용자: "프로 ⭐"

---

### 3.3 결제 관리 대시보드 (/settings/billing)

**포함 내용:**
- 현재 플랜 정보
- 다음 결제일 및 금액
- 결제 수단 관리
- 결제 이력
- 플랜 변경/취소 버튼
- 영수증 다운로드

---

## 4. 마케팅 전략

### 4.1 무료 → 프리미엄 전환 전략
1. **제한 도달 시점 최적화**
   - 20회 제한을 통해 충분한 가치 체험
   - 제한 도달 시 업그레이드 유도

2. **프리미엄 기능 미리보기**
   - 무료 사용자에게 프리미엄 기능 일부 체험 제공
   - "프리미엄 전용" 배지로 호기심 유발

3. **시간 제한 할인**
   - 신규 가입 후 7일 내 업그레이드 시 20% 할인
   - 연간 플랜 선택 시 2개월 무료

---

### 4.2 프리미엄 → 프로 전환 전략
1. **팀 협업 필요성 강조**
   - 프로젝트 공유 시 "프로 플랜으로 팀원 초대" 제안

2. **API 액세스 홍보**
   - 개발자 대상 API 문서 및 샘플 코드 제공
   - 자동화 사용 사례 공유

3. **분석 기능 강조**
   - 프롬프트 성능 인사이트 미리보기 제공

---

## 5. 구현 우선순위

### Phase 1: 기본 구독 시스템 (2-3주)
1. Stripe 연동 (`webdev_add_feature`)
2. 데이터베이스 스키마 추가
3. 무료/프리미엄 플랜 구현
4. 프롬프트 생성 제한 로직
5. 가격 페이지 제작
6. 결제 플로우 구현

### Phase 2: 고급 기능 (2-3주)
1. 프로 플랜 추가
2. 팀 협업 기능 구현
3. 사용량 대시보드
4. 결제 관리 페이지

### Phase 3: 최적화 및 마케팅 (1-2주)
1. 업그레이드 유도 UI 최적화
2. 이메일 마케팅 자동화
3. 할인 쿠폰 시스템
4. 추천 프로그램 (친구 초대 시 혜택)

---

## 6. 예상 수익 모델

### 가정:
- 월 활성 사용자 (MAU): 10,000명
- 무료 → 프리미엄 전환율: 5%
- 프리미엄 → 프로 전환율: 10%

### 수익 계산:
- 무료 사용자: 9,500명 ($0)
- 프리미엄 사용자: 500명 × $9.99 = $4,995/월
- 프로 사용자: 50명 × $29.99 = $1,500/월

**월 예상 수익: $6,495**
**연 예상 수익: $77,940**

---

## 7. 리스크 및 대응 방안

### 7.1 결제 실패
**대응:**
- Stripe Webhook으로 실시간 감지
- 자동 이메일 알림 (결제 수단 업데이트 요청)
- 3일 유예 기간 후 플랜 다운그레이드

### 7.2 환불 요청
**정책:**
- 14일 내 전액 환불 보장
- 사용량 관계없이 환불 (고객 신뢰 우선)

### 7.3 가격 민감도
**대응:**
- 학생/교육자 할인 (30% 할인)
- 비영리 단체 무료 프로 플랜 제공
- 지역별 가격 차등 (PPP - Purchasing Power Parity)

---

## 8. 성공 지표 (KPI)

1. **전환율 (Conversion Rate)**
   - 무료 → 프리미엄: 목표 5%
   - 프리미엄 → 프로: 목표 10%

2. **이탈률 (Churn Rate)**
   - 월 이탈률: 목표 5% 이하

3. **평균 고객 생애 가치 (LTV)**
   - 목표: $300 이상

4. **고객 획득 비용 (CAC)**
   - 목표: $50 이하

5. **LTV/CAC 비율**
   - 목표: 6:1 이상 (건강한 SaaS 비즈니스)

---

## 9. 다음 단계

1. **사용자 설문조사**
   - 현재 무료 사용자 대상 가격 민감도 조사
   - 필요한 기능 우선순위 파악

2. **경쟁사 분석**
   - ChatGPT Plus, Jasper, Copy.ai 가격 비교
   - 차별화 포인트 발굴

3. **베타 테스트**
   - 소수 사용자 대상 프리미엄 플랜 베타 테스트
   - 피드백 수집 및 개선

4. **공식 출시**
   - 마케팅 캠페인 준비
   - 론칭 이벤트 (출시 기념 할인)

---

## 결론

ZetaLab의 구독결제 시스템은 **무료 플랜으로 사용자를 확보**하고, **프리미엄/프로 플랜으로 수익을 창출**하는 전형적인 Freemium 모델을 따릅니다. Stripe 연동을 통해 빠르게 구현할 수 있으며, 단계적으로 고급 기능을 추가하여 장기적인 성장을 도모할 수 있습니다.

**핵심 성공 요인:**
1. 무료 플랜의 가치를 충분히 제공하여 사용자 확보
2. 명확한 업그레이드 혜택으로 전환율 극대화
3. 지속적인 기능 개선으로 이탈률 최소화
4. 데이터 기반 의사결정으로 최적화

이 시스템을 통해 ZetaLab은 지속 가능한 비즈니스 모델을 구축하고, 사용자에게 더 나은 가치를 제공할 수 있을 것입니다.

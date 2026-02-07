# Server Routers 코드 문서화

**파일**: `server/routers.ts`  
**목적**: tRPC 라우터 정의 및 비즈니스 로직 구현  
**상태**: Production (Manus 기반)  
**마이그레이션 대상**: Firebase + GPT-5.2/Claude/Gemini

---

## 개요

`routers.ts`는 ZetaLab의 모든 API 엔드포인트를 정의합니다. tRPC를 사용하여 타입 안전한 RPC 인터페이스를 제공합니다.

### 현재 구조 (Manus 기반)

```typescript
appRouter = {
  system: systemRouter,           // 시스템 라우터
  auth: {                         // 인증 라우터
    me,
    logout,
    updateManusLinked
  },
  zetaAI: {                       // AI 프롬프트 생성 라우터
    init,
    generatePrompt,
    updatePrompt,
    getPromptById,
    getHistory,
    pinPrompt,
    unpinPrompt
  },
  project: {                      // 프로젝트 관리 라우터
    create,
    getAll,
    getById,
    update,
    delete,
    addConversation,
    removeConversation,
    getConversations
  }
}
```

---

## 라우터 상세 분석

### 1. auth 라우터 (인증)

#### `auth.me` - 현재 사용자 정보 조회

**현재 구현 (Manus):**
```typescript
me: publicProcedure.query(async opts => {
  // 캐시/프록시 오염 방지
  opts.ctx.res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
  opts.ctx.res.setHeader('Pragma', 'no-cache');
  opts.ctx.res.setHeader('Expires', '0');
  return opts.ctx.user;
}),
```

**역할:**
- 현재 로그인한 사용자 정보 반환
- 캐시 헤더로 항상 최신 정보 보장

**마이그레이션 명분:**
- ❌ **Manus OAuth 의존**: Manus 플랫폼에서만 작동
- ✅ **Firebase로 변경**: 독립적인 인증 시스템
- ✅ **향후 개선**: 사용자 프로필 확장 (크레딧, 구독 정보 등)

**Firebase 마이그레이션 코드:**
```typescript
me: publicProcedure.query(async (opts) => {
  // Firebase Admin SDK에서 사용자 정보 조회
  const uid = opts.ctx.user?.uid;
  if (!uid) return null;
  
  const userDoc = await admin.firestore()
    .collection('users')
    .doc(uid)
    .get();
  
  return userDoc.data();
}),
```

---

#### `auth.logout` - 로그아웃

**현재 구현 (Manus):**
```typescript
logout: publicProcedure.mutation(({ ctx }) => {
  const cookieOptions = getSessionCookieOptions(ctx.req);
  ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
  return {
    success: true,
  } as const;
}),
```

**역할:**
- 사용자 세션 쿠키 삭제
- 로그아웃 처리

**마이그레이션 명분:**
- ❌ **Manus 쿠키 의존**: `__Secure-manus-session` 쿠키 사용
- ✅ **Firebase로 변경**: Firebase Auth 토큰 기반
- ✅ **향후 개선**: 로그아웃 이벤트 로깅, 세션 기록 저장

**Firebase 마이그레이션 코드:**
```typescript
logout: publicProcedure.mutation(async ({ ctx }) => {
  // Firebase Admin SDK에서 세션 쿠키 삭제
  await admin.auth().revokeRefreshTokens(ctx.user.uid);
  
  // 로그아웃 이벤트 기록 (선택사항)
  await admin.firestore()
    .collection('auditLogs')
    .add({
      userId: ctx.user.uid,
      action: 'logout',
      timestamp: admin.firestore.FieldValue.serverTimestamp()
    });
  
  return { success: true };
}),
```

---

#### `auth.updateManusLinked` - Manus 연동 상태 업데이트

**현재 구현 (Manus):**
```typescript
updateManusLinked: protectedProcedure
  .input(z.object({ linked: z.boolean() }))
  .mutation(async ({ input, ctx }) => {
    if (!ctx.user) {
      throw new TRPCError({ code: 'UNAUTHORIZED' });
    }
    await updateUserManusLinked(ctx.user.openId, input.linked ? 1 : 0);
    return { success: true };
  }),
```

**역할:**
- 사용자의 Manus 계정 연동 여부 저장

**마이그레이션 명분:**
- ❌ **Manus 특화 기능**: Manus 플랫폼과의 연동만 지원
- ✅ **Firebase로 변경**: 제거 가능 (Firebase가 단일 인증 소스)
- ✅ **향후 개선**: 다중 소셜 로그인 연동 (Google, GitHub 등)

**Firebase 마이그레이션 코드:**
```typescript
// 이 엔드포인트는 제거 가능
// 대신 사용자 프로필에 연동된 제공자 정보 저장
updateSocialLinks: protectedProcedure
  .input(z.object({ 
    provider: z.enum(['google', 'github', 'facebook']),
    linked: z.boolean()
  }))
  .mutation(async ({ input, ctx }) => {
    await admin.firestore()
      .collection('users')
      .doc(ctx.user.uid)
      .update({
        [`linkedProviders.${input.provider}`]: input.linked,
        updatedAt: admin.firestore.FieldValue.serverTimestamp()
      });
    
    return { success: true };
  }),
```

---

### 2. zetaAI 라우터 (프롬프트 생성)

#### `zetaAI.init` - 프롬프트 생성 초기화

**현재 구현 (Manus 기반 LLM):**
```typescript
init: protectedProcedure
  .input(z.object({ question: z.string().min(1) }))
  .mutation(async ({ input, ctx }) => {
    const { nanoid } = await import('nanoid');
    const sessionId = nanoid();
    
    // 질문 키워드 분석
    const templates = await getAllIntentTemplates();
    let selectedTemplate = templates.find(t => {
      const keywords = JSON.parse(t.keywords || '[]');
      return keywords.some(k => input.question.toLowerCase().includes(k));
    });
    
    if (!selectedTemplate) {
      selectedTemplate = templates[0]; // 기본 템플릿
    }
    
    return {
      sessionId,
      category: selectedTemplate.category,
      questions: JSON.parse(selectedTemplate.questions || '[]'),
      canSkip: true
    };
  }),
```

**역할:**
- 사용자 질문 분석
- Intent 템플릿 매칭
- 5개 세부 질문 반환

**마이그레이션 명분:**
- ✅ **LLM 독립적**: 현재는 LLM을 사용하지 않음 (템플릿 기반)
- ✅ **Firebase로 변경**: Firestore에서 템플릿 조회
- ✅ **향후 개선**: LLM을 사용한 동적 질문 생성 (GPT-5.2 활용)

**Firebase 마이그레이션 코드:**
```typescript
init: protectedProcedure
  .input(z.object({ question: z.string().min(1) }))
  .mutation(async ({ input, ctx }) => {
    const { nanoid } = await import('nanoid');
    const sessionId = nanoid();
    
    // Firestore에서 템플릿 조회
    const templatesSnapshot = await admin.firestore()
      .collection('intentTemplate')
      .get();
    
    const templates = templatesSnapshot.docs.map(doc => doc.data());
    
    let selectedTemplate = templates.find(t => {
      const keywords = t.keywords || [];
      return keywords.some(k => 
        input.question.toLowerCase().includes(k)
      );
    });
    
    if (!selectedTemplate) {
      selectedTemplate = templates[0];
    }
    
    return {
      sessionId,
      category: selectedTemplate.category,
      questions: selectedTemplate.questions || [],
      canSkip: true
    };
  }),
```

**향후 개선 (LLM 기반 동적 질문):**
```typescript
// 마이그레이션 후 개선: GPT-5.2를 사용한 동적 질문 생성
async function generateDynamicQuestions(question: string) {
  const llmService = new LLMService();
  
  const systemPrompt = `당신은 사용자의 의도를 파악하기 위한 질문을 생성하는 전문가입니다.
사용자의 질문에 대해 정확한 프롬프트를 생성하기 위해 필요한 5개의 세부 질문을 생성하세요.`;
  
  const userPrompt = `사용자 질문: "${question}"
이 질문에 대해 더 정확한 프롬프트를 생성하기 위해 필요한 5개의 세부 질문을 JSON 배열 형식으로 반환하세요.
예: ["질문1", "질문2", "질문3", "질문4", "질문5"]`;
  
  const response = await llmService.generateWithGPT5(systemPrompt, userPrompt);
  return JSON.parse(response.text);
}
```

---

#### `zetaAI.generatePrompt` - 프롬프트 생성

**현재 구현 (Manus 기반 LLM):**
```typescript
generatePrompt: protectedProcedure
  .input(z.object({
    sessionId: z.string(),
    originalQuestion: z.string(),
    answers: z.record(z.string()),
    skippedQuestions: z.array(z.number()).optional()
  }))
  .mutation(async ({ input, ctx }) => {
    if (!ctx.user) {
      throw new TRPCError({ code: 'UNAUTHORIZED' });
    }

    // Manus Forge API를 통한 LLM 호출
    const llmResponse = await invokeLLM({
      messages: [
        {
          role: 'system',
          content: `당신은 프롬프트 생성 전문가입니다. 사용자의 요청을 기반으로 다른 AI 모델에 바로 적용 가능한 완성형 프롬프트를 생성합니다.`
        },
        {
          role: 'user',
          content: buildPromptContext(input)
        }
      ]
    });

    // 데이터베이스에 저장
    const promptId = await createPromptHistory({
      userId: ctx.user.id,
      sessionId: input.sessionId,
      originalQuestion: input.originalQuestion,
      intentAnswers: JSON.stringify(input.answers),
      generatedPrompt: llmResponse.choices[0].message.content,
      usedLLM: 'gemini-2.5-flash'
    });

    return {
      promptId,
      originalQuestion: input.originalQuestion,
      generatedPrompt: llmResponse.choices[0].message.content,
      suggestedServices: []
    };
  }),
```

**역할:**
- 사용자 답변 기반 프롬프트 생성
- LLM API 호출 (현재: Gemini 2.5 Flash)
- 결과 데이터베이스 저장

**현재 LLM (Manus Forge API):**
```typescript
// server/_core/llm.ts
export async function invokeLLM(params: InvokeParams) {
  const response = await fetch(resolveApiUrl(), {
    method: "POST",
    headers: {
      "content-type": "application/json",
      authorization: `Bearer ${ENV.forgeApiKey}`
    },
    body: JSON.stringify({
      model: "gemini-2.5-flash",  // ← 현재 모델
      messages: normalizeMessages(params.messages),
      max_tokens: 32768,
    })
  });
  return response.json();
}
```

**마이그레이션 명분:**

| 항목 | 현재 (Manus) | 향후 (Firebase) |
|------|-------------|-----------------|
| **LLM** | Gemini 2.5 Flash | GPT-5.2 / Claude / Gemini |
| **API 제공자** | Manus Forge | OpenAI / Anthropic / Google |
| **비용** | Manus 포함 | 직접 관리 (더 저렴) |
| **제어** | 제한적 | 완전 제어 |
| **확장성** | 낮음 | 높음 |

**Firebase 마이그레이션 코드:**
```typescript
generatePrompt: protectedProcedure
  .input(z.object({
    sessionId: z.string(),
    originalQuestion: z.string(),
    answers: z.record(z.string()),
    selectedLLM: z.enum(['gpt5.2', 'claude', 'gemini']).optional(),
    skippedQuestions: z.array(z.number()).optional()
  }))
  .mutation(async ({ input, ctx }) => {
    if (!ctx.user) {
      throw new TRPCError({ code: 'UNAUTHORIZED' });
    }

    // 사용자 크레딧 확인
    const userDoc = await admin.firestore()
      .collection('users')
      .doc(ctx.user.uid)
      .get();
    
    const user = userDoc.data();
    const selectedLLM = input.selectedLLM || user.defaultLLM || 'gpt5.2';
    
    // LLM별 크레딧 비용
    const creditCosts = {
      'gpt5.2': 20,      // ₩20
      'claude': 11,      // ₩11
      'gemini': 3        // ₩3
    };
    
    const requiredCredits = creditCosts[selectedLLM];
    
    if (user.credits < requiredCredits) {
      throw new TRPCError({
        code: 'PRECONDITION_FAILED',
        message: `크레딧 부족. 필요: ${requiredCredits}, 보유: ${user.credits}`
      });
    }

    // LLM 서비스 호출
    const llmService = new LLMService();
    let llmResponse;
    
    switch (selectedLLM) {
      case 'gpt5.2':
        llmResponse = await llmService.generateWithGPT5(
          buildSystemPrompt(),
          buildUserPrompt(input)
        );
        break;
      case 'claude':
        llmResponse = await llmService.generateWithClaude(
          buildSystemPrompt(),
          buildUserPrompt(input)
        );
        break;
      case 'gemini':
        llmResponse = await llmService.generateWithGemini(
          buildSystemPrompt(),
          buildUserPrompt(input)
        );
        break;
    }

    // 크레딧 차감
    await admin.firestore()
      .collection('users')
      .doc(ctx.user.uid)
      .update({
        credits: admin.firestore.FieldValue.increment(-requiredCredits)
      });

    // 거래 기록 저장
    await admin.firestore()
      .collection('credits')
      .add({
        userId: ctx.user.uid,
        type: 'usage',
        llm: selectedLLM,
        amount: -requiredCredits,
        description: `프롬프트 생성 (${selectedLLM})`,
        createdAt: admin.firestore.FieldValue.serverTimestamp()
      });

    // 프롬프트 저장
    const promptRef = await admin.firestore()
      .collection('promptHistory')
      .add({
        userId: ctx.user.uid,
        sessionId: input.sessionId,
        originalQuestion: input.originalQuestion,
        intentAnswers: input.answers,
        generatedPrompt: llmResponse.text,
        usedLLM: selectedLLM,
        creditsUsed: requiredCredits,
        createdAt: admin.firestore.FieldValue.serverTimestamp()
      });

    return {
      promptId: promptRef.id,
      originalQuestion: input.originalQuestion,
      generatedPrompt: llmResponse.text,
      usedLLM: selectedLLM,
      creditsUsed: requiredCredits,
      suggestedServices: []
    };
  }),
```

---

### 3. project 라우터 (프로젝트 관리)

#### `project.create` - 프로젝트 생성

**현재 구현 (Manus 데이터베이스):**
```typescript
create: protectedProcedure
  .input(z.object({
    name: z.string().min(1).max(255),
    description: z.string().optional(),
    color: z.string().optional(),
    icon: z.string().optional()
  }))
  .mutation(async ({ input, ctx }) => {
    if (!ctx.user) {
      throw new TRPCError({ code: 'UNAUTHORIZED' });
    }

    const projectId = await createProject({
      userId: ctx.user.id,
      name: input.name,
      description: input.description,
      color: input.color,
      icon: input.icon
    });

    return {
      id: projectId,
      name: input.name,
      description: input.description,
      color: input.color,
      icon: input.icon,
      createdAt: new Date()
    };
  }),
```

**역할:**
- 새 프로젝트 생성
- 프롬프트 그룹화를 위한 폴더 역할

**마이그레이션 명분:**
- ✅ **LLM 독립적**: 데이터 저장만 담당
- ✅ **Firebase로 변경**: Firestore에 저장
- ✅ **향후 개선**: 팀 협업 기능 (공유, 권한 관리)

**Firebase 마이그레이션 코드:**
```typescript
create: protectedProcedure
  .input(z.object({
    name: z.string().min(1).max(255),
    description: z.string().optional(),
    color: z.string().optional(),
    icon: z.string().optional()
  }))
  .mutation(async ({ input, ctx }) => {
    if (!ctx.user) {
      throw new TRPCError({ code: 'UNAUTHORIZED' });
    }

    const projectRef = await admin.firestore()
      .collection('projects')
      .add({
        userId: ctx.user.uid,
        name: input.name,
        description: input.description || '',
        color: input.color || '#000000',
        icon: input.icon || '📁',
        conversationCount: 0,
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        updatedAt: admin.firestore.FieldValue.serverTimestamp()
      });

    return {
      id: projectRef.id,
      name: input.name,
      description: input.description,
      color: input.color,
      icon: input.icon,
      createdAt: new Date()
    };
  }),
```

---

## 마이그레이션 로드맵

### Phase 1: Firebase 기초 구축 (1-2주)
- [ ] Firebase 프로젝트 설정
- [ ] Firestore 컬렉션 생성
- [ ] Firebase Authentication 설정
- [ ] 기본 라우터 마이그레이션

### Phase 2: LLM 통합 (2-3주)
- [ ] OpenAI GPT-5.2 API 통합
- [ ] Anthropic Claude API 통합
- [ ] Google Gemini API 통합
- [ ] LLM 선택 UI 구현

### Phase 3: 크레딧 시스템 (1-2주)
- [ ] 크레딧 모델 설계
- [ ] Stripe 결제 통합
- [ ] 크레딧 관리 대시보드

### Phase 4: 성능 최적화 (1주)
- [ ] Firestore 인덱스 최적화
- [ ] Cloud Functions 성능 튜닝
- [ ] 캐싱 전략 구현

---

## 주요 변경사항 체크리스트

### 인증 (auth)
- [ ] Manus OAuth → Firebase Authentication
- [ ] `updateManusLinked` 제거 또는 `updateSocialLinks`로 변경
- [ ] 세션 쿠키 → Firebase 토큰

### AI 프롬프트 생성 (zetaAI)
- [ ] Manus Forge API → OpenAI/Claude/Gemini API
- [ ] 단일 LLM → 다중 LLM 선택
- [ ] 크레딧 시스템 추가
- [ ] 사용 기록 추적

### 프로젝트 관리 (project)
- [ ] MySQL → Firestore
- [ ] 팀 협업 기능 추가 (향후)

### 데이터베이스
- [ ] MySQL/TiDB → Firestore
- [ ] 관계형 → 문서형 데이터 모델

---

## 참고 자료

- [Firebase 공식 문서](https://firebase.google.com/docs)
- [OpenAI API 문서](https://platform.openai.com/docs)
- [Anthropic Claude API](https://docs.anthropic.com)
- [Google Gemini API](https://ai.google.dev)
- [tRPC 문서](https://trpc.io)

---

**마지막 업데이트**: 2026년 2월 3일  
**상태**: 마이그레이션 대기 중  
**담당자**: ZetaLab 개발팀

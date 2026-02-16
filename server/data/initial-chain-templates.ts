/**
 * ZetaLab - Initial Chain Templates
 * 초기 체인 템플릿 데이터
 */

export const INITIAL_CHAIN_TEMPLATES = [
  // ============================================================================
  // 1. Blog Writing (블로그 글 작성)
  // ============================================================================
  {
    id: 'template_blog_writing_001',
    name: '블로그 글 작성 (4단계)',
    description:
      '주제에 대한 아이디어 생성부터 완성된 블로그 글까지 자동으로 생성합니다. SEO 최적화된 고품질 콘텐츠를 만들 수 있습니다.',
    category: 'blog',
    steps: [
      {
        order: 1,
        name: '아이디어 브레인스토밍',
        promptTemplate: `주제: {{initial_input}}

위 주제에 대한 블로그 글을 작성하기 위해 3-5개의 핵심 아이디어를 브레인스토밍해주세요.
각 아이디어는:
- 독자의 관심을 끌 수 있는 구체적인 내용
- 실용적이고 가치 있는 정보
- SEO 관점에서 효과적인 키워드 포함

형식: 번호 매긴 리스트로 출력`,
        modelId: 'claude-sonnet-4-5',
        usePreviousOutput: false,
        estimatedCost: 0.015,
        description: '주제에 대한 핵심 아이디어를 생성합니다.',
      },
      {
        order: 2,
        name: '아웃라인 작성',
        promptTemplate: `주제: {{initial_input}}

아이디어:
{{previous_output}}

위 아이디어를 바탕으로 블로그 글의 상세한 아웃라인을 작성해주세요.

구조:
1. 제목 (SEO 최적화, 60자 이내)
2. 서론 (독자의 문제의식 환기)
3. 본론 (3-5개 섹션, 각 섹션에 소제목과 주요 내용)
4. 결론 (핵심 내용 요약 및 행동 촉구)

각 섹션에는 구체적인 내용 방향을 명시해주세요.`,
        modelId: 'claude-sonnet-4-5',
        usePreviousOutput: true,
        estimatedCost: 0.02,
        description: '블로그 글의 구조와 흐름을 설계합니다.',
      },
      {
        order: 3,
        name: '본문 작성',
        promptTemplate: `아웃라인:
{{previous_output}}

위 아웃라인을 바탕으로 완전한 블로그 글을 작성해주세요.

요구사항:
- 분량: 1,500-2,000단어
- 톤: 친근하고 전문적
- 문체: 명확하고 읽기 쉬운 문장
- 각 섹션은 구체적인 예시와 데이터 포함
- 자연스러운 키워드 배치 (SEO 최적화)
- 단락은 3-4문장으로 구성하여 가독성 확보

마크다운 형식으로 작성해주세요.`,
        modelId: 'claude-sonnet-4-5',
        usePreviousOutput: true,
        estimatedCost: 0.04,
        description: '아웃라인을 바탕으로 완성된 글을 작성합니다.',
      },
      {
        order: 4,
        name: 'SEO 메타데이터 생성',
        promptTemplate: `블로그 글:
{{previous_output}}

위 블로그 글에 대한 SEO 메타데이터를 생성해주세요.

출력 형식:
1. Meta Title (60자 이내, 주요 키워드 포함)
2. Meta Description (155자 이내, 클릭 유도 문구 포함)
3. Focus Keywords (5-7개, 콤마로 구분)
4. Slug (URL 친화적, 소문자-하이픈 형식)
5. 소셜 미디어 공유 문구 (트위터/페이스북용 각 1개)

JSON 형식으로 출력해주세요.`,
        modelId: 'claude-haiku-4-5',
        usePreviousOutput: true,
        estimatedCost: 0.008,
        description: 'SEO 최적화를 위한 메타데이터를 생성합니다.',
      },
    ],
    isOfficial: true,
    usageCount: 0,
    tags: ['블로그', 'SEO', '콘텐츠', '글쓰기'],
    estimatedTime: 180, // 3분
    createdAt: new Date('2025-01-15'),
  },

  // ============================================================================
  // 2. YouTube Shorts Script (유튜브 쇼츠 대본)
  // ============================================================================
  {
    id: 'template_youtube_shorts_002',
    name: '유튜브 쇼츠 대본 (3단계)',
    description:
      '60초 이내의 매력적인 유튜브 쇼츠 대본을 생성합니다. 훅-내용-CTA 구조로 시청자 참여를 극대화합니다.',
    category: 'video',
    steps: [
      {
        order: 1,
        name: '핵심 메시지 추출',
        promptTemplate: `주제: {{initial_input}}

위 주제로 유튜브 쇼츠를 만들려고 합니다. 60초 이내의 쇼츠 영상에 담을 핵심 메시지를 추출해주세요.

요구사항:
- 첫 3초에 시청자의 주의를 끌 수 있는 강력한 훅 (질문, 충격적인 사실, 호기심 유발)
- 중간 부분에 전달할 핵심 가치 (2-3개 포인트)
- 마지막에 명확한 행동 유도 (CTA)

각 요소를 명확히 구분하여 출력해주세요.`,
        modelId: 'claude-sonnet-4-5',
        usePreviousOutput: false,
        estimatedCost: 0.012,
        description: '쇼츠 영상의 핵심 메시지를 설계합니다.',
      },
      {
        order: 2,
        name: '대본 작성',
        promptTemplate: `핵심 메시지:
{{previous_output}}

위 핵심 메시지를 바탕으로 60초 유튜브 쇼츠 대본을 작성해주세요.

형식:
[0-3초] 훅: (시청자의 주의를 끄는 한 문장)
[3-10초] 문제 제기: (시청자가 공감할 수 있는 문제)
[10-45초] 해결책: (구체적인 2-3개 포인트, 각 10-15초)
[45-55초] 요약: (핵심 내용을 한 문장으로)
[55-60초] CTA: (구독, 좋아요, 댓글 유도)

각 타임라인에 맞춰 자막으로 표시될 대본을 작성해주세요.
말하는 속도는 초당 2-3단어로 계산합니다.`,
        modelId: 'claude-sonnet-4-5',
        usePreviousOutput: true,
        estimatedCost: 0.018,
        description: '타임라인에 맞춰 대본을 작성합니다.',
      },
      {
        order: 3,
        name: '촬영 가이드',
        promptTemplate: `대본:
{{previous_output}}

위 대본에 맞는 촬영 가이드를 작성해주세요.

포함 내용:
1. 촬영 구도 (클로즈업/미디엄/와이드샷)
2. 배경 및 조명 (실내/실외, 자연광/조명)
3. 소품 및 의상 제안
4. 편집 팁 (컷, 트랜지션, 효과음, 배경음악)
5. 썸네일 아이디어 (3개)

실용적이고 구체적으로 작성해주세요.`,
        modelId: 'claude-haiku-4-5',
        usePreviousOutput: true,
        estimatedCost: 0.01,
        description: '촬영 및 편집을 위한 가이드를 제공합니다.',
      },
    ],
    isOfficial: true,
    usageCount: 0,
    tags: ['유튜브', '쇼츠', '영상', '대본'],
    estimatedTime: 120, // 2분
    createdAt: new Date('2025-01-15'),
  },

  // ============================================================================
  // 3. Novel Outline (소설 아웃라인)
  // ============================================================================
  {
    id: 'template_novel_outline_003',
    name: '소설 아웃라인 (5단계)',
    description:
      '완성도 높은 소설 아웃라인을 생성합니다. 캐릭터, 플롯, 세계관까지 체계적으로 설계합니다.',
    category: 'creative',
    steps: [
      {
        order: 1,
        name: '핵심 컨셉 정의',
        promptTemplate: `주제: {{initial_input}}

위 주제로 소설을 쓰려고 합니다. 소설의 핵심 컨셉을 정의해주세요.

포함 내용:
1. 장르 (판타지, SF, 로맨스, 추리, 스릴러 등)
2. 주요 갈등 (내적/외적)
3. 핵심 질문 (이야기가 탐구하는 주제)
4. 독자 타겟 (연령대, 관심사)
5. 유사 작품 (참고할 만한 소설 3개)

각 항목을 구체적으로 작성해주세요.`,
        modelId: 'claude-sonnet-4-5',
        usePreviousOutput: false,
        estimatedCost: 0.015,
        description: '소설의 기본 컨셉과 방향을 설정합니다.',
      },
      {
        order: 2,
        name: '캐릭터 설계',
        promptTemplate: `핵심 컨셉:
{{previous_output}}

위 컨셉을 바탕으로 주요 캐릭터 3-5명을 설계해주세요.

각 캐릭터 프로필:
1. 이름 및 나이
2. 외모 (키, 체형, 특징적인 외모)
3. 성격 (MBTI, 핵심 성격 특질 5개)
4. 배경 (가족, 직업, 과거 트라우마)
5. 목표 (이야기에서 원하는 것)
6. 내적 갈등 (극복해야 할 심리적 장애)
7. 캐릭터 아크 (시작 → 변화 → 결말)

주인공, 조력자, 적대자를 명확히 구분해주세요.`,
        modelId: 'claude-sonnet-4-5',
        usePreviousOutput: true,
        estimatedCost: 0.025,
        description: '입체적인 캐릭터를 설계합니다.',
      },
      {
        order: 3,
        name: '세계관 구축',
        promptTemplate: `핵심 컨셉:
{{initial_input}}

캐릭터:
{{previous_output}}

이야기의 세계관을 구축해주세요.

포함 내용:
1. 시간적 배경 (연도, 시대)
2. 공간적 배경 (나라, 도시, 주요 장소 3-5개)
3. 사회 구조 (계급, 정치 체제, 경제 시스템)
4. 특별한 규칙 (마법 시스템, 기술 수준, 사회적 금기)
5. 주요 사건 (이야기 시작 전 발생한 중요한 역사적 사건)

이 세계가 현실과 어떻게 다른지 명확히 해주세요.`,
        modelId: 'claude-sonnet-4-5',
        usePreviousOutput: true,
        estimatedCost: 0.022,
        description: '이야기가 펼쳐질 세계관을 설계합니다.',
      },
      {
        order: 4,
        name: '플롯 구성',
        promptTemplate: `세계관:
{{previous_output}}

3막 구조로 플롯을 구성해주세요.

[1막 - 설정] (25%)
- 일상 세계
- 사건의 촉발
- 결단의 순간

[2막 - 대립] (50%)
- 장애물과 시련
- 중간 전환점 (midpoint)
- 최악의 순간 (all is lost)

[3막 - 해결] (25%)
- 최종 대결
- 클라이맥스
- 결말

각 단계마다 3-5개의 주요 장면을 상세히 기술해주세요.
캐릭터의 변화와 감정선도 함께 표시해주세요.`,
        modelId: 'claude-sonnet-4-5',
        usePreviousOutput: true,
        estimatedCost: 0.03,
        description: '3막 구조의 상세한 플롯을 구성합니다.',
      },
      {
        order: 5,
        name: '챕터별 요약',
        promptTemplate: `플롯:
{{previous_output}}

위 플롯을 15-20개 챕터로 나누어 각 챕터의 요약을 작성해주세요.

각 챕터:
- 챕터 번호 및 제목
- 주요 사건 (2-3문장)
- 등장 캐릭터
- 장소
- 예상 분량 (단어 수)
- 감정 톤 (긴장감, 로맨스, 액션 등)

전체 흐름이 자연스럽게 연결되도록 작성해주세요.`,
        modelId: 'claude-haiku-4-5',
        usePreviousOutput: true,
        estimatedCost: 0.015,
        description: '집필을 위한 챕터별 가이드를 생성합니다.',
      },
    ],
    isOfficial: true,
    usageCount: 0,
    tags: ['소설', '창작', '플롯', '캐릭터'],
    estimatedTime: 300, // 5분
    createdAt: new Date('2025-01-15'),
  },

  // ============================================================================
  // 4. Business Proposal (사업 제안서)
  // ============================================================================
  {
    id: 'template_business_proposal_004',
    name: '사업 제안서 (4단계)',
    description:
      '투자자 또는 파트너를 설득하기 위한 전문적인 사업 제안서를 생성합니다. 시장 분석부터 재무 계획까지 포함합니다.',
    category: 'analysis',
    steps: [
      {
        order: 1,
        name: '사업 개요 및 시장 분석',
        promptTemplate: `사업 아이디어: {{initial_input}}

위 아이디어에 대한 사업 개요와 시장 분석을 작성해주세요.

포함 내용:
1. Executive Summary (2-3문장)
2. 문제 정의 (해결하려는 문제)
3. 솔루션 (제공하는 가치)
4. 타겟 시장 (TAM, SAM, SOM)
5. 시장 트렌드 (3-5개 주요 트렌드)
6. 경쟁 분석 (직접/간접 경쟁사 3-5개)
7. 차별화 포인트 (Unique Value Proposition)

데이터 기반으로 설득력 있게 작성해주세요.`,
        modelId: 'claude-sonnet-4-5',
        usePreviousOutput: false,
        estimatedCost: 0.025,
        description: '시장 기회와 경쟁 구도를 분석합니다.',
      },
      {
        order: 2,
        name: '사업 모델 및 전략',
        promptTemplate: `시장 분석:
{{previous_output}}

위 분석을 바탕으로 사업 모델과 전략을 수립해주세요.

포함 내용:
1. 비즈니스 모델 (수익 모델, 가격 전략)
2. 고객 획득 전략 (마케팅 채널, CAC)
3. 제품/서비스 로드맵 (6개월, 1년, 2년)
4. 파트너십 전략
5. 핵심 성과 지표 (KPI 5-7개)
6. 리스크 분석 및 대응 방안

실행 가능한 구체적인 계획으로 작성해주세요.`,
        modelId: 'claude-sonnet-4-5',
        usePreviousOutput: true,
        estimatedCost: 0.025,
        description: '구체적인 사업 전략을 수립합니다.',
      },
      {
        order: 3,
        name: '재무 계획',
        promptTemplate: `사업 모델:
{{previous_output}}

3개년 재무 계획을 수립해주세요.

포함 내용:
1. 초기 투자 비용 (항목별 상세)
2. 월별 운영 비용 (고정비, 변동비)
3. 수익 예측 (Year 1, 2, 3)
   - 월별 매출
   - 고객 수
   - 객단가
4. 손익 분기점 (BEP)
5. 자금 조달 계획 (필요 금액, 용도, 조달 방법)
6. Exit 전략 (IPO, M&A 등)

표 형식으로 정리하여 한눈에 파악할 수 있게 작성해주세요.`,
        modelId: 'gpt-4o',
        usePreviousOutput: true,
        estimatedCost: 0.02,
        description: '재무 계획과 투자 유치 전략을 수립합니다.',
      },
      {
        order: 4,
        name: '팀 소개 및 결론',
        promptTemplate: `재무 계획:
{{previous_output}}

팀 소개와 제안서 결론을 작성해주세요.

포함 내용:
1. 팀 구성 (필요한 핵심 멤버 3-5명)
   - 역할 (CEO, CTO, CMO 등)
   - 필요 역량
   - 책임 범위
2. 자문단 (필요한 경우)
3. 마일스톤 (6개월 단위 목표)
4. 결론 (투자자/파트너에게 전하는 핵심 메시지)
5. Call to Action (다음 단계 제안)

열정과 신뢰를 전달할 수 있도록 작성해주세요.`,
        modelId: 'claude-haiku-4-5',
        usePreviousOutput: true,
        estimatedCost: 0.012,
        description: '팀과 실행 계획으로 제안서를 완성합니다.',
      },
    ],
    isOfficial: true,
    usageCount: 0,
    tags: ['사업', '제안서', '투자', '창업'],
    estimatedTime: 240, // 4분
    createdAt: new Date('2025-01-15'),
  },

  // ============================================================================
  // 5. Email Marketing Sequence (이메일 마케팅 시퀀스)
  // ============================================================================
  {
    id: 'template_email_sequence_005',
    name: '이메일 마케팅 시퀀스 (3단계)',
    description:
      '전환율을 높이는 이메일 마케팅 시퀀스를 생성합니다. 웰컴 → 교육 → 전환 단계로 구성됩니다.',
    category: 'creative',
    steps: [
      {
        order: 1,
        name: '타겟 분석 및 전략',
        promptTemplate: `제품/서비스: {{initial_input}}

위 제품/서비스에 대한 이메일 마케팅 전략을 수립해주세요.

포함 내용:
1. 타겟 페르소나 (2-3개)
   - 인구통계학적 특성
   - 문제/욕구
   - 의사결정 기준
2. 이메일 시퀀스 목표 (전환율, 오픈율 목표)
3. 핵심 메시지 (각 이메일의 주제)
4. 발송 타이밍 (Day 1, Day 3, Day 7 등)
5. CTA 전략 (각 이메일의 행동 유도)

고객 여정에 맞춰 체계적으로 작성해주세요.`,
        modelId: 'claude-sonnet-4-5',
        usePreviousOutput: false,
        estimatedCost: 0.018,
        description: '이메일 마케팅 전략을 설계합니다.',
      },
      {
        order: 2,
        name: '이메일 시퀀스 작성',
        promptTemplate: `전략:
{{previous_output}}

위 전략을 바탕으로 5개의 이메일을 작성해주세요.

각 이메일:
1. 제목 (오픈율을 높이는 매력적인 제목)
2. 본문 (150-250단어)
   - 훅 (첫 문장)
   - 가치 제공 (문제 해결, 팁, 스토리)
   - CTA (명확한 행동 유도)
3. PS (추가 메시지 또는 긴급성 부여)

이메일 순서:
- Email 1 (Day 0): 웰컴 이메일
- Email 2 (Day 2): 교육 콘텐츠
- Email 3 (Day 5): 사회적 증거 (후기, 케이스 스터디)
- Email 4 (Day 7): 특별 오퍼
- Email 5 (Day 10): 최종 리마인더

친근하고 설득력 있는 톤으로 작성해주세요.`,
        modelId: 'claude-sonnet-4-5',
        usePreviousOutput: true,
        estimatedCost: 0.035,
        description: '5개의 이메일을 작성합니다.',
      },
      {
        order: 3,
        name: 'A/B 테스트 변형 및 분석',
        promptTemplate: `이메일 시퀀스:
{{previous_output}}

각 이메일에 대한 A/B 테스트 변형과 분석 계획을 작성해주세요.

포함 내용:
1. 제목 A/B 테스트 (각 이메일당 2-3개 변형)
2. CTA 버튼 문구 변형 (2-3개)
3. 측정 지표
   - 오픈율 (목표: 25-35%)
   - 클릭률 (목표: 3-8%)
   - 전환율 (목표: 1-3%)
4. 최적화 체크리스트
   - 모바일 최적화
   - 이미지 대체 텍스트
   - 스팸 필터 회피 팁
5. 세그먼테이션 전략 (반응에 따른 고객 분류)

실무에서 바로 적용 가능하도록 구체적으로 작성해주세요.`,
        modelId: 'gpt-4o-mini',
        usePreviousOutput: true,
        estimatedCost: 0.01,
        description: 'A/B 테스트와 최적화 방안을 제시합니다.',
      },
    ],
    isOfficial: true,
    usageCount: 0,
    tags: ['이메일', '마케팅', '전환', 'CTA'],
    estimatedTime: 200, // 3분 20초
    createdAt: new Date('2025-01-15'),
  },
];

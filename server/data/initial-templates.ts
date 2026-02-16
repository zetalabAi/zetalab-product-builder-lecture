/**
 * Initial Template Data
 * 15 Official Templates across 4 categories
 */

import { InsertPromptTemplate, TemplateVariable } from '../db';

export const initialTemplates: Omit<InsertPromptTemplate, 'userId'>[] = [
  // ============================================================================
  // BLOG (5 templates)
  // ============================================================================
  {
    title: 'SEO 최적화 블로그 글',
    description: '검색엔진 최적화를 고려한 블로그 포스트를 작성합니다',
    category: 'blog',
    tags: ['SEO', '마케팅', '블로그'],
    templateContent: `{{topic}}에 대한 SEO 최적화 블로그 글을 작성해주세요.

대상 독자: {{audience}}
글의 톤: {{tone}}
목표 키워드: {{keyword}}
글자 수: {{wordCount}}자

다음 구조를 따라주세요:
1. 흥미로운 도입부 (독자의 관심 유발)
2. 핵심 내용 (구체적인 정보와 예시)
3. 실용적인 팁 3-5개
4. 명확한 행동 유도 (CTA)

SEO를 위해 메타 디스크립션(150자)도 함께 작성해주세요.`,
    isPublic: true,
    isOfficial: true,
    usageCount: 0,
    variables: [
      {
        name: 'topic',
        label: '주제',
        placeholder: '예: AI 트렌드 2026',
        required: true,
        type: 'text',
      },
      {
        name: 'audience',
        label: '대상 독자',
        placeholder: '예: 마케팅 초보자',
        required: true,
        type: 'text',
      },
      {
        name: 'tone',
        label: '글의 톤',
        placeholder: '선택하세요',
        required: true,
        type: 'select',
        options: ['친근한', '전문적인', '유머러스한', '공식적인'],
      },
      {
        name: 'keyword',
        label: '목표 키워드',
        placeholder: '예: AI 활용법',
        required: true,
        type: 'text',
      },
      {
        name: 'wordCount',
        label: '글자 수',
        placeholder: '예: 1500',
        required: true,
        type: 'text',
      },
    ] as TemplateVariable[],
  },
  {
    title: '스토리텔링 블로그',
    description: '독자의 공감을 이끌어내는 스토리 중심 블로그 글',
    category: 'blog',
    tags: ['스토리텔링', '감성', '브랜딩'],
    templateContent: `{{theme}}를 주제로 한 스토리텔링 블로그 글을 작성해주세요.

스토리 시작점: {{storyStart}}
핵심 메시지: {{message}}
감정 톤: {{emotion}}

다음 구조로 작성해주세요:
1. 몰입감 있는 오프닝 (독자를 이야기 속으로)
2. 문제 상황 제시
3. 해결 과정 (구체적인 경험)
4. 교훈과 인사이트
5. 독자에게 던지는 질문

1,200-1,500자로 작성하고, 단락별로 소제목을 붙여주세요.`,
    isPublic: true,
    isOfficial: true,
    usageCount: 0,
    variables: [
      {
        name: 'theme',
        label: '테마',
        placeholder: '예: 실패를 통한 성장',
        required: true,
        type: 'text',
      },
      {
        name: 'storyStart',
        label: '스토리 시작점',
        placeholder: '예: 첫 창업의 실패 경험',
        required: true,
        type: 'textarea',
      },
      {
        name: 'message',
        label: '핵심 메시지',
        placeholder: '예: 실패는 배움의 기회다',
        required: true,
        type: 'text',
      },
      {
        name: 'emotion',
        label: '감정 톤',
        placeholder: '선택하세요',
        required: true,
        type: 'select',
        options: ['희망적인', '성찰적인', '유머러스한', '진지한'],
      },
    ] as TemplateVariable[],
  },
  {
    title: '제품 리뷰 블로그',
    description: '상세하고 객관적인 제품 리뷰 글',
    category: 'blog',
    tags: ['리뷰', '제품', '비교'],
    templateContent: `{{productName}}에 대한 종합 리뷰를 작성해주세요.

제품 카테고리: {{category}}
사용 기간: {{duration}}
주요 사용 목적: {{purpose}}

다음 항목을 포함해주세요:
1. 제품 개요 및 첫인상
2. 주요 기능 및 장점 (최소 3가지)
3. 단점 및 개선점 (최소 2가지)
4. 경쟁 제품과의 비교
5. 종합 평가 (별점 5점 만점)
6. 추천 대상

객관적이고 구체적인 표현을 사용하고, 실제 사용 경험을 바탕으로 작성해주세요.`,
    isPublic: true,
    isOfficial: true,
    usageCount: 0,
    variables: [
      {
        name: 'productName',
        label: '제품명',
        placeholder: '예: 애플 에어팟 프로 2',
        required: true,
        type: 'text',
      },
      {
        name: 'category',
        label: '제품 카테고리',
        placeholder: '예: 무선 이어폰',
        required: true,
        type: 'text',
      },
      {
        name: 'duration',
        label: '사용 기간',
        placeholder: '예: 3개월',
        required: true,
        type: 'text',
      },
      {
        name: 'purpose',
        label: '주요 사용 목적',
        placeholder: '예: 출퇴근 및 운동 시 음악 감상',
        required: true,
        type: 'text',
      },
    ] as TemplateVariable[],
  },
  {
    title: 'How-to 가이드',
    description: '단계별 실용 가이드 블로그 글',
    category: 'blog',
    tags: ['튜토리얼', '가이드', '교육'],
    templateContent: `"{{task}}하는 방법"에 대한 상세 가이드를 작성해주세요.

대상 독자 수준: {{level}}
예상 소요 시간: {{time}}
필요한 도구/준비물: {{tools}}

다음 구조로 작성해주세요:
1. 소개 (왜 이것이 필요한가?)
2. 사전 준비사항
3. 단계별 실행 가이드 (5-7단계)
   - 각 단계마다 구체적인 설명
   - 주의사항 및 팁
4. 문제 해결 (자주 발생하는 오류)
5. 다음 단계 (심화 학습 방향)

초보자도 쉽게 따라할 수 있도록 구체적으로 작성해주세요.`,
    isPublic: true,
    isOfficial: true,
    usageCount: 0,
    variables: [
      {
        name: 'task',
        label: '수행할 작업',
        placeholder: '예: 유튜브 썸네일 만들기',
        required: true,
        type: 'text',
      },
      {
        name: 'level',
        label: '독자 수준',
        placeholder: '선택하세요',
        required: true,
        type: 'select',
        options: ['완전 초보', '초급', '중급', '고급'],
      },
      {
        name: 'time',
        label: '예상 소요 시간',
        placeholder: '예: 30분',
        required: true,
        type: 'text',
      },
      {
        name: 'tools',
        label: '필요한 도구',
        placeholder: '예: Canva, 포토샵',
        required: true,
        type: 'text',
      },
    ] as TemplateVariable[],
  },
  {
    title: '비교 분석 블로그',
    description: '두 가지 옵션을 비교 분석하는 객관적 글',
    category: 'blog',
    tags: ['비교', '분석', '의사결정'],
    templateContent: `{{optionA}}와 {{optionB}}를 비교 분석해주세요.

비교 목적: {{purpose}}
주요 비교 기준: {{criteria}}

다음 구조로 작성해주세요:
1. 개요 (두 옵션의 간단한 소개)
2. 상세 비교표
   - {{criteria}} 기준으로 항목별 비교
   - 각 항목마다 점수 또는 평가
3. 장단점 분석
   - {{optionA}}의 장단점
   - {{optionB}}의 장단점
4. 상황별 추천
   - 어떤 경우에 A가 적합한지
   - 어떤 경우에 B가 적합한지
5. 결론 및 최종 추천

객관적인 데이터와 사용자 경험을 바탕으로 공정하게 비교해주세요.`,
    isPublic: true,
    isOfficial: true,
    usageCount: 0,
    variables: [
      {
        name: 'optionA',
        label: '옵션 A',
        placeholder: '예: 노션',
        required: true,
        type: 'text',
      },
      {
        name: 'optionB',
        label: '옵션 B',
        placeholder: '예: 옵시디언',
        required: true,
        type: 'text',
      },
      {
        name: 'purpose',
        label: '비교 목적',
        placeholder: '예: 개인 지식 관리 도구 선택',
        required: true,
        type: 'text',
      },
      {
        name: 'criteria',
        label: '주요 비교 기준',
        placeholder: '예: 가격, 기능, 사용 편의성',
        required: true,
        type: 'text',
      },
    ] as TemplateVariable[],
  },

  // ============================================================================
  // NOVEL (3 templates)
  // ============================================================================
  {
    title: '단편 소설 구조',
    description: '기승전결이 명확한 단편 소설 플롯',
    category: 'novel',
    tags: ['소설', '창작', '단편'],
    templateContent: `{{genre}} 장르의 단편 소설을 작성해주세요.

주인공: {{protagonist}}
배경: {{setting}}
핵심 갈등: {{conflict}}
분량: {{length}}자

다음 구조를 따라주세요:
1. 기 (도입부) - 인물과 배경 소개
2. 승 (전개) - 사건 발생 및 갈등 심화
3. 전 (절정) - 갈등의 최고조
4. 결 (결말) - 해결과 여운

생생한 묘사와 캐릭터의 내면 심리를 풍부하게 표현해주세요.`,
    isPublic: true,
    isOfficial: true,
    usageCount: 0,
    variables: [
      {
        name: 'genre',
        label: '장르',
        placeholder: '선택하세요',
        required: true,
        type: 'select',
        options: ['판타지', '로맨스', '추리', 'SF', '스릴러', '일상'],
      },
      {
        name: 'protagonist',
        label: '주인공',
        placeholder: '예: 20대 여성 개발자',
        required: true,
        type: 'text',
      },
      {
        name: 'setting',
        label: '배경',
        placeholder: '예: 2026년 서울 스타트업',
        required: true,
        type: 'text',
      },
      {
        name: 'conflict',
        label: '핵심 갈등',
        placeholder: '예: AI가 인간의 일자리를 대체하는 시대',
        required: true,
        type: 'textarea',
      },
      {
        name: 'length',
        label: '분량',
        placeholder: '예: 3000',
        required: true,
        type: 'text',
      },
    ] as TemplateVariable[],
  },
  {
    title: '캐릭터 중심 스토리',
    description: '캐릭터의 성장과 변화에 초점을 맞춘 이야기',
    category: 'novel',
    tags: ['캐릭터', '성장', '드라마'],
    templateContent: `{{character}}의 성장 스토리를 작성해주세요.

초기 상태: {{initialState}}
변화의 계기: {{trigger}}
최종 상태: {{finalState}}
스토리 분위기: {{mood}}

다음 요소를 포함해주세요:
1. 캐릭터의 초기 모습과 내면의 약점
2. 변화를 촉발하는 결정적 사건
3. 시행착오와 좌절의 과정
4. 깨달음과 극복
5. 성장한 모습과 새로운 시작

캐릭터의 감정선과 내적 갈등을 섬세하게 그려주세요.`,
    isPublic: true,
    isOfficial: true,
    usageCount: 0,
    variables: [
      {
        name: 'character',
        label: '캐릭터',
        placeholder: '예: 실패를 두려워하는 청년',
        required: true,
        type: 'text',
      },
      {
        name: 'initialState',
        label: '초기 상태',
        placeholder: '예: 안정만 추구하며 도전을 회피함',
        required: true,
        type: 'textarea',
      },
      {
        name: 'trigger',
        label: '변화의 계기',
        placeholder: '예: 회사 구조조정으로 실직',
        required: true,
        type: 'text',
      },
      {
        name: 'finalState',
        label: '최종 상태',
        placeholder: '예: 실패를 두려워하지 않는 창업가',
        required: true,
        type: 'text',
      },
      {
        name: 'mood',
        label: '스토리 분위기',
        placeholder: '선택하세요',
        required: true,
        type: 'select',
        options: ['희망적인', '진지한', '유머러스한', '서정적인'],
      },
    ] as TemplateVariable[],
  },
  {
    title: '반전 스토리',
    description: '예상을 뒤엎는 플롯 트위스트가 있는 이야기',
    category: 'novel',
    tags: ['반전', '서스펜스', '추리'],
    templateContent: `{{premise}}를 바탕으로 반전이 있는 이야기를 작성해주세요.

표면적 스토리: {{surface}}
숨겨진 진실: {{truth}}
반전 시점: {{twist}}

다음 구조로 작성해주세요:
1. 일상적인 도입 (독자를 안심시킴)
2. 미묘한 복선 배치 (3-4개)
3. 긴장감 증폭
4. 충격적인 반전 공개
5. 복선 회수 및 진실 해명

독자가 반전을 예상하기 어렵도록 교묘하게 복선을 배치하되, 반전 후에는 모든 것이 자연스럽게 연결되도록 작성해주세요.`,
    isPublic: true,
    isOfficial: true,
    usageCount: 0,
    variables: [
      {
        name: 'premise',
        label: '기본 설정',
        placeholder: '예: 완벽해 보이는 결혼생활',
        required: true,
        type: 'text',
      },
      {
        name: 'surface',
        label: '표면적 스토리',
        placeholder: '예: 행복한 부부의 일상',
        required: true,
        type: 'textarea',
      },
      {
        name: 'truth',
        label: '숨겨진 진실',
        placeholder: '예: 남편이 사실은 증인보호 프로그램 대상자',
        required: true,
        type: 'textarea',
      },
      {
        name: 'twist',
        label: '반전 시점',
        placeholder: '선택하세요',
        required: true,
        type: 'select',
        options: ['중반', '후반', '결말 직전'],
      },
    ] as TemplateVariable[],
  },

  // ============================================================================
  // VIDEO (4 templates)
  // ============================================================================
  {
    title: '유튜브 쇼츠 스크립트',
    description: '60초 안에 메시지를 전달하는 쇼츠 영상 대본',
    category: 'video',
    tags: ['쇼츠', '유튜브', '바이럴'],
    templateContent: `{{topic}}에 대한 유튜브 쇼츠 스크립트를 작성해주세요.

타겟: {{target}}
핵심 메시지: {{message}}
톤앤매너: {{tone}}

다음 구조로 작성해주세요:
1. 훅 (0-3초): 시선을 사로잡는 오프닝
2. 문제 제시 (3-10초): 공감대 형성
3. 솔루션 (10-50초): 핵심 내용 전달
4. CTA (50-60초): 행동 유도

각 장면마다 자막 텍스트와 화면 구성을 명시해주세요.
시청자가 끝까지 보도록 흐름을 빠르게 유지해주세요.`,
    isPublic: true,
    isOfficial: true,
    usageCount: 0,
    variables: [
      {
        name: 'topic',
        label: '주제',
        placeholder: '예: 아침 루틴 3가지',
        required: true,
        type: 'text',
      },
      {
        name: 'target',
        label: '타겟 시청자',
        placeholder: '예: 20-30대 직장인',
        required: true,
        type: 'text',
      },
      {
        name: 'message',
        label: '핵심 메시지',
        placeholder: '예: 아침 30분이 하루를 바꾼다',
        required: true,
        type: 'text',
      },
      {
        name: 'tone',
        label: '톤앤매너',
        placeholder: '선택하세요',
        required: true,
        type: 'select',
        options: ['에너제틱', '차분한', '유머러스', '전문적인'],
      },
    ] as TemplateVariable[],
  },
  {
    title: '설명형 영상 스크립트',
    description: '복잡한 개념을 쉽게 설명하는 교육 영상 대본',
    category: 'video',
    tags: ['교육', '설명', '튜토리얼'],
    templateContent: `{{concept}}을 설명하는 영상 스크립트를 작성해주세요.

영상 길이: {{duration}}분
타겟: {{audience}}
핵심 포인트: {{points}}

다음 구조로 작성해주세요:
1. 인트로 (0:00-0:30)
   - 주제 소개
   - 왜 중요한지 설명
2. 본론 (0:30-{{duration}}:00)
   - 개념 설명 (비유와 예시 활용)
   - 단계별 분해
   - 시각자료 활용 지점 명시
3. 아웃트로 (마지막 30초)
   - 핵심 요약
   - 다음 영상 예고

전문 용어는 쉬운 말로 풀어서 설명하고, 중간중간 시청자에게 질문을 던져 참여를 유도해주세요.`,
    isPublic: true,
    isOfficial: true,
    usageCount: 0,
    variables: [
      {
        name: 'concept',
        label: '설명할 개념',
        placeholder: '예: 블록체인의 작동 원리',
        required: true,
        type: 'text',
      },
      {
        name: 'duration',
        label: '영상 길이 (분)',
        placeholder: '예: 5',
        required: true,
        type: 'text',
      },
      {
        name: 'audience',
        label: '타겟 시청자',
        placeholder: '예: 기술에 관심 있는 일반인',
        required: true,
        type: 'text',
      },
      {
        name: 'points',
        label: '핵심 포인트',
        placeholder: '예: 탈중앙화, 보안, 투명성',
        required: true,
        type: 'text',
      },
    ] as TemplateVariable[],
  },
  {
    title: '인터뷰 영상 구성안',
    description: '전문가 또는 인물 인터뷰 영상 기획서',
    category: 'video',
    tags: ['인터뷰', '다큐멘터리', '휴먼스토리'],
    templateContent: `{{interviewee}}와의 인터뷰 영상 구성안을 작성해주세요.

인터뷰 주제: {{theme}}
영상 컨셉: {{concept}}
예상 길이: {{length}}분

다음 항목을 포함해주세요:
1. 오프닝 (인터뷰이 소개 및 배경)
2. 주요 질문 리스트 (10-15개)
   - 도입 질문 (3개)
   - 핵심 질문 (7-10개)
   - 마무리 질문 (2개)
3. B-roll 촬영 리스트
   - 인터뷰이의 일상
   - 관련 장소 및 활동
4. 편집 포인트
   - 감정적 하이라이트
   - 인상적인 명언
5. 엔딩 메시지

질문은 개방형으로 작성하여 깊이 있는 답변을 이끌어내도록 해주세요.`,
    isPublic: true,
    isOfficial: true,
    usageCount: 0,
    variables: [
      {
        name: 'interviewee',
        label: '인터뷰 대상',
        placeholder: '예: 30년 경력 베이커리 장인',
        required: true,
        type: 'text',
      },
      {
        name: 'theme',
        label: '인터뷰 주제',
        placeholder: '예: 장인정신과 현대의 조화',
        required: true,
        type: 'text',
      },
      {
        name: 'concept',
        label: '영상 컨셉',
        placeholder: '예: 따뜻하고 감성적인 휴먼 다큐',
        required: true,
        type: 'text',
      },
      {
        name: 'length',
        label: '예상 길이 (분)',
        placeholder: '예: 15',
        required: true,
        type: 'text',
      },
    ] as TemplateVariable[],
  },
  {
    title: '브이로그 스토리보드',
    description: '일상을 담은 브이로그 촬영 계획서',
    category: 'video',
    tags: ['브이로그', '일상', '라이프스타일'],
    templateContent: `{{day}}를 담은 브이로그 스토리보드를 작성해주세요.

테마: {{theme}}
스타일: {{style}}
예상 런타임: {{runtime}}분

다음 구조로 작성해주세요:
1. 오프닝 (0:00-0:30)
   - 인사 및 오늘의 일정 소개
2. 아침 루틴 (0:30-2:00)
   - 주요 장면 리스트
3. 메인 활동 (2:00-{{runtime}}-2:00)
   - 시간대별 촬영 씬
   - 중요 순간 체크
4. 마무리/리플렉션 (마지막 2분)
   - 하루 되돌아보기
   - 시청자와의 소통

각 씬마다 카메라 앵글, 음악, 자막 포인트를 명시해주세요.
자연스러운 일상의 모습을 담되, 지루하지 않도록 템포를 유지해주세요.`,
    isPublic: true,
    isOfficial: true,
    usageCount: 0,
    variables: [
      {
        name: 'day',
        label: '촬영 날의 성격',
        placeholder: '예: 집중 작업하는 월요일',
        required: true,
        type: 'text',
      },
      {
        name: 'theme',
        label: '테마',
        placeholder: '예: 생산적인 하루 보내기',
        required: true,
        type: 'text',
      },
      {
        name: 'style',
        label: '영상 스타일',
        placeholder: '선택하세요',
        required: true,
        type: 'select',
        options: ['미니멀 감성', '활기찬 에너지', '차분한 무드', '시네마틱'],
      },
      {
        name: 'runtime',
        label: '예상 런타임 (분)',
        placeholder: '예: 10',
        required: true,
        type: 'text',
      },
    ] as TemplateVariable[],
  },

  // ============================================================================
  // PRESENTATION (3 templates)
  // ============================================================================
  {
    title: '비즈니스 피치덱',
    description: '투자자를 설득하는 사업 제안 프레젠테이션',
    category: 'presentation',
    tags: ['피치', '투자', '사업계획'],
    templateContent: `{{business}}에 대한 피치덱 구성안을 작성해주세요.

비즈니스 모델: {{model}}
타겟 시장: {{market}}
핵심 강점: {{strength}}
투자 요청 금액: {{funding}}

다음 슬라이드 구성으로 작성해주세요:
1. 커버 (회사명, 태그라인)
2. 문제 정의 (시장의 pain point)
3. 솔루션 (우리 제품/서비스)
4. 시장 기회 (TAM, SAM, SOM)
5. 비즈니스 모델 (수익 구조)
6. 트랙션 (성과 지표)
7. 경쟁 우위 (차별화 포인트)
8. 팀 소개
9. 재무 계획 (3년)
10. 투자 제안 (금액 및 활용 계획)

각 슬라이드마다 핵심 메시지와 시각자료 방향을 제시해주세요.`,
    isPublic: true,
    isOfficial: true,
    usageCount: 0,
    variables: [
      {
        name: 'business',
        label: '비즈니스 이름',
        placeholder: '예: AI 기반 건강관리 앱',
        required: true,
        type: 'text',
      },
      {
        name: 'model',
        label: '비즈니스 모델',
        placeholder: '예: 구독 기반 SaaS',
        required: true,
        type: 'text',
      },
      {
        name: 'market',
        label: '타겟 시장',
        placeholder: '예: 30-50대 헬스케어 관심층',
        required: true,
        type: 'text',
      },
      {
        name: 'strength',
        label: '핵심 강점',
        placeholder: '예: AI 정확도 95%, 의사 파트너십',
        required: true,
        type: 'textarea',
      },
      {
        name: 'funding',
        label: '투자 요청 금액',
        placeholder: '예: 10억원',
        required: true,
        type: 'text',
      },
    ] as TemplateVariable[],
  },
  {
    title: '교육용 강의 자료',
    description: '효과적인 학습을 위한 강의 프레젠테이션',
    category: 'presentation',
    tags: ['교육', '강의', '학습'],
    templateContent: `{{subject}}에 대한 교육용 프레젠테이션을 작성해주세요.

교육 대상: {{audience}}
수업 시간: {{duration}}분
학습 목표: {{objectives}}

다음 구조로 작성해주세요:
1. 도입 (5분)
   - 학습 목표 제시
   - 사전 지식 확인
2. 본론 ({{duration}}-15분)
   - 개념 설명 (이론)
   - 예시 및 사례
   - 실습 또는 퀴즈
3. 정리 (5분)
   - 핵심 요약
   - Q&A
4. 다음 수업 예고 (5분)

각 슬라이드마다:
- 핵심 내용 (텍스트는 최소화)
- 시각자료 (다이어그램, 차트, 이미지)
- 강사 노트 (설명할 내용)

학습자의 이해를 돕는 비유와 실생활 예시를 풍부하게 포함해주세요.`,
    isPublic: true,
    isOfficial: true,
    usageCount: 0,
    variables: [
      {
        name: 'subject',
        label: '과목/주제',
        placeholder: '예: 데이터베이스 기초',
        required: true,
        type: 'text',
      },
      {
        name: 'audience',
        label: '교육 대상',
        placeholder: '예: 대학교 2학년 컴퓨터공학과',
        required: true,
        type: 'text',
      },
      {
        name: 'duration',
        label: '수업 시간 (분)',
        placeholder: '예: 60',
        required: true,
        type: 'text',
      },
      {
        name: 'objectives',
        label: '학습 목표',
        placeholder: '예: SQL 기본 쿼리 작성 능력',
        required: true,
        type: 'textarea',
      },
    ] as TemplateVariable[],
  },
  {
    title: '프로젝트 제안서',
    description: '내부 승인을 위한 프로젝트 제안 프레젠테이션',
    category: 'presentation',
    tags: ['제안', '기획', '프로젝트'],
    templateContent: `{{project}}에 대한 프로젝트 제안서를 작성해주세요.

프로젝트 목적: {{purpose}}
예상 기간: {{timeline}}
예상 예산: {{budget}}
핵심 이해관계자: {{stakeholders}}

다음 슬라이드 구성으로 작성해주세요:
1. 배경 및 현황 분석
   - 현재 문제점
   - 개선 필요성
2. 프로젝트 개요
   - 목표 및 범위
   - 예상 결과
3. 실행 계획
   - 단계별 로드맵
   - 주요 마일스톤
4. 리소스 계획
   - 인력 배치
   - 예산 breakdown
5. 리스크 관리
   - 예상 위험요소
   - 대응 방안
6. 기대 효과
   - 정량적 지표
   - 정성적 가치
7. 승인 요청 (Next Steps)

의사결정자가 빠르게 핵심을 파악하고 승인할 수 있도록 명확하게 작성해주세요.`,
    isPublic: true,
    isOfficial: true,
    usageCount: 0,
    variables: [
      {
        name: 'project',
        label: '프로젝트명',
        placeholder: '예: 고객 데이터 분석 시스템 구축',
        required: true,
        type: 'text',
      },
      {
        name: 'purpose',
        label: '프로젝트 목적',
        placeholder: '예: 데이터 기반 의사결정 체계 마련',
        required: true,
        type: 'textarea',
      },
      {
        name: 'timeline',
        label: '예상 기간',
        placeholder: '예: 6개월',
        required: true,
        type: 'text',
      },
      {
        name: 'budget',
        label: '예상 예산',
        placeholder: '예: 5,000만원',
        required: true,
        type: 'text',
      },
      {
        name: 'stakeholders',
        label: '핵심 이해관계자',
        placeholder: '예: 마케팅팀, IT팀, 경영진',
        required: true,
        type: 'text',
      },
    ] as TemplateVariable[],
  },
];

/**
 * Prompt Parser
 * 생성된 프롬프트를 의미 있는 섹션으로 자동 분해
 */

export type SectionType = 'role' | 'goal' | 'constraints' | 'format' | 'context' | 'other';

export interface PromptSection {
  type: SectionType;
  title: string;
  content: string;
  icon: string;
}

export interface ParsedPrompt {
  sections: PromptSection[];
  raw: string;
}

/**
 * 섹션 타입별 아이콘
 */
export const SECTION_ICONS: Record<SectionType, string> = {
  role: '🎭',
  goal: '🎯',
  constraints: '📋',
  format: '📐',
  context: '📝',
  other: '💡'
};

/**
 * 섹션 타입별 기본 제목
 */
export const SECTION_TITLES: Record<SectionType, string> = {
  role: '역할 정의',
  goal: '목표',
  constraints: '제약조건',
  format: '출력 형식',
  context: '맥락',
  other: '프롬프트'
};

/**
 * 섹션 타입별 색상 (Tailwind classes)
 */
export const SECTION_COLORS: Record<SectionType, string> = {
  role: 'text-purple-600 dark:text-purple-400',
  goal: 'text-blue-600 dark:text-blue-400',
  constraints: 'text-orange-600 dark:text-orange-400',
  format: 'text-green-600 dark:text-green-400',
  context: 'text-indigo-600 dark:text-indigo-400',
  other: 'text-gray-600 dark:text-gray-400'
};

/**
 * 섹션 타입별 배경 색상
 */
export const SECTION_BG_COLORS: Record<SectionType, string> = {
  role: 'bg-purple-50 dark:bg-purple-950/20',
  goal: 'bg-blue-50 dark:bg-blue-950/20',
  constraints: 'bg-orange-50 dark:bg-orange-950/20',
  format: 'bg-green-50 dark:bg-green-950/20',
  context: 'bg-indigo-50 dark:bg-indigo-950/20',
  other: 'bg-gray-50 dark:bg-gray-950/20'
};

/**
 * 섹션 헤더 감지 패턴
 */
const SECTION_PATTERNS = [
  {
    regex: /^(당신은|역할:|너는|당신의 역할은|Role:|Your role)/i,
    type: 'role' as SectionType,
    title: '역할 정의'
  },
  {
    regex: /^(목표:|작성해주세요|생성해주세요|만들어주세요|Goal:|Objective:|Task:|Create|Write|Generate)/i,
    type: 'goal' as SectionType,
    title: '목표'
  },
  {
    regex: /^(제약:|조건:|금지:|필수:|반드시|~하지 마세요|~을 피하세요|Constraints:|Requirements:|Rules:|Must|Should|Don't)/i,
    type: 'constraints' as SectionType,
    title: '제약조건'
  },
  {
    regex: /^(형식:|구조:|포맷:|출력:|결과물:|다음과 같이|Format:|Structure:|Output:|Result:)/i,
    type: 'format' as SectionType,
    title: '출력 형식'
  },
  {
    regex: /^(배경:|상황:|대상:|독자:|맥락:|~을 위한|Context:|Background:|Audience:|For)/i,
    type: 'context' as SectionType,
    title: '맥락'
  }
];

/**
 * 줄이 섹션 헤더인지 감지
 */
function detectSectionHeader(line: string): { type: SectionType; title: string } | null {
  for (const pattern of SECTION_PATTERNS) {
    if (pattern.regex.test(line)) {
      return { type: pattern.type, title: pattern.title };
    }
  }
  return null;
}

/**
 * 프롬프트 텍스트를 섹션으로 파싱
 */
export function parsePrompt(promptText: string): ParsedPrompt {
  if (!promptText || promptText.trim().length === 0) {
    return {
      sections: [],
      raw: promptText
    };
  }

  const sections: PromptSection[] = [];

  // 1. 텍스트를 줄 단위로 분할
  const lines = promptText.split('\n');

  // 2. 각 줄을 순회하며 패턴 매칭
  let currentSection: PromptSection | null = null;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const trimmed = line.trim();

    // 빈 줄은 건너뛰기 (단, 섹션 내부에서는 유지)
    if (!trimmed && !currentSection) {
      continue;
    }

    // 3. 섹션 헤더 감지
    const sectionMatch = detectSectionHeader(trimmed);

    if (sectionMatch) {
      // 이전 섹션 저장
      if (currentSection && currentSection.content.trim()) {
        sections.push(currentSection);
      }

      // 새 섹션 시작
      currentSection = {
        type: sectionMatch.type,
        title: sectionMatch.title,
        content: '',
        icon: SECTION_ICONS[sectionMatch.type]
      };

      // 헤더에 콜론 뒤에 내용이 있으면 추가
      const colonIndex = trimmed.indexOf(':');
      if (colonIndex !== -1 && colonIndex < trimmed.length - 1) {
        const afterColon = trimmed.substring(colonIndex + 1).trim();
        if (afterColon) {
          currentSection.content = afterColon;
        }
      }
    } else if (currentSection) {
      // 4. 현재 섹션에 내용 추가
      if (currentSection.content) {
        currentSection.content += '\n' + line;
      } else {
        currentSection.content = line;
      }
    } else {
      // 5. 섹션 없이 시작하는 경우 → 'other'로 분류
      if (!currentSection) {
        currentSection = {
          type: 'other',
          title: SECTION_TITLES.other,
          content: '',
          icon: SECTION_ICONS.other
        };
      }
      if (currentSection.content) {
        currentSection.content += '\n' + line;
      } else {
        currentSection.content = line;
      }
    }
  }

  // 6. 마지막 섹션 저장
  if (currentSection && currentSection.content.trim()) {
    sections.push(currentSection);
  }

  // 7. 섹션이 없으면 전체를 'other'로
  if (sections.length === 0) {
    sections.push({
      type: 'other',
      title: SECTION_TITLES.other,
      content: promptText,
      icon: SECTION_ICONS.other
    });
  }

  // 8. 각 섹션의 content trim
  sections.forEach(section => {
    section.content = section.content.trim();
  });

  return { sections, raw: promptText };
}

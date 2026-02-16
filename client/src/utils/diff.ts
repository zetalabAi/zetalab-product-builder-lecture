/**
 * Diff Utility
 * 두 텍스트 간의 차이점을 계산
 */

import { DiffResult } from "@/types/versions";
import { parsePrompt } from "./promptParser";

/**
 * 두 프롬프트 간 변경사항 감지
 */
export function detectChanges(oldPrompt: string, newPrompt: string): string[] {
  const changes: string[] = [];

  // 동일한 경우
  if (oldPrompt === newPrompt) {
    return ['변경사항 없음'];
  }

  // 줄 수 비교
  const oldLines = oldPrompt.split('\n').filter(line => line.trim());
  const newLines = newPrompt.split('\n').filter(line => line.trim());

  const lineDiff = newLines.length - oldLines.length;
  if (lineDiff > 0) {
    changes.push(`${lineDiff}줄 추가`);
  } else if (lineDiff < 0) {
    changes.push(`${Math.abs(lineDiff)}줄 삭제`);
  }

  // 섹션별 변경 감지 (parsePrompt 활용)
  try {
    const oldParsed = parsePrompt(oldPrompt);
    const newParsed = parsePrompt(newPrompt);

    const oldSections = new Map(oldParsed.sections.map(s => [s.type, s]));
    const newSections = new Map(newParsed.sections.map(s => [s.type, s]));

    // 추가된 섹션
    for (const [type, section] of newSections) {
      if (!oldSections.has(type)) {
        changes.push(`${section.title} 추가`);
      }
    }

    // 제거된 섹션
    for (const [type, section] of oldSections) {
      if (!newSections.has(type)) {
        changes.push(`${section.title} 제거`);
      }
    }

    // 수정된 섹션
    for (const [type, newSection] of newSections) {
      const oldSection = oldSections.get(type);
      if (oldSection && oldSection.content !== newSection.content) {
        changes.push(`${newSection.title} 수정`);
      }
    }
  } catch (error) {
    // 파싱 실패 시 기본 메시지
    console.error('Parse error in detectChanges:', error);
  }

  return changes.length > 0 ? changes : ['내용 수정'];
}

/**
 * 두 프롬프트의 상세 diff 계산 (단어 단위)
 */
export function calculateDiff(oldPrompt: string, newPrompt: string): DiffResult[] {
  const results: DiffResult[] = [];

  // 간단한 단어 단위 diff
  const oldWords = oldPrompt.split(/(\s+)/);
  const newWords = newPrompt.split(/(\s+)/);

  const maxLen = Math.max(oldWords.length, newWords.length);

  for (let i = 0; i < maxLen; i++) {
    const oldWord = oldWords[i];
    const newWord = newWords[i];

    if (oldWord === newWord) {
      if (oldWord) {
        results.push({
          type: 'unchanged',
          value: oldWord
        });
      }
    } else {
      if (oldWord && !newWord) {
        results.push({
          type: 'removed',
          value: oldWord
        });
      } else if (!oldWord && newWord) {
        results.push({
          type: 'added',
          value: newWord
        });
      } else {
        // 둘 다 존재하지만 다른 경우
        if (oldWord) {
          results.push({
            type: 'removed',
            value: oldWord
          });
        }
        if (newWord) {
          results.push({
            type: 'added',
            value: newWord
          });
        }
      }
    }
  }

  return results;
}

/**
 * 줄 단위 diff 계산
 */
export function calculateLineDiff(oldPrompt: string, newPrompt: string): DiffResult[] {
  const results: DiffResult[] = [];

  const oldLines = oldPrompt.split('\n');
  const newLines = newPrompt.split('\n');

  const maxLen = Math.max(oldLines.length, newLines.length);

  for (let i = 0; i < maxLen; i++) {
    const oldLine = oldLines[i];
    const newLine = newLines[i];

    if (oldLine === newLine) {
      if (oldLine !== undefined) {
        results.push({
          type: 'unchanged',
          value: oldLine + '\n'
        });
      }
    } else {
      if (oldLine !== undefined && newLine === undefined) {
        results.push({
          type: 'removed',
          value: oldLine + '\n'
        });
      } else if (oldLine === undefined && newLine !== undefined) {
        results.push({
          type: 'added',
          value: newLine + '\n'
        });
      } else {
        // 둘 다 존재하지만 다른 경우
        if (oldLine !== undefined) {
          results.push({
            type: 'removed',
            value: oldLine + '\n'
          });
        }
        if (newLine !== undefined) {
          results.push({
            type: 'added',
            value: newLine + '\n'
          });
        }
      }
    }
  }

  return results;
}

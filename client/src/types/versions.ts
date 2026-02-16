/**
 * Prompt Version Management Types
 */

import { PromptQuality } from "./quality";

/**
 * 프롬프트 버전
 */
export interface PromptVersion {
  id: string;
  promptId: string;
  version: number;
  prompt: string;
  changes: string[];
  qualityScore?: PromptQuality;
  createdAt: Date;
  createdBy: string;
}

/**
 * 버전 비교 결과
 */
export interface VersionComparison {
  oldVersion: PromptVersion;
  newVersion: PromptVersion;
  diff: DiffResult[];
}

/**
 * Diff 결과
 */
export interface DiffResult {
  type: 'added' | 'removed' | 'unchanged';
  value: string;
}

/**
 * 버전 생성 요청
 */
export interface CreateVersionRequest {
  promptId: string;
  newPrompt: string;
  changes?: string[];
}

/**
 * 버전 비교 요청
 */
export interface CompareVersionsRequest {
  promptId: string;
  versionId1: string;
  versionId2: string;
}

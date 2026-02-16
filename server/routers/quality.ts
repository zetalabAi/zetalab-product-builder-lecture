/**
 * ZetaLab - Quality Router
 * 프롬프트 품질 분석 API
 */

import { router, protectedProcedure } from "../_core/trpc";
import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { getPromptHistoryById, updatePromptHistory } from "../db";

export const qualityRouter = router({
  /**
   * 프롬프트 품질 분석
   * - Claude API를 호출하여 6가지 기준으로 평가
   * - Firestore에 결과 저장
   * - 캐싱: 이미 분석된 경우 재분석하지 않음
   */
  analyzePromptQuality: protectedProcedure
    .input(
      z.object({
        promptId: z.string(),
        forceReanalyze: z.boolean().optional().default(false),
      })
    )
    .mutation(async ({ input, ctx }) => {
      // 1. 프롬프트 조회 및 권한 검증
      const prompt = await getPromptHistoryById(input.promptId);

      if (!prompt) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Prompt not found'
        });
      }

      if (prompt.userId !== ctx.user.uid) {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: 'Cannot access this prompt'
        });
      }

      // 2. 캐싱 확인 (이미 분석된 경우)
      if (prompt.qualityScore && !input.forceReanalyze) {
        return {
          quality: {
            ...prompt.qualityScore,
            analyzedAt: prompt.qualityScore.analyzedAt,
          },
          cached: true,
        };
      }

      // 3. 분석할 프롬프트 텍스트 결정
      const promptText = prompt.editedPrompt || prompt.generatedPrompt;

      if (!promptText || promptText.trim().length === 0) {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: 'Prompt text is empty'
        });
      }

      // 4. Claude API 호출
      const { invokeLLM } = await import('../_core/llm-claude.js');

      const systemPrompt = `당신은 프롬프트 엔지니어링 전문가입니다.
다음 프롬프트를 6가지 기준으로 평가해주세요:

[프롬프트 내용]
${promptText}

평가 기준:
1. Clarity (명확성): 요구사항이 얼마나 명확한가? (0-100점)
   - 모호한 표현이 없는지, 목표가 분명한지 평가
   - 예: 80점 이상 = "특정 기술 스택으로 RESTful API를 구축하고, 인증 미들웨어 추가"
   - 예: 60점 이하 = "API를 만들어주세요"

2. Specificity (구체성): 구체적인 세부사항이 얼마나 포함되었는가? (0-100점)
   - 예시, 수치, 구체적 조건 포함 여부
   - 예: 80점 이상 = "500단어, 캐주얼한 톤, 20대 대상"
   - 예: 60점 이하 = "글을 작성해주세요"

3. Structure (구조화): 논리적 구조를 갖추고 있는가? (0-100점)
   - 단계별 설명, 순서, 계층 구조 평가
   - 명확한 흐름과 논리적 구성이 있는지

4. Context (맥락): 충분한 배경 정보를 제공하는가? (0-100점)
   - 대상 독자, 사용 목적, 환경 정보 포함 여부
   - 왜 이 작업이 필요한지 설명되어 있는지

5. Constraints (제약조건): 명확한 제약사항이 명시되어 있는가? (0-100점)
   - 금지사항, 형식, 길이, 톤 등의 제약 명시 여부
   - 지켜야 할 규칙이나 피해야 할 것들이 명확한지

각 기준을 0-100점으로 평가하고, 3-5개의 구체적인 개선 제안을 해주세요.
개선 제안은 실행 가능하고 구체적이어야 합니다.

**반드시 다음 JSON 형식으로만 응답하세요 (다른 텍스트 없이 JSON만)**:
{
  "clarity": 85,
  "specificity": 78,
  "structure": 92,
  "context": 70,
  "constraints": 88,
  "suggestions": [
    "대상 독자의 배경 지식 수준을 명시하면 더 좋습니다",
    "원하는 글의 톤(formal/casual)을 추가하세요",
    "최종 결과물의 길이를 구체적으로 명시하세요"
  ]
}`;

      let qualityData: any;
      let retryCount = 0;
      const MAX_RETRIES = 2;

      // 재시도 로직
      while (retryCount <= MAX_RETRIES) {
        try {
          const response = await invokeLLM({
            messages: [
              { role: 'user', content: systemPrompt }
            ],
            temperature: 0.3, // 일관성을 위해 낮은 온도
            max_tokens: 1000,
          });

          const messageContent = response.choices?.[0]?.message?.content;

          if (!messageContent) {
            throw new Error('Empty response from LLM');
          }

          // JSON 파싱 (마크다운 코드 블록 제거)
          const cleanedContent = messageContent
            .replace(/```json\s*/g, '')
            .replace(/```\s*/g, '')
            .trim();

          qualityData = JSON.parse(cleanedContent);

          // 데이터 검증
          const requiredFields = ['clarity', 'specificity', 'structure', 'context', 'constraints', 'suggestions'];
          for (const field of requiredFields) {
            if (!(field in qualityData)) {
              throw new Error(`Missing required field: ${field}`);
            }
          }

          // 점수 범위 검증 (0-100)
          const scoreFields = ['clarity', 'specificity', 'structure', 'context', 'constraints'];
          for (const field of scoreFields) {
            const score = qualityData[field];
            if (typeof score !== 'number' || score < 0 || score > 100) {
              throw new Error(`Invalid score for ${field}: ${score} (must be 0-100)`);
            }
          }

          // suggestions 검증
          if (!Array.isArray(qualityData.suggestions)) {
            throw new Error('Suggestions must be an array');
          }

          if (qualityData.suggestions.length < 3) {
            throw new Error('Suggestions must have at least 3 items');
          }

          // 각 suggestion이 문자열인지 확인
          for (const suggestion of qualityData.suggestions) {
            if (typeof suggestion !== 'string' || suggestion.trim().length === 0) {
              throw new Error('Each suggestion must be a non-empty string');
            }
          }

          // 성공 - 루프 탈출
          console.log('[analyzePromptQuality] Analysis successful:', {
            promptId: input.promptId,
            overall: Math.round(
              (qualityData.clarity +
                qualityData.specificity +
                qualityData.structure +
                qualityData.context +
                qualityData.constraints) / 5
            ),
            attempt: retryCount + 1
          });
          break;

        } catch (error) {
          console.error(`[analyzePromptQuality] Parse error (attempt ${retryCount + 1}):`, error);
          retryCount++;

          if (retryCount > MAX_RETRIES) {
            throw new TRPCError({
              code: 'INTERNAL_SERVER_ERROR',
              message: 'Failed to analyze prompt quality after multiple retries. Please try again.',
            });
          }

          // 재시도 전 잠시 대기
          await new Promise(resolve => setTimeout(resolve, 1000));
        }
      }

      // 5. Overall 점수 계산 (5개 기준의 평균)
      const overall = Math.round(
        (qualityData.clarity +
          qualityData.specificity +
          qualityData.structure +
          qualityData.context +
          qualityData.constraints) / 5
      );

      const qualityScore = {
        clarity: qualityData.clarity,
        specificity: qualityData.specificity,
        structure: qualityData.structure,
        context: qualityData.context,
        constraints: qualityData.constraints,
        overall,
        suggestions: qualityData.suggestions,
        analyzedAt: new Date(),
      };

      // 6. Firestore에 저장
      try {
        await updatePromptHistory(input.promptId, {
          qualityScore,
        });
      } catch (error) {
        console.error('[analyzePromptQuality] Failed to save to Firestore:', error);
        // 저장 실패해도 결과는 반환 (사용자 경험 우선)
      }

      // 7. 결과 반환
      return {
        quality: qualityScore,
        cached: false,
      };
    }),

  /**
   * 프롬프트 품질 점수 조회
   * - 캐시된 점수 반환 (재분석 없음)
   */
  getPromptQuality: protectedProcedure
    .input(
      z.object({
        promptId: z.string(),
      })
    )
    .query(async ({ input, ctx }) => {
      const prompt = await getPromptHistoryById(input.promptId);

      if (!prompt) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Prompt not found'
        });
      }

      if (prompt.userId !== ctx.user.uid) {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: 'Cannot access this prompt'
        });
      }

      if (!prompt.qualityScore) {
        return null;
      }

      return {
        ...prompt.qualityScore,
        analyzedAt: prompt.qualityScore.analyzedAt,
      };
    }),
});

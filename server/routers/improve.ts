/**
 * ZetaLab - Improvement Router
 * 프롬프트 자동 개선 API
 */

import { router, protectedProcedure } from "../_core/trpc";
import { z } from "zod";
import { TRPCError } from "@trpc/server";

// ============================================================================
// Type Definitions
// ============================================================================

const IssueTypeSchema = z.enum(['unclear', 'incomplete', 'inconsistent', 'verbose']);
const IssueSeveritySchema = z.enum(['low', 'medium', 'high']);
const ChangeTypeSchema = z.enum(['added', 'modified', 'removed']);
const SuggestionTypeSchema = z.enum(['add', 'modify', 'remove']);

const IssueSchema = z.object({
  type: IssueTypeSchema,
  description: z.string(),
  severity: IssueSeveritySchema,
  location: z.string().optional(),
});

const SuggestionSchema = z.object({
  type: SuggestionTypeSchema,
  target: z.string(),
  newValue: z.string(),
  reasoning: z.string(),
});

const AnalysisResultSchema = z.object({
  issues: z.array(IssueSchema),
  suggestions: z.array(SuggestionSchema),
  confidence: z.number().min(0).max(100),
  analyzedAt: z.date(),
});

const ChangeSchema = z.object({
  type: ChangeTypeSchema,
  section: z.string(),
  before: z.string().optional(),
  after: z.string(),
  reasoning: z.string(),
});

const ModelResultSchema = z.object({
  modelId: z.string(),
  modelName: z.string(),
  response: z.string(),
  executionTime: z.number(),
  success: z.boolean(),
  error: z.string().optional(),
});

// ============================================================================
// Helper Functions
// ============================================================================

/**
 * AI 응답 결과를 분석하여 프롬프트의 문제점 파악
 */
async function analyzePromptResults(
  prompt: string,
  results: z.infer<typeof ModelResultSchema>[]
): Promise<z.infer<typeof AnalysisResultSchema>> {
  const { invokeLLM } = await import('../_core/llm-claude.js');

  // 결과 요약
  const resultsText = results
    .map((r) => `[${r.modelName}]\n${r.success ? r.response : `ERROR: ${r.error}`}`)
    .join('\n\n---\n\n');

  const systemPrompt = `당신은 프롬프트 품질 분석 전문가입니다.

원본 프롬프트:
\`\`\`
${prompt}
\`\`\`

AI 모델 응답 결과:
\`\`\`
${resultsText}
\`\`\`

위 프롬프트와 결과를 분석하여 문제점과 개선 제안을 제공해주세요.

분석 기준:
1. **unclear (모호성)**: 요구사항이 명확하지 않아 AI가 다양하게 해석
2. **incomplete (불완전성)**: 필수 정보 누락 (대상, 길이, 형식 등)
3. **inconsistent (일관성 없음)**: 상충되는 요구사항
4. **verbose (장황함)**: 불필요한 내용이 많음

각 문제마다 심각도 부여:
- **high**: 프롬프트가 제대로 작동하지 않음
- **medium**: 일부 결과가 기대와 다름
- **low**: 개선 여지는 있으나 작동은 함

**반드시 다음 JSON 형식으로만 응답하세요**:
{
  "issues": [
    {
      "type": "unclear",
      "description": "대상 독자가 명시되지 않아 톤이 일관되지 않습니다",
      "severity": "high",
      "location": "역할 정의 부분"
    }
  ],
  "suggestions": [
    {
      "type": "add",
      "target": "대상 독자",
      "newValue": "대상 독자: 20-30대 직장인",
      "reasoning": "명확한 타겟 설정으로 일관된 톤 유지"
    }
  ],
  "confidence": 85
}`;

  try {
    const response = await invokeLLM({
      messages: [{ role: 'user', content: systemPrompt }],
      temperature: 0.3,
      max_tokens: 2000,
    });

    const content = response.choices?.[0]?.message?.content;
    if (!content) {
      throw new Error('Empty response from LLM');
    }

    // JSON 파싱
    const cleanedContent = content
      .replace(/```json\s*/g, '')
      .replace(/```\s*/g, '')
      .trim();

    const data = JSON.parse(cleanedContent);

    return {
      issues: data.issues || [],
      suggestions: data.suggestions || [],
      confidence: data.confidence || 70,
      analyzedAt: new Date(),
    };
  } catch (error) {
    console.error('[Improve] Analysis failed:', error);
    throw new TRPCError({
      code: 'INTERNAL_SERVER_ERROR',
      message: '프롬프트 분석에 실패했습니다',
    });
  }
}

/**
 * 분석 결과를 바탕으로 개선된 프롬프트 생성
 */
async function generateImprovedPrompt(
  originalPrompt: string,
  analysis: z.infer<typeof AnalysisResultSchema>
): Promise<{ improvedPrompt: string; changes: z.infer<typeof ChangeSchema>[] }> {
  const { invokeLLM } = await import('../_core/llm-claude.js');

  const issuesText = analysis.issues
    .map((issue) => `- [${issue.severity.toUpperCase()}] ${issue.description}`)
    .join('\n');

  const suggestionsText = analysis.suggestions
    .map((s) => `- ${s.target}: ${s.newValue} (이유: ${s.reasoning})`)
    .join('\n');

  const systemPrompt = `당신은 프롬프트 개선 전문가입니다.

원본 프롬프트:
\`\`\`
${originalPrompt}
\`\`\`

발견된 문제점:
${issuesText}

개선 제안:
${suggestionsText}

위 문제점과 제안을 반영하여 프롬프트를 개선해주세요.

개선 원칙:
1. 모호한 부분을 구체화
2. 누락된 제약조건 추가
3. 일관되지 않은 부분 수정
4. 불필요한 내용 제거
5. 원본의 핵심 의도는 유지

**반드시 다음 JSON 형식으로만 응답하세요**:
{
  "improvedPrompt": "개선된 프롬프트 전체 내용...",
  "changes": [
    {
      "type": "added",
      "section": "제약조건",
      "after": "1500자 이내로 작성",
      "reasoning": "글 길이가 명시되지 않았습니다"
    },
    {
      "type": "modified",
      "section": "역할",
      "before": "블로그 작가",
      "after": "20대 독자를 위한 블로그 작가",
      "reasoning": "대상 독자를 명확히 했습니다"
    }
  ]
}`;

  try {
    const response = await invokeLLM({
      messages: [{ role: 'user', content: systemPrompt }],
      temperature: 0.4,
      max_tokens: 3000,
    });

    const content = response.choices?.[0]?.message?.content;
    if (!content) {
      throw new Error('Empty response from LLM');
    }

    // JSON 파싱
    const cleanedContent = content
      .replace(/```json\s*/g, '')
      .replace(/```\s*/g, '')
      .trim();

    const data = JSON.parse(cleanedContent);

    return {
      improvedPrompt: data.improvedPrompt || originalPrompt,
      changes: data.changes || [],
    };
  } catch (error) {
    console.error('[Improve] Generation failed:', error);
    throw new TRPCError({
      code: 'INTERNAL_SERVER_ERROR',
      message: '개선된 프롬프트 생성에 실패했습니다',
    });
  }
}

// ============================================================================
// Router
// ============================================================================

export const improveRouter = router({
  /**
   * 프롬프트 결과 분석
   */
  analyzeResults: protectedProcedure
    .input(
      z.object({
        prompt: z.string(),
        results: z.array(ModelResultSchema),
      })
    )
    .mutation(async ({ input }) => {
      try {
        const analysis = await analyzePromptResults(input.prompt, input.results);
        return analysis;
      } catch (error) {
        if (error instanceof TRPCError) throw error;

        console.error('[Improve] analyzeResults error:', error);
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: '분석 중 오류가 발생했습니다',
        });
      }
    }),

  /**
   * 개선된 프롬프트 생성
   */
  improvePrompt: protectedProcedure
    .input(
      z.object({
        originalPrompt: z.string(),
        analysis: AnalysisResultSchema,
      })
    )
    .mutation(async ({ input }) => {
      try {
        const result = await generateImprovedPrompt(input.originalPrompt, input.analysis);

        // 예상 개선율 계산 (간단한 휴리스틱)
        const highIssues = input.analysis.issues.filter((i) => i.severity === 'high').length;
        const mediumIssues = input.analysis.issues.filter((i) => i.severity === 'medium').length;
        const lowIssues = input.analysis.issues.filter((i) => i.severity === 'low').length;

        const estimatedImprovement = Math.min(
          100,
          Math.round((highIssues * 30 + mediumIssues * 20 + lowIssues * 10) * 0.8)
        );

        return {
          improvedPrompt: result.improvedPrompt,
          changes: result.changes,
          confidence: input.analysis.confidence,
          estimatedImprovement,
        };
      } catch (error) {
        if (error instanceof TRPCError) throw error;

        console.error('[Improve] improvePrompt error:', error);
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: '개선 중 오류가 발생했습니다',
        });
      }
    }),

  /**
   * 분석 + 개선 통합 엔드포인트 (원스텝)
   */
  autoImprove: protectedProcedure
    .input(
      z.object({
        prompt: z.string(),
        results: z.array(ModelResultSchema),
      })
    )
    .mutation(async ({ input }) => {
      try {
        // 1. 분석
        const analysis = await analyzePromptResults(input.prompt, input.results);

        // 2. 개선
        const improvement = await generateImprovedPrompt(input.prompt, analysis);

        // 3. 예상 개선율 계산
        const highIssues = analysis.issues.filter((i) => i.severity === 'high').length;
        const mediumIssues = analysis.issues.filter((i) => i.severity === 'medium').length;
        const lowIssues = analysis.issues.filter((i) => i.severity === 'low').length;

        const estimatedImprovement = Math.min(
          100,
          Math.round((highIssues * 30 + mediumIssues * 20 + lowIssues * 10) * 0.8)
        );

        return {
          analysis,
          improvement: {
            improvedPrompt: improvement.improvedPrompt,
            changes: improvement.changes,
            confidence: analysis.confidence,
            estimatedImprovement,
          },
        };
      } catch (error) {
        if (error instanceof TRPCError) throw error;

        console.error('[Improve] autoImprove error:', error);
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: '자동 개선 중 오류가 발생했습니다',
        });
      }
    }),
});

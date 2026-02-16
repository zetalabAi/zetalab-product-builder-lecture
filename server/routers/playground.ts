/**
 * AI Playground Router
 * 프롬프트 테스트 및 모델 비교 API
 */

import { z } from "zod";
import { router, protectedProcedure } from "../_core/trpc";
import { TRPCError } from "@trpc/server";
import { invokeLLM as invokeClaudeLLM } from "../_core/llm-claude";
import { invokeLLM as invokeOpenAILLM } from "../_core/llm-openai";

/**
 * Execute prompt with selected AI models
 */
const executePrompt = protectedProcedure
  .input(
    z.object({
      prompt: z.string().min(1),
      systemPrompt: z.string().optional(),
      modelIds: z.array(z.string()).min(1).max(3),
    })
  )
  .mutation(async ({ input, ctx }) => {
    const { prompt, systemPrompt, modelIds } = input;

    try {
      // Execute models in parallel
      const results = await Promise.all(
        modelIds.map(async (modelId) => {
          const startTime = Date.now();

          try {
            let result;

            // Build messages
            const messages: any[] = [];
            if (systemPrompt) {
              messages.push({ role: 'system', content: systemPrompt });
            }
            messages.push({ role: 'user', content: prompt });

            // Route to appropriate LLM
            if (modelId === 'claude-sonnet-4-5') {
              result = await invokeClaudeLLM({
                messages,
                maxTokens: 2048,
              });
            } else if (modelId === 'gpt-4o') {
              result = await invokeOpenAILLM({
                messages,
                maxTokens: 2048,
              });
            } else if (modelId === 'gemini-2-0-flash') {
              // Gemini mock response (실제 구현 시 Google AI SDK 사용)
              result = {
                id: `gemini-${Date.now()}`,
                created: Math.floor(Date.now() / 1000),
                model: 'gemini-2.0-flash',
                choices: [
                  {
                    index: 0,
                    message: {
                      role: 'assistant' as const,
                      content: `[Gemini 2.0 Flash 응답]\n\n${prompt}\n\n이 프롬프트에 대한 응답입니다. 실제 Gemini API 연동은 추후 구현될 예정입니다.\n\n주요 특징:\n- 빠른 응답 속도\n- 비용 효율적\n- 멀티모달 지원\n\n참고: 현재는 Mock 응답을 제공하고 있습니다.`,
                    },
                    finish_reason: 'stop',
                  },
                ],
                usage: {
                  prompt_tokens: 50,
                  completion_tokens: 100,
                  total_tokens: 150,
                },
              };
            } else {
              throw new Error(`Unsupported model: ${modelId}`);
            }

            const duration = Date.now() - startTime;
            const tokenCount = result.usage?.total_tokens || 0;

            // Calculate cost based on model
            let costPer1k = 0.015; // Default: Claude
            if (modelId === 'gpt-4o') costPer1k = 0.020;
            if (modelId === 'gemini-2-0-flash') costPer1k = 0.008;

            const estimatedCost = (tokenCount / 1000) * costPer1k;

            return {
              modelId,
              response: result.choices[0]?.message.content as string || '',
              duration,
              tokenCount,
              estimatedCost: parseFloat(estimatedCost.toFixed(6)),
            };
          } catch (error: any) {
            console.error(`[Playground] Error executing ${modelId}:`, error.message);
            return {
              modelId,
              response: '',
              duration: Date.now() - startTime,
              tokenCount: 0,
              estimatedCost: 0,
              error: error.message || 'Unknown error',
            };
          }
        })
      );

      return {
        results,
      };
    } catch (error: any) {
      console.error('[Playground] Execution error:', error);
      throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Failed to execute prompt',
      });
    }
  });

/**
 * Get user's playground usage stats (future)
 */
const getUsageStats = protectedProcedure.query(async ({ ctx }) => {
  // TODO: Implement usage tracking
  return {
    dailyLimit: 10,
    used: 0,
    remaining: 10,
  };
});

/**
 * Playground Router
 */
export const playgroundRouter = router({
  executePrompt,
  getUsageStats,
});

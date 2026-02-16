/**
 * ZetaLab - Chains Router
 * 프롬프트 체인 시스템 API
 */

import { router, protectedProcedure, publicProcedure } from "../_core/trpc";
import { z } from "zod";
import { TRPCError } from "@trpc/server";
import {
  createChain,
  getChainsByUserId,
  getChainById,
  updateChain,
  deleteChain,
  createChainExecution,
  getChainExecution,
  updateChainExecution,
  getAllChainTemplates,
  getChainTemplateById,
  incrementChainTemplateUsage,
} from "../db";

// ============================================================================
// Zod Schemas
// ============================================================================

const ChainStepSchema = z.object({
  order: z.number().int().min(1),
  name: z.string().min(1),
  promptTemplate: z.string().min(1),
  modelId: z.string().min(1),
  usePreviousOutput: z.boolean(),
  estimatedCost: z.number().min(0),
  description: z.string().optional(),
});

const ChainCategorySchema = z.enum(['blog', 'video', 'analysis', 'creative', 'custom']);

// ============================================================================
// Router
// ============================================================================

export const chainsRouter = router({
  /**
   * 체인 생성
   */
  createChain: protectedProcedure
    .input(
      z.object({
        name: z.string().min(1).max(100),
        description: z.string().max(500),
        category: ChainCategorySchema,
        steps: z.array(ChainStepSchema).min(1).max(10),
      })
    )
    .mutation(async ({ input, ctx }) => {
      // 비용 계산
      const totalEstimatedCost = input.steps.reduce(
        (sum, step) => sum + step.estimatedCost,
        0
      );

      const chain = await createChain({
        userId: ctx.user.uid,
        name: input.name,
        description: input.description,
        category: input.category,
        steps: input.steps,
        totalEstimatedCost,
      });

      console.log('[createChain] Chain created:', {
        chainId: chain.id,
        userId: ctx.user.uid,
        stepCount: input.steps.length,
        totalCost: totalEstimatedCost,
      });

      return chain;
    }),

  /**
   * 사용자 체인 목록 조회
   */
  getChains: protectedProcedure
    .input(
      z.object({
        category: ChainCategorySchema.optional(),
        limit: z.number().int().min(1).max(100).optional().default(50),
      })
    )
    .query(async ({ input, ctx }) => {
      const chains = await getChainsByUserId(ctx.user.uid);

      // 카테고리 필터링
      let filtered = chains;
      if (input.category) {
        filtered = chains.filter((chain) => chain.category === input.category);
      }

      // Limit 적용
      const limited = filtered.slice(0, input.limit);

      return limited;
    }),

  /**
   * 특정 체인 조회
   */
  getChainById: protectedProcedure
    .input(
      z.object({
        chainId: z.string(),
      })
    )
    .query(async ({ input, ctx }) => {
      const chain = await getChainById(input.chainId);

      if (!chain) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Chain not found',
        });
      }

      // 권한 검증
      if (chain.userId !== ctx.user.uid) {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: 'Cannot access this chain',
        });
      }

      return chain;
    }),

  /**
   * 체인 업데이트
   */
  updateChain: protectedProcedure
    .input(
      z.object({
        chainId: z.string(),
        updates: z.object({
          name: z.string().min(1).max(100).optional(),
          description: z.string().max(500).optional(),
          category: ChainCategorySchema.optional(),
          steps: z.array(ChainStepSchema).min(1).max(10).optional(),
        }),
      })
    )
    .mutation(async ({ input, ctx }) => {
      // 체인 조회 및 권한 검증
      const chain = await getChainById(input.chainId);

      if (!chain) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Chain not found',
        });
      }

      if (chain.userId !== ctx.user.uid) {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: 'Cannot update this chain',
        });
      }

      // 비용 재계산 (steps 변경 시)
      const updates = { ...input.updates };
      if (updates.steps) {
        updates.totalEstimatedCost = updates.steps.reduce(
          (sum, step) => sum + step.estimatedCost,
          0
        );
      }

      await updateChain(input.chainId, updates);

      console.log('[updateChain] Chain updated:', {
        chainId: input.chainId,
        userId: ctx.user.uid,
      });

      return { success: true };
    }),

  /**
   * 체인 삭제
   */
  deleteChain: protectedProcedure
    .input(
      z.object({
        chainId: z.string(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      // 체인 조회 및 권한 검증
      const chain = await getChainById(input.chainId);

      if (!chain) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Chain not found',
        });
      }

      if (chain.userId !== ctx.user.uid) {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: 'Cannot delete this chain',
        });
      }

      await deleteChain(input.chainId);

      console.log('[deleteChain] Chain deleted:', {
        chainId: input.chainId,
        userId: ctx.user.uid,
      });

      return { success: true };
    }),

  /**
   * 체인 실행
   */
  executeChain: protectedProcedure
    .input(
      z.object({
        chainId: z.string(),
        initialInput: z.string().optional(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      // 체인 조회 및 권한 검증
      const chain = await getChainById(input.chainId);

      if (!chain) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Chain not found',
        });
      }

      if (chain.userId !== ctx.user.uid) {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: 'Cannot execute this chain',
        });
      }

      // 실행 레코드 생성
      const execution = await createChainExecution({
        chainId: input.chainId,
        userId: ctx.user.uid,
        initialInput: input.initialInput,
      });

      console.log('[executeChain] Chain execution started:', {
        executionId: execution.id,
        chainId: input.chainId,
        userId: ctx.user.uid,
        stepCount: chain.steps.length,
      });

      // 백그라운드 실행 시작 (비동기)
      const { executeChainBackground } = await import('../lib/chain-executor');
      executeChainBackground(execution.id).catch((error) => {
        console.error('[executeChain] Background execution failed:', error);
      });

      return {
        executionId: execution.id,
        message: 'Chain execution started',
      };
    }),

  /**
   * 체인 실행 상태 조회
   */
  getExecution: protectedProcedure
    .input(
      z.object({
        executionId: z.string(),
      })
    )
    .query(async ({ input, ctx }) => {
      const execution = await getChainExecution(input.executionId);

      if (!execution) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Execution not found',
        });
      }

      // 권한 검증
      if (execution.userId !== ctx.user.uid) {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: 'Cannot access this execution',
        });
      }

      return execution;
    }),

  /**
   * 체인 실행 취소
   */
  cancelExecution: protectedProcedure
    .input(
      z.object({
        executionId: z.string(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const execution = await getChainExecution(input.executionId);

      if (!execution) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Execution not found',
        });
      }

      if (execution.userId !== ctx.user.uid) {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: 'Cannot cancel this execution',
        });
      }

      if (execution.status !== 'running') {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: 'Can only cancel running executions',
        });
      }

      await updateChainExecution(input.executionId, {
        status: 'cancelled',
        completedAt: new Date(),
        error: 'Cancelled by user',
      });

      console.log('[cancelExecution] Execution cancelled:', {
        executionId: input.executionId,
        userId: ctx.user.uid,
      });

      return { success: true };
    }),

  /**
   * 체인 템플릿 목록 조회 (공개)
   */
  getChainTemplates: publicProcedure
    .input(
      z.object({
        category: ChainCategorySchema.optional(),
        limit: z.number().int().min(1).max(100).optional().default(50),
      })
    )
    .query(async ({ input }) => {
      const templates = await getAllChainTemplates();

      // 카테고리 필터링
      let filtered = templates;
      if (input.category) {
        filtered = templates.filter((t) => t.category === input.category);
      }

      // Limit 적용 및 사용 횟수 순 정렬
      const sorted = filtered.sort((a, b) => b.usageCount - a.usageCount);
      const limited = sorted.slice(0, input.limit);

      return limited;
    }),

  /**
   * 특정 템플릿 조회 (공개)
   */
  getChainTemplateById: publicProcedure
    .input(
      z.object({
        templateId: z.string(),
      })
    )
    .query(async ({ input }) => {
      const template = await getChainTemplateById(input.templateId);

      if (!template) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Template not found',
        });
      }

      return template;
    }),

  /**
   * 템플릿 사용 (체인 생성)
   */
  useChainTemplate: protectedProcedure
    .input(
      z.object({
        templateId: z.string(),
        customizations: z
          .object({
            name: z.string().min(1).max(100).optional(),
            description: z.string().max(500).optional(),
          })
          .optional(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      // 템플릿 조회
      const template = await getChainTemplateById(input.templateId);

      if (!template) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Template not found',
        });
      }

      // 템플릿 기반 체인 생성
      const totalEstimatedCost = template.steps.reduce(
        (sum, step) => sum + step.estimatedCost,
        0
      );

      const chain = await createChain({
        userId: ctx.user.uid,
        name: input.customizations?.name || template.name,
        description: input.customizations?.description || template.description,
        category: template.category,
        steps: template.steps.map((step, index) => ({
          id: `step_${Date.now()}_${index}`,
          ...step,
        })),
        totalEstimatedCost,
      });

      // 사용 횟수 증가
      await incrementChainTemplateUsage(input.templateId);

      console.log('[useChainTemplate] Chain created from template:', {
        templateId: input.templateId,
        chainId: chain.id,
        userId: ctx.user.uid,
      });

      return {
        chainId: chain.id,
        message: 'Chain created from template',
      };
    }),
});

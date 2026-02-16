/**
 * ZetaLab - Templates Router
 * 프롬프트 템플릿 라이브러리 API
 */

import { router, publicProcedure, protectedProcedure } from "../_core/trpc";
import { z } from "zod";
import { TRPCError } from "@trpc/server";
import {
  getPublicPromptTemplates,
  getPromptTemplateById,
  incrementTemplateUsage,
  fillTemplateVariables,
  getTemplateCategories,
} from "../db";

export const templatesRouter = router({
  /**
   * Get all public templates (with optional filters)
   * Public endpoint - no auth required
   */
  getTemplates: publicProcedure
    .input(
      z.object({
        category: z.string().optional(),
        tags: z.array(z.string()).optional(),
        limit: z.number().min(1).max(100).optional().default(50),
      })
    )
    .query(async ({ input }) => {
      try {
        const templates = await getPublicPromptTemplates({
          category: input.category,
          tags: input.tags,
          limit: input.limit,
        });

        return {
          templates,
          total: templates.length,
        };
      } catch (error) {
        console.error('[Templates] Failed to get templates:', error);
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to retrieve templates',
        });
      }
    }),

  /**
   * Get template by ID
   * Public endpoint - no auth required
   */
  getTemplateById: publicProcedure
    .input(
      z.object({
        templateId: z.string(),
      })
    )
    .query(async ({ input }) => {
      try {
        const template = await getPromptTemplateById(input.templateId);

        if (!template) {
          throw new TRPCError({
            code: 'NOT_FOUND',
            message: 'Template not found',
          });
        }

        return template;
      } catch (error) {
        if (error instanceof TRPCError) throw error;

        console.error('[Templates] Failed to get template:', error);
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to retrieve template',
        });
      }
    }),

  /**
   * Use template - fill variables and return filled prompt
   * Protected endpoint - requires authentication
   */
  useTemplate: protectedProcedure
    .input(
      z.object({
        templateId: z.string(),
        variableValues: z.record(z.string()),
      })
    )
    .mutation(async ({ input, ctx }) => {
      try {
        // 1. Get template
        const template = await getPromptTemplateById(input.templateId);

        if (!template) {
          throw new TRPCError({
            code: 'NOT_FOUND',
            message: 'Template not found',
          });
        }

        // 2. Validate required variables
        const requiredVars = template.variables.filter(v => v.required);
        const missingVars = requiredVars.filter(
          v => !input.variableValues[v.name] || input.variableValues[v.name].trim() === ''
        );

        if (missingVars.length > 0) {
          throw new TRPCError({
            code: 'BAD_REQUEST',
            message: `Missing required variables: ${missingVars.map(v => v.label).join(', ')}`,
          });
        }

        // 3. Fill template variables
        const filledPrompt = fillTemplateVariables(
          template.templateContent,
          input.variableValues
        );

        // 4. Increment usage count
        try {
          await incrementTemplateUsage(input.templateId);
        } catch (error) {
          // Don't fail if increment fails
          console.error('[Templates] Failed to increment usage:', error);
        }

        return {
          filledPrompt,
          template: {
            id: template.id,
            title: template.title,
            category: template.category,
          },
        };
      } catch (error) {
        if (error instanceof TRPCError) throw error;

        console.error('[Templates] Failed to use template:', error);
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to use template',
        });
      }
    }),

  /**
   * Get template categories with counts
   * Public endpoint - no auth required
   */
  getCategories: publicProcedure.query(async () => {
    try {
      const categories = await getTemplateCategories();
      return categories;
    } catch (error) {
      console.error('[Templates] Failed to get categories:', error);
      throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Failed to retrieve categories',
      });
    }
  }),
});

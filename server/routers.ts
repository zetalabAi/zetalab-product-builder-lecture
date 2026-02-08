import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, protectedProcedure, router } from "./_core/trpc";
import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { getAllIntentTemplates, createPromptHistory, updatePromptHistory, getPromptHistoryByUserId, getPromptHistoryById, createProject, getProjectsByUserId, getProjectById, updateProject, deleteProject, addConversationToProject, removeConversationFromProject, getConversationsByProjectId, updateUserManusLinked, createPromptAsset, getPromptAssetsByUserId, getPromptAssetById, updatePromptAsset, deletePromptAsset, createPromptVersion, getPromptVersionsByAssetId, getPromptVersionById, updatePromptVersion, updatePromptAssetLastUsed, updatePromptAssetSuccessStatus } from "./db";
import { notifyOwner } from "./_core/notification";

export const appRouter = router({
    // if you need to use socket.io, read and register route in server/_core/index.ts, all api should start with '/api/' so that the gateway can route correctly
  system: systemRouter,
  auth: router({
    me: publicProcedure.query(async opts => {
      // 캐시/프록시 오염 방지
      opts.ctx.res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
      opts.ctx.res.setHeader('Pragma', 'no-cache');
      opts.ctx.res.setHeader('Expires', '0');
      return opts.ctx.user;
    }),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return {
        success: true,
      } as const;
    }),
    updateManusLinked: protectedProcedure
      .input(z.object({ linked: z.boolean() }))
      .mutation(async ({ input, ctx }) => {
        if (!ctx.user) {
          throw new TRPCError({ code: 'UNAUTHORIZED' });
        }
        await updateUserManusLinked(ctx.user.openId, input.linked ? 1 : 0);
        return { success: true };
      }),
  }),

  zetaAI: router({
    // Initialize session and get intent questions based on user's question
    init: protectedProcedure
      .input(z.object({ question: z.string().min(1) }))
      .mutation(async ({ input, ctx }) => {
        const { nanoid } = await import('nanoid');
        const sessionId = nanoid();

        // 하드코딩된 기본 질문 세트 (데이터베이스 없어도 작동)
        const defaultQuestions = [
          "구체적으로 무엇을 만들고 싶으신가요?",
          "이 작업물은 어디에 사용할 예정인가요?",
          "누구를 위한 작업인가요?",
          "꼭 지켜야 할 조건이나 피해야 할 것이 있나요?",
          "최종 결과물은 어떤 모습이면 좋을까요?"
        ];

        // Try to get templates from database
        try {
          const templates = await getAllIntentTemplates();
          let selectedTemplate = templates.find(t => {
            const keywords = JSON.parse(t.keywords || '[]');
            return keywords.some((keyword: string) =>
              input.question.toLowerCase().includes(keyword.toLowerCase())
            );
          });

          // Fallback to general template if no match
          if (!selectedTemplate) {
            selectedTemplate = templates.find(t => t.category === '일반 질문');
          }

          if (selectedTemplate) {
            const questions = JSON.parse(selectedTemplate.questions);
            return {
              sessionId,
              category: selectedTemplate.category,
              questions: questions.slice(0, 5),
              canSkip: true
            };
          }
        } catch (error) {
          console.log('[zetaAI.init] Database template fetch failed, using default questions');
        }

        // Fallback: 하드코딩된 기본 질문 사용
        return {
          sessionId,
          category: '일반',
          questions: defaultQuestions,
          canSkip: true
        };
      }),
    
    // Submit intent answers and generate prompt
    generatePrompt: protectedProcedure
      .input(z.object({
        sessionId: z.string(),
        originalQuestion: z.string(),
        answers: z.record(z.string(), z.string()),
        skippedQuestions: z.array(z.number()).optional()
      }))
      .mutation(async ({ input, ctx }) => {
        const { invokeLLM } = await import('./_core/llm.js');
        
        // Build context from answers
        const answersText = Object.entries(input.answers)
          .map(([key, value]) => `${key}: ${value}`)
          .join('\n');
        
        // Generate prompt using LLM
        const systemPrompt = `당신은 최고급 프롬프트 엔지니어입니다. 사용자의 질문과 수집된 정보를 바탕으로 다른 AI 모델에 그대로 붙여넣어도 추가 질문 없이 최종 결과를 도출할 수 있는 완성형 프롬프트를 생성하세요.

프롬프트는 다음을 포함해야 합니다:
1. 명확한 목표 정의
2. 구체적인 조건과 제약사항
3. 예상 결과 형식 명시
4. 단계별 실행 방법
5. 검증 기준

프롬프트는 한국어로 작성하되, 전문적이고 명확하게 작성하세요.`;
        
        const userPrompt = `원본 질문: ${input.originalQuestion}\n\n수집된 정보:\n${answersText}\n\n위 정보를 바탕으로 완성형 프롬프트를 생성해주세요.`;
        
        const response = await invokeLLM({
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: userPrompt }
          ]
        });
        
        const messageContent = response.choices[0]?.message?.content;
        const generatedPrompt = typeof messageContent === 'string' ? messageContent : '';
        
        // Suggest related services
        const suggestedServices = [
          { name: 'Zeta Blog', reason: '생성된 프롬프트로 블로그 콘텐츠 작성' },
          { name: 'Zeta Docs', reason: '문서화 및 정리' }
        ];
        
        // Save to database
        const promptId = await createPromptHistory({
          userId: ctx.user.uid,
          sessionId: input.sessionId,
          originalQuestion: input.originalQuestion,
          intentAnswers: input.answers,
          generatedPrompt,
          usedLLM: 'gemini-2.5-flash-lite',
          suggestedServices: suggestedServices
        });

        return {
          promptId,
          originalQuestion: input.originalQuestion,
          generatedPrompt,
          suggestedServices
        };
      }),
    
    // Update edited prompt
    updatePrompt: protectedProcedure
      .input(z.object({
        promptId: z.string(),
        editedPrompt: z.string()
      }))
      .mutation(async ({ input, ctx }) => {
        await updatePromptHistory(input.promptId, {
          editedPrompt: input.editedPrompt
        });

        return {
          success: true,
          promptId: input.promptId
        };
      }),
    
    // Get prompt history
    getHistory: protectedProcedure
      .query(async ({ ctx }) => {
        const history = await getPromptHistoryByUserId(ctx.user.uid, 20);

        return history.map(h => ({
          id: h.id,
          originalQuestion: h.originalQuestion,
          generatedPrompt: h.generatedPrompt,
          editedPrompt: h.editedPrompt,
          createdAt: h.createdAt
        }));
      }),
    
    // Get single prompt by ID
    getPromptById: protectedProcedure
      .input(z.object({ promptId: z.string() }))
      .query(async ({ input, ctx }) => {
        const prompt = await getPromptHistoryById(input.promptId);

        if (!prompt || prompt.userId !== ctx.user.uid) {
          throw new Error('Prompt not found');
        }

        return {
          id: prompt.id,
          originalQuestion: prompt.originalQuestion,
          intentAnswers: prompt.intentAnswers || {},
          generatedPrompt: prompt.generatedPrompt,
          editedPrompt: prompt.editedPrompt,
          suggestedServices: prompt.suggestedServices || [],
          createdAt: prompt.createdAt
        };
      }),
    
    // Search conversations by title or content
    searchHistory: protectedProcedure
      .input(z.object({ query: z.string() }))
      .query(async ({ input, ctx }) => {
        const history = await getPromptHistoryByUserId(ctx.user.uid, 100);

        if (!input.query.trim()) {
          return history.slice(0, 20).map(h => ({
            id: h.id,
            originalQuestion: h.originalQuestion,
            generatedPrompt: h.generatedPrompt,
            editedPrompt: h.editedPrompt,
            createdAt: h.createdAt
          }));
        }

        const searchQuery = input.query.toLowerCase();
        const filtered = history.filter(h =>
          h.originalQuestion.toLowerCase().includes(searchQuery) ||
          h.generatedPrompt.toLowerCase().includes(searchQuery) ||
          (h.editedPrompt && h.editedPrompt.toLowerCase().includes(searchQuery))
        );

        return filtered.slice(0, 20).map(h => ({
          id: h.id,
          originalQuestion: h.originalQuestion,
          generatedPrompt: h.generatedPrompt,
          editedPrompt: h.editedPrompt,
          createdAt: h.createdAt
        }));
      }),
    
    // Delete conversation
    deleteHistory: protectedProcedure
      .input(z.object({ promptId: z.string() }))
      .mutation(async ({ input, ctx }) => {
        const { deletePromptHistory } = await import('./db');
        const prompt = await getPromptHistoryById(input.promptId);

        if (!prompt || prompt.userId !== ctx.user.uid) {
          throw new TRPCError({ code: 'FORBIDDEN', message: 'Cannot delete this conversation' });
        }

        await deletePromptHistory(input.promptId);
        
        return {
          success: true
        };
      }),
    
    // Rename prompt (for mobile long press menu)
    renamePrompt: protectedProcedure
      .input(z.object({ 
        promptId: z.number(),
        newName: z.string().min(1)
      }))
      .mutation(async ({ input, ctx }) => {
        const { renamePromptHistory } = await import('./db');
        const prompt = await getPromptHistoryById(input.promptId);
        
        if (!prompt || prompt.userId !== ctx.user.id) {
          throw new TRPCError({ code: 'FORBIDDEN', message: 'Cannot rename this conversation' });
        }
        
        await renamePromptHistory(input.promptId, input.newName);
        
        return {
          success: true
        };
      }),
    
    // Pin/Unpin prompt (for mobile long press menu)
    pinPrompt: protectedProcedure
      .input(z.object({ 
        promptId: z.number(),
        isPinned: z.boolean()
      }))
      .mutation(async ({ input, ctx }) => {
        const { pinPromptHistory } = await import('./db');
        const prompt = await getPromptHistoryById(input.promptId);
        
        if (!prompt || prompt.userId !== ctx.user.id) {
          throw new TRPCError({ code: 'FORBIDDEN', message: 'Cannot pin this conversation' });
        }
        
        await pinPromptHistory(input.promptId, input.isPinned ? 1 : 0);
        
        return {
          success: true,
          isPinned: input.isPinned
        };
      }),
    
    // Delete prompt (alias for deleteHistory, for mobile long press menu)
    deletePrompt: protectedProcedure
      .input(z.object({ promptId: z.number() }))
      .mutation(async ({ input, ctx }) => {
        const { deletePromptHistory } = await import('./db');
        const prompt = await getPromptHistoryById(input.promptId);
        
        if (!prompt || prompt.userId !== ctx.user.id) {
          throw new TRPCError({ code: 'FORBIDDEN', message: 'Cannot delete this conversation' });
        }
        
        await deletePromptHistory(input.promptId);
        
        return {
          success: true
        };
      })
  }),

  // Projects
  project: router({
    // Get all projects for user
    getAll: protectedProcedure
      .query(async ({ ctx }) => {
        const projects = await getProjectsByUserId(ctx.user.id);
        return projects;
      }),
    
    // Get single project by ID
    getById: protectedProcedure
      .input(z.object({ projectId: z.number() }))
      .query(async ({ input, ctx }) => {
        const project = await getProjectById(input.projectId);
        
        if (!project || project.userId !== ctx.user.id) {
          throw new TRPCError({ code: 'NOT_FOUND', message: 'Project not found' });
        }
        
        return project;
      }),
    
    // Create new project
    create: protectedProcedure
      .input(z.object({
        name: z.string().min(1).max(255),
        description: z.string().optional(),
        color: z.string().optional(),
        icon: z.string().optional(),
      }))
      .mutation(async ({ input, ctx }) => {
        const result = await createProject({
          userId: ctx.user.id,
          name: input.name,
          description: input.description || null,
          color: input.color || null,
          icon: input.icon || null,
        });
        
        const projectId = Number(result[0]?.insertId || 0);
        
        return {
          success: true,
          projectId
        };
      }),
    
    // Update project
    update: protectedProcedure
      .input(z.object({
        projectId: z.number(),
        name: z.string().min(1).max(255).optional(),
        description: z.string().optional(),
        color: z.string().optional(),
        icon: z.string().optional(),
      }))
      .mutation(async ({ input, ctx }) => {
        const project = await getProjectById(input.projectId);
        
        if (!project || project.userId !== ctx.user.id) {
          throw new TRPCError({ code: 'FORBIDDEN', message: 'Cannot update this project' });
        }
        
        const updateData: any = {};
        if (input.name !== undefined) updateData.name = input.name;
        if (input.description !== undefined) updateData.description = input.description;
        if (input.color !== undefined) updateData.color = input.color;
        if (input.icon !== undefined) updateData.icon = input.icon;
        
        await updateProject(input.projectId, updateData);
        
        return {
          success: true
        };
      }),
    
    // Delete project
    delete: protectedProcedure
      .input(z.object({ projectId: z.number() }))
      .mutation(async ({ input, ctx }) => {
        const project = await getProjectById(input.projectId);
        
        if (!project || project.userId !== ctx.user.id) {
          throw new TRPCError({ code: 'FORBIDDEN', message: 'Cannot delete this project' });
        }
        
        await deleteProject(input.projectId);
        
        return {
          success: true
        };
      }),
    
    // Add conversation to project
    addConversation: protectedProcedure
      .input(z.object({
        projectId: z.number(),
        conversationId: z.number(),
      }))
      .mutation(async ({ input, ctx }) => {
        const project = await getProjectById(input.projectId);
        const conversation = await getPromptHistoryById(input.conversationId);
        
        if (!project || project.userId !== ctx.user.id) {
          throw new TRPCError({ code: 'FORBIDDEN', message: 'Cannot access this project' });
        }
        
        if (!conversation || conversation.userId !== ctx.user.id) {
          throw new TRPCError({ code: 'FORBIDDEN', message: 'Cannot access this conversation' });
        }
        
        await addConversationToProject(input.projectId, input.conversationId);
        
        return {
          success: true
        };
      }),
    
    // Remove conversation from project
    removeConversation: protectedProcedure
      .input(z.object({
        projectId: z.number(),
        conversationId: z.number(),
      }))
      .mutation(async ({ input, ctx }) => {
        const project = await getProjectById(input.projectId);
        
        if (!project || project.userId !== ctx.user.id) {
          throw new TRPCError({ code: 'FORBIDDEN', message: 'Cannot access this project' });
        }
        
        await removeConversationFromProject(input.projectId, input.conversationId);
        
        return {
          success: true
        };
      }),
    
    // Get all conversations in a project
    getConversations: protectedProcedure
      .input(z.object({ projectId: z.number() }))
      .query(async ({ input, ctx }) => {
        const project = await getProjectById(input.projectId);
        
        if (!project || project.userId !== ctx.user.id) {
          throw new TRPCError({ code: 'FORBIDDEN', message: 'Cannot access this project' });
        }
        
        const conversations = await getConversationsByProjectId(input.projectId);
        
        return conversations.map(c => ({
          id: c.conversation.id,
          originalQuestion: c.conversation.originalQuestion,
          generatedPrompt: c.conversation.generatedPrompt,
          editedPrompt: c.conversation.editedPrompt,
          createdAt: c.conversation.createdAt,
          addedAt: c.addedAt,
        }));
      }),
  }),

  // Prompt Templates
  promptTemplate: router({
    create: protectedProcedure
      .input(z.object({
        title: z.string(),
        description: z.string().optional(),
        templateContent: z.string(),
        category: z.string().optional(),
        tags: z.array(z.string()).optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        const { createPromptTemplate } = await import("./db");
        const templateId = await createPromptTemplate({
          userId: ctx.user.id,
          title: input.title,
          description: input.description || null,
          templateContent: input.templateContent,
          category: input.category || null,
          tags: input.tags ? JSON.stringify(input.tags) : null,
          isPublic: 0,
          usageCount: 0,
        });
        return { success: true, templateId };
      }),

    list: protectedProcedure.query(async ({ ctx }) => {
      const { getUserPromptTemplates } = await import("./db");
      const templates = await getUserPromptTemplates(ctx.user.id);
      return templates.map(t => ({
        ...t,
        tags: t.tags ? JSON.parse(t.tags) : [],
      }));
    }),

    getById: protectedProcedure
      .input(z.object({ templateId: z.number() }))
      .query(async ({ input }) => {
        const { getPromptTemplateById } = await import("./db");
        const template = await getPromptTemplateById(input.templateId);
        if (!template) {
          throw new TRPCError({ code: "NOT_FOUND", message: "Template not found" });
        }
        return {
          ...template,
          tags: template.tags ? JSON.parse(template.tags) : [],
        };
      }),

    update: protectedProcedure
      .input(z.object({
        templateId: z.number(),
        title: z.string().optional(),
        description: z.string().optional(),
        templateContent: z.string().optional(),
        category: z.string().optional(),
        tags: z.array(z.string()).optional(),
      }))
      .mutation(async ({ input }) => {
        const { updatePromptTemplate } = await import("./db");
        const updates: any = {};
        if (input.title) updates.title = input.title;
        if (input.description !== undefined) updates.description = input.description;
        if (input.templateContent) updates.templateContent = input.templateContent;
        if (input.category !== undefined) updates.category = input.category;
        if (input.tags) updates.tags = JSON.stringify(input.tags);
        
        const success = await updatePromptTemplate(input.templateId, updates);
        return { success };
      }),

    delete: protectedProcedure
      .input(z.object({ templateId: z.number() }))
      .mutation(async ({ input }) => {
        const { deletePromptTemplate } = await import("./db");
        const success = await deletePromptTemplate(input.templateId);
        return { success };
      }),

    use: protectedProcedure
      .input(z.object({ templateId: z.number() }))
      .mutation(async ({ input }) => {
        const { incrementTemplateUsage, getPromptTemplateById } = await import("./db");
        await incrementTemplateUsage(input.templateId);
        const template = await getPromptTemplateById(input.templateId);
        if (!template) {
          throw new TRPCError({ code: "NOT_FOUND", message: "Template not found" });
        }
        return {
          templateContent: template.templateContent,
        };
      }),
  }),


  // Prompt Asset Management (프롬프트 저장 + 버전 관리)
  promptAsset: router({
    saveAsset: protectedProcedure
      .input(z.object({
        name: z.string().min(1).max(255),
        description: z.string().optional(),
        originalQuestion: z.string(),
        generatedPrompt: z.string(),
        editedPrompt: z.string().optional(),
        intentAnswers: z.record(z.string(), z.string()).optional(),
        usedLLM: z.string().optional(),
        suggestedServices: z.array(z.object({ name: z.string(), reason: z.string() })).optional(),
        projectId: z.number().optional()
      }))
      .mutation(async ({ input, ctx }) => {
        const assetId = await createPromptAsset({
          userId: ctx.user.id,
          name: input.name,
          description: input.description || null,
          originalQuestion: input.originalQuestion,
          versionCount: 1,
          successStatus: 0,
          projectId: input.projectId || null
        });
        
        const versionId = await createPromptVersion({
          promptAssetId: assetId,
          userId: ctx.user.id,
          versionNumber: 1,
          generatedPrompt: input.generatedPrompt,
          editedPrompt: input.editedPrompt || null,
          intentAnswers: input.intentAnswers ? JSON.stringify(input.intentAnswers) : null,
          usedLLM: input.usedLLM || 'gpt-4',
          suggestedServices: input.suggestedServices ? JSON.stringify(input.suggestedServices) : null,
          successStatus: 0
        });
        
        await updatePromptAsset(assetId, { currentVersionId: versionId });
        
        return {
          success: true,
          assetId,
          versionId,
          message: `프롬프트 "${input.name}"이(가) v1로 저장되었습니다.`
        };
      }),
    
    getMyAssets: protectedProcedure
      .query(async ({ ctx }) => {
        const assets = await getPromptAssetsByUserId(ctx.user.id);
        return assets.map(asset => ({
          id: asset.id,
          name: asset.name,
          description: asset.description,
          originalQuestion: asset.originalQuestion,
          versionCount: asset.versionCount,
          lastUsedAt: asset.lastUsedAt,
          lastModifiedAt: asset.lastModifiedAt,
          successStatus: asset.successStatus,
          projectId: asset.projectId,
          createdAt: asset.createdAt
        }));
      }),
    
    getAssetVersions: protectedProcedure
      .input(z.object({ assetId: z.number() }))
      .query(async ({ input, ctx }) => {
        const asset = await getPromptAssetById(input.assetId);
        if (!asset || asset.userId !== ctx.user.id) {
          throw new TRPCError({ code: 'FORBIDDEN', message: 'Cannot access this asset' });
        }
        const versions = await getPromptVersionsByAssetId(input.assetId);
        return versions.map(v => ({
          id: v.id,
          versionNumber: v.versionNumber,
          generatedPrompt: v.generatedPrompt,
          editedPrompt: v.editedPrompt,
          usedLLM: v.usedLLM,
          successStatus: v.successStatus,
          createdAt: v.createdAt,
          updatedAt: v.updatedAt
        }));
      }),
    
    updateAssetName: protectedProcedure
      .input(z.object({
        assetId: z.number(),
        name: z.string().min(1).max(255)
      }))
      .mutation(async ({ input, ctx }) => {
        const asset = await getPromptAssetById(input.assetId);
        if (!asset || asset.userId !== ctx.user.id) {
          throw new TRPCError({ code: 'FORBIDDEN', message: 'Cannot update this asset' });
        }
        await updatePromptAsset(input.assetId, { name: input.name });
        return { success: true };
      }),
    
    markAsUsed: protectedProcedure
      .input(z.object({ assetId: z.number() }))
      .mutation(async ({ input, ctx }) => {
        const asset = await getPromptAssetById(input.assetId);
        if (!asset || asset.userId !== ctx.user.id) {
          throw new TRPCError({ code: 'FORBIDDEN', message: 'Cannot update this asset' });
        }
        await updatePromptAssetLastUsed(input.assetId);
        return { success: true };
      }),
    
    markAsSuccess: protectedProcedure
      .input(z.object({
        assetId: z.number(),
        status: z.number().min(-1).max(1)
      }))
      .mutation(async ({ input, ctx }) => {
        const asset = await getPromptAssetById(input.assetId);
        if (!asset || asset.userId !== ctx.user.id) {
          throw new TRPCError({ code: 'FORBIDDEN', message: 'Cannot update this asset' });
        }
        await updatePromptAssetSuccessStatus(input.assetId, input.status);
        return { success: true };
      }),
    
    deleteAsset: protectedProcedure
      .input(z.object({ assetId: z.number() }))
      .mutation(async ({ input, ctx }) => {
        const asset = await getPromptAssetById(input.assetId);
        if (!asset || asset.userId !== ctx.user.id) {
          throw new TRPCError({ code: 'FORBIDDEN', message: 'Cannot delete this asset' });
        }
        await deletePromptAsset(input.assetId);
        return { success: true };
      })
  }),
  // Feedback
  feedback: router({
    submit: publicProcedure
      .input(z.object({
        name: z.string().min(1),
        email: z.string().email(),
        message: z.string().min(10),
      }))
      .mutation(async ({ input }) => {
        const delivered = await notifyOwner({
          title: `새로운 피드백: ${input.name}`,
          content: `이름: ${input.name}\n이메일: ${input.email}\n\n메시지:\n${input.message}`,
        });
        
        if (!delivered) {
          throw new TRPCError({ 
            code: 'INTERNAL_SERVER_ERROR', 
            message: '피드백 전송에 실패했습니다. 잠시 후 다시 시도해 주세요.' 
          });
        }
        
        return {
          success: true
        };
      }),
  }),
});

export type AppRouter = typeof appRouter;

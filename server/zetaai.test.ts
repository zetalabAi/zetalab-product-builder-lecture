import { describe, expect, it, beforeAll } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";
import { createIntentTemplate } from "./db";

type AuthenticatedUser = NonNullable<TrpcContext["user"]>;

function createAuthContext(): TrpcContext {
  const user: AuthenticatedUser = {
    id: 1,
    openId: "test-user",
    email: "test@example.com",
    name: "Test User",
    loginMethod: "manus",
    role: "user",
    createdAt: new Date(),
    updatedAt: new Date(),
    lastSignedIn: new Date(),
  };

  const ctx: TrpcContext = {
    user,
    req: {
      protocol: "https",
      headers: {},
    } as TrpcContext["req"],
    res: {
      clearCookie: () => {},
    } as TrpcContext["res"],
  };

  return ctx;
}

describe("zetaAI router", () => {
  beforeAll(async () => {
    // Ensure at least one template exists
    try {
      await createIntentTemplate({
        category: "테스트 카테고리",
        keywords: JSON.stringify(["테스트", "test"]),
        questions: JSON.stringify([
          "테스트 질문 1",
          "테스트 질문 2",
          "테스트 질문 3"
        ]),
        defaultAnswers: JSON.stringify({
          "question_0": "기본 답변 1",
          "question_1": "기본 답변 2",
          "question_2": "기본 답변 3"
        })
      });
    } catch (error) {
      // Template might already exist, ignore error
    }
  });

  describe("init", () => {
    it("should initialize session and return intent questions", async () => {
      const ctx = createAuthContext();
      const caller = appRouter.createCaller(ctx);

      const result = await caller.zetaAI.init({
        question: "테스트 질문입니다"
      });

      expect(result).toHaveProperty("sessionId");
      expect(result.sessionId).toBeTruthy();
      expect(result).toHaveProperty("category");
      expect(result).toHaveProperty("questions");
      expect(Array.isArray(result.questions)).toBe(true);
      expect(result.questions.length).toBeGreaterThan(0);
      expect(result.questions.length).toBeLessThanOrEqual(5);
      expect(result.canSkip).toBe(true);
    });

    it("should match question to appropriate template", async () => {
      const ctx = createAuthContext();
      const caller = appRouter.createCaller(ctx);

      const result = await caller.zetaAI.init({
        question: "블로그 글을 어떻게 쓸까요?"
      });

      expect(result.category).toBeTruthy();
      expect(result.questions.length).toBeGreaterThan(0);
    });
  });

  describe("generatePrompt", () => {
    it("should generate prompt from intent answers", async () => {
      const ctx = createAuthContext();
      const caller = appRouter.createCaller(ctx);

      // First initialize
      const initResult = await caller.zetaAI.init({
        question: "테스트 질문입니다"
      });

      // Then generate prompt
      const result = await caller.zetaAI.generatePrompt({
        sessionId: initResult.sessionId,
        originalQuestion: "테스트 질문입니다",
        answers: {
          "question_0": "답변 1",
          "question_1": "답변 2"
        }
      });

      expect(result).toHaveProperty("promptId");
      expect(result.promptId).toBeGreaterThan(0);
      expect(result).toHaveProperty("originalQuestion");
      expect(result.originalQuestion).toBe("테스트 질문입니다");
      expect(result).toHaveProperty("generatedPrompt");
      expect(result.generatedPrompt).toBeTruthy();
      expect(result).toHaveProperty("suggestedServices");
      expect(Array.isArray(result.suggestedServices)).toBe(true);
    }, 30000); // Increase timeout for LLM call

    it("should handle empty answers gracefully", async () => {
      const ctx = createAuthContext();
      const caller = appRouter.createCaller(ctx);

      const initResult = await caller.zetaAI.init({
        question: "간단한 질문"
      });

      const result = await caller.zetaAI.generatePrompt({
        sessionId: initResult.sessionId,
        originalQuestion: "간단한 질문",
        answers: {}
      });

      expect(result.generatedPrompt).toBeTruthy();
    }, 30000);
  });

  describe("updatePrompt", () => {
    it("should update edited prompt", async () => {
      const ctx = createAuthContext();
      const caller = appRouter.createCaller(ctx);

      // Create a prompt first
      const initResult = await caller.zetaAI.init({
        question: "수정 테스트"
      });

      const generateResult = await caller.zetaAI.generatePrompt({
        sessionId: initResult.sessionId,
        originalQuestion: "수정 테스트",
        answers: { "question_0": "답변" }
      });

      // Update the prompt
      const updateResult = await caller.zetaAI.updatePrompt({
        promptId: generateResult.promptId,
        editedPrompt: "수정된 프롬프트 내용"
      });

      expect(updateResult.success).toBe(true);
      expect(updateResult.promptId).toBe(generateResult.promptId);
    }, 30000);
  });

  describe("getHistory", () => {
    it("should return user's prompt history", async () => {
      const ctx = createAuthContext();
      const caller = appRouter.createCaller(ctx);

      const history = await caller.zetaAI.getHistory();

      expect(Array.isArray(history)).toBe(true);
      // History might be empty or contain items
      if (history.length > 0) {
        const item = history[0];
        expect(item).toHaveProperty("id");
        expect(item).toHaveProperty("originalQuestion");
        expect(item).toHaveProperty("generatedPrompt");
        expect(item).toHaveProperty("createdAt");
      }
    });
  });

  describe("getPromptById", () => {
    it("should return prompt details by ID", async () => {
      const ctx = createAuthContext();
      const caller = appRouter.createCaller(ctx);

      // Create a prompt first
      const initResult = await caller.zetaAI.init({
        question: "ID 조회 테스트"
      });

      const generateResult = await caller.zetaAI.generatePrompt({
        sessionId: initResult.sessionId,
        originalQuestion: "ID 조회 테스트",
        answers: { "question_0": "답변" }
      });

      // Get prompt by ID
      const prompt = await caller.zetaAI.getPromptById({
        promptId: generateResult.promptId
      });

      expect(prompt.id).toBe(generateResult.promptId);
      expect(prompt.originalQuestion).toBe("ID 조회 테스트");
      expect(prompt.generatedPrompt).toBeTruthy();
      expect(prompt).toHaveProperty("intentAnswers");
      expect(prompt).toHaveProperty("suggestedServices");
    }, 30000);

    it("should throw error for non-existent prompt", async () => {
      const ctx = createAuthContext();
      const caller = appRouter.createCaller(ctx);

      await expect(
        caller.zetaAI.getPromptById({ promptId: 999999 })
      ).rejects.toThrow();
    });
  });
});

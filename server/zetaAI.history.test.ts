import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";
import { createPromptHistory, deletePromptHistory } from "./db";

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

describe("ZetaAI History API", () => {
  let caller: ReturnType<typeof appRouter.createCaller>;
  let testPromptId: number;

  beforeAll(async () => {
    const ctx = createAuthContext();
    caller = appRouter.createCaller(ctx);
    
    // Create test prompt history
    const result = await createPromptHistory({
      userId: 1, // Test user ID from context
      sessionId: "test-session-123",
      originalQuestion: "테스트 질문: 블로그 글 작성",
      intentAnswers: JSON.stringify({ topic: "AI 기술", style: "전문적" }),
      generatedPrompt: "테스트 프롬프트 내용",
      usedLLM: "gpt-4",
      suggestedServices: JSON.stringify([])
    });
    
    testPromptId = Number(result[0]?.insertId || 0);
  });

  afterAll(async () => {
    // Cleanup test data
    if (testPromptId) {
      await deletePromptHistory(testPromptId);
    }
  });

  it("should fetch user's conversation history", async () => {
    const history = await caller.zetaAI.getHistory();
    
    expect(Array.isArray(history)).toBe(true);
    expect(history.length).toBeGreaterThan(0);
    
    const testPrompt = history.find(h => h.id === testPromptId);
    expect(testPrompt).toBeDefined();
    expect(testPrompt?.originalQuestion).toBe("테스트 질문: 블로그 글 작성");
    expect(testPrompt?.generatedPrompt).toBe("테스트 프롬프트 내용");
  });

  it("should return history sorted by most recent first", async () => {
    const history = await caller.zetaAI.getHistory();
    
    if (history.length > 1) {
      for (let i = 0; i < history.length - 1; i++) {
        const current = new Date(history[i].createdAt).getTime();
        const next = new Date(history[i + 1].createdAt).getTime();
        expect(current).toBeGreaterThanOrEqual(next);
      }
    }
  });

  it("should search conversations by title", async () => {
    const results = await caller.zetaAI.searchHistory({ query: "블로그" });
    
    expect(Array.isArray(results)).toBe(true);
    const testPrompt = results.find(h => h.id === testPromptId);
    expect(testPrompt).toBeDefined();
  });

  it("should search conversations by content", async () => {
    const results = await caller.zetaAI.searchHistory({ query: "프롬프트" });
    
    expect(Array.isArray(results)).toBe(true);
    const testPrompt = results.find(h => h.id === testPromptId);
    expect(testPrompt).toBeDefined();
  });

  it("should return empty array when search query has no matches", async () => {
    const results = await caller.zetaAI.searchHistory({ query: "존재하지않는검색어xyz123" });
    
    expect(Array.isArray(results)).toBe(true);
    expect(results.length).toBe(0);
  });

  it("should return all history when search query is empty", async () => {
    const results = await caller.zetaAI.searchHistory({ query: "" });
    
    expect(Array.isArray(results)).toBe(true);
    expect(results.length).toBeGreaterThan(0);
  });

  it("should delete conversation history", async () => {
    // Create a temporary prompt for deletion test
    const result = await createPromptHistory({
      userId: 1,
      sessionId: "test-delete-session",
      originalQuestion: "삭제 테스트 질문",
      intentAnswers: JSON.stringify({}),
      generatedPrompt: "삭제 테스트 프롬프트",
      usedLLM: "gpt-4",
      suggestedServices: JSON.stringify([])
    });
    
    const deletePromptId = Number(result[0]?.insertId || 0);
    
    // Delete the prompt
    await caller.zetaAI.deleteHistory({ promptId: deletePromptId });
    
    // Verify it's deleted
    const history = await caller.zetaAI.getHistory();
    const deletedPrompt = history.find(h => h.id === deletePromptId);
    expect(deletedPrompt).toBeUndefined();
  });
});

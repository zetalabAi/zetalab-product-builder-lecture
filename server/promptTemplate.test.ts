import { describe, expect, it } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";

type AuthenticatedUser = NonNullable<TrpcContext["user"]>;

function createAuthContext(): { ctx: TrpcContext } {
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

  return { ctx };
}

describe("promptTemplate", () => {
  it("should create a new template", async () => {
    const { ctx } = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.promptTemplate.create({
      title: "Test Template",
      description: "Test Description",
      templateContent: "This is a test prompt template",
      category: "Testing",
      tags: ["test", "example"],
    });

    expect(result.success).toBe(true);
    expect(result.templateId).toBeTypeOf("number");
  });

  it("should list user templates", async () => {
    const { ctx } = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    // Create a template first
    await caller.promptTemplate.create({
      title: "List Test Template",
      templateContent: "Test content",
    });

    const templates = await caller.promptTemplate.list();

    expect(Array.isArray(templates)).toBe(true);
    expect(templates.length).toBeGreaterThan(0);
    expect(templates[0]).toHaveProperty("id");
    expect(templates[0]).toHaveProperty("title");
    expect(templates[0]).toHaveProperty("templateContent");
  });

  it("should get template by id", async () => {
    const { ctx } = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    // Create a template
    const createResult = await caller.promptTemplate.create({
      title: "Get By ID Test",
      templateContent: "Test content for get by id",
    });

    const template = await caller.promptTemplate.getById({
      templateId: createResult.templateId!,
    });

    expect(template).toBeDefined();
    expect(template.id).toBe(createResult.templateId);
    expect(template.title).toBe("Get By ID Test");
  });

  it("should update a template", async () => {
    const { ctx } = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    // Create a template
    const createResult = await caller.promptTemplate.create({
      title: "Original Title",
      templateContent: "Original content",
    });

    // Update it
    const updateResult = await caller.promptTemplate.update({
      templateId: createResult.templateId!,
      title: "Updated Title",
      templateContent: "Updated content",
    });

    expect(updateResult.success).toBe(true);

    // Verify update
    const template = await caller.promptTemplate.getById({
      templateId: createResult.templateId!,
    });

    expect(template.title).toBe("Updated Title");
    expect(template.templateContent).toBe("Updated content");
  });

  it("should delete a template", async () => {
    const { ctx } = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    // Create a template
    const createResult = await caller.promptTemplate.create({
      title: "To Be Deleted",
      templateContent: "This will be deleted",
    });

    // Delete it
    const deleteResult = await caller.promptTemplate.delete({
      templateId: createResult.templateId!,
    });

    expect(deleteResult.success).toBe(true);

    // Verify deletion - should throw error
    try {
      await caller.promptTemplate.getById({
        templateId: createResult.templateId!,
      });
      // Should not reach here
      expect(true).toBe(false);
    } catch (error: any) {
      expect(error.code).toBe("NOT_FOUND");
    }
  });

  it("should increment usage count when using template", async () => {
    const { ctx } = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    // Create a template
    const createResult = await caller.promptTemplate.create({
      title: "Usage Test",
      templateContent: "Template to test usage count",
    });

    // Get initial usage count
    const templateBefore = await caller.promptTemplate.getById({
      templateId: createResult.templateId!,
    });
    const initialUsageCount = templateBefore.usageCount;

    // Use the template
    const useResult = await caller.promptTemplate.use({
      templateId: createResult.templateId!,
    });

    expect(useResult.templateContent).toBe("Template to test usage count");

    // Verify usage count increased
    const templateAfter = await caller.promptTemplate.getById({
      templateId: createResult.templateId!,
    });

    expect(templateAfter.usageCount).toBe(initialUsageCount + 1);
  });
});

import { int, mysqlEnum, mysqlTable, text, timestamp, varchar } from "drizzle-orm/mysql-core";

/**
 * Core user table backing auth flow.
 * Extend this file with additional tables as your product grows.
 * Columns use camelCase to match both database fields and generated types.
 */
export const users = mysqlTable("users", {
  /**
   * Surrogate primary key. Auto-incremented numeric value managed by the database.
   * Use this for relations between tables.
   */
  id: int("id").autoincrement().primaryKey(),
  /** Manus OAuth identifier (openId) returned from the OAuth callback. Unique per user. */
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  /** Whether user has linked their Manus account (for referral credits) */
  manusLinked: int("manusLinked").default(0).notNull(), // 0 = not linked, 1 = linked
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});
export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

/**
 * Prompt templates that users can save and reuse
 */
export const promptTemplates = mysqlTable("promptTemplates", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  title: varchar("title", { length: 255 }).notNull(),
  description: text("description"),
  templateContent: text("templateContent").notNull(),
  category: varchar("category", { length: 100 }),
  tags: text("tags"), // JSON array of tags
  isPublic: int("isPublic").default(0).notNull(), // 0 = private, 1 = public
  usageCount: int("usageCount").default(0).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type PromptTemplate = typeof promptTemplates.$inferSelect;
export type InsertPromptTemplate = typeof promptTemplates.$inferInsert;

/**
 * Prompt Assets - 사용자가 저장한 프롬프트를 자산으로 관리
 * 프롬프트를 저장하면 promptAssets에 기록되고, 버전 관리는 promptVersions에서 수행
 */
export const promptAssets = mysqlTable("promptAssets", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  /** 프롬프트 자산의 고유 이름 (사용자가 입력) */
  name: varchar("name", { length: 255 }).notNull(),
  /** 프롬프트 설명 */
  description: text("description"),
  /** 원본 질문 (사용자가 입력한 초기 질문) */
  originalQuestion: text("originalQuestion").notNull(),
  /** 현재 활성 버전 ID (promptVersions.id) */
  currentVersionId: int("currentVersionId"),
  /** 총 버전 개수 */
  versionCount: int("versionCount").default(1).notNull(),
  /** 마지막 사용 시간 */
  lastUsedAt: timestamp("lastUsedAt"),
  /** 마지막 수정 시간 */
  lastModifiedAt: timestamp("lastModifiedAt").defaultNow().onUpdateNow().notNull(),
  /** 성공 여부 (0 = 미평가, 1 = 성공, -1 = 실패) */
  successStatus: int("successStatus").default(0).notNull(),
  /** 프로젝트 ID (선택사항) */
  projectId: int("projectId"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type PromptAsset = typeof promptAssets.$inferSelect;
export type InsertPromptAsset = typeof promptAssets.$inferInsert;

/**
 * Prompt Versions - 프롬프트의 버전 관리 (v1, v2, v3...)
 * 같은 promptAsset에 대해 여러 버전이 존재할 수 있음
 */
export const promptVersions = mysqlTable("promptVersions", {
  id: int("id").autoincrement().primaryKey(),
  promptAssetId: int("promptAssetId").notNull(),
  userId: int("userId").notNull(),
  /** 버전 번호 (1, 2, 3...) */
  versionNumber: int("versionNumber").notNull(),
  /** 생성된 프롬프트 내용 */
  generatedPrompt: text("generatedPrompt").notNull(),
  /** 사용자가 수정한 프롬프트 (있을 경우) */
  editedPrompt: text("editedPrompt"),
  /** Intent 답변들 (JSON) */
  intentAnswers: text("intentAnswers"),
  /** 사용한 LLM 모델 */
  usedLLM: varchar("usedLLM", { length: 64 }),
  /** 추천된 서비스 (JSON) */
  suggestedServices: text("suggestedServices"),
  /** 이 버전에 대한 메모 */
  notes: text("notes"),
  /** 성공 여부 (0 = 미평가, 1 = 성공, -1 = 실패) */
  successStatus: int("successStatus").default(0).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type PromptVersion = typeof promptVersions.$inferSelect;
export type InsertPromptVersion = typeof promptVersions.$inferInsert;

// TODO: Add your tables here

/**
 * Prompt history to store user questions, intent answers, and generated prompts.
 */
export const promptHistory = mysqlTable("promptHistory", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  sessionId: varchar("sessionId", { length: 64 }).notNull(),
  originalQuestion: text("originalQuestion").notNull(),
  intentAnswers: text("intentAnswers"), // JSON string
  generatedPrompt: text("generatedPrompt").notNull(),
  editedPrompt: text("editedPrompt"),
  usedLLM: varchar("usedLLM", { length: 64 }),
  suggestedServices: text("suggestedServices"), // JSON string
  isPinned: int("isPinned").default(0).notNull(), // 0 = not pinned, 1 = pinned
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type PromptHistory = typeof promptHistory.$inferSelect;
export type InsertPromptHistory = typeof promptHistory.$inferInsert;

/**
 * Intent template table to store predefined intent questions for different categories.
 */
export const intentTemplate = mysqlTable("intentTemplate", {
  id: int("id").autoincrement().primaryKey(),
  category: varchar("category", { length: 128 }).notNull(),
  keywords: text("keywords"), // JSON array of keywords
  questions: text("questions").notNull(), // JSON array of questions
  defaultAnswers: text("defaultAnswers"), // JSON object of default answers
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type IntentTemplate = typeof intentTemplate.$inferSelect;
export type InsertIntentTemplate = typeof intentTemplate.$inferInsert;

/**
 * Projects table for organizing conversations into folders
 */
export const projects = mysqlTable("projects", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  name: varchar("name", { length: 255 }).notNull(),
  description: text("description"),
  color: varchar("color", { length: 7 }), // Hex color code
  icon: varchar("icon", { length: 50 }), // Icon name or emoji
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Project = typeof projects.$inferSelect;
export type InsertProject = typeof projects.$inferInsert;

/**
 * Project conversations junction table to link conversations to projects
 */
export const projectConversations = mysqlTable("projectConversations", {
  id: int("id").autoincrement().primaryKey(),
  projectId: int("projectId").notNull(),
  conversationId: int("conversationId").notNull(), // promptHistory.id
  addedAt: timestamp("addedAt").defaultNow().notNull(),
});

export type ProjectConversation = typeof projectConversations.$inferSelect;
export type InsertProjectConversation = typeof projectConversations.$inferInsert;

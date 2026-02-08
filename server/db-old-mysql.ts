import { eq, desc, and } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import { InsertUser, users, promptTemplates, InsertPromptTemplate, promptHistory, InsertPromptHistory, intentTemplate, InsertIntentTemplate, projects, InsertProject, projectConversations, InsertProjectConversation, promptAssets, InsertPromptAsset, promptVersions, InsertPromptVersion } from "../drizzle/schema";
import { ENV } from './_core/env';

let _db: ReturnType<typeof drizzle> | null = null;

// Lazily create the drizzle instance so local tooling can run without a DB.
export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      _db = drizzle(process.env.DATABASE_URL);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) {
    throw new Error("User openId is required for upsert");
  }

  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot upsert user: database not available");
    return;
  }

  try {
    const values: InsertUser = {
      openId: user.openId,
    };
    const updateSet: Record<string, unknown> = {};

    const textFields = ["name", "email", "loginMethod"] as const;
    type TextField = (typeof textFields)[number];

    const assignNullable = (field: TextField) => {
      const value = user[field];
      if (value === undefined) return;
      const normalized = value ?? null;
      values[field] = normalized;
      updateSet[field] = normalized;
    };

    textFields.forEach(assignNullable);

    if (user.lastSignedIn !== undefined) {
      values.lastSignedIn = user.lastSignedIn;
      updateSet.lastSignedIn = user.lastSignedIn;
    }
    if (user.role !== undefined) {
      values.role = user.role;
      updateSet.role = user.role;
    } else if (user.openId === ENV.ownerOpenId) {
      values.role = 'admin';
      updateSet.role = 'admin';
    }

    if (!values.lastSignedIn) {
      values.lastSignedIn = new Date();
    }

    if (Object.keys(updateSet).length === 0) {
      updateSet.lastSignedIn = new Date();
    }

    await db.insert(users).values(values).onDuplicateKeyUpdate({
      set: updateSet,
    });
  } catch (error) {
    console.error("[Database] Failed to upsert user:", error);
    throw error;
  }
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get user: database not available");
    return undefined;
  }

  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);

  return result.length > 0 ? result[0] : undefined;
}

export async function updateUserManusLinked(openId: string, manusLinked: number) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot update user: database not available");
    return;
  }

  await db.update(users).set({ manusLinked }).where(eq(users.openId, openId));
}

// Prompt History helpers
export async function createPromptHistory(data: InsertPromptHistory) {
  const db = await getDb();
  if (!db) {
    throw new Error("Database not available");
  }

  const result = await db.insert(promptHistory).values(data);
  return result;
}

export async function getPromptHistoryById(id: number) {
  const db = await getDb();
  if (!db) {
    throw new Error("Database not available");
  }

  const result = await db.select().from(promptHistory).where(eq(promptHistory.id, id)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function getPromptHistoryByUserId(userId: number, limit: number = 20) {
  const db = await getDb();
  if (!db) {
    throw new Error("Database not available");
  }

  const result = await db
    .select()
    .from(promptHistory)
    .where(eq(promptHistory.userId, userId))
    .orderBy(desc(promptHistory.isPinned), desc(promptHistory.createdAt))
    .limit(limit);

  return result;
}

export async function updatePromptHistory(id: number, data: Partial<InsertPromptHistory>) {
  const db = await getDb();
  if (!db) {
    throw new Error("Database not available");
  }

  await db.update(promptHistory).set(data).where(eq(promptHistory.id, id));
}

export async function deletePromptHistory(id: number) {
  const db = await getDb();
  if (!db) {
    throw new Error("Database not available");
  }

  await db.delete(promptHistory).where(eq(promptHistory.id, id));
}

export async function renamePromptHistory(id: number, newName: string) {
  const db = await getDb();
  if (!db) {
    throw new Error("Database not available");
  }

  await db.update(promptHistory)
    .set({ originalQuestion: newName })
    .where(eq(promptHistory.id, id));
}

export async function pinPromptHistory(id: number, isPinned: number) {
  const db = await getDb();
  if (!db) {
    throw new Error("Database not available");
  }

  await db.update(promptHistory)
    .set({ isPinned })
    .where(eq(promptHistory.id, id));
}

// Project helpers
export async function createProject(data: InsertProject) {
  const db = await getDb();
  if (!db) {
    throw new Error("Database not available");
  }

  const result = await db.insert(projects).values(data);
  return result;
}

export async function getProjectsByUserId(userId: number) {
  const db = await getDb();
  if (!db) {
    throw new Error("Database not available");
  }

  const result = await db
    .select()
    .from(projects)
    .where(eq(projects.userId, userId))
    .orderBy(desc(projects.createdAt));

  return result;
}

export async function getProjectById(id: number) {
  const db = await getDb();
  if (!db) {
    throw new Error("Database not available");
  }

  const result = await db.select().from(projects).where(eq(projects.id, id)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function updateProject(id: number, data: Partial<InsertProject>) {
  const db = await getDb();
  if (!db) {
    throw new Error("Database not available");
  }

  await db.update(projects).set(data).where(eq(projects.id, id));
}

export async function deleteProject(id: number) {
  const db = await getDb();
  if (!db) {
    throw new Error("Database not available");
  }

  // Delete all project conversations first
  await db.delete(projectConversations).where(eq(projectConversations.projectId, id));
  // Then delete the project
  await db.delete(projects).where(eq(projects.id, id));
}

// Project Conversation helpers
export async function addConversationToProject(projectId: number, conversationId: number) {
  const db = await getDb();
  if (!db) {
    throw new Error("Database not available");
  }

  const result = await db.insert(projectConversations).values({
    projectId,
    conversationId,
  });
  return result;
}

export async function removeConversationFromProject(projectId: number, conversationId: number) {
  const db = await getDb();
  if (!db) {
    throw new Error("Database not available");
  }

  await db
    .delete(projectConversations)
    .where(
      and(
        eq(projectConversations.projectId, projectId),
        eq(projectConversations.conversationId, conversationId)
      )
    );
}

export async function getConversationsByProjectId(projectId: number) {
  const db = await getDb();
  if (!db) {
    throw new Error("Database not available");
  }

  const result = await db
    .select({
      conversation: promptHistory,
      addedAt: projectConversations.addedAt,
    })
    .from(projectConversations)
    .innerJoin(promptHistory, eq(projectConversations.conversationId, promptHistory.id))
    .where(eq(projectConversations.projectId, projectId))
    .orderBy(desc(projectConversations.addedAt));

  return result;
}

// Intent Template helpers
export async function createIntentTemplate(data: InsertIntentTemplate) {
  const db = await getDb();
  if (!db) {
    throw new Error("Database not available");
  }

  const result = await db.insert(intentTemplate).values(data);
  return result;
}

export async function getAllIntentTemplates() {
  const db = await getDb();
  if (!db) {
    throw new Error("Database not available");
  }

  const result = await db.select().from(intentTemplate);
  return result;
}

export async function getIntentTemplateByCategory(category: string) {
  const db = await getDb();
  if (!db) {
    throw new Error("Database not available");
  }

  const result = await db.select().from(intentTemplate).where(eq(intentTemplate.category, category)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

// Prompt Template helpers
export async function createPromptTemplate(template: InsertPromptTemplate) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot create template: database not available");
    return null;
  }
  const result = await db.insert(promptTemplates).values(template);
  return Number(result[0].insertId);
}

export async function getUserPromptTemplates(userId: number) {
  const db = await getDb();
  if (!db) return [];
  return await db.select().from(promptTemplates).where(eq(promptTemplates.userId, userId)).orderBy(desc(promptTemplates.createdAt));
}

export async function getPromptTemplateById(id: number) {
  const db = await getDb();
  if (!db) return null;
  const result = await db.select().from(promptTemplates).where(eq(promptTemplates.id, id)).limit(1);
  return result.length > 0 ? result[0] : null;
}

export async function updatePromptTemplate(id: number, updates: Partial<InsertPromptTemplate>) {
  const db = await getDb();
  if (!db) return false;
  await db.update(promptTemplates).set(updates).where(eq(promptTemplates.id, id));
  return true;
}

export async function deletePromptTemplate(id: number) {
  const db = await getDb();
  if (!db) return false;
  await db.delete(promptTemplates).where(eq(promptTemplates.id, id));
  return true;
}

export async function incrementTemplateUsage(id: number) {
  const db = await getDb();
  if (!db) return;
  const template = await getPromptTemplateById(id);
  if (template) {
    await db.update(promptTemplates).set({ usageCount: template.usageCount + 1 }).where(eq(promptTemplates.id, id));
  }
}

// Prompt Asset helpers (프롬프트 저장 + 버전 관리)
export async function createPromptAsset(data: InsertPromptAsset) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.insert(promptAssets).values(data);
  return Number(result[0].insertId);
}

export async function getPromptAssetsByUserId(userId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.select().from(promptAssets).where(eq(promptAssets.userId, userId)).orderBy(desc(promptAssets.lastModifiedAt));
  return result;
}

export async function getPromptAssetById(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.select().from(promptAssets).where(eq(promptAssets.id, id)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function updatePromptAsset(id: number, data: Partial<InsertPromptAsset>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.update(promptAssets).set(data).where(eq(promptAssets.id, id));
}

export async function deletePromptAsset(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.delete(promptVersions).where(eq(promptVersions.promptAssetId, id));
  await db.delete(promptAssets).where(eq(promptAssets.id, id));
}

// Prompt Version helpers
export async function createPromptVersion(data: InsertPromptVersion) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.insert(promptVersions).values(data);
  return Number(result[0].insertId);
}

export async function getPromptVersionsByAssetId(promptAssetId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.select().from(promptVersions).where(eq(promptVersions.promptAssetId, promptAssetId)).orderBy(desc(promptVersions.versionNumber));
  return result;
}

export async function getPromptVersionById(versionId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.select().from(promptVersions).where(eq(promptVersions.id, versionId)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function updatePromptVersion(versionId: number, data: Partial<InsertPromptVersion>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.update(promptVersions).set(data).where(eq(promptVersions.id, versionId));
}

export async function updatePromptAssetLastUsed(assetId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.update(promptAssets).set({ lastUsedAt: new Date() }).where(eq(promptAssets.id, assetId));
}

export async function updatePromptAssetSuccessStatus(assetId: number, status: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.update(promptAssets).set({ successStatus: status }).where(eq(promptAssets.id, assetId));
}

// Firestore database helpers for ZetaLab
import admin from 'firebase-admin';
import { FieldValue } from 'firebase-admin/firestore';

// Check if we're in dev mode without Firebase credentials
const isDevModeWithoutFirebase =
  process.env.NODE_ENV === 'development' &&
  process.env.DEV_AUTO_LOGIN === 'true' &&
  !process.env.GOOGLE_APPLICATION_CREDENTIALS;

// Initialize Firebase Admin if not already initialized
function initializeFirebase() {
  if (isDevModeWithoutFirebase) {
    console.log('[Firestore] Dev mode without credentials - Firebase initialization skipped');
    return;
  }

  if (admin.apps.length === 0) {
    admin.initializeApp({
      credential: admin.credential.applicationDefault(),
      projectId: process.env.FIREBASE_PROJECT_ID || 'zetalab-product-builder'
    });
  }
}

initializeFirebase();

const db = isDevModeWithoutFirebase ? null : admin.firestore();

// Export db instance for routers that need direct Firestore access
export { db };

// ============================================================================
// Dev Mode In-Memory Storage
// ============================================================================

const devMemoryStore: {
  conversations: Map<string, Conversation>;
  promptAssets: Map<string, PromptAsset>;
  promptVersions: Map<string, PromptVersion>;
  projects: Map<string, Project>;
  courses: Map<string, Course>;
  userCourseProgress: Map<string, UserCourseProgress>;
  chains: Map<string, PromptChain>;
  chainExecutions: Map<string, ChainExecution>;
  chainTemplates: Map<string, ChainTemplate>;
} = {
  conversations: new Map(),
  promptAssets: new Map(),
  promptVersions: new Map(),
  projects: new Map(),
  courses: new Map(),
  userCourseProgress: new Map(),
  chains: new Map(),
  chainExecutions: new Map(),
  chainTemplates: new Map(),
};

// ============================================================================
// Type Definitions (matching Firestore schema)
// ============================================================================

export interface User {
  uid: string;
  openId: string;
  name: string | null;
  email: string | null;
  loginMethod: string | null;
  role: 'user' | 'admin';
  manusLinked: boolean;
  createdAt: Date;
  updatedAt: Date;
  lastSignedIn: Date;
}

export interface InsertUser {
  uid: string;
  openId: string;
  name?: string | null;
  email?: string | null;
  loginMethod?: string | null;
  role?: 'user' | 'admin';
  lastSignedIn?: Date;
}

export interface TemplateVariable {
  name: string;           // "topic"
  label: string;          // "블로그 주제"
  placeholder: string;    // "예: AI 트렌드"
  required: boolean;
  type: 'text' | 'textarea' | 'select';
  options?: string[];     // for select type
}

export interface PromptTemplate {
  id: string;
  userId: string;
  title: string;
  description: string | null;
  templateContent: string;
  category: string | null;
  tags: string[];
  isPublic: boolean;
  usageCount: number;
  createdAt: Date;
  updatedAt: Date;
  isOfficial: boolean;           // NEW: ZetaLab official templates
  variables: TemplateVariable[]; // NEW: Variable metadata
}

export interface InsertPromptTemplate {
  userId: string;
  title: string;
  description?: string | null;
  templateContent: string;
  category?: string | null;
  tags?: string[];
  isPublic?: boolean;
  usageCount?: number;
  isOfficial?: boolean;           // NEW
  variables?: TemplateVariable[]; // NEW
}

export interface PromptAsset {
  id: string;
  userId: string;
  name: string;
  description: string | null;
  originalQuestion: string;
  currentVersionId: string | null;
  versionCount: number;
  lastUsedAt: Date | null;
  lastModifiedAt: Date;
  successStatus: number;
  projectId: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface InsertPromptAsset {
  userId: string;
  name: string;
  description?: string | null;
  originalQuestion: string;
  currentVersionId?: string | null;
  versionCount?: number;
  projectId?: string | null;
}

export interface PromptVersion {
  id: string;
  userId: string;
  promptAssetId?: string; // For dev mode filtering
  versionNumber: number;
  generatedPrompt: string;
  editedPrompt: string | null;
  intentAnswers: Record<string, any> | null;
  usedLLM: string | null;
  suggestedServices: Record<string, any> | null;
  notes: string | null;
  successStatus: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface InsertPromptVersion {
  userId: string;
  versionNumber: number;
  generatedPrompt: string;
  editedPrompt?: string | null;
  intentAnswers?: Record<string, any> | null;
  usedLLM?: string | null;
  suggestedServices?: Record<string, any> | null;
  notes?: string | null;
  successStatus?: number;
}

export interface Conversation {
  id: string;
  userId: string;
  sessionId: string;
  originalQuestion: string;
  intentAnswers: Record<string, any> | null;
  generatedPrompt: string;
  editedPrompt: string | null;
  usedLLM: string | null;
  suggestedServices: Record<string, any> | null;
  autoGeneratedAnswers?: Record<string, string> | null;  // AI가 자동 생성한 답변들
  isPinned: boolean;
  projectId: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface InsertConversation {
  userId: string;
  sessionId: string;
  originalQuestion: string;
  intentAnswers?: Record<string, any> | null;
  generatedPrompt: string;
  editedPrompt?: string | null;
  usedLLM?: string | null;
  suggestedServices?: Record<string, any> | null;
  autoGeneratedAnswers?: Record<string, string> | null;  // AI가 자동 생성한 답변들
  isPinned?: boolean;
  projectId?: string | null;
}

export interface IntentTemplate {
  id: string;
  category: string;
  keywords: string[];
  questions: string[];
  defaultAnswers: Record<string, any> | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface InsertIntentTemplate {
  category: string;
  keywords: string[];
  questions: string[];
  defaultAnswers?: Record<string, any> | null;
}

export interface Project {
  id: string;
  userId: string;
  name: string;
  description: string | null;
  color: string | null;
  icon: string | null;
  conversationIds: string[];
  createdAt: Date;
  updatedAt: Date;
}

export interface InsertProject {
  userId: string;
  name: string;
  description?: string | null;
  color?: string | null;
  icon?: string | null;
}

// ============================================================================
// Course Learning System Types
// ============================================================================

export type Difficulty = 'beginner' | 'intermediate' | 'advanced';
export type LessonType = 'theory' | 'example' | 'exercise' | 'quiz';

export interface Course {
  id: string;
  title: string;
  description: string;
  difficulty: Difficulty;
  modules: Module[];
  estimatedTime: number; // 분
  prerequisites?: string[]; // 선수 코스 ID
  icon: string; // emoji
  createdAt: Date;
  updatedAt: Date;
}

export interface Module {
  id: string;
  title: string;
  lessons: Lesson[];
}

export interface Lesson {
  id: string;
  title: string;
  type: LessonType;
  content: LessonContent;
}

export type LessonContent =
  | TheoryContent
  | ExampleContent
  | ExerciseContent
  | QuizContent;

export interface TheoryContent {
  type: 'theory';
  markdown: string;
}

export interface ExampleContent {
  type: 'example';
  goodExample: string;
  badExample: string;
  explanation: string;
}

export interface ExerciseContent {
  type: 'exercise';
  task: string;
  hints: string[];
  solution: string;
  checkpoints?: string[]; // 체크할 포인트들
}

export interface QuizContent {
  type: 'quiz';
  questions: QuizQuestion[];
}

export interface QuizQuestion {
  question: string;
  options: string[];
  correctAnswer: number; // 0-based index
  explanation: string;
}

export interface UserCourseProgress {
  userId: string;
  courseId: string;
  completedLessons: string[]; // lesson IDs
  quizScores: Record<string, number>; // lessonId -> score
  completionRate: number; // 0-100
  lastAccessedAt: Date;
  currentModuleId?: string;
  currentLessonId?: string;
}

export interface InsertUserCourseProgress {
  userId: string;
  courseId: string;
  completedLessons?: string[];
  quizScores?: Record<string, number>;
  currentModuleId?: string;
  currentLessonId?: string;
}

// ============================================================================
// User Functions
// ============================================================================

export async function upsertUser(userData: InsertUser): Promise<void> {
  try {
    const userRef = db.collection('users').doc(userData.uid);
    const userDoc = await userRef.get();

    const now = new Date();

    if (userDoc.exists) {
      // Update existing user
      const updateData: Partial<User> = {
        updatedAt: now,
        lastSignedIn: userData.lastSignedIn || now,
      };

      if (userData.name !== undefined) updateData.name = userData.name;
      if (userData.email !== undefined) updateData.email = userData.email;
      if (userData.loginMethod !== undefined) updateData.loginMethod = userData.loginMethod;
      if (userData.role !== undefined) updateData.role = userData.role;

      await userRef.update(updateData);
    } else {
      // Create new user
      const newUser: User = {
        uid: userData.uid,
        openId: userData.openId,
        name: userData.name || null,
        email: userData.email || null,
        loginMethod: userData.loginMethod || null,
        role: userData.role || 'user',
        manusLinked: false,
        createdAt: now,
        updatedAt: now,
        lastSignedIn: userData.lastSignedIn || now,
      };

      await userRef.set(newUser);
    }
  } catch (error) {
    console.error('[Firestore] Failed to upsert user:', error);
    throw error;
  }
}

export async function getUserByUid(uid: string): Promise<User | null> {
  try {
    const userDoc = await db.collection('users').doc(uid).get();

    if (!userDoc.exists) {
      return null;
    }

    return { id: userDoc.id, ...userDoc.data() } as User;
  } catch (error) {
    console.error('[Firestore] Failed to get user by UID:', error);
    return null;
  }
}

export async function getUserByOpenId(openId: string): Promise<User | null> {
  try {
    const snapshot = await db.collection('users')
      .where('openId', '==', openId)
      .limit(1)
      .get();

    if (snapshot.empty) {
      return null;
    }

    const doc = snapshot.docs[0];
    return { id: doc.id, ...doc.data() } as User;
  } catch (error) {
    console.error('[Firestore] Failed to get user by openId:', error);
    return null;
  }
}

export async function updateUserManusLinked(uid: string, manusLinked: boolean): Promise<void> {
  if (isDevModeWithoutFirebase || !db) {
    console.log('[Firestore] Dev mode - skipping updateUserManusLinked');
    return;
  }

  try {
    await db.collection('users').doc(uid).update({
      manusLinked,
      updatedAt: new Date(),
    });
  } catch (error) {
    console.error('[Firestore] Failed to update user manus linked:', error);
    throw error;
  }
}

// ============================================================================
// Conversation Functions (formerly promptHistory)
// ============================================================================

export async function createConversation(data: InsertConversation): Promise<string> {
  const now = new Date();
  const conversationData: Omit<Conversation, 'id'> = {
    userId: data.userId,
    sessionId: data.sessionId,
    originalQuestion: data.originalQuestion,
    intentAnswers: data.intentAnswers || null,
    generatedPrompt: data.generatedPrompt,
    editedPrompt: data.editedPrompt || null,
    usedLLM: data.usedLLM || null,
    suggestedServices: data.suggestedServices || null,
    autoGeneratedAnswers: data.autoGeneratedAnswers || null,
    isPinned: data.isPinned || false,
    projectId: data.projectId || null,
    createdAt: now,
    updatedAt: now,
  };

  if (isDevModeWithoutFirebase || !db) {
    console.log('[Firestore] Dev mode - storing conversation in memory');
    const { nanoid } = await import('nanoid');
    const id = nanoid();
    devMemoryStore.conversations.set(id, { id, ...conversationData });
    return id;
  }

  try {
    const docRef = await db.collection('conversations').add(conversationData);
    return docRef.id;
  } catch (error) {
    console.error('[Firestore] Failed to create conversation:', error);
    throw error;
  }
}

export async function getConversationById(id: string): Promise<Conversation | null> {
  if (isDevModeWithoutFirebase || !db) {
    console.log('[Firestore] Dev mode - retrieving conversation from memory');
    return devMemoryStore.conversations.get(id) || null;
  }

  try {
    const doc = await db.collection('conversations').doc(id).get();

    if (!doc.exists) {
      return null;
    }

    return { id: doc.id, ...doc.data() } as Conversation;
  } catch (error) {
    console.error('[Firestore] Failed to get conversation:', error);
    return null;
  }
}

export async function getConversationsByUserId(userId: string, limit: number = 20): Promise<Conversation[]> {
  if (isDevModeWithoutFirebase || !db) {
    console.log('[Firestore] Dev mode - returning empty conversations');
    return [];
  }

  try {
    const snapshot = await db.collection('conversations')
      .where('userId', '==', userId)
      .orderBy('isPinned', 'desc')
      .orderBy('createdAt', 'desc')
      .limit(limit)
      .get();

    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    } as Conversation));
  } catch (error) {
    console.error('[Firestore] Failed to get conversations:', error);
    return [];
  }
}

export async function updateConversation(id: string, data: Partial<InsertConversation>): Promise<void> {
  const updateData = {
    ...data,
    updatedAt: new Date(),
  };

  if (isDevModeWithoutFirebase || !db) {
    console.log('[Firestore] Dev mode - updating conversation in memory');
    const existing = devMemoryStore.conversations.get(id);
    if (existing) {
      devMemoryStore.conversations.set(id, { ...existing, ...updateData });
    }
    return;
  }

  try {
    await db.collection('conversations').doc(id).update(updateData);
  } catch (error) {
    console.error('[Firestore] Failed to update conversation:', error);
    throw error;
  }
}

export async function deleteConversation(id: string): Promise<void> {
  if (isDevModeWithoutFirebase || !db) {
    console.log('[Firestore] Dev mode - deleting conversation from memory');
    devMemoryStore.conversations.delete(id);
    return;
  }

  try {
    await db.collection('conversations').doc(id).delete();
  } catch (error) {
    console.error('[Firestore] Failed to delete conversation:', error);
    throw error;
  }
}

// ============================================================================
// Prompt Template Functions
// ============================================================================

export async function createPromptTemplate(data: InsertPromptTemplate): Promise<string> {
  if (isDevModeWithoutFirebase || !db) {
    console.log('[Firestore] Dev mode - skipping template creation');
    const { nanoid } = await import('nanoid');
    return nanoid();
  }

  try {
    const now = new Date();
    const templateData: Omit<PromptTemplate, 'id'> = {
      userId: data.userId,
      title: data.title,
      description: data.description || null,
      templateContent: data.templateContent,
      category: data.category || null,
      tags: data.tags || [],
      isPublic: data.isPublic || false,
      usageCount: data.usageCount || 0,
      isOfficial: data.isOfficial || false,
      variables: data.variables || [],
      createdAt: now,
      updatedAt: now,
    };

    const docRef = await db.collection('promptTemplates').add(templateData);
    return docRef.id;
  } catch (error) {
    console.error('[Firestore] Failed to create prompt template:', error);
    throw error;
  }
}

export async function getPromptTemplatesByUserId(userId: string): Promise<PromptTemplate[]> {
  try {
    const snapshot = await db.collection('promptTemplates')
      .where('userId', '==', userId)
      .orderBy('createdAt', 'desc')
      .get();

    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    } as PromptTemplate));
  } catch (error) {
    console.error('[Firestore] Failed to get prompt templates:', error);
    return [];
  }
}

export async function deletePromptTemplate(id: string): Promise<void> {
  try {
    await db.collection('promptTemplates').doc(id).delete();
  } catch (error) {
    console.error('[Firestore] Failed to delete prompt template:', error);
    throw error;
  }
}

export async function getPublicPromptTemplates(options?: {
  category?: string;
  tags?: string[];
  limit?: number;
}): Promise<PromptTemplate[]> {
  if (isDevModeWithoutFirebase || !db) {
    console.log('[Firestore] Dev mode - returning empty templates');
    return [];
  }

  try {
    let query = db.collection('promptTemplates')
      .where('isPublic', '==', true) as any;

    // Filter by category if provided
    if (options?.category) {
      query = query.where('category', '==', options.category);
    }

    // Filter by tags if provided (Firestore array-contains can only check one tag)
    if (options?.tags && options.tags.length > 0) {
      query = query.where('tags', 'array-contains', options.tags[0]);
    }

    // Order by usage count (most popular first)
    query = query.orderBy('usageCount', 'desc');

    // Limit results
    if (options?.limit) {
      query = query.limit(options.limit);
    }

    const snapshot = await query.get();

    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    } as PromptTemplate));
  } catch (error) {
    console.error('[Firestore] Failed to get public prompt templates:', error);
    return [];
  }
}

export async function getPromptTemplateById(id: string): Promise<PromptTemplate | null> {
  if (isDevModeWithoutFirebase || !db) {
    console.log('[Firestore] Dev mode - returning null template');
    return null;
  }

  try {
    const doc = await db.collection('promptTemplates').doc(id).get();

    if (!doc.exists) {
      return null;
    }

    return { id: doc.id, ...doc.data() } as PromptTemplate;
  } catch (error) {
    console.error('[Firestore] Failed to get prompt template:', error);
    return null;
  }
}

export async function incrementTemplateUsage(id: string): Promise<void> {
  if (isDevModeWithoutFirebase || !db) {
    console.log('[Firestore] Dev mode - skipping increment usage');
    return;
  }

  try {
    await db.collection('promptTemplates').doc(id).update({
      usageCount: FieldValue.increment(1),
      updatedAt: new Date(),
    });
  } catch (error) {
    console.error('[Firestore] Failed to increment template usage:', error);
    throw error;
  }
}

export function fillTemplateVariables(
  templateContent: string,
  variableValues: Record<string, string>
): string {
  let filled = templateContent;
  for (const [key, value] of Object.entries(variableValues)) {
    filled = filled.replace(new RegExp(`{{${key}}}`, 'g'), value);
  }
  return filled;
}

export async function getTemplateCategories(): Promise<{ category: string; count: number }[]> {
  if (isDevModeWithoutFirebase || !db) {
    console.log('[Firestore] Dev mode - returning empty categories');
    return [];
  }

  try {
    const snapshot = await db.collection('promptTemplates')
      .where('isPublic', '==', true)
      .get();

    // Count templates by category
    const categoryCounts: Record<string, number> = {};
    snapshot.docs.forEach(doc => {
      const data = doc.data();
      const category = data.category || 'other';
      categoryCounts[category] = (categoryCounts[category] || 0) + 1;
    });

    // Convert to array
    return Object.entries(categoryCounts).map(([category, count]) => ({
      category,
      count,
    }));
  } catch (error) {
    console.error('[Firestore] Failed to get template categories:', error);
    return [];
  }
}

// ============================================================================
// Intent Template Functions
// ============================================================================

export async function createIntentTemplate(data: InsertIntentTemplate): Promise<string> {
  try {
    const now = new Date();
    const templateData: Omit<IntentTemplate, 'id'> = {
      category: data.category,
      keywords: data.keywords,
      questions: data.questions,
      defaultAnswers: data.defaultAnswers || null,
      createdAt: now,
      updatedAt: now,
    };

    const docRef = await db.collection('intentTemplates').add(templateData);
    return docRef.id;
  } catch (error) {
    console.error('[Firestore] Failed to create intent template:', error);
    throw error;
  }
}

export async function getIntentTemplateByCategory(category: string): Promise<IntentTemplate | null> {
  try {
    const snapshot = await db.collection('intentTemplates')
      .where('category', '==', category)
      .limit(1)
      .get();

    if (snapshot.empty) {
      return null;
    }

    const doc = snapshot.docs[0];
    return { id: doc.id, ...doc.data() } as IntentTemplate;
  } catch (error) {
    console.error('[Firestore] Failed to get intent template:', error);
    return null;
  }
}

export async function getAllIntentTemplates(): Promise<IntentTemplate[]> {
  if (isDevModeWithoutFirebase || !db) {
    console.log('[Firestore] Dev mode - returning empty intent templates');
    return [];
  }

  try {
    const snapshot = await db.collection('intentTemplates').get();

    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    } as IntentTemplate));
  } catch (error) {
    console.error('[Firestore] Failed to get all intent templates:', error);
    return [];
  }
}

// ============================================================================
// Project Functions
// ============================================================================

export async function createProject(data: InsertProject): Promise<string> {
  try {
    const now = new Date();
    const projectData: Omit<Project, 'id'> = {
      userId: data.userId,
      name: data.name,
      description: data.description || null,
      color: data.color || null,
      icon: data.icon || null,
      conversationIds: [],
      createdAt: now,
      updatedAt: now,
    };

    const docRef = await db.collection('projects').add(projectData);
    return docRef.id;
  } catch (error) {
    console.error('[Firestore] Failed to create project:', error);
    throw error;
  }
}

export async function getProjectById(id: string): Promise<Project | null> {
  try {
    const doc = await db.collection('projects').doc(id).get();

    if (!doc.exists) {
      return null;
    }

    return { id: doc.id, ...doc.data() } as Project;
  } catch (error) {
    console.error('[Firestore] Failed to get project:', error);
    return null;
  }
}

export async function getProjectsByUserId(userId: string): Promise<Project[]> {
  try {
    const snapshot = await db.collection('projects')
      .where('userId', '==', userId)
      .orderBy('createdAt', 'desc')
      .get();

    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    } as Project));
  } catch (error) {
    console.error('[Firestore] Failed to get projects:', error);
    return [];
  }
}

export async function updateProject(id: string, data: Partial<InsertProject>): Promise<void> {
  try {
    const updateData = {
      ...data,
      updatedAt: new Date(),
    };

    await db.collection('projects').doc(id).update(updateData);
  } catch (error) {
    console.error('[Firestore] Failed to update project:', error);
    throw error;
  }
}

export async function deleteProject(id: string): Promise<void> {
  try {
    await db.collection('projects').doc(id).delete();
  } catch (error) {
    console.error('[Firestore] Failed to delete project:', error);
    throw error;
  }
}

export async function addConversationToProject(projectId: string, conversationId: string): Promise<void> {
  try {
    await db.collection('projects').doc(projectId).update({
      conversationIds: FieldValue.arrayUnion(conversationId),
      updatedAt: new Date(),
    });
  } catch (error) {
    console.error('[Firestore] Failed to add conversation to project:', error);
    throw error;
  }
}

export async function removeConversationFromProject(projectId: string, conversationId: string): Promise<void> {
  try {
    await db.collection('projects').doc(projectId).update({
      conversationIds: FieldValue.arrayRemove(conversationId),
      updatedAt: new Date(),
    });
  } catch (error) {
    console.error('[Firestore] Failed to remove conversation from project:', error);
    throw error;
  }
}

// ============================================================================
// Prompt Asset Functions
// ============================================================================

export async function createPromptAsset(data: InsertPromptAsset): Promise<string> {
  const now = new Date();
  const assetData: Omit<PromptAsset, 'id'> = {
    userId: data.userId,
    name: data.name,
    description: data.description || null,
    originalQuestion: data.originalQuestion,
    currentVersionId: data.currentVersionId || null,
    versionCount: data.versionCount || 1,
    lastUsedAt: null,
    lastModifiedAt: now,
    successStatus: 0,
    projectId: data.projectId || null,
    createdAt: now,
    updatedAt: now,
  };

  if (isDevModeWithoutFirebase || !db) {
    console.log('[Firestore] Dev mode - storing prompt asset in memory');
    const { nanoid } = await import('nanoid');
    const id = nanoid();
    devMemoryStore.promptAssets.set(id, { id, ...assetData });
    return id;
  }

  try {
    const docRef = await db.collection('promptAssets').add(assetData);
    return docRef.id;
  } catch (error) {
    console.error('[Firestore] Failed to create prompt asset:', error);
    throw error;
  }
}

export async function getPromptAssetById(id: string): Promise<PromptAsset | null> {
  if (isDevModeWithoutFirebase || !db) {
    console.log('[Firestore] Dev mode - retrieving prompt asset from memory');
    return devMemoryStore.promptAssets.get(id) || null;
  }

  try {
    const doc = await db.collection('promptAssets').doc(id).get();

    if (!doc.exists) {
      return null;
    }

    return { id: doc.id, ...doc.data() } as PromptAsset;
  } catch (error) {
    console.error('[Firestore] Failed to get prompt asset:', error);
    return null;
  }
}

export async function createPromptVersion(assetId: string, data: InsertPromptVersion): Promise<string> {
  const now = new Date();
  const versionData: Omit<PromptVersion, 'id'> = {
    userId: data.userId,
    versionNumber: data.versionNumber,
    generatedPrompt: data.generatedPrompt,
    editedPrompt: data.editedPrompt || null,
    intentAnswers: data.intentAnswers || null,
    usedLLM: data.usedLLM || null,
    suggestedServices: data.suggestedServices || null,
    notes: data.notes || null,
    successStatus: data.successStatus || 0,
    createdAt: now,
    updatedAt: now,
  };

  if (isDevModeWithoutFirebase || !db) {
    console.log('[Firestore] Dev mode - storing prompt version in memory');
    const { nanoid } = await import('nanoid');
    const id = nanoid();
    devMemoryStore.promptVersions.set(id, { id, promptAssetId: assetId, ...versionData });

    // Update asset in memory
    const asset = devMemoryStore.promptAssets.get(assetId);
    if (asset) {
      asset.versionCount = (asset.versionCount || 0) + 1;
      asset.currentVersionId = id;
      asset.updatedAt = now;
      devMemoryStore.promptAssets.set(assetId, asset);
    }

    return id;
  }

  try {
    const docRef = await db
      .collection('promptAssets')
      .doc(assetId)
      .collection('versions')
      .add(versionData);

    // Update asset version count
    await db.collection('promptAssets').doc(assetId).update({
      versionCount: FieldValue.increment(1),
      currentVersionId: docRef.id,
      updatedAt: now,
    });

    return docRef.id;
  } catch (error) {
    console.error('[Firestore] Failed to create prompt version:', error);
    throw error;
  }
}

export async function getPromptVersionsByAssetId(assetId: string): Promise<PromptVersion[]> {
  if (isDevModeWithoutFirebase || !db) {
    console.log('[Firestore] Dev mode - retrieving prompt versions from memory');
    const versions = Array.from(devMemoryStore.promptVersions.values())
      .filter(v => v.promptAssetId === assetId)
      .sort((a, b) => b.versionNumber - a.versionNumber);
    return versions;
  }

  try {
    const snapshot = await db
      .collection('promptAssets')
      .doc(assetId)
      .collection('versions')
      .orderBy('versionNumber', 'desc')
      .get();

    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    } as PromptVersion));
  } catch (error) {
    console.error('[Firestore] Failed to get prompt versions:', error);
    return [];
  }
}

// ============================================================================
// Compatibility Aliases (for backward compatibility with old MySQL code)
// ============================================================================

// Rename Conversation functions to match old promptHistory naming
export const createPromptHistory = createConversation;
export const getPromptHistoryById = getConversationById;
export const getPromptHistoryByUserId = getConversationsByUserId;
export const updatePromptHistory = updateConversation;
export const deletePromptHistory = deleteConversation;

// Placeholder functions that don't exist yet but are referenced
export async function getConversationsByProjectId(projectId: string): Promise<Conversation[]> {
  const project = await getProjectById(projectId);
  if (!project) return [];
  
  const conversations: Conversation[] = [];
  for (const convId of project.conversationIds) {
    const conv = await getConversationById(convId);
    if (conv) conversations.push(conv);
  }
  return conversations;
}

export async function getPromptAssetsByUserId(userId: string): Promise<PromptAsset[]> {
  if (isDevModeWithoutFirebase || !db) {
    console.log('[Firestore] Dev mode - retrieving prompt assets from memory');
    const assets = Array.from(devMemoryStore.promptAssets.values())
      .filter(asset => asset.userId === userId)
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
    return assets;
  }

  try {
    const snapshot = await db.collection('promptAssets')
      .where('userId', '==', userId)
      .orderBy('createdAt', 'desc')
      .get();

    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    } as PromptAsset));
  } catch (error) {
    console.error('[Firestore] Failed to get prompt assets:', error);
    return [];
  }
}

export async function updatePromptAsset(id: string, data: Partial<InsertPromptAsset>): Promise<void> {
  if (isDevModeWithoutFirebase || !db) {
    console.log('[Firestore] Dev mode - updating prompt asset in memory');
    const asset = devMemoryStore.promptAssets.get(id);
    if (asset) {
      Object.assign(asset, data, { updatedAt: new Date() });
      devMemoryStore.promptAssets.set(id, asset);
    }
    return;
  }

  try {
    await db.collection('promptAssets').doc(id).update({
      ...data,
      updatedAt: new Date(),
    });
  } catch (error) {
    console.error('[Firestore] Failed to update prompt asset:', error);
    throw error;
  }
}

export async function deletePromptAsset(id: string): Promise<void> {
  if (isDevModeWithoutFirebase || !db) {
    console.log('[Firestore] Dev mode - deleting prompt asset from memory');
    devMemoryStore.promptAssets.delete(id);
    return;
  }

  try {
    await db.collection('promptAssets').doc(id).delete();
  } catch (error) {
    console.error('[Firestore] Failed to delete prompt asset:', error);
    throw error;
  }
}

export async function getPromptVersionById(assetId: string, versionId: string): Promise<PromptVersion | null> {
  try {
    const doc = await db
      .collection('promptAssets')
      .doc(assetId)
      .collection('versions')
      .doc(versionId)
      .get();

    if (!doc.exists) {
      return null;
    }

    return { id: doc.id, ...doc.data() } as PromptVersion;
  } catch (error) {
    console.error('[Firestore] Failed to get prompt version:', error);
    return null;
  }
}

export async function updatePromptVersion(assetId: string, versionId: string, data: Partial<InsertPromptVersion>): Promise<void> {
  if (isDevModeWithoutFirebase || !db) {
    console.log('[Firestore] Dev mode - updating prompt version in memory');
    const version = devMemoryStore.promptVersions.get(versionId);
    if (version) {
      Object.assign(version, data, { updatedAt: new Date() });
      devMemoryStore.promptVersions.set(versionId, version);
    }
    return;
  }

  try {
    await db
      .collection('promptAssets')
      .doc(assetId)
      .collection('versions')
      .doc(versionId)
      .update({
        ...data,
        updatedAt: new Date(),
      });
  } catch (error) {
    console.error('[Firestore] Failed to update prompt version:', error);
    throw error;
  }
}

export async function updatePromptAssetLastUsed(id: string): Promise<void> {
  if (isDevModeWithoutFirebase || !db) {
    console.log('[Firestore] Dev mode - updating last used in memory');
    const asset = devMemoryStore.promptAssets.get(id);
    if (asset) {
      asset.lastUsedAt = new Date();
      asset.updatedAt = new Date();
      devMemoryStore.promptAssets.set(id, asset);
    }
    return;
  }

  try {
    await db.collection('promptAssets').doc(id).update({
      lastUsedAt: new Date(),
      updatedAt: new Date(),
    });
  } catch (error) {
    console.error('[Firestore] Failed to update last used:', error);
    throw error;
  }
}

export async function updatePromptAssetSuccessStatus(id: string, status: number): Promise<void> {
  if (isDevModeWithoutFirebase || !db) {
    console.log('[Firestore] Dev mode - updating success status in memory');
    const asset = devMemoryStore.promptAssets.get(id);
    if (asset) {
      asset.successStatus = status;
      asset.updatedAt = new Date();
      devMemoryStore.promptAssets.set(id, asset);
    }
    return;
  }

  try {
    await db.collection('promptAssets').doc(id).update({
      successStatus: status,
      updatedAt: new Date(),
    });
  } catch (error) {
    console.error('[Firestore] Failed to update success status:', error);
    throw error;
  }
}

// ============================================================================
// Course Functions
// ============================================================================

export async function getAllCourses(): Promise<Course[]> {
  if (isDevModeWithoutFirebase || !db) {
    console.log('[Firestore] Dev mode - getting courses from memory');
    return Array.from(devMemoryStore.courses.values());
  }

  try {
    const snapshot = await db.collection('courses').get();
    return snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt?.toDate() || new Date(),
      updatedAt: doc.data().updatedAt?.toDate() || new Date(),
    })) as Course[];
  } catch (error) {
    console.error('[Firestore] Failed to get courses:', error);
    throw error;
  }
}

export async function getCoursesByDifficulty(difficulty: Difficulty): Promise<Course[]> {
  if (isDevModeWithoutFirebase || !db) {
    console.log('[Firestore] Dev mode - filtering courses from memory');
    return Array.from(devMemoryStore.courses.values()).filter(
      (course) => course.difficulty === difficulty
    );
  }

  try {
    const snapshot = await db
      .collection('courses')
      .where('difficulty', '==', difficulty)
      .get();
    return snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt?.toDate() || new Date(),
      updatedAt: doc.data().updatedAt?.toDate() || new Date(),
    })) as Course[];
  } catch (error) {
    console.error('[Firestore] Failed to get courses by difficulty:', error);
    throw error;
  }
}

export async function getCourseById(courseId: string): Promise<Course | null> {
  if (isDevModeWithoutFirebase || !db) {
    console.log('[Firestore] Dev mode - getting course from memory');
    return devMemoryStore.courses.get(courseId) || null;
  }

  try {
    const doc = await db.collection('courses').doc(courseId).get();
    if (!doc.exists) {
      return null;
    }
    return {
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data()?.createdAt?.toDate() || new Date(),
      updatedAt: doc.data()?.updatedAt?.toDate() || new Date(),
    } as Course;
  } catch (error) {
    console.error('[Firestore] Failed to get course by ID:', error);
    throw error;
  }
}

export async function createCourse(course: Omit<Course, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> {
  const now = new Date();
  const courseData: Omit<Course, 'id'> = {
    ...course,
    createdAt: now,
    updatedAt: now,
  };

  if (isDevModeWithoutFirebase || !db) {
    console.log('[Firestore] Dev mode - creating course in memory');
    const id = `course_${Date.now()}`;
    devMemoryStore.courses.set(id, { id, ...courseData });
    return id;
  }

  try {
    const docRef = await db.collection('courses').add(courseData);
    return docRef.id;
  } catch (error) {
    console.error('[Firestore] Failed to create course:', error);
    throw error;
  }
}

// ============================================================================
// User Course Progress Functions
// ============================================================================

export async function getUserCourseProgress(
  userId: string,
  courseId: string
): Promise<UserCourseProgress | null> {
  if (isDevModeWithoutFirebase || !db) {
    console.log('[Firestore] Dev mode - getting progress from memory');
    const key = `${userId}_${courseId}`;
    return devMemoryStore.userCourseProgress.get(key) || null;
  }

  try {
    const snapshot = await db
      .collection('userCourseProgress')
      .where('userId', '==', userId)
      .where('courseId', '==', courseId)
      .limit(1)
      .get();

    if (snapshot.empty) {
      return null;
    }

    const doc = snapshot.docs[0];
    return {
      ...doc.data(),
      lastAccessedAt: doc.data().lastAccessedAt?.toDate() || new Date(),
    } as UserCourseProgress;
  } catch (error) {
    console.error('[Firestore] Failed to get user course progress:', error);
    throw error;
  }
}

export async function getUserAllCourseProgress(userId: string): Promise<UserCourseProgress[]> {
  if (isDevModeWithoutFirebase || !db) {
    console.log('[Firestore] Dev mode - getting all progress from memory');
    return Array.from(devMemoryStore.userCourseProgress.values()).filter(
      (progress) => progress.userId === userId
    );
  }

  try {
    const snapshot = await db
      .collection('userCourseProgress')
      .where('userId', '==', userId)
      .get();

    return snapshot.docs.map((doc) => ({
      ...doc.data(),
      lastAccessedAt: doc.data().lastAccessedAt?.toDate() || new Date(),
    })) as UserCourseProgress[];
  } catch (error) {
    console.error('[Firestore] Failed to get user all course progress:', error);
    throw error;
  }
}

export async function upsertUserCourseProgress(
  progressData: InsertUserCourseProgress
): Promise<void> {
  const now = new Date();

  if (isDevModeWithoutFirebase || !db) {
    console.log('[Firestore] Dev mode - upserting progress in memory');
    const key = `${progressData.userId}_${progressData.courseId}`;
    const existing = devMemoryStore.userCourseProgress.get(key);

    const updated: UserCourseProgress = {
      userId: progressData.userId,
      courseId: progressData.courseId,
      completedLessons: progressData.completedLessons || existing?.completedLessons || [],
      quizScores: progressData.quizScores || existing?.quizScores || {},
      completionRate: 0, // Will be calculated
      lastAccessedAt: now,
      currentModuleId: progressData.currentModuleId || existing?.currentModuleId,
      currentLessonId: progressData.currentLessonId || existing?.currentLessonId,
    };

    devMemoryStore.userCourseProgress.set(key, updated);
    return;
  }

  try {
    const snapshot = await db
      .collection('userCourseProgress')
      .where('userId', '==', progressData.userId)
      .where('courseId', '==', progressData.courseId)
      .limit(1)
      .get();

    const data = {
      ...progressData,
      lastAccessedAt: now,
    };

    if (snapshot.empty) {
      // Create new
      await db.collection('userCourseProgress').add({
        ...data,
        completedLessons: data.completedLessons || [],
        quizScores: data.quizScores || {},
        completionRate: 0,
      });
    } else {
      // Update existing
      await snapshot.docs[0].ref.update(data);
    }
  } catch (error) {
    console.error('[Firestore] Failed to upsert user course progress:', error);
    throw error;
  }
}

export async function completeLesson(
  userId: string,
  courseId: string,
  lessonId: string
): Promise<void> {
  if (isDevModeWithoutFirebase || !db) {
    console.log('[Firestore] Dev mode - completing lesson in memory');
    const key = `${userId}_${courseId}`;
    const progress = devMemoryStore.userCourseProgress.get(key);

    if (progress) {
      if (!progress.completedLessons.includes(lessonId)) {
        progress.completedLessons.push(lessonId);
      }
      progress.lastAccessedAt = new Date();
      devMemoryStore.userCourseProgress.set(key, progress);
    }
    return;
  }

  try {
    const snapshot = await db
      .collection('userCourseProgress')
      .where('userId', '==', userId)
      .where('courseId', '==', courseId)
      .limit(1)
      .get();

    if (snapshot.empty) {
      // Create new progress
      await db.collection('userCourseProgress').add({
        userId,
        courseId,
        completedLessons: [lessonId],
        quizScores: {},
        completionRate: 0,
        lastAccessedAt: new Date(),
      });
    } else {
      // Update existing
      const doc = snapshot.docs[0];
      const currentLessons = doc.data().completedLessons || [];
      if (!currentLessons.includes(lessonId)) {
        await doc.ref.update({
          completedLessons: FieldValue.arrayUnion(lessonId),
          lastAccessedAt: new Date(),
        });
      }
    }
  } catch (error) {
    console.error('[Firestore] Failed to complete lesson:', error);
    throw error;
  }
}

export async function updateQuizScore(
  userId: string,
  courseId: string,
  lessonId: string,
  score: number
): Promise<void> {
  if (isDevModeWithoutFirebase || !db) {
    console.log('[Firestore] Dev mode - updating quiz score in memory');
    const key = `${userId}_${courseId}`;
    const progress = devMemoryStore.userCourseProgress.get(key);

    if (progress) {
      progress.quizScores[lessonId] = score;
      progress.lastAccessedAt = new Date();
      devMemoryStore.userCourseProgress.set(key, progress);
    }
    return;
  }

  try {
    const snapshot = await db
      .collection('userCourseProgress')
      .where('userId', '==', userId)
      .where('courseId', '==', courseId)
      .limit(1)
      .get();

    if (snapshot.empty) {
      // Create new progress
      await db.collection('userCourseProgress').add({
        userId,
        courseId,
        completedLessons: [],
        quizScores: { [lessonId]: score },
        completionRate: 0,
        lastAccessedAt: new Date(),
      });
    } else {
      // Update existing
      const doc = snapshot.docs[0];
      await doc.ref.update({
        [`quizScores.${lessonId}`]: score,
        lastAccessedAt: new Date(),
      });
    }
  } catch (error) {
    console.error('[Firestore] Failed to update quiz score:', error);
    throw error;
  }
}

// ============================================================================
// Chain Functions
// ============================================================================

export interface PromptChain {
  id: string;
  userId: string;
  name: string;
  description: string;
  category: string;
  steps: any[];
  totalEstimatedCost: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface StepResult {
  stepId: string;
  output: string;
  tokensUsed: number;
  cost: number;
  duration: number;
  success: boolean;
  error?: string;
  executedAt: Date;
}

export interface ChainExecution {
  id: string;
  chainId: string;
  userId: string;
  status: string;
  currentStepIndex: number;
  stepResults: StepResult[];
  initialInput?: string;
  startedAt: Date;
  completedAt?: Date;
  totalCost: number;
  totalDuration: number;
  error?: string;
}

export interface ChainStep {
  id: string;
  order: number;
  name: string;
  promptTemplate: string;
  modelId: string;
  usePreviousOutput: boolean;
  estimatedCost: number;
  description?: string;
}

export interface ChainTemplate {
  id: string;
  name: string;
  description: string;
  category: string;
  steps: Omit<ChainStep, 'id'>[];
  isOfficial: boolean;
  usageCount: number;
  tags: string[];
  estimatedTime: number;
  createdAt: Date;
}

export async function createChain(chainData: Omit<PromptChain, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> {
  const now = new Date();
  const chain: Omit<PromptChain, 'id'> = {
    ...chainData,
    createdAt: now,
    updatedAt: now,
  };

  if (isDevModeWithoutFirebase || !db) {
    console.log('[Firestore] Dev mode - creating chain in memory');
    const id = `chain_${Date.now()}`;
    devMemoryStore.chains.set(id, { id, ...chain });
    return id;
  }

  try {
    const docRef = await db.collection('chains').add(chain);
    return docRef.id;
  } catch (error) {
    console.error('[Firestore] Failed to create chain:', error);
    throw error;
  }
}

export async function getChainsByUserId(userId: string): Promise<PromptChain[]> {
  if (isDevModeWithoutFirebase || !db) {
    console.log('[Firestore] Dev mode - getting chains from memory');
    return Array.from(devMemoryStore.chains.values()).filter(
      (chain: any) => chain.userId === userId
    );
  }

  try {
    const snapshot = await db
      .collection('chains')
      .where('userId', '==', userId)
      .orderBy('createdAt', 'desc')
      .get();

    return snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt?.toDate() || new Date(),
      updatedAt: doc.data().updatedAt?.toDate() || new Date(),
    })) as PromptChain[];
  } catch (error) {
    console.error('[Firestore] Failed to get chains:', error);
    throw error;
  }
}

export async function getChainById(chainId: string): Promise<PromptChain | null> {
  if (isDevModeWithoutFirebase || !db) {
    console.log('[Firestore] Dev mode - getting chain from memory');
    return devMemoryStore.chains.get(chainId) || null;
  }

  try {
    const doc = await db.collection('chains').doc(chainId).get();
    if (!doc.exists) {
      return null;
    }

    return {
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data()?.createdAt?.toDate() || new Date(),
      updatedAt: doc.data()?.updatedAt?.toDate() || new Date(),
    } as PromptChain;
  } catch (error) {
    console.error('[Firestore] Failed to get chain:', error);
    throw error;
  }
}

export async function updateChain(
  chainId: string,
  updates: Partial<Omit<PromptChain, 'id' | 'userId' | 'createdAt'>>
): Promise<void> {
  const now = new Date();

  if (isDevModeWithoutFirebase || !db) {
    console.log('[Firestore] Dev mode - updating chain in memory');
    const chain = devMemoryStore.chains.get(chainId);
    if (chain) {
      devMemoryStore.chains.set(chainId, {
        ...chain,
        ...updates,
        updatedAt: now,
      });
    }
    return;
  }

  try {
    await db.collection('chains').doc(chainId).update({
      ...updates,
      updatedAt: now,
    });
  } catch (error) {
    console.error('[Firestore] Failed to update chain:', error);
    throw error;
  }
}

export async function deleteChain(chainId: string): Promise<void> {
  if (isDevModeWithoutFirebase || !db) {
    console.log('[Firestore] Dev mode - deleting chain from memory');
    devMemoryStore.chains.delete(chainId);
    return;
  }

  try {
    await db.collection('chains').doc(chainId).delete();
  } catch (error) {
    console.error('[Firestore] Failed to delete chain:', error);
    throw error;
  }
}

// ============================================================================
// Chain Execution Functions
// ============================================================================

export async function createChainExecution(
  executionData: Omit<ChainExecution, 'id'>
): Promise<string> {
  if (isDevModeWithoutFirebase || !db) {
    console.log('[Firestore] Dev mode - creating execution in memory');
    const id = `exec_${Date.now()}`;
    devMemoryStore.chainExecutions.set(id, { id, ...executionData });
    return id;
  }

  try {
    const docRef = await db.collection('chainExecutions').add(executionData);
    return docRef.id;
  } catch (error) {
    console.error('[Firestore] Failed to create execution:', error);
    throw error;
  }
}

export async function getChainExecution(executionId: string): Promise<ChainExecution | null> {
  if (isDevModeWithoutFirebase || !db) {
    console.log('[Firestore] Dev mode - getting execution from memory');
    return devMemoryStore.chainExecutions.get(executionId) || null;
  }

  try {
    const doc = await db.collection('chainExecutions').doc(executionId).get();
    if (!doc.exists) {
      return null;
    }

    return {
      id: doc.id,
      ...doc.data(),
      startedAt: doc.data()?.startedAt?.toDate() || new Date(),
      completedAt: doc.data()?.completedAt?.toDate(),
    } as ChainExecution;
  } catch (error) {
    console.error('[Firestore] Failed to get execution:', error);
    throw error;
  }
}

export async function updateChainExecution(
  executionId: string,
  updates: Partial<Omit<ChainExecution, 'id' | 'chainId' | 'userId' | 'startedAt'>>
): Promise<void> {
  if (isDevModeWithoutFirebase || !db) {
    console.log('[Firestore] Dev mode - updating execution in memory');
    const execution = devMemoryStore.chainExecutions.get(executionId);
    if (execution) {
      devMemoryStore.chainExecutions.set(executionId, {
        ...execution,
        ...updates,
      });
    }
    return;
  }

  try {
    await db.collection('chainExecutions').doc(executionId).update(updates);
  } catch (error) {
    console.error('[Firestore] Failed to update execution:', error);
    throw error;
  }
}

// ============================================================================
// Chain Template Functions
// ============================================================================

export async function getAllChainTemplates(): Promise<ChainTemplate[]> {
  if (isDevModeWithoutFirebase || !db) {
    console.log('[Firestore] Dev mode - getting templates from memory');
    return Array.from(devMemoryStore.chainTemplates.values());
  }

  try {
    const snapshot = await db
      .collection('chainTemplates')
      .orderBy('usageCount', 'desc')
      .get();

    return snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt?.toDate() || new Date(),
    })) as ChainTemplate[];
  } catch (error) {
    console.error('[Firestore] Failed to get templates:', error);
    throw error;
  }
}

export async function getChainTemplateById(templateId: string): Promise<ChainTemplate | null> {
  if (isDevModeWithoutFirebase || !db) {
    console.log('[Firestore] Dev mode - getting template from memory');
    return devMemoryStore.chainTemplates.get(templateId) || null;
  }

  try {
    const doc = await db.collection('chainTemplates').doc(templateId).get();
    if (!doc.exists) {
      return null;
    }

    return {
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data()?.createdAt?.toDate() || new Date(),
    } as ChainTemplate;
  } catch (error) {
    console.error('[Firestore] Failed to get template:', error);
    throw error;
  }
}

export async function incrementChainTemplateUsage(templateId: string): Promise<void> {
  if (isDevModeWithoutFirebase || !db) {
    console.log('[Firestore] Dev mode - incrementing chain template usage in memory');
    const template = devMemoryStore.chainTemplates.get(templateId);
    if (template) {
      template.usageCount = (template.usageCount || 0) + 1;
      devMemoryStore.chainTemplates.set(templateId, template);
    }
    return;
  }

  try {
    await db.collection('chainTemplates').doc(templateId).update({
      usageCount: FieldValue.increment(1),
    });
  } catch (error) {
    console.error('[Firestore] Failed to increment usage:', error);
    throw error;
  }
}

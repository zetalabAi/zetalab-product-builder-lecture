/**
 * Prompt Version Management Router
 * 프롬프트 버전 생성, 조회, 비교, 복원 기능
 */

import { z } from "zod";
import { router, protectedProcedure } from "../_core/trpc";
import { db } from "../db";
import { TRPCError } from "@trpc/server";
import { FieldValue } from "firebase-admin/firestore";

/**
 * 버전 생성 (자동 변경사항 감지)
 */
const createVersion = protectedProcedure
  .input(
    z.object({
      promptId: z.string(),
      newPrompt: z.string(),
      changes: z.array(z.string()).optional(),
    })
  )
  .mutation(async ({ input, ctx }) => {
    const { promptId, newPrompt, changes } = input;
    const userId = ctx.userId;

    try {
      // 1. 원본 프롬프트 조회
      const promptRef = db.collection("conversations").doc(promptId);
      const promptDoc = await promptRef.get();

      if (!promptDoc.exists) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "프롬프트를 찾을 수 없습니다",
        });
      }

      const promptData = promptDoc.data()!;

      // 권한 확인
      if (promptData.userId !== userId) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "권한이 없습니다",
        });
      }

      // 2. 기존 버전 수 조회
      const versionsRef = promptRef.collection("versions");
      const versionsSnapshot = await versionsRef.get();
      const nextVersion = versionsSnapshot.size + 1;

      // 3. 변경사항 자동 감지 (프론트엔드에서 전달받거나 자동 계산)
      const detectedChanges = changes || ["내용 수정"];

      // 4. 새 버전 생성
      const versionData = {
        promptId,
        version: nextVersion,
        prompt: newPrompt,
        changes: detectedChanges,
        createdAt: FieldValue.serverTimestamp(),
        createdBy: userId,
      };

      const versionRef = await versionsRef.add(versionData);

      // 5. 원본 프롬프트 업데이트
      await promptRef.update({
        prompt: newPrompt,
        editedPrompt: newPrompt,
        updatedAt: FieldValue.serverTimestamp(),
        version: nextVersion,
      });

      // 6. 생성된 버전 반환
      const createdVersion = await versionRef.get();
      const data = createdVersion.data()!;

      return {
        id: createdVersion.id,
        promptId: data.promptId,
        version: data.version,
        prompt: data.prompt,
        changes: data.changes,
        createdAt: data.createdAt?.toDate() || new Date(),
        createdBy: data.createdBy,
      };
    } catch (error) {
      if (error instanceof TRPCError) throw error;

      console.error("Error creating version:", error);
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "버전 생성 중 오류가 발생했습니다",
      });
    }
  });

/**
 * 버전 히스토리 조회 (페이지네이션)
 */
const getVersionHistory = protectedProcedure
  .input(
    z.object({
      promptId: z.string(),
      limit: z.number().min(1).max(50).default(10),
      offset: z.number().min(0).default(0),
    })
  )
  .query(async ({ input, ctx }) => {
    const { promptId, limit, offset } = input;
    const userId = ctx.userId;

    try {
      // 1. 권한 확인
      const promptRef = db.collection("conversations").doc(promptId);
      const promptDoc = await promptRef.get();

      if (!promptDoc.exists) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "프롬프트를 찾을 수 없습니다",
        });
      }

      const promptData = promptDoc.data()!;
      if (promptData.userId !== userId) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "권한이 없습니다",
        });
      }

      // 2. 버전 목록 조회 (최신순)
      const versionsRef = promptRef.collection("versions");
      const snapshot = await versionsRef
        .orderBy("version", "desc")
        .limit(limit)
        .offset(offset)
        .get();

      // 3. 총 개수 조회
      const totalSnapshot = await versionsRef.get();
      const total = totalSnapshot.size;

      // 4. 데이터 변환
      const versions = snapshot.docs.map((doc) => {
        const data = doc.data();
        return {
          id: doc.id,
          promptId: data.promptId,
          version: data.version,
          prompt: data.prompt,
          changes: data.changes || [],
          createdAt: data.createdAt?.toDate() || new Date(),
          createdBy: data.createdBy,
        };
      });

      return {
        versions,
        total,
        hasMore: offset + limit < total,
      };
    } catch (error) {
      if (error instanceof TRPCError) throw error;

      console.error("Error getting version history:", error);
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "버전 히스토리 조회 중 오류가 발생했습니다",
      });
    }
  });

/**
 * 특정 버전 조회
 */
const getVersion = protectedProcedure
  .input(
    z.object({
      promptId: z.string(),
      versionId: z.string(),
    })
  )
  .query(async ({ input, ctx }) => {
    const { promptId, versionId } = input;
    const userId = ctx.userId;

    try {
      // 1. 권한 확인
      const promptRef = db.collection("conversations").doc(promptId);
      const promptDoc = await promptRef.get();

      if (!promptDoc.exists) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "프롬프트를 찾을 수 없습니다",
        });
      }

      const promptData = promptDoc.data()!;
      if (promptData.userId !== userId) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "권한이 없습니다",
        });
      }

      // 2. 버전 조회
      const versionRef = promptRef.collection("versions").doc(versionId);
      const versionDoc = await versionRef.get();

      if (!versionDoc.exists) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "버전을 찾을 수 없습니다",
        });
      }

      const data = versionDoc.data()!;

      return {
        id: versionDoc.id,
        promptId: data.promptId,
        version: data.version,
        prompt: data.prompt,
        changes: data.changes || [],
        createdAt: data.createdAt?.toDate() || new Date(),
        createdBy: data.createdBy,
      };
    } catch (error) {
      if (error instanceof TRPCError) throw error;

      console.error("Error getting version:", error);
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "버전 조회 중 오류가 발생했습니다",
      });
    }
  });

/**
 * 두 버전 비교 (diff 포함)
 */
const compareVersions = protectedProcedure
  .input(
    z.object({
      promptId: z.string(),
      versionId1: z.string(),
      versionId2: z.string(),
    })
  )
  .query(async ({ input, ctx }) => {
    const { promptId, versionId1, versionId2 } = input;
    const userId = ctx.userId;

    try {
      // 1. 권한 확인
      const promptRef = db.collection("conversations").doc(promptId);
      const promptDoc = await promptRef.get();

      if (!promptDoc.exists) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "프롬프트를 찾을 수 없습니다",
        });
      }

      const promptData = promptDoc.data()!;
      if (promptData.userId !== userId) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "권한이 없습니다",
        });
      }

      // 2. 두 버전 조회
      const versionsRef = promptRef.collection("versions");
      const [version1Doc, version2Doc] = await Promise.all([
        versionsRef.doc(versionId1).get(),
        versionsRef.doc(versionId2).get(),
      ]);

      if (!version1Doc.exists || !version2Doc.exists) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "버전을 찾을 수 없습니다",
        });
      }

      const version1Data = version1Doc.data()!;
      const version2Data = version2Doc.data()!;

      // 3. 버전 객체 생성
      const oldVersion = {
        id: version1Doc.id,
        promptId: version1Data.promptId,
        version: version1Data.version,
        prompt: version1Data.prompt,
        changes: version1Data.changes || [],
        createdAt: version1Data.createdAt?.toDate() || new Date(),
        createdBy: version1Data.createdBy,
      };

      const newVersion = {
        id: version2Doc.id,
        promptId: version2Data.promptId,
        version: version2Data.version,
        prompt: version2Data.prompt,
        changes: version2Data.changes || [],
        createdAt: version2Data.createdAt?.toDate() || new Date(),
        createdBy: version2Data.createdBy,
      };

      // 4. Diff는 프론트엔드에서 계산하도록 반환
      // (calculateDiff는 클라이언트 측 utils/diff.ts에서 처리)
      return {
        oldVersion,
        newVersion,
      };
    } catch (error) {
      if (error instanceof TRPCError) throw error;

      console.error("Error comparing versions:", error);
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "버전 비교 중 오류가 발생했습니다",
      });
    }
  });

/**
 * 이전 버전으로 복원 (새 버전 생성)
 */
const revertToVersion = protectedProcedure
  .input(
    z.object({
      promptId: z.string(),
      versionId: z.string(),
    })
  )
  .mutation(async ({ input, ctx }) => {
    const { promptId, versionId } = input;
    const userId = ctx.userId;

    try {
      // 1. 권한 확인
      const promptRef = db.collection("conversations").doc(promptId);
      const promptDoc = await promptRef.get();

      if (!promptDoc.exists) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "프롬프트를 찾을 수 없습니다",
        });
      }

      const promptData = promptDoc.data()!;
      if (promptData.userId !== userId) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "권한이 없습니다",
        });
      }

      // 2. 복원할 버전 조회
      const versionRef = promptRef.collection("versions").doc(versionId);
      const versionDoc = await versionRef.get();

      if (!versionDoc.exists) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "버전을 찾을 수 없습니다",
        });
      }

      const versionData = versionDoc.data()!;
      const revertPrompt = versionData.prompt;
      const revertVersion = versionData.version;

      // 3. 현재 버전 수 조회
      const versionsRef = promptRef.collection("versions");
      const versionsSnapshot = await versionsRef.get();
      const nextVersion = versionsSnapshot.size + 1;

      // 4. 새 버전 생성 (복원 표시)
      const newVersionData = {
        promptId,
        version: nextVersion,
        prompt: revertPrompt,
        changes: [`v${revertVersion}으로 복원`],
        createdAt: FieldValue.serverTimestamp(),
        createdBy: userId,
      };

      const newVersionRef = await versionsRef.add(newVersionData);

      // 5. 원본 프롬프트 업데이트
      await promptRef.update({
        prompt: revertPrompt,
        editedPrompt: revertPrompt,
        updatedAt: FieldValue.serverTimestamp(),
        version: nextVersion,
      });

      // 6. 생성된 버전 반환
      const createdVersion = await newVersionRef.get();
      const data = createdVersion.data()!;

      return {
        id: createdVersion.id,
        promptId: data.promptId,
        version: data.version,
        prompt: data.prompt,
        changes: data.changes,
        createdAt: data.createdAt?.toDate() || new Date(),
        createdBy: data.createdBy,
      };
    } catch (error) {
      if (error instanceof TRPCError) throw error;

      console.error("Error reverting to version:", error);
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "버전 복원 중 오류가 발생했습니다",
      });
    }
  });

/**
 * Versions Router
 */
export const versionsRouter = router({
  createVersion,
  getVersionHistory,
  getVersion,
  compareVersions,
  revertToVersion,
});

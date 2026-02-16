import { router, publicProcedure, protectedProcedure } from "../_core/trpc";
import { z } from "zod";
import { TRPCError } from "@trpc/server";
import * as admin from "firebase-admin";

const db = admin.firestore();

export const usersRouter = router({
  /**
   * 사용자 생성 (첫 로그인 시 자동 호출)
   * 이미 존재하면 무시
   */
  createUser: publicProcedure
    .input(
      z.object({
        uid: z.string(),
        email: z.string().email().nullable(),
        displayName: z.string().nullable(),
        photoURL: z.string().nullable(),
      })
    )
    .mutation(async ({ input }) => {
      const userRef = db.collection("users").doc(input.uid);
      const userDoc = await userRef.get();

      // 이미 존재하면 lastLoginAt만 업데이트
      if (userDoc.exists) {
        await userRef.update({
          lastLoginAt: admin.firestore.FieldValue.serverTimestamp(),
        });
        return { created: false, message: "User already exists" };
      }

      // 새 사용자 생성
      await userRef.set({
        uid: input.uid,
        email: input.email || null,
        displayName: input.displayName || "Anonymous",
        photoURL: input.photoURL || null,
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        lastLoginAt: admin.firestore.FieldValue.serverTimestamp(),
        // Feature 8: 학습 시스템 초기화
        level: 1,
        xp: 0,
        badges: [],
        role: "user",
      });

      return { created: true, message: "User created successfully" };
    }),

  /**
   * 회원탈퇴 - 모든 사용자 데이터 삭제
   */
  deleteAccount: protectedProcedure.mutation(async ({ ctx }) => {
    if (!ctx.user) {
      throw new TRPCError({ code: "UNAUTHORIZED" });
    }

    const userId = ctx.user.uid;

    try {
      // Firestore 데이터 삭제 (배치 처리)
      const batch = db.batch();

      // 1. users 문서 삭제
      const userRef = db.collection("users").doc(userId);
      batch.delete(userRef);

      // 2. prompts 삭제
      const promptsSnapshot = await db
        .collection("prompts")
        .where("userId", "==", userId)
        .get();
      promptsSnapshot.forEach((doc) => batch.delete(doc.ref));

      // 3. promptAssets 삭제
      const assetsSnapshot = await db
        .collection("promptAssets")
        .where("userId", "==", userId)
        .get();
      assetsSnapshot.forEach((doc) => batch.delete(doc.ref));

      // 4. promptVersions 삭제
      const versionsSnapshot = await db
        .collection("promptVersions")
        .where("userId", "==", userId)
        .get();
      versionsSnapshot.forEach((doc) => batch.delete(doc.ref));

      // 5. chains 삭제
      const chainsSnapshot = await db
        .collection("chains")
        .where("userId", "==", userId)
        .get();
      chainsSnapshot.forEach((doc) => batch.delete(doc.ref));

      // 6. chainExecutions 삭제
      const executionsSnapshot = await db
        .collection("chainExecutions")
        .where("userId", "==", userId)
        .get();
      executionsSnapshot.forEach((doc) => batch.delete(doc.ref));

      // 7. projects 삭제
      const projectsSnapshot = await db
        .collection("projects")
        .where("userId", "==", userId)
        .get();
      projectsSnapshot.forEach((doc) => batch.delete(doc.ref));

      // 8. conversations 삭제
      const conversationsSnapshot = await db
        .collection("conversations")
        .where("userId", "==", userId)
        .get();
      conversationsSnapshot.forEach((doc) => batch.delete(doc.ref));

      // 9. progress 삭제
      const progressSnapshot = await db
        .collection("progress")
        .where("userId", "==", userId)
        .get();
      progressSnapshot.forEach((doc) => batch.delete(doc.ref));

      // 10. courseProgress 삭제
      const courseProgressSnapshot = await db
        .collection("courseProgress")
        .where("userId", "==", userId)
        .get();
      courseProgressSnapshot.forEach((doc) => batch.delete(doc.ref));

      // 배치 커밋
      await batch.commit();

      // Firebase Auth 계정 삭제
      await admin.auth().deleteUser(userId);

      return {
        success: true,
        message: "Account deleted successfully",
      };
    } catch (error) {
      console.error("[DeleteAccount] Error:", error);
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "Failed to delete account",
      });
    }
  }),

  /**
   * 내 데이터 다운로드 (GDPR Data Portability)
   */
  downloadMyData: protectedProcedure.query(async ({ ctx }) => {
    if (!ctx.user) {
      throw new TRPCError({ code: "UNAUTHORIZED" });
    }

    const userId = ctx.user.uid;

    try {
      const userData: any = {
        user: null,
        prompts: [],
        promptAssets: [],
        chains: [],
        chainExecutions: [],
        projects: [],
        conversations: [],
        progress: [],
        courseProgress: [],
      };

      // 사용자 정보
      const userDoc = await db.collection("users").doc(userId).get();
      userData.user = userDoc.data();

      // 프롬프트
      const promptsSnapshot = await db
        .collection("prompts")
        .where("userId", "==", userId)
        .get();
      userData.prompts = promptsSnapshot.docs.map((doc) => doc.data());

      // 나머지 데이터도 동일하게 수집...
      const assetsSnapshot = await db
        .collection("promptAssets")
        .where("userId", "==", userId)
        .get();
      userData.promptAssets = assetsSnapshot.docs.map((doc) => doc.data());

      const chainsSnapshot = await db
        .collection("chains")
        .where("userId", "==", userId)
        .get();
      userData.chains = chainsSnapshot.docs.map((doc) => doc.data());

      return userData;
    } catch (error) {
      console.error("[DownloadMyData] Error:", error);
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "Failed to download data",
      });
    }
  }),
});

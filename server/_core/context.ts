import type { CreateExpressContextOptions } from "@trpc/server/adapters/express";
import type { User } from "../db";
import { verifyFirebaseSession } from "./firebase-auth";
import { getUserByUid } from "../db";
import { COOKIE_NAME } from "@shared/const";
import crypto from "crypto";

// AuthTrace 진단 로깅 (환경 변수로 제어)
const AUTH_TRACE_ENABLED = process.env.AUTH_TRACE === "true";

function authTrace(label: string, data: any) {
  if (AUTH_TRACE_ENABLED) {
    console.log(`[AuthTrace] ${label}:`, data);
  }
}

export type TrpcContext = {
  req: CreateExpressContextOptions["req"];
  res: CreateExpressContextOptions["res"];
  user: User | null;
};

// 개발 모드 메모리 사용자 (Firestore 없이 작동)
let devMockUser: User | null = null;

export async function createContext(
  opts: CreateExpressContextOptions
): Promise<TrpcContext> {
  let user: User | null = null;

  // 개발 모드: 자동 로그인 (Firebase 프로젝트 없이 테스트 가능)
  if (process.env.NODE_ENV === "development" && process.env.DEV_AUTO_LOGIN === "true") {
    // 메모리에 테스트 사용자 생성 (Firestore 사용 안 함)
    if (!devMockUser) {
      devMockUser = {
        id: 1,
        uid: "dev-test-user",
        openId: "dev-test-user",
        name: "개발 테스트 사용자",
        email: "dev@test.com",
        loginMethod: "development",
        role: "user" as const,
        manusLinked: 0,
        createdAt: new Date(),
        updatedAt: new Date(),
        lastSignedIn: new Date()
      };
      authTrace("dev auto login - mock user created", { user: devMockUser });
    }

    user = devMockUser;

    return {
      req: opts.req,
      res: opts.res,
      user,
    };
  }

  try {
    // Verify Firebase session cookie
    const decodedClaims = await verifyFirebaseSession(opts.req);

    if (decodedClaims) {
      // Get user from Firestore
      user = await getUserByUid(decodedClaims.uid);
    }
  } catch (error) {
    // Authentication is optional for public procedures.
    authTrace("auth error", { error: error instanceof Error ? error.message : String(error) });
    user = null;
  }

  // AuthTrace: 세션 체크 (경로가 /api/trpc/auth.me일 때만)
  if (opts.req.path?.includes("auth.me")) {
    const cookieNames = Object.keys(opts.req.cookies || {});
    const sessionCookie = opts.req.cookies?.[COOKIE_NAME];
    const sessionIdHash = sessionCookie
      ? crypto.createHash("sha256").update(sessionCookie).digest("hex").substring(0, 8)
      : null;

    authTrace("session check", {
      ip: opts.req.ip || opts.req.socket.remoteAddress,
      userAgent: opts.req.headers["user-agent"],
      cookieNames,
      sessionIdHash,
      userIdOrNull: user ? user.uid : null
    });
  }

  return {
    req: opts.req,
    res: opts.res,
    user,
  };
}

import type { CreateExpressContextOptions } from "@trpc/server/adapters/express";
import type { User } from "../db-firestore";
import { verifyFirebaseSession } from "./firebase-auth";
import { getUserByUid } from "../db-firestore";
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

export async function createContext(
  opts: CreateExpressContextOptions
): Promise<TrpcContext> {
  let user: User | null = null;

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

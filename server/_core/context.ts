import type { CreateExpressContextOptions } from "@trpc/server/adapters/express";
import type { User } from "../../drizzle/schema";
import { sdk } from "./sdk";
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
    user = await sdk.authenticateRequest(opts.req);
  } catch (error) {
    // Authentication is optional for public procedures.
    user = null;
  }

  // AuthTrace: 세션 체크 (경로가 /api/trpc/auth.me일 때만)
  if (opts.req.path?.includes("auth.me")) {
    const cookieNames = Object.keys(opts.req.cookies || {});
    const sessionCookie = opts.req.cookies?.["manus-session"];
    const sessionIdHash = sessionCookie 
      ? crypto.createHash("sha256").update(sessionCookie).digest("hex").substring(0, 8)
      : null;

    authTrace("session check", {
      ip: opts.req.ip || opts.req.socket.remoteAddress,
      userAgent: opts.req.headers["user-agent"],
      cookieNames,
      sessionIdHash,
      userIdOrNull: user ? user.id : null
    });
  }

  return {
    req: opts.req,
    res: opts.res,
    user,
  };
}

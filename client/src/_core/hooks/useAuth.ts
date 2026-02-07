import { getLoginUrl } from "@/const";
import { trpc } from "@/lib/trpc";
import { TRPCClientError } from "@trpc/client";
import { useCallback, useEffect, useMemo } from "react";

type UseAuthOptions = {
  redirectOnUnauthenticated?: boolean;
  redirectPath?: string;
};

// AuthTrace 진단 로깅 (환경 변수로 제어)
const AUTH_TRACE_ENABLED = import.meta.env.VITE_AUTH_TRACE === "true";

function authTrace(label: string, data: any) {
  if (AUTH_TRACE_ENABLED) {
    console.log(`[AuthTrace] ${label}:`, data);
  }
}

// authStatus 3상태: "unknown" | "guest" | "authed"
export type AuthStatus = "unknown" | "guest" | "authed";

export function useAuth(options?: UseAuthOptions) {
  const { redirectOnUnauthenticated = false, redirectPath = getLoginUrl() } =
    options ?? {};
  const utils = trpc.useUtils();

  const meQuery = trpc.auth.me.useQuery(undefined, {
    retry: false,
    refetchOnWindowFocus: false,
  });

  // AuthTrace: 세션 체크 응답
  useEffect(() => {
    if (meQuery.isFetched) {
      authTrace("session check response", {
        status: meQuery.status,
        hasUser: Boolean(meQuery.data),
        user: meQuery.data ? { id: meQuery.data.id, name: meQuery.data.name } : null
      });
    }
  }, [meQuery.isFetched, meQuery.status, meQuery.data]);

  const logoutMutation = trpc.auth.logout.useMutation({
    onSuccess: () => {
      utils.auth.me.setData(undefined, null);
    },
  });

  const logout = useCallback(async () => {
    try {
      await logoutMutation.mutateAsync();
    } catch (error: unknown) {
      if (
        error instanceof TRPCClientError &&
        error.data?.code === "UNAUTHORIZED"
      ) {
        // Already logged out, just clear state
        utils.auth.me.setData(undefined, null);
        return;
      }
      throw error;
    } finally {
      utils.auth.me.setData(undefined, null);
      await utils.auth.me.invalidate();
      // Stay on current page after logout (no redirect)
    }
  }, [logoutMutation, utils]);

  const state = useMemo(() => {
    // authStatus 3상태 강제
    let authStatus: AuthStatus;
    if (meQuery.isLoading) {
      authStatus = "unknown";
    } else if (meQuery.data) {
      authStatus = "authed";
    } else {
      authStatus = "guest";
    }

    const result = {
      user: meQuery.data ?? null,
      loading: meQuery.isLoading || logoutMutation.isPending,
      error: meQuery.error ?? logoutMutation.error ?? null,
      isAuthenticated: authStatus === "authed",
      authStatus,
    };

    // AuthTrace: authState 변경
    authTrace("authState", {
      authStatus: result.authStatus,
      user: result.user ? { id: result.user.id, name: result.user.name } : null,
      loading: result.loading
    });

    return result;
  }, [
    meQuery.data,
    meQuery.error,
    meQuery.isLoading,
    logoutMutation.error,
    logoutMutation.isPending,
  ]);

  useEffect(() => {
    if (!redirectOnUnauthenticated) return;
    if (meQuery.isLoading || logoutMutation.isPending) return;
    if (state.user) return;
    if (typeof window === "undefined") return;
    if (window.location.pathname === redirectPath) return;

    window.location.href = redirectPath;
  }, [
    redirectOnUnauthenticated,
    redirectPath,
    logoutMutation.isPending,
    meQuery.isLoading,
    state.user,
  ]);

  return {
    ...state,
    refresh: () => meQuery.refetch(),
    logout,
  };
}

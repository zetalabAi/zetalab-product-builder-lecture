import { trpc } from "@/lib/trpc";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { httpBatchLink } from "@trpc/client";
import { createRoot } from "react-dom/client";
import superjson from "superjson";
import App from "./App";
import "./index.css";

// localStorage 정리: 오래된 사용자 정보 삭제
if (typeof window !== "undefined") {
  const keysToRemove = [
    "manus-runtime-user-info",
    "user",
    "auth-user",
    "currentUser"
  ];
  keysToRemove.forEach(key => {
    if (localStorage.getItem(key)) {
      localStorage.removeItem(key);
      console.log(`[Auth Cleanup] Removed localStorage key: ${key}`);
    }
  });
}

const queryClient = new QueryClient();

// 전역 로그인 리다이렉션 제거 - 홈은 Public
// 에러 로깅만 유지
queryClient.getQueryCache().subscribe(event => {
  if (event.type === "updated" && event.action.type === "error") {
    const error = event.query.state.error;
    console.error("[API Query Error]", error);
  }
});

queryClient.getMutationCache().subscribe(event => {
  if (event.type === "updated" && event.action.type === "error") {
    const error = event.mutation.state.error;
    console.error("[API Mutation Error]", error);
  }
});

const trpcClient = trpc.createClient({
  links: [
    httpBatchLink({
      url: "/api/trpc",
      transformer: superjson,
      fetch(input, init) {
        // Get Firebase ID token from localStorage
        const idToken = localStorage.getItem('firebase_id_token');

        return globalThis.fetch(input, {
          ...(init ?? {}),
          credentials: "include",
          headers: {
            ...(init?.headers ?? {}),
            // Include Firebase ID token in Authorization header
            ...(idToken ? { 'Authorization': `Bearer ${idToken}` } : {}),
          },
        });
      },
    }),
  ],
});

// 앱 렌더링
createRoot(document.getElementById("root")!).render(
  <trpc.Provider client={trpcClient} queryClient={queryClient}>
    <QueryClientProvider client={queryClient}>
      <App />
    </QueryClientProvider>
  </trpc.Provider>
);

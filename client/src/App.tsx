import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import { LayoutProvider } from "./contexts/LayoutContext";
import { MainLayout } from "./components/MainLayout";
import { ThemeToggle } from "./components/ThemeToggle";
import { Suspense, useEffect, lazy } from "react";
import { handleRedirectResult } from "@/lib/firebase";
import { toast } from "sonner";
import { trpc } from "@/lib/trpc";
import { routes } from "./routes";

const NotFound = lazy(() => import("./pages/NotFound"));

// 로딩 폴백 컴포넌트
function PageLoader() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center space-y-4">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
        <p className="text-sm text-muted-foreground">로딩 중...</p>
      </div>
    </div>
  );
}

// Keyboard-aware 로직 - 모든 페이지에 자동 적용
function KeyboardAwareLayout({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    // 모바일 환경에서만 동작
    if (typeof window === 'undefined' || !window.visualViewport) {
      return;
    }

    const viewport = window.visualViewport;
    let focusedElement: HTMLElement | null = null;

    // 키보드 높이 계산 및 CSS 변수 설정
    const updateKeyboardHeight = () => {
      const windowHeight = window.innerHeight;
      const viewportHeight = viewport.height;
      const keyboardHeight = Math.max(0, windowHeight - viewportHeight);

      // CSS 변수로 키보드 높이 전달
      document.documentElement.style.setProperty('--keyboard-height', `${keyboardHeight}px`);

      // 키보드가 올라왔을 때 포커스된 요소 스크롤
      if (keyboardHeight > 0 && focusedElement) {
        setTimeout(() => {
          focusedElement?.scrollIntoView({
            behavior: 'smooth',
            block: 'center'
          });
        }, 100);
      }
    };

    // 입력 요소 포커스 감지 (메모이제이션으로 최적화)
    const handleFocusIn = (e: FocusEvent) => {
      const target = e.target as HTMLElement;
      if (
        target.tagName === 'INPUT' ||
        target.tagName === 'TEXTAREA' ||
        target.contentEditable === 'true'
      ) {
        focusedElement = target;
        updateKeyboardHeight();
      }
    };

    // 입력 요소 포커스 해제 (메모이제이션으로 최적화)
    const handleFocusOut = () => {
      focusedElement = null;
      // blur 시 원래 레이아웃 복원
      document.documentElement.style.setProperty('--keyboard-height', '0px');
    };

    // 이벤트 리스너 등록
    viewport.addEventListener('resize', updateKeyboardHeight);
    document.addEventListener('focusin', handleFocusIn);
    document.addEventListener('focusout', handleFocusOut);

    // 초기화
    document.documentElement.style.setProperty('--keyboard-height', '0px');

    return () => {
      viewport.removeEventListener('resize', updateKeyboardHeight);
      document.removeEventListener('focusin', handleFocusIn);
      document.removeEventListener('focusout', handleFocusOut);
      document.documentElement.style.removeProperty('--keyboard-height');
    };
  }, []);

  return <>{children}</>;
}

function Router() {
  return (
    <LayoutProvider>
      <MainLayout>
        <Suspense fallback={<PageLoader />}>
          <Switch>
            {routes.map((route) => (
              <Route key={route.path} path={route.path} component={route.component} />
            ))}
            <Route component={NotFound} />
          </Switch>
        </Suspense>
      </MainLayout>
    </LayoutProvider>
  );
}

function App() {
  const utils = trpc.useUtils();
  const createUserMutation = trpc.users.createUser.useMutation();

  // Handle Firebase redirect result on app load
  useEffect(() => {
    const handleAuth = async () => {
      try {
        const result = await handleRedirectResult();
        if (result) {
          // Create user in Firestore on first login
          try {
            await createUserMutation.mutateAsync({
              uid: result.user.uid,
              email: result.user.email,
              displayName: result.user.displayName,
              photoURL: result.user.photoURL,
            });
          } catch (createUserError) {
            console.error("Failed to create user:", createUserError);
            // Continue anyway - user might already exist
          }

          toast.success("로그인 성공!");
          // Refresh user data
          await utils.auth.me.invalidate();
        }
      } catch (error: unknown) {
        console.error("Redirect auth failed:", error);
        const message = error instanceof Error ? error.message : "로그인에 실패했습니다.";
        toast.error(message);
      }
    };

    handleAuth();
  }, [utils, createUserMutation]);

  return (
    <ErrorBoundary>
      <ThemeProvider
        defaultTheme="light"
        switchable
      >
        <TooltipProvider>
          <KeyboardAwareLayout>
            <Toaster />
            <ThemeToggle />
            <Router />
          </KeyboardAwareLayout>
        </TooltipProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;

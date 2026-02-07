import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import { MainLayout } from "./components/MainLayout";
import { ThemeToggle } from "./components/ThemeToggle";
import { lazy, Suspense, useEffect } from "react";

// Lazy load 페이지 컴포넌트 - 모바일 성능 최적화
const Home = lazy(() => import("./pages/Home"));
const IntentClarification = lazy(() => import("./pages/IntentClarification"));
const PromptResult = lazy(() => import("./pages/PromptResult"));
const History = lazy(() => import("./pages/History"));
const Settings = lazy(() => import("./pages/Settings"));
const ConversationDetail = lazy(() => import("./pages/ConversationDetail").then(m => ({ default: m.ConversationDetail })));
const Projects = lazy(() => import("./pages/Projects"));
const MyWork = lazy(() => import("./pages/MyWork"));
const PromptVersions = lazy(() => import("./pages/PromptVersions"));
const ProjectDetail = lazy(() => import("./pages/ProjectDetail"));
const NotFound = lazy(() => import("./pages/NotFound"));
const Privacy = lazy(() => import("./pages/Privacy"));
const Terms = lazy(() => import("./pages/Terms"));
const Feedback = lazy(() => import("./pages/Feedback"));

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

    // 입력 요소 포커스 감지
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

    // 입력 요소 포커스 해제
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
    <MainLayout>
      <Suspense fallback={<PageLoader />}>
        <Switch>
          <Route path={"/"} component={Home} />

          <Route path="/intent/:sessionId" component={IntentClarification} />
          <Route path="/result/:promptId" component={PromptResult} />
          <Route path="/history/:id" component={ConversationDetail} />
          <Route path="/history" component={History} />
          <Route path="/my-work" component={MyWork} />
          <Route path="/my-work/:assetId" component={PromptVersions} />
          <Route path="/projects/:id" component={ProjectDetail} />
          <Route path="/projects" component={Projects} />
          <Route path="/settings" component={Settings} />
          <Route path="/privacy" component={Privacy} />
          <Route path="/terms" component={Terms} />
          <Route path="/feedback" component={Feedback} />
          <Route path={"/404"} component={NotFound} />
          <Route component={NotFound} />
        </Switch>
      </Suspense>
    </MainLayout>
  );
}

function App() {
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

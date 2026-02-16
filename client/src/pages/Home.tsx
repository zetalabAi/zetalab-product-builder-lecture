import { useAuth } from "@/_core/hooks/useAuth";
import { LoginModal } from "@/components/LoginModal";
import { HeroSection, QuickStartCategories, RecentPrompts, StatsDisplay } from "@/components/home";
import type { QuickStartCategory } from "@/components/home";

import { trpc } from "@/lib/trpc";
import { useState, useRef, useEffect } from "react";
import { useLocation } from "wouter";
import { toast } from "sonner";

export default function Home() {
  const { user, isAuthenticated } = useAuth();
  const [, navigate] = useLocation();
  const [question, setQuestion] = useState("");
  const [placeholder, setPlaceholder] = useState("메시지를 입력하세요...");
  const [loginModalOpen, setLoginModalOpen] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // 모바일 키보드 올라올 때 입력창으로 자동 스크롤
  useEffect(() => {
    const handleFocus = () => {
      if (textareaRef.current && window.innerWidth <= 768) {
        setTimeout(() => {
          textareaRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }, 150);
      }
    };

    const textarea = textareaRef.current;
    textarea?.addEventListener('focus', handleFocus);

    return () => {
      textarea?.removeEventListener('focus', handleFocus);
    };
  }, []);

  // 최근 프롬프트 조회
  const { data: recentPromptsData, isLoading: isLoadingRecent } = trpc.zetaAI.getHistory.useQuery(
    undefined,
    {
      enabled: isAuthenticated,
    }
  );

  const initMutation = trpc.zetaAI.init.useMutation({
    onSuccess: (data) => {
      navigate(`/intent/${data.sessionId}?question=${encodeURIComponent(question)}`);
    },
    onError: (error) => {
      toast.error("오류가 발생했습니다: " + error.message);
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!question.trim()) {
      toast.error("질문을 입력해주세요");
      return;
    }

    // 로그인 게이트: 생성 행동 시점에만 적용
    if (!isAuthenticated) {
      setLoginModalOpen(true);
      return;
    }

    initMutation.mutate({ question: question });
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  // 카테고리 클릭 핸들러
  const handleCategoryClick = (category: QuickStartCategory) => {
    setPlaceholder(category.placeholder);
    setQuestion(category.example);
    textareaRef.current?.focus();
  };

  // 최근 프롬프트 클릭 핸들러
  const handleRecentPromptClick = (prompt: { id: string; originalQuestion: string }) => {
    setQuestion(prompt.originalQuestion);
    textareaRef.current?.focus();
    textareaRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
  };

  // 최근 프롬프트 데이터 변환
  const recentPrompts = recentPromptsData?.slice(0, 3).map((p) => ({
    id: p.id,
    originalQuestion: p.originalQuestion,
    createdAt: p.createdAt,
    qualityScore: undefined // 품질 점수는 선택적
  })) || [];
  return (
    <div className="min-h-screen p-4 py-12 custom-scrollbar">
      <div className="w-full mx-auto space-y-12">
        {/* Hero Section */}
        <HeroSection
          ref={textareaRef}
          question={question}
          placeholder={placeholder}
          isLoading={initMutation.isPending}
          onQuestionChange={setQuestion}
          onSubmit={handleSubmit}
          onKeyDown={handleKeyDown}
        />

        {/* Quick Start Categories */}
        <QuickStartCategories onCategoryClick={handleCategoryClick} />

        {/* Recent Prompts */}
        {isAuthenticated && (
          <RecentPrompts
            prompts={recentPrompts}
            isLoading={isLoadingRecent}
            onPromptClick={handleRecentPromptClick}
          />
        )}

        {/* Statistics */}
        <StatsDisplay />
      </div>

      {/* Login Modal */}
      <LoginModal open={loginModalOpen} onOpenChange={setLoginModalOpen} />
    </div>
  );
}

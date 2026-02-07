import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { LoginModal } from "@/components/LoginModal";
import { UsageBottomSheet } from "@/components/UsageBottomSheet";

import { trpc } from "@/lib/trpc";
import { useState, useRef, useEffect } from "react";
import { useLocation } from "wouter";
import { toast } from "sonner";
import { Send, Sparkles, Target, Rocket, Lightbulb, Info } from "lucide-react";

export default function Home() {
  const { user, isAuthenticated } = useAuth();
  const [, navigate] = useLocation();
  const [question, setQuestion] = useState("");
  const [loginModalOpen, setLoginModalOpen] = useState(false);
  const [usageSheetOpen, setUsageSheetOpen] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // 모바일 키보드 올라올 때 입력창으로 자동 스크롤
  useEffect(() => {
    const handleFocus = () => {
      if (textareaRef.current && window.innerWidth <= 768) {
        setTimeout(() => {
          textareaRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }, 300);
      }
    };

    const textarea = textareaRef.current;
    textarea?.addEventListener('focus', handleFocus);

    return () => {
      textarea?.removeEventListener('focus', handleFocus);
    };
  }, []);

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

  const examplePrompts = [
    {
      icon: Lightbulb,
      title: "블로그 글 작성",
      description: "2026년 트랜드에 대해 블로그 글을 써줘",
    },
    {
      icon: Target,
      title: "마케팅 전략",
      description: "신제품 출시를 위한 마케팅 계획을 세워주세요",
    },
    {
      icon: Sparkles,
      title: "창의적 아이디어",
      description: "유튜브 쇼츠 대본을 만들어주세요",
    },
    {
      icon: Rocket,
      title: "비즈니스 제안",
      description: "스타트업 사업 계획서를 작성하고 싶어요",
    },
  ];

  // 홈은 Public - 로딩 화면 제거
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 custom-scrollbar">
      <div className="w-full max-w-4xl mx-auto space-y-8">
        {/* Hero Section */}
        <div className="text-center space-y-3 mb-8">
          <h1 className="text-4xl md:text-5xl font-semibold tracking-tight">
            Zeta AI
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground">
            무엇이든 물어보세요. 막연해도 좋아요.
          </p>
        </div>

        {/* Input Section */}
        <form onSubmit={handleSubmit} className="relative mb-8">
          <div className="chat-input-wrapper">
            <Textarea
              ref={textareaRef}
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="메시지를 입력하세요..."
              className="min-h-[120px] md:min-h-[140px] resize-none border-0 focus-visible:ring-0 focus-visible:ring-offset-0 pr-12 text-base md:text-lg touch-manipulation"
              disabled={initMutation.isPending}
            />
            <Button
              type="submit"
              size="icon"
              disabled={!question.trim() || initMutation.isPending}
              className="absolute bottom-3 right-3 h-11 w-11 md:h-8 md:w-8 rounded-lg touch-manipulation"
            >
              {initMutation.isPending ? (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current"></div>
              ) : (
                <Send className="h-4 w-4" />
              )}
            </Button>
          </div>
          <div className="flex items-center justify-between mt-2">
            <p className="text-xs text-muted-foreground text-center md:block hidden flex-1">
              Shift + Enter로 줄바꾸, Enter로 전송
            </p>
            <button
              type="button"
              onClick={() => setUsageSheetOpen(true)}
              className="md:hidden flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors px-3 py-2 rounded-lg hover:bg-secondary touch-manipulation"
            >
              <Info className="h-3.5 w-3.5" />
              <span>사용법</span>
            </button>
          </div>
        </form>

        {/* Usage Bottom Sheet */}
        <UsageBottomSheet
          isOpen={usageSheetOpen}
          onClose={() => {
            setUsageSheetOpen(false);
            // 닫을 때 입력창 포커스 복귀
            setTimeout(() => {
              textareaRef.current?.focus();
            }, 300);
          }}
        />

        {/* Example Prompts - 데스크톱만 표시 */}
        <div className="hidden md:block">
          <h2 className="text-2xl font-semibold text-center mb-6">
            AI 프롬프트 생성 예시
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-8">
            {examplePrompts.map((prompt, index) => (
              <button
                key={index}
                onClick={() => setQuestion(prompt.description)}
                className="feature-card group"
              >
                <div className="flex items-start gap-3 text-left">
                  <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-secondary flex items-center justify-center group-hover:bg-primary/10 transition-colors">
                    <prompt.icon className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-medium text-sm mb-1">{prompt.title}</h3>
                    <p className="text-sm text-muted-foreground line-clamp-2">
                      {prompt.description}
                    </p>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Info Section - 데스크톱만 표시 */}
        <div className="hidden md:block">
          <h2 className="text-2xl font-semibold text-center mb-4 mt-12">
            ZetaLab의 특별한 기능
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <Card className="p-3 border-border">
              <div className="flex items-center gap-3">
                <Target className="w-6 h-6 text-primary flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <h3 className="font-medium text-sm mb-0.5">의도 파악</h3>
                  <p className="text-xs text-muted-foreground">
                    막연한 질문도 명확하게
                  </p>
                </div>
              </div>
            </Card>
            <Card className="p-3 border-border">
              <div className="flex items-center gap-3">
                <Sparkles className="w-6 h-6 text-primary flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <h3 className="font-medium text-sm mb-0.5">초고급 프롬프트</h3>
                  <p className="text-xs text-muted-foreground">
                    바로 사용 가능한 완성형
                  </p>
                </div>
              </div>
            </Card>
            <Card className="p-3 border-border">
              <div className="flex items-center gap-3">
                <Rocket className="w-6 h-6 text-primary flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <h3 className="font-medium text-sm mb-0.5">즉시 실행</h3>
                  <p className="text-xs text-muted-foreground">
                    질문에 답만해도 완성
                  </p>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>

      {/* Login Modal */}
      <LoginModal open={loginModalOpen} onOpenChange={setLoginModalOpen} />
    </div>
  );
}

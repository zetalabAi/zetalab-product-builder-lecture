import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { trpc } from "@/lib/trpc";
import { useEffect } from "react";
import { useLocation } from "wouter";
import { Sparkles, Home, Clock, ArrowRight } from "lucide-react";
import { format } from "date-fns";
import { ko } from "date-fns/locale";

export default function History() {
  const { isAuthenticated, loading } = useAuth();
  const [, navigate] = useLocation();

  const { data: history, isLoading } = trpc.zetaAI.getHistory.useQuery(undefined, {
    enabled: isAuthenticated
  });

  useEffect(() => {
    if (!isAuthenticated && !loading) {
      navigate("/");
    }
  }, [isAuthenticated, loading, navigate]);

  if (loading || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">히스토리를 불러오는 중...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-4 custom-scrollbar">
      <div className="max-w-4xl mx-auto space-y-6 py-8">
        {/* Header */}
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Clock className="w-6 h-6 text-primary" />
            <h1 className="text-2xl font-semibold">프롬프트 히스토리</h1>
          </div>
          <p className="text-muted-foreground">
            이전에 생성한 프롬프트를 확인하세요
          </p>
        </div>

        {/* History List */}
        {!history || history.length === 0 ? (
          <Card className="p-12 text-center border-border">
            <Sparkles className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground mb-4">아직 생성된 프롬프트가 없습니다</p>
            <Button
              onClick={() => navigate("/")}
              className="flex items-center gap-2 mx-auto"
            >
              <Home className="w-4 h-4" />
              첫 프롬프트 만들기
            </Button>
          </Card>
        ) : (
          <div className="space-y-3">
            {history.map((item) => (
              <button
                key={item.id}
                onClick={() => navigate(`/result/${item.id}`)}
                className="message-card w-full text-left group"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0 space-y-2">
                    <h3 className="font-medium text-base line-clamp-1 group-hover:text-primary transition-colors">
                      {item.originalQuestion}
                    </h3>
                    <p className="text-sm text-muted-foreground line-clamp-2">
                      {item.editedPrompt || item.generatedPrompt}
                    </p>
                    <div className="flex items-center gap-4 text-xs text-muted-foreground">
                      <span>
                        {format(new Date(item.createdAt), "yyyy년 MM월 dd일 HH:mm", { locale: ko })}
                      </span>
                      {item.editedPrompt && (
                        <span className="px-2 py-0.5 bg-secondary rounded-full">수정됨</span>
                      )}
                    </div>
                  </div>
                  <ArrowRight className="w-5 h-5 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all flex-shrink-0" />
                </div>
              </button>
            ))}
          </div>
        )}

        {/* Back Button */}
        <div className="flex justify-center pt-4">
          <Button
            variant="outline"
            onClick={() => navigate("/")}
            className="flex items-center gap-2"
          >
            <Home className="w-4 h-4" />
            홈으로 돌아가기
          </Button>
        </div>
      </div>
    </div>
  );
}

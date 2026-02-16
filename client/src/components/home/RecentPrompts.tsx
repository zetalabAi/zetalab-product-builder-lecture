/**
 * RecentPrompts Component
 * 최근 사용한 프롬프트 (3-5개)
 */

import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Clock, RefreshCw, ArrowRight, FileText } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { ko } from "date-fns/locale";

interface RecentPrompt {
  id: string;
  originalQuestion: string;
  createdAt: Date;
  qualityScore?: number;
}

interface RecentPromptsProps {
  prompts: RecentPrompt[];
  isLoading: boolean;
  onPromptClick: (prompt: RecentPrompt) => void;
}

export function RecentPrompts({ prompts, isLoading, onPromptClick }: RecentPromptsProps) {
  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto animate-fadeIn" style={{ animationDelay: '200ms' }}>
        <div className="text-center mb-6">
          <h2 className="text-2xl font-semibold mb-2">📌 최근 사용한 프롬프트</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="p-4 animate-pulse">
              <div className="h-4 bg-muted rounded mb-2"></div>
              <div className="h-3 bg-muted rounded w-2/3"></div>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (prompts.length === 0) {
    return (
      <div className="max-w-4xl mx-auto animate-fadeIn" style={{ animationDelay: '200ms' }}>
        <div className="text-center mb-6">
          <h2 className="text-2xl font-semibold mb-2">📌 최근 사용한 프롬프트</h2>
        </div>
        <Card className="p-8 text-center border-dashed">
          <FileText className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
          <h3 className="text-lg font-medium mb-2">아직 만든 프롬프트가 없어요</h3>
          <p className="text-sm text-muted-foreground">
            첫 프롬프트를 만들어보세요! 🚀
          </p>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto animate-fadeIn" style={{ animationDelay: '200ms' }}>
      <div className="text-center mb-6">
        <h2 className="text-2xl font-semibold mb-2">📌 최근 사용한 프롬프트</h2>
        <p className="text-sm text-muted-foreground">
          이전에 만든 프롬프트를 다시 사용해보세요
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {prompts.slice(0, 3).map((prompt, index) => (
          <Card
            key={prompt.id}
            className="p-5 hover:border-primary/50 transition-all cursor-pointer group"
            onClick={() => onPromptClick(prompt)}
            style={{ animationDelay: `${250 + index * 50}ms` }}
          >
            <div className="space-y-3">
              {/* 제목 */}
              <div className="flex items-start justify-between gap-2">
                <h3 className="text-sm font-medium line-clamp-2 flex-1">
                  {prompt.originalQuestion}
                </h3>
                <ArrowRight className="w-4 h-4 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all flex-shrink-0" />
              </div>

              {/* 메타 정보 */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                  <Clock className="w-3 h-3" />
                  <span>
                    {formatDistanceToNow(prompt.createdAt, {
                      addSuffix: true,
                      locale: ko
                    })}
                  </span>
                </div>
                {prompt.qualityScore && (
                  <Badge variant="secondary" className="text-xs">
                    ⭐ {prompt.qualityScore}/100
                  </Badge>
                )}
              </div>

              {/* 다시 사용하기 버튼 */}
              <Button
                size="sm"
                variant="ghost"
                className="w-full group-hover:bg-primary/10"
                onClick={(e) => {
                  e.stopPropagation();
                  onPromptClick(prompt);
                }}
              >
                <RefreshCw className="w-3.5 h-3.5 mr-2" />
                다시 사용하기
              </Button>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}

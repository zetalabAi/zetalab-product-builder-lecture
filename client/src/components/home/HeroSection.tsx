/**
 * HeroSection Component
 * 홈 페이지 히어로 섹션 - 제목 + 부제 + 입력창
 */

import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Send, Sparkles } from "lucide-react";
import { forwardRef } from "react";

interface HeroSectionProps {
  question: string;
  placeholder: string;
  isLoading: boolean;
  onQuestionChange: (value: string) => void;
  onSubmit: (e: React.FormEvent) => void;
  onKeyDown: (e: React.KeyboardEvent<HTMLTextAreaElement>) => void;
}

export const HeroSection = forwardRef<HTMLTextAreaElement, HeroSectionProps>(
  ({ question, placeholder, isLoading, onQuestionChange, onSubmit, onKeyDown }, ref) => {
    return (
      <div className="space-y-6 animate-fadeIn">
        {/* 타이틀 */}
        <div className="text-center space-y-3">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-2">
            <Sparkles className="w-8 h-8 text-primary" />
          </div>
          <h1 className="text-3xl md:text-5xl font-bold tracking-tight">
            막연한 질문도 좋아요
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground">
            AI가 도와줄거에요 ✨
          </p>
        </div>

        {/* 입력창 */}
        <form onSubmit={onSubmit} className="relative max-w-3xl mx-auto">
          <div className="chat-input-wrapper">
            <Textarea
              ref={ref}
              value={question}
              onChange={(e) => onQuestionChange(e.target.value)}
              onKeyDown={onKeyDown}
              placeholder={placeholder}
              className="min-h-[140px] md:min-h-[160px] resize-none border-0 focus-visible:ring-0 focus-visible:ring-offset-0 pr-14 text-base md:text-lg touch-manipulation"
              disabled={isLoading}
            />
            <Button
              type="submit"
              size="icon"
              disabled={!question.trim() || isLoading}
              className="absolute bottom-4 right-4 h-12 w-12 rounded-full shadow-lg hover:shadow-xl transition-all"
            >
              {isLoading ? (
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-current"></div>
              ) : (
                <Send className="h-5 w-5" />
              )}
            </Button>
          </div>
          <p className="text-xs text-muted-foreground text-center mt-3">
            Shift + Enter로 줄바꿈, Enter로 전송
          </p>
        </form>
      </div>
    );
  }
);

HeroSection.displayName = "HeroSection";

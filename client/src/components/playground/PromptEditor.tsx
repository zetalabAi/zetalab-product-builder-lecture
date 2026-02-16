/**
 * PromptEditor Component
 * 프롬프트 입력 및 편집 컴포넌트
 */

import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Sparkles, Copy } from "lucide-react";
import { EXAMPLE_PROMPTS } from "@/types/playground";
import { toast } from "sonner";

interface PromptEditorProps {
  prompt: string;
  onPromptChange: (prompt: string) => void;
  systemPrompt?: string;
  onSystemPromptChange?: (systemPrompt: string) => void;
  disabled?: boolean;
}

export function PromptEditor({
  prompt,
  onPromptChange,
  systemPrompt,
  onSystemPromptChange,
  disabled = false
}: PromptEditorProps) {
  const handleExampleClick = (examplePrompt: string) => {
    onPromptChange(examplePrompt);
    toast.success("예시 프롬프트가 입력되었습니다");
  };

  return (
    <div className="space-y-4">
      {/* Main Prompt */}
      <div>
        <label className="text-sm font-medium mb-2 block">
          프롬프트
        </label>
        <Textarea
          value={prompt}
          onChange={(e) => onPromptChange(e.target.value)}
          placeholder="테스트할 프롬프트를 입력하세요..."
          className="min-h-[200px] resize-none"
          disabled={disabled}
        />
      </div>

      {/* System Prompt (Optional) */}
      {onSystemPromptChange && (
        <div>
          <label className="text-sm font-medium mb-2 block">
            System Prompt (선택사항)
          </label>
          <Textarea
            value={systemPrompt || ''}
            onChange={(e) => onSystemPromptChange(e.target.value)}
            placeholder="시스템 프롬프트를 입력하세요..."
            className="min-h-[100px] resize-none"
            disabled={disabled}
          />
        </div>
      )}

      {/* Example Prompts */}
      <div>
        <div className="flex items-center gap-2 mb-3">
          <Sparkles className="w-4 h-4 text-primary" />
          <span className="text-sm font-medium">예시 프롬프트</span>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
          {EXAMPLE_PROMPTS.map((example, index) => (
            <Button
              key={index}
              variant="outline"
              size="sm"
              onClick={() => handleExampleClick(example.prompt)}
              disabled={disabled}
              className="justify-start h-auto py-2 text-left"
            >
              <Copy className="w-3 h-3 mr-2 flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <div className="text-xs font-medium truncate">
                  {example.title}
                </div>
                <div className="text-xs text-muted-foreground truncate">
                  {example.prompt.substring(0, 50)}...
                </div>
              </div>
            </Button>
          ))}
        </div>
      </div>
    </div>
  );
}

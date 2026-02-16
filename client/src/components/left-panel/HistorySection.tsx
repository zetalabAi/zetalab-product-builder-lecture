import { memo, useState } from "react";
import { Link } from "wouter";
import { Clock, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { cn } from "@/lib/utils";
import type { Conversation } from "@/types/conversation";

interface HistorySectionProps {
  leftPanelOpen: boolean;
  conversations: Conversation[];
  isLoading: boolean;
}

export const HistorySection = memo(function HistorySection({
  leftPanelOpen,
  conversations,
  isLoading,
}: HistorySectionProps) {
  const [historyOpen, setHistoryOpen] = useState(true);

  if (!leftPanelOpen) return null;

  return (
    <div className="overflow-hidden px-2 mt-4 mb-4">
      <Collapsible open={historyOpen} onOpenChange={setHistoryOpen}>
        <CollapsibleTrigger asChild>
          <Button
            variant="ghost"
            className="w-full justify-between px-2 mb-2"
          >
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4" />
              <span className="text-sm font-medium">히스토리</span>
            </div>
            <ChevronDown
              className={cn(
                "h-4 w-4 transition-transform duration-200",
                historyOpen && "rotate-180"
              )}
            />
          </Button>
        </CollapsibleTrigger>
        <CollapsibleContent>
          <ScrollArea className="max-h-[300px]">
            <div className="space-y-1 pr-3">
              {isLoading ? (
                <p className="text-sm text-muted-foreground px-2 py-2">
                  로딩 중...
                </p>
              ) : conversations.length === 0 ? (
                <p className="text-sm text-muted-foreground px-2 py-2">
                  대화 내역이 없습니다
                </p>
              ) : (
                conversations.map((conv) => (
                  <Link
                    key={conv.id}
                    href={`/chat/${conv.id}`}
                    asChild
                  >
                    <Button
                      variant="ghost"
                      className="w-full justify-start text-left font-normal h-auto py-2"
                    >
                      <div className="flex-1 truncate">
                        <div className="text-sm truncate">
                          {conv.originalQuestion || "새 대화"}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {new Date(conv.createdAt).toLocaleDateString()}
                        </div>
                      </div>
                    </Button>
                  </Link>
                ))
              )}
            </div>
          </ScrollArea>
        </CollapsibleContent>
      </Collapsible>
    </div>
  );
});

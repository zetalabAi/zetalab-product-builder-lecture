/**
 * ResultCard Component
 * 개별 모델 실행 결과 카드
 */

import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Copy, Clock, DollarSign, FileText, AlertCircle } from "lucide-react";
import { ModelResult, getModelById } from "@/types/playground";
import { toast } from "sonner";

interface ResultCardProps {
  result: ModelResult;
  isFastest?: boolean;
  isCheapest?: boolean;
}

export function ResultCard({ result, isFastest, isCheapest }: ResultCardProps) {
  const model = getModelById(result.modelId);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(result.response);
      toast.success("응답이 복사되었습니다");
    } catch (error) {
      toast.error("복사 실패");
    }
  };

  if (!model) return null;

  return (
    <Card
      className={`p-5 ${
        result.error
          ? 'border-red-200 dark:border-red-900 bg-red-50/30 dark:bg-red-950/20'
          : 'border-border'
      }`}
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-2">
          <span className="text-2xl">{model.icon}</span>
          <div>
            <h3 className={`font-semibold ${model.color}`}>
              {model.name}
            </h3>
            <p className="text-xs text-muted-foreground">
              {model.provider}
            </p>
          </div>
        </div>
        <div className="flex gap-1">
          {isFastest && (
            <Badge className="bg-green-500 hover:bg-green-600">
              ⚡ 최고 속도
            </Badge>
          )}
          {isCheapest && (
            <Badge className="bg-blue-500 hover:bg-blue-600">
              💰 최저 비용
            </Badge>
          )}
        </div>
      </div>

      {/* Metadata */}
      <div className="grid grid-cols-3 gap-3 mb-4">
        <div className="flex items-center gap-2 text-xs">
          <Clock className="w-3.5 h-3.5 text-muted-foreground" />
          <span className="text-muted-foreground">속도</span>
          <span className="font-medium">
            {(result.duration / 1000).toFixed(2)}s
          </span>
        </div>
        <div className="flex items-center gap-2 text-xs">
          <FileText className="w-3.5 h-3.5 text-muted-foreground" />
          <span className="text-muted-foreground">토큰</span>
          <span className="font-medium">
            {result.tokenCount.toLocaleString()}
          </span>
        </div>
        <div className="flex items-center gap-2 text-xs">
          <DollarSign className="w-3.5 h-3.5 text-muted-foreground" />
          <span className="text-muted-foreground">비용</span>
          <span className="font-medium">
            ${result.estimatedCost.toFixed(4)}
          </span>
        </div>
      </div>

      {/* Response or Error */}
      {result.error ? (
        <div className="flex items-start gap-2 p-3 rounded-lg bg-red-100 dark:bg-red-900/20 border border-red-200 dark:border-red-800">
          <AlertCircle className="w-4 h-4 text-red-600 dark:text-red-500 mt-0.5 flex-shrink-0" />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-red-900 dark:text-red-100">
              실행 실패
            </p>
            <p className="text-xs text-red-700 dark:text-red-300 mt-1">
              {result.error}
            </p>
          </div>
        </div>
      ) : (
        <>
          <div className="relative">
            <div className="p-3 rounded-lg bg-secondary/50 max-h-[300px] overflow-y-auto custom-scrollbar">
              <pre className="text-sm whitespace-pre-wrap break-words font-sans">
                {result.response}
              </pre>
            </div>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={handleCopy}
            className="w-full mt-3"
          >
            <Copy className="w-3.5 h-3.5 mr-2" />
            응답 복사
          </Button>
        </>
      )}
    </Card>
  );
}

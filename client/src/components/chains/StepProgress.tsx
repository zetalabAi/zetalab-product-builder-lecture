/**
 * StepProgress Component
 * 단계 진행 상황 - 체인 실행 시 각 단계의 상태를 표시
 */

import React from 'react';
import { Card, CardContent } from '../ui/card';
import { Badge } from '../ui/badge';
import { CheckCircle2, Circle, Loader2, XCircle } from 'lucide-react';
import { StepResult } from '../../types/chain';
import { cn } from '../../lib/utils';

interface StepProgressProps {
  stepName: string;
  stepOrder: number;
  status: 'pending' | 'running' | 'completed' | 'failed';
  result?: StepResult;
}

export function StepProgress({ stepName, stepOrder, status, result }: StepProgressProps) {
  const getStatusIcon = () => {
    switch (status) {
      case 'completed':
        return <CheckCircle2 className="h-5 w-5 text-green-500" />;
      case 'running':
        return <Loader2 className="h-5 w-5 text-blue-500 animate-spin" />;
      case 'failed':
        return <XCircle className="h-5 w-5 text-red-500" />;
      default:
        return <Circle className="h-5 w-5 text-muted-foreground" />;
    }
  };

  const getStatusLabel = () => {
    switch (status) {
      case 'completed':
        return '완료';
      case 'running':
        return '실행 중...';
      case 'failed':
        return '실패';
      default:
        return '대기 중';
    }
  };

  const getStatusVariant = () => {
    switch (status) {
      case 'completed':
        return 'default' as const;
      case 'running':
        return 'default' as const;
      case 'failed':
        return 'destructive' as const;
      default:
        return 'secondary' as const;
    }
  };

  return (
    <Card
      className={cn(
        'transition-all duration-200',
        status === 'running' && 'ring-2 ring-blue-500 ring-opacity-50',
        status === 'completed' && 'bg-green-50 dark:bg-green-950',
        status === 'failed' && 'bg-red-50 dark:bg-red-950'
      )}
    >
      <CardContent className="p-4">
        <div className="flex items-start gap-3">
          {/* Icon */}
          <div className="mt-0.5">{getStatusIcon()}</div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between mb-2">
              <h4 className="font-medium text-sm">
                {stepOrder}. {stepName}
              </h4>
              <Badge variant={getStatusVariant()} className="ml-2">
                {getStatusLabel()}
              </Badge>
            </div>

            {/* Result Details */}
            {result && (
              <div className="space-y-2 text-sm text-muted-foreground">
                {result.success ? (
                  <>
                    <div className="flex items-center justify-between">
                      <span>소요 시간:</span>
                      <span className="font-medium">
                        {(result.duration / 1000).toFixed(1)}초
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>비용:</span>
                      <span className="font-medium">${result.cost.toFixed(4)}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>출력 길이:</span>
                      <span className="font-medium">
                        {result.output.length.toLocaleString()}자
                      </span>
                    </div>
                  </>
                ) : (
                  <div className="text-red-600 dark:text-red-400">
                    <p className="font-medium">오류 발생:</p>
                    <p className="text-xs mt-1">{result.error}</p>
                  </div>
                )}
              </div>
            )}

            {/* Running Status */}
            {status === 'running' && !result && (
              <div className="text-sm text-muted-foreground animate-pulse">
                AI 모델을 호출하고 있습니다...
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

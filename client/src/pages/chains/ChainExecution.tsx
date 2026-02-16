/**
 * ChainExecution Page
 * 체인 실행 - 체인을 실행하고 실시간 진행 상황을 표시
 */

import React, { useState, useEffect } from 'react';
import { useLocation, useRoute } from 'wouter';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Textarea } from '../../components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Progress } from '../../components/ui/progress';
import { StepProgress, ExecutionResult } from '../../components/chains';
import { Play, ArrowLeft, X, RotateCcw } from 'lucide-react';
import { trpc } from '../../lib/trpc';
import { toast } from 'sonner';
import type { PromptChain, ChainExecution, StepProgress as StepProgressType } from '../../types/chain';

export function ChainExecutionPage() {
  const [, navigate] = useLocation();
  const [match, params] = useRoute('/chains/:chainId/execute');
  const chainId = params?.chainId || '';

  const [chain, setChain] = useState<PromptChain | null>(null);
  const [initialInput, setInitialInput] = useState('');
  const [execution, setExecution] = useState<ChainExecution | null>(null);
  const [stepProgresses, setStepProgresses] = useState<StepProgressType[]>([]);

  const [isLoadingChain, setIsLoadingChain] = useState(true);
  const [isExecuting, setIsExecuting] = useState(false);

  // Load chain
  useEffect(() => {
    if (!chainId) return;

    trpc.chains.getChainById
      .query({ chainId })
      .then((data) => {
        setChain(data);
        // Initialize step progresses
        setStepProgresses(
          data.steps.map((step) => ({
            stepId: step.id,
            stepName: step.name,
            stepOrder: step.order,
            status: 'pending' as const,
          }))
        );
      })
      .catch((error) => {
        toast.error('체인을 불러올 수 없습니다.');
        navigate('/chains');
      })
      .finally(() => setIsLoadingChain(false));
  }, [chainId]);

  // Poll execution status
  useEffect(() => {
    if (!execution || execution.status === 'completed' || execution.status === 'failed' || execution.status === 'cancelled') {
      return;
    }

    const interval = setInterval(async () => {
      try {
        const updatedExecution = await trpc.chains.getExecution.query({
          executionId: execution.id,
        });

        setExecution(updatedExecution);

        // Update step progresses
        const newProgresses = stepProgresses.map((progress, index) => {
          if (index < updatedExecution.currentStepIndex) {
            // Completed steps
            const result = updatedExecution.stepResults[index];
            return {
              ...progress,
              status: result?.success ? ('completed' as const) : ('failed' as const),
              result,
            };
          } else if (index === updatedExecution.currentStepIndex) {
            // Current step
            const result = updatedExecution.stepResults[index];
            return {
              ...progress,
              status: updatedExecution.status === 'running' ? ('running' as const) : ('completed' as const),
              result,
            };
          } else {
            // Pending steps
            return progress;
          }
        });

        setStepProgresses(newProgresses);

        // Stop polling when done
        if (
          updatedExecution.status === 'completed' ||
          updatedExecution.status === 'failed' ||
          updatedExecution.status === 'cancelled'
        ) {
          setIsExecuting(false);
        }
      } catch (error) {
        console.error('Failed to poll execution status:', error);
      }
    }, 2000); // Poll every 2 seconds

    return () => clearInterval(interval);
  }, [execution]);

  const handleExecute = async () => {
    if (!chain) return;

    setIsExecuting(true);

    try {
      const result = await trpc.chains.executeChain.mutate({
        chainId: chain.id,
        initialInput: initialInput.trim() || undefined,
      });

      // Initialize execution
      const newExecution: ChainExecution = {
        id: result.executionId,
        chainId: chain.id,
        userId: '', // Will be filled by server
        status: 'running',
        currentStepIndex: 0,
        stepResults: [],
        initialInput: initialInput.trim() || undefined,
        startedAt: new Date(),
        totalCost: 0,
        totalDuration: 0,
      };

      setExecution(newExecution);

      // Update step progresses
      setStepProgresses(
        stepProgresses.map((progress, index) => ({
          ...progress,
          status: index === 0 ? ('running' as const) : ('pending' as const),
        }))
      );

      toast.success('체인 실행이 시작되었습니다.');
    } catch (error: any) {
      toast.error(error.message || '체인 실행에 실패했습니다.');
      setIsExecuting(false);
    }
  };

  const handleCancel = async () => {
    if (!execution) return;

    try {
      await trpc.chains.cancelExecution.mutate({
        executionId: execution.id,
      });

      toast.success('체인 실행이 취소되었습니다.');

      setIsExecuting(false);
      setExecution((prev) => (prev ? { ...prev, status: 'cancelled' } : null));
    } catch (error: any) {
      toast.error(error.message || '취소에 실패했습니다.');
    }
  };

  const handleReset = () => {
    setExecution(null);
    setInitialInput('');
    setIsExecuting(false);
    setStepProgresses(
      chain?.steps.map((step) => ({
        stepId: step.id,
        stepName: step.name,
        stepOrder: step.order,
        status: 'pending' as const,
      })) || []
    );
  };

  if (isLoadingChain) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">체인을 불러오는 중...</p>
        </div>
      </div>
    );
  }

  if (!chain) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <p className="text-xl font-semibold mb-2">체인을 찾을 수 없습니다</p>
          <Button onClick={() => navigate('/chains')}>체인 목록으로</Button>
        </div>
      </div>
    );
  }

  const progress = execution
    ? Math.round(((execution.currentStepIndex + 1) / chain.steps.length) * 100)
    : 0;

  const isCompleted = execution?.status === 'completed';
  const isFailed = execution?.status === 'failed';
  const isCancelled = execution?.status === 'cancelled';
  const canExecute = !isExecuting && !isCompleted;

  return (
    <div className="container max-w-4xl py-8 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate('/chains')}
            className="mb-2"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            체인 목록으로
          </Button>
          <h1 className="text-3xl font-bold">{chain.name}</h1>
          <p className="text-muted-foreground mt-1">{chain.description}</p>
        </div>
        {isCompleted && (
          <Button onClick={handleReset} variant="outline">
            <RotateCcw className="h-4 w-4 mr-2" />
            다시 실행
          </Button>
        )}
      </div>

      {/* Initial Input */}
      {!execution && (
        <Card>
          <CardHeader>
            <CardTitle>초기 입력</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="initial-input">
                초기 입력 (선택사항)
                <span className="text-xs text-muted-foreground ml-2">
                  첫 단계의 {'{{initial_input}}'} 변수에 사용됩니다
                </span>
              </Label>
              <Textarea
                id="initial-input"
                placeholder="예: AI 기술의 최신 트렌드에 대해 알려주세요"
                value={initialInput}
                onChange={(e) => setInitialInput(e.target.value)}
                rows={4}
              />
            </div>
            <Button
              onClick={handleExecute}
              disabled={!canExecute}
              size="lg"
              className="w-full"
            >
              <Play className="h-4 w-4 mr-2" />
              체인 실행 시작
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Execution Progress */}
      {execution && (
        <>
          {/* Progress Bar */}
          {isExecuting && (
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>실행 진행 상황</CardTitle>
                  <Button
                    onClick={handleCancel}
                    variant="destructive"
                    size="sm"
                  >
                    <X className="h-4 w-4 mr-2" />
                    취소
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <Progress value={progress} className="h-2" />
                  <p className="text-sm text-muted-foreground text-center">
                    {execution.currentStepIndex + 1} / {chain.steps.length} 단계 완료
                  </p>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Step Progresses */}
          <div className="space-y-3">
            {stepProgresses.map((progress) => (
              <StepProgress
                key={progress.stepId}
                stepName={progress.stepName}
                stepOrder={progress.stepOrder}
                status={progress.status}
                result={progress.result}
              />
            ))}
          </div>

          {/* Results */}
          {isCompleted && execution.stepResults.length > 0 && (
            <ExecutionResult
              stepResults={execution.stepResults}
              totalCost={execution.totalCost}
              totalDuration={execution.totalDuration}
            />
          )}

          {/* Error */}
          {(isFailed || isCancelled) && (
            <Card className="border-red-500">
              <CardHeader>
                <CardTitle className="text-red-600">
                  {isFailed ? '실행 실패' : '실행 취소됨'}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  {execution.error || '알 수 없는 오류가 발생했습니다.'}
                </p>
                <Button onClick={handleReset} className="mt-4">
                  <RotateCcw className="h-4 w-4 mr-2" />
                  다시 시도
                </Button>
              </CardContent>
            </Card>
          )}
        </>
      )}
    </div>
  );
}

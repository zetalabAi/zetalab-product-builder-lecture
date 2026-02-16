/**
 * ExecutionResult Component
 * 실행 결과 - 체인 실행 완료 후 결과를 표시
 */

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Copy, Download, ExternalLink } from 'lucide-react';
import { StepResult } from '../../types/chain';
import { formatDuration, formatCost } from '../../types/chain';

interface ExecutionResultProps {
  stepResults: StepResult[];
  totalCost: number;
  totalDuration: number;
}

export function ExecutionResult({
  stepResults,
  totalCost,
  totalDuration,
}: ExecutionResultProps) {
  const [copiedStepId, setCopiedStepId] = useState<string | null>(null);

  const handleCopy = async (text: string, stepId: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedStepId(stepId);
      setTimeout(() => setCopiedStepId(null), 2000);
    } catch (error) {
      console.error('Failed to copy:', error);
    }
  };

  const handleDownload = (stepResult: StepResult) => {
    const content = `# ${stepResult.stepName}\n\n## 입력\n\n${stepResult.input}\n\n## 출력\n\n${stepResult.output}`;
    const blob = new Blob([content], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${stepResult.stepName}.md`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      {/* Summary */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">실행 완료</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <p className="text-2xl font-bold">{stepResults.length}</p>
              <p className="text-sm text-muted-foreground">완료된 단계</p>
            </div>
            <div>
              <p className="text-2xl font-bold">{formatDuration(totalDuration)}</p>
              <p className="text-sm text-muted-foreground">총 소요 시간</p>
            </div>
            <div>
              <p className="text-2xl font-bold">{formatCost(totalCost)}</p>
              <p className="text-sm text-muted-foreground">총 비용</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Step Results */}
      <div className="space-y-4">
        {stepResults.map((stepResult, index) => (
          <Card key={stepResult.stepId}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-base">
                    {index + 1}. {stepResult.stepName}
                  </CardTitle>
                  <div className="flex items-center gap-2 mt-1">
                    <Badge variant="secondary" className="text-xs">
                      {stepResult.modelUsed}
                    </Badge>
                    <span className="text-xs text-muted-foreground">
                      {formatDuration(stepResult.duration)} • {formatCost(stepResult.cost)}
                    </span>
                  </div>
                </div>
                <div className="flex gap-1">
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => handleCopy(stepResult.output, stepResult.stepId)}
                    title="복사"
                  >
                    {copiedStepId === stepResult.stepId ? (
                      <span className="text-xs">복사됨!</span>
                    ) : (
                      <Copy className="h-4 w-4" />
                    )}
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => handleDownload(stepResult)}
                    title="다운로드"
                  >
                    <Download className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="output">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="output">출력</TabsTrigger>
                  <TabsTrigger value="input">입력</TabsTrigger>
                </TabsList>
                <TabsContent value="output" className="mt-4">
                  <div className="prose prose-sm max-w-none dark:prose-invert">
                    <pre className="whitespace-pre-wrap break-words bg-muted p-4 rounded-lg text-sm">
                      {stepResult.output}
                    </pre>
                  </div>
                </TabsContent>
                <TabsContent value="input" className="mt-4">
                  <div className="prose prose-sm max-w-none dark:prose-invert">
                    <pre className="whitespace-pre-wrap break-words bg-muted p-4 rounded-lg text-sm font-mono">
                      {stepResult.input}
                    </pre>
                  </div>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

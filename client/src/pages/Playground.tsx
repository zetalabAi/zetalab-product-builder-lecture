/**
 * Playground Page
 * AI 모델 테스트 및 비교 페이지
 */

import { useState } from "react";
import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { LoginModal } from "@/components/LoginModal";
import {
  ModelSelector,
  PromptEditor,
  ResultCard,
  ComparisonTable
} from "@/components/playground";
import { ImprovementPanel } from "@/components/improve";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import { Play, Sparkles, Loader2, Wand2 } from "lucide-react";
import { ExecutionMode, ModelResult, calculateComparison } from "@/types/playground";
import { AnalysisResult, ImprovementResult } from "@/types/improve";

export default function Playground() {
  const { isAuthenticated } = useAuth();
  const [loginModalOpen, setLoginModalOpen] = useState(false);

  // State
  const [mode, setMode] = useState<ExecutionMode>('compare');
  const [prompt, setPrompt] = useState('');
  const [systemPrompt, setSystemPrompt] = useState('');
  const [selectedModels, setSelectedModels] = useState<string[]>([]);
  const [results, setResults] = useState<ModelResult[]>([]);

  // Improvement state
  const [showImprovement, setShowImprovement] = useState(false);
  const [analysis, setAnalysis] = useState<AnalysisResult | null>(null);
  const [improvement, setImprovement] = useState<ImprovementResult | null>(null);

  // Execute mutation
  const executeMutation = trpc.playground.executePrompt.useMutation({
    onSuccess: (data) => {
      setResults(data.results);
      toast.success(`${data.results.length}개 모델 실행 완료`);
    },
    onError: (error) => {
      toast.error("실행 실패: " + error.message);
    }
  });

  // Auto Improve mutation
  const autoImproveMutation = trpc.improve.autoImprove.useMutation({
    onSuccess: (data) => {
      setAnalysis(data.analysis);
      setImprovement(data.improvement);
      setShowImprovement(true);
      toast.success("자동 개선 분석 완료");
    },
    onError: (error) => {
      toast.error("자동 개선 실패: " + error.message);
    }
  });

  const handleModelToggle = (modelId: string) => {
    if (mode === 'single') {
      // Single mode: only one model
      setSelectedModels([modelId]);
    } else {
      // Compare mode: toggle selection
      if (selectedModels.includes(modelId)) {
        setSelectedModels(selectedModels.filter(id => id !== modelId));
      } else if (selectedModels.length < 3) {
        setSelectedModels([...selectedModels, modelId]);
      } else {
        toast.error("최대 3개 모델까지 선택 가능합니다");
      }
    }
  };

  const handleExecute = () => {
    if (!isAuthenticated) {
      setLoginModalOpen(true);
      return;
    }

    if (!prompt.trim()) {
      toast.error("프롬프트를 입력해주세요");
      return;
    }

    if (selectedModels.length === 0) {
      toast.error("최소 1개 모델을 선택해주세요");
      return;
    }

    if (mode === 'compare' && selectedModels.length < 2) {
      toast.error("비교 모드에서는 최소 2개 모델을 선택해주세요");
      return;
    }

    // Clear previous results
    setResults([]);

    // Execute
    executeMutation.mutate({
      prompt: prompt.trim(),
      systemPrompt: systemPrompt.trim() || undefined,
      modelIds: selectedModels
    });
  };

  const handleModeChange = (newMode: ExecutionMode) => {
    setMode(newMode);
    // Reset selection when changing mode
    if (newMode === 'single' && selectedModels.length > 1) {
      setSelectedModels([selectedModels[0]]);
    }
    setResults([]);
  };

  const handleAutoImprove = () => {
    if (!prompt.trim()) {
      toast.error("프롬프트를 먼저 실행해주세요");
      return;
    }

    if (results.length === 0) {
      toast.error("개선하려면 먼저 프롬프트를 실행해주세요");
      return;
    }

    // Convert results to the format expected by the API
    const formattedResults = results.map(r => ({
      modelId: r.modelId,
      modelName: r.modelName,
      response: r.response,
      executionTime: r.executionTime,
      success: r.success,
      error: r.error
    }));

    autoImproveMutation.mutate({
      prompt: prompt.trim(),
      results: formattedResults
    });
  };

  const handleApplyImprovement = async () => {
    if (!improvement) return;

    // Update prompt with improved version
    setPrompt(improvement.improvedPrompt);

    // Close improvement panel
    setShowImprovement(false);

    // Auto re-test with improved prompt
    toast.info("개선된 프롬프트로 재테스트 중...");

    setTimeout(() => {
      executeMutation.mutate({
        prompt: improvement.improvedPrompt.trim(),
        systemPrompt: systemPrompt.trim() || undefined,
        modelIds: selectedModels
      });
    }, 500);
  };

  // Calculate comparison
  const comparison = results.length > 0 ? calculateComparison(results) : null;

  return (
    <div className="min-h-screen p-4 py-8 custom-scrollbar">
      <div className="w-full max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-2">
            <Sparkles className="w-8 h-8 text-primary" />
          </div>
          <h1 className="text-3xl md:text-4xl font-bold">
            🧪 AI Playground
          </h1>
          <p className="text-muted-foreground">
            프롬프트를 테스트하고 AI 모델을 비교해보세요
          </p>
        </div>

        {/* Configuration */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column: Prompt Editor */}
          <div className="lg:col-span-2 space-y-6">
            <Card className="p-6">
              <PromptEditor
                prompt={prompt}
                onPromptChange={setPrompt}
                systemPrompt={systemPrompt}
                onSystemPromptChange={setSystemPrompt}
                disabled={executeMutation.isPending}
              />
            </Card>
          </div>

          {/* Right Column: Settings */}
          <div className="space-y-6">
            {/* Mode Selection */}
            <Card className="p-6">
              <h3 className="text-sm font-medium mb-4">실행 모드</h3>
              <RadioGroup value={mode} onValueChange={(v) => handleModeChange(v as ExecutionMode)}>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="single" id="single" />
                  <Label htmlFor="single" className="cursor-pointer">
                    단일 실행
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="compare" id="compare" />
                  <Label htmlFor="compare" className="cursor-pointer">
                    비교 모드 (2-3개)
                  </Label>
                </div>
              </RadioGroup>
            </Card>

            {/* Model Selection */}
            <Card className="p-6">
              <ModelSelector
                selectedModels={selectedModels}
                onModelToggle={handleModelToggle}
                mode={mode}
              />
            </Card>

            {/* Execute Button */}
            <Button
              onClick={handleExecute}
              disabled={executeMutation.isPending || selectedModels.length === 0}
              className="w-full h-12 text-base"
              size="lg"
            >
              {executeMutation.isPending ? (
                <>
                  <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                  실행 중...
                </>
              ) : (
                <>
                  <Play className="w-5 h-5 mr-2" />
                  실행
                </>
              )}
            </Button>
          </div>
        </div>

        {/* Results */}
        {results.length > 0 && (
          <div className="space-y-6">
            {/* Auto Improve Button */}
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-semibold">📊 실행 결과</h2>
              <Button
                onClick={handleAutoImprove}
                disabled={autoImproveMutation.isPending}
                variant="outline"
                className="gap-2"
              >
                {autoImproveMutation.isPending ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    분석 중...
                  </>
                ) : (
                  <>
                    <Wand2 className="w-4 h-4" />
                    자동 개선
                  </>
                )}
              </Button>
            </div>

            {/* Result Cards */}
            <div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {results.map((result) => (
                  <ResultCard
                    key={result.modelId}
                    result={result}
                    isFastest={comparison?.fastest === result.modelId}
                    isCheapest={comparison?.cheapest === result.modelId}
                  />
                ))}
              </div>
            </div>

            {/* Comparison Table */}
            {mode === 'compare' && comparison && results.length >= 2 && (
              <div>
                <h2 className="text-2xl font-semibold mb-4">📈 종합 비교</h2>
                <ComparisonTable comparison={comparison} />
              </div>
            )}
          </div>
        )}

        {/* Empty State */}
        {results.length === 0 && !executeMutation.isPending && (
          <Card className="p-12 text-center border-dashed">
            <Sparkles className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium mb-2">
              프롬프트를 입력하고 모델을 선택하세요
            </h3>
            <p className="text-sm text-muted-foreground">
              실행 버튼을 클릭하면 선택한 모델에서 프롬프트가 실행됩니다
            </p>
          </Card>
        )}
      </div>

      {/* Login Modal */}
      <LoginModal open={loginModalOpen} onOpenChange={setLoginModalOpen} />

      {/* Improvement Panel */}
      {showImprovement && analysis && improvement && (
        <ImprovementPanel
          originalPrompt={prompt}
          analysis={analysis}
          improvement={improvement}
          onApply={handleApplyImprovement}
          onClose={() => setShowImprovement(false)}
        />
      )}
    </div>
  );
}

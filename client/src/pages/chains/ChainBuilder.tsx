/**
 * ChainBuilder Page
 * 체인 빌더 - 새로운 체인을 생성하거나 기존 체인을 편집
 */

import React, { useState, useEffect } from 'react';
import { useLocation, useRoute } from 'wouter';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Textarea } from '../../components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../../components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { StepEditor } from '../../components/chains';
import { Plus, Save, ArrowLeft } from 'lucide-react';
import { ChainStep, ChainCategory, CATEGORY_LABELS, generateStepId } from '../../types/chain';
import { trpc } from '../../lib/trpc';
import { toast } from 'sonner';

export function ChainBuilder() {
  const [, navigate] = useLocation();
  const [match, params] = useRoute('/chains/:chainId/edit');
  const chainId = params?.chainId;

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState<ChainCategory>('custom');
  const [steps, setSteps] = useState<Partial<ChainStep>[]>([
    {
      order: 1,
      name: '',
      promptTemplate: '',
      modelId: 'claude-sonnet-4-5',
      usePreviousOutput: false,
      estimatedCost: 0.015,
    },
  ]);

  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Load existing chain for editing
  useEffect(() => {
    if (chainId) {
      setIsLoading(true);
      trpc.chains.getChainById
        .query({ chainId })
        .then((chain) => {
          setName(chain.name);
          setDescription(chain.description);
          setCategory(chain.category as ChainCategory);
          setSteps(chain.steps);
        })
        .catch((error) => {
          toast.error('체인을 불러올 수 없습니다.');
          navigate('/chains');
        })
        .finally(() => setIsLoading(false));
    }
  }, [chainId]);

  const handleAddStep = () => {
    setSteps([
      ...steps,
      {
        order: steps.length + 1,
        name: '',
        promptTemplate: '',
        modelId: 'claude-sonnet-4-5',
        usePreviousOutput: true,
        estimatedCost: 0.015,
      },
    ]);
  };

  const handleUpdateStep = (index: number, updatedStep: Partial<ChainStep>) => {
    const newSteps = [...steps];
    newSteps[index] = updatedStep;
    setSteps(newSteps);
  };

  const handleRemoveStep = (index: number) => {
    if (steps.length === 1) {
      toast.error('최소 1개의 단계가 필요합니다.');
      return;
    }

    const newSteps = steps.filter((_, i) => i !== index);
    // Re-order steps
    newSteps.forEach((step, i) => {
      step.order = i + 1;
    });
    setSteps(newSteps);
  };

  const handleMoveStep = (index: number, direction: 'up' | 'down') => {
    const newSteps = [...steps];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;

    if (targetIndex < 0 || targetIndex >= newSteps.length) return;

    // Swap
    [newSteps[index], newSteps[targetIndex]] = [
      newSteps[targetIndex],
      newSteps[index],
    ];

    // Re-order
    newSteps.forEach((step, i) => {
      step.order = i + 1;
    });

    setSteps(newSteps);
  };

  const handleSave = async () => {
    // Validation
    if (!name.trim()) {
      toast.error('체인 이름을 입력해주세요.');
      return;
    }

    const invalidSteps = steps.filter(
      (step) => !step.name?.trim() || !step.promptTemplate?.trim() || !step.modelId
    );

    if (invalidSteps.length > 0) {
      toast.error('모든 단계의 이름, 프롬프트, 모델을 입력해주세요.');
      return;
    }

    // Generate IDs for steps
    const stepsWithIds = steps.map((step) => ({
      ...step,
      id: step.id || generateStepId(),
    })) as ChainStep[];

    setIsSaving(true);

    try {
      if (chainId) {
        // Update existing chain
        await trpc.chains.updateChain.mutate({
          chainId,
          updates: {
            name,
            description,
            category,
            steps: stepsWithIds,
          },
        });

        toast.success('체인이 업데이트되었습니다.');
      } else {
        // Create new chain
        const newChain = await trpc.chains.createChain.mutate({
          name,
          description,
          category,
          steps: stepsWithIds,
        });

        toast.success('체인이 생성되었습니다.');

        navigate(`/chains/${newChain.id}/execute`);
      }
    } catch (error: any) {
      toast.error(error.message || '체인 저장에 실패했습니다.');
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">체인을 불러오는 중...</p>
        </div>
      </div>
    );
  }

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
          <h1 className="text-3xl font-bold">
            {chainId ? '체인 편집' : '새 체인 만들기'}
          </h1>
          <p className="text-muted-foreground mt-1">
            여러 단계를 연결하여 자동화된 AI 워크플로우를 생성하세요
          </p>
        </div>
        <Button onClick={handleSave} disabled={isSaving} size="lg">
          <Save className="h-4 w-4 mr-2" />
          {isSaving ? '저장 중...' : '저장'}
        </Button>
      </div>

      {/* Chain Info */}
      <Card>
        <CardHeader>
          <CardTitle>기본 정보</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="chain-name">체인 이름</Label>
            <Input
              id="chain-name"
              placeholder="예: 블로그 글 작성"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="chain-description">설명</Label>
            <Textarea
              id="chain-description"
              placeholder="이 체인의 목적과 사용 방법을 설명하세요"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="chain-category">카테고리</Label>
            <Select value={category} onValueChange={(v) => setCategory(v as ChainCategory)}>
              <SelectTrigger id="chain-category">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(CATEGORY_LABELS).map(([key, label]) => (
                  <SelectItem key={key} value={key}>
                    {label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Steps */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold">단계 ({steps.length})</h2>
          <Button onClick={handleAddStep} variant="outline">
            <Plus className="h-4 w-4 mr-2" />
            단계 추가
          </Button>
        </div>

        {steps.map((step, index) => (
          <StepEditor
            key={index}
            step={step}
            stepNumber={index + 1}
            onChange={(updatedStep) => handleUpdateStep(index, updatedStep)}
            onRemove={() => handleRemoveStep(index)}
            onMoveUp={() => handleMoveStep(index, 'up')}
            onMoveDown={() => handleMoveStep(index, 'down')}
            canMoveUp={index > 0}
            canMoveDown={index < steps.length - 1}
          />
        ))}
      </div>

      {/* Summary */}
      <Card>
        <CardHeader>
          <CardTitle>요약</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <p className="text-2xl font-bold">{steps.length}</p>
              <p className="text-sm text-muted-foreground">단계</p>
            </div>
            <div>
              <p className="text-2xl font-bold">
                ~{Math.ceil(steps.length * 30 / 60)}분
              </p>
              <p className="text-sm text-muted-foreground">예상 소요 시간</p>
            </div>
            <div>
              <p className="text-2xl font-bold">
                ${steps.reduce((sum, step) => sum + (step.estimatedCost || 0), 0).toFixed(3)}
              </p>
              <p className="text-sm text-muted-foreground">예상 비용</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

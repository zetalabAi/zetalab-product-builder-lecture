/**
 * StepEditor Component
 * 단계 편집기 - 체인의 개별 단계를 편집
 */

import React from 'react';
import { Card, CardContent, CardHeader } from '../ui/card';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import { Button } from '../ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../ui/select';
import { Switch } from '../ui/switch';
import { GripVertical, X } from 'lucide-react';
import { ChainStep, MODEL_LABELS } from '../../types/chain';

interface StepEditorProps {
  step: Partial<ChainStep>;
  stepNumber: number;
  onChange: (step: Partial<ChainStep>) => void;
  onRemove?: () => void;
  onMoveUp?: () => void;
  onMoveDown?: () => void;
  canMoveUp?: boolean;
  canMoveDown?: boolean;
}

export function StepEditor({
  step,
  stepNumber,
  onChange,
  onRemove,
  onMoveUp,
  onMoveDown,
  canMoveUp,
  canMoveDown,
}: StepEditorProps) {
  const handleChange = (field: keyof ChainStep, value: any) => {
    onChange({ ...step, [field]: value });
  };

  return (
    <Card className="relative">
      {/* Drag Handle */}
      <div className="absolute left-0 top-0 bottom-0 w-8 flex items-center justify-center text-muted-foreground hover:text-foreground cursor-grab active:cursor-grabbing">
        <GripVertical className="h-5 w-5" />
      </div>

      <CardHeader className="pl-10 pr-4 py-3 border-b flex flex-row items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="font-semibold text-sm">단계 {stepNumber}</span>
          {step.name && (
            <span className="text-sm text-muted-foreground">• {step.name}</span>
          )}
        </div>
        <div className="flex items-center gap-1">
          {canMoveUp && (
            <Button
              size="sm"
              variant="ghost"
              onClick={onMoveUp}
              title="위로 이동"
            >
              ↑
            </Button>
          )}
          {canMoveDown && (
            <Button
              size="sm"
              variant="ghost"
              onClick={onMoveDown}
              title="아래로 이동"
            >
              ↓
            </Button>
          )}
          {onRemove && (
            <Button
              size="sm"
              variant="ghost"
              onClick={onRemove}
              title="단계 삭제"
            >
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>
      </CardHeader>

      <CardContent className="pl-10 pr-4 py-4 space-y-4">
        {/* Step Name */}
        <div className="space-y-2">
          <Label htmlFor={`step-${stepNumber}-name`}>단계 이름</Label>
          <Input
            id={`step-${stepNumber}-name`}
            placeholder="예: 아이디어 브레인스토밍"
            value={step.name || ''}
            onChange={(e) => handleChange('name', e.target.value)}
          />
        </div>

        {/* Prompt Template */}
        <div className="space-y-2">
          <Label htmlFor={`step-${stepNumber}-prompt`}>
            프롬프트 템플릿
            <span className="text-xs text-muted-foreground ml-2">
              (변수: {'{{initial_input}}'}, {'{{previous_output}}'})
            </span>
          </Label>
          <Textarea
            id={`step-${stepNumber}-prompt`}
            placeholder="AI에게 전달할 프롬프트를 입력하세요..."
            value={step.promptTemplate || ''}
            onChange={(e) => handleChange('promptTemplate', e.target.value)}
            rows={6}
            className="font-mono text-sm"
          />
        </div>

        {/* Model Selection */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor={`step-${stepNumber}-model`}>AI 모델</Label>
            <Select
              value={step.modelId || ''}
              onValueChange={(value) => handleChange('modelId', value)}
            >
              <SelectTrigger id={`step-${stepNumber}-model`}>
                <SelectValue placeholder="모델 선택" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="claude-sonnet-4-5">
                  {MODEL_LABELS['claude-sonnet-4-5']}
                </SelectItem>
                <SelectItem value="claude-opus-4-6">
                  {MODEL_LABELS['claude-opus-4-6']}
                </SelectItem>
                <SelectItem value="claude-haiku-4-5">
                  Claude Haiku 4.5
                </SelectItem>
                <SelectItem value="gpt-4o">{MODEL_LABELS['gpt-4o']}</SelectItem>
                <SelectItem value="gpt-4o-mini">
                  {MODEL_LABELS['gpt-4o-mini']}
                </SelectItem>
                <SelectItem value="gemini-2.0-flash">
                  {MODEL_LABELS['gemini-2.0-flash']}
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor={`step-${stepNumber}-cost`}>
              예상 비용 ($)
            </Label>
            <Input
              id={`step-${stepNumber}-cost`}
              type="number"
              step="0.001"
              min="0"
              placeholder="0.015"
              value={step.estimatedCost || ''}
              onChange={(e) =>
                handleChange('estimatedCost', parseFloat(e.target.value) || 0)
              }
            />
          </div>
        </div>

        {/* Use Previous Output */}
        <div className="flex items-center justify-between">
          <Label htmlFor={`step-${stepNumber}-use-prev`}>
            이전 단계 출력 사용
            <span className="text-xs text-muted-foreground ml-2 block">
              활성화 시 {'{{previous_output}}'} 변수에 이전 결과가 저장됩니다
            </span>
          </Label>
          <Switch
            id={`step-${stepNumber}-use-prev`}
            checked={step.usePreviousOutput || false}
            onCheckedChange={(checked) =>
              handleChange('usePreviousOutput', checked)
            }
          />
        </div>

        {/* Description (Optional) */}
        <div className="space-y-2">
          <Label htmlFor={`step-${stepNumber}-desc`}>
            설명 (선택사항)
          </Label>
          <Textarea
            id={`step-${stepNumber}-desc`}
            placeholder="이 단계에 대한 추가 설명..."
            value={step.description || ''}
            onChange={(e) => handleChange('description', e.target.value)}
            rows={2}
          />
        </div>
      </CardContent>
    </Card>
  );
}

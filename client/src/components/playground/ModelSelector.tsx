/**
 * ModelSelector Component
 * AI 모델 선택 컴포넌트
 */

import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { AI_MODELS, AIModel } from "@/types/playground";
import { Info } from "lucide-react";

interface ModelSelectorProps {
  selectedModels: string[];
  onModelToggle: (modelId: string) => void;
  mode: 'single' | 'compare';
}

export function ModelSelector({ selectedModels, onModelToggle, mode }: ModelSelectorProps) {
  const handleToggle = (modelId: string, checked: boolean) => {
    // In single mode, only allow one selection
    if (mode === 'single' && checked) {
      onModelToggle(modelId);
    } else if (mode === 'compare') {
      onModelToggle(modelId);
    } else if (!checked) {
      // Allow unchecking in any mode
      onModelToggle(modelId);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium">모델 선택</h3>
        <Badge variant="outline" className="text-xs">
          {selectedModels.length} / {mode === 'single' ? '1' : '3'}
        </Badge>
      </div>

      <div className="space-y-3">
        {AI_MODELS.map((model) => (
          <ModelCard
            key={model.id}
            model={model}
            selected={selectedModels.includes(model.id)}
            onToggle={(checked) => handleToggle(model.id, checked)}
            disabled={
              mode === 'single' && selectedModels.length >= 1 && !selectedModels.includes(model.id)
            }
          />
        ))}
      </div>

      {mode === 'compare' && selectedModels.length < 2 && (
        <p className="text-xs text-muted-foreground flex items-start gap-1">
          <Info className="w-3 h-3 mt-0.5 flex-shrink-0" />
          비교 모드에서는 최소 2개 모델을 선택해주세요
        </p>
      )}
    </div>
  );
}

interface ModelCardProps {
  model: AIModel;
  selected: boolean;
  onToggle: (checked: boolean) => void;
  disabled?: boolean;
}

function ModelCard({ model, selected, onToggle, disabled }: ModelCardProps) {
  return (
    <div
      className={`
        flex items-start gap-3 p-3 rounded-lg border
        ${selected ? 'border-primary bg-primary/5' : 'border-border'}
        ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer hover:bg-accent/50'}
        transition-all
      `}
      onClick={() => !disabled && onToggle(!selected)}
    >
      <Checkbox
        id={model.id}
        checked={selected}
        onCheckedChange={onToggle}
        disabled={disabled}
        className="mt-1"
      />
      <div className="flex-1 min-w-0">
        <Label
          htmlFor={model.id}
          className={`flex items-center gap-2 cursor-pointer ${disabled ? 'cursor-not-allowed' : ''}`}
        >
          <span className="text-lg">{model.icon}</span>
          <span className={`font-medium ${model.color}`}>
            {model.name}
          </span>
        </Label>
        <p className="text-xs text-muted-foreground mt-1">
          {model.description}
        </p>
        <div className="flex items-center gap-2 mt-2">
          <Badge variant="secondary" className="text-xs">
            {model.provider}
          </Badge>
          <span className="text-xs text-muted-foreground">
            ${model.costPer1kTokens.toFixed(3)}/1k tokens
          </span>
        </div>
      </div>
    </div>
  );
}

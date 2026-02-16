/**
 * ChainCard Component
 * 체인 카드 - 체인 목록에서 개별 체인을 표시
 */

import React from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { Play, Edit, Trash2, Clock, DollarSign } from 'lucide-react';
import { PromptChain } from '../../types/chain';
import { CATEGORY_LABELS } from '../../types/chain';

interface ChainCardProps {
  chain: PromptChain;
  onExecute?: (chainId: string) => void;
  onEdit?: (chainId: string) => void;
  onDelete?: (chainId: string) => void;
}

export function ChainCard({ chain, onExecute, onEdit, onDelete }: ChainCardProps) {
  const categoryLabel = CATEGORY_LABELS[chain.category] || chain.category;

  return (
    <Card className="group hover:shadow-lg transition-shadow duration-200 h-full flex flex-col">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <CardTitle className="text-lg line-clamp-1">{chain.name}</CardTitle>
            <CardDescription className="mt-1.5 line-clamp-2">
              {chain.description}
            </CardDescription>
          </div>
          <Badge variant="secondary" className="ml-2 shrink-0">
            {categoryLabel}
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="flex-1">
        <div className="space-y-2 text-sm text-muted-foreground">
          <div className="flex items-center gap-2">
            <Play className="h-4 w-4" />
            <span>{chain.steps.length}단계</span>
          </div>
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4" />
            <span>
              약 {Math.ceil(chain.steps.length * 30 / 60)}분 소요
            </span>
          </div>
          <div className="flex items-center gap-2">
            <DollarSign className="h-4 w-4" />
            <span>예상 비용: ${chain.totalEstimatedCost.toFixed(3)}</span>
          </div>
        </div>

        {/* Steps Preview */}
        <div className="mt-4">
          <p className="text-xs font-medium text-muted-foreground mb-2">단계:</p>
          <div className="space-y-1">
            {chain.steps.slice(0, 3).map((step, index) => (
              <div
                key={step.id}
                className="text-xs text-muted-foreground flex items-center gap-1.5"
              >
                <span className="font-medium">{index + 1}.</span>
                <span className="line-clamp-1">{step.name}</span>
              </div>
            ))}
            {chain.steps.length > 3 && (
              <p className="text-xs text-muted-foreground">
                외 {chain.steps.length - 3}개 단계...
              </p>
            )}
          </div>
        </div>
      </CardContent>

      <CardFooter className="flex gap-2 border-t pt-4">
        {onExecute && (
          <Button
            size="sm"
            className="flex-1"
            onClick={() => onExecute(chain.id)}
          >
            <Play className="h-4 w-4 mr-1" />
            실행
          </Button>
        )}
        {onEdit && (
          <Button
            size="sm"
            variant="outline"
            onClick={() => onEdit(chain.id)}
          >
            <Edit className="h-4 w-4" />
          </Button>
        )}
        {onDelete && (
          <Button
            size="sm"
            variant="ghost"
            onClick={() => onDelete(chain.id)}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        )}
      </CardFooter>
    </Card>
  );
}

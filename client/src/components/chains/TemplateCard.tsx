/**
 * TemplateCard Component
 * 템플릿 카드 - 템플릿 목록에서 개별 템플릿을 표시
 */

import React from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { Sparkles, Users, Clock } from 'lucide-react';
import { ChainTemplate, CATEGORY_LABELS } from '../../types/chain';

interface TemplateCardProps {
  template: ChainTemplate;
  onUse?: (templateId: string) => void;
  onPreview?: (templateId: string) => void;
}

export function TemplateCard({ template, onUse, onPreview }: TemplateCardProps) {
  const categoryLabel = CATEGORY_LABELS[template.category] || template.category;

  return (
    <Card className="group hover:shadow-lg transition-shadow duration-200 h-full flex flex-col">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <CardTitle className="text-lg line-clamp-1">{template.name}</CardTitle>
              {template.isOfficial && (
                <Badge variant="default" className="shrink-0">
                  <Sparkles className="h-3 w-3 mr-1" />
                  공식
                </Badge>
              )}
            </div>
            <CardDescription className="mt-1.5 line-clamp-2">
              {template.description}
            </CardDescription>
          </div>
          <Badge variant="secondary" className="ml-2 shrink-0">
            {categoryLabel}
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="flex-1">
        {/* Tags */}
        <div className="flex flex-wrap gap-1.5 mb-4">
          {template.tags.map((tag) => (
            <Badge key={tag} variant="outline" className="text-xs">
              {tag}
            </Badge>
          ))}
        </div>

        {/* Stats */}
        <div className="space-y-2 text-sm text-muted-foreground">
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4" />
            <span>약 {Math.ceil(template.estimatedTime / 60)}분 소요</span>
          </div>
          <div className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            <span>{template.usageCount.toLocaleString()}명 사용</span>
          </div>
        </div>

        {/* Steps Preview */}
        <div className="mt-4">
          <p className="text-xs font-medium text-muted-foreground mb-2">
            {template.steps.length}단계 프로세스:
          </p>
          <div className="space-y-1">
            {template.steps.slice(0, 3).map((step, index) => (
              <div
                key={index}
                className="text-xs text-muted-foreground flex items-center gap-1.5"
              >
                <span className="font-medium">{index + 1}.</span>
                <span className="line-clamp-1">{step.name}</span>
              </div>
            ))}
            {template.steps.length > 3 && (
              <p className="text-xs text-muted-foreground">
                외 {template.steps.length - 3}개 단계...
              </p>
            )}
          </div>
        </div>
      </CardContent>

      <CardFooter className="flex gap-2 border-t pt-4">
        {onPreview && (
          <Button
            size="sm"
            variant="outline"
            className="flex-1"
            onClick={() => onPreview(template.id)}
          >
            미리보기
          </Button>
        )}
        {onUse && (
          <Button
            size="sm"
            className="flex-1"
            onClick={() => onUse(template.id)}
          >
            사용하기
          </Button>
        )}
      </CardFooter>
    </Card>
  );
}

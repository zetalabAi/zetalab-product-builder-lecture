/**
 * TemplatesBrowser Page
 * 템플릿 브라우저 - 사용 가능한 체인 템플릿을 탐색
 */

import React, { useState, useEffect } from 'react';
import { useLocation } from 'wouter';
import { Button } from '../../components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/tabs';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '../../components/ui/dialog';
import { Badge } from '../../components/ui/badge';
import { TemplateCard } from '../../components/chains';
import { ArrowLeft, Clock, DollarSign } from 'lucide-react';
import { trpc } from '../../lib/trpc';
import { toast } from 'sonner';
import type { ChainTemplate, ChainCategory } from '../../types/chain';
import { CATEGORY_LABELS, MODEL_LABELS } from '../../types/chain';

export function TemplatesBrowser() {
  const [, navigate] = useLocation();

  const [templates, setTemplates] = useState<ChainTemplate[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<ChainCategory | 'all'>('all');
  const [selectedTemplate, setSelectedTemplate] = useState<ChainTemplate | null>(null);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isUsing, setIsUsing] = useState(false);

  // Load templates
  useEffect(() => {
    loadTemplates();
  }, [selectedCategory]);

  const loadTemplates = async () => {
    setIsLoading(true);
    try {
      const data = await trpc.chains.getChainTemplates.query({
        category: selectedCategory === 'all' ? undefined : selectedCategory,
        limit: 50,
      });
      setTemplates(data);
    } catch (error) {
      toast.error('템플릿 목록을 불러올 수 없습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  const handlePreview = (templateId: string) => {
    const template = templates.find((t) => t.id === templateId);
    if (template) {
      setSelectedTemplate(template);
      setIsPreviewOpen(true);
    }
  };

  const handleUse = async (templateId: string) => {
    setIsUsing(true);
    try {
      const result = await trpc.chains.useChainTemplate.mutate({
        templateId,
      });

      toast.success('템플릿에서 체인이 생성되었습니다.');

      navigate(`/chains/${result.chainId}/execute`);
    } catch (error: any) {
      toast.error(error.message || '템플릿 사용에 실패했습니다.');
    } finally {
      setIsUsing(false);
    }
  };

  const filteredTemplates =
    selectedCategory === 'all'
      ? templates
      : templates.filter((template) => template.category === selectedCategory);

  return (
    <div className="container py-8 space-y-6">
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
            내 체인으로
          </Button>
          <h1 className="text-3xl font-bold">체인 템플릿</h1>
          <p className="text-muted-foreground mt-1">
            검증된 템플릿으로 빠르게 시작하세요
          </p>
        </div>
      </div>

      {/* Category Tabs */}
      <Tabs value={selectedCategory} onValueChange={(v) => setSelectedCategory(v as any)}>
        <TabsList>
          <TabsTrigger value="all">전체</TabsTrigger>
          {Object.entries(CATEGORY_LABELS).map(([key, label]) => (
            <TabsTrigger key={key} value={key}>
              {label}
            </TabsTrigger>
          ))}
        </TabsList>

        <TabsContent value={selectedCategory} className="mt-6">
          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="h-64 bg-muted animate-pulse rounded-lg"
                />
              ))}
            </div>
          ) : filteredTemplates.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-lg text-muted-foreground mb-4">
                {selectedCategory === 'all'
                  ? '사용 가능한 템플릿이 없습니다.'
                  : `${CATEGORY_LABELS[selectedCategory as ChainCategory]} 카테고리에 템플릿이 없습니다.`}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredTemplates.map((template) => (
                <TemplateCard
                  key={template.id}
                  template={template}
                  onPreview={handlePreview}
                  onUse={handleUse}
                />
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Preview Dialog */}
      <Dialog open={isPreviewOpen} onOpenChange={setIsPreviewOpen}>
        <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
          {selectedTemplate && (
            <>
              <DialogHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <DialogTitle className="text-2xl">
                      {selectedTemplate.name}
                    </DialogTitle>
                    <DialogDescription className="mt-2">
                      {selectedTemplate.description}
                    </DialogDescription>
                  </div>
                  <Badge variant="secondary">
                    {CATEGORY_LABELS[selectedTemplate.category]}
                  </Badge>
                </div>
              </DialogHeader>

              <div className="space-y-6">
                {/* Tags */}
                <div className="flex flex-wrap gap-2">
                  {selectedTemplate.tags.map((tag) => (
                    <Badge key={tag} variant="outline">
                      {tag}
                    </Badge>
                  ))}
                </div>

                {/* Stats */}
                <div className="grid grid-cols-3 gap-4 p-4 bg-muted rounded-lg">
                  <div className="text-center">
                    <p className="text-2xl font-bold">
                      {selectedTemplate.steps.length}
                    </p>
                    <p className="text-sm text-muted-foreground">단계</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold">
                      <Clock className="h-5 w-5 inline mr-1" />
                      {Math.ceil(selectedTemplate.estimatedTime / 60)}분
                    </p>
                    <p className="text-sm text-muted-foreground">예상 소요</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold">
                      {selectedTemplate.usageCount.toLocaleString()}
                    </p>
                    <p className="text-sm text-muted-foreground">사용자</p>
                  </div>
                </div>

                {/* Steps */}
                <div>
                  <h3 className="font-semibold mb-3">프로세스</h3>
                  <div className="space-y-4">
                    {selectedTemplate.steps.map((step, index) => (
                      <div
                        key={index}
                        className="border rounded-lg p-4 space-y-2"
                      >
                        <div className="flex items-start justify-between">
                          <h4 className="font-medium">
                            {index + 1}. {step.name}
                          </h4>
                          <Badge variant="secondary" className="text-xs">
                            {MODEL_LABELS[step.modelId] || step.modelId}
                          </Badge>
                        </div>
                        {step.description && (
                          <p className="text-sm text-muted-foreground">
                            {step.description}
                          </p>
                        )}
                        <div className="flex items-center gap-4 text-xs text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <DollarSign className="h-3 w-3" />
                            ${step.estimatedCost.toFixed(3)}
                          </span>
                          {step.usePreviousOutput && (
                            <Badge variant="outline" className="text-xs">
                              이전 출력 사용
                            </Badge>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Action */}
                <Button
                  onClick={() => {
                    setIsPreviewOpen(false);
                    handleUse(selectedTemplate.id);
                  }}
                  disabled={isUsing}
                  className="w-full"
                  size="lg"
                >
                  {isUsing ? '생성 중...' : '이 템플릿 사용하기'}
                </Button>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

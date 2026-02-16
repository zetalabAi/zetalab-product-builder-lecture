/**
 * ChainList Page
 * 체인 목록 - 사용자의 체인 목록을 표시
 */

import React, { useState, useEffect } from 'react';
import { useLocation } from 'wouter';
import { Button } from '../../components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/tabs';
import { ChainCard } from '../../components/chains';
import { Plus, Sparkles } from 'lucide-react';
import { trpc } from '../../lib/trpc';
import { toast } from 'sonner';
import type { PromptChain, ChainCategory } from '../../types/chain';
import { CATEGORY_LABELS } from '../../types/chain';

export function ChainList() {
  const [, navigate] = useLocation();

  const [chains, setChains] = useState<PromptChain[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<ChainCategory | 'all'>('all');
  const [isLoading, setIsLoading] = useState(true);

  // Load chains
  useEffect(() => {
    loadChains();
  }, [selectedCategory]);

  const loadChains = async () => {
    setIsLoading(true);
    try {
      const data = await trpc.chains.getChains.query({
        category: selectedCategory === 'all' ? undefined : selectedCategory,
        limit: 50,
      });
      setChains(data);
    } catch (error) {
      toast.error('체인 목록을 불러올 수 없습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleExecute = (chainId: string) => {
    navigate(`/chains/${chainId}/execute`);
  };

  const handleEdit = (chainId: string) => {
    navigate(`/chains/${chainId}/edit`);
  };

  const handleDelete = async (chainId: string) => {
    if (!confirm('정말로 이 체인을 삭제하시겠습니까?')) return;

    try {
      await trpc.chains.deleteChain.mutate({ chainId });
      toast.success('체인이 삭제되었습니다.');
      loadChains();
    } catch (error: any) {
      toast.error(error.message || '체인 삭제에 실패했습니다.');
    }
  };

  const filteredChains =
    selectedCategory === 'all'
      ? chains
      : chains.filter((chain) => chain.category === selectedCategory);

  return (
    <div className="container py-8 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">내 체인</h1>
          <p className="text-muted-foreground mt-1">
            저장된 프롬프트 체인을 관리하고 실행하세요
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            onClick={() => navigate('/chains/templates')}
            variant="outline"
          >
            <Sparkles className="h-4 w-4 mr-2" />
            템플릿 보기
          </Button>
          <Button onClick={() => navigate('/chains/new')}>
            <Plus className="h-4 w-4 mr-2" />
            새 체인 만들기
          </Button>
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
          ) : filteredChains.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-lg text-muted-foreground mb-4">
                {selectedCategory === 'all'
                  ? '아직 생성된 체인이 없습니다.'
                  : `${CATEGORY_LABELS[selectedCategory as ChainCategory]} 카테고리에 체인이 없습니다.`}
              </p>
              <div className="flex gap-2 justify-center">
                <Button onClick={() => navigate('/chains/new')}>
                  <Plus className="h-4 w-4 mr-2" />
                  새 체인 만들기
                </Button>
                <Button
                  onClick={() => navigate('/chains/templates')}
                  variant="outline"
                >
                  <Sparkles className="h-4 w-4 mr-2" />
                  템플릿 보기
                </Button>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredChains.map((chain) => (
                <ChainCard
                  key={chain.id}
                  chain={chain}
                  onExecute={handleExecute}
                  onEdit={handleEdit}
                  onDelete={handleDelete}
                />
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}

import { useState, useEffect } from 'react';
import { BookTemplate, Loader2 } from 'lucide-react';
import { PromptTemplate } from '../types/templates';
import { TemplateCard, TemplateDetail, TemplateFilters } from '../components/templates';
import { trpc } from '@/lib/trpc';

export default function Templates() {
  const [templates, setTemplates] = useState<PromptTemplate[]>([]);
  const [filteredTemplates, setFilteredTemplates] = useState<PromptTemplate[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedTemplate, setSelectedTemplate] = useState<PromptTemplate | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadTemplates();
  }, []);

  useEffect(() => {
    if (selectedCategory === null) {
      setFilteredTemplates(templates);
    } else {
      setFilteredTemplates(templates.filter((t) => t.category === selectedCategory));
    }
  }, [templates, selectedCategory]);

  const loadTemplates = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const result = await trpc.templates.getTemplates.query({});
      setTemplates(result.templates);
    } catch (error) {
      console.error('Failed to load templates:', error);
      setError('템플릿을 불러오는 중 오류가 발생했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex-1 flex flex-col h-screen overflow-hidden bg-zinc-50 dark:bg-black">
      {/* Header */}
      <div className="flex-none border-b border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center gap-3 mb-2">
            <BookTemplate className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">
              템플릿 라이브러리
            </h1>
          </div>
          <p className="text-sm text-zinc-600 dark:text-zinc-400">
            검증된 프롬프트 템플릿으로 빠르게 시작하세요
          </p>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          {/* Filters */}
          <div className="mb-6">
            <TemplateFilters
              selectedCategory={selectedCategory}
              onCategoryChange={setSelectedCategory}
            />
          </div>

          {/* Loading State */}
          {isLoading && (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="w-8 h-8 text-blue-600 dark:text-blue-400 animate-spin" />
            </div>
          )}

          {/* Error State */}
          {error && (
            <div className="flex items-center justify-center py-20">
              <div className="text-center">
                <p className="text-sm text-red-600 dark:text-red-400 mb-4">{error}</p>
                <button
                  onClick={loadTemplates}
                  className="px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition-colors"
                >
                  다시 시도
                </button>
              </div>
            </div>
          )}

          {/* Empty State */}
          {!isLoading && !error && filteredTemplates.length === 0 && (
            <div className="flex items-center justify-center py-20">
              <div className="text-center">
                <BookTemplate className="w-12 h-12 text-zinc-400 dark:text-zinc-600 mx-auto mb-4" />
                <p className="text-sm text-zinc-600 dark:text-zinc-400">
                  {selectedCategory === null
                    ? '사용 가능한 템플릿이 없습니다'
                    : '해당 카테고리에 템플릿이 없습니다'}
                </p>
              </div>
            </div>
          )}

          {/* Templates Grid */}
          {!isLoading && !error && filteredTemplates.length > 0 && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredTemplates.map((template) => (
                <TemplateCard
                  key={template.id}
                  template={template}
                  onClick={() => setSelectedTemplate(template)}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Template Detail Modal */}
      {selectedTemplate && (
        <TemplateDetail
          template={selectedTemplate}
          onClose={() => setSelectedTemplate(null)}
        />
      )}
    </div>
  );
}

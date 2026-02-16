import { useState, useEffect, useMemo } from 'react';
import { useLocation } from 'wouter';
import { X } from 'lucide-react';
import { PromptTemplate } from '../../types/templates';
import { CATEGORY_LABELS, CATEGORY_ICONS } from '../../types/templates';
import { VariableForm } from './VariableForm';
import { TemplatePreview } from './TemplatePreview';
import { trpc } from '@/lib/trpc';

interface TemplateDetailProps {
  template: PromptTemplate;
  onClose: () => void;
}

export function TemplateDetail({ template, onClose }: TemplateDetailProps) {
  const [, navigate] = useLocation();
  const [variableValues, setVariableValues] = useState<Record<string, string>>({});
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const categoryIcon = CATEGORY_ICONS[template.category || 'other'];
  const categoryLabel = CATEGORY_LABELS[template.category || 'other'];

  // Compute filled prompt with current variable values
  const filledPrompt = useMemo(() => {
    let result = template.templateContent;
    for (const [key, value] of Object.entries(variableValues)) {
      result = result.replace(new RegExp(`{{${key}}}`, 'g'), value);
    }
    return result;
  }, [template.templateContent, variableValues]);

  const handleVariableChange = (name: string, value: string) => {
    setVariableValues((prev) => ({ ...prev, [name]: value }));
    // Clear error when user types
    if (errors[name]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    for (const variable of template.variables) {
      if (variable.required && !variableValues[variable.name]?.trim()) {
        newErrors[variable.name] = `${variable.label}을(를) 입력해주세요`;
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleUseTemplate = async () => {
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      const result = await trpc.templates.useTemplate.mutate({
        templateId: template.id,
        variableValues,
      });

      // Navigate to intent clarification with pre-filled prompt
      navigate(`/intent/new?prompt=${encodeURIComponent(result.filledPrompt)}`);
    } catch (error) {
      console.error('Failed to use template:', error);
      alert('템플릿 사용 중 오류가 발생했습니다. 다시 시도해주세요.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Close on Escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
      <div
        className="relative w-full max-w-3xl max-h-[90vh] overflow-y-auto rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="sticky top-0 z-10 flex items-center justify-between px-6 py-4 border-b border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900">
          <div className="flex items-center gap-3">
            <span className="text-2xl">{categoryIcon}</span>
            <div>
              <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">
                {template.title}
              </h2>
              <p className="text-sm text-zinc-500 dark:text-zinc-500">
                {categoryLabel} • 사용 {template.usageCount}회
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
          >
            <X className="w-5 h-5 text-zinc-500" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Description */}
          {template.description && (
            <div>
              <p className="text-sm text-zinc-600 dark:text-zinc-400">
                {template.description}
              </p>
            </div>
          )}

          {/* Tags */}
          {template.tags.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {template.tags.map((tag, index) => (
                <span
                  key={index}
                  className="inline-flex items-center px-3 py-1 rounded-lg bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 text-sm"
                >
                  {tag}
                </span>
              ))}
            </div>
          )}

          {/* Variable Form */}
          {template.variables.length > 0 && (
            <div>
              <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100 mb-4">
                정보 입력
              </h3>
              <VariableForm
                variables={template.variables}
                values={variableValues}
                onChange={handleVariableChange}
                errors={errors}
              />
            </div>
          )}

          {/* Preview */}
          <TemplatePreview content={filledPrompt} />
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 flex items-center justify-end gap-3 px-6 py-4 border-t border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg border border-zinc-200 dark:border-zinc-800 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors"
          >
            취소
          </button>
          <button
            onClick={handleUseTemplate}
            disabled={isSubmitting}
            className="px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {isSubmitting ? '처리 중...' : '프롬프트 생성'}
          </button>
        </div>
      </div>
    </div>
  );
}

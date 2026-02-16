import { PromptTemplate } from '../../types/templates';
import { CATEGORY_LABELS, CATEGORY_ICONS } from '../../types/templates';

interface TemplateCardProps {
  template: PromptTemplate;
  onClick: () => void;
}

export function TemplateCard({ template, onClick }: TemplateCardProps) {
  const categoryIcon = CATEGORY_ICONS[template.category || 'other'];
  const categoryLabel = CATEGORY_LABELS[template.category || 'other'];

  return (
    <button
      onClick={onClick}
      className="group relative w-full text-left p-5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 hover:border-zinc-300 dark:hover:border-zinc-700 hover:shadow-md transition-all duration-200"
    >
      {/* Official Badge */}
      {template.isOfficial && (
        <div className="absolute top-3 right-3">
          <span className="inline-flex items-center px-2 py-1 rounded-md bg-blue-50 dark:bg-blue-950 text-blue-600 dark:text-blue-400 text-xs font-medium">
            공식
          </span>
        </div>
      )}

      {/* Category Icon */}
      <div className="mb-3">
        <span className="text-2xl">{categoryIcon}</span>
      </div>

      {/* Title */}
      <h3 className="text-base font-semibold text-zinc-900 dark:text-zinc-100 mb-2 pr-12 line-clamp-1">
        {template.title}
      </h3>

      {/* Description */}
      {template.description && (
        <p className="text-sm text-zinc-600 dark:text-zinc-400 mb-3 line-clamp-2">
          {template.description}
        </p>
      )}

      {/* Footer */}
      <div className="flex items-center justify-between text-xs text-zinc-500 dark:text-zinc-500">
        <span className="inline-flex items-center gap-1">
          {categoryLabel}
        </span>
        <span className="inline-flex items-center gap-1">
          사용 {template.usageCount}회
        </span>
      </div>

      {/* Tags */}
      {template.tags.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mt-3">
          {template.tags.slice(0, 3).map((tag, index) => (
            <span
              key={index}
              className="inline-flex items-center px-2 py-0.5 rounded-md bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 text-xs"
            >
              {tag}
            </span>
          ))}
          {template.tags.length > 3 && (
            <span className="inline-flex items-center px-2 py-0.5 text-zinc-500 dark:text-zinc-500 text-xs">
              +{template.tags.length - 3}
            </span>
          )}
        </div>
      )}
    </button>
  );
}

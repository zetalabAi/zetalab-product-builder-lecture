import { CATEGORY_LABELS, CATEGORY_ICONS } from '../../types/templates';

interface TemplateFiltersProps {
  selectedCategory: string | null;
  onCategoryChange: (category: string | null) => void;
}

const categories = ['blog', 'novel', 'video', 'presentation'];

export function TemplateFilters({ selectedCategory, onCategoryChange }: TemplateFiltersProps) {
  return (
    <div className="flex flex-wrap gap-2">
      <button
        onClick={() => onCategoryChange(null)}
        className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg border transition-colors ${
          selectedCategory === null
            ? 'border-blue-500 bg-blue-50 dark:bg-blue-950 text-blue-600 dark:text-blue-400'
            : 'border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-zinc-700 dark:text-zinc-300 hover:border-zinc-300 dark:hover:border-zinc-700'
        }`}
      >
        <span className="text-base">✨</span>
        <span className="text-sm font-medium">전체</span>
      </button>

      {categories.map((category) => {
        const icon = CATEGORY_ICONS[category];
        const label = CATEGORY_LABELS[category];

        return (
          <button
            key={category}
            onClick={() => onCategoryChange(category)}
            className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg border transition-colors ${
              selectedCategory === category
                ? 'border-blue-500 bg-blue-50 dark:bg-blue-950 text-blue-600 dark:text-blue-400'
                : 'border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-zinc-700 dark:text-zinc-300 hover:border-zinc-300 dark:hover:border-zinc-700'
            }`}
          >
            <span className="text-base">{icon}</span>
            <span className="text-sm font-medium">{label}</span>
          </button>
        );
      })}
    </div>
  );
}

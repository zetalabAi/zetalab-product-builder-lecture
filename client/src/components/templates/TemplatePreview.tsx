interface TemplatePreviewProps {
  content: string;
}

export function TemplatePreview({ content }: TemplatePreviewProps) {
  // Highlight unfilled variables (e.g., {{topic}})
  const highlightedContent = content.replace(
    /{{(\w+)}}/g,
    '<span class="inline-flex items-center px-2 py-0.5 rounded bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-400 font-medium">{{$1}}</span>'
  );

  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-zinc-900 dark:text-zinc-100">
        미리보기
      </label>
      <div
        className="w-full px-4 py-3 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 text-sm text-zinc-700 dark:text-zinc-300 whitespace-pre-wrap"
        dangerouslySetInnerHTML={{ __html: highlightedContent }}
      />
    </div>
  );
}

import { PromptSection as PromptSectionType, SECTION_COLORS, SECTION_BG_COLORS } from "@/utils/promptParser";
import { SectionCopyButton } from "./SectionCopyButton";

interface PromptSectionProps {
  section: PromptSectionType;
  index: number;
}

export function PromptSection({ section, index }: PromptSectionProps) {
  const colorClass = SECTION_COLORS[section.type];
  const bgColorClass = SECTION_BG_COLORS[section.type];

  return (
    <div
      className={`group relative rounded-lg border border-border/40 ${bgColorClass} p-4 hover:border-border transition-all duration-200 animate-fadeIn`}
      style={{ animationDelay: `${index * 100}ms` }}
    >
      {/* 헤더 */}
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <span className="text-xl">{section.icon}</span>
          <h4 className={`text-sm font-semibold ${colorClass}`}>
            {section.title}
          </h4>
        </div>
        <SectionCopyButton content={section.content} />
      </div>

      {/* 내용 */}
      <div className="text-sm leading-relaxed whitespace-pre-wrap break-words text-foreground/90 max-w-prose">
        {section.content}
      </div>
    </div>
  );
}

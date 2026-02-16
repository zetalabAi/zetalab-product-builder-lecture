import { Lightbulb } from "lucide-react";

interface QualitySuggestionsProps {
  suggestions: string[];
}

export function QualitySuggestions({ suggestions }: QualitySuggestionsProps) {
  return (
    <div className="space-y-3">
      <h4 className="text-sm font-medium text-muted-foreground flex items-center gap-1.5">
        <Lightbulb className="w-4 h-4" />
        개선 제안
      </h4>
      <ul className="space-y-2">
        {suggestions.map((suggestion, index) => (
          <li
            key={index}
            className="text-sm text-foreground/90 pl-4 relative before:content-['•'] before:absolute before:left-0 before:text-primary animate-fadeIn"
            style={{ animationDelay: `${800 + index * 150}ms` }}
          >
            {suggestion}
          </li>
        ))}
      </ul>
    </div>
  );
}

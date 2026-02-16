import { memo, useMemo, useState } from "react";
import { Container, Clock, ChevronUp, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";

interface BuilderBoxProps {
  leftPanelOpen: boolean;
}

export const BuilderBox = memo(function BuilderBox({
  leftPanelOpen,
}: BuilderBoxProps) {
  const [builderBoxOpen, setBuilderBoxOpen] = useState(false);

  const builderBoxItems = useMemo(() => [
    { label: "Zeta Blog", path: "#" },
    { label: "Zeta Shorts", path: "#" },
    { label: "Zeta PPT", path: "#" },
    { label: "Zeta Foto", path: "#" },
    { label: "Zeta Docs", path: "#" },
  ], []);

  const handleBuilderBoxClick = (label: string) => {
    // Coming soon - 추후 구현
  };

  if (!leftPanelOpen) return null;

  return (
    <div className="px-2 pb-3">
      <Collapsible open={builderBoxOpen} onOpenChange={setBuilderBoxOpen}>
        <CollapsibleTrigger asChild>
          <Button variant="ghost" className="w-full justify-between group">
            <span className="flex items-center gap-3">
              <Container className="h-5 w-5" />
              <span className="flex items-center gap-2">
                Builder Box
                <Clock className="h-3.5 w-3.5 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
              </span>
            </span>
            {builderBoxOpen ? (
              <ChevronUp className="h-4 w-4" />
            ) : (
              <ChevronDown className="h-4 w-4" />
            )}
          </Button>
        </CollapsibleTrigger>
        <CollapsibleContent className="mt-1 space-y-1">
          {builderBoxItems.map((item) => (
            <Button
              key={item.label}
              variant="ghost"
              className="w-full justify-start text-sm pl-9 text-muted-foreground hover:text-muted-foreground cursor-default"
              onClick={() => handleBuilderBoxClick(item.label)}
            >
              {item.label}
            </Button>
          ))}
        </CollapsibleContent>
      </Collapsible>
    </div>
  );
});

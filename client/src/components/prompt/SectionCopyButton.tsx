import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Copy, Check } from "lucide-react";
import { toast } from "sonner";

interface SectionCopyButtonProps {
  content: string;
  label?: string;
}

export function SectionCopyButton({ content, label = "복사" }: SectionCopyButtonProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(content);
      setCopied(true);
      toast.success("복사되었습니다");
      setTimeout(() => setCopied(false), 500);
    } catch (error) {
      toast.error("복사 실패");
    }
  };

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={handleCopy}
      className="h-7 px-2 text-xs opacity-0 group-hover:opacity-100 transition-opacity duration-200"
    >
      {copied ? (
        <>
          <Check className="w-3 h-3 mr-1" />
          <span>복사됨</span>
        </>
      ) : (
        <>
          <Copy className="w-3 h-3 mr-1" />
          <span>{label}</span>
        </>
      )}
    </Button>
  );
}

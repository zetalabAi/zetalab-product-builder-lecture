export interface Conversation {
  id: number;
  originalQuestion?: string;
  generatedPrompt?: string;
  clarifications?: unknown;
  finalPrompt?: string;
  createdAt: string | Date;
  updatedAt?: string | Date;
  isPinned?: boolean;
  title?: string;
}

export interface MenuItem {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  path: string;
}

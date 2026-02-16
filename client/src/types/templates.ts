/**
 * Template Types
 */

export interface TemplateVariable {
  name: string;
  label: string;
  placeholder: string;
  required: boolean;
  type: 'text' | 'textarea' | 'select';
  options?: string[];
}

export interface PromptTemplate {
  id: string;
  userId: string;
  title: string;
  description: string | null;
  templateContent: string;
  category: string | null;
  tags: string[];
  isPublic: boolean;
  usageCount: number;
  createdAt: Date;
  updatedAt: Date;
  isOfficial: boolean;
  variables: TemplateVariable[];
}

export interface TemplateCategory {
  category: string;
  count: number;
}

export const CATEGORY_LABELS: Record<string, string> = {
  blog: '블로그',
  novel: '소설',
  video: '영상',
  presentation: '발표자료',
  other: '기타',
};

export const CATEGORY_ICONS: Record<string, string> = {
  blog: '📝',
  novel: '📖',
  video: '🎬',
  presentation: '📊',
  other: '📁',
};

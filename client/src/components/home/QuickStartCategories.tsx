/**
 * QuickStartCategories Component
 * 빠른 시작 카테고리 버튼 (블로그, 소설, 영상, 발표)
 */

import { FileText, BookOpen, Video, Presentation } from "lucide-react";

export interface QuickStartCategory {
  id: string;
  label: string;
  icon: React.ReactNode;
  placeholder: string;
  example: string;
}

export const QUICK_START_CATEGORIES: QuickStartCategory[] = [
  {
    id: 'blog',
    label: '블로그 작성하기',
    icon: <FileText className="w-6 h-6" />,
    placeholder: '어떤 주제의 블로그 글을 쓰고 싶으신가요?',
    example: '2026년 AI 트렌드에 대한 블로그 글'
  },
  {
    id: 'novel',
    label: '소설 쓰기',
    icon: <BookOpen className="w-6 h-6" />,
    placeholder: '어떤 소설을 쓰고 싶으신가요?',
    example: 'SF 단편 소설 - 시간여행자의 딜레마'
  },
  {
    id: 'video',
    label: '영상 대본 쓰기',
    icon: <Video className="w-6 h-6" />,
    placeholder: '어떤 영상 대본이 필요하신가요?',
    example: '유튜브 쇼츠 대본 - 3분 요리 레시피'
  },
  {
    id: 'presentation',
    label: '발표 자료',
    icon: <Presentation className="w-6 h-6" />,
    placeholder: '어떤 발표 자료를 만들고 싶으신가요?',
    example: 'Q1 실적 보고 프레젠테이션'
  }
];

interface QuickStartCategoriesProps {
  onCategoryClick: (category: QuickStartCategory) => void;
}

export function QuickStartCategories({ onCategoryClick }: QuickStartCategoriesProps) {
  return (
    <div className="max-w-4xl mx-auto animate-fadeIn" style={{ animationDelay: '100ms' }}>
      <div className="text-center mb-6">
        <h2 className="text-2xl font-semibold mb-2">🎯 빠른 시작</h2>
        <p className="text-sm text-muted-foreground">
          카테고리를 선택하면 바로 시작할 수 있어요
        </p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {QUICK_START_CATEGORIES.map((category) => (
          <button
            key={category.id}
            onClick={() => onCategoryClick(category)}
            className="
              group relative p-6 rounded-xl border border-border
              bg-card hover:bg-accent/50
              transition-all duration-200
              hover:scale-102 hover:shadow-md
              focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2
              touch-manipulation
            "
          >
            <div className="flex flex-col items-center gap-3 text-center">
              <div className="flex items-center justify-center w-12 h-12 rounded-full bg-primary/10 text-primary group-hover:bg-primary/20 transition-colors">
                {category.icon}
              </div>
              <span className="text-sm font-medium leading-tight">
                {category.label}
              </span>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}

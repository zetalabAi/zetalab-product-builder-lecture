import { useState, useEffect } from "react";
import { useLocation, useRoute } from "wouter";
import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import { ArrowLeft, ArrowRight, SkipForward, Sparkles } from "lucide-react";
import { LoginModal } from "@/components/LoginModal";

// Builder 타입별 질문 세트
const QUESTION_SETS = {
  blog: [
    "어떤 내용을 중심으로 글을 쓰고 싶으신가요?",
    "이 글을 누가 읽을 예정인가요?",
    "이 글은 어디에 사용할 예정인가요?",
    "꼭 포함해야 하거나 절대 사용하면 안 되는 단어가 있나요?",
    "글의 길이와 구조는 어떻게 하면 좋을까요?",
  ],
  video: [
    "어떤 내용의 영상을 만들고 싶으신가요?",
    "이 영상을 누가 볼 예정인가요?",
    "어느 플랫폼에 올릴 예정인가요?",
    "영상은 얼마나 길게 만들 예정인가요?",
    "대본은 어떤 스타일로 작성하면 좋을까요?",
  ],
  presentation: [
    "무엇에 대해 발표할 예정인가요?",
    "누구 앞에서 발표하나요?",
    "발표는 얼마나 할 예정인가요?",
    "슬라이드는 대략 몇 장 정도 필요한가요?",
    "특별히 강조하고 싶은 내용이 있나요?",
  ],
  design: [
    "무엇을 디자인하고 싶으신가요?",
    "누가 이 디자인을 사용하나요?",
    "가장 중요한 기능은 무엇인가요?",
    "어떤 느낌의 디자인을 원하시나요?",
    "참고하고 싶은 디자인이나 브랜드가 있나요?",
  ],
  fallback: [
    "구체적으로 무엇을 만들고 싶으신가요?",
    "이 작업물은 어디에 사용할 예정인가요?",
    "누구를 위한 작업인가요?",
    "꼭 지켜야 할 조건이나 피해야 할 것이 있나요?",
    "최종 결과물은 어떤 모습이면 좋을까요?",
  ],
};

// Builder 타입 감지 함수
function detectBuilderType(question: string): keyof typeof QUESTION_SETS {
  const lowerQuestion = question.toLowerCase();

  // 블로그/글쓰기 키워드
  if (
    lowerQuestion.includes("블로그") ||
    lowerQuestion.includes("글") ||
    lowerQuestion.includes("작성") ||
    lowerQuestion.includes("포스팅") ||
    lowerQuestion.includes("기사") ||
    lowerQuestion.includes("콘텐츠") ||
    lowerQuestion.includes("트렌드") ||
    lowerQuestion.includes("써")
  ) {
    return "blog";
  }

  // 영상/쇼츠 키워드
  if (
    lowerQuestion.includes("영상") ||
    lowerQuestion.includes("비디오") ||
    lowerQuestion.includes("쇼츠") ||
    lowerQuestion.includes("유튜브") ||
    lowerQuestion.includes("대본") ||
    lowerQuestion.includes("동영상") ||
    lowerQuestion.includes("릴스") ||
    lowerQuestion.includes("틱톡")
  ) {
    return "video";
  }

  // PPT/프레젠테이션 키워드
  if (
    lowerQuestion.includes("ppt") ||
    lowerQuestion.includes("프레젠테이션") ||
    lowerQuestion.includes("발표") ||
    lowerQuestion.includes("슬라이드") ||
    lowerQuestion.includes("프리젠테이션")
  ) {
    return "presentation";
  }

  // 디자인 키워드
  if (
    lowerQuestion.includes("디자인") ||
    lowerQuestion.includes("ui") ||
    lowerQuestion.includes("ux") ||
    lowerQuestion.includes("웹사이트") ||
    lowerQuestion.includes("앱") ||
    lowerQuestion.includes("화면") ||
    lowerQuestion.includes("인터페이스")
  ) {
    return "design";
  }

  // 기본값
  return "fallback";
}

export default function IntentClarification() {
  const { isAuthenticated, loading } = useAuth();
  const [, navigate] = useLocation();
  const [, params] = useRoute("/intent/:sessionId");
  const sessionId = params?.sessionId || "";

  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [questions, setQuestions] = useState<string[]>([]);
  const [originalQuestion, setOriginalQuestion] = useState("");
  const [builderType, setBuilderType] = useState<keyof typeof QUESTION_SETS>("fallback");
  const [loginModalOpen, setLoginModalOpen] = useState(false);

  useEffect(() => {
    if (!isAuthenticated && !loading) {
      setLoginModalOpen(true);
      return;
    }

    // Get original question from URL
    const urlParams = new URLSearchParams(window.location.search);
    const question = urlParams.get("question");
    if (question) {
      setOriginalQuestion(question);
      
      // Detect builder type and load appropriate questions
      const detectedType = detectBuilderType(question);
      setBuilderType(detectedType);
      setQuestions(QUESTION_SETS[detectedType]);
    }
  }, [isAuthenticated, loading, navigate]);

  const generateMutation = trpc.zetaAI.generatePrompt.useMutation({
    onSuccess: (data) => {
      navigate(`/result/${data.promptId}`);
    },
    onError: (error) => {
      toast.error("프롬프트 생성 중 오류가 발생했습니다: " + error.message);
    }
  });

  const handleNext = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    } else {
      handleSubmit();
    }
  };

  const handleSkip = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    } else {
      handleSubmit();
    }
  };

  const handleBack = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
    }
  };

  const handleSubmit = () => {
    // Find skipped questions (questions without answers)
    const skippedQuestions = questions.filter(q => !answers[q] || answers[q].trim() === '');

    generateMutation.mutate({
      sessionId,
      originalQuestion,
      answers,
      skippedQuestions,
    });
  };

  const currentQuestion = questions[currentQuestionIndex];
  const currentAnswer = answers[currentQuestion] || "";

  const handleAnswerChange = (value: string) => {
    setAnswers({
      ...answers,
      [currentQuestion]: value,
    });
  };

  // Get builder type display name
  const getBuilderTypeDisplay = () => {
    const typeNames = {
      blog: "블로그/글쓰기",
      video: "영상/쇼츠",
      presentation: "프레젠테이션",
      design: "디자인",
      fallback: "일반",
    };
    return typeNames[builderType];
  };

  if (loading) {
    return (
      <div className="min-h-full flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">로딩 중...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center p-4 md:p-6 py-8 custom-scrollbar min-h-[calc(100vh-4rem)]">
      <div className="w-full max-w-3xl mx-auto space-y-4 md:space-y-6">
        {/* Header - 모바일 최적화 */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center justify-center w-10 h-10 md:w-12 md:h-12 rounded-full bg-primary/10 mb-1 md:mb-2">
            <Sparkles className="w-5 h-5 md:w-6 md:h-6 text-primary" />
          </div>
          <h1 className="text-xl md:text-2xl font-semibold">의도 파악</h1>
          <p className="text-sm md:text-base text-muted-foreground hidden md:block">
            더 정확한 프롬프트를 위해 몇 가지 질문에 답해주세요
          </p>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-secondary text-xs md:text-sm text-muted-foreground">
            <span className="w-2 h-2 rounded-full bg-primary"></span>
            {getBuilderTypeDisplay()} 모드
          </div>
        </div>

        {/* Progress - 모바일 강조 */}
        <div className="space-y-2">
          <div className="flex justify-between text-xs md:text-sm text-muted-foreground font-medium">
            <span>질문 {currentQuestionIndex + 1} / {questions.length}</span>
            <span>{Math.round(((currentQuestionIndex + 1) / questions.length) * 100)}%</span>
          </div>
          <div className="w-full h-2.5 md:h-2 bg-secondary rounded-full overflow-hidden">
            <div
              className="h-full bg-primary transition-all duration-200"
              style={{ width: `${((currentQuestionIndex + 1) / questions.length) * 100}%` }}
            />
          </div>
        </div>

        {/* Original Question - 모바일에서 축소 */}
        <Card className="p-3 md:p-4 bg-secondary/50 border-border">
          <p className="text-xs md:text-sm text-muted-foreground mb-1">원본 질문</p>
          <p className="text-sm md:text-base font-medium line-clamp-2 md:line-clamp-none">{originalQuestion}</p>
        </Card>

        {/* Current Question - 모바일 최적화 */}
        <div className="space-y-3 md:space-y-4">
          <Label htmlFor="answer" className="text-base md:text-lg font-semibold block">
            {currentQuestion}
          </Label>
          <div className="chat-input-wrapper">
            <Textarea
              id="answer"
              value={currentAnswer}
              onChange={(e) => handleAnswerChange(e.target.value)}
              placeholder="답변을 입력하세요... (건너뛰기 가능)"
              className="min-h-[140px] md:min-h-[120px] resize-none border-0 focus-visible:ring-0 focus-visible:ring-offset-0 text-base touch-manipulation"
              autoFocus
            />
          </div>
        </div>

        {/* Navigation Buttons - 모바일 터치 최적화 */}
        <div className="flex items-center justify-between gap-2 md:gap-3 pt-4">
          <Button
            variant="outline"
            onClick={handleBack}
            disabled={currentQuestionIndex === 0}
            className="flex items-center gap-1.5 md:gap-2 min-h-[44px] touch-manipulation"
            size="sm"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="hidden sm:inline">이전</span>
          </Button>

          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              onClick={handleSkip}
              className="flex items-center gap-1.5 md:gap-2 min-h-[44px] touch-manipulation"
              size="sm"
            >
              <SkipForward className="w-4 h-4" />
              <span className="hidden sm:inline">건너뛰기</span>
            </Button>

            <Button
              onClick={handleNext}
              disabled={generateMutation.isPending}
              className="flex items-center gap-1.5 md:gap-2 min-h-[44px] touch-manipulation px-4 md:px-6"
              size="sm"
            >
              {currentQuestionIndex === questions.length - 1 ? (
                <>
                  {generateMutation.isPending ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current"></div>
                      <span className="hidden sm:inline">생성 중...</span>
                    </>
                  ) : (
                    <>
                      <span className="hidden sm:inline">프롬프트 생성</span>
                      <span className="sm:hidden">생성</span>
                      <Sparkles className="w-4 h-4" />
                    </>
                  )}
                </>
              ) : (
                <>
                  <span className="hidden sm:inline">다음</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </Button>
          </div>
        </div>

        {/* Answered Questions Summary - 모바일에서 숨김 */}
        {Object.keys(answers).length > 0 && (
          <Card className="p-3 md:p-4 border-border mt-4 md:mt-6 hidden md:block">
            <p className="text-sm font-medium mb-3">답변한 질문</p>
            <div className="space-y-2">
              {Object.entries(answers).map(([question, answer], index) => (
                answer && (
                  <div key={index} className="text-sm">
                    <p className="text-muted-foreground mb-1">{question}</p>
                    <p className="font-medium truncate">{answer}</p>
                  </div>
                )
              ))}
            </div>
          </Card>
        )}
      </div>

      {/* Login Modal */}
      <LoginModal open={loginModalOpen} onOpenChange={setLoginModalOpen} />
    </div>
  );
}

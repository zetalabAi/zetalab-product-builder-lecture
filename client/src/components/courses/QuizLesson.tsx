import { QuizContent } from '../../types/courses';
import { Button } from '../ui/button';
import { Check, X, AlertCircle } from 'lucide-react';
import { useState } from 'react';

interface QuizLessonProps {
  content: QuizContent;
  isCompleted: boolean;
  savedScore?: number;
  onSubmit: (answers: number[]) => void;
}

export function QuizLesson({
  content,
  isCompleted,
  savedScore,
  onSubmit,
}: QuizLessonProps) {
  const [answers, setAnswers] = useState<(number | null)[]>(
    content.questions.map(() => null)
  );
  const [submitted, setSubmitted] = useState(false);
  const [showExplanations, setShowExplanations] = useState(false);

  const handleSelectAnswer = (questionIndex: number, optionIndex: number) => {
    if (submitted) return;

    const newAnswers = [...answers];
    newAnswers[questionIndex] = optionIndex;
    setAnswers(newAnswers);
  };

  const handleSubmit = () => {
    // Check if all questions are answered
    if (answers.some((a) => a === null)) {
      alert('모든 문제에 답해주세요!');
      return;
    }

    setSubmitted(true);
    setShowExplanations(true);
    onSubmit(answers as number[]);
  };

  const handleRetry = () => {
    setAnswers(content.questions.map(() => null));
    setSubmitted(false);
    setShowExplanations(false);
  };

  const getResult = () => {
    if (!submitted) return null;

    let correctCount = 0;
    content.questions.forEach((question, index) => {
      if (answers[index] === question.correctAnswer) {
        correctCount++;
      }
    });

    const score = Math.round((correctCount / content.questions.length) * 100);
    const passed = score >= 70;

    return { correctCount, totalCount: content.questions.length, score, passed };
  };

  const result = getResult();
  const allAnswered = answers.every((a) => a !== null);

  return (
    <div className="space-y-6">
      {/* Quiz Status */}
      {isCompleted && savedScore !== undefined && (
        <div className="border border-green-200 dark:border-green-800 rounded-lg p-4 bg-green-50 dark:bg-green-950/20">
          <div className="flex items-center gap-2">
            <Check className="w-5 h-5 text-green-600 dark:text-green-500" />
            <span className="font-medium text-green-900 dark:text-green-100">
              이미 완료한 퀴즈입니다 (점수: {savedScore}점)
            </span>
          </div>
        </div>
      )}

      {/* Result Summary */}
      {result && (
        <div
          className={`border-2 rounded-lg p-6 ${
            result.passed
              ? 'border-green-200 dark:border-green-800 bg-green-50 dark:bg-green-950/20'
              : 'border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-950/20'
          }`}
        >
          <div className="flex items-center gap-3 mb-4">
            {result.passed ? (
              <Check className="w-8 h-8 text-green-600 dark:text-green-500" />
            ) : (
              <X className="w-8 h-8 text-red-600 dark:text-red-500" />
            )}
            <div>
              <h3
                className={`text-xl font-bold ${
                  result.passed
                    ? 'text-green-900 dark:text-green-100'
                    : 'text-red-900 dark:text-red-100'
                }`}
              >
                {result.passed ? '✅ 통과!' : '❌ 재도전 필요'}
              </h3>
              <p
                className={`text-sm ${
                  result.passed
                    ? 'text-green-700 dark:text-green-300'
                    : 'text-red-700 dark:text-red-300'
                }`}
              >
                {result.correctCount} / {result.totalCount} 정답 (
                {result.score}점)
              </p>
            </div>
          </div>

          {!result.passed && (
            <div className="flex items-start gap-2 p-3 rounded bg-red-100 dark:bg-red-900/20 border border-red-200 dark:border-red-800">
              <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-500 mt-0.5 flex-shrink-0" />
              <p className="text-sm text-red-800 dark:text-red-200">
                70점 이상이 필요합니다. 다시 시도해보세요!
              </p>
            </div>
          )}
        </div>
      )}

      {/* Questions */}
      <div className="space-y-6">
        {content.questions.map((question, questionIndex) => {
          const selectedAnswer = answers[questionIndex];
          const isCorrect =
            submitted && selectedAnswer === question.correctAnswer;
          const isWrong =
            submitted &&
            selectedAnswer !== null &&
            selectedAnswer !== question.correctAnswer;

          return (
            <div
              key={questionIndex}
              className={`border rounded-lg p-6 ${
                submitted
                  ? isCorrect
                    ? 'border-green-200 dark:border-green-800 bg-green-50 dark:bg-green-950/20'
                    : isWrong
                    ? 'border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-950/20'
                    : 'border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950'
                  : 'border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950'
              }`}
            >
              {/* Question */}
              <div className="flex items-start gap-3 mb-4">
                <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 font-semibold text-sm flex-shrink-0">
                  {questionIndex + 1}
                </span>
                <p className="text-zinc-900 dark:text-zinc-100 font-medium pt-1">
                  {question.question}
                </p>
              </div>

              {/* Options */}
              <div className="space-y-2 ml-11">
                {question.options.map((option, optionIndex) => {
                  const isSelected = selectedAnswer === optionIndex;
                  const isCorrectOption =
                    optionIndex === question.correctAnswer;
                  const showCorrect = submitted && isCorrectOption;
                  const showWrong = submitted && isSelected && !isCorrectOption;

                  return (
                    <button
                      key={optionIndex}
                      onClick={() =>
                        handleSelectAnswer(questionIndex, optionIndex)
                      }
                      disabled={submitted}
                      className={`w-full text-left px-4 py-3 rounded-lg border-2 transition-all ${
                        showCorrect
                          ? 'border-green-500 dark:border-green-600 bg-green-50 dark:bg-green-950/20'
                          : showWrong
                          ? 'border-red-500 dark:border-red-600 bg-red-50 dark:bg-red-950/20'
                          : isSelected
                          ? 'border-blue-500 dark:border-blue-600 bg-blue-50 dark:bg-blue-950/20'
                          : 'border-zinc-300 dark:border-zinc-700 hover:border-zinc-400 dark:hover:border-zinc-600'
                      } ${submitted ? 'cursor-not-allowed' : 'cursor-pointer'}`}
                    >
                      <div className="flex items-center gap-3">
                        {/* Radio Button */}
                        <div
                          className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                            showCorrect
                              ? 'border-green-500 dark:border-green-600'
                              : showWrong
                              ? 'border-red-500 dark:border-red-600'
                              : isSelected
                              ? 'border-blue-500 dark:border-blue-600'
                              : 'border-zinc-400 dark:border-zinc-600'
                          }`}
                        >
                          {isSelected && (
                            <div
                              className={`w-3 h-3 rounded-full ${
                                showCorrect
                                  ? 'bg-green-500 dark:bg-green-600'
                                  : showWrong
                                  ? 'bg-red-500 dark:bg-red-600'
                                  : 'bg-blue-500 dark:bg-blue-600'
                              }`}
                            />
                          )}
                        </div>

                        {/* Option Text */}
                        <span className="text-zinc-800 dark:text-zinc-200">
                          {option}
                        </span>

                        {/* Check/X Icons */}
                        {showCorrect && (
                          <Check className="w-5 h-5 text-green-600 dark:text-green-500 ml-auto" />
                        )}
                        {showWrong && (
                          <X className="w-5 h-5 text-red-600 dark:text-red-500 ml-auto" />
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>

              {/* Explanation */}
              {showExplanations && (
                <div className="mt-4 ml-11 p-4 rounded-lg bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800">
                  <p className="text-sm text-blue-900 dark:text-blue-100">
                    <strong>해설:</strong> {question.explanation}
                  </p>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Action Buttons */}
      <div className="flex justify-end gap-3 pt-4 border-t border-zinc-200 dark:border-zinc-800">
        {submitted ? (
          result && !result.passed ? (
            <Button onClick={handleRetry} size="lg">
              다시 시도
            </Button>
          ) : (
            <div className="flex items-center gap-2 text-green-600 dark:text-green-500">
              <Check className="w-5 h-5" />
              <span className="font-medium">완료됨</span>
            </div>
          )
        ) : (
          <Button onClick={handleSubmit} size="lg" disabled={!allAnswered}>
            제출하기
          </Button>
        )}
      </div>
    </div>
  );
}

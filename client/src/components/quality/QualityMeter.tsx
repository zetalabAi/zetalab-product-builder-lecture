import { useEffect, useState } from "react";
import { getQualityGrade, QUALITY_GRADE_COLORS } from "@/types/quality";

interface QualityMeterProps {
  score: number; // 0-100
  size?: "sm" | "md" | "lg";
}

const SIZE_CONFIG = {
  sm: { width: 80, stroke: 6, fontSize: "text-lg" },
  md: { width: 120, stroke: 8, fontSize: "text-2xl" },
  lg: { width: 160, stroke: 10, fontSize: "text-3xl" },
};

export function QualityMeter({ score, size = "md" }: QualityMeterProps) {
  const [animatedScore, setAnimatedScore] = useState(0);
  const config = SIZE_CONFIG[size];
  const radius = (config.width - config.stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (animatedScore / 100) * circumference;

  const grade = getQualityGrade(score);
  const colorClass = QUALITY_GRADE_COLORS[grade];

  // 카운트업 애니메이션
  useEffect(() => {
    let start = 0;
    const duration = 1000; // 1초
    const increment = score / (duration / 16); // 60fps

    const timer = setInterval(() => {
      start += increment;
      if (start >= score) {
        setAnimatedScore(score);
        clearInterval(timer);
      } else {
        setAnimatedScore(Math.floor(start));
      }
    }, 16);

    return () => clearInterval(timer);
  }, [score]);

  return (
    <div className="relative" style={{ width: config.width, height: config.width }}>
      {/* Background Circle */}
      <svg
        className="transform -rotate-90"
        width={config.width}
        height={config.width}
      >
        <circle
          cx={config.width / 2}
          cy={config.width / 2}
          r={radius}
          stroke="currentColor"
          strokeWidth={config.stroke}
          fill="none"
          className="text-muted/20"
        />
        {/* Progress Circle */}
        <circle
          cx={config.width / 2}
          cy={config.width / 2}
          r={radius}
          stroke="currentColor"
          strokeWidth={config.stroke}
          fill="none"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          className={`${colorClass} transition-all duration-1000 ease-out`}
        />
      </svg>

      {/* Score Text */}
      <div className="absolute inset-0 flex items-center justify-center">
        <span className={`${config.fontSize} font-bold ${colorClass}`}>
          {animatedScore}
        </span>
      </div>
    </div>
  );
}

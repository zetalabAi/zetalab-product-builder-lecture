import { RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, ResponsiveContainer } from 'recharts';
import { SkillScores, SKILL_LABELS, SKILL_DESCRIPTIONS } from '../../types/progress';

interface SkillRadarProps {
  skillScores: SkillScores;
}

export function SkillRadar({ skillScores }: SkillRadarProps) {
  // Format data for radar chart
  const chartData = Object.entries(skillScores)
    .filter(([key]) => key !== 'overall')
    .map(([key, value]) => ({
      skill: SKILL_LABELS[key as keyof Omit<SkillScores, 'overall'>],
      score: value,
      fullMark: 100,
    }));

  // Find weakest skill
  const skills = Object.entries(skillScores).filter(([key]) => key !== 'overall');
  skills.sort((a, b) => a[1] - b[1]);
  const weakestSkill = skills[0];

  return (
    <div className="space-y-4">
      {/* Chart */}
      <ResponsiveContainer width="100%" height={300}>
        <RadarChart data={chartData}>
          <PolarGrid className="stroke-zinc-200 dark:stroke-zinc-800" />
          <PolarAngleAxis
            dataKey="skill"
            className="text-xs fill-zinc-600 dark:fill-zinc-400"
            tick={{ fontSize: 12 }}
          />
          <PolarRadiusAxis
            angle={90}
            domain={[0, 100]}
            className="text-xs fill-zinc-600 dark:fill-zinc-400"
            tick={{ fontSize: 10 }}
          />
          <Radar
            name="스킬 점수"
            dataKey="score"
            stroke="#3b82f6"
            fill="#3b82f6"
            fillOpacity={0.6}
          />
        </RadarChart>
      </ResponsiveContainer>

      {/* Skills List */}
      <div className="grid grid-cols-2 gap-3">
        {Object.entries(SKILL_LABELS).map(([key, label]) => {
          const score = skillScores[key as keyof Omit<SkillScores, 'overall'>];
          const description = SKILL_DESCRIPTIONS[key as keyof Omit<SkillScores, 'overall'>];
          const isWeakest = weakestSkill && key === weakestSkill[0];

          return (
            <div
              key={key}
              className={`p-3 rounded-lg border ${
                isWeakest
                  ? 'border-yellow-200 dark:border-yellow-800 bg-yellow-50 dark:bg-yellow-950/20'
                  : 'border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950'
              }`}
            >
              <div className="flex items-center justify-between mb-1">
                <span className="text-sm font-medium text-zinc-900 dark:text-zinc-100">
                  {label}
                </span>
                <span className="text-sm font-bold text-blue-600 dark:text-blue-400">
                  {score}
                </span>
              </div>
              <div className="text-xs text-zinc-500 dark:text-zinc-500 mb-2">{description}</div>
              <div className="w-full bg-zinc-200 dark:bg-zinc-800 rounded-full h-1.5">
                <div
                  className={`h-1.5 rounded-full ${
                    isWeakest ? 'bg-yellow-500' : 'bg-blue-500'
                  }`}
                  style={{ width: `${score}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>

      {/* Weakest Skill Alert */}
      {weakestSkill && weakestSkill[1] < 80 && (
        <div className="p-3 rounded-lg border border-yellow-200 dark:border-yellow-800 bg-yellow-50 dark:bg-yellow-950/20">
          <div className="flex items-start gap-2">
            <span className="text-lg">💡</span>
            <div>
              <div className="text-sm font-medium text-yellow-900 dark:text-yellow-100">
                개선 포인트
              </div>
              <div className="text-sm text-yellow-700 dark:text-yellow-300">
                "{SKILL_LABELS[weakestSkill[0] as keyof Omit<SkillScores, 'overall'>]}" 스킬을
                향상시키면 전체 품질이 더 좋아집니다!
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

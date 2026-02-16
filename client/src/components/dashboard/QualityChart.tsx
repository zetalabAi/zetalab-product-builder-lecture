import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { ScorePoint } from '../../types/progress';
import { format } from 'date-fns';
import { ko } from 'date-fns/locale';

interface QualityChartProps {
  scoreHistory: ScorePoint[];
  avgScore: number;
}

export function QualityChart({ scoreHistory, avgScore }: QualityChartProps) {
  // 최근 30개만 표시
  const recentScores = scoreHistory.slice(-30);

  // Format data for chart
  const chartData = recentScores.map((point) => ({
    date: format(new Date(point.date), 'MM/dd', { locale: ko }),
    score: point.score,
  }));

  // Calculate trend
  const firstScore = recentScores[0]?.score || 0;
  const lastScore = recentScores[recentScores.length - 1]?.score || 0;
  const trend = lastScore - firstScore;
  const trendPercent = firstScore > 0 ? Math.round((trend / firstScore) * 100) : 0;

  if (recentScores.length === 0) {
    return (
      <div className="flex items-center justify-center h-64 text-zinc-500 dark:text-zinc-500">
        아직 품질 점수 기록이 없습니다
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Stats */}
      <div className="flex items-center gap-6">
        <div>
          <div className="text-3xl font-bold text-zinc-900 dark:text-zinc-100">{avgScore}</div>
          <div className="text-sm text-zinc-600 dark:text-zinc-400">평균 점수</div>
        </div>
        {trend !== 0 && (
          <div className={`inline-flex items-center gap-1 text-sm ${
            trend > 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'
          }`}>
            <span className="text-lg">{trend > 0 ? '↑' : '↓'}</span>
            <span className="font-medium">
              {Math.abs(trend)} ({trendPercent > 0 ? '+' : ''}{trendPercent}%)
            </span>
          </div>
        )}
      </div>

      {/* Chart */}
      <ResponsiveContainer width="100%" height={250}>
        <LineChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" className="stroke-zinc-200 dark:stroke-zinc-800" />
          <XAxis
            dataKey="date"
            className="text-xs fill-zinc-600 dark:fill-zinc-400"
            tick={{ fontSize: 12 }}
          />
          <YAxis
            domain={[0, 100]}
            className="text-xs fill-zinc-600 dark:fill-zinc-400"
            tick={{ fontSize: 12 }}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: 'rgb(24 24 27)',
              border: '1px solid rgb(63 63 70)',
              borderRadius: '8px',
              color: '#fff',
            }}
            labelStyle={{ color: 'rgb(161 161 170)' }}
          />
          <Line
            type="monotone"
            dataKey="score"
            stroke="#3b82f6"
            strokeWidth={3}
            dot={{ fill: '#3b82f6', r: 4 }}
            activeDot={{ r: 6 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

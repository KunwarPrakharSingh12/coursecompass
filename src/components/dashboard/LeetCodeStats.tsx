import { cn } from '@/lib/utils';
import { Code, Flame, Trophy, Zap } from 'lucide-react';

interface LeetCodeStatsProps {
  className?: string;
}

export function LeetCodeStats({ className }: LeetCodeStatsProps) {
  const stats = {
    totalSolved: 147,
    easy: 68,
    medium: 62,
    hard: 17,
    streak: 12,
    rating: 1542,
    contestRank: 'Top 15%',
  };

  return (
    <div className={cn("glass-card p-5 rounded-xl animate-fade-in", className)}>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <span className="text-xl">🧩</span>
          <h3 className="text-sm font-medium">LeetCode Progress</h3>
        </div>
        <div className="flex items-center gap-1 text-leetcode">
          <Flame className="w-4 h-4" />
          <span className="text-sm font-bold">{stats.streak} days</span>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-2 mb-4">
        <div className="p-3 rounded-lg bg-success/10 border border-success/20 text-center">
          <span className="block text-lg font-bold text-success">{stats.easy}</span>
          <span className="text-[10px] text-muted-foreground">Easy</span>
        </div>
        <div className="p-3 rounded-lg bg-warning/10 border border-warning/20 text-center">
          <span className="block text-lg font-bold text-warning">{stats.medium}</span>
          <span className="text-[10px] text-muted-foreground">Medium</span>
        </div>
        <div className="p-3 rounded-lg bg-distraction/10 border border-distraction/20 text-center">
          <span className="block text-lg font-bold text-distraction">{stats.hard}</span>
          <span className="text-[10px] text-muted-foreground">Hard</span>
        </div>
      </div>

      <div className="space-y-2">
        <div className="flex items-center justify-between p-2 rounded-lg bg-secondary/30">
          <div className="flex items-center gap-2">
            <Code className="w-4 h-4 text-muted-foreground" />
            <span className="text-xs">Total Solved</span>
          </div>
          <span className="text-sm font-bold">{stats.totalSolved}</span>
        </div>
        <div className="flex items-center justify-between p-2 rounded-lg bg-secondary/30">
          <div className="flex items-center gap-2">
            <Zap className="w-4 h-4 text-leetcode" />
            <span className="text-xs">Rating</span>
          </div>
          <span className="text-sm font-bold">{stats.rating}</span>
        </div>
        <div className="flex items-center justify-between p-2 rounded-lg bg-secondary/30">
          <div className="flex items-center gap-2">
            <Trophy className="w-4 h-4 text-focus" />
            <span className="text-xs">Contest Rank</span>
          </div>
          <span className="text-sm font-bold text-focus">{stats.contestRank}</span>
        </div>
      </div>
    </div>
  );
}

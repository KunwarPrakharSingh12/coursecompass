import { cn } from '@/lib/utils';
import { GitCommit, GitPullRequest, Star } from 'lucide-react';

interface GitHubActivityProps {
  className?: string;
}

export function GitHubActivity({ className }: GitHubActivityProps) {
  // Contribution grid mock data
  const contributions = Array.from({ length: 52 }, () => 
    Array.from({ length: 7 }, () => Math.floor(Math.random() * 5))
  );

  const getContributionColor = (level: number) => {
    const colors = [
      'bg-secondary',
      'bg-github/20',
      'bg-github/40',
      'bg-github/70',
      'bg-github',
    ];
    return colors[level];
  };

  const stats = {
    commits: 23,
    pullRequests: 3,
    streak: 8,
    stars: 12,
  };

  return (
    <div className={cn("glass-card p-5 rounded-xl animate-fade-in", className)}>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <span className="text-xl">💻</span>
          <h3 className="text-sm font-medium">GitHub Activity</h3>
        </div>
        <span className="text-xs text-muted-foreground">Last 52 weeks</span>
      </div>

      {/* Contribution Grid (simplified) */}
      <div className="mb-4 overflow-hidden">
        <div className="flex gap-0.5">
          {contributions.slice(-20).map((week, weekIndex) => (
            <div key={weekIndex} className="flex flex-col gap-0.5">
              {week.map((level, dayIndex) => (
                <div
                  key={dayIndex}
                  className={cn(
                    "w-2 h-2 rounded-sm transition-all hover:scale-125",
                    getContributionColor(level)
                  )}
                />
              ))}
            </div>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2">
        <div className="flex items-center gap-2 p-2 rounded-lg bg-secondary/30">
          <GitCommit className="w-4 h-4 text-github" />
          <div>
            <span className="block text-sm font-bold">{stats.commits}</span>
            <span className="text-[10px] text-muted-foreground">Commits (week)</span>
          </div>
        </div>
        <div className="flex items-center gap-2 p-2 rounded-lg bg-secondary/30">
          <GitPullRequest className="w-4 h-4 text-focus" />
          <div>
            <span className="block text-sm font-bold">{stats.pullRequests}</span>
            <span className="text-[10px] text-muted-foreground">Pull Requests</span>
          </div>
        </div>
      </div>
    </div>
  );
}

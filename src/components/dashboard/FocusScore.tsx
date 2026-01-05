import { cn } from '@/lib/utils';

interface FocusScoreProps {
  score: number;
  className?: string;
}

export function FocusScore({ score, className }: FocusScoreProps) {
  const circumference = 2 * Math.PI * 45;
  const strokeDashoffset = circumference - (score / 100) * circumference;
  
  const getScoreColor = () => {
    if (score >= 80) return 'text-success stroke-success';
    if (score >= 60) return 'text-focus stroke-focus';
    if (score >= 40) return 'text-warning stroke-warning';
    return 'text-distraction stroke-distraction';
  };

  const getScoreLabel = () => {
    if (score >= 80) return 'Excellent';
    if (score >= 60) return 'Good';
    if (score >= 40) return 'Fair';
    return 'Needs Focus';
  };

  return (
    <div className={cn("glass-card p-6 rounded-xl animate-fade-in", className)}>
      <h3 className="text-sm font-medium text-muted-foreground mb-4">Focus Score</h3>
      
      <div className="relative w-32 h-32 mx-auto">
        {/* Background circle */}
        <svg className="w-full h-full -rotate-90">
          <circle
            cx="64"
            cy="64"
            r="45"
            fill="none"
            stroke="currentColor"
            strokeWidth="8"
            className="text-secondary"
          />
          {/* Progress circle */}
          <circle
            cx="64"
            cy="64"
            r="45"
            fill="none"
            strokeWidth="8"
            strokeLinecap="round"
            className={cn("transition-all duration-1000 ease-out", getScoreColor())}
            style={{
              strokeDasharray: circumference,
              strokeDashoffset: strokeDashoffset,
            }}
          />
        </svg>
        
        {/* Center content */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className={cn("text-3xl font-bold", getScoreColor().split(' ')[0])}>
            {score}
          </span>
          <span className="text-xs text-muted-foreground mt-0.5">{getScoreLabel()}</span>
        </div>
      </div>

      <div className="mt-4 space-y-2">
        <div className="flex justify-between text-xs">
          <span className="text-muted-foreground">Study Time</span>
          <span className="font-medium">3h 5m</span>
        </div>
        <div className="flex justify-between text-xs">
          <span className="text-muted-foreground">Distraction</span>
          <span className="font-medium text-distraction">32m</span>
        </div>
        <div className="flex justify-between text-xs">
          <span className="text-muted-foreground">Problems</span>
          <span className="font-medium text-success">4 solved</span>
        </div>
      </div>
    </div>
  );
}

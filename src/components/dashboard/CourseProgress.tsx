import { Progress } from '@/components/ui/progress';
import { mockDSACourse } from '@/data/mockData';
import { cn } from '@/lib/utils';
import { BookOpen, Target, TrendingUp } from 'lucide-react';

interface CourseProgressProps {
  className?: string;
}

export function CourseProgress({ className }: CourseProgressProps) {
  const getProgressColor = (progress: number) => {
    if (progress >= 75) return 'bg-success';
    if (progress >= 50) return 'bg-focus';
    if (progress >= 25) return 'bg-warning';
    return 'bg-muted';
  };

  return (
    <div className={cn("glass-card p-5 rounded-xl animate-fade-in", className)}>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <BookOpen className="w-4 h-4 text-focus" />
          <h3 className="text-sm font-medium">DSA Mastery</h3>
        </div>
        <span className="text-2xl font-bold text-focus">{mockDSACourse.overallProgress}%</span>
      </div>

      <Progress 
        value={mockDSACourse.overallProgress} 
        className="h-2 mb-4"
        indicatorClassName="bg-focus"
      />

      <div className="space-y-2.5 max-h-[220px] overflow-y-auto pr-1 custom-scrollbar">
        {mockDSACourse.topics.map((topic, index) => (
          <div 
            key={topic.id}
            className={cn(
              "flex items-center gap-3 p-2 rounded-lg hover:bg-secondary/30 transition-colors",
              "animate-slide-up"
            )}
            style={{ animationDelay: `${index * 50}ms` }}
          >
            <div className={cn(
              "w-1.5 h-8 rounded-full",
              getProgressColor(topic.progress)
            )} />
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs font-medium truncate">{topic.name}</span>
                <span className="text-xs text-muted-foreground">{topic.progress}%</span>
              </div>
              <Progress 
                value={topic.progress} 
                className="h-1"
                indicatorClassName={getProgressColor(topic.progress)}
              />
            </div>
          </div>
        ))}
      </div>

      <div className="mt-4 pt-3 border-t border-border flex items-center justify-between">
        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <Target className="w-3.5 h-3.5" />
          <span>Target: Jun 30</span>
        </div>
        <div className="flex items-center gap-1.5 text-xs text-success">
          <TrendingUp className="w-3.5 h-3.5" />
          <span>On Track</span>
        </div>
      </div>
    </div>
  );
}

import { cn } from '@/lib/utils';
import { mockTodaySchedule } from '@/data/mockData';
import { format } from 'date-fns';
import { Check, Clock, Play } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface TodayScheduleProps {
  className?: string;
}

export function TodaySchedule({ className }: TodayScheduleProps) {
  const now = new Date();
  
  return (
    <div className={cn("glass-card p-5 rounded-xl animate-fade-in", className)}>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-medium text-muted-foreground">Today's Schedule</h3>
        <span className="text-xs text-muted-foreground">{format(now, 'EEEE, MMM d')}</span>
      </div>

      <div className="relative">
        {/* Timeline line */}
        <div className="absolute left-[11px] top-2 bottom-2 w-0.5 bg-border" />
        
        <div className="space-y-4">
          {mockTodaySchedule.map((block, index) => {
            const isActive = !block.completed && index === 2; // Simulate current block
            
            return (
              <div 
                key={block.id}
                className={cn(
                  "relative flex gap-4 animate-slide-up",
                )}
                style={{ animationDelay: `${index * 100}ms` }}
              >
                {/* Timeline dot */}
                <div className={cn(
                  "w-6 h-6 rounded-full border-2 flex items-center justify-center shrink-0 z-10",
                  block.completed 
                    ? "bg-success border-success" 
                    : isActive 
                      ? "bg-focus border-focus animate-pulse" 
                      : "bg-secondary border-border"
                )}>
                  {block.completed ? (
                    <Check className="w-3 h-3 text-success-foreground" />
                  ) : isActive ? (
                    <Play className="w-3 h-3 text-focus-foreground" />
                  ) : (
                    <Clock className="w-3 h-3 text-muted-foreground" />
                  )}
                </div>

                {/* Content */}
                <div className={cn(
                  "flex-1 p-3 rounded-lg transition-all",
                  block.completed 
                    ? "bg-success/10 border border-success/20" 
                    : isActive 
                      ? "bg-focus/10 border border-focus/30 glow-primary" 
                      : "bg-secondary/30"
                )}>
                  <div className="flex items-center justify-between mb-1">
                    <span className={cn(
                      "text-sm font-medium",
                      block.completed && "text-success"
                    )}>
                      {block.topicName}
                    </span>
                    {isActive && (
                      <Button size="sm" variant="glow" className="h-6 text-xs">
                        Start
                      </Button>
                    )}
                  </div>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <span>{format(block.startTime, 'h:mm a')} - {format(block.endTime, 'h:mm a')}</span>
                    {block.completed && block.actualDuration && (
                      <>
                        <span>•</span>
                        <span className="text-success">{block.actualDuration} min actual</span>
                      </>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

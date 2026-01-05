import { cn } from '@/lib/utils';
import { mockRecentSessions, getCategoryColor, getCategoryLabel, getPlatformIcon } from '@/data/mockData';
import { formatDistanceToNow } from 'date-fns';

interface ActivityFeedProps {
  className?: string;
}

export function ActivityFeed({ className }: ActivityFeedProps) {
  return (
    <div className={cn("glass-card p-5 rounded-xl animate-fade-in", className)}>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-medium text-muted-foreground">Recent Activity</h3>
        <span className="text-xs text-muted-foreground">Last 4 hours</span>
      </div>

      <div className="space-y-3">
        {mockRecentSessions.map((session, index) => (
          <div 
            key={session.id}
            className={cn(
              "flex items-start gap-3 p-3 rounded-lg bg-secondary/30 hover:bg-secondary/50 transition-colors",
              "animate-slide-up"
            )}
            style={{ animationDelay: `${index * 100}ms` }}
          >
            <span className="text-xl">{getPlatformIcon(session.platform)}</span>
            
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-sm font-medium truncate">{session.title}</span>
                <span className={cn(
                  "platform-badge text-[10px]",
                  getCategoryColor(session.category),
                  session.category === 'distraction' ? 'text-distraction-foreground' : 
                  session.category === 'light-study' ? 'text-warning-foreground' : 'text-success-foreground'
                )}>
                  {getCategoryLabel(session.category)}
                </span>
              </div>
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <span>{session.duration} min</span>
                <span>•</span>
                <span>{formatDistanceToNow(session.startTime, { addSuffix: true })}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

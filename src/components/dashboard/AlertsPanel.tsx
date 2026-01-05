import { cn } from '@/lib/utils';
import { mockAlerts } from '@/data/mockData';
import { formatDistanceToNow } from 'date-fns';
import { AlertTriangle, Info, XCircle, Bell } from 'lucide-react';

interface AlertsPanelProps {
  className?: string;
}

export function AlertsPanel({ className }: AlertsPanelProps) {
  const getAlertIcon = (type: 'warning' | 'critical' | 'info') => {
    switch (type) {
      case 'critical':
        return <XCircle className="w-4 h-4" />;
      case 'warning':
        return <AlertTriangle className="w-4 h-4" />;
      default:
        return <Info className="w-4 h-4" />;
    }
  };

  const getAlertStyles = (type: 'warning' | 'critical' | 'info') => {
    switch (type) {
      case 'critical':
        return 'border-distraction/30 bg-distraction/10 text-distraction';
      case 'warning':
        return 'border-warning/30 bg-warning/10 text-warning';
      default:
        return 'border-focus/30 bg-focus/10 text-focus';
    }
  };

  return (
    <div className={cn("glass-card p-5 rounded-xl animate-fade-in", className)}>
      <div className="flex items-center gap-2 mb-4">
        <Bell className="w-4 h-4 text-muted-foreground" />
        <h3 className="text-sm font-medium text-muted-foreground">Recent Alerts</h3>
      </div>

      <div className="space-y-3">
        {mockAlerts.map((alert, index) => (
          <div
            key={alert.id}
            className={cn(
              "p-3 rounded-lg border transition-all animate-slide-up",
              getAlertStyles(alert.type),
              !alert.read && "ring-1 ring-offset-1 ring-offset-background",
              alert.type === 'critical' && !alert.read && "ring-distraction/50",
              alert.type === 'warning' && !alert.read && "ring-warning/50",
              alert.type === 'info' && !alert.read && "ring-focus/50"
            )}
            style={{ animationDelay: `${index * 100}ms` }}
          >
            <div className="flex items-start gap-3">
              <div className="shrink-0 mt-0.5">
                {getAlertIcon(alert.type)}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-sm font-medium text-foreground">{alert.title}</span>
                  {!alert.read && (
                    <span className="w-1.5 h-1.5 rounded-full bg-current" />
                  )}
                </div>
                <p className="text-xs text-muted-foreground">{alert.message}</p>
                <span className="text-[10px] text-muted-foreground mt-1 block">
                  {formatDistanceToNow(alert.timestamp, { addSuffix: true })}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

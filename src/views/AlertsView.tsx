import { useState } from 'react';
import { cn } from '@/lib/utils';
import { 
  Bell, AlertTriangle, XCircle, CheckCircle2, 
  Loader2, Filter, Trash2, CheckCheck
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useAlerts } from '@/hooks/useAlerts';
import { formatDistanceToNow } from 'date-fns';

export function AlertsView() {
  const { alerts, loading, markAsRead, markAllAsRead, deleteAlert } = useAlerts();
  const [filter, setFilter] = useState<'all' | 'unread' | 'critical' | 'warning' | 'info'>('all');

  const filteredAlerts = alerts.filter(alert => {
    if (filter === 'all') return true;
    if (filter === 'unread') return !alert.read;
    return alert.type === filter;
  });

  const unreadCount = alerts.filter(a => !a.read).length;

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-warning/20 flex items-center justify-center">
            <Bell className="w-5 h-5 text-warning" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">Alerts</h1>
            <p className="text-muted-foreground text-sm">
              {unreadCount > 0 ? `${unreadCount} unread alerts` : 'All caught up!'}
            </p>
          </div>
        </div>
        
        <div className="flex items-center gap-3">
          <Select value={filter} onValueChange={(v) => setFilter(v as typeof filter)}>
            <SelectTrigger className="w-[140px]">
              <Filter className="w-4 h-4 mr-2" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All</SelectItem>
              <SelectItem value="unread">Unread</SelectItem>
              <SelectItem value="critical">Critical</SelectItem>
              <SelectItem value="warning">Warning</SelectItem>
              <SelectItem value="info">Info</SelectItem>
            </SelectContent>
          </Select>
          
          {unreadCount > 0 && (
            <Button variant="outline" size="sm" onClick={markAllAsRead}>
              <CheckCheck className="w-4 h-4 mr-2" />
              Mark All Read
            </Button>
          )}
        </div>
      </div>

      {/* Alert Stats */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { 
            type: 'critical', 
            label: 'Critical', 
            count: alerts.filter(a => a.type === 'critical').length,
            color: 'text-distraction',
            bg: 'bg-distraction/10'
          },
          { 
            type: 'warning', 
            label: 'Warnings', 
            count: alerts.filter(a => a.type === 'warning').length,
            color: 'text-warning',
            bg: 'bg-warning/10'
          },
          { 
            type: 'info', 
            label: 'Info', 
            count: alerts.filter(a => a.type === 'info').length,
            color: 'text-focus',
            bg: 'bg-focus/10'
          },
        ].map((stat) => (
          <div 
            key={stat.type}
            className={cn("glass-card p-4 rounded-xl cursor-pointer transition-all hover:ring-2 hover:ring-border", filter === stat.type && "ring-2 ring-primary")}
            onClick={() => setFilter(stat.type as typeof filter)}
          >
            <div className={cn("text-2xl font-bold", stat.color)}>{stat.count}</div>
            <div className="text-sm text-muted-foreground">{stat.label}</div>
          </div>
        ))}
      </div>

      {/* Alerts List */}
      {filteredAlerts.length === 0 ? (
        <div className="glass-card p-12 rounded-xl text-center">
          <Bell className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
          <h2 className="text-xl font-semibold mb-2">No Alerts</h2>
          <p className="text-muted-foreground">
            {filter === 'all' ? "You're all caught up!" : `No ${filter} alerts found.`}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredAlerts.map((alert, index) => (
            <div
              key={alert.id}
              className={cn(
                "glass-card p-4 rounded-xl border-l-4 animate-slide-up transition-all",
                alert.type === 'critical' && "border-distraction",
                alert.type === 'warning' && "border-warning",
                alert.type === 'info' && "border-focus",
                alert.read && "opacity-60"
              )}
              style={{ animationDelay: `${index * 30}ms` }}
            >
              <div className="flex items-start gap-4">
                <div className={cn(
                  "w-10 h-10 rounded-lg flex items-center justify-center shrink-0",
                  alert.type === 'critical' && "bg-distraction/20",
                  alert.type === 'warning' && "bg-warning/20",
                  alert.type === 'info' && "bg-focus/20"
                )}>
                  {alert.type === 'critical' ? (
                    <XCircle className="w-5 h-5 text-distraction" />
                  ) : alert.type === 'warning' ? (
                    <AlertTriangle className="w-5 h-5 text-warning" />
                  ) : (
                    <CheckCircle2 className="w-5 h-5 text-focus" />
                  )}
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-medium">{alert.title}</h3>
                    {!alert.read && (
                      <span className="w-2 h-2 rounded-full bg-focus" />
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground">{alert.message}</p>
                  <p className="text-xs text-muted-foreground mt-2">
                    {formatDistanceToNow(new Date(alert.created_at), { addSuffix: true })}
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  {!alert.read && (
                    <Button 
                      variant="ghost" 
                      size="icon"
                      onClick={() => markAsRead(alert.id)}
                      title="Mark as read"
                    >
                      <CheckCircle2 className="w-4 h-4" />
                    </Button>
                  )}
                  <Button 
                    variant="ghost" 
                    size="icon"
                    onClick={() => deleteAlert(alert.id)}
                    title="Delete"
                  >
                    <Trash2 className="w-4 h-4 text-muted-foreground" />
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

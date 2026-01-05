import { Bell, User, Clock, Wifi } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAlerts } from '@/hooks/useAlerts';
import { cn } from '@/lib/utils';
import { useState, useEffect } from 'react';

interface HeaderProps {
  onAlertsClick?: () => void;
}

export function Header({ onAlertsClick }: HeaderProps) {
  const { unreadCount } = useAlerts();
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const timeString = currentTime.toLocaleTimeString('en-US', { 
    hour: '2-digit', 
    minute: '2-digit',
    hour12: true 
  });

  return (
    <header className="h-16 border-b border-border bg-background/80 backdrop-blur-xl sticky top-0 z-30 flex items-center justify-between px-6">
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2 text-muted-foreground">
          <Clock className="w-4 h-4" />
          <span className="text-sm font-mono">{timeString}</span>
        </div>
        <div className="h-4 w-px bg-border" />
        
        {/* Live Monitoring Indicator */}
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-success/10 border border-success/20">
          <div className="relative">
            <div className="w-2 h-2 rounded-full bg-success" />
            <div className="absolute inset-0 w-2 h-2 rounded-full bg-success animate-ping" />
          </div>
          <Wifi className="w-3 h-3 text-success" />
          <span className="text-xs font-medium text-success">Monitoring Active</span>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <Button 
          variant="ghost" 
          size="icon" 
          className="relative"
          onClick={onAlertsClick}
        >
          <Bell className="w-5 h-5" />
          {unreadCount > 0 && (
            <span className="absolute -top-0.5 -right-0.5 w-4 h-4 rounded-full bg-distraction text-[10px] font-medium text-distraction-foreground flex items-center justify-center">
              {unreadCount}
            </span>
          )}
        </Button>
        <div className="h-6 w-px bg-border" />
        <Button variant="ghost" size="sm" className="gap-2">
          <div className="w-8 h-8 rounded-full bg-gradient-primary flex items-center justify-center">
            <User className="w-4 h-4 text-primary-foreground" />
          </div>
          <span className="text-sm font-medium">Student</span>
        </Button>
      </div>
    </header>
  );
}

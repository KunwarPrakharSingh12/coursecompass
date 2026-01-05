import { cn } from '@/lib/utils';
import { LucideIcon } from 'lucide-react';

interface StatsCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: LucideIcon;
  trend?: {
    value: number;
    positive: boolean;
  };
  variant?: 'default' | 'success' | 'warning' | 'destructive' | 'focus';
  className?: string;
}

export function StatsCard({ 
  title, 
  value, 
  subtitle, 
  icon: Icon, 
  trend,
  variant = 'default',
  className 
}: StatsCardProps) {
  const variantStyles = {
    default: 'border-border',
    success: 'border-success/30 bg-success/5',
    warning: 'border-warning/30 bg-warning/5',
    destructive: 'border-distraction/30 bg-distraction/5',
    focus: 'border-focus/30 bg-focus/5',
  };

  const iconStyles = {
    default: 'text-muted-foreground',
    success: 'text-success',
    warning: 'text-warning',
    destructive: 'text-distraction',
    focus: 'text-focus',
  };

  return (
    <div className={cn(
      "glass-card p-5 rounded-xl border transition-all duration-300 hover:shadow-card animate-fade-in",
      variantStyles[variant],
      className
    )}>
      <div className="flex items-start justify-between">
        <div className="space-y-1">
          <p className="text-sm text-muted-foreground">{title}</p>
          <p className="text-3xl font-bold tracking-tight">{value}</p>
          {subtitle && (
            <p className="text-xs text-muted-foreground">{subtitle}</p>
          )}
        </div>
        <div className={cn(
          "p-2.5 rounded-lg bg-secondary/50",
          iconStyles[variant]
        )}>
          <Icon className="w-5 h-5" />
        </div>
      </div>
      {trend && (
        <div className="mt-3 flex items-center gap-1">
          <span className={cn(
            "text-xs font-medium",
            trend.positive ? "text-success" : "text-distraction"
          )}>
            {trend.positive ? '↑' : '↓'} {Math.abs(trend.value)}%
          </span>
          <span className="text-xs text-muted-foreground">vs last week</span>
        </div>
      )}
    </div>
  );
}

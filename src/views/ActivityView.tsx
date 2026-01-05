import { useState } from 'react';
import { cn } from '@/lib/utils';
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from 'recharts';
import { 
  Calendar, Clock, Filter, Download, Search, 
  TrendingUp, TrendingDown, Minus, ChevronDown, Loader2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue 
} from '@/components/ui/select';
import { getCategoryColor, getCategoryLabel, getPlatformIcon } from '@/data/mockData';
import { format } from 'date-fns';
import { useActivityTracking } from '@/hooks/useActivityTracking';
import { useAuth } from '@/hooks/useAuth';
import { ManualActivityLogger } from '@/components/activity/ManualActivityLogger';

export function ActivityView() {
  const [dateRange, setDateRange] = useState('today');
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  
  const { user } = useAuth();
  const { sessions, loading, getTodayStats, getWeeklyStats } = useActivityTracking();

  const todayStats = getTodayStats();
  const weeklyStats = getWeeklyStats();

  // Generate hourly data for the heatmap from real sessions
  const generateHourlyData = () => {
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const data: { day: string; hour: number; value: number; }[] = [];
    
    days.forEach((day, dayIndex) => {
      for (let hour = 6; hour <= 23; hour++) {
        const hourSessions = sessions.filter(s => {
          const d = new Date(s.start_time);
          return d.getDay() === dayIndex && d.getHours() === hour;
        });
        const value = hourSessions.reduce((sum, s) => sum + (s.duration || 0), 0);
        
        data.push({
          day,
          hour,
          value: Math.min(value, 60),
        });
      }
    });
    
    return data;
  };

  const hourlyHeatmapData = generateHourlyData();

  // Generate timeline data from real sessions
  const timelineData = Array.from({ length: 24 }, (_, hour) => {
    const hourSessions = sessions.filter(s => {
      const d = new Date(s.start_time);
      const today = new Date();
      return d.toDateString() === today.toDateString() && d.getHours() === hour;
    });

    const study = hourSessions
      .filter(s => s.category !== 'distraction')
      .reduce((sum, s) => sum + (s.duration || 0), 0);
    const distraction = hourSessions
      .filter(s => s.category === 'distraction')
      .reduce((sum, s) => sum + (s.duration || 0), 0);

    return {
      hour: `${hour.toString().padStart(2, '0')}:00`,
      study,
      distraction,
    };
  });

  const getHeatmapColor = (value: number) => {
    if (value >= 45) return 'bg-success';
    if (value >= 30) return 'bg-focus';
    if (value >= 15) return 'bg-warning/60';
    return 'bg-secondary';
  };

  const filteredLogs = sessions.filter(log => {
    if (filterCategory !== 'all' && log.category !== filterCategory) return false;
    if (searchQuery && !log.title.toLowerCase().includes(searchQuery.toLowerCase())) return false;
    return true;
  }).slice(0, 20);

  if (!user) {
    return (
      <div className="glass-card p-8 rounded-xl text-center">
        <h2 className="text-xl font-semibold mb-2">Please sign in</h2>
        <p className="text-muted-foreground">You need to be logged in to view activity.</p>
      </div>
    );
  }

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
        <div>
          <h1 className="text-2xl font-bold">Activity Analytics</h1>
          <p className="text-muted-foreground text-sm">Deep dive into your productivity patterns</p>
        </div>
        <div className="flex items-center gap-3">
          <ManualActivityLogger onActivityLogged={() => window.location.reload()} />
          <Select value={dateRange} onValueChange={setDateRange}>
            <SelectTrigger className="w-[140px]">
              <Calendar className="w-4 h-4 mr-2" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="today">Today</SelectItem>
              <SelectItem value="week">This Week</SelectItem>
              <SelectItem value="month">This Month</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" size="icon">
            <Download className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Total Active Time', value: `${Math.floor(todayStats.totalMinutes / 60)}h ${todayStats.totalMinutes % 60}m`, change: 12, positive: true },
          { label: 'Focus Sessions', value: todayStats.totalSessions.toString(), change: 2, positive: true },
          { label: 'Study Time', value: `${Math.floor(todayStats.studyMinutes / 60)}h ${todayStats.studyMinutes % 60}m`, change: 5, positive: true },
          { label: 'Focus Score', value: `${todayStats.focusScore}%`, change: todayStats.focusScore >= 80 ? 3 : -3, positive: todayStats.focusScore >= 80 },
        ].map((stat, index) => (
          <div key={index} className="glass-card p-4 rounded-xl animate-fade-in" style={{ animationDelay: `${index * 50}ms` }}>
            <p className="text-xs text-muted-foreground mb-1">{stat.label}</p>
            <div className="flex items-end justify-between">
              <span className="text-2xl font-bold">{stat.value}</span>
              <div className={cn(
                "flex items-center gap-0.5 text-xs font-medium",
                stat.positive ? "text-success" : "text-distraction"
              )}>
                {stat.change > 0 ? <TrendingUp className="w-3 h-3" /> : 
                 stat.change < 0 ? <TrendingDown className="w-3 h-3" /> : <Minus className="w-3 h-3" />}
                {Math.abs(stat.change)}%
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Hourly Activity Timeline */}
      <div className="glass-card p-5 rounded-xl">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-medium">Hourly Activity Timeline</h3>
          <div className="flex items-center gap-4 text-xs">
            <div className="flex items-center gap-1.5">
              <div className="w-3 h-3 rounded-sm bg-focus" />
              <span className="text-muted-foreground">Study</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-3 h-3 rounded-sm bg-distraction" />
              <span className="text-muted-foreground">Distraction</span>
            </div>
          </div>
        </div>
        <div className="h-[200px]">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={timelineData}>
              <defs>
                <linearGradient id="studyGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="hsl(var(--focus))" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="hsl(var(--focus))" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
              <XAxis 
                dataKey="hour" 
                axisLine={false} 
                tickLine={false}
                tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 10 }}
                interval={2}
              />
              <YAxis 
                axisLine={false} 
                tickLine={false}
                tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 10 }}
                tickFormatter={(v) => `${v}m`}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'hsl(var(--popover))',
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '8px',
                }}
              />
              <Area 
                type="monotone" 
                dataKey="study" 
                stroke="hsl(var(--focus))" 
                fill="url(#studyGradient)"
                strokeWidth={2}
              />
              <Area 
                type="monotone" 
                dataKey="distraction" 
                stroke="hsl(var(--distraction))" 
                fill="hsl(var(--distraction))"
                fillOpacity={0.1}
                strokeWidth={2}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Weekly Heatmap */}
      <div className="glass-card p-5 rounded-xl">
        <h3 className="font-medium mb-4">Weekly Activity Heatmap</h3>
        <div className="overflow-x-auto">
          <div className="min-w-[600px]">
            {/* Hours header */}
            <div className="flex mb-2 ml-12">
              {Array.from({ length: 18 }, (_, i) => i + 6).map(hour => (
                <div key={hour} className="w-8 text-center text-[10px] text-muted-foreground">
                  {hour}
                </div>
              ))}
            </div>
            {/* Grid */}
            {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map(day => (
              <div key={day} className="flex items-center mb-1">
                <span className="w-12 text-xs text-muted-foreground">{day}</span>
                <div className="flex gap-0.5">
                  {hourlyHeatmapData
                    .filter(d => d.day === day)
                    .map((cell, i) => (
                      <div
                        key={i}
                        className={cn(
                          "w-7 h-6 rounded-sm transition-all hover:scale-110 cursor-pointer",
                          getHeatmapColor(cell.value)
                        )}
                        title={`${day} ${cell.hour}:00 - ${cell.value} min active`}
                      />
                    ))}
                </div>
              </div>
            ))}
          </div>
        </div>
        <div className="flex items-center justify-end gap-2 mt-4 text-xs text-muted-foreground">
          <span>Less</span>
          <div className="flex gap-1">
            <div className="w-4 h-4 rounded-sm bg-secondary" />
            <div className="w-4 h-4 rounded-sm bg-warning/60" />
            <div className="w-4 h-4 rounded-sm bg-focus" />
            <div className="w-4 h-4 rounded-sm bg-success" />
          </div>
          <span>More</span>
        </div>
      </div>

      {/* Session Logs */}
      <div className="glass-card p-5 rounded-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
          <h3 className="font-medium">Session Logs</h3>
          <div className="flex items-center gap-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input 
                placeholder="Search sessions..." 
                className="pl-9 w-[200px]"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <Select value={filterCategory} onValueChange={setFilterCategory}>
              <SelectTrigger className="w-[150px]">
                <Filter className="w-4 h-4 mr-2" />
                <SelectValue placeholder="Filter" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                <SelectItem value="deep-study">Deep Study</SelectItem>
                <SelectItem value="coding-practice">Coding Practice</SelectItem>
                <SelectItem value="light-study">Light Study</SelectItem>
                <SelectItem value="distraction">Distraction</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {filteredLogs.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <p>No activity sessions recorded yet.</p>
            <p className="text-sm mt-1">Sessions are logged automatically as you use the app.</p>
          </div>
        ) : (
          <div className="space-y-2">
            {filteredLogs.map((log, index) => (
              <div 
                key={log.id}
                className={cn(
                  "flex items-center gap-4 p-3 rounded-lg bg-secondary/30 hover:bg-secondary/50 transition-all animate-slide-up",
                  log.category === 'distraction' && "border-l-2 border-distraction"
                )}
                style={{ animationDelay: `${index * 50}ms` }}
              >
                <span className="text-xl">{getPlatformIcon(log.platform as any)}</span>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium truncate">{log.title}</span>
                    <span className={cn(
                      "platform-badge text-[10px]",
                      getCategoryColor(log.category as any),
                      log.category === 'distraction' ? 'text-distraction-foreground' : 'text-success-foreground'
                    )}>
                      {getCategoryLabel(log.category as any)}
                    </span>
                  </div>
                  <div className="flex items-center gap-3 text-xs text-muted-foreground mt-0.5">
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {log.duration || 0} min
                    </span>
                    <span>{format(new Date(log.start_time), 'h:mm a')}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {filteredLogs.length > 0 && sessions.length > 20 && (
          <Button variant="ghost" className="w-full mt-4">
            Load More Sessions
            <ChevronDown className="w-4 h-4 ml-2" />
          </Button>
        )}
      </div>
    </div>
  );
}

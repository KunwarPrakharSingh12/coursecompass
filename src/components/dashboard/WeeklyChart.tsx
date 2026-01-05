import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { mockWeeklyData } from '@/data/mockData';
import { cn } from '@/lib/utils';

interface WeeklyChartProps {
  className?: string;
}

export function WeeklyChart({ className }: WeeklyChartProps) {
  return (
    <div className={cn("glass-card p-5 rounded-xl animate-fade-in", className)}>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-medium text-muted-foreground">Weekly Overview</h3>
        <div className="flex items-center gap-4 text-xs">
          <div className="flex items-center gap-1.5">
            <div className="w-2.5 h-2.5 rounded-sm bg-focus" />
            <span className="text-muted-foreground">Study</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-2.5 h-2.5 rounded-sm bg-distraction" />
            <span className="text-muted-foreground">Distraction</span>
          </div>
        </div>
      </div>

      <div className="h-[240px]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={mockWeeklyData} barGap={4}>
            <CartesianGrid 
              strokeDasharray="3 3" 
              stroke="hsl(var(--border))" 
              vertical={false}
            />
            <XAxis 
              dataKey="day" 
              axisLine={false}
              tickLine={false}
              tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}
            />
            <YAxis 
              axisLine={false}
              tickLine={false}
              tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}
              tickFormatter={(value) => `${value}m`}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: 'hsl(var(--popover))',
                border: '1px solid hsl(var(--border))',
                borderRadius: '8px',
                boxShadow: 'var(--shadow-card)',
              }}
              labelStyle={{ color: 'hsl(var(--foreground))' }}
              itemStyle={{ color: 'hsl(var(--foreground))' }}
              formatter={(value: number) => [`${value} min`, '']}
            />
            <Bar 
              dataKey="study" 
              fill="hsl(var(--focus))" 
              radius={[4, 4, 0, 0]}
              name="Study Time"
            />
            <Bar 
              dataKey="distraction" 
              fill="hsl(var(--distraction))" 
              radius={[4, 4, 0, 0]}
              name="Distraction"
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { mockPlatformUsage } from '@/data/mockData';
import { cn } from '@/lib/utils';

interface PlatformUsageProps {
  className?: string;
}

export function PlatformUsage({ className }: PlatformUsageProps) {
  const total = mockPlatformUsage.reduce((sum, item) => sum + item.value, 0);

  return (
    <div className={cn("glass-card p-5 rounded-xl animate-fade-in", className)}>
      <h3 className="text-sm font-medium text-muted-foreground mb-4">Platform Usage</h3>

      <div className="flex items-center gap-4">
        <div className="w-28 h-28">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={mockPlatformUsage}
                cx="50%"
                cy="50%"
                innerRadius={30}
                outerRadius={45}
                paddingAngle={3}
                dataKey="value"
              >
                {mockPlatformUsage.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{
                  backgroundColor: 'hsl(var(--popover))',
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '8px',
                }}
                formatter={(value: number) => [`${value} min`, '']}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div className="flex-1 space-y-2">
          {mockPlatformUsage.map((platform) => (
            <div key={platform.name} className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div 
                  className="w-2.5 h-2.5 rounded-sm"
                  style={{ backgroundColor: platform.color }}
                />
                <span className="text-xs">{platform.name}</span>
              </div>
              <div className="text-xs text-muted-foreground">
                {Math.round((platform.value / total) * 100)}%
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

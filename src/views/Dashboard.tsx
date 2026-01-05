import { StatsCard } from '@/components/dashboard/StatsCard';
import { FocusScore } from '@/components/dashboard/FocusScore';
import { ActivityFeed } from '@/components/dashboard/ActivityFeed';
import { WeeklyChart } from '@/components/dashboard/WeeklyChart';
import { PlatformUsage } from '@/components/dashboard/PlatformUsage';
import { CourseProgress } from '@/components/dashboard/CourseProgress';
import { TodaySchedule } from '@/components/dashboard/TodaySchedule';
import { AlertsPanel } from '@/components/dashboard/AlertsPanel';
import { LeetCodeStats } from '@/components/dashboard/LeetCodeStats';
import { GitHubActivity } from '@/components/dashboard/GitHubActivity';
import { mockTodayStats } from '@/data/mockData';
import { Clock, Code, GitCommit, Target, AlertTriangle, TrendingUp } from 'lucide-react';

export function Dashboard() {
  const formatTime = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}h ${mins}m`;
  };

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div className="animate-fade-in">
        <h1 className="text-2xl font-bold mb-1">Good afternoon! 👋</h1>
        <p className="text-muted-foreground">Let's maintain focus and crush today's targets.</p>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard
          title="Study Time"
          value={formatTime(mockTodayStats.totalStudyTime)}
          subtitle="Today"
          icon={Clock}
          variant="success"
          trend={{ value: 12, positive: true }}
        />
        <StatsCard
          title="Problems Solved"
          value={mockTodayStats.problemsSolved}
          subtitle="LeetCode"
          icon={Code}
          variant="focus"
          trend={{ value: 5, positive: true }}
        />
        <StatsCard
          title="Commits"
          value={mockTodayStats.commitsMade}
          subtitle="GitHub"
          icon={GitCommit}
          variant="success"
        />
        <StatsCard
          title="Distraction"
          value={formatTime(mockTodayStats.totalDistractionTime)}
          subtitle="Below limit"
          icon={AlertTriangle}
          variant="warning"
          trend={{ value: 8, positive: false }}
        />
      </div>

      {/* Main Dashboard Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column */}
        <div className="lg:col-span-8 space-y-6">
          <WeeklyChart />
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <LeetCodeStats />
            <GitHubActivity />
          </div>
          
          <ActivityFeed />
        </div>

        {/* Right Column */}
        <div className="lg:col-span-4 space-y-6">
          <FocusScore score={mockTodayStats.focusScore} />
          <TodaySchedule />
          <CourseProgress />
          <PlatformUsage />
          <AlertsPanel />
        </div>
      </div>
    </div>
  );
}

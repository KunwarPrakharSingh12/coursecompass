import { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { 
  Shield, Lock, Eye, Bell, AlertTriangle, Clock, 
  TrendingUp, Calendar, Settings, Mail, Send,
  CheckCircle2, XCircle, BarChart3, LogOut, Loader2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Progress } from '@/components/ui/progress';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { PanicMode } from '@/components/PanicMode';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell
} from 'recharts';
import { useAuth } from '@/hooks/useAuth';
import { useAlerts } from '@/hooks/useAlerts';
import { useCourses } from '@/hooks/useCourses';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { formatDistanceToNow } from 'date-fns';

const weeklyProgress = [
  { day: 'Mon', study: 4.2, target: 4, problems: 5 },
  { day: 'Tue', study: 3.8, target: 4, problems: 4 },
  { day: 'Wed', study: 5.1, target: 4, problems: 7 },
  { day: 'Thu', study: 3.2, target: 4, problems: 3 },
  { day: 'Fri', study: 4.5, target: 4, problems: 6 },
  { day: 'Sat', study: 2.0, target: 3, problems: 2 },
  { day: 'Sun', study: 3.5, target: 3, problems: 4 },
];

const platformBreakdown = [
  { name: 'LeetCode', value: 45, color: 'hsl(38, 92%, 50%)' },
  { name: 'GitHub', value: 25, color: 'hsl(142, 71%, 45%)' },
  { name: 'Learning', value: 20, color: 'hsl(192, 91%, 56%)' },
  { name: 'Distraction', value: 10, color: 'hsl(0, 72%, 51%)' },
];

interface ParentModeProps {
  onLockdown?: (active: boolean) => void;
  isLocked?: boolean;
}

export function ParentMode({ onLockdown, isLocked = false }: ParentModeProps) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState<'overview' | 'alerts' | 'settings'>('overview');
  const [notificationSettings, setNotificationSettings] = useState({
    focus_drops: true,
    schedule_changes: true,
    weekly_reports: true,
    achievement_alerts: false,
    push_enabled: false,
  });
  const [parentEmail, setParentEmail] = useState('');
  const [weeklyReportDay, setWeeklyReportDay] = useState('0');
  const [loadingSettings, setLoadingSettings] = useState(false);
  const [savingEmail, setSavingEmail] = useState(false);
  const [sendingTestReport, setSendingTestReport] = useState(false);

  const { user } = useAuth();
  const { alerts, loading: alertsLoading, markAsRead, requestNotificationPermission } = useAlerts();
  const { courses } = useCourses();
  const { toast } = useToast();

  useEffect(() => {
    if (user) {
      loadNotificationSettings();
    }
  }, [user]);

  const loadNotificationSettings = async () => {
    if (!user) return;
    
    const { data: settings } = await supabase
      .from('notification_settings')
      .select('*')
      .eq('user_id', user.id)
      .maybeSingle();

    if (settings) {
      setNotificationSettings({
        focus_drops: settings.focus_drops ?? true,
        schedule_changes: settings.schedule_changes ?? true,
        weekly_reports: settings.weekly_reports ?? true,
        achievement_alerts: settings.achievement_alerts ?? false,
        push_enabled: settings.push_enabled ?? false,
      });
    }

    const { data: profile } = await supabase
      .from('profiles')
      .select('parent_email, weekly_report_day')
      .eq('user_id', user.id)
      .maybeSingle();

    if (profile) {
      setParentEmail(profile.parent_email || '');
      setWeeklyReportDay(String(profile.weekly_report_day ?? 0));
    }
  };

  const saveParentEmail = async () => {
    if (!user) return;
    setSavingEmail(true);

    const { error } = await supabase
      .from('profiles')
      .update({ 
        parent_email: parentEmail || null,
        weekly_report_day: parseInt(weeklyReportDay, 10)
      })
      .eq('user_id', user.id);

    setSavingEmail(false);

    if (error) {
      toast({ title: 'Error', description: 'Failed to save email settings', variant: 'destructive' });
    } else {
      toast({ title: 'Saved', description: 'Parent email settings updated' });
    }
  };

  const sendTestReport = async () => {
    if (!user || !parentEmail) {
      toast({ title: 'Error', description: 'Please configure parent email first', variant: 'destructive' });
      return;
    }
    
    setSendingTestReport(true);
    
    const { error } = await supabase.functions.invoke('send-weekly-report', {
      body: { user_id: user.id, force: true }
    });

    setSendingTestReport(false);

    if (error) {
      toast({ title: 'Error', description: 'Failed to send test report', variant: 'destructive' });
    } else {
      toast({ title: 'Sent', description: `Test report sent to ${parentEmail}` });
    }
  };

  const saveNotificationSettings = async (key: string, value: boolean) => {
    if (!user) return;
    setLoadingSettings(true);

    const updates = { ...notificationSettings, [key]: value };
    setNotificationSettings(updates);

    const { error } = await supabase
      .from('notification_settings')
      .update({ [key]: value })
      .eq('user_id', user.id);

    if (error) {
      toast({ title: 'Error', description: 'Failed to save settings', variant: 'destructive' });
    }
    setLoadingSettings(false);
  };

  const handleEnablePush = async () => {
    const granted = await requestNotificationPermission();
    if (granted) {
      await saveNotificationSettings('push_enabled', true);
    }
  };

  const handleLogin = async () => {
    if (!user) {
      setError('Please log in to your account first.');
      return;
    }

    const { data: profile } = await supabase
      .from('profiles')
      .select('parent_password')
      .eq('user_id', user.id)
      .maybeSingle();

    const storedPassword = profile?.parent_password || 'parent123';
    
    if (password === storedPassword) {
      setIsAuthenticated(true);
      setError('');
    } else {
      setError('Incorrect password. Default: "parent123"');
    }
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    setPassword('');
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center">
        <div className="glass-card p-8 rounded-2xl w-full max-w-md animate-scale-in">
          <div className="text-center mb-8">
            <div className="w-16 h-16 rounded-2xl bg-warning/20 flex items-center justify-center mx-auto mb-4">
              <Shield className="w-8 h-8 text-warning" />
            </div>
            <h1 className="text-2xl font-bold mb-2">Parent Access</h1>
            <p className="text-muted-foreground text-sm">
              Enter your parent password to access monitoring controls
            </p>
          </div>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  id="password"
                  type="password"
                  placeholder="Enter parent password"
                  className="pl-10"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleLogin()}
                />
              </div>
              {error && <p className="text-xs text-distraction">{error}</p>}
            </div>

            <Button className="w-full" size="lg" onClick={handleLogin}>
              <Eye className="w-4 h-4 mr-2" />
              Access Dashboard
            </Button>
          </div>

          <div className="mt-6 p-4 rounded-lg bg-secondary/50 text-center">
            <p className="text-xs text-muted-foreground">
              🔒 This dashboard is protected. Student cannot bypass this screen.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-warning/20 flex items-center justify-center">
            <Shield className="w-5 h-5 text-warning" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">Parent Dashboard</h1>
            <p className="text-muted-foreground text-sm">Monitor learning progress and manage alerts</p>
          </div>
        </div>
        <Button variant="outline" onClick={handleLogout}>
          <LogOut className="w-4 h-4 mr-2" />
          Exit Parent Mode
        </Button>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-border pb-2">
        {[
          { id: 'overview', label: 'Overview', icon: BarChart3 },
          { id: 'alerts', label: 'Alerts', icon: Bell, badge: alerts.filter(a => !a.read).length },
          { id: 'settings', label: 'Settings', icon: Settings },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as typeof activeTab)}
            className={cn(
              "flex items-center gap-2 px-4 py-2 rounded-lg transition-all",
              activeTab === tab.id 
                ? "bg-secondary text-foreground" 
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            <tab.icon className="w-4 h-4" />
            {tab.label}
            {tab.badge !== undefined && tab.badge > 0 && (
              <span className="px-1.5 py-0.5 text-[10px] rounded-full bg-distraction text-distraction-foreground">
                {tab.badge}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Overview Tab */}
      {activeTab === 'overview' && (
        <div className="space-y-6 animate-fade-in">
          {/* Quick Stats */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { label: 'Weekly Study', value: '26.3h', target: '28h', positive: false, icon: Clock },
              { label: 'Problems Solved', value: '31', target: '35', positive: false, icon: CheckCircle2 },
              { label: 'Focus Score', value: '78%', change: '+5%', positive: true, icon: TrendingUp },
              { label: 'Schedule Adherence', value: '85%', change: '-3%', positive: false, icon: Calendar },
            ].map((stat, index) => (
              <div key={index} className="glass-card p-4 rounded-xl">
                <div className="flex items-center justify-between mb-2">
                  <stat.icon className="w-5 h-5 text-muted-foreground" />
                  {stat.change && (
                    <span className={cn(
                      "text-xs font-medium",
                      stat.positive ? "text-success" : "text-distraction"
                    )}>
                      {stat.change}
                    </span>
                  )}
                </div>
                <div className="text-2xl font-bold">{stat.value}</div>
                <div className="text-xs text-muted-foreground">
                  {stat.target ? `Target: ${stat.target}` : stat.label}
                </div>
              </div>
            ))}
          </div>

          {/* Charts Row */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 glass-card p-5 rounded-xl">
              <h3 className="font-medium mb-4">Weekly Study Progress</h3>
              <div className="h-[240px]">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={weeklyProgress}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }} />
                    <YAxis axisLine={false} tickLine={false} tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }} tickFormatter={(v) => `${v}h`} />
                    <Tooltip contentStyle={{ backgroundColor: 'hsl(var(--popover))', border: '1px solid hsl(var(--border))', borderRadius: '8px' }} />
                    <Line type="monotone" dataKey="study" stroke="hsl(var(--focus))" strokeWidth={2} dot={{ fill: 'hsl(var(--focus))' }} name="Actual" />
                    <Line type="monotone" dataKey="target" stroke="hsl(var(--muted-foreground))" strokeWidth={2} strokeDasharray="5 5" dot={false} name="Target" />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="glass-card p-5 rounded-xl">
              <h3 className="font-medium mb-4">Time Distribution</h3>
              <div className="h-[160px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={platformBreakdown} cx="50%" cy="50%" innerRadius={40} outerRadius={60} paddingAngle={3} dataKey="value">
                      {platformBreakdown.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="space-y-2 mt-4">
                {platformBreakdown.map((item) => (
                  <div key={item.name} className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-sm" style={{ backgroundColor: item.color }} />
                      <span className="text-muted-foreground">{item.name}</span>
                    </div>
                    <span className="font-medium">{item.value}%</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Course Progress */}
          <div className="glass-card p-5 rounded-xl">
            <h3 className="font-medium mb-4">Course Progress</h3>
            <div className="space-y-4">
              {courses.length > 0 ? courses.map((course) => (
                <div key={course.id}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm">{course.name}</span>
                    <span className="text-sm font-medium">{course.overall_progress}%</span>
                  </div>
                  <Progress value={course.overall_progress} className="h-2" indicatorClassName={
                    course.overall_progress >= 75 ? 'bg-success' :
                    course.overall_progress >= 50 ? 'bg-focus' :
                    course.overall_progress >= 25 ? 'bg-warning' : 'bg-muted'
                  } />
                </div>
              )) : (
                <p className="text-sm text-muted-foreground">No courses yet. Create one in Course Management.</p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Alerts Tab */}
      {activeTab === 'alerts' && (
        <div className="space-y-4 animate-fade-in">
          {alertsLoading ? (
            <div className="flex items-center justify-center p-8">
              <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
            </div>
          ) : alerts.length === 0 ? (
            <div className="glass-card p-8 rounded-xl text-center">
              <Bell className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
              <p className="text-muted-foreground">No alerts yet</p>
            </div>
          ) : (
            alerts.map((alert, index) => (
              <div
                key={alert.id}
                className={cn(
                  "glass-card p-4 rounded-xl border-l-4 animate-slide-up",
                  alert.type === 'critical' && "border-distraction",
                  alert.type === 'warning' && "border-warning",
                  alert.type === 'info' && "border-focus",
                  alert.read && "opacity-60"
                )}
                style={{ animationDelay: `${index * 50}ms` }}
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
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="font-medium">{alert.title}</h4>
                      {alert.read && (
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-success/20 text-success">Read</span>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground">{alert.message}</p>
                    <span className="text-xs text-muted-foreground mt-1 block">
                      {formatDistanceToNow(new Date(alert.created_at), { addSuffix: true })}
                    </span>
                  </div>
                  {!alert.read && (
                    <Button variant="ghost" size="sm" onClick={() => markAsRead(alert.id)}>
                      Mark Read
                    </Button>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* Settings Tab */}
      {activeTab === 'settings' && (
        <div className="space-y-6 animate-fade-in">
          {/* Parent Email Configuration */}
          <div className="glass-card p-5 rounded-xl">
            <h3 className="font-medium mb-4 flex items-center gap-2">
              <Mail className="w-4 h-4" />
              Parent Email Notifications
            </h3>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="parent-email">Parent Email Address</Label>
                <Input
                  id="parent-email"
                  type="email"
                  placeholder="parent@example.com"
                  value={parentEmail}
                  onChange={(e) => setParentEmail(e.target.value)}
                />
                <p className="text-xs text-muted-foreground">
                  Alerts and weekly reports will be sent to this email
                </p>
              </div>
              <div className="space-y-2">
                <Label>Weekly Report Day</Label>
                <Select value={weeklyReportDay} onValueChange={setWeeklyReportDay}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="0">Sunday</SelectItem>
                    <SelectItem value="1">Monday</SelectItem>
                    <SelectItem value="2">Tuesday</SelectItem>
                    <SelectItem value="3">Wednesday</SelectItem>
                    <SelectItem value="4">Thursday</SelectItem>
                    <SelectItem value="5">Friday</SelectItem>
                    <SelectItem value="6">Saturday</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex gap-2">
                <Button onClick={saveParentEmail} disabled={savingEmail}>
                  {savingEmail ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
                  Save Email Settings
                </Button>
                <Button variant="outline" onClick={sendTestReport} disabled={sendingTestReport || !parentEmail}>
                  {sendingTestReport ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Send className="w-4 h-4 mr-2" />}
                  Send Test Report
                </Button>
              </div>
            </div>
          </div>

          {/* Push Notifications */}
          <div className="glass-card p-5 rounded-xl">
            <h3 className="font-medium mb-4">Push Notifications</h3>
            <div className="flex items-center justify-between py-2">
              <div>
                <p className="text-sm font-medium">Enable Browser Notifications</p>
                <p className="text-xs text-muted-foreground">Receive instant alerts in your browser</p>
              </div>
              {notificationSettings.push_enabled ? (
                <Switch checked={true} disabled />
              ) : (
                <Button variant="outline" size="sm" onClick={handleEnablePush}>
                  Enable
                </Button>
              )}
            </div>
          </div>

          {/* Notification Settings */}
          <div className="glass-card p-5 rounded-xl">
            <h3 className="font-medium mb-4">Notification Preferences</h3>
            <div className="space-y-4">
              {[
                { key: 'focus_drops', label: 'Focus Drops', description: 'When focus score drops significantly' },
                { key: 'schedule_changes', label: 'Schedule Changes', description: 'When schedule is modified or missed' },
                { key: 'weekly_reports', label: 'Weekly Reports', description: 'Comprehensive weekly progress report' },
                { key: 'achievement_alerts', label: 'Achievement Alerts', description: 'When goals are achieved' },
              ].map((setting) => (
                <div key={setting.key} className="flex items-center justify-between py-2">
                  <div>
                    <p className="text-sm font-medium">{setting.label}</p>
                    <p className="text-xs text-muted-foreground">{setting.description}</p>
                  </div>
                  <Switch 
                    checked={notificationSettings[setting.key as keyof typeof notificationSettings]}
                    onCheckedChange={(checked) => saveNotificationSettings(setting.key, checked)}
                    disabled={loadingSettings}
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Daily Limits */}
          <div className="glass-card p-5 rounded-xl">
            <h3 className="font-medium mb-4">Daily Limits</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Max Distraction Time (minutes)</Label>
                <Input type="number" defaultValue={60} />
              </div>
              <div className="space-y-2">
                <Label>Max Break Duration (minutes)</Label>
                <Input type="number" defaultValue={30} />
              </div>
              <div className="space-y-2">
                <Label>Min Daily Study Hours</Label>
                <Input type="number" defaultValue={4} />
              </div>
              <div className="space-y-2">
                <Label>Min Problems per Day</Label>
                <Input type="number" defaultValue={3} />
              </div>
            </div>
            <Button className="mt-4">Save Limits</Button>
          </div>

          {/* Panic Mode */}
          {onLockdown && (
            <PanicMode onLockdown={onLockdown} isLocked={isLocked} />
          )}
        </div>
      )}
    </div>
  );
}

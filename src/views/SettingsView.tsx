import { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { 
  User, Bell, Shield, Palette, Download, LogOut, 
  Loader2, Check, Moon, Sun, Monitor
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export function SettingsView() {
  const { user, signOut } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [profile, setProfile] = useState({
    full_name: '',
    parent_email: '',
    parent_password: '',
  });
  const [notifications, setNotifications] = useState({
    push_enabled: false,
    focus_drops: true,
    schedule_changes: true,
    weekly_reports: true,
    achievement_alerts: false,
  });
  const [theme, setTheme] = useState('dark');
  const [pwaInstallable, setPwaInstallable] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);

  useEffect(() => {
    if (user) {
      loadSettings();
    }

    // Check for PWA installability
    window.addEventListener('beforeinstallprompt', (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setPwaInstallable(true);
    });
  }, [user]);

  const loadSettings = async () => {
    if (!user) return;

    const { data: profileData } = await supabase
      .from('profiles')
      .select('*')
      .eq('user_id', user.id)
      .maybeSingle();

    if (profileData) {
      setProfile({
        full_name: profileData.full_name || '',
        parent_email: profileData.parent_email || '',
        parent_password: profileData.parent_password || '',
      });
    }

    const { data: notifData } = await supabase
      .from('notification_settings')
      .select('*')
      .eq('user_id', user.id)
      .maybeSingle();

    if (notifData) {
      setNotifications({
        push_enabled: notifData.push_enabled ?? false,
        focus_drops: notifData.focus_drops ?? true,
        schedule_changes: notifData.schedule_changes ?? true,
        weekly_reports: notifData.weekly_reports ?? true,
        achievement_alerts: notifData.achievement_alerts ?? false,
      });
    }
  };

  const saveProfile = async () => {
    if (!user) return;
    setLoading(true);

    const { error } = await supabase
      .from('profiles')
      .upsert({
        user_id: user.id,
        full_name: profile.full_name,
        parent_email: profile.parent_email,
        parent_password: profile.parent_password,
      }, { onConflict: 'user_id' });

    setLoading(false);

    if (error) {
      toast({ title: 'Error', description: 'Failed to save profile', variant: 'destructive' });
    } else {
      toast({ title: 'Saved', description: 'Profile updated successfully' });
    }
  };

  const saveNotificationSetting = async (key: string, value: boolean) => {
    if (!user) return;

    setNotifications(prev => ({ ...prev, [key]: value }));

    const { error } = await supabase
      .from('notification_settings')
      .upsert({
        user_id: user.id,
        [key]: value,
      }, { onConflict: 'user_id' });

    if (error) {
      toast({ title: 'Error', description: 'Failed to save setting', variant: 'destructive' });
    }
  };

  const handleInstallPWA = async () => {
    if (!deferredPrompt) return;

    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    
    if (outcome === 'accepted') {
      toast({ title: 'Installed', description: 'App installed to your home screen' });
    }
    setDeferredPrompt(null);
    setPwaInstallable(false);
  };

  const handleSignOut = async () => {
    await signOut();
    toast({ title: 'Signed out', description: 'See you next time!' });
  };

  return (
    <div className="space-y-6 max-w-2xl">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold">Settings</h1>
        <p className="text-muted-foreground text-sm">Manage your account and preferences</p>
      </div>

      {/* Profile Section */}
      <div className="glass-card p-6 rounded-xl space-y-4">
        <div className="flex items-center gap-3 mb-4">
          <User className="w-5 h-5 text-focus" />
          <h2 className="font-semibold">Profile</h2>
        </div>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label>Email</Label>
            <Input value={user?.email || ''} disabled className="bg-secondary/50" />
          </div>

          <div className="space-y-2">
            <Label>Full Name</Label>
            <Input 
              placeholder="Your name"
              value={profile.full_name}
              onChange={(e) => setProfile({ ...profile, full_name: e.target.value })}
            />
          </div>

          <Separator />

          <div className="space-y-2">
            <Label>Parent Email (for reports)</Label>
            <Input 
              type="email"
              placeholder="parent@example.com"
              value={profile.parent_email}
              onChange={(e) => setProfile({ ...profile, parent_email: e.target.value })}
            />
            <p className="text-xs text-muted-foreground">Weekly reports and alerts will be sent here</p>
          </div>

          <div className="space-y-2">
            <Label>Parent Access PIN</Label>
            <Input 
              type="password"
              placeholder="Set a PIN for parent mode"
              value={profile.parent_password}
              onChange={(e) => setProfile({ ...profile, parent_password: e.target.value })}
            />
          </div>

          <Button onClick={saveProfile} disabled={loading}>
            {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
            Save Profile
          </Button>
        </div>
      </div>

      {/* Notifications Section */}
      <div className="glass-card p-6 rounded-xl space-y-4">
        <div className="flex items-center gap-3 mb-4">
          <Bell className="w-5 h-5 text-warning" />
          <h2 className="font-semibold">Notifications</h2>
        </div>

        <div className="space-y-4">
          {[
            { key: 'push_enabled', label: 'Push Notifications', description: 'Receive browser push notifications' },
            { key: 'focus_drops', label: 'Focus Alerts', description: 'Alert when focus score drops significantly' },
            { key: 'schedule_changes', label: 'Schedule Reminders', description: 'Notify about upcoming scheduled sessions' },
            { key: 'weekly_reports', label: 'Weekly Reports', description: 'Send weekly progress report to parent email' },
            { key: 'achievement_alerts', label: 'Achievements', description: 'Celebrate milestones and achievements' },
          ].map((item) => (
            <div key={item.key} className="flex items-center justify-between">
              <div>
                <p className="font-medium text-sm">{item.label}</p>
                <p className="text-xs text-muted-foreground">{item.description}</p>
              </div>
              <Switch
                checked={notifications[item.key as keyof typeof notifications]}
                onCheckedChange={(checked) => saveNotificationSetting(item.key, checked)}
              />
            </div>
          ))}
        </div>
      </div>

      {/* App Section */}
      <div className="glass-card p-6 rounded-xl space-y-4">
        <div className="flex items-center gap-3 mb-4">
          <Download className="w-5 h-5 text-success" />
          <h2 className="font-semibold">App</h2>
        </div>

        <div className="space-y-4">
          {pwaInstallable && (
            <div className="flex items-center justify-between p-4 rounded-lg bg-success/10 border border-success/20">
              <div>
                <p className="font-medium text-sm">Install FocusAI App</p>
                <p className="text-xs text-muted-foreground">Add to your home screen for the best experience</p>
              </div>
              <Button size="sm" onClick={handleInstallPWA}>
                <Download className="w-4 h-4 mr-2" />
                Install
              </Button>
            </div>
          )}

          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-sm">Theme</p>
              <p className="text-xs text-muted-foreground">Choose your preferred appearance</p>
            </div>
            <div className="flex gap-2">
              {[
                { id: 'light', icon: Sun },
                { id: 'dark', icon: Moon },
                { id: 'system', icon: Monitor },
              ].map((t) => (
                <Button
                  key={t.id}
                  variant={theme === t.id ? 'default' : 'outline'}
                  size="icon"
                  onClick={() => setTheme(t.id)}
                >
                  <t.icon className="w-4 h-4" />
                </Button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Danger Zone */}
      <div className="glass-card p-6 rounded-xl border-l-4 border-distraction">
        <h2 className="font-semibold mb-4">Sign Out</h2>
        <p className="text-sm text-muted-foreground mb-4">
          Sign out of your account. Your data will be saved.
        </p>
        <Button variant="outline" onClick={handleSignOut}>
          <LogOut className="w-4 h-4 mr-2" />
          Sign Out
        </Button>
      </div>
    </div>
  );
}

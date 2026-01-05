import { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { 
  Github, Linkedin, Youtube, BookOpen, Code2, 
  Loader2, CheckCircle2, XCircle, RefreshCw, ExternalLink
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface Integration {
  id: string;
  name: string;
  icon: React.ElementType;
  description: string;
  color: string;
  connected: boolean;
  username?: string;
  lastSync?: string;
  stats?: Record<string, number>;
}

export function IntegrationsView() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [integrations, setIntegrations] = useState<Integration[]>([
    {
      id: 'github',
      name: 'GitHub',
      icon: Github,
      description: 'Track your commits, pull requests, and coding activity',
      color: 'hsl(var(--foreground))',
      connected: false,
    },
    {
      id: 'leetcode',
      name: 'LeetCode',
      icon: Code2,
      description: 'Monitor your problem-solving progress and submissions',
      color: 'hsl(38, 92%, 50%)',
      connected: false,
    },
    {
      id: 'youtube',
      name: 'YouTube',
      icon: Youtube,
      description: 'Track educational video watching time',
      color: 'hsl(0, 100%, 50%)',
      connected: false,
    },
    {
      id: 'udemy',
      name: 'Udemy',
      icon: BookOpen,
      description: 'Sync course progress from Udemy',
      color: 'hsl(280, 100%, 60%)',
      connected: false,
    },
    {
      id: 'linkedin',
      name: 'LinkedIn Learning',
      icon: Linkedin,
      description: 'Import learning progress from LinkedIn',
      color: 'hsl(210, 100%, 45%)',
      connected: false,
    },
  ]);

  const [connectDialog, setConnectDialog] = useState<{ open: boolean; integration: Integration | null }>({
    open: false,
    integration: null,
  });
  const [username, setUsername] = useState('');
  const [syncing, setSyncing] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      loadIntegrationSettings();
    }
  }, [user]);

  const loadIntegrationSettings = async () => {
    // Load from localStorage for now (could be moved to Supabase)
    const saved = localStorage.getItem(`integrations_${user?.id}`);
    if (saved) {
      const settings = JSON.parse(saved);
      setIntegrations(prev => prev.map(int => ({
        ...int,
        connected: settings[int.id]?.connected || false,
        username: settings[int.id]?.username || '',
        lastSync: settings[int.id]?.lastSync || '',
        stats: settings[int.id]?.stats || {},
      })));
    }
  };

  const saveIntegrationSettings = (updated: Integration[]) => {
    const settings: Record<string, { connected: boolean; username: string; lastSync: string; stats: Record<string, number> }> = {};
    updated.forEach(int => {
      settings[int.id] = {
        connected: int.connected,
        username: int.username || '',
        lastSync: int.lastSync || '',
        stats: int.stats || {},
      };
    });
    localStorage.setItem(`integrations_${user?.id}`, JSON.stringify(settings));
  };

  const handleConnect = async () => {
    if (!connectDialog.integration || !username) return;

    const updated = integrations.map(int => 
      int.id === connectDialog.integration?.id 
        ? { ...int, connected: true, username } 
        : int
    );
    setIntegrations(updated);
    saveIntegrationSettings(updated);
    
    setConnectDialog({ open: false, integration: null });
    setUsername('');
    
    toast({ title: 'Connected', description: `${connectDialog.integration.name} connected successfully` });
    
    // Auto-sync after connecting
    await syncIntegration(connectDialog.integration.id, username);
  };

  const handleDisconnect = (id: string) => {
    const updated = integrations.map(int => 
      int.id === id 
        ? { ...int, connected: false, username: '', lastSync: '', stats: {} } 
        : int
    );
    setIntegrations(updated);
    saveIntegrationSettings(updated);
    toast({ title: 'Disconnected', description: 'Integration disconnected' });
  };

  const syncIntegration = async (id: string, usernameOverride?: string) => {
    if (!user) return;
    
    const integration = integrations.find(i => i.id === id);
    if (!integration) return;

    const syncUsername = usernameOverride || integration.username;
    if (!syncUsername) {
      toast({ title: 'Error', description: 'Please connect the integration first', variant: 'destructive' });
      return;
    }

    setSyncing(id);

    try {
      let result;
      
      if (id === 'github') {
        const { data, error } = await supabase.functions.invoke('sync-github-activity', {
          body: { user_id: user.id, github_username: syncUsername }
        });
        if (error) throw error;
        result = data;
      } else if (id === 'leetcode') {
        const { data, error } = await supabase.functions.invoke('sync-leetcode-activity', {
          body: { user_id: user.id, leetcode_username: syncUsername }
        });
        if (error) throw error;
        result = data;
      } else {
        // Simulated sync for unsupported platforms
        await new Promise(resolve => setTimeout(resolve, 1500));
        result = { success: true, synced: 0, stats: {} };
      }

      const updated = integrations.map(int => 
        int.id === id 
          ? { 
              ...int, 
              lastSync: new Date().toISOString(),
              stats: result.stats || int.stats,
            } 
          : int
      );
      setIntegrations(updated);
      saveIntegrationSettings(updated);

      toast({ 
        title: 'Synced', 
        description: `Synced ${result.synced || 0} activities from ${integration.name}` 
      });
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Sync failed';
      toast({ title: 'Sync failed', description: message, variant: 'destructive' });
    } finally {
      setSyncing(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold">Connect Apps</h1>
        <p className="text-muted-foreground text-sm">Link your accounts to automatically track activity</p>
      </div>

      {/* Integrations Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {integrations.map((integration, index) => (
          <div
            key={integration.id}
            className={cn(
              "glass-card p-5 rounded-xl animate-slide-up",
              integration.connected && "ring-1 ring-success/30"
            )}
            style={{ animationDelay: `${index * 50}ms` }}
          >
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <div 
                  className="w-12 h-12 rounded-xl flex items-center justify-center"
                  style={{ backgroundColor: `${integration.color}20` }}
                >
                  <integration.icon className="w-6 h-6" style={{ color: integration.color }} />
                </div>
                <div>
                  <h3 className="font-semibold">{integration.name}</h3>
                  {integration.connected && integration.username && (
                    <p className="text-xs text-muted-foreground">@{integration.username}</p>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-2">
                {integration.connected ? (
                  <CheckCircle2 className="w-5 h-5 text-success" />
                ) : (
                  <XCircle className="w-5 h-5 text-muted-foreground" />
                )}
              </div>
            </div>

            <p className="text-sm text-muted-foreground mb-4">{integration.description}</p>

            {integration.connected && integration.stats && Object.keys(integration.stats).length > 0 && (
              <div className="flex gap-4 mb-4 p-3 rounded-lg bg-secondary/50">
                {Object.entries(integration.stats).map(([key, value]) => (
                  <div key={key} className="text-center">
                    <div className="text-lg font-bold">{value}</div>
                    <div className="text-[10px] text-muted-foreground capitalize">{key}</div>
                  </div>
                ))}
              </div>
            )}

            {integration.connected && integration.lastSync && (
              <p className="text-xs text-muted-foreground mb-3">
                Last synced: {new Date(integration.lastSync).toLocaleString()}
              </p>
            )}

            <div className="flex items-center gap-2">
              {integration.connected ? (
                <>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="flex-1"
                    onClick={() => syncIntegration(integration.id)}
                    disabled={syncing === integration.id}
                  >
                    {syncing === integration.id ? (
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    ) : (
                      <RefreshCw className="w-4 h-4 mr-2" />
                    )}
                    Sync Now
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={() => handleDisconnect(integration.id)}
                  >
                    Disconnect
                  </Button>
                </>
              ) : (
                <Button 
                  size="sm" 
                  className="w-full"
                  onClick={() => {
                    setConnectDialog({ open: true, integration });
                    setUsername('');
                  }}
                >
                  Connect
                </Button>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Info Card */}
      <div className="glass-card p-5 rounded-xl border-l-4 border-focus">
        <h3 className="font-medium mb-2">How it works</h3>
        <p className="text-sm text-muted-foreground">
          Connected apps will automatically sync your activity to the Activity Monitor. 
          GitHub tracks commits and PRs, LeetCode tracks problem submissions. 
          Your progress is updated every time you sync or visit the dashboard.
        </p>
      </div>

      {/* Connect Dialog */}
      <Dialog open={connectDialog.open} onOpenChange={(open) => setConnectDialog({ open, integration: null })}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Connect {connectDialog.integration?.name}</DialogTitle>
            <DialogDescription>
              Enter your {connectDialog.integration?.name} username to start tracking activity.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Username</Label>
              <Input
                placeholder={`Your ${connectDialog.integration?.name} username`}
                value={username}
                onChange={(e) => setUsername(e.target.value)}
              />
            </div>
            {connectDialog.integration?.id === 'github' && (
              <p className="text-xs text-muted-foreground">
                We'll fetch your public activity. For private repos, you can add a personal access token in settings.
              </p>
            )}
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setConnectDialog({ open: false, integration: null })}>
              Cancel
            </Button>
            <Button onClick={handleConnect} disabled={!username}>
              Connect
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

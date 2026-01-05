import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { useToast } from './use-toast';

export interface Alert {
  id: string;
  type: 'info' | 'warning' | 'critical';
  title: string;
  message: string;
  read: boolean;
  push_sent: boolean;
  created_at: string;
}

export function useAlerts() {
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    if (!user) {
      setAlerts([]);
      setLoading(false);
      return;
    }

    fetchAlerts();

    // Subscribe to realtime alerts
    const channel = supabase
      .channel('alerts-changes')
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'alerts',
        filter: `user_id=eq.${user.id}`
      }, (payload) => {
        const newAlert = payload.new as Alert;
        setAlerts(prev => [newAlert, ...prev]);
        
        // Show toast notification
        toast({
          title: newAlert.title,
          description: newAlert.message,
          variant: newAlert.type === 'critical' ? 'destructive' : 'default'
        });

        // Trigger browser notification if permitted
        if (Notification.permission === 'granted') {
          new Notification(newAlert.title, {
            body: newAlert.message,
            icon: '/favicon.ico'
          });
        }
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user]);

  const fetchAlerts = async () => {
    if (!user) return;

    const { data, error } = await supabase
      .from('alerts')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(50);

    if (error) {
      console.error('Error fetching alerts:', error);
      return;
    }

    setAlerts(data as Alert[]);
    setLoading(false);
  };

  const markAsRead = async (id: string) => {
    const { error } = await supabase
      .from('alerts')
      .update({ read: true })
      .eq('id', id);

    if (error) return;
    setAlerts(prev => prev.map(a => a.id === id ? { ...a, read: true } : a));
  };

  const markAllAsRead = async () => {
    if (!user) return;
    
    const { error } = await supabase
      .from('alerts')
      .update({ read: true })
      .eq('user_id', user.id)
      .eq('read', false);

    if (error) return;
    setAlerts(prev => prev.map(a => ({ ...a, read: true })));
  };

  const deleteAlert = async (id: string) => {
    // Note: alerts table doesn't have DELETE policy, so we'll just hide it locally
    setAlerts(prev => prev.filter(a => a.id !== id));
  };

  const createAlert = async (alert: Omit<Alert, 'id' | 'read' | 'push_sent' | 'created_at'>, parentEmail?: string) => {
    if (!user) return;

    const { data, error } = await supabase
      .from('alerts')
      .insert({ ...alert, user_id: user.id })
      .select()
      .single();

    if (error) {
      console.error('Error creating alert:', error);
      return;
    }

    // Send email notification if parent email is provided
    if (parentEmail) {
      try {
        const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/send-alert-email`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
          },
          body: JSON.stringify({
            user_id: user.id,
            alert_type: alert.type,
            title: alert.title,
            message: alert.message,
            parent_email: parentEmail,
          }),
        });

        if (!response.ok) {
          console.error('Failed to send alert email');
        }
      } catch (err) {
        console.error('Error sending alert email:', err);
      }
    }
  };

  const requestNotificationPermission = async () => {
    if (!('Notification' in window)) {
      toast({ title: 'Notifications not supported', variant: 'destructive' });
      return false;
    }

    const permission = await Notification.requestPermission();
    if (permission === 'granted') {
      toast({ title: 'Notifications enabled' });
      return true;
    }
    return false;
  };

  return { 
    alerts, 
    loading, 
    unreadCount: alerts.filter(a => !a.read).length,
    markAsRead,
    markAllAsRead,
    deleteAlert,
    createAlert,
    requestNotificationPermission,
    refetch: fetchAlerts 
  };
}

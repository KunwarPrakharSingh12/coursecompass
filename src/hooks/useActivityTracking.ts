import { useState, useEffect, useCallback, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';

export interface ActivitySession {
  id: string;
  platform: string;
  title: string;
  url: string | null;
  category: string;
  start_time: string;
  duration: number | null;
}

export function useActivityTracking() {
  const [sessions, setSessions] = useState<ActivitySession[]>([]);
  const [currentSession, setCurrentSession] = useState<ActivitySession | null>(null);
  const [isTracking, setIsTracking] = useState(false);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const sessionStartRef = useRef<Date | null>(null);
  const trackingIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Load sessions from database
  useEffect(() => {
    if (!user) {
      setSessions([]);
      setLoading(false);
      return;
    }

    fetchSessions();

    // Subscribe to realtime changes
    const channel = supabase
      .channel('activity-sessions-changes')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'activity_sessions',
        filter: `user_id=eq.${user.id}`
      }, () => {
        fetchSessions();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user]);

  // Track page visibility and app focus
  useEffect(() => {
    if (!user) return;

    const handleVisibilityChange = () => {
      if (document.hidden && currentSession) {
        // User switched away - end current session
        endSession();
      } else if (!document.hidden && !currentSession) {
        // User came back - start new session
        startSession('Study Monitor', 'deep-study', 'app');
      }
    };

    const handleBeforeUnload = () => {
      if (currentSession) {
        endSession();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [user, currentSession]);

  const fetchSessions = async () => {
    if (!user) return;

    const { data, error } = await supabase
      .from('activity_sessions')
      .select('*')
      .eq('user_id', user.id)
      .order('start_time', { ascending: false })
      .limit(100);

    if (error) {
      console.error('Error fetching activity sessions:', error);
      return;
    }

    setSessions(data as ActivitySession[]);
    setLoading(false);
  };

  const startSession = useCallback(async (
    title: string,
    category: string,
    platform: string,
    url?: string
  ) => {
    if (!user || currentSession) return;

    sessionStartRef.current = new Date();
    
    const { data, error } = await supabase
      .from('activity_sessions')
      .insert({
        user_id: user.id,
        title,
        category,
        platform,
        url: url || null,
        start_time: sessionStartRef.current.toISOString(),
        duration: 0,
      })
      .select()
      .single();

    if (error) {
      console.error('Error starting session:', error);
      return;
    }

    setCurrentSession(data as ActivitySession);
    setIsTracking(true);

    // Update duration every minute
    trackingIntervalRef.current = setInterval(async () => {
      if (!sessionStartRef.current) return;
      
      const duration = Math.floor((Date.now() - sessionStartRef.current.getTime()) / 60000);
      
      await supabase
        .from('activity_sessions')
        .update({ duration })
        .eq('id', data.id);
    }, 60000);

    console.log('Session started:', { title, category, platform });
  }, [user, currentSession]);

  const endSession = useCallback(async () => {
    if (!currentSession || !sessionStartRef.current) return;

    const duration = Math.floor((Date.now() - sessionStartRef.current.getTime()) / 60000);

    await supabase
      .from('activity_sessions')
      .update({ duration: Math.max(duration, 1) })
      .eq('id', currentSession.id);

    if (trackingIntervalRef.current) {
      clearInterval(trackingIntervalRef.current);
      trackingIntervalRef.current = null;
    }

    setCurrentSession(null);
    setIsTracking(false);
    sessionStartRef.current = null;
    
    console.log('Session ended, duration:', duration, 'minutes');
    fetchSessions();
  }, [currentSession]);

  const logActivity = useCallback(async (
    title: string,
    category: string,
    platform: string,
    duration: number,
    url?: string
  ) => {
    if (!user) return;

    const { error } = await supabase
      .from('activity_sessions')
      .insert({
        user_id: user.id,
        title,
        category,
        platform,
        url: url || null,
        duration,
      });

    if (error) {
      console.error('Error logging activity:', error);
      return;
    }

    fetchSessions();
  }, [user]);

  const getTodayStats = useCallback(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const todaySessions = sessions.filter(s => {
      const sessionDate = new Date(s.start_time);
      return sessionDate >= today;
    });

    const totalMinutes = todaySessions.reduce((sum, s) => sum + (s.duration || 0), 0);
    const studyMinutes = todaySessions
      .filter(s => s.category !== 'distraction')
      .reduce((sum, s) => sum + (s.duration || 0), 0);
    const distractionMinutes = todaySessions
      .filter(s => s.category === 'distraction')
      .reduce((sum, s) => sum + (s.duration || 0), 0);

    return {
      totalSessions: todaySessions.length,
      totalMinutes,
      studyMinutes,
      distractionMinutes,
      focusScore: totalMinutes > 0 ? Math.round((studyMinutes / totalMinutes) * 100) : 100,
    };
  }, [sessions]);

  const getWeeklyStats = useCallback(() => {
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);

    const weekSessions = sessions.filter(s => new Date(s.start_time) >= weekAgo);

    const byDay = Array.from({ length: 7 }, (_, i) => {
      const date = new Date();
      date.setDate(date.getDate() - (6 - i));
      date.setHours(0, 0, 0, 0);
      
      const nextDate = new Date(date);
      nextDate.setDate(nextDate.getDate() + 1);

      const daySessions = weekSessions.filter(s => {
        const d = new Date(s.start_time);
        return d >= date && d < nextDate;
      });

      return {
        day: date.toLocaleDateString('en-US', { weekday: 'short' }),
        study: daySessions
          .filter(s => s.category !== 'distraction')
          .reduce((sum, s) => sum + (s.duration || 0), 0) / 60,
        distraction: daySessions
          .filter(s => s.category === 'distraction')
          .reduce((sum, s) => sum + (s.duration || 0), 0) / 60,
      };
    });

    return byDay;
  }, [sessions]);

  return {
    sessions,
    currentSession,
    isTracking,
    loading,
    startSession,
    endSession,
    logActivity,
    getTodayStats,
    getWeeklyStats,
    refetch: fetchSessions,
  };
}

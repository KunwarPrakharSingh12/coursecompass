import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Sidebar } from '@/components/layout/Sidebar';
import { Header } from '@/components/layout/Header';
import { Dashboard } from '@/views/Dashboard';
import { ActivityView } from '@/views/ActivityView';
import { CourseManagement } from '@/views/CourseManagement';
import { ScheduleBuilder } from '@/views/ScheduleBuilder';
import { ParentMode } from '@/views/ParentMode';
import { IntegrationsView } from '@/views/IntegrationsView';
import { SettingsView } from '@/views/SettingsView';
import { TermsView } from '@/views/TermsView';
import { AlertsView } from '@/views/AlertsView';
import { FocusRooms } from '@/views/FocusRooms';
import { ZenMode } from '@/views/ZenMode';
import { InterviewBot } from '@/views/InterviewBot';
import { ComplexityAnalyzer } from '@/views/ComplexityAnalyzer';
import { GamificationView } from '@/views/GamificationView';
import { useAuth } from '@/hooks/useAuth';
import { useActivityTracking } from '@/hooks/useActivityTracking';
import { Loader2, Lock, Clock } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';

const Index = () => {
  const [activeView, setActiveView] = useState('dashboard');
  const [isLocked, setIsLocked] = useState(false);
  const [lockdownCountdown, setLockdownCountdown] = useState(0);
  const { user, loading } = useAuth();
  const { startSession, endSession, currentSession } = useActivityTracking();
  const navigate = useNavigate();

  // Register service worker for PWA
  useEffect(() => {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/sw.js').catch(err => {
        console.log('Service worker registration failed:', err);
      });
    }
  }, []);

  // Lockdown countdown
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isLocked && lockdownCountdown > 0) {
      interval = setInterval(() => {
        setLockdownCountdown(prev => {
          if (prev <= 1) {
            setIsLocked(false);
            setActiveView('dashboard');
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isLocked, lockdownCountdown]);

  // Start tracking session when user is authenticated
  useEffect(() => {
    if (user && !currentSession) {
      startSession('Study Monitor Session', 'deep-study', 'app');
    }
  }, [user, currentSession, startSession]);

  // End session on cleanup
  useEffect(() => {
    return () => {
      if (currentSession) {
        endSession();
      }
    };
  }, [currentSession, endSession]);

  useEffect(() => {
    if (!loading && !user) {
      navigate('/auth');
    }
  }, [user, loading, navigate]);

  // Handle lockdown activation
  const handleLockdown = (active: boolean) => {
    if (active) {
      setIsLocked(true);
      setLockdownCountdown(60 * 60); // 60 minutes
      setActiveView('course');
    } else {
      setIsLocked(false);
      setLockdownCountdown(0);
    }
  };

  const formatLockdownTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!user) {
    return null;
  }

  const renderView = () => {
    switch (activeView) {
      case 'dashboard':
        return <Dashboard />;
      case 'activity':
        return <ActivityView />;
      case 'course':
        return <CourseManagement />;
      case 'schedule':
        return <ScheduleBuilder />;
      case 'focus-rooms':
        return <FocusRooms />;
      case 'zen-mode':
        return <ZenMode />;
      case 'interview-bot':
        return <InterviewBot />;
      case 'complexity-analyzer':
        return <ComplexityAnalyzer />;
      case 'gamification':
        return <GamificationView />;
      case 'parent':
        return <ParentMode onLockdown={handleLockdown} isLocked={isLocked} />;
      case 'integrations':
        return <IntegrationsView />;
      case 'settings':
        return <SettingsView />;
      case 'terms':
        return <TermsView />;
      case 'alerts':
        return <AlertsView />;
      default:
        return (
          <div className="glass-card p-8 rounded-xl text-center">
            <h2 className="text-xl font-semibold mb-2 capitalize">{activeView}</h2>
            <p className="text-muted-foreground">This view is coming soon.</p>
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Lockdown Banner */}
      <AnimatePresence>
        {isLocked && (
          <motion.div
            initial={{ y: -100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -100, opacity: 0 }}
            className="fixed top-0 left-0 right-0 z-50 bg-distraction text-distraction-foreground py-3 px-4"
          >
            <div className="flex items-center justify-center gap-4">
              <Lock className="w-5 h-5" />
              <span className="font-medium">LOCKDOWN MODE ACTIVE</span>
              <div className="flex items-center gap-2 bg-black/20 px-3 py-1 rounded-full">
                <Clock className="w-4 h-4" />
                <span className="font-mono font-bold">{formatLockdownTime(lockdownCountdown)}</span>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Ambient glow effect */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-focus/10 rounded-full blur-[100px]" />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-success/10 rounded-full blur-[100px]" />
      </div>

      <Sidebar 
        activeView={activeView} 
        onViewChange={setActiveView} 
        isMonitoring={!!currentSession}
        isLocked={isLocked}
      />
      
      <main className={cn(
        "transition-all duration-300 ml-64",
        isLocked && "pt-12"
      )}>
        <Header onAlertsClick={() => setActiveView('alerts')} />
        <div className="p-6">
          {renderView()}
        </div>
      </main>
    </div>
  );
};

export default Index;

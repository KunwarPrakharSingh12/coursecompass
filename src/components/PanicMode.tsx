import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AlertTriangle, Lock, Clock, Shield, X } from 'lucide-react';

interface PanicModeProps {
  onLockdown: (active: boolean) => void;
  isLocked: boolean;
}

export function PanicMode({ onLockdown, isLocked }: PanicModeProps) {
  const [countdown, setCountdown] = useState(60 * 60); // 60 minutes in seconds
  const [showConfirm, setShowConfirm] = useState(false);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isLocked && countdown > 0) {
      interval = setInterval(() => {
        setCountdown(prev => {
          if (prev <= 1) {
            onLockdown(false);
            return 60 * 60;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isLocked, countdown, onLockdown]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const activateLockdown = () => {
    setShowConfirm(false);
    setCountdown(60 * 60);
    onLockdown(true);
  };

  return (
    <Card className="glass-card border-distraction/30">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-distraction">
          <Shield className="w-5 h-5" />
          Panic Mode (Emergency Lockdown)
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-sm text-muted-foreground">
          When activated, the app will enter a restricted state where only the Course tab is accessible. 
          This helps students focus during critical study periods.
        </p>

        {isLocked ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="p-6 rounded-xl bg-distraction/10 border border-distraction/30 text-center"
          >
            <Lock className="w-12 h-12 mx-auto mb-4 text-distraction" />
            <h3 className="text-xl font-bold text-distraction mb-2">LOCKDOWN ACTIVE</h3>
            <p className="text-muted-foreground text-sm mb-4">
              Only the Course tab is accessible
            </p>
            <div className="text-4xl font-mono font-bold text-distraction mb-4">
              {formatTime(countdown)}
            </div>
            <p className="text-xs text-muted-foreground">
              Lockdown will automatically end when timer reaches zero
            </p>
          </motion.div>
        ) : (
          <div className="space-y-4">
            <div className="p-4 rounded-lg bg-warning/10 border border-warning/30">
              <div className="flex items-start gap-3">
                <AlertTriangle className="w-5 h-5 text-warning shrink-0 mt-0.5" />
                <div className="text-sm">
                  <p className="font-medium text-warning">Warning</p>
                  <p className="text-muted-foreground">
                    Once activated, lockdown lasts for 60 minutes and cannot be cancelled early. 
                    The student will only be able to access course materials.
                  </p>
                </div>
              </div>
            </div>

            <AnimatePresence mode="wait">
              {showConfirm ? (
                <motion.div
                  key="confirm"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="space-y-3"
                >
                  <p className="text-center font-medium">Are you sure you want to activate lockdown?</p>
                  <div className="flex gap-2">
                    <Button 
                      variant="outline" 
                      className="flex-1"
                      onClick={() => setShowConfirm(false)}
                    >
                      Cancel
                    </Button>
                    <Button 
                      className="flex-1 bg-distraction hover:bg-distraction/90"
                      onClick={activateLockdown}
                    >
                      <Lock className="w-4 h-4 mr-2" />
                      Confirm Lockdown
                    </Button>
                  </div>
                </motion.div>
              ) : (
                <motion.div
                  key="button"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                >
                  <Button 
                    size="lg"
                    className="w-full bg-distraction hover:bg-distraction/90 gap-2 h-16 text-lg"
                    onClick={() => setShowConfirm(true)}
                  >
                    <AlertTriangle className="w-6 h-6" />
                    LOCKDOWN
                  </Button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        )}

        <div className="pt-4 border-t border-border/50">
          <h4 className="font-medium mb-2 flex items-center gap-2">
            <Clock className="w-4 h-4" />
            What happens during lockdown:
          </h4>
          <ul className="text-sm text-muted-foreground space-y-1">
            <li>• Only the Course tab remains accessible</li>
            <li>• All other navigation is disabled</li>
            <li>• A 60-minute countdown timer is displayed</li>
            <li>• The app cannot be unlocked early</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
}

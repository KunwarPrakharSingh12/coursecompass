import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Slider } from '@/components/ui/slider';
import { X, Play, Pause, SkipForward, Volume2, Cloud, TreePine, Sparkles, Moon, Music } from 'lucide-react';

type BackgroundTheme = 'rain' | 'forest' | 'space' | 'default';

interface MusicTrack {
  id: string;
  title: string;
  artist: string;
  embedUrl: string;
}

const musicTracks: MusicTrack[] = [
  { id: '1', title: 'Lofi Beats', artist: 'ChillHop', embedUrl: 'https://www.youtube.com/embed/jfKfPfyJRdk?autoplay=1&mute=0' },
  { id: '2', title: 'Deep Focus', artist: 'Brain.fm', embedUrl: 'https://www.youtube.com/embed/DWcJFNfaw9c?autoplay=1' },
  { id: '3', title: 'Rain Sounds', artist: 'Nature', embedUrl: 'https://www.youtube.com/embed/mPZkdNFkNps?autoplay=1' },
];

const backgrounds: Record<BackgroundTheme, { gradient: string; animation: string; icon: React.ElementType }> = {
  default: {
    gradient: 'from-background via-background to-background',
    animation: '',
    icon: Moon
  },
  rain: {
    gradient: 'from-slate-900 via-blue-900/50 to-slate-900',
    animation: 'rain-animation',
    icon: Cloud
  },
  forest: {
    gradient: 'from-emerald-950 via-green-900/50 to-emerald-950',
    animation: 'forest-animation',
    icon: TreePine
  },
  space: {
    gradient: 'from-indigo-950 via-purple-900/30 to-slate-950',
    animation: 'space-animation',
    icon: Sparkles
  },
};

export function ZenMode() {
  const [isActive, setIsActive] = useState(false);
  const [theme, setTheme] = useState<BackgroundTheme>('default');
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState([50]);
  const [currentTrack, setCurrentTrack] = useState(0);
  const [focusTime, setFocusTime] = useState(0);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isActive) {
      interval = setInterval(() => {
        setFocusTime(prev => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isActive]);

  const formatTime = (seconds: number) => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between"
      >
        <div>
          <h1 className="text-3xl font-bold gradient-text">Zen Mode</h1>
          <p className="text-muted-foreground mt-1">Create your perfect focus environment</p>
        </div>
        <Button 
          size="lg" 
          className="gap-2"
          onClick={() => setIsActive(true)}
        >
          <Moon className="w-4 h-4" />
          Enter Zen Mode
        </Button>
      </motion.div>

      {/* Preview Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {(Object.keys(backgrounds) as BackgroundTheme[]).map((bg) => {
          const BgIcon = backgrounds[bg].icon;
          return (
            <motion.div
              key={bg}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              whileHover={{ scale: 1.02 }}
            >
              <Card 
                className={`cursor-pointer overflow-hidden transition-all ${
                  theme === bg ? 'ring-2 ring-primary' : 'hover:ring-1 hover:ring-primary/50'
                }`}
                onClick={() => setTheme(bg)}
              >
                <div className={`h-24 bg-gradient-to-br ${backgrounds[bg].gradient} flex items-center justify-center`}>
                  <BgIcon className="w-8 h-8 text-white/70" />
                </div>
                <CardContent className="p-3">
                  <p className="font-medium capitalize text-center">{bg}</p>
                </CardContent>
              </Card>
            </motion.div>
          );
        })}
      </div>

      {/* Music Player Preview */}
      <Card className="glass-card">
        <CardContent className="p-6">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-lg bg-gradient-to-br from-primary to-primary/50 flex items-center justify-center">
              <Music className="w-8 h-8 text-primary-foreground" />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold">{musicTracks[currentTrack].title}</h3>
              <p className="text-sm text-muted-foreground">{musicTracks[currentTrack].artist}</p>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="icon" onClick={() => setIsPlaying(!isPlaying)}>
                {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
              </Button>
              <Button 
                variant="ghost" 
                size="icon"
                onClick={() => setCurrentTrack((prev) => (prev + 1) % musicTracks.length)}
              >
                <SkipForward className="w-5 h-5" />
              </Button>
            </div>
            <div className="flex items-center gap-2 w-32">
              <Volume2 className="w-4 h-4 text-muted-foreground" />
              <Slider value={volume} onValueChange={setVolume} max={100} step={1} />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Zen Mode Overlay */}
      <AnimatePresence>
        {isActive && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className={`fixed inset-0 z-50 bg-gradient-to-br ${backgrounds[theme].gradient}`}
          >
            {/* Rain Animation */}
            {theme === 'rain' && (
              <div className="absolute inset-0 overflow-hidden pointer-events-none">
                {[...Array(50)].map((_, i) => (
                  <motion.div
                    key={i}
                    className="absolute w-0.5 h-8 bg-blue-400/30 rounded-full"
                    initial={{ x: Math.random() * window.innerWidth, y: -20 }}
                    animate={{ y: window.innerHeight + 20 }}
                    transition={{
                      duration: 0.8 + Math.random() * 0.4,
                      repeat: Infinity,
                      delay: Math.random() * 2,
                      ease: 'linear'
                    }}
                  />
                ))}
              </div>
            )}

            {/* Space Animation */}
            {theme === 'space' && (
              <div className="absolute inset-0 overflow-hidden pointer-events-none">
                {[...Array(100)].map((_, i) => (
                  <motion.div
                    key={i}
                    className="absolute w-1 h-1 bg-white rounded-full"
                    style={{
                      left: `${Math.random() * 100}%`,
                      top: `${Math.random() * 100}%`,
                    }}
                    animate={{
                      opacity: [0.2, 1, 0.2],
                      scale: [0.8, 1.2, 0.8],
                    }}
                    transition={{
                      duration: 2 + Math.random() * 2,
                      repeat: Infinity,
                      delay: Math.random() * 2,
                    }}
                  />
                ))}
              </div>
            )}

            {/* Forest Animation */}
            {theme === 'forest' && (
              <div className="absolute inset-0 overflow-hidden pointer-events-none">
                {[...Array(20)].map((_, i) => (
                  <motion.div
                    key={i}
                    className="absolute w-2 h-2 bg-green-400/20 rounded-full"
                    style={{
                      left: `${Math.random() * 100}%`,
                      bottom: '10%',
                    }}
                    animate={{
                      y: [0, -100, 0],
                      opacity: [0, 0.6, 0],
                    }}
                    transition={{
                      duration: 4 + Math.random() * 4,
                      repeat: Infinity,
                      delay: Math.random() * 4,
                    }}
                  />
                ))}
              </div>
            )}

            {/* Close Button */}
            <Button
              variant="ghost"
              size="icon"
              className="absolute top-4 right-4 text-white/70 hover:text-white hover:bg-white/10"
              onClick={() => setIsActive(false)}
            >
              <X className="w-6 h-6" />
            </Button>

            {/* Timer Display */}
            <div className="absolute inset-0 flex items-center justify-center">
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="text-center"
              >
                <p className="text-sm text-white/50 uppercase tracking-widest mb-2">Focus Time</p>
                <p className="text-7xl font-mono font-bold text-white/90">{formatTime(focusTime)}</p>
                <p className="text-white/40 mt-4">Stay focused. You're doing great.</p>
              </motion.div>
            </div>

            {/* Floating Music Player */}
            <motion.div
              initial={{ y: 100, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              className="absolute bottom-8 left-1/2 -translate-x-1/2"
            >
              <Card className="bg-black/30 backdrop-blur-xl border-white/10">
                <CardContent className="p-4 flex items-center gap-4">
                  <div className="w-12 h-12 rounded-lg bg-white/10 flex items-center justify-center">
                    <Music className="w-6 h-6 text-white/70" />
                  </div>
                  <div className="text-white">
                    <p className="font-medium text-sm">{musicTracks[currentTrack].title}</p>
                    <p className="text-xs text-white/50">{musicTracks[currentTrack].artist}</p>
                  </div>
                  <div className="flex items-center gap-1">
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="text-white/70 hover:text-white hover:bg-white/10"
                      onClick={() => setIsPlaying(!isPlaying)}
                    >
                      {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="icon"
                      className="text-white/70 hover:text-white hover:bg-white/10"
                      onClick={() => setCurrentTrack((prev) => (prev + 1) % musicTracks.length)}
                    >
                      <SkipForward className="w-5 h-5" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Theme Switcher */}
            <div className="absolute bottom-8 right-8 flex gap-2">
              {(Object.keys(backgrounds) as BackgroundTheme[]).map((bg) => {
                const BgIcon = backgrounds[bg].icon;
                return (
                  <Button
                    key={bg}
                    variant="ghost"
                    size="icon"
                    className={`text-white/50 hover:text-white hover:bg-white/10 ${
                      theme === bg ? 'bg-white/20 text-white' : ''
                    }`}
                    onClick={() => setTheme(bg)}
                  >
                    <BgIcon className="w-5 h-5" />
                  </Button>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

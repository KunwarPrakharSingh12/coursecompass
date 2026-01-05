import { useState } from 'react';
import { Plus, Github, Code2, BookOpen, Gamepad2, Clock, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

interface ManualActivityLoggerProps {
  onActivityLogged?: () => void;
}

const platforms = [
  { id: 'leetcode', name: 'LeetCode', icon: Code2, color: 'text-warning' },
  { id: 'github', name: 'GitHub', icon: Github, color: 'text-success' },
  { id: 'coursera', name: 'Coursera', icon: BookOpen, color: 'text-focus' },
  { id: 'udemy', name: 'Udemy', icon: BookOpen, color: 'text-purple-500' },
  { id: 'hackerrank', name: 'HackerRank', icon: Code2, color: 'text-green-400' },
  { id: 'codeforces', name: 'Codeforces', icon: Code2, color: 'text-blue-400' },
  { id: 'other', name: 'Other', icon: Gamepad2, color: 'text-muted-foreground' },
];

const categories = [
  { id: 'coding-practice', label: 'Coding Practice' },
  { id: 'deep-study', label: 'Deep Study' },
  { id: 'light-study', label: 'Light Study' },
  { id: 'project-work', label: 'Project Work' },
];

export function ManualActivityLogger({ onActivityLogged }: ManualActivityLoggerProps) {
  const [open, setOpen] = useState(false);
  const [platform, setPlatform] = useState('');
  const [category, setCategory] = useState('coding-practice');
  const [title, setTitle] = useState('');
  const [duration, setDuration] = useState('30');
  const [url, setUrl] = useState('');
  const [loading, setLoading] = useState(false);

  const { user } = useAuth();
  const { toast } = useToast();

  const handleSubmit = async () => {
    if (!user || !platform || !title || !duration) {
      toast({ title: 'Error', description: 'Please fill in all required fields', variant: 'destructive' });
      return;
    }

    setLoading(true);
    const durationMinutes = parseInt(duration, 10);
    const startTime = new Date();
    startTime.setMinutes(startTime.getMinutes() - durationMinutes);

    const { error } = await supabase.from('activity_sessions').insert({
      user_id: user.id,
      platform,
      title,
      category,
      duration: durationMinutes,
      start_time: startTime.toISOString(),
      url: url || null,
    });

    setLoading(false);

    if (error) {
      console.error('Error logging activity:', error);
      toast({ title: 'Error', description: 'Failed to log activity', variant: 'destructive' });
    } else {
      toast({ title: 'Activity Logged', description: `${durationMinutes} minutes on ${platform}` });
      setOpen(false);
      resetForm();
      onActivityLogged?.();
    }
  };

  const resetForm = () => {
    setPlatform('');
    setCategory('coding-practice');
    setTitle('');
    setDuration('30');
    setUrl('');
  };

  const selectedPlatform = platforms.find(p => p.id === platform);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <Plus className="w-4 h-4 mr-2" />
          Log Activity
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Log External Activity</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-4">
          {/* Platform Selection */}
          <div className="space-y-2">
            <Label>Platform *</Label>
            <div className="grid grid-cols-4 gap-2">
              {platforms.slice(0, 4).map((p) => (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => setPlatform(p.id)}
                  className={`flex flex-col items-center gap-1 p-3 rounded-lg border transition-all ${
                    platform === p.id
                      ? 'border-primary bg-primary/10'
                      : 'border-border hover:border-primary/50'
                  }`}
                >
                  <p.icon className={`w-5 h-5 ${p.color}`} />
                  <span className="text-xs">{p.name}</span>
                </button>
              ))}
            </div>
            <Select value={platform} onValueChange={setPlatform}>
              <SelectTrigger>
                <SelectValue placeholder="Or select another platform..." />
              </SelectTrigger>
              <SelectContent>
                {platforms.map((p) => (
                  <SelectItem key={p.id} value={p.id}>
                    <div className="flex items-center gap-2">
                      <p.icon className={`w-4 h-4 ${p.color}`} />
                      {p.name}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Activity Title */}
          <div className="space-y-2">
            <Label htmlFor="title">Activity Title *</Label>
            <Input
              id="title"
              placeholder="e.g., Solved 3 LeetCode problems"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </div>

          {/* Category */}
          <div className="space-y-2">
            <Label>Category</Label>
            <Select value={category} onValueChange={setCategory}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {categories.map((c) => (
                  <SelectItem key={c.id} value={c.id}>
                    {c.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Duration */}
          <div className="space-y-2">
            <Label htmlFor="duration">Duration (minutes) *</Label>
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-muted-foreground" />
              <Input
                id="duration"
                type="number"
                min="1"
                max="480"
                value={duration}
                onChange={(e) => setDuration(e.target.value)}
                className="flex-1"
              />
              <div className="flex gap-1">
                {[15, 30, 60].map((d) => (
                  <Button
                    key={d}
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setDuration(d.toString())}
                    className={duration === d.toString() ? 'bg-primary/20' : ''}
                  >
                    {d}m
                  </Button>
                ))}
              </div>
            </div>
          </div>

          {/* URL (optional) */}
          <div className="space-y-2">
            <Label htmlFor="url">URL (optional)</Label>
            <Input
              id="url"
              type="url"
              placeholder="https://leetcode.com/problems/..."
              value={url}
              onChange={(e) => setUrl(e.target.value)}
            />
          </div>

          {/* Submit */}
          <div className="flex gap-2 pt-2">
            <Button variant="outline" className="flex-1" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button className="flex-1" onClick={handleSubmit} disabled={loading}>
              {loading ? 'Logging...' : 'Log Activity'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

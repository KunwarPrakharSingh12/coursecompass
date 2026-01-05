import { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';
import {
  DndContext,
  DragEndEvent,
  PointerSensor,
  useSensor,
  useSensors,
  closestCenter,
} from '@dnd-kit/core';
import {
  SortableContext,
  verticalListSortingStrategy,
  arrayMove,
} from '@dnd-kit/sortable';
import { 
  Calendar, Clock, Plus, Sparkles, ChevronLeft, ChevronRight,
  RotateCcw, Zap, Loader2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { format, addDays, startOfWeek, isSameDay } from 'date-fns';
import { useScheduleBlocks, ScheduleBlock } from '@/hooks/useScheduleBlocks';
import { DraggableBlock } from '@/components/schedule/DraggableBlock';
import { useAuth } from '@/hooks/useAuth';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const topicColors = {
  'Arrays & Hashing': 'bg-emerald-500/20 border-emerald-500/40 text-emerald-400',
  'Two Pointers': 'bg-blue-500/20 border-blue-500/40 text-blue-400',
  'Sliding Window': 'bg-purple-500/20 border-purple-500/40 text-purple-400',
  'Binary Search': 'bg-amber-500/20 border-amber-500/40 text-amber-400',
  'Linked List': 'bg-pink-500/20 border-pink-500/40 text-pink-400',
  'Trees': 'bg-cyan-500/20 border-cyan-500/40 text-cyan-400',
  'Dynamic Programming': 'bg-red-500/20 border-red-500/40 text-red-400',
  'Break': 'bg-secondary border-border text-muted-foreground',
};

const hours = Array.from({ length: 12 }, (_, i) => i + 8);
const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

export function ScheduleBuilder() {
  const { blocks, loading, addBlock, updateBlock, deleteBlock, reorderBlocks } = useScheduleBlocks();
  const { user } = useAuth();
  const [currentWeek, setCurrentWeek] = useState(new Date());
  const [selectedBlock, setSelectedBlock] = useState<string | null>(null);
  const [isAIGenerating, setIsAIGenerating] = useState(false);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [newBlock, setNewBlock] = useState({
    topic_name: '',
    day_of_week: 1,
    start_hour: 9,
    end_hour: 10,
  });

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  );

  const weekStart = startOfWeek(currentWeek);
  const weekDays = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));
  const today = new Date();

  const getBlocksForDay = (dayIndex: number) => {
    return blocks.filter(block => block.day_of_week === dayIndex);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const oldIndex = blocks.findIndex(b => b.id === active.id);
    const newIndex = blocks.findIndex(b => b.id === over.id);

    const reordered = arrayMove(blocks, oldIndex, newIndex);
    reorderBlocks(reordered);
  };

  const [aiInsights, setAiInsights] = useState<string[]>([
    '• Your focus peaks between 9-11 AM. Consider scheduling hard topics then.',
    '• You\'ve been consistent with Dynamic Programming. Add one more session this week.',
    '• Wednesday has light load. Good day to tackle Binary Search challenges.',
  ]);

  const handleAIGenerate = async () => {
    setIsAIGenerating(true);
    try {
      const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/optimize-schedule`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
        },
        body: JSON.stringify({
          current_schedule: blocks,
          topics: Object.keys(topicColors).filter(t => t !== 'Break'),
          preferences: {
            daily_study_hours: 4,
            preferred_start: 9,
            preferred_end: 18,
          },
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to optimize schedule');
      }

      const data = await response.json();
      
      // Add the optimized blocks
      for (const block of data.schedule || []) {
        await addBlock({
          topic_id: null,
          topic_name: block.topic_name,
          day_of_week: block.day_of_week,
          start_hour: block.start_hour,
          end_hour: block.end_hour,
          status: 'scheduled',
          order_index: blocks.length,
        });
      }

      if (data.insights) {
        setAiInsights(data.insights.map((i: string) => `• ${i}`));
      }
    } catch (error) {
      console.error('AI optimization error:', error);
    } finally {
      setIsAIGenerating(false);
    }
  };

  const handleAddBlock = async () => {
    await addBlock({
      topic_id: null,
      topic_name: newBlock.topic_name,
      day_of_week: newBlock.day_of_week,
      start_hour: newBlock.start_hour,
      end_hour: newBlock.end_hour,
      status: 'scheduled',
      order_index: blocks.length,
    });
    setShowAddDialog(false);
    setNewBlock({ topic_name: '', day_of_week: 1, start_hour: 9, end_hour: 10 });
  };

  const todayStats = {
    scheduled: getBlocksForDay(today.getDay()).length,
    completed: getBlocksForDay(today.getDay()).filter(b => b.status === 'completed').length,
    totalHours: getBlocksForDay(today.getDay()).reduce((sum, b) => sum + (b.end_hour - b.start_hour), 0),
  };

  if (!user) {
    return (
      <div className="glass-card p-8 rounded-xl text-center">
        <h2 className="text-xl font-semibold mb-2">Please sign in</h2>
        <p className="text-muted-foreground">You need to be logged in to access the schedule builder.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Schedule Builder</h1>
          <p className="text-muted-foreground text-sm">Plan and optimize your study sessions</p>
        </div>
        <div className="flex items-center gap-3">
          <Button 
            variant="outline" 
            onClick={handleAIGenerate}
            disabled={isAIGenerating}
          >
            <Sparkles className={cn("w-4 h-4 mr-2", isAIGenerating && "animate-spin")} />
            {isAIGenerating ? 'Generating...' : 'AI Optimize'}
          </Button>
          <Button onClick={() => setShowAddDialog(true)}>
            <Plus className="w-4 h-4 mr-2" />
            Add Block
          </Button>
        </div>
      </div>

      {/* Today's Summary */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="glass-card p-4 rounded-xl md:col-span-2">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-focus/20 flex items-center justify-center">
              <Calendar className="w-6 h-6 text-focus" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Today's Schedule</p>
              <p className="text-2xl font-bold">{todayStats.completed}/{todayStats.scheduled} sessions</p>
            </div>
          </div>
        </div>
        <div className="glass-card p-4 rounded-xl">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-success/20 flex items-center justify-center">
              <Clock className="w-5 h-5 text-success" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Study Time</p>
              <p className="text-xl font-bold">{todayStats.totalHours}h</p>
            </div>
          </div>
        </div>
        <div className="glass-card p-4 rounded-xl">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-warning/20 flex items-center justify-center">
              <Zap className="w-5 h-5 text-warning" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Focus Score</p>
              <p className="text-xl font-bold">85%</p>
            </div>
          </div>
        </div>
      </div>

      {/* Calendar Navigation */}
      <div className="flex items-center justify-between">
        <Button variant="ghost" size="icon" onClick={() => setCurrentWeek(addDays(currentWeek, -7))}>
          <ChevronLeft className="w-5 h-5" />
        </Button>
        <div className="flex items-center gap-2">
          <h2 className="text-lg font-semibold">
            {format(weekStart, 'MMM d')} - {format(addDays(weekStart, 6), 'MMM d, yyyy')}
          </h2>
          <Button variant="ghost" size="sm" onClick={() => setCurrentWeek(new Date())}>
            <RotateCcw className="w-3 h-3 mr-1" />
            Today
          </Button>
        </div>
        <Button variant="ghost" size="icon" onClick={() => setCurrentWeek(addDays(currentWeek, 7))}>
          <ChevronRight className="w-5 h-5" />
        </Button>
      </div>

      {/* Schedule Grid */}
      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
        <div className="glass-card rounded-xl overflow-hidden">
          {loading ? (
            <div className="flex items-center justify-center p-12">
              <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
            </div>
          ) : (
            <div className="overflow-x-auto">
              <div className="min-w-[800px]">
                {/* Days Header */}
                <div className="grid grid-cols-8 border-b border-border">
                  <div className="p-3 text-xs text-muted-foreground">Time</div>
                  {weekDays.map((day, index) => (
                    <div 
                      key={index}
                      className={cn(
                        "p-3 text-center border-l border-border",
                        isSameDay(day, today) && "bg-focus/10"
                      )}
                    >
                      <div className="text-xs text-muted-foreground">{days[index]}</div>
                      <div className={cn(
                        "text-lg font-bold",
                        isSameDay(day, today) && "text-focus"
                      )}>
                        {format(day, 'd')}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Time Grid */}
                <div className="grid grid-cols-8 relative">
                  {/* Time Labels */}
                  <div className="border-r border-border">
                    {hours.map((hour) => (
                      <div key={hour} className="h-[60px] px-3 flex items-start pt-1">
                        <span className="text-xs text-muted-foreground">
                          {hour > 12 ? hour - 12 : hour} {hour >= 12 ? 'PM' : 'AM'}
                        </span>
                      </div>
                    ))}
                  </div>

                  {/* Day Columns */}
                  {weekDays.map((day, dayIndex) => {
                    const dayBlocks = getBlocksForDay(dayIndex);
                    return (
                      <div 
                        key={dayIndex}
                        className={cn(
                          "relative border-l border-border",
                          isSameDay(day, today) && "bg-focus/5"
                        )}
                      >
                        {hours.map((hour) => (
                          <div key={hour} className="h-[60px] border-b border-border/50" />
                        ))}

                        <SortableContext 
                          items={dayBlocks.map(b => b.id)} 
                          strategy={verticalListSortingStrategy}
                        >
                          {dayBlocks.map((block) => (
                            <DraggableBlock
                              key={block.id}
                              block={block}
                              isSelected={selectedBlock === block.id}
                              onSelect={() => setSelectedBlock(block.id === selectedBlock ? null : block.id)}
                            />
                          ))}
                        </SortableContext>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}
        </div>
      </DndContext>

      {/* Legend */}
      <div className="flex flex-wrap items-center gap-4 text-xs">
        <span className="text-muted-foreground">Topics:</span>
        {Object.entries(topicColors).slice(0, -1).map(([topic, classes]) => (
          <div key={topic} className="flex items-center gap-1.5">
            <div className={cn("w-3 h-3 rounded-sm border", classes)} />
            <span className="text-muted-foreground">{topic}</span>
          </div>
        ))}
      </div>

      {/* AI Insights */}
      <div className="glass-card p-5 rounded-xl border-l-4 border-focus">
        <div className="flex items-start gap-3">
          <div className="w-8 h-8 rounded-lg bg-focus/20 flex items-center justify-center shrink-0">
            <Sparkles className="w-4 h-4 text-focus" />
          </div>
          <div>
            <h3 className="font-medium mb-1">AI Schedule Insights</h3>
            <ul className="text-sm text-muted-foreground space-y-1">
              {aiInsights.map((insight, i) => (
                <li key={i}>{insight}</li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {/* Add Block Dialog */}
      <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Schedule Block</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Topic Name</Label>
              <Select
                value={newBlock.topic_name}
                onValueChange={(value) => setNewBlock({ ...newBlock, topic_name: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a topic" />
                </SelectTrigger>
                <SelectContent>
                  {Object.keys(topicColors).map((topic) => (
                    <SelectItem key={topic} value={topic}>{topic}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Day</Label>
              <Select
                value={newBlock.day_of_week.toString()}
                onValueChange={(value) => setNewBlock({ ...newBlock, day_of_week: parseInt(value) })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {days.map((day, index) => (
                    <SelectItem key={index} value={index.toString()}>{day}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Start Hour</Label>
                <Input
                  type="number"
                  min={8}
                  max={19}
                  value={newBlock.start_hour}
                  onChange={(e) => setNewBlock({ ...newBlock, start_hour: parseInt(e.target.value) })}
                />
              </div>
              <div className="space-y-2">
                <Label>End Hour</Label>
                <Input
                  type="number"
                  min={9}
                  max={20}
                  value={newBlock.end_hour}
                  onChange={(e) => setNewBlock({ ...newBlock, end_hour: parseInt(e.target.value) })}
                />
              </div>
            </div>
            <Button className="w-full" onClick={handleAddBlock} disabled={!newBlock.topic_name}>
              Add Block
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

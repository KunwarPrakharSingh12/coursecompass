import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { cn } from '@/lib/utils';
import { GripVertical, Check, Play, X } from 'lucide-react';
import { ScheduleBlock } from '@/hooks/useScheduleBlocks';

const topicColors: Record<string, string> = {
  'Arrays & Hashing': 'bg-emerald-500/20 border-emerald-500/40 text-emerald-400',
  'Two Pointers': 'bg-blue-500/20 border-blue-500/40 text-blue-400',
  'Sliding Window': 'bg-purple-500/20 border-purple-500/40 text-purple-400',
  'Binary Search': 'bg-amber-500/20 border-amber-500/40 text-amber-400',
  'Linked List': 'bg-pink-500/20 border-pink-500/40 text-pink-400',
  'Trees': 'bg-cyan-500/20 border-cyan-500/40 text-cyan-400',
  'Dynamic Programming': 'bg-red-500/20 border-red-500/40 text-red-400',
  'Break': 'bg-secondary border-border text-muted-foreground',
};

interface DraggableBlockProps {
  block: ScheduleBlock;
  isSelected: boolean;
  onSelect: () => void;
}

export function DraggableBlock({ block, isSelected, onSelect }: DraggableBlockProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: block.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    top: `${(block.start_hour - 8) * 60}px`,
    height: `${(block.end_hour - block.start_hour) * 60}px`,
  };

  const getStatusIcon = () => {
    switch (block.status) {
      case 'completed': return <Check className="w-3 h-3" />;
      case 'in-progress': return <Play className="w-3 h-3" />;
      case 'missed': return <X className="w-3 h-3" />;
      default: return null;
    }
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        "absolute left-1 right-1 rounded-lg border px-2 py-1 cursor-pointer transition-all",
        topicColors[block.topic_name] || 'bg-secondary border-border',
        isSelected && "ring-2 ring-focus",
        block.status === 'completed' && "opacity-60",
        isDragging && "opacity-50 z-50 shadow-lg scale-105"
      )}
      onClick={onSelect}
    >
      <div className="flex items-start justify-between h-full">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-1">
            <div
              {...attributes}
              {...listeners}
              className="cursor-grab active:cursor-grabbing"
            >
              <GripVertical className="w-3 h-3 opacity-50 hover:opacity-100" />
            </div>
            <span className="text-xs font-medium truncate">{block.topic_name}</span>
          </div>
          <div className="text-[10px] opacity-70 mt-0.5">
            {block.start_hour > 12 ? block.start_hour - 12 : block.start_hour}
            {block.start_hour >= 12 ? 'PM' : 'AM'} - 
            {block.end_hour > 12 ? block.end_hour - 12 : block.end_hour}
            {block.end_hour >= 12 ? 'PM' : 'AM'}
          </div>
        </div>
        {block.status !== 'scheduled' && (
          <div className={cn(
            "w-5 h-5 rounded-full flex items-center justify-center shrink-0",
            block.status === 'completed' && "bg-success text-success-foreground",
            block.status === 'in-progress' && "bg-focus text-focus-foreground animate-pulse",
            block.status === 'missed' && "bg-distraction text-distraction-foreground"
          )}>
            {getStatusIcon()}
          </div>
        )}
      </div>
    </div>
  );
}

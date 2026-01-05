import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { useToast } from './use-toast';

export interface ScheduleBlock {
  id: string;
  topic_id: string | null;
  topic_name: string;
  day_of_week: number;
  start_hour: number;
  end_hour: number;
  status: 'scheduled' | 'completed' | 'in-progress' | 'missed';
  order_index: number;
}

export function useScheduleBlocks() {
  const [blocks, setBlocks] = useState<ScheduleBlock[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    if (!user) {
      setBlocks([]);
      setLoading(false);
      return;
    }

    fetchBlocks();

    const channel = supabase
      .channel('schedule-changes')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'schedule_blocks',
        filter: `user_id=eq.${user.id}`
      }, () => {
        fetchBlocks();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user]);

  const fetchBlocks = async () => {
    if (!user) return;
    
    const { data, error } = await supabase
      .from('schedule_blocks')
      .select('*')
      .eq('user_id', user.id)
      .order('order_index');

    if (error) {
      console.error('Error fetching schedule blocks:', error);
      return;
    }

    setBlocks(data as ScheduleBlock[]);
    setLoading(false);
  };

  const addBlock = async (block: Omit<ScheduleBlock, 'id'>) => {
    if (!user) return;

    const { error } = await supabase
      .from('schedule_blocks')
      .insert({ ...block, user_id: user.id });

    if (error) {
      toast({ title: 'Error', description: 'Failed to add block', variant: 'destructive' });
      return;
    }

    toast({ title: 'Block added' });
  };

  const updateBlock = async (id: string, updates: Partial<ScheduleBlock>) => {
    const { error } = await supabase
      .from('schedule_blocks')
      .update(updates)
      .eq('id', id);

    if (error) {
      toast({ title: 'Error', description: 'Failed to update block', variant: 'destructive' });
      return;
    }
  };

  const deleteBlock = async (id: string) => {
    const { error } = await supabase
      .from('schedule_blocks')
      .delete()
      .eq('id', id);

    if (error) {
      toast({ title: 'Error', description: 'Failed to delete block', variant: 'destructive' });
      return;
    }

    toast({ title: 'Block deleted' });
  };

  const reorderBlocks = async (reorderedBlocks: ScheduleBlock[]) => {
    setBlocks(reorderedBlocks);
    
    const updates = reorderedBlocks.map((block, index) => ({
      id: block.id,
      order_index: index
    }));

    for (const update of updates) {
      await supabase
        .from('schedule_blocks')
        .update({ order_index: update.order_index })
        .eq('id', update.id);
    }
  };

  return { blocks, loading, addBlock, updateBlock, deleteBlock, reorderBlocks, refetch: fetchBlocks };
}

import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { useToast } from './use-toast';

export interface Topic {
  id: string;
  course_id: string;
  name: string;
  progress: number;
  estimated_hours: number;
  completed_hours: number;
  order_index: number;
}

export interface Course {
  id: string;
  name: string;
  description: string | null;
  overall_progress: number;
  start_date: string | null;
  target_end_date: string | null;
  topics?: Topic[];
}

export function useCourses() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    if (!user) {
      setCourses([]);
      setLoading(false);
      return;
    }

    fetchCourses();
  }, [user]);

  const fetchCourses = async () => {
    if (!user) return;

    const { data: coursesData, error: coursesError } = await supabase
      .from('courses')
      .select('*')
      .eq('user_id', user.id);

    if (coursesError) {
      console.error('Error fetching courses:', coursesError);
      setLoading(false);
      return;
    }

    const coursesWithTopics = await Promise.all(
      (coursesData || []).map(async (course) => {
        const { data: topics } = await supabase
          .from('topics')
          .select('*')
          .eq('course_id', course.id)
          .order('order_index');

        return { ...course, topics: topics || [] } as Course;
      })
    );

    setCourses(coursesWithTopics);
    setLoading(false);
  };

  const addCourse = async (course: { name: string; description?: string }) => {
    if (!user) return;

    const { data, error } = await supabase
      .from('courses')
      .insert({ ...course, user_id: user.id })
      .select()
      .single();

    if (error) {
      toast({ title: 'Error', description: 'Failed to create course', variant: 'destructive' });
      return null;
    }

    toast({ title: 'Course created' });
    await fetchCourses();
    return data;
  };

  const addTopic = async (courseId: string, topic: { name: string; estimated_hours?: number }) => {
    const { error } = await supabase
      .from('topics')
      .insert({ ...topic, course_id: courseId });

    if (error) {
      toast({ title: 'Error', description: 'Failed to add topic', variant: 'destructive' });
      return;
    }

    toast({ title: 'Topic added' });
    await fetchCourses();
  };

  const updateTopicProgress = async (topicId: string, progress: number) => {
    const { error } = await supabase
      .from('topics')
      .update({ progress })
      .eq('id', topicId);

    if (error) {
      toast({ title: 'Error', description: 'Failed to update progress', variant: 'destructive' });
      return;
    }

    await fetchCourses();
  };

  return { courses, loading, addCourse, addTopic, updateTopicProgress, refetch: fetchCourses };
}

-- Create profiles table
CREATE TABLE public.profiles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT,
  avatar_url TEXT,
  role TEXT DEFAULT 'student' CHECK (role IN ('student', 'parent')),
  parent_password TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create courses table
CREATE TABLE public.courses (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  overall_progress INTEGER DEFAULT 0,
  start_date DATE,
  target_end_date DATE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create topics table
CREATE TABLE public.topics (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  course_id UUID NOT NULL REFERENCES public.courses(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  progress INTEGER DEFAULT 0,
  estimated_hours NUMERIC DEFAULT 0,
  completed_hours NUMERIC DEFAULT 0,
  order_index INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create schedule_blocks table
CREATE TABLE public.schedule_blocks (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  topic_id UUID REFERENCES public.topics(id) ON DELETE SET NULL,
  topic_name TEXT NOT NULL,
  day_of_week INTEGER NOT NULL CHECK (day_of_week >= 0 AND day_of_week <= 6),
  start_hour INTEGER NOT NULL CHECK (start_hour >= 0 AND start_hour <= 23),
  end_hour INTEGER NOT NULL CHECK (end_hour >= 0 AND end_hour <= 23),
  status TEXT DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'completed', 'in-progress', 'missed')),
  order_index INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create activity_sessions table
CREATE TABLE public.activity_sessions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  platform TEXT NOT NULL,
  title TEXT NOT NULL,
  url TEXT,
  category TEXT NOT NULL CHECK (category IN ('deep-study', 'coding-practice', 'career-development', 'light-study', 'distraction')),
  start_time TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  duration INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create alerts table
CREATE TABLE public.alerts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('info', 'warning', 'critical')),
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  read BOOLEAN DEFAULT false,
  push_sent BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create notification_settings table
CREATE TABLE public.notification_settings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE,
  focus_drops BOOLEAN DEFAULT true,
  schedule_changes BOOLEAN DEFAULT true,
  weekly_reports BOOLEAN DEFAULT true,
  achievement_alerts BOOLEAN DEFAULT false,
  push_enabled BOOLEAN DEFAULT false,
  push_subscription JSONB,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.topics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.schedule_blocks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.activity_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.alerts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notification_settings ENABLE ROW LEVEL SECURITY;

-- RLS Policies for profiles
CREATE POLICY "Users can view own profile" ON public.profiles FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own profile" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = user_id);

-- RLS Policies for courses
CREATE POLICY "Users can view own courses" ON public.courses FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own courses" ON public.courses FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own courses" ON public.courses FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own courses" ON public.courses FOR DELETE USING (auth.uid() = user_id);

-- RLS Policies for topics
CREATE POLICY "Users can view topics of own courses" ON public.topics FOR SELECT USING (EXISTS (SELECT 1 FROM public.courses WHERE courses.id = topics.course_id AND courses.user_id = auth.uid()));
CREATE POLICY "Users can insert topics to own courses" ON public.topics FOR INSERT WITH CHECK (EXISTS (SELECT 1 FROM public.courses WHERE courses.id = topics.course_id AND courses.user_id = auth.uid()));
CREATE POLICY "Users can update topics of own courses" ON public.topics FOR UPDATE USING (EXISTS (SELECT 1 FROM public.courses WHERE courses.id = topics.course_id AND courses.user_id = auth.uid()));
CREATE POLICY "Users can delete topics of own courses" ON public.topics FOR DELETE USING (EXISTS (SELECT 1 FROM public.courses WHERE courses.id = topics.course_id AND courses.user_id = auth.uid()));

-- RLS Policies for schedule_blocks
CREATE POLICY "Users can view own schedule" ON public.schedule_blocks FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own schedule" ON public.schedule_blocks FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own schedule" ON public.schedule_blocks FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own schedule" ON public.schedule_blocks FOR DELETE USING (auth.uid() = user_id);

-- RLS Policies for activity_sessions
CREATE POLICY "Users can view own activity" ON public.activity_sessions FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own activity" ON public.activity_sessions FOR INSERT WITH CHECK (auth.uid() = user_id);

-- RLS Policies for alerts
CREATE POLICY "Users can view own alerts" ON public.alerts FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own alerts" ON public.alerts FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own alerts" ON public.alerts FOR UPDATE USING (auth.uid() = user_id);

-- RLS Policies for notification_settings
CREATE POLICY "Users can view own notification settings" ON public.notification_settings FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own notification settings" ON public.notification_settings FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own notification settings" ON public.notification_settings FOR UPDATE USING (auth.uid() = user_id);

-- Create trigger for profile creation
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (user_id, full_name)
  VALUES (new.id, new.raw_user_meta_data ->> 'full_name');
  INSERT INTO public.notification_settings (user_id)
  VALUES (new.id);
  RETURN new;
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Enable realtime for alerts
ALTER PUBLICATION supabase_realtime ADD TABLE public.alerts;
ALTER PUBLICATION supabase_realtime ADD TABLE public.schedule_blocks;
ALTER PUBLICATION supabase_realtime ADD TABLE public.activity_sessions;
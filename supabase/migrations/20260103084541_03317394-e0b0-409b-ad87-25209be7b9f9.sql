-- Add parent_email and weekly_report_day to profiles table
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS parent_email TEXT,
ADD COLUMN IF NOT EXISTS weekly_report_day INTEGER DEFAULT 0; -- 0 = Sunday, 1 = Monday, etc.
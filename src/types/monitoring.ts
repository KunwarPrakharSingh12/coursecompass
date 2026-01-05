export type ActivityCategory = 
  | 'deep-study' 
  | 'coding-practice' 
  | 'career-development' 
  | 'light-study' 
  | 'distraction';

export type Platform = 
  | 'leetcode' 
  | 'github' 
  | 'linkedin' 
  | 'youtube' 
  | 'codeforces' 
  | 'hackerrank'
  | 'geeksforgeeks'
  | 'stackoverflow'
  | 'coursera'
  | 'instagram'
  | 'facebook'
  | 'reddit'
  | 'other';

export interface ActivitySession {
  id: string;
  platform: Platform;
  title: string;
  url?: string;
  category: ActivityCategory;
  startTime: Date;
  endTime?: Date;
  duration: number; // in minutes
}

export interface DailyStats {
  date: Date;
  totalStudyTime: number;
  totalDistractionTime: number;
  problemsSolved: number;
  commitsMade: number;
  focusScore: number; // 0-100
  sessions: ActivitySession[];
}

export interface CourseProgress {
  id: string;
  name: string;
  topics: TopicProgress[];
  overallProgress: number;
  startDate: Date;
  targetEndDate: Date;
}

export interface TopicProgress {
  id: string;
  name: string;
  progress: number;
  estimatedHours: number;
  completedHours: number;
  problems: ProblemEntry[];
}

export interface ProblemEntry {
  id: string;
  name: string;
  platform: Platform;
  difficulty: 'easy' | 'medium' | 'hard';
  completed: boolean;
  completedAt?: Date;
}

export interface ScheduleBlock {
  id: string;
  topicId: string;
  topicName: string;
  startTime: Date;
  endTime: Date;
  completed: boolean;
  actualDuration?: number;
}

export interface Alert {
  id: string;
  type: 'warning' | 'critical' | 'info';
  title: string;
  message: string;
  timestamp: Date;
  read: boolean;
}

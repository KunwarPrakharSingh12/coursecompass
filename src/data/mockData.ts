import { ActivitySession, DailyStats, CourseProgress, ScheduleBlock, Alert, ActivityCategory, Platform } from '@/types/monitoring';

export const mockRecentSessions: ActivitySession[] = [
  {
    id: '1',
    platform: 'leetcode',
    title: 'Two Sum - Problem Solving',
    url: 'https://leetcode.com/problems/two-sum',
    category: 'coding-practice',
    startTime: new Date(Date.now() - 45 * 60000),
    duration: 45,
  },
  {
    id: '2',
    platform: 'github',
    title: 'DSA Repository - Commit',
    url: 'https://github.com/user/dsa-practice',
    category: 'deep-study',
    startTime: new Date(Date.now() - 120 * 60000),
    duration: 30,
  },
  {
    id: '3',
    platform: 'youtube',
    title: 'Dynamic Programming Tutorial',
    url: 'https://youtube.com/watch?v=abc',
    category: 'light-study',
    startTime: new Date(Date.now() - 180 * 60000),
    duration: 25,
  },
  {
    id: '4',
    platform: 'linkedin',
    title: 'Feed Browsing',
    category: 'distraction',
    startTime: new Date(Date.now() - 200 * 60000),
    duration: 12,
  },
];

export const mockTodayStats: DailyStats = {
  date: new Date(),
  totalStudyTime: 185,
  totalDistractionTime: 32,
  problemsSolved: 4,
  commitsMade: 3,
  focusScore: 78,
  sessions: mockRecentSessions,
};

export const mockWeeklyData = [
  { day: 'Mon', study: 210, distraction: 45, problems: 5 },
  { day: 'Tue', study: 180, distraction: 60, problems: 3 },
  { day: 'Wed', study: 240, distraction: 30, problems: 6 },
  { day: 'Thu', study: 165, distraction: 55, problems: 4 },
  { day: 'Fri', study: 195, distraction: 40, problems: 5 },
  { day: 'Sat', study: 120, distraction: 90, problems: 2 },
  { day: 'Sun', study: 185, distraction: 32, problems: 4 },
];

export const mockPlatformUsage = [
  { name: 'LeetCode', value: 180, color: 'hsl(38, 92%, 50%)' },
  { name: 'GitHub', value: 120, color: 'hsl(142, 71%, 45%)' },
  { name: 'YouTube', value: 90, color: 'hsl(0, 72%, 51%)' },
  { name: 'LinkedIn', value: 45, color: 'hsl(201, 100%, 35%)' },
  { name: 'Stack Overflow', value: 30, color: 'hsl(25, 100%, 50%)' },
];

export const mockDSACourse: CourseProgress = {
  id: 'dsa-course',
  name: 'Data Structures & Algorithms Mastery',
  overallProgress: 42,
  startDate: new Date('2024-01-01'),
  targetEndDate: new Date('2024-06-30'),
  topics: [
    { id: 't1', name: 'Arrays & Hashing', progress: 85, estimatedHours: 20, completedHours: 17, problems: [] },
    { id: 't2', name: 'Two Pointers', progress: 70, estimatedHours: 15, completedHours: 10.5, problems: [] },
    { id: 't3', name: 'Sliding Window', progress: 60, estimatedHours: 18, completedHours: 10.8, problems: [] },
    { id: 't4', name: 'Stack', progress: 45, estimatedHours: 12, completedHours: 5.4, problems: [] },
    { id: 't5', name: 'Binary Search', progress: 30, estimatedHours: 20, completedHours: 6, problems: [] },
    { id: 't6', name: 'Linked List', progress: 25, estimatedHours: 15, completedHours: 3.75, problems: [] },
    { id: 't7', name: 'Trees', progress: 15, estimatedHours: 25, completedHours: 3.75, problems: [] },
    { id: 't8', name: 'Dynamic Programming', progress: 5, estimatedHours: 40, completedHours: 2, problems: [] },
    { id: 't9', name: 'Graphs', progress: 0, estimatedHours: 30, completedHours: 0, problems: [] },
  ],
};

export const mockTodaySchedule: ScheduleBlock[] = [
  { id: 's1', topicId: 't4', topicName: 'Stack Problems', startTime: new Date('2024-01-15T09:00'), endTime: new Date('2024-01-15T10:30'), completed: true, actualDuration: 85 },
  { id: 's2', topicId: 't5', topicName: 'Binary Search Practice', startTime: new Date('2024-01-15T11:00'), endTime: new Date('2024-01-15T12:30'), completed: true, actualDuration: 90 },
  { id: 's3', topicId: 't5', topicName: 'Binary Search - Advanced', startTime: new Date('2024-01-15T14:00'), endTime: new Date('2024-01-15T15:30'), completed: false },
  { id: 's4', topicId: 't6', topicName: 'Linked List Basics', startTime: new Date('2024-01-15T16:00'), endTime: new Date('2024-01-15T17:30'), completed: false },
];

export const mockAlerts: Alert[] = [
  {
    id: 'a1',
    type: 'warning',
    title: 'LeetCode Streak at Risk',
    message: 'Only 2 problems solved today. Target: 5 problems.',
    timestamp: new Date(Date.now() - 30 * 60000),
    read: false,
  },
  {
    id: 'a2',
    type: 'info',
    title: 'Schedule Adjusted',
    message: 'Binary Search session extended by 30 minutes based on performance.',
    timestamp: new Date(Date.now() - 60 * 60000),
    read: true,
  },
  {
    id: 'a3',
    type: 'critical',
    title: 'High Distraction Alert',
    message: 'LinkedIn usage exceeded limit. Consider blocking for focus time.',
    timestamp: new Date(Date.now() - 120 * 60000),
    read: false,
  },
];

export const getCategoryColor = (category: ActivityCategory): string => {
  const colors: Record<ActivityCategory, string> = {
    'deep-study': 'bg-success',
    'coding-practice': 'bg-focus',
    'career-development': 'bg-linkedin',
    'light-study': 'bg-warning',
    'distraction': 'bg-distraction',
  };
  return colors[category];
};

export const getCategoryLabel = (category: ActivityCategory): string => {
  const labels: Record<ActivityCategory, string> = {
    'deep-study': 'Deep Study',
    'coding-practice': 'Coding Practice',
    'career-development': 'Career Dev',
    'light-study': 'Light Study',
    'distraction': 'Distraction',
  };
  return labels[category];
};

export const getPlatformIcon = (platform: Platform): string => {
  const icons: Record<Platform, string> = {
    leetcode: '🧩',
    github: '💻',
    linkedin: '💼',
    youtube: '📺',
    codeforces: '⚔️',
    hackerrank: '🏆',
    geeksforgeeks: '📚',
    stackoverflow: '📋',
    coursera: '🎓',
    instagram: '📷',
    facebook: '👤',
    reddit: '🔗',
    other: '🌐',
  };
  return icons[platform];
};

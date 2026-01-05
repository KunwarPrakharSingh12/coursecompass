import { useState } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Trophy, Star, Flame, Target, Zap, Clock, Award, 
  Medal, Crown, Sparkles, TrendingUp, Calendar, Lock
} from 'lucide-react';

interface BadgeInfo {
  id: string;
  name: string;
  description: string;
  icon: React.ElementType;
  unlocked: boolean;
  progress?: number;
  requirement?: string;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
}

interface LeagueUser {
  id: string;
  name: string;
  avatar?: string;
  xp: number;
  level: number;
  streak: number;
}

const badges: BadgeInfo[] = [
  { id: '1', name: '7 Day Streak', description: 'Study for 7 consecutive days', icon: Flame, unlocked: true, rarity: 'common' },
  { id: '2', name: '4 Hour Session', description: 'Complete a 4-hour focus session', icon: Clock, unlocked: true, rarity: 'rare' },
  { id: '3', name: 'Problem Solver', description: 'Solve 50 LeetCode problems', icon: Target, unlocked: true, rarity: 'rare' },
  { id: '4', name: 'Early Bird', description: 'Start studying before 6 AM', icon: Sparkles, unlocked: false, progress: 75, requirement: 'Start 3 more sessions before 6 AM', rarity: 'common' },
  { id: '5', name: 'Night Owl', description: 'Study past midnight for 10 nights', icon: Star, unlocked: false, progress: 40, requirement: 'Study 6 more nights past midnight', rarity: 'common' },
  { id: '6', name: 'Marathon Runner', description: '100 hours total study time', icon: Trophy, unlocked: false, progress: 65, requirement: '35 more hours needed', rarity: 'epic' },
  { id: '7', name: 'Zero Distractions', description: 'Complete 10 distraction-free sessions', icon: Zap, unlocked: false, progress: 30, requirement: '7 more perfect sessions needed', rarity: 'epic' },
  { id: '8', name: 'Algorithm Master', description: 'Solve 500 problems', icon: Crown, unlocked: false, progress: 15, requirement: '425 more problems to go', rarity: 'legendary' },
];

const leagueUsers: LeagueUser[] = [
  { id: '1', name: 'Alex Chen', xp: 15420, level: 42, streak: 45 },
  { id: '2', name: 'Sarah Kim', xp: 14200, level: 38, streak: 32 },
  { id: '3', name: 'You', xp: 12850, level: 35, streak: 28 },
  { id: '4', name: 'Mike Ross', xp: 11900, level: 33, streak: 21 },
  { id: '5', name: 'Emma Wilson', xp: 10500, level: 30, streak: 15 },
  { id: '6', name: 'David Lee', xp: 9800, level: 28, streak: 12 },
  { id: '7', name: 'Lisa Park', xp: 8900, level: 26, streak: 8 },
  { id: '8', name: 'James Brown', xp: 7500, level: 23, streak: 5 },
];

const rarityColors: Record<string, string> = {
  common: 'from-gray-400 to-gray-600',
  rare: 'from-blue-400 to-blue-600',
  epic: 'from-purple-400 to-purple-600',
  legendary: 'from-amber-400 to-orange-600',
};

export function GamificationView() {
  const currentUser = leagueUsers.find(u => u.name === 'You')!;
  const xpToNextLevel = 500;
  const currentXpInLevel = currentUser.xp % xpToNextLevel;

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h1 className="text-3xl font-bold gradient-text">Your Progress</h1>
        <p className="text-muted-foreground mt-1">Level up, earn badges, and compete globally</p>
      </motion.div>

      {/* Profile Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <Card className="glass-card overflow-hidden">
          <div className="h-24 bg-gradient-to-r from-primary via-primary/80 to-primary/50" />
          <CardContent className="relative pt-0">
            <div className="flex flex-col md:flex-row md:items-end gap-4 -mt-12">
              <Avatar className="w-24 h-24 border-4 border-background">
                <AvatarImage src="" />
                <AvatarFallback className="text-2xl bg-primary text-primary-foreground">
                  Y
                </AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <h2 className="text-2xl font-bold">Your Profile</h2>
                  <Badge className="gap-1 bg-primary/20 text-primary border-primary/30">
                    <Crown className="w-3 h-3" />
                    Lvl {currentUser.level}
                  </Badge>
                </div>
                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <Flame className="w-4 h-4 text-orange-500" />
                    {currentUser.streak} day streak
                  </span>
                  <span className="flex items-center gap-1">
                    <Star className="w-4 h-4 text-warning" />
                    {currentUser.xp.toLocaleString()} XP
                  </span>
                  <span className="flex items-center gap-1">
                    <Trophy className="w-4 h-4 text-amber-500" />
                    Rank #{leagueUsers.findIndex(u => u.name === 'You') + 1}
                  </span>
                </div>
              </div>
            </div>

            {/* XP Progress */}
            <div className="mt-6 p-4 rounded-xl bg-muted/50">
              <div className="flex justify-between text-sm mb-2">
                <span>Level {currentUser.level}</span>
                <span className="text-muted-foreground">{currentXpInLevel}/{xpToNextLevel} XP</span>
                <span>Level {currentUser.level + 1}</span>
              </div>
              <Progress value={(currentXpInLevel / xpToNextLevel) * 100} className="h-3" />
              <p className="text-xs text-muted-foreground mt-2 text-center">
                {xpToNextLevel - currentXpInLevel} XP until next level
              </p>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      <Tabs defaultValue="badges" className="space-y-6">
        <TabsList className="grid w-full grid-cols-2 max-w-md">
          <TabsTrigger value="badges" className="gap-2">
            <Award className="w-4 h-4" />
            Badges
          </TabsTrigger>
          <TabsTrigger value="league" className="gap-2">
            <Trophy className="w-4 h-4" />
            League
          </TabsTrigger>
        </TabsList>

        <TabsContent value="badges">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {badges.map((badge, idx) => {
              const IconComponent = badge.icon;
              return (
                <motion.div
                  key={badge.id}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: idx * 0.05 }}
                >
                  <Card className={`glass-card relative overflow-hidden transition-all ${
                    badge.unlocked ? 'hover:ring-2 hover:ring-primary/50' : 'opacity-75'
                  }`}>
                    {!badge.unlocked && (
                      <div className="absolute top-2 right-2 z-10">
                        <Lock className="w-4 h-4 text-muted-foreground" />
                      </div>
                    )}
                    <CardContent className="p-4 text-center">
                      <div className={`w-16 h-16 mx-auto mb-3 rounded-full flex items-center justify-center bg-gradient-to-br ${
                        badge.unlocked ? rarityColors[badge.rarity] : 'from-gray-600 to-gray-800'
                      }`}>
                        <IconComponent className={`w-8 h-8 ${badge.unlocked ? 'text-white' : 'text-gray-400'}`} />
                      </div>
                      <h3 className="font-semibold text-sm mb-1">{badge.name}</h3>
                      <p className="text-xs text-muted-foreground mb-2">{badge.description}</p>
                      <Badge 
                        variant="outline" 
                        className={`text-xs capitalize ${
                          badge.rarity === 'legendary' ? 'border-amber-500 text-amber-500' :
                          badge.rarity === 'epic' ? 'border-purple-500 text-purple-500' :
                          badge.rarity === 'rare' ? 'border-blue-500 text-blue-500' :
                          'border-gray-500 text-gray-500'
                        }`}
                      >
                        {badge.rarity}
                      </Badge>
                      {!badge.unlocked && badge.progress !== undefined && (
                        <div className="mt-3">
                          <Progress value={badge.progress} className="h-1.5" />
                          <p className="text-xs text-muted-foreground mt-1">{badge.requirement}</p>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </div>
        </TabsContent>

        <TabsContent value="league">
          <Card className="glass-card">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <Trophy className="w-5 h-5 text-warning" />
                  Weekly League
                </CardTitle>
                <Badge variant="secondary" className="gap-1">
                  <Calendar className="w-3 h-3" />
                  5 days remaining
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {leagueUsers.map((user, idx) => {
                  const isCurrentUser = user.name === 'You';
                  return (
                    <motion.div
                      key={user.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: idx * 0.05 }}
                      className={`flex items-center gap-4 p-3 rounded-lg transition-colors ${
                        isCurrentUser 
                          ? 'bg-primary/10 border border-primary/20' 
                          : idx < 3 ? 'bg-warning/5' : 'hover:bg-muted/50'
                      }`}
                    >
                      <span className={`font-bold text-lg w-8 ${
                        idx === 0 ? 'text-warning' : 
                        idx === 1 ? 'text-gray-400' : 
                        idx === 2 ? 'text-amber-700' : 
                        'text-muted-foreground'
                      }`}>
                        {idx === 0 ? '🥇' : idx === 1 ? '🥈' : idx === 2 ? '🥉' : `#${idx + 1}`}
                      </span>
                      <Avatar className="w-10 h-10">
                        <AvatarImage src={user.avatar} />
                        <AvatarFallback className={`${isCurrentUser ? 'bg-primary text-primary-foreground' : 'bg-muted'}`}>
                          {user.name.split(' ').map(n => n[0]).join('')}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <p className={`font-medium ${isCurrentUser ? 'text-primary' : ''}`}>
                          {user.name}
                        </p>
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <Medal className="w-3 h-3" />
                            Lvl {user.level}
                          </span>
                          <span className="flex items-center gap-1">
                            <Flame className="w-3 h-3 text-orange-500" />
                            {user.streak}
                          </span>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-bold font-mono">{user.xp.toLocaleString()}</p>
                        <p className="text-xs text-muted-foreground">XP</p>
                      </div>
                    </motion.div>
                  );
                })}
              </div>

              <div className="mt-6 p-4 rounded-lg bg-muted/50 text-center">
                <TrendingUp className="w-8 h-8 mx-auto mb-2 text-success" />
                <p className="font-medium">You're climbing!</p>
                <p className="text-sm text-muted-foreground">
                  Earn {(leagueUsers[1].xp - currentUser.xp).toLocaleString()} more XP to reach 2nd place
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Users, Plus, Trophy, Clock, Zap, Search } from 'lucide-react';

interface RoomUser {
  id: string;
  name: string;
  avatar?: string;
  isFocused: boolean;
  focusTime: number; // minutes
}

interface FocusRoom {
  id: string;
  name: string;
  description: string;
  users: RoomUser[];
  maxUsers: number;
  isActive: boolean;
}

const mockRooms: FocusRoom[] = [
  {
    id: '1',
    name: 'Late Night Grinders',
    description: 'For those who code best after midnight',
    maxUsers: 20,
    isActive: true,
    users: [
      { id: '1', name: 'Alex Chen', avatar: '', isFocused: true, focusTime: 145 },
      { id: '2', name: 'Sarah Kim', avatar: '', isFocused: true, focusTime: 120 },
      { id: '3', name: 'Mike Ross', avatar: '', isFocused: false, focusTime: 89 },
      { id: '4', name: 'Emma Wilson', avatar: '', isFocused: true, focusTime: 78 },
    ]
  },
  {
    id: '2',
    name: 'DSA Sprint',
    description: 'Focused LeetCode grinding session',
    maxUsers: 15,
    isActive: true,
    users: [
      { id: '5', name: 'John Doe', avatar: '', isFocused: true, focusTime: 200 },
      { id: '6', name: 'Jane Smith', avatar: '', isFocused: true, focusTime: 180 },
    ]
  },
  {
    id: '3',
    name: 'Morning Productivity',
    description: 'Early birds catching algorithms',
    maxUsers: 25,
    isActive: true,
    users: [
      { id: '7', name: 'David Lee', avatar: '', isFocused: false, focusTime: 45 },
    ]
  },
];

export function FocusRooms() {
  const [selectedRoom, setSelectedRoom] = useState<FocusRoom | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  const filteredRooms = mockRooms.filter(room => 
    room.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const formatTime = (minutes: number) => {
    const hrs = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return hrs > 0 ? `${hrs}h ${mins}m` : `${mins}m`;
  };

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between"
      >
        <div>
          <h1 className="text-3xl font-bold gradient-text">Focus Rooms</h1>
          <p className="text-muted-foreground mt-1">Study together, stay accountable</p>
        </div>
        <Button className="gap-2">
          <Plus className="w-4 h-4" />
          Create Room
        </Button>
      </motion.div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          placeholder="Search rooms..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10"
        />
      </div>

      <AnimatePresence mode="wait">
        {selectedRoom ? (
          <motion.div
            key="room-detail"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-6"
          >
            <Button variant="ghost" onClick={() => setSelectedRoom(null)} className="gap-2">
              ← Back to Lobby
            </Button>

            <Card className="glass-card">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-2xl">{selectedRoom.name}</CardTitle>
                    <p className="text-muted-foreground">{selectedRoom.description}</p>
                  </div>
                  <Badge variant="secondary" className="gap-1">
                    <Users className="w-3 h-3" />
                    {selectedRoom.users.length}/{selectedRoom.maxUsers}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Live Users */}
                <div>
                  <h3 className="font-semibold mb-4 flex items-center gap-2">
                    <Zap className="w-4 h-4 text-primary" />
                    Live Users
                  </h3>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {selectedRoom.users.map((user, idx) => (
                      <motion.div
                        key={user.id}
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: idx * 0.1 }}
                        className="glass-card p-4 rounded-xl text-center relative"
                      >
                        <div className="relative inline-block">
                          <Avatar className="w-16 h-16 mx-auto">
                            <AvatarImage src={user.avatar} />
                            <AvatarFallback className="bg-primary/20 text-primary">
                              {user.name.split(' ').map(n => n[0]).join('')}
                            </AvatarFallback>
                          </Avatar>
                          <span className={`absolute bottom-0 right-0 w-4 h-4 rounded-full border-2 border-background ${
                            user.isFocused ? 'bg-success animate-pulse' : 'bg-distraction'
                          }`} />
                        </div>
                        <p className="font-medium mt-2 text-sm">{user.name}</p>
                        <p className="text-xs text-muted-foreground flex items-center justify-center gap-1 mt-1">
                          <Clock className="w-3 h-3" />
                          {formatTime(user.focusTime)}
                        </p>
                      </motion.div>
                    ))}
                  </div>
                </div>

                {/* Leaderboard */}
                <div>
                  <h3 className="font-semibold mb-4 flex items-center gap-2">
                    <Trophy className="w-4 h-4 text-warning" />
                    Today's Leaderboard
                  </h3>
                  <div className="space-y-2">
                    {[...selectedRoom.users]
                      .sort((a, b) => b.focusTime - a.focusTime)
                      .map((user, idx) => (
                        <motion.div
                          key={user.id}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: idx * 0.1 }}
                          className={`flex items-center gap-4 p-3 rounded-lg ${
                            idx === 0 ? 'bg-warning/10 border border-warning/20' : 'glass-card'
                          }`}
                        >
                          <span className={`font-bold text-lg w-8 ${
                            idx === 0 ? 'text-warning' : idx === 1 ? 'text-muted-foreground' : 'text-muted-foreground/50'
                          }`}>
                            #{idx + 1}
                          </span>
                          <Avatar className="w-8 h-8">
                            <AvatarFallback className="text-xs bg-primary/20 text-primary">
                              {user.name.split(' ').map(n => n[0]).join('')}
                            </AvatarFallback>
                          </Avatar>
                          <span className="flex-1 font-medium">{user.name}</span>
                          <span className={`font-mono ${idx === 0 ? 'text-warning' : 'text-muted-foreground'}`}>
                            {formatTime(user.focusTime)}
                          </span>
                        </motion.div>
                    ))}
                  </div>
                </div>

                <Button className="w-full" size="lg">
                  Join Session
                </Button>
              </CardContent>
            </Card>
          </motion.div>
        ) : (
          <motion.div
            key="room-list"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="grid gap-4 md:grid-cols-2 lg:grid-cols-3"
          >
            {filteredRooms.length === 0 ? (
              <div className="col-span-full glass-card p-12 rounded-xl text-center">
                <Users className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">No rooms found</h3>
                <p className="text-muted-foreground mb-4">Start a new focus session with friends!</p>
                <Button className="gap-2">
                  <Plus className="w-4 h-4" />
                  Create Room
                </Button>
              </div>
            ) : (
              filteredRooms.map((room, idx) => (
                <motion.div
                  key={room.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.1 }}
                >
                  <Card 
                    className="glass-card cursor-pointer hover:border-primary/50 transition-all duration-300"
                    onClick={() => setSelectedRoom(room)}
                  >
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div>
                          <CardTitle className="text-lg">{room.name}</CardTitle>
                          <p className="text-sm text-muted-foreground mt-1">{room.description}</p>
                        </div>
                        {room.isActive && (
                          <span className="flex items-center gap-1 text-xs text-success">
                            <span className="w-2 h-2 rounded-full bg-success animate-pulse" />
                            Live
                          </span>
                        )}
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center justify-between">
                        <div className="flex -space-x-2">
                          {room.users.slice(0, 4).map((user) => (
                            <Avatar key={user.id} className="w-8 h-8 border-2 border-background">
                              <AvatarFallback className="text-xs bg-primary/20 text-primary">
                                {user.name.split(' ').map(n => n[0]).join('')}
                              </AvatarFallback>
                            </Avatar>
                          ))}
                          {room.users.length > 4 && (
                            <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center text-xs border-2 border-background">
                              +{room.users.length - 4}
                            </div>
                          )}
                        </div>
                        <Badge variant="outline">
                          {room.users.length}/{room.maxUsers}
                        </Badge>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

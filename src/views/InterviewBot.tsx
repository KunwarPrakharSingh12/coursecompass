import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Progress } from '@/components/ui/progress';
import { Bot, Send, User, Sparkles, Target, Lightbulb, RefreshCw } from 'lucide-react';

interface Message {
  id: string;
  role: 'bot' | 'user';
  content: string;
  feedback?: {
    optimality: number;
    clarity: number;
    suggestions: string[];
  };
}

const companies = [
  { id: 'google', name: 'Google', color: 'bg-blue-500' },
  { id: 'amazon', name: 'Amazon', color: 'bg-orange-500' },
  { id: 'meta', name: 'Meta', color: 'bg-indigo-500' },
  { id: 'microsoft', name: 'Microsoft', color: 'bg-green-500' },
  { id: 'apple', name: 'Apple', color: 'bg-gray-500' },
];

const topics = [
  'Arrays', 'Strings', 'Linked Lists', 'Trees', 'Graphs', 
  'Dynamic Programming', 'Sorting', 'Binary Search', 'Recursion', 'System Design'
];

const mockQuestions: Record<string, string[]> = {
  'Arrays': [
    "Given an array of integers, find two numbers such that they add up to a specific target. What's your approach?",
    "How would you find the maximum subarray sum? Walk me through your thought process.",
    "Explain how you would rotate an array by k positions. What's the optimal approach?"
  ],
  'Dynamic Programming': [
    "How would you solve the classic coin change problem? Explain your approach.",
    "Walk me through solving the longest common subsequence problem.",
    "How would you find the minimum number of steps to reach the end of an array?"
  ],
  'default': [
    "Tell me about a challenging coding problem you've solved recently.",
    "How do you approach a problem you've never seen before?",
    "What data structure would you use to implement an LRU cache?"
  ]
};

export function InterviewBot() {
  const [company, setCompany] = useState<string>('');
  const [topic, setTopic] = useState<string>('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [sessionStarted, setSessionStarted] = useState(false);

  const startSession = () => {
    if (!company || !topic) return;
    
    const questions = mockQuestions[topic] || mockQuestions['default'];
    const randomQuestion = questions[Math.floor(Math.random() * questions.length)];
    
    setMessages([{
      id: '1',
      role: 'bot',
      content: `Welcome to your ${companies.find(c => c.id === company)?.name} interview simulation! Let's focus on ${topic}.\n\n${randomQuestion}`
    }]);
    setSessionStarted(true);
  };

  const sendMessage = async () => {
    if (!input.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    // Simulate AI response
    await new Promise(resolve => setTimeout(resolve, 1500));

    const optimality = Math.floor(Math.random() * 30) + 70;
    const clarity = Math.floor(Math.random() * 30) + 70;

    const botResponse: Message = {
      id: (Date.now() + 1).toString(),
      role: 'bot',
      content: generateFeedback(optimality, clarity),
      feedback: {
        optimality,
        clarity,
        suggestions: [
          "Consider discussing time complexity first",
          "Mention edge cases like empty arrays",
          "Think about space optimization"
        ]
      }
    };

    setMessages(prev => [...prev, botResponse]);
    setIsLoading(false);
  };

  const generateFeedback = (opt: number, clarity: number): string => {
    if (opt >= 85 && clarity >= 85) {
      return "Excellent approach! Your solution demonstrates strong problem-solving skills. You clearly articulated the algorithm and considered optimization.\n\nLet me ask a follow-up: How would you handle this if the input size was 10 million elements?";
    } else if (opt >= 70) {
      return "Good thinking! Your approach is on the right track. I'd suggest also considering the time complexity implications.\n\nCan you think of a way to reduce the space complexity while maintaining the same time complexity?";
    }
    return "Interesting approach. Let's think about this more carefully. Consider breaking down the problem into smaller subproblems.\n\nWhat if we used a different data structure here?";
  };

  const resetSession = () => {
    setMessages([]);
    setSessionStarted(false);
    setCompany('');
    setTopic('');
  };

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between"
      >
        <div>
          <h1 className="text-3xl font-bold gradient-text">Interview Bot</h1>
          <p className="text-muted-foreground mt-1">Practice with AI-powered mock interviews</p>
        </div>
        {sessionStarted && (
          <Button variant="outline" onClick={resetSession} className="gap-2">
            <RefreshCw className="w-4 h-4" />
            New Session
          </Button>
        )}
      </motion.div>

      <AnimatePresence mode="wait">
        {!sessionStarted ? (
          <motion.div
            key="setup"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
          >
            <Card className="glass-card max-w-2xl mx-auto">
              <CardHeader className="text-center">
                <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                  <Bot className="w-8 h-8 text-primary" />
                </div>
                <CardTitle className="text-2xl">Start Your Interview</CardTitle>
                <p className="text-muted-foreground">Choose a company and topic to begin your practice session</p>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Select Company</label>
                  <div className="grid grid-cols-5 gap-2">
                    {companies.map((c) => (
                      <Button
                        key={c.id}
                        variant={company === c.id ? 'default' : 'outline'}
                        className="h-auto py-3 flex-col gap-1"
                        onClick={() => setCompany(c.id)}
                      >
                        <div className={`w-6 h-6 rounded ${c.color}`} />
                        <span className="text-xs">{c.name}</span>
                      </Button>
                    ))}
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Select Topic</label>
                  <Select value={topic} onValueChange={setTopic}>
                    <SelectTrigger>
                      <SelectValue placeholder="Choose a topic" />
                    </SelectTrigger>
                    <SelectContent>
                      {topics.map((t) => (
                        <SelectItem key={t} value={t}>{t}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <Button 
                  className="w-full gap-2" 
                  size="lg"
                  disabled={!company || !topic}
                  onClick={startSession}
                >
                  <Sparkles className="w-4 h-4" />
                  Start Interview
                </Button>
              </CardContent>
            </Card>
          </motion.div>
        ) : (
          <motion.div
            key="chat"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="grid gap-6 lg:grid-cols-3"
          >
            {/* Chat Area */}
            <Card className="glass-card lg:col-span-2 flex flex-col h-[600px]">
              <CardHeader className="border-b border-border/50">
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-lg ${companies.find(c => c.id === company)?.color} flex items-center justify-center`}>
                    <Bot className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <CardTitle className="text-lg">
                      {companies.find(c => c.id === company)?.name} Interviewer
                    </CardTitle>
                    <Badge variant="secondary">{topic}</Badge>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="flex-1 overflow-y-auto p-4 space-y-4">
                {messages.map((msg, idx) => (
                  <motion.div
                    key={msg.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.1 }}
                    className={`flex gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}
                  >
                    <Avatar className="w-8 h-8 shrink-0">
                      <AvatarFallback className={msg.role === 'bot' ? 'bg-primary text-primary-foreground' : 'bg-muted'}>
                        {msg.role === 'bot' ? <Bot className="w-4 h-4" /> : <User className="w-4 h-4" />}
                      </AvatarFallback>
                    </Avatar>
                    <div className={`max-w-[80%] ${msg.role === 'user' ? 'text-right' : ''}`}>
                      <div className={`rounded-2xl px-4 py-3 ${
                        msg.role === 'bot' 
                          ? 'bg-muted/50 rounded-tl-sm' 
                          : 'bg-primary text-primary-foreground rounded-tr-sm'
                      }`}>
                        <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
                      </div>
                      {msg.feedback && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          className="mt-3 p-3 rounded-lg bg-success/10 border border-success/20 text-left"
                        >
                          <div className="grid grid-cols-2 gap-4 mb-3">
                            <div>
                              <p className="text-xs text-muted-foreground flex items-center gap-1">
                                <Target className="w-3 h-3" /> Optimality
                              </p>
                              <Progress value={msg.feedback.optimality} className="h-2 mt-1" />
                              <p className="text-xs font-medium mt-1">{msg.feedback.optimality}%</p>
                            </div>
                            <div>
                              <p className="text-xs text-muted-foreground flex items-center gap-1">
                                <Lightbulb className="w-3 h-3" /> Clarity
                              </p>
                              <Progress value={msg.feedback.clarity} className="h-2 mt-1" />
                              <p className="text-xs font-medium mt-1">{msg.feedback.clarity}%</p>
                            </div>
                          </div>
                        </motion.div>
                      )}
                    </div>
                  </motion.div>
                ))}
                {isLoading && (
                  <div className="flex gap-3">
                    <Avatar className="w-8 h-8">
                      <AvatarFallback className="bg-primary text-primary-foreground">
                        <Bot className="w-4 h-4" />
                      </AvatarFallback>
                    </Avatar>
                    <div className="bg-muted/50 rounded-2xl rounded-tl-sm px-4 py-3">
                      <div className="flex gap-1">
                        <span className="w-2 h-2 rounded-full bg-primary/50 animate-bounce" />
                        <span className="w-2 h-2 rounded-full bg-primary/50 animate-bounce [animation-delay:0.1s]" />
                        <span className="w-2 h-2 rounded-full bg-primary/50 animate-bounce [animation-delay:0.2s]" />
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
              <div className="p-4 border-t border-border/50">
                <div className="flex gap-2">
                  <Textarea
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder="Type your answer..."
                    className="min-h-[60px] resize-none"
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        sendMessage();
                      }
                    }}
                  />
                  <Button 
                    size="icon" 
                    className="shrink-0 h-[60px] w-[60px]"
                    onClick={sendMessage}
                    disabled={isLoading || !input.trim()}
                  >
                    <Send className="w-5 h-5" />
                  </Button>
                </div>
              </div>
            </Card>

            {/* Tips Panel */}
            <Card className="glass-card h-fit">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Lightbulb className="w-5 h-5 text-warning" />
                  Interview Tips
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3 text-sm">
                  <div className="p-3 rounded-lg bg-muted/50">
                    <p className="font-medium mb-1">1. Think Out Loud</p>
                    <p className="text-muted-foreground text-xs">Explain your thought process as you work through the problem.</p>
                  </div>
                  <div className="p-3 rounded-lg bg-muted/50">
                    <p className="font-medium mb-1">2. Ask Clarifying Questions</p>
                    <p className="text-muted-foreground text-xs">Don't assume - verify constraints and edge cases.</p>
                  </div>
                  <div className="p-3 rounded-lg bg-muted/50">
                    <p className="font-medium mb-1">3. Start Simple</p>
                    <p className="text-muted-foreground text-xs">Begin with a brute force solution, then optimize.</p>
                  </div>
                  <div className="p-3 rounded-lg bg-muted/50">
                    <p className="font-medium mb-1">4. Analyze Complexity</p>
                    <p className="text-muted-foreground text-xs">Always discuss time and space complexity.</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

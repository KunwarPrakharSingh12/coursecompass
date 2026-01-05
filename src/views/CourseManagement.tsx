import { useState, useEffect, useRef } from 'react';
import { cn } from '@/lib/utils';
import { 
  BookOpen, Plus, Upload, ChevronRight, 
  CheckCircle2, Circle, Clock, Target, Edit2, X,
  ExternalLink, Loader2, FileText, Sparkles
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Progress } from '@/components/ui/progress';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Textarea } from '@/components/ui/textarea';
import { useCourses, Course, Topic } from '@/hooks/useCourses';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface Problem {
  id: string;
  name: string;
  difficulty: 'easy' | 'medium' | 'hard';
  platform: string;
  url: string;
  completed: boolean;
}

interface ExtractedTopic {
  name: string;
  estimated_hours: number;
  subtopics?: string[];
  difficulty?: string;
}

// Mock problems for display
const mockProblems: Record<string, Problem[]> = {
  'Arrays & Hashing': [
    { id: 'p1', name: 'Two Sum', difficulty: 'easy', platform: 'LeetCode', url: '#', completed: true },
    { id: 'p2', name: 'Contains Duplicate', difficulty: 'easy', platform: 'LeetCode', url: '#', completed: true },
    { id: 'p3', name: 'Valid Anagram', difficulty: 'easy', platform: 'LeetCode', url: '#', completed: false },
  ],
  'Two Pointers': [
    { id: 'p4', name: 'Valid Palindrome', difficulty: 'easy', platform: 'LeetCode', url: '#', completed: true },
    { id: 'p5', name: '3Sum', difficulty: 'medium', platform: 'LeetCode', url: '#', completed: false },
  ],
};

export function CourseManagement() {
  const { courses, loading, addCourse, addTopic, updateTopicProgress, refetch } = useCourses();
  const { user } = useAuth();
  const { toast } = useToast();

  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  const [selectedTopic, setSelectedTopic] = useState<Topic | null>(null);
  const [showAddCourse, setShowAddCourse] = useState(false);
  const [showAddTopic, setShowAddTopic] = useState(false);
  const [syllabusText, setSyllabusText] = useState('');
  const [syllabusDialogOpen, setSyllabusDialogOpen] = useState(false);
  const [extracting, setExtracting] = useState(false);
  const [extractedTopics, setExtractedTopics] = useState<ExtractedTopic[]>([]);
  const [suggestedCourseName, setSuggestedCourseName] = useState('');
  const [newCourse, setNewCourse] = useState({ name: '', description: '' });
  const [newTopic, setNewTopic] = useState({ name: '', estimated_hours: 10 });
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleExtractSyllabus = async () => {
    if (!syllabusText.trim() || syllabusText.length < 20) {
      toast({ title: 'Error', description: 'Please paste more syllabus content', variant: 'destructive' });
      return;
    }

    setExtracting(true);
    setExtractedTopics([]);

    try {
      const { data, error } = await supabase.functions.invoke('extract-syllabus', {
        body: { syllabus_text: syllabusText }
      });

      if (error) throw error;

      if (data.topics && data.topics.length > 0) {
        setExtractedTopics(data.topics);
        setSuggestedCourseName(data.course_name || 'Extracted Course');
        toast({ title: 'Success', description: `Extracted ${data.topics.length} topics` });
      } else {
        toast({ title: 'No topics found', description: 'Try adding more content', variant: 'destructive' });
      }
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Extraction failed';
      toast({ title: 'Error', description: message, variant: 'destructive' });
    } finally {
      setExtracting(false);
    }
  };

  const handleCreateFromExtracted = async () => {
    if (!extractedTopics.length) return;

    const course = await addCourse({ name: suggestedCourseName, description: 'Created from AI syllabus extraction' });
    if (course) {
      for (const topic of extractedTopics) {
        await addTopic(course.id, { name: topic.name, estimated_hours: topic.estimated_hours });
      }
      toast({ title: 'Course created', description: `Added ${extractedTopics.length} topics` });
      setSyllabusDialogOpen(false);
      setSyllabusText('');
      setExtractedTopics([]);
    }
  };

  const handlePdfUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.type === 'application/pdf') {
      setPdfFile(file);
      toast({ title: 'PDF uploaded', description: 'PDF processing coming soon. Please paste text content for now.' });
    }
  };

  useEffect(() => {
    if (courses.length > 0 && !selectedCourse) {
      setSelectedCourse(courses[0]);
    }
  }, [courses]);

  const handleAddCourse = async () => {
    if (!newCourse.name) return;
    const course = await addCourse(newCourse);
    if (course) {
      setShowAddCourse(false);
      setNewCourse({ name: '', description: '' });
    }
  };

  const handleAddTopic = async () => {
    if (!selectedCourse || !newTopic.name) return;
    await addTopic(selectedCourse.id, newTopic);
    setShowAddTopic(false);
    setNewTopic({ name: '', estimated_hours: 10 });
    await refetch();
    const updated = courses.find(c => c.id === selectedCourse.id);
    if (updated) setSelectedCourse(updated);
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'easy': return 'text-success bg-success/10 border-success/20';
      case 'medium': return 'text-warning bg-warning/10 border-warning/20';
      case 'hard': return 'text-distraction bg-distraction/10 border-distraction/20';
      default: return '';
    }
  };

  if (!user) {
    return (
      <div className="glass-card p-8 rounded-xl text-center">
        <h2 className="text-xl font-semibold mb-2">Please sign in</h2>
        <p className="text-muted-foreground">You need to be logged in to manage courses.</p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  const currentCourse = selectedCourse || courses[0];
  const topics = currentCourse?.topics || [];
  const overallProgress = topics.length > 0 
    ? Math.round(topics.reduce((sum, t) => sum + t.progress, 0) / topics.length) 
    : 0;
  const totalHours = topics.reduce((sum, t) => sum + Number(t.estimated_hours), 0);
  const completedHours = topics.reduce((sum, t) => sum + (Number(t.estimated_hours) * t.progress / 100), 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Course Management</h1>
          <p className="text-muted-foreground text-sm">Manage your curriculum and track topic mastery</p>
        </div>
        <div className="flex items-center gap-3">
          <Dialog open={syllabusDialogOpen} onOpenChange={setSyllabusDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="outline">
                <Upload className="w-4 h-4 mr-2" />
                Import Syllabus
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Import Syllabus with AI</DialogTitle>
                <DialogDescription>
                  Paste your syllabus content or upload a PDF. AI will extract topics automatically.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                {/* PDF Upload */}
                <div className="space-y-2">
                  <Label>Upload PDF (optional)</Label>
                  <div 
                    className="border-2 border-dashed border-border rounded-lg p-4 text-center cursor-pointer hover:border-focus transition-colors"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <FileText className="w-8 h-8 mx-auto mb-2 text-muted-foreground" />
                    <p className="text-sm text-muted-foreground">
                      {pdfFile ? pdfFile.name : 'Click to upload PDF'}
                    </p>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept=".pdf"
                      className="hidden"
                      onChange={handlePdfUpload}
                    />
                  </div>
                </div>

                {/* Text Input */}
                <div className="space-y-2">
                  <Label>Paste Syllabus Content</Label>
                  <Textarea 
                    placeholder="Paste your syllabus content here...&#10;&#10;Example:&#10;Week 1: Arrays & Hashing&#10;- Two Sum&#10;- Valid Anagram&#10;&#10;Week 2: Two Pointers&#10;- Valid Palindrome&#10;- 3Sum"
                    className="min-h-[200px]"
                    value={syllabusText}
                    onChange={(e) => setSyllabusText(e.target.value)}
                  />
                </div>

                {/* AI Info */}
                <div className="flex items-center gap-3 p-3 rounded-lg bg-focus/10 border border-focus/20">
                  <div className="w-10 h-10 rounded-lg bg-focus/20 flex items-center justify-center shrink-0">
                    <Sparkles className="w-5 h-5 text-focus" />
                  </div>
                  <div className="text-sm">
                    <p className="font-medium">AI-Powered Extraction</p>
                    <p className="text-xs text-muted-foreground">
                      Topics, estimated hours, and difficulty will be automatically extracted
                    </p>
                  </div>
                </div>

                {/* Extracted Topics Preview */}
                {extractedTopics.length > 0 && (
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <Label>Extracted Topics ({extractedTopics.length})</Label>
                      <Input
                        className="w-48"
                        placeholder="Course name"
                        value={suggestedCourseName}
                        onChange={(e) => setSuggestedCourseName(e.target.value)}
                      />
                    </div>
                    <div className="max-h-[200px] overflow-y-auto space-y-2">
                      {extractedTopics.map((topic, i) => (
                        <div key={i} className="flex items-center justify-between p-3 rounded-lg bg-secondary/50">
                          <div className="flex items-center gap-2">
                            <CheckCircle2 className="w-4 h-4 text-success" />
                            <span className="text-sm font-medium">{topic.name}</span>
                          </div>
                          <div className="flex items-center gap-2 text-xs text-muted-foreground">
                            <span>{topic.estimated_hours}h</span>
                            {topic.difficulty && (
                              <span className={cn(
                                "px-2 py-0.5 rounded-full",
                                topic.difficulty === 'beginner' && "bg-success/20 text-success",
                                topic.difficulty === 'intermediate' && "bg-warning/20 text-warning",
                                topic.difficulty === 'advanced' && "bg-distraction/20 text-distraction"
                              )}>
                                {topic.difficulty}
                              </span>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setSyllabusDialogOpen(false)}>Cancel</Button>
                {extractedTopics.length > 0 ? (
                  <Button onClick={handleCreateFromExtracted}>
                    <Plus className="w-4 h-4 mr-2" />
                    Create Course with {extractedTopics.length} Topics
                  </Button>
                ) : (
                  <Button onClick={handleExtractSyllabus} disabled={extracting || !syllabusText.trim()}>
                    {extracting ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Analyzing Topics...
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-4 h-4 mr-2" />
                        Generate Schedule with AI
                      </>
                    )}
                  </Button>
                )}
              </div>
            </DialogContent>
          </Dialog>
          <Button onClick={() => setShowAddCourse(true)}>
            <Plus className="w-4 h-4 mr-2" />
            New Course
          </Button>
        </div>
      </div>

      {/* Course Selector */}
      {courses.length > 1 && (
        <div className="flex gap-2 overflow-x-auto pb-2">
          {courses.map((course) => (
            <Button
              key={course.id}
              variant={currentCourse?.id === course.id ? 'default' : 'outline'}
              size="sm"
              onClick={() => { setSelectedCourse(course); setSelectedTopic(null); }}
            >
              {course.name}
            </Button>
          ))}
        </div>
      )}

      {courses.length === 0 ? (
        <div className="glass-card p-12 rounded-xl text-center">
          <BookOpen className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
          <h2 className="text-xl font-semibold mb-2">No Courses Yet</h2>
          <p className="text-muted-foreground mb-6">Create your first course to start tracking progress</p>
          <Button onClick={() => setShowAddCourse(true)}>
            <Plus className="w-4 h-4 mr-2" />
            Create Course
          </Button>
        </div>
      ) : currentCourse && (
        <>
          {/* Course Overview */}
          <div className="glass-card p-6 rounded-xl">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-2xl bg-gradient-primary flex items-center justify-center">
                  <BookOpen className="w-8 h-8 text-primary-foreground" />
                </div>
                <div>
                  <h2 className="text-xl font-bold">{currentCourse.name}</h2>
                  <p className="text-sm text-muted-foreground">
                    {topics.length} topics · {totalHours} hours estimated
                  </p>
                </div>
              </div>
              
              <div className="flex items-center gap-8">
                <div className="text-center">
                  <div className="text-3xl font-bold text-focus">{overallProgress}%</div>
                  <p className="text-xs text-muted-foreground">Complete</p>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold">{Math.round(completedHours)}</div>
                  <p className="text-xs text-muted-foreground">Hours Done</p>
                </div>
              </div>
            </div>
            
            <div className="mt-6">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-muted-foreground">Overall Progress</span>
                <span className="text-sm font-medium">{overallProgress}%</span>
              </div>
              <Progress value={overallProgress} className="h-2" indicatorClassName="bg-focus" />
            </div>
          </div>

          {/* Topics Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {topics.map((topic, index) => (
              <div
                key={topic.id}
                className={cn(
                  "glass-card p-5 rounded-xl cursor-pointer transition-all hover:shadow-card animate-slide-up",
                  selectedTopic?.id === topic.id && "ring-2 ring-focus"
                )}
                style={{ animationDelay: `${index * 50}ms` }}
                onClick={() => setSelectedTopic(topic)}
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className={cn(
                      "w-10 h-10 rounded-lg flex items-center justify-center",
                      topic.progress >= 80 ? "bg-success/20" :
                      topic.progress >= 50 ? "bg-focus/20" :
                      topic.progress >= 20 ? "bg-warning/20" : "bg-secondary"
                    )}>
                      {topic.progress >= 80 ? (
                        <CheckCircle2 className="w-5 h-5 text-success" />
                      ) : (
                        <span className="text-sm font-bold">{topic.progress}%</span>
                      )}
                    </div>
                    <div>
                      <h3 className="font-medium">{topic.name}</h3>
                      <p className="text-xs text-muted-foreground">
                        {Number(topic.estimated_hours)}h estimated
                      </p>
                    </div>
                  </div>
                  <ChevronRight className="w-5 h-5 text-muted-foreground" />
                </div>

                <Progress 
                  value={topic.progress} 
                  className="h-1.5 mb-3"
                  indicatorClassName={
                    topic.progress >= 80 ? 'bg-success' :
                    topic.progress >= 50 ? 'bg-focus' :
                    topic.progress >= 20 ? 'bg-warning' : 'bg-muted'
                  }
                />

                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {Number(topic.estimated_hours)}h
                  </span>
                  <span className="flex items-center gap-1">
                    <Target className="w-3 h-3" />
                    {Math.round(Number(topic.completed_hours))}h completed
                  </span>
                </div>
              </div>
            ))}

            {/* Add Topic Card */}
            <div
              className="glass-card p-5 rounded-xl border-2 border-dashed border-border cursor-pointer hover:border-focus hover:bg-focus/5 transition-all flex items-center justify-center min-h-[140px]"
              onClick={() => setShowAddTopic(true)}
            >
              <div className="text-center">
                <div className="w-12 h-12 rounded-full bg-secondary/50 flex items-center justify-center mx-auto mb-2">
                  <Plus className="w-6 h-6 text-muted-foreground" />
                </div>
                <p className="text-sm text-muted-foreground">Add New Topic</p>
              </div>
            </div>
          </div>

          {/* Topic Detail Panel */}
          {selectedTopic && (
            <div className="glass-card p-6 rounded-xl animate-fade-in">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-lg font-bold">{selectedTopic.name}</h3>
                  <p className="text-sm text-muted-foreground">
                    {selectedTopic.progress}% complete · {Number(selectedTopic.estimated_hours)}h estimated
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <Button variant="ghost" size="icon">
                    <Edit2 className="w-4 h-4" />
                  </Button>
                  <Button variant="ghost" size="icon" onClick={() => setSelectedTopic(null)}>
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Problems List */}
                <div>
                  <h4 className="font-medium text-sm mb-3">Problems</h4>
                  <div className="space-y-2">
                    {(mockProblems[selectedTopic.name] || []).map((problem) => (
                      <div
                        key={problem.id}
                        className={cn(
                          "flex items-center gap-3 p-3 rounded-lg bg-secondary/30 hover:bg-secondary/50 transition-all cursor-pointer",
                          problem.completed && "bg-success/10"
                        )}
                      >
                        {problem.completed ? (
                          <CheckCircle2 className="w-5 h-5 text-success shrink-0" />
                        ) : (
                          <Circle className="w-5 h-5 text-muted-foreground shrink-0" />
                        )}
                        <div className="flex-1 min-w-0">
                          <span className={cn(
                            "text-sm",
                            problem.completed && "line-through text-muted-foreground"
                          )}>
                            {problem.name}
                          </span>
                          <div className="flex items-center gap-2 mt-0.5">
                            <span className={cn(
                              "text-[10px] px-1.5 py-0.5 rounded border",
                              getDifficultyColor(problem.difficulty)
                            )}>
                              {problem.difficulty}
                            </span>
                            <span className="text-[10px] text-muted-foreground">{problem.platform}</span>
                          </div>
                        </div>
                        <ExternalLink className="w-4 h-4 text-muted-foreground shrink-0" />
                      </div>
                    ))}
                    {(!mockProblems[selectedTopic.name] || mockProblems[selectedTopic.name].length === 0) && (
                      <p className="text-sm text-muted-foreground p-3">No problems linked yet</p>
                    )}
                  </div>
                </div>

                {/* Progress Update */}
                <div>
                  <h4 className="font-medium text-sm mb-3">Update Progress</h4>
                  <div className="space-y-4">
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm text-muted-foreground">Current Progress</span>
                        <span className="text-sm font-medium">{selectedTopic.progress}%</span>
                      </div>
                      <Input
                        type="range"
                        min={0}
                        max={100}
                        value={selectedTopic.progress}
                        onChange={(e) => {
                          const newProgress = parseInt(e.target.value);
                          setSelectedTopic({ ...selectedTopic, progress: newProgress });
                        }}
                        className="w-full"
                      />
                    </div>
                    <Button 
                      className="w-full" 
                      onClick={() => updateTopicProgress(selectedTopic.id, selectedTopic.progress)}
                    >
                      Save Progress
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </>
      )}

      {/* Add Course Dialog */}
      <Dialog open={showAddCourse} onOpenChange={setShowAddCourse}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create New Course</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Course Name</Label>
              <Input
                placeholder="e.g., Data Structures & Algorithms"
                value={newCourse.name}
                onChange={(e) => setNewCourse({ ...newCourse, name: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>Description (optional)</Label>
              <Textarea
                placeholder="Brief description of the course..."
                value={newCourse.description}
                onChange={(e) => setNewCourse({ ...newCourse, description: e.target.value })}
              />
            </div>
            <Button className="w-full" onClick={handleAddCourse} disabled={!newCourse.name}>
              Create Course
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Add Topic Dialog */}
      <Dialog open={showAddTopic} onOpenChange={setShowAddTopic}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add New Topic</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Topic Name</Label>
              <Input
                placeholder="e.g., Binary Search"
                value={newTopic.name}
                onChange={(e) => setNewTopic({ ...newTopic, name: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>Estimated Hours</Label>
              <Input
                type="number"
                min={1}
                value={newTopic.estimated_hours}
                onChange={(e) => setNewTopic({ ...newTopic, estimated_hours: parseInt(e.target.value) })}
              />
            </div>
            <Button className="w-full" onClick={handleAddTopic} disabled={!newTopic.name}>
              Add Topic
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

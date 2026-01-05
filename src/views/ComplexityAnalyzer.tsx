import { useState } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Code2, Zap, Clock, HardDrive, Lightbulb, Copy, Check, Play } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface AnalysisResult {
  timeComplexity: string;
  spaceComplexity: string;
  explanation: string;
  optimizations: string[];
  betterApproach?: string;
}

const sampleCodes: Record<string, string> = {
  python: `def two_sum(nums, target):
    for i in range(len(nums)):
        for j in range(i + 1, len(nums)):
            if nums[i] + nums[j] == target:
                return [i, j]
    return []`,
  cpp: `vector<int> twoSum(vector<int>& nums, int target) {
    for (int i = 0; i < nums.size(); i++) {
        for (int j = i + 1; j < nums.size(); j++) {
            if (nums[i] + nums[j] == target) {
                return {i, j};
            }
        }
    }
    return {};
}`,
  java: `public int[] twoSum(int[] nums, int target) {
    for (int i = 0; i < nums.length; i++) {
        for (int j = i + 1; j < nums.length; j++) {
            if (nums[i] + nums[j] == target) {
                return new int[] {i, j};
            }
        }
    }
    return new int[] {};
}`
};

export function ComplexityAnalyzer() {
  const [code, setCode] = useState('');
  const [language, setLanguage] = useState('python');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [copied, setCopied] = useState(false);
  const { toast } = useToast();

  const analyzeCode = async () => {
    if (!code.trim()) {
      toast({
        title: "No code provided",
        description: "Please paste your code to analyze",
        variant: "destructive"
      });
      return;
    }

    setIsAnalyzing(true);
    
    // Simulate AI analysis
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Mock analysis based on code patterns
    const hasNestedLoop = code.includes('for') && (code.match(/for/g) || []).length >= 2;
    const hasHashMap = code.includes('dict') || code.includes('map') || code.includes('HashMap') || code.includes('unordered_map');
    const hasRecursion = code.includes('def ') && code.includes('return ') && code.split('def ')[1]?.includes(code.split('def ')[1]?.split('(')[0] || '');

    let analysis: AnalysisResult;

    if (hasNestedLoop && !hasHashMap) {
      analysis = {
        timeComplexity: 'O(n²)',
        spaceComplexity: 'O(1)',
        explanation: 'Your solution uses nested loops, iterating through the array twice. While this is correct, it can be optimized using a hash map for O(n) time complexity.',
        optimizations: [
          'Use a hash map to store seen values',
          'Trade space for time by using O(n) extra space',
          'Single pass solution is possible'
        ],
        betterApproach: `# Optimized O(n) solution
def two_sum_optimized(nums, target):
    seen = {}
    for i, num in enumerate(nums):
        complement = target - num
        if complement in seen:
            return [seen[complement], i]
        seen[num] = i
    return []`
      };
    } else if (hasHashMap) {
      analysis = {
        timeComplexity: 'O(n)',
        spaceComplexity: 'O(n)',
        explanation: 'Great job! Your solution efficiently uses a hash map for O(1) lookups, resulting in optimal time complexity.',
        optimizations: [
          'Consider edge cases like duplicate values',
          'Handle potential integer overflow for large numbers',
          'Early termination when solution is found'
        ]
      };
    } else if (hasRecursion) {
      analysis = {
        timeComplexity: 'O(2ⁿ) or O(n)',
        spaceComplexity: 'O(n) - stack space',
        explanation: 'Recursive solutions have additional space overhead from the call stack. Consider if iteration would be more efficient.',
        optimizations: [
          'Add memoization to avoid redundant calculations',
          'Consider tail recursion optimization',
          'Convert to iterative solution if possible'
        ]
      };
    } else {
      analysis = {
        timeComplexity: 'O(n)',
        spaceComplexity: 'O(1)',
        explanation: 'Your solution appears to have linear time complexity with constant space usage.',
        optimizations: [
          'Verify edge cases are handled',
          'Consider input validation',
          'Test with large inputs for performance'
        ]
      };
    }

    setResult(analysis);
    setIsAnalyzing(false);
  };

  const loadSample = () => {
    setCode(sampleCodes[language]);
    setResult(null);
  };

  const copyOptimized = () => {
    if (result?.betterApproach) {
      navigator.clipboard.writeText(result.betterApproach);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
      toast({ title: "Copied to clipboard" });
    }
  };

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between"
      >
        <div>
          <h1 className="text-3xl font-bold gradient-text">Complexity Analyzer</h1>
          <p className="text-muted-foreground mt-1">Analyze your code's time and space complexity</p>
        </div>
        <div className="flex gap-2">
          <Select value={language} onValueChange={setLanguage}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="python">Python</SelectItem>
              <SelectItem value="cpp">C++</SelectItem>
              <SelectItem value="java">Java</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" onClick={loadSample}>
            Load Sample
          </Button>
        </div>
      </motion.div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Code Input */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
        >
          <Card className="glass-card h-full">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Code2 className="w-5 h-5 text-primary" />
                Your Code
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Textarea
                value={code}
                onChange={(e) => {
                  setCode(e.target.value);
                  setResult(null);
                }}
                placeholder="Paste your code here..."
                className="min-h-[400px] font-mono text-sm resize-none"
              />
              <Button 
                className="w-full gap-2" 
                size="lg"
                onClick={analyzeCode}
                disabled={isAnalyzing}
              >
                {isAnalyzing ? (
                  <>
                    <div className="w-4 h-4 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin" />
                    Analyzing...
                  </>
                ) : (
                  <>
                    <Play className="w-4 h-4" />
                    Analyze Complexity
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        </motion.div>

        {/* Analysis Result */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
        >
          <Card className="glass-card h-full">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Zap className="w-5 h-5 text-warning" />
                AI Analysis
              </CardTitle>
            </CardHeader>
            <CardContent>
              {result ? (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="space-y-6"
                >
                  {/* Complexity Cards */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-4 rounded-xl bg-primary/10 border border-primary/20 text-center">
                      <Clock className="w-6 h-6 mx-auto mb-2 text-primary" />
                      <p className="text-xs text-muted-foreground mb-1">Time Complexity</p>
                      <p className="text-2xl font-bold font-mono text-primary">{result.timeComplexity}</p>
                    </div>
                    <div className="p-4 rounded-xl bg-success/10 border border-success/20 text-center">
                      <HardDrive className="w-6 h-6 mx-auto mb-2 text-success" />
                      <p className="text-xs text-muted-foreground mb-1">Space Complexity</p>
                      <p className="text-2xl font-bold font-mono text-success">{result.spaceComplexity}</p>
                    </div>
                  </div>

                  {/* Explanation */}
                  <div className="p-4 rounded-lg bg-muted/50">
                    <p className="text-sm">{result.explanation}</p>
                  </div>

                  {/* Optimizations */}
                  <div>
                    <h4 className="font-semibold mb-3 flex items-center gap-2">
                      <Lightbulb className="w-4 h-4 text-warning" />
                      Optimization Suggestions
                    </h4>
                    <ul className="space-y-2">
                      {result.optimizations.map((opt, idx) => (
                        <li key={idx} className="flex items-start gap-2 text-sm">
                          <Badge variant="outline" className="shrink-0 mt-0.5">{idx + 1}</Badge>
                          <span className="text-muted-foreground">{opt}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Better Approach */}
                  {result.betterApproach && (
                    <div>
                      <div className="flex items-center justify-between mb-3">
                        <h4 className="font-semibold flex items-center gap-2">
                          <Zap className="w-4 h-4 text-success" />
                          Optimized Solution
                        </h4>
                        <Button variant="ghost" size="sm" onClick={copyOptimized} className="gap-1">
                          {copied ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                          {copied ? 'Copied' : 'Copy'}
                        </Button>
                      </div>
                      <pre className="p-4 rounded-lg bg-muted/50 overflow-x-auto text-xs font-mono">
                        {result.betterApproach}
                      </pre>
                    </div>
                  )}
                </motion.div>
              ) : (
                <div className="flex flex-col items-center justify-center h-[400px] text-center">
                  <Code2 className="w-16 h-16 text-muted-foreground/50 mb-4" />
                  <h3 className="font-semibold text-lg mb-2">Ready to Analyze</h3>
                  <p className="text-muted-foreground text-sm max-w-xs">
                    Paste your code on the left and click "Analyze" to get detailed complexity analysis
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}

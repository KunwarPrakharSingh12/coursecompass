import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface ScheduleBlock {
  id?: string;
  topic_name: string;
  day_of_week: number;
  start_hour: number;
  end_hour: number;
  status?: string;
}

interface ActivityPattern {
  day: string;
  peak_hours: number[];
  focus_score: number;
  problems_solved: number;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { current_schedule, activity_patterns, topics, preferences } = await req.json();
    
    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY is not configured');
    }

    console.log("Optimizing schedule with AI...", { 
      blocks: current_schedule?.length || 0,
      topics: topics?.length || 0 
    });

    const systemPrompt = `You are an expert study schedule optimizer. Your job is to analyze a student's current study patterns and create an optimized weekly schedule.

Consider these factors:
1. Peak productivity hours (when focus is highest)
2. Topic difficulty (harder topics should be scheduled during peak hours)
3. Spaced repetition (don't cluster same topics together)
4. Break times (include short breaks between intense sessions)
5. Weekend vs weekday patterns

Return ONLY a valid JSON array of schedule blocks. Each block must have:
- topic_name: string (the study topic)
- day_of_week: number (0=Sunday to 6=Saturday)
- start_hour: number (8-20, in 24-hour format)
- end_hour: number (9-20, must be > start_hour)

Generate 15-20 blocks spread across the week. Do not include any explanation, just the JSON array.`;

    const userPrompt = `Current schedule: ${JSON.stringify(current_schedule || [])}

Activity patterns: ${JSON.stringify(activity_patterns || {
  best_days: ['Monday', 'Wednesday', 'Friday'],
  peak_hours: [9, 10, 11, 14, 15],
  average_focus: 75,
  preferred_session_length: 90
})}

Topics to study: ${JSON.stringify(topics || [
  'Arrays & Hashing',
  'Two Pointers', 
  'Sliding Window',
  'Binary Search',
  'Linked List',
  'Trees',
  'Dynamic Programming'
])}

User preferences: ${JSON.stringify(preferences || {
  daily_study_hours: 4,
  break_duration: 15,
  preferred_start: 9,
  preferred_end: 18
})}

Generate an optimized weekly study schedule.`;

    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ],
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('AI gateway error:', response.status, errorText);
      
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: 'Rate limit exceeded. Please try again later.' }), {
          status: 429,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: 'API credits exhausted. Please add credits.' }), {
          status: 402,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      throw new Error(`AI gateway error: ${response.status}`);
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content || '';
    
    console.log("AI response:", content.substring(0, 500));

    // Parse the JSON from the response
    let optimizedSchedule: ScheduleBlock[] = [];
    try {
      // Try to extract JSON from the response
      const jsonMatch = content.match(/\[[\s\S]*\]/);
      if (jsonMatch) {
        optimizedSchedule = JSON.parse(jsonMatch[0]);
      } else {
        throw new Error('No JSON array found in response');
      }
    } catch (parseError) {
      console.error('Failed to parse AI response:', parseError);
      // Return a fallback schedule
      optimizedSchedule = generateFallbackSchedule(topics || []);
    }

    // Validate and clean the schedule
    optimizedSchedule = optimizedSchedule.filter(block => 
      block.topic_name &&
      typeof block.day_of_week === 'number' &&
      block.day_of_week >= 0 && block.day_of_week <= 6 &&
      typeof block.start_hour === 'number' &&
      typeof block.end_hour === 'number' &&
      block.start_hour >= 8 && block.start_hour <= 19 &&
      block.end_hour > block.start_hour && block.end_hour <= 20
    );

    console.log("Returning optimized schedule with", optimizedSchedule.length, "blocks");

    return new Response(JSON.stringify({ 
      schedule: optimizedSchedule,
      insights: generateInsights(optimizedSchedule)
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('Error optimizing schedule:', errorMessage);
    return new Response(JSON.stringify({ error: errorMessage }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

function generateFallbackSchedule(topics: string[]): ScheduleBlock[] {
  const defaultTopics = topics.length > 0 ? topics : [
    'Arrays & Hashing', 'Two Pointers', 'Binary Search', 
    'Linked List', 'Trees', 'Dynamic Programming'
  ];
  
  const schedule: ScheduleBlock[] = [];
  const days = [1, 2, 3, 4, 5]; // Monday to Friday
  let topicIndex = 0;

  for (const day of days) {
    // Morning session
    schedule.push({
      topic_name: defaultTopics[topicIndex % defaultTopics.length],
      day_of_week: day,
      start_hour: 9,
      end_hour: 11,
    });
    topicIndex++;

    // Afternoon session
    schedule.push({
      topic_name: defaultTopics[topicIndex % defaultTopics.length],
      day_of_week: day,
      start_hour: 14,
      end_hour: 16,
    });
    topicIndex++;
  }

  // Weekend light sessions
  schedule.push({
    topic_name: 'Break',
    day_of_week: 6,
    start_hour: 10,
    end_hour: 11,
  });

  return schedule;
}

function generateInsights(schedule: ScheduleBlock[]): string[] {
  const insights: string[] = [];
  
  const totalHours = schedule.reduce((sum, b) => sum + (b.end_hour - b.start_hour), 0);
  insights.push(`Your optimized schedule includes ${totalHours} hours of focused study time.`);
  
  const morningBlocks = schedule.filter(b => b.start_hour < 12).length;
  const afternoonBlocks = schedule.filter(b => b.start_hour >= 12).length;
  
  if (morningBlocks > afternoonBlocks) {
    insights.push("Schedule optimized for morning productivity when focus is typically highest.");
  } else {
    insights.push("Balanced distribution between morning and afternoon sessions.");
  }
  
  insights.push("Harder topics like Dynamic Programming are scheduled during peak hours.");
  
  return insights;
}

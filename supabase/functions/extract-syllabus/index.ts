// @ts-ignore - Deno imports
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface SyllabusRequest {
  syllabus_text: string;
}

serve(async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { syllabus_text }: SyllabusRequest = await req.json();

    if (!syllabus_text || syllabus_text.trim().length < 10) {
      return new Response(
        JSON.stringify({ error: "Syllabus text is too short" }),
        { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    console.log("Extracting topics from syllabus...");

    // Use Lovable AI gateway
    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          {
            role: "system",
            content: `You are an expert curriculum designer. Extract topics from syllabus content and organize them into a structured learning plan. 
            
Return a JSON array of topics with this structure:
{
  "topics": [
    {
      "name": "Topic Name",
      "estimated_hours": 10,
      "subtopics": ["subtopic1", "subtopic2"],
      "difficulty": "beginner|intermediate|advanced"
    }
  ],
  "course_name": "Suggested Course Name",
  "total_estimated_hours": 100
}

Be practical with hour estimates. Consider typical learning curves.`
          },
          {
            role: "user",
            content: `Extract topics from this syllabus content:\n\n${syllabus_text}`
          }
        ],
        temperature: 0.3,
        max_tokens: 2000,
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      console.error("AI API error:", error);
      return new Response(
        JSON.stringify({ error: "Failed to process syllabus" }),
        { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content || "";

    // Parse JSON from response
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      console.error("No JSON found in response:", content);
      return new Response(
        JSON.stringify({ error: "Failed to parse AI response" }),
        { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    const result = JSON.parse(jsonMatch[0]);

    return new Response(
      JSON.stringify({ 
        success: true, 
        ...result
      }),
      { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    console.error("Error extracting syllabus:", errorMessage);
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  }
});

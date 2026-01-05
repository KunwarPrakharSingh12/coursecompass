import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.89.0";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface SyncRequest {
  user_id: string;
  leetcode_username: string;
}

serve(async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
    const { user_id, leetcode_username }: SyncRequest = await req.json();

    console.log(`Syncing LeetCode activity for user ${user_id}, username: ${leetcode_username}`);

    if (!leetcode_username) {
      return new Response(
        JSON.stringify({ error: "LeetCode username is required" }),
        { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    // Use LeetCode GraphQL API (public endpoint)
    const query = `
      query getUserProfile($username: String!) {
        matchedUser(username: $username) {
          username
          submitStats: submitStatsGlobal {
            acSubmissionNum {
              difficulty
              count
              submissions
            }
          }
          recentSubmissionList(limit: 20) {
            title
            titleSlug
            timestamp
            statusDisplay
            lang
          }
        }
      }
    `;

    const leetcodeResponse = await fetch("https://leetcode.com/graphql", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "User-Agent": "FocusAI-Study-Monitor",
      },
      body: JSON.stringify({
        query,
        variables: { username: leetcode_username },
      }),
    });

    if (!leetcodeResponse.ok) {
      const error = await leetcodeResponse.text();
      console.error("LeetCode API error:", error);
      return new Response(
        JSON.stringify({ error: "Failed to fetch LeetCode data", details: error }),
        { status: leetcodeResponse.status, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    const data = await leetcodeResponse.json();
    const user = data.data?.matchedUser;

    if (!user) {
      return new Response(
        JSON.stringify({ error: "LeetCode user not found" }),
        { status: 404, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    const submissions = user.recentSubmissionList || [];
    console.log(`Fetched ${submissions.length} recent LeetCode submissions`);

    // Process submissions and create activity sessions
    const sessions = [];
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    for (const submission of submissions) {
      const submissionDate = new Date(parseInt(submission.timestamp) * 1000);
      
      // Only process submissions from the last 7 days
      const daysAgo = Math.floor((today.getTime() - submissionDate.getTime()) / (1000 * 60 * 60 * 24));
      if (daysAgo > 7) continue;

      const isAccepted = submission.statusDisplay === "Accepted";
      
      sessions.push({
        user_id,
        title: `${isAccepted ? "✓ Solved" : "Attempted"}: ${submission.title} (${submission.lang})`,
        platform: "leetcode",
        category: "dsa-practice",
        url: `https://leetcode.com/problems/${submission.titleSlug}/`,
        start_time: submissionDate.toISOString(),
        duration: isAccepted ? 30 : 15, // 30 min for solved, 15 for attempts
      });
    }

    // Insert sessions
    if (sessions.length > 0) {
      const { error: insertError } = await supabase
        .from('activity_sessions')
        .upsert(sessions, { 
          onConflict: 'user_id,start_time,platform',
          ignoreDuplicates: true 
        });

      if (insertError) {
        console.error("Error inserting sessions:", insertError);
      }
    }

    // Get stats summary
    const stats = user.submitStats?.acSubmissionNum || [];
    const totalSolved = stats.find((s: { difficulty: string; count: number }) => s.difficulty === "All")?.count || 0;
    const easySolved = stats.find((s: { difficulty: string; count: number }) => s.difficulty === "Easy")?.count || 0;
    const mediumSolved = stats.find((s: { difficulty: string; count: number }) => s.difficulty === "Medium")?.count || 0;
    const hardSolved = stats.find((s: { difficulty: string; count: number }) => s.difficulty === "Hard")?.count || 0;

    return new Response(
      JSON.stringify({ 
        success: true, 
        synced: sessions.length,
        stats: {
          total: totalSolved,
          easy: easySolved,
          medium: mediumSolved,
          hard: hardSolved,
        }
      }),
      { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    console.error("Error syncing LeetCode activity:", errorMessage);
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  }
});

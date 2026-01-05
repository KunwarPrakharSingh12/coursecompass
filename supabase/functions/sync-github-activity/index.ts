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
  github_username: string;
  github_token?: string;
}

serve(async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
    const { user_id, github_username, github_token }: SyncRequest = await req.json();

    console.log(`Syncing GitHub activity for user ${user_id}, username: ${github_username}`);

    if (!github_username) {
      return new Response(
        JSON.stringify({ error: "GitHub username is required" }),
        { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    // Fetch recent GitHub events (public API, no auth required for public events)
    const headers: HeadersInit = {
      "Accept": "application/vnd.github+json",
      "User-Agent": "FocusAI-Study-Monitor",
    };
    
    if (github_token) {
      headers["Authorization"] = `Bearer ${github_token}`;
    }

    const eventsResponse = await fetch(
      `https://api.github.com/users/${github_username}/events?per_page=30`,
      { headers }
    );

    if (!eventsResponse.ok) {
      const error = await eventsResponse.text();
      console.error("GitHub API error:", error);
      return new Response(
        JSON.stringify({ error: "Failed to fetch GitHub events", details: error }),
        { status: eventsResponse.status, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    const events = await eventsResponse.json();
    console.log(`Fetched ${events.length} GitHub events`);

    // Process events and create activity sessions
    const sessions = [];
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    for (const event of events) {
      const eventDate = new Date(event.created_at);
      
      // Only process events from the last 7 days
      const daysAgo = Math.floor((today.getTime() - eventDate.getTime()) / (1000 * 60 * 60 * 24));
      if (daysAgo > 7) continue;

      let title = "";
      let category = "coding";
      let duration = 15; // Default 15 minutes per event

      switch (event.type) {
        case "PushEvent":
          const commits = event.payload?.commits?.length || 1;
          title = `Pushed ${commits} commit(s) to ${event.repo?.name}`;
          duration = commits * 10;
          break;
        case "PullRequestEvent":
          title = `${event.payload?.action} PR in ${event.repo?.name}`;
          duration = 30;
          break;
        case "IssuesEvent":
          title = `${event.payload?.action} issue in ${event.repo?.name}`;
          duration = 15;
          break;
        case "CreateEvent":
          title = `Created ${event.payload?.ref_type} in ${event.repo?.name}`;
          duration = 10;
          break;
        case "ForkEvent":
          title = `Forked ${event.repo?.name}`;
          duration = 5;
          break;
        case "WatchEvent":
          title = `Starred ${event.repo?.name}`;
          duration = 2;
          category = "learning";
          break;
        case "IssueCommentEvent":
          title = `Commented on issue in ${event.repo?.name}`;
          duration = 10;
          break;
        default:
          title = `${event.type.replace("Event", "")} in ${event.repo?.name}`;
          duration = 10;
      }

      sessions.push({
        user_id,
        title,
        platform: "github",
        category,
        url: `https://github.com/${event.repo?.name}`,
        start_time: event.created_at,
        duration,
      });
    }

    // Insert sessions (upsert to avoid duplicates based on url + start_time)
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

    return new Response(
      JSON.stringify({ 
        success: true, 
        synced: sessions.length,
        events_processed: events.length 
      }),
      { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    console.error("Error syncing GitHub activity:", errorMessage);
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  }
});

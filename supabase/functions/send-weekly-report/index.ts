import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.89.0";

const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");
const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface WeeklyReportRequest {
  user_id?: string;
  force?: boolean;
}

serve(async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
    const body: WeeklyReportRequest = req.method === "POST" ? await req.json() : {};
    
    const today = new Date().getDay();
    console.log(`Running weekly report. Today is day ${today}`);

    // Get users who have parent email configured and matching report day
    let query = supabase
      .from('profiles')
      .select('user_id, full_name, parent_email, weekly_report_day')
      .not('parent_email', 'is', null);

    if (body.user_id) {
      query = query.eq('user_id', body.user_id);
    } else if (!body.force) {
      query = query.eq('weekly_report_day', today);
    }

    const { data: profiles, error: profilesError } = await query;

    if (profilesError) {
      console.error("Error fetching profiles:", profilesError);
      throw profilesError;
    }

    console.log(`Found ${profiles?.length || 0} users to send reports to`);

    if (!profiles || profiles.length === 0) {
      return new Response(JSON.stringify({ success: true, sent: 0 }), {
        status: 200,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }

    if (!RESEND_API_KEY) {
      console.error("RESEND_API_KEY not configured");
      return new Response(JSON.stringify({ error: "Email service not configured" }), {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }

    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

    let sentCount = 0;

    for (const profile of profiles) {
      // Get activity sessions for the week
      const { data: sessions } = await supabase
        .from('activity_sessions')
        .select('*')
        .eq('user_id', profile.user_id)
        .gte('start_time', oneWeekAgo.toISOString());

      // Get courses progress
      const { data: courses } = await supabase
        .from('courses')
        .select('name, overall_progress')
        .eq('user_id', profile.user_id);

      // Get alerts from the week
      const { data: alerts } = await supabase
        .from('alerts')
        .select('type, title')
        .eq('user_id', profile.user_id)
        .gte('created_at', oneWeekAgo.toISOString());

      // Calculate stats
      const totalMinutes = sessions?.reduce((sum, s) => sum + (s.duration || 0), 0) || 0;
      const studyMinutes = sessions?.filter(s => s.category !== 'distraction').reduce((sum, s) => sum + (s.duration || 0), 0) || 0;
      const totalHours = Math.floor(totalMinutes / 60);
      const studyHours = Math.floor(studyMinutes / 60);
      const focusScore = totalMinutes > 0 ? Math.round((studyMinutes / totalMinutes) * 100) : 0;
      const totalSessions = sessions?.length || 0;
      const criticalAlerts = alerts?.filter(a => a.type === 'critical').length || 0;
      const warningAlerts = alerts?.filter(a => a.type === 'warning').length || 0;

      const courseProgressHtml = courses?.map(c => `
        <tr>
          <td style="padding: 12px; border-bottom: 1px solid #2a2a4a;">${c.name}</td>
          <td style="padding: 12px; border-bottom: 1px solid #2a2a4a; text-align: right;">
            <span style="color: ${c.overall_progress >= 75 ? '#22c55e' : c.overall_progress >= 50 ? '#6366f1' : '#f59e0b'}">${c.overall_progress}%</span>
          </td>
        </tr>
      `).join('') || '<tr><td colspan="2" style="padding: 12px; color: #666;">No courses tracked</td></tr>';

      const emailHtml = `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background: #0a0a0f; color: #e5e5e5; padding: 40px 20px; margin: 0; }
            .container { max-width: 600px; margin: 0 auto; background: #1a1a2e; border-radius: 16px; padding: 32px; border: 1px solid #2a2a4a; }
            .header { text-align: center; margin-bottom: 32px; }
            .logo { font-size: 32px; margin-bottom: 16px; }
            h1 { font-size: 24px; margin: 0 0 8px; color: #ffffff; }
            .subtitle { color: #888; font-size: 14px; }
            .stats-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 16px; margin: 24px 0; }
            .stat-card { background: #0f0f1a; border-radius: 12px; padding: 20px; text-align: center; }
            .stat-value { font-size: 28px; font-weight: bold; color: #6366f1; }
            .stat-label { font-size: 12px; color: #888; margin-top: 4px; }
            .section { margin: 24px 0; }
            .section-title { font-size: 16px; font-weight: 600; margin-bottom: 12px; color: #fff; }
            table { width: 100%; border-collapse: collapse; }
            .alert-badge { display: inline-block; padding: 4px 12px; border-radius: 12px; font-size: 12px; }
            .alert-critical { background: #ef444420; color: #ef4444; }
            .alert-warning { background: #f59e0b20; color: #f59e0b; }
            .footer { text-align: center; font-size: 12px; color: #666; margin-top: 32px; padding-top: 24px; border-top: 1px solid #2a2a4a; }
            .focus-score { font-size: 36px; font-weight: bold; background: linear-gradient(135deg, #6366f1, #8b5cf6); -webkit-background-clip: text; -webkit-text-fill-color: transparent; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <div class="logo">📊</div>
              <h1>Weekly Study Report</h1>
              <p class="subtitle">Progress report for ${profile.full_name || 'Your Student'}</p>
              <p class="subtitle">${oneWeekAgo.toLocaleDateString()} - ${new Date().toLocaleDateString()}</p>
            </div>

            <div style="text-align: center; margin: 24px 0;">
              <p style="color: #888; margin-bottom: 8px;">Focus Score</p>
              <div class="focus-score">${focusScore}%</div>
            </div>

            <div class="stats-grid">
              <div class="stat-card">
                <div class="stat-value">${studyHours}h</div>
                <div class="stat-label">Study Time</div>
              </div>
              <div class="stat-card">
                <div class="stat-value">${totalSessions}</div>
                <div class="stat-label">Total Sessions</div>
              </div>
              <div class="stat-card">
                <div class="stat-value">${totalHours}h</div>
                <div class="stat-label">Active Time</div>
              </div>
              <div class="stat-card">
                <div class="stat-value">${courses?.length || 0}</div>
                <div class="stat-label">Active Courses</div>
              </div>
            </div>

            ${(criticalAlerts > 0 || warningAlerts > 0) ? `
              <div class="section">
                <div class="section-title">⚠️ Alerts This Week</div>
                <div style="display: flex; gap: 12px;">
                  ${criticalAlerts > 0 ? `<span class="alert-badge alert-critical">${criticalAlerts} Critical</span>` : ''}
                  ${warningAlerts > 0 ? `<span class="alert-badge alert-warning">${warningAlerts} Warnings</span>` : ''}
                </div>
              </div>
            ` : ''}

            <div class="section">
              <div class="section-title">📚 Course Progress</div>
              <table>
                ${courseProgressHtml}
              </table>
            </div>

            <div class="footer">
              <p>This report was automatically generated by Study Monitor</p>
              <p>You're receiving this because weekly reports are enabled in settings.</p>
            </div>
          </div>
        </body>
        </html>
      `;

      const emailResponse = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${RESEND_API_KEY}`,
        },
        body: JSON.stringify({
          from: "Study Monitor <onboarding@resend.dev>",
          to: [profile.parent_email],
          subject: `📊 Weekly Study Report - ${profile.full_name || 'Your Student'}`,
          html: emailHtml,
        }),
      });

      if (emailResponse.ok) {
        sentCount++;
        console.log(`Sent weekly report to ${profile.parent_email}`);
      } else {
        const error = await emailResponse.text();
        console.error(`Failed to send to ${profile.parent_email}:`, error);
      }
    }

    return new Response(JSON.stringify({ success: true, sent: sentCount }), {
      status: 200,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error("Error sending weekly reports:", errorMessage);
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  }
});

import { cn } from '@/lib/utils';
import { FileText, Shield, Eye, Bell, Database, Mail } from 'lucide-react';

export function TermsView() {
  return (
    <div className="space-y-6 max-w-3xl">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold">Terms & Conditions</h1>
        <p className="text-muted-foreground text-sm">Last updated: January 2026</p>
      </div>

      {/* Sections */}
      <div className="space-y-6">
        <Section
          icon={FileText}
          title="1. Acceptance of Terms"
          content="By accessing and using FocusAI, you acknowledge that you have read, understood, and agree to be bound by these Terms and Conditions. If you do not agree to these terms, please do not use the application."
        />

        <Section
          icon={Eye}
          title="2. Description of Service"
          content="FocusAI is a study monitoring and productivity platform designed to help students track their learning progress, manage study schedules, and maintain focus. The service includes activity tracking, AI-powered schedule optimization, and parent monitoring features."
        />

        <Section
          icon={Database}
          title="3. User Data & Privacy"
          content={`We collect and process the following data:
          
• Activity sessions and study time tracking
• Course progress and learning metrics
• Connected platform activity (GitHub, LeetCode, etc.)
• Email addresses for account management and notifications

Your data is stored securely and is never sold to third parties. Activity data is used solely to provide you with insights about your study habits.`}
        />

        <Section
          icon={Shield}
          title="4. Parent Monitoring"
          content="FocusAI includes a Parent Mode feature that allows authorized parents/guardians to view study progress and receive alerts. Students using this feature consent to sharing their activity data with their designated parent/guardian. Parents can access weekly reports, real-time alerts, and progress dashboards."
        />

        <Section
          icon={Bell}
          title="5. Notifications & Alerts"
          content="By enabling notifications, you consent to receive:

• Push notifications about focus drops and schedule reminders
• Email alerts for critical activity warnings
• Weekly progress report emails (when parent email is configured)

You can disable notifications at any time in Settings."
        />

        <Section
          icon={Mail}
          title="6. Third-Party Integrations"
          content="When you connect external accounts (GitHub, LeetCode, etc.), we access only the data necessary to track your coding activity. We do not modify or interact with your external accounts beyond reading public activity data. You can disconnect integrations at any time."
        />

        <div className="glass-card p-6 rounded-xl">
          <h2 className="font-semibold mb-4">7. Limitation of Liability</h2>
          <p className="text-sm text-muted-foreground">
            FocusAI is provided "as is" without warranties of any kind. We are not responsible for any loss of data, productivity, or academic performance. The AI-powered features provide suggestions and should not be considered as professional academic advice.
          </p>
        </div>

        <div className="glass-card p-6 rounded-xl">
          <h2 className="font-semibold mb-4">8. Changes to Terms</h2>
          <p className="text-sm text-muted-foreground">
            We reserve the right to modify these terms at any time. Continued use of the service after changes constitutes acceptance of the new terms. We will notify users of significant changes via email or in-app notification.
          </p>
        </div>

        <div className="glass-card p-6 rounded-xl">
          <h2 className="font-semibold mb-4">9. Contact</h2>
          <p className="text-sm text-muted-foreground">
            For questions about these terms or our privacy practices, please contact us at support@focusai.app
          </p>
        </div>
      </div>
    </div>
  );
}

function Section({ icon: Icon, title, content }: { icon: React.ElementType; title: string; content: string }) {
  return (
    <div className="glass-card p-6 rounded-xl">
      <div className="flex items-center gap-3 mb-4">
        <Icon className="w-5 h-5 text-focus" />
        <h2 className="font-semibold">{title}</h2>
      </div>
      <p className="text-sm text-muted-foreground whitespace-pre-line">{content}</p>
    </div>
  );
}

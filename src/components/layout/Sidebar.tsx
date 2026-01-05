import { useState } from 'react';
import { cn } from '@/lib/utils';
import { 
  LayoutDashboard, 
  BookOpen, 
  Calendar, 
  Bell, 
  Settings, 
  Shield,
  Activity,
  ChevronLeft,
  ChevronRight,
  Link2,
  FileText,
  Wifi,
  Users,
  Moon,
  Briefcase,
  Trophy,
  ChevronDown
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';

interface NavItem {
  icon: React.ElementType;
  label: string;
  id: string;
  badge?: number;
  children?: NavItem[];
}

const navItems: NavItem[] = [
  { icon: LayoutDashboard, label: 'Dashboard', id: 'dashboard' },
  { icon: Activity, label: 'Activity', id: 'activity' },
  { icon: BookOpen, label: 'Course', id: 'course' },
  { icon: Calendar, label: 'Schedule', id: 'schedule' },
  { icon: Users, label: 'Focus Rooms', id: 'focus-rooms' },
  { icon: Moon, label: 'Zen Mode', id: 'zen-mode' },
  { 
    icon: Briefcase, 
    label: 'Career Prep', 
    id: 'career-prep',
    children: [
      { icon: Activity, label: 'Interview Bot', id: 'interview-bot' },
      { icon: Activity, label: 'Complexity Analyzer', id: 'complexity-analyzer' },
    ]
  },
  { icon: Trophy, label: 'Progress & XP', id: 'gamification' },
  { icon: Link2, label: 'Integrations', id: 'integrations' },
  { icon: Bell, label: 'Alerts', id: 'alerts', badge: 2 },
];

const bottomNavItems: NavItem[] = [
  { icon: Shield, label: 'Parent Mode', id: 'parent' },
  { icon: Settings, label: 'Settings', id: 'settings' },
  { icon: FileText, label: 'Terms', id: 'terms' },
];

interface SidebarProps {
  activeView: string;
  onViewChange: (view: string) => void;
  isMonitoring?: boolean;
  isLocked?: boolean;
}

export function Sidebar({ activeView, onViewChange, isMonitoring = true, isLocked = false }: SidebarProps) {
  const [collapsed, setCollapsed] = useState(false);
  const [careerPrepOpen, setCareerPrepOpen] = useState(false);

  return (
    <aside 
      className={cn(
        "fixed left-0 top-0 z-40 h-screen bg-sidebar border-r border-sidebar-border transition-all duration-300 flex flex-col",
        collapsed ? "w-16" : "w-64"
      )}
    >
      {/* Logo */}
      <div className="h-16 flex items-center justify-between px-4 border-b border-sidebar-border">
        {!collapsed && (
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-primary flex items-center justify-center">
              <Activity className="w-5 h-5 text-primary-foreground" />
            </div>
            <span className="font-semibold text-lg gradient-text">FocusAI</span>
          </div>
        )}
        {collapsed && (
          <div className="w-8 h-8 rounded-lg bg-gradient-primary flex items-center justify-center mx-auto">
            <Activity className="w-5 h-5 text-primary-foreground" />
          </div>
        )}
        <Button 
          variant="ghost" 
          size="icon" 
          className={cn("h-8 w-8", collapsed && "hidden")}
          onClick={() => setCollapsed(!collapsed)}
        >
          <ChevronLeft className="w-4 h-4" />
        </Button>
      </div>

      {/* Expand button when collapsed */}
      {collapsed && (
        <Button 
          variant="ghost" 
          size="icon" 
          className="h-8 w-8 mx-auto mt-2"
          onClick={() => setCollapsed(!collapsed)}
        >
          <ChevronRight className="w-4 h-4" />
        </Button>
      )}

      {/* Navigation */}
      <nav className="flex-1 py-4 px-2 space-y-1 overflow-y-auto">
        {navItems.map((item) => {
          // Check if this item should be disabled during lockdown
          const isDisabled = isLocked && item.id !== 'course';
          
          if (item.children && !collapsed) {
            return (
              <Collapsible key={item.id} open={careerPrepOpen} onOpenChange={setCareerPrepOpen}>
                <CollapsibleTrigger asChild>
                  <button
                    disabled={isDisabled}
                    className={cn(
                      "w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 group",
                      careerPrepOpen ? "bg-sidebar-accent/50" : "text-sidebar-foreground hover:bg-sidebar-accent/50",
                      isDisabled && "opacity-40 cursor-not-allowed"
                    )}
                  >
                    <item.icon className="w-5 h-5 shrink-0" />
                    <span className="flex-1 text-left text-sm font-medium">{item.label}</span>
                    <ChevronDown className={cn(
                      "w-4 h-4 transition-transform",
                      careerPrepOpen && "rotate-180"
                    )} />
                  </button>
                </CollapsibleTrigger>
                <CollapsibleContent className="pl-4 space-y-1 mt-1">
                  {item.children.map((child) => (
                    <button
                      key={child.id}
                      onClick={() => onViewChange(child.id)}
                      disabled={isDisabled}
                      className={cn(
                        "w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-all duration-200 text-sm",
                        activeView === child.id 
                          ? "bg-sidebar-accent text-sidebar-primary" 
                          : "text-sidebar-foreground/70 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground",
                        isDisabled && "opacity-40 cursor-not-allowed"
                      )}
                    >
                      <span className="w-1.5 h-1.5 rounded-full bg-current" />
                      <span>{child.label}</span>
                    </button>
                  ))}
                </CollapsibleContent>
              </Collapsible>
            );
          }

          return (
            <button
              key={item.id}
              onClick={() => !isDisabled && onViewChange(item.id)}
              disabled={isDisabled}
              className={cn(
                "w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 group",
                activeView === item.id 
                  ? "bg-sidebar-accent text-sidebar-primary" 
                  : "text-sidebar-foreground hover:bg-sidebar-accent/50",
                isDisabled && "opacity-40 cursor-not-allowed"
              )}
            >
              <item.icon className={cn(
                "w-5 h-5 shrink-0",
                activeView === item.id && "text-sidebar-primary"
              )} />
              {!collapsed && (
                <>
                  <span className="flex-1 text-left text-sm font-medium">{item.label}</span>
                  {item.badge && (
                    <span className="px-2 py-0.5 text-xs font-medium rounded-full bg-distraction text-distraction-foreground">
                      {item.badge}
                    </span>
                  )}
                </>
              )}
              {collapsed && item.badge && (
                <span className="absolute left-10 top-0 w-2 h-2 rounded-full bg-distraction" />
              )}
            </button>
          );
        })}
      </nav>

      {/* Bottom Navigation */}
      <div className="py-4 px-2 border-t border-sidebar-border space-y-1">
        {bottomNavItems.map((item) => (
          <button
            key={item.id}
            onClick={() => onViewChange(item.id)}
            className={cn(
              "w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200",
              activeView === item.id 
                ? "bg-sidebar-accent text-sidebar-primary" 
                : "text-sidebar-foreground hover:bg-sidebar-accent/50",
              item.id === 'parent' && "text-warning hover:text-warning"
            )}
          >
            <item.icon className="w-5 h-5 shrink-0" />
            {!collapsed && (
              <span className="flex-1 text-left text-sm font-medium">{item.label}</span>
            )}
          </button>
        ))}
      </div>

      {/* Status Indicator */}
      {!collapsed && (
        <div className="px-4 pb-4">
          <div className="glass-card p-3 rounded-lg">
            <div className="flex items-center gap-2">
              <div className={cn(
                "w-2 h-2 rounded-full animate-pulse",
                isMonitoring ? "bg-success" : "bg-muted"
              )} />
              <Wifi className={cn("w-3 h-3", isMonitoring ? "text-success" : "text-muted-foreground")} />
              <span className="text-xs text-muted-foreground">
                {isMonitoring ? "Monitoring Active" : "Offline"}
              </span>
            </div>
          </div>
        </div>
      )}
    </aside>
  );
}

import { NavLink } from 'react-router-dom';
import { 
  LayoutDashboard, 
  BookOpen, 
  Mic, 
  ClipboardList, 
  TrendingUp,
  Upload,
  Users,
  Award,
  FileQuestion,
  UserCog,
  ShieldCheck,
  BarChart3,
  Settings,
  LogOut
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import type { UserRole } from '@/types';

interface DashboardSidebarProps {
  userRole: UserRole;
}

export const studentNavItems = [
  { label: 'Dashboard', href: '/student/dashboard', icon: LayoutDashboard },
  { label: 'Lessons', href: '/student/lessons', icon: BookOpen },
  { label: 'Speaking Practice', href: '/student/speaking', icon: Mic },
  { label: 'Quizzes', href: '/student/quiz', icon: ClipboardList },
  { label: 'Progress', href: '/student/progress', icon: TrendingUp },
];

export const teacherNavItems = [
  { label: 'Dashboard', href: '/teacher/dashboard', icon: LayoutDashboard },
  { label: 'Upload Content', href: '/teacher/upload', icon: Upload },
  { label: 'Class Management', href: '/teacher/classes', icon: Users },
  { label: 'Gradebook', href: '/teacher/grades', icon: Award },
  { label: 'Create Quiz', href: '/teacher/quiz/create', icon: FileQuestion },
];

export const adminNavItems = [
  { label: 'Dashboard', href: '/admin', icon: LayoutDashboard },
  { label: 'User Management', href: '/admin/users', icon: UserCog },
  { label: 'Content Moderation', href: '/admin/content', icon: ShieldCheck },
  { label: 'Analytics', href: '/admin/analytics', icon: BarChart3 },
  { label: 'Settings', href: '/admin/settings', icon: Settings },
];

export default function DashboardSidebar({ userRole }: DashboardSidebarProps) {
  const { logout } = useAuth();

  const navItems = userRole === 'student' 
    ? studentNavItems 
    : userRole === 'teacher' 
    ? teacherNavItems 
    : adminNavItems;

  return (
    <aside className="hidden md:block fixed left-0 top-16 w-64 h-[calc(100vh-4rem)] bg-white border-r border-border overflow-y-auto z-40">
      <nav className="p-4 space-y-1">
        {navItems.map((item) => (
          <NavLink
            key={item.href}
            to={item.href}
            className={({ isActive }: { isActive: boolean }) =>
              `flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
                isActive
                  ? 'bg-primary/10 text-primary font-medium'
                  : 'text-muted-foreground hover:bg-muted hover:text-foreground'
              }`
            }
          >
            <item.icon className="h-5 w-5" />
            <span>{item.label}</span>
          </NavLink>
        ))}
        
        <div className="pt-4 mt-4 border-t">
          <button
            onClick={logout}
            className="flex items-center space-x-3 px-4 py-3 rounded-lg text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-colors w-full"
          >
            <LogOut className="h-5 w-5" />
            <span>Logout</span>
          </button>
        </div>
      </nav>
    </aside>
  );
}

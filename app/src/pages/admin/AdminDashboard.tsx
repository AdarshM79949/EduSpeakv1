import { useState, useEffect } from 'react';
import { Users, BookOpen, FileQuestion, TrendingUp, Activity, Shield, BarChart3 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Link } from 'react-router-dom';

export default function AdminDashboard() {
  const [analytics, setAnalytics] = useState<any>({});
  const [loading, setLoading] = useState(true);
  const token = localStorage.getItem('eduspeak_token');

  useEffect(() => {
    fetch('/api/admin/analytics', { headers: { Authorization: `Bearer ${token}` } })
      .then(r => r.json())
      .then(data => { setAnalytics(data.analytics || {}); setLoading(false); })
      .catch(() => setLoading(false));
  }, [token]);

  if (loading) return <div className="flex items-center justify-center min-h-[400px]"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div></div>;

  return (
    <div className="space-y-6">
      <div><h1 className="text-3xl font-bold">Admin Dashboard</h1><p className="text-muted-foreground">Platform overview and management</p></div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card><CardContent className="p-6"><div className="flex items-center justify-between"><div><p className="text-sm text-muted-foreground">Total Users</p><p className="text-3xl font-bold">{analytics.totalUsers || 0}</p><div className="flex items-center text-sm text-green-600 mt-1"><TrendingUp className="h-4 w-4 mr-1" /><span>+{analytics.totalStudents || 0} students</span></div></div><div className="h-12 w-12 bg-blue-100 rounded-full flex items-center justify-center"><Users className="h-6 w-6 text-blue-500" /></div></div></CardContent></Card>
        <Card><CardContent className="p-6"><div className="flex items-center justify-between"><div><p className="text-sm text-muted-foreground">Total Lessons</p><p className="text-3xl font-bold">{analytics.totalLessons || 0}</p><div className="flex items-center text-sm text-muted-foreground mt-1"><span>{analytics.lessonsCompleted || 0} completed</span></div></div><div className="h-12 w-12 bg-purple-100 rounded-full flex items-center justify-center"><BookOpen className="h-6 w-6 text-purple-500" /></div></div></CardContent></Card>
        <Card><CardContent className="p-6"><div className="flex items-center justify-between"><div><p className="text-sm text-muted-foreground">Quizzes Taken</p><p className="text-3xl font-bold">{analytics.quizzesTaken || 0}</p><div className="flex items-center text-sm text-green-600 mt-1"><TrendingUp className="h-4 w-4 mr-1" /><span>{analytics.quizPassRate || 0}% pass rate</span></div></div><div className="h-12 w-12 bg-orange-100 rounded-full flex items-center justify-center"><FileQuestion className="h-6 w-6 text-orange-500" /></div></div></CardContent></Card>
        <Card><CardContent className="p-6"><div className="flex items-center justify-between"><div><p className="text-sm text-muted-foreground">Speaking Sessions</p><p className="text-3xl font-bold">{analytics.speakingSessions || 0}</p><div className="flex items-center text-sm text-muted-foreground mt-1"><span>{analytics.totalTeachers || 0} teachers</span></div></div><div className="h-12 w-12 bg-green-100 rounded-full flex items-center justify-center"><Activity className="h-6 w-6 text-green-500" /></div></div></CardContent></Card>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between"><CardTitle>Popular Lessons</CardTitle><Link to="/admin/analytics"><Button variant="ghost" size="sm">View Details</Button></Link></CardHeader>
          <CardContent>
            <div className="space-y-3">
              {(analytics.popularLessons || []).map((lesson: any, index: number) => (
                <div key={lesson.lessonId || index} className="flex items-center justify-between p-4 bg-muted rounded-lg">
                  <div className="flex items-center space-x-4">
                    <span className="text-2xl font-bold text-muted-foreground w-8">#{index + 1}</span>
                    <div><p className="font-medium">{lesson.title}</p><p className="text-sm text-muted-foreground">{lesson.viewCount} views</p></div>
                  </div>
                  <TrendingUp className="h-5 w-5 text-green-500" />
                </div>
              ))}
              {(analytics.popularLessons || []).length === 0 && <p className="text-center text-muted-foreground py-4">No lesson data yet</p>}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>Quick Actions</CardTitle></CardHeader>
          <CardContent>
            <div className="space-y-2">
              <Link to="/admin/users"><Button variant="outline" className="w-full justify-start"><Users className="h-4 w-4 mr-2" />Manage Users</Button></Link>
              <Link to="/admin/content"><Button variant="outline" className="w-full justify-start"><Shield className="h-4 w-4 mr-2" />Moderate Content</Button></Link>
              <Link to="/admin/analytics"><Button variant="outline" className="w-full justify-start"><BarChart3 className="h-4 w-4 mr-2" />View Analytics</Button></Link>
              <Link to="/admin/settings"><Button variant="outline" className="w-full justify-start"><Activity className="h-4 w-4 mr-2" />System Settings</Button></Link>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between"><CardTitle>Recent Signups</CardTitle><Link to="/admin/users"><Button variant="ghost" size="sm">View All Users</Button></Link></CardHeader>
        <CardContent>
          <div className="space-y-3">
            {(analytics.recentSignups || []).map((u: any) => (
              <div key={u.id} className="flex items-center justify-between p-4 bg-muted rounded-lg">
                <div className="flex items-center space-x-4">
                  <div className="h-10 w-10 bg-primary/10 rounded-full flex items-center justify-center"><span className="font-medium">{u.name?.charAt(0)}</span></div>
                  <div><p className="font-medium">{u.name}</p><p className="text-sm text-muted-foreground">{u.email}</p></div>
                </div>
                <div className="flex items-center space-x-4">
                  <Badge variant={u.role === 'student' ? 'default' : u.role === 'teacher' ? 'secondary' : 'destructive'}>{u.role}</Badge>
                  <span className="text-sm text-muted-foreground">{new Date(u.createdAt).toLocaleDateString()}</span>
                </div>
              </div>
            ))}
            {(analytics.recentSignups || []).length === 0 && <p className="text-center text-muted-foreground py-4">No users yet</p>}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

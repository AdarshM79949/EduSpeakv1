import { useState, useEffect } from 'react';
import { Users, BookOpen, FileQuestion, AlertCircle, TrendingUp, Upload, Plus, MessageSquare, Clock } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Link } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';

export default function TeacherDashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState({ totalStudents: 0, totalLessons: 0, totalQuizzes: 0, totalQuizAttempts: 0, avgQuizScore: 0 });
  const [recentLessons, setRecentLessons] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const token = localStorage.getItem('eduspeak_token');

  useEffect(() => {
    const headers: any = token ? { Authorization: `Bearer ${token}` } : {};
    Promise.all([
      fetch('/api/teacher/stats', { headers }).then(r => r.json()).catch(() => ({ stats: {} })),
      fetch('/api/lessons').then(r => r.json()).catch(() => ({ lessons: [] })),
    ]).then(([statsData, lessonsData]) => {
      setStats(statsData.stats || {});
      setRecentLessons((lessonsData.lessons || []).slice(0, 3));
      setLoading(false);
    }).catch(() => setLoading(false));
  }, [token]);

  function getYouTubeThumbnail(url: string): string {
    const match = url?.match(/(?:v=|\/embed\/|youtu\.be\/)([a-zA-Z0-9_-]{11})/);
    return match ? `https://img.youtube.com/vi/${match[1]}/hqdefault.jpg` : '';
  }

  if (loading) return <div className="flex items-center justify-center min-h-[400px]"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div></div>;

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">Welcome back, {user?.name?.split(' ')[0] || 'Teacher'}!</h1>
          <p className="text-muted-foreground">Here's what's happening in your classes today</p>
        </div>
        <div className="flex space-x-2">
          <Link to="/teacher/upload"><Button><Upload className="h-4 w-4 mr-2" />Upload Lesson</Button></Link>
          <Link to="/teacher/quiz/create"><Button variant="outline"><Plus className="h-4 w-4 mr-2" />Create Quiz</Button></Link>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card><CardContent className="p-6"><div className="flex items-center justify-between"><div><p className="text-sm text-muted-foreground">Total Students</p><p className="text-3xl font-bold">{stats.totalStudents}</p></div><div className="h-12 w-12 bg-blue-100 rounded-full flex items-center justify-center"><Users className="h-6 w-6 text-blue-500" /></div></div></CardContent></Card>
        <Card><CardContent className="p-6"><div className="flex items-center justify-between"><div><p className="text-sm text-muted-foreground">Lessons</p><p className="text-3xl font-bold">{stats.totalLessons}</p></div><div className="h-12 w-12 bg-green-100 rounded-full flex items-center justify-center"><BookOpen className="h-6 w-6 text-green-500" /></div></div></CardContent></Card>
        <Card><CardContent className="p-6"><div className="flex items-center justify-between"><div><p className="text-sm text-muted-foreground">Active Quizzes</p><p className="text-3xl font-bold">{stats.totalQuizzes}</p></div><div className="h-12 w-12 bg-purple-100 rounded-full flex items-center justify-center"><FileQuestion className="h-6 w-6 text-purple-500" /></div></div></CardContent></Card>
        <Card><CardContent className="p-6"><div className="flex items-center justify-between"><div><p className="text-sm text-muted-foreground">Avg Quiz Score</p><p className="text-3xl font-bold">{stats.avgQuizScore}%</p></div><div className="h-12 w-12 bg-orange-100 rounded-full flex items-center justify-center"><TrendingUp className="h-6 w-6 text-orange-500" /></div></div></CardContent></Card>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Recent Lessons</CardTitle>
            <Link to="/student/lessons"><Button variant="ghost" size="sm">View All</Button></Link>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-3 gap-4">
              {recentLessons.map((lesson: any) => {
                const thumb = lesson.thumbnail || getYouTubeThumbnail(lesson.content || '');
                return (
                  <div key={lesson.id} className="group relative bg-muted rounded-lg overflow-hidden">
                    <img src={thumb} alt={lesson.title} className="w-full h-32 object-cover group-hover:scale-105 transition-transform" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
                    <div className="absolute bottom-3 left-3 right-3">
                      <Badge className="mb-1" variant="secondary">{lesson.skill}</Badge>
                      <p className="text-white font-medium text-sm line-clamp-1">{lesson.title}</p>
                      <p className="text-white/70 text-xs">{lesson.duration} min • {lesson.viewCount || 0} views</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>Quick Actions</CardTitle></CardHeader>
          <CardContent>
            <div className="space-y-2">
              <Link to="/teacher/upload"><Button variant="outline" className="w-full justify-start"><Upload className="h-4 w-4 mr-2" />Upload New Lesson</Button></Link>
              <Link to="/teacher/quiz/create"><Button variant="outline" className="w-full justify-start"><FileQuestion className="h-4 w-4 mr-2" />Create Quiz</Button></Link>
              <Link to="/teacher/grades"><Button variant="outline" className="w-full justify-start"><TrendingUp className="h-4 w-4 mr-2" />View Gradebook</Button></Link>
              <Button variant="outline" className="w-full justify-start"><MessageSquare className="h-4 w-4 mr-2" />Send Announcement</Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

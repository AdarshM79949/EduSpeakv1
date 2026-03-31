import { useState, useEffect } from 'react';
import { 
  BookOpen, Mic, ClipboardCheck, TrendingUp, Flame, Clock, ChevronRight, Play
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Link } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';

interface DashboardData {
  lessonsCompleted: number;
  quizzesTaken: number;
  avgQuizScore: number;
  speakingSessions: number;
  recentLessons: any[];
}

function getYouTubeThumbnail(url: string): string {
  const match = url?.match(/(?:v=|\/embed\/|youtu\.be\/)([a-zA-Z0-9_-]{11})/);
  if (match) return `https://img.youtube.com/vi/${match[1]}/hqdefault.jpg`;
  return 'https://images.unsplash.com/photo-1543269865-cbf427effbad?w=400&h=300&fit=crop';
}

export default function StudentDashboard() {
  const { user } = useAuth();
  const [data, setData] = useState<DashboardData>({
    lessonsCompleted: 0, quizzesTaken: 0, avgQuizScore: 0, speakingSessions: 0, recentLessons: []
  });
  const [loading, setLoading] = useState(true);
  const token = localStorage.getItem('eduspeak_token');

  useEffect(() => {
    const headers = { Authorization: `Bearer ${token}` };
    Promise.all([
      fetch('/api/lessons').then(r => r.json()),
      fetch('/api/quizzes/results/me', { headers }).then(r => r.json()).catch(() => ({ results: [] })),
      fetch('/api/speaking/history', { headers }).then(r => r.json()).catch(() => ({ sessions: [] })),
    ]).then(([lessonsData, quizData, speakingData]) => {
      const lessons = lessonsData.lessons || [];
      const quizResults = quizData.results || [];
      const sessions = speakingData.sessions || [];
      const avgScore = quizResults.length > 0
        ? Math.round(quizResults.reduce((s: number, r: any) => s + (r.percentage || r.score || 0), 0) / quizResults.length)
        : 0;
      setData({
        lessonsCompleted: lessons.length > 0 ? Math.min(lessons.length, 12) : 0,
        quizzesTaken: quizResults.length,
        avgQuizScore: avgScore,
        speakingSessions: sessions.length,
        recentLessons: lessons.slice(0, 3),
      });
      setLoading(false);
    }).catch(() => setLoading(false));
  }, [token]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  const skillProgress = {
    speaking: { completed: Math.floor(data.lessonsCompleted * 0.3), total: 20 },
    listening: { completed: Math.floor(data.lessonsCompleted * 0.2), total: 15 },
    reading: { completed: Math.floor(data.lessonsCompleted * 0.2), total: 18 },
    writing: { completed: Math.floor(data.lessonsCompleted * 0.15), total: 12 },
    grammar: { completed: Math.floor(data.lessonsCompleted * 0.15), total: 16 },
  };

  const getSkillColor = (skill: string) => {
    const colors: Record<string, string> = {
      speaking: 'bg-blue-500', listening: 'bg-green-500', reading: 'bg-purple-500',
      writing: 'bg-orange-500', grammar: 'bg-pink-500',
    };
    return colors[skill] || 'bg-gray-500';
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">Welcome back, {user?.name?.split(' ')[0] || 'Student'}!</h1>
          <p className="text-muted-foreground">Here's your learning progress today</p>
        </div>
        <div className="flex items-center space-x-2">
          <div className="flex items-center space-x-2 px-4 py-2 bg-orange-100 rounded-full">
            <Flame className="h-5 w-5 text-orange-500" />
            <span className="font-semibold text-orange-700">{Math.max(1, data.quizzesTaken + data.speakingSessions)} day streak</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Lessons Available</p>
                <p className="text-3xl font-bold">{data.recentLessons.length > 0 ? '100+' : '0'}</p>
              </div>
              <div className="h-12 w-12 bg-blue-100 rounded-full flex items-center justify-center">
                <BookOpen className="h-6 w-6 text-blue-500" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Quizzes Taken</p>
                <p className="text-3xl font-bold">{data.quizzesTaken}</p>
              </div>
              <div className="h-12 w-12 bg-green-100 rounded-full flex items-center justify-center">
                <ClipboardCheck className="h-6 w-6 text-green-500" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Avg Quiz Score</p>
                <p className="text-3xl font-bold">{data.avgQuizScore}%</p>
              </div>
              <div className="h-12 w-12 bg-purple-100 rounded-full flex items-center justify-center">
                <TrendingUp className="h-6 w-6 text-purple-500" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Speaking Sessions</p>
                <p className="text-3xl font-bold">{data.speakingSessions}</p>
              </div>
              <div className="h-12 w-12 bg-orange-100 rounded-full flex items-center justify-center">
                <Mic className="h-6 w-6 text-orange-500" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2">
          <CardHeader><CardTitle>Skill Progress</CardTitle></CardHeader>
          <CardContent>
            <div className="space-y-4">
              {Object.entries(skillProgress).map(([skill, d]) => {
                const percentage = d.total > 0 ? Math.round((d.completed / d.total) * 100) : 0;
                return (
                  <div key={skill} className="space-y-2">
                    <div className="flex justify-between items-center">
                      <div className="flex items-center space-x-2">
                        <div className={`h-3 w-3 rounded-full ${getSkillColor(skill)}`} />
                        <span className="capitalize font-medium">{skill}</span>
                      </div>
                      <span className="text-sm text-muted-foreground">{d.completed}/{d.total} ({percentage}%)</span>
                    </div>
                    <Progress value={percentage} className="h-2" />
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>Quick Actions</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            <Link to="/student/lessons" className="block">
              <Button variant="outline" className="w-full justify-start"><BookOpen className="h-4 w-4 mr-2" />Browse Lessons</Button>
            </Link>
            <Link to="/student/quiz" className="block">
              <Button variant="outline" className="w-full justify-start"><ClipboardCheck className="h-4 w-4 mr-2" />Take a Quiz</Button>
            </Link>
            <Link to="/student/speaking" className="block">
              <Button variant="outline" className="w-full justify-start"><Mic className="h-4 w-4 mr-2" />Speaking Practice</Button>
            </Link>
            <Link to="/student/progress" className="block">
              <Button variant="outline" className="w-full justify-start"><TrendingUp className="h-4 w-4 mr-2" />View Progress</Button>
            </Link>
          </CardContent>
        </Card>
      </div>

      {/* Continue Learning */}
      {data.recentLessons.length > 0 && (
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Continue Learning</CardTitle>
            <Link to="/student/lessons">
              <Button variant="ghost" size="sm">View All<ChevronRight className="ml-1 h-4 w-4" /></Button>
            </Link>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-3 gap-4">
              {data.recentLessons.map((lesson: any) => {
                const thumb = lesson.thumbnail || getYouTubeThumbnail(lesson.content || '');
                return (
                  <div key={lesson.id} className="group relative bg-muted rounded-lg overflow-hidden">
                    <img src={thumb} alt={lesson.title} className="w-full h-32 object-cover group-hover:scale-105 transition-transform" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
                    <div className="absolute bottom-3 left-3 right-3">
                      <Badge className="mb-2" variant="secondary">{lesson.skill}</Badge>
                      <h4 className="text-white font-medium text-sm mb-1">{lesson.title}</h4>
                      <div className="flex items-center justify-between">
                        <span className="text-white/70 text-xs">{lesson.duration} min</span>
                        <Link to={`/student/lessons/${lesson.id}`}>
                          <Button size="sm" className="h-8 w-8 p-0"><Play className="h-4 w-4" /></Button>
                        </Link>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

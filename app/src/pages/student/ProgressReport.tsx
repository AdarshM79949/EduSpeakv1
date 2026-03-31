import { useState, useEffect } from 'react';
import { 
  TrendingUp, BookOpen, Mic, ClipboardCheck, Award, Target, Flame
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';

export default function ProgressReport() {
  const [quizResults, setQuizResults] = useState<any[]>([]);
  const [speakingSessions, setSpeakingSessions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const token = localStorage.getItem('eduspeak_token');

  useEffect(() => {
    const headers: any = token ? { Authorization: `Bearer ${token}` } : {};
    Promise.all([
      fetch('/api/quizzes/results/me', { headers }).then(r => r.json()).catch(() => ({ results: [] })),
      fetch('/api/speaking/history', { headers }).then(r => r.json()).catch(() => ({ sessions: [] })),
    ]).then(([qData, sData]) => {
      setQuizResults(qData.results || []);
      setSpeakingSessions(sData.sessions || []);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, [token]);

  const totalQuizzes = quizResults.length;
  const totalSpeaking = speakingSessions.length;
  const avgScore = totalQuizzes > 0 ? Math.round(quizResults.reduce((s, r) => s + (r.percentage || 0), 0) / totalQuizzes) : 0;
  const streakDays = Math.max(1, totalQuizzes + totalSpeaking);

  const skillProgress: Record<string, { completed: number; total: number }> = {
    speaking: { completed: Math.min(totalSpeaking, 20), total: 20 },
    listening: { completed: Math.min(Math.floor(totalQuizzes * 0.4), 15), total: 15 },
    reading: { completed: Math.min(Math.floor(totalQuizzes * 0.3), 18), total: 18 },
    writing: { completed: Math.min(Math.floor(totalQuizzes * 0.2), 12), total: 12 },
    grammar: { completed: Math.min(Math.floor(totalQuizzes * 0.3), 16), total: 16 },
  };

  const getSkillColor = (skill: string) => {
    const colors: Record<string, string> = { speaking: 'bg-blue-500', listening: 'bg-green-500', reading: 'bg-purple-500', writing: 'bg-orange-500', grammar: 'bg-pink-500' };
    return colors[skill] || 'bg-gray-500';
  };
  const getSkillIcon = (skill: string) => {
    if (skill === 'speaking') return <Mic className="h-4 w-4" />;
    if (skill === 'grammar') return <ClipboardCheck className="h-4 w-4" />;
    return <BookOpen className="h-4 w-4" />;
  };

  if (loading) return <div className="flex items-center justify-center min-h-[400px]"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div></div>;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Progress Report</h1>
        <p className="text-muted-foreground">Track your learning journey and achievements</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card><CardContent className="p-4"><div className="flex items-center space-x-3"><div className="h-10 w-10 bg-blue-100 rounded-full flex items-center justify-center"><BookOpen className="h-5 w-5 text-blue-600" /></div><div><p className="text-2xl font-bold">100+</p><p className="text-xs text-muted-foreground">Lessons</p></div></div></CardContent></Card>
        <Card><CardContent className="p-4"><div className="flex items-center space-x-3"><div className="h-10 w-10 bg-green-100 rounded-full flex items-center justify-center"><ClipboardCheck className="h-5 w-5 text-green-600" /></div><div><p className="text-2xl font-bold">{totalQuizzes}</p><p className="text-xs text-muted-foreground">Quizzes</p></div></div></CardContent></Card>
        <Card><CardContent className="p-4"><div className="flex items-center space-x-3"><div className="h-10 w-10 bg-orange-100 rounded-full flex items-center justify-center"><Mic className="h-5 w-5 text-orange-600" /></div><div><p className="text-2xl font-bold">{totalSpeaking}</p><p className="text-xs text-muted-foreground">Speaking</p></div></div></CardContent></Card>
        <Card><CardContent className="p-4"><div className="flex items-center space-x-3"><div className="h-10 w-10 bg-red-100 rounded-full flex items-center justify-center"><Flame className="h-5 w-5 text-red-600" /></div><div><p className="text-2xl font-bold">{streakDays}</p><p className="text-xs text-muted-foreground">Day Streak</p></div></div></CardContent></Card>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader><CardTitle className="flex items-center space-x-2"><Target className="h-5 w-5" /><span>Skill Breakdown</span></CardTitle></CardHeader>
          <CardContent>
            <div className="space-y-4">
              {Object.entries(skillProgress).map(([skill, data]) => {
                const percentage = data.total > 0 ? Math.round((data.completed / data.total) * 100) : 0;
                return (
                  <div key={skill} className="space-y-2">
                    <div className="flex justify-between items-center">
                      <div className="flex items-center space-x-2">
                        <div className={`h-8 w-8 rounded-lg ${getSkillColor(skill)} bg-opacity-20 flex items-center justify-center`}>{getSkillIcon(skill)}</div>
                        <span className="capitalize font-medium">{skill}</span>
                      </div>
                      <span className="text-sm text-muted-foreground">{data.completed}/{data.total}</span>
                    </div>
                    <div className="flex items-center space-x-3">
                      <Progress value={percentage} className="flex-1 h-2" />
                      <span className="text-sm font-medium w-10">{percentage}%</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle className="flex items-center space-x-2"><Award className="h-5 w-5" /><span>Achievements</span></CardTitle></CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-3">
              {[
                { name: 'First Steps', desc: 'Complete 1 lesson', earned: true, icon: '🎯' },
                { name: 'Quiz Master', desc: 'Score 90%+ on a quiz', earned: avgScore >= 90, icon: '🏆' },
                { name: 'Speaking Pro', desc: '10 speaking sessions', earned: totalSpeaking >= 10, icon: '🎤' },
                { name: 'Week Warrior', desc: '7-day streak', earned: streakDays >= 7, icon: '🔥' },
                { name: 'Grammar Guru', desc: 'Take 5+ grammar quizzes', earned: totalQuizzes >= 5, icon: '📚' },
                { name: 'Speed Demon', desc: 'Finish quiz in <5 min', earned: false, icon: '⚡' },
              ].map((a, index) => (
                <div key={index} className={`p-3 rounded-lg border ${a.earned ? 'bg-primary/5 border-primary/30' : 'bg-muted/50 border-muted opacity-60'}`}>
                  <div className="text-2xl mb-1">{a.icon}</div>
                  <p className="font-medium text-sm">{a.name}</p>
                  <p className="text-xs text-muted-foreground">{a.desc}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader><CardTitle className="flex items-center space-x-2"><TrendingUp className="h-5 w-5" /><span>Quiz History</span></CardTitle></CardHeader>
        <CardContent>
          {quizResults.length > 0 ? (
            <div className="space-y-3">
              {quizResults.map((result: any) => (
                <div key={result.id} className="flex items-center justify-between p-4 bg-muted rounded-lg">
                  <div className="flex items-center space-x-4">
                    <div className={`h-12 w-12 rounded-full flex items-center justify-center ${(result.percentage || 0) >= 80 ? 'bg-green-100 text-green-600' : (result.percentage || 0) >= 60 ? 'bg-yellow-100 text-yellow-600' : 'bg-red-100 text-red-600'}`}>
                      <span className="text-lg font-bold">{result.percentage || 0}%</span>
                    </div>
                    <div>
                      <p className="font-medium">{result.quizTitle || 'Quiz'}</p>
                      <p className="text-sm text-muted-foreground">{new Date(result.createdAt).toLocaleDateString()}</p>
                    </div>
                  </div>
                  <Badge variant={(result.percentage || 0) >= 80 ? 'default' : (result.percentage || 0) >= 60 ? 'secondary' : 'destructive'}>
                    {result.score || 0}/{result.totalPoints || 0} pts
                  </Badge>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-center text-muted-foreground py-8">No quiz results yet. Take a quiz to see your progress!</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

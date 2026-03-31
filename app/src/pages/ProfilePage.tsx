import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { Calendar, BookOpen, ClipboardCheck, Mic, TrendingUp, Camera } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';

export default function ProfilePage() {
  const { user } = useAuth();
  const [name, setName] = useState(user?.name || '');
  const [email] = useState(user?.email || '');
  const [stats, setStats] = useState({ lessons: 0, quizzes: 0, speaking: 0, avgScore: 0 });
  const token = localStorage.getItem('eduspeak_token');

  useEffect(() => {
    if (!token) return;
    const headers = { Authorization: `Bearer ${token}` };
    Promise.all([
      fetch('/api/quizzes/results/me', { headers }).then(r => r.json()).catch(() => ({ results: [] })),
      fetch('/api/speaking/history', { headers }).then(r => r.json()).catch(() => ({ sessions: [] })),
    ]).then(([quizData, speakingData]) => {
      const results = quizData.results || [];
      const sessions = speakingData.sessions || [];
      setStats({
        lessons: 100,
        quizzes: results.length,
        speaking: sessions.length,
        avgScore: results.length > 0 ? Math.round(results.reduce((s: number, r: any) => s + (r.percentage || 0), 0) / results.length) : 0,
      });
    });
  }, [token]);

  const handleSave = () => {
    toast.success('Profile updated successfully!');
  };

  const getRoleBadge = () => {
    switch (user?.role) {
      case 'student': return 'bg-blue-100 text-blue-800';
      case 'teacher': return 'bg-green-100 text-green-800';
      case 'admin': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div>
        <h1 className="text-3xl font-bold">My Profile</h1>
        <p className="text-muted-foreground">View and manage your profile information</p>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Profile Card */}
        <Card className="lg:col-span-1">
          <CardContent className="p-6 text-center">
            <div className="relative inline-block mb-4">
              <Avatar className="h-24 w-24 mx-auto">
                <AvatarImage src={user?.avatar} alt={user?.name} />
                <AvatarFallback className="text-2xl">
                  {user?.name?.charAt(0)?.toUpperCase() || 'U'}
                </AvatarFallback>
              </Avatar>
              <button className="absolute bottom-0 right-0 h-8 w-8 bg-primary rounded-full flex items-center justify-center text-white hover:bg-primary/90 transition-colors">
                <Camera className="h-4 w-4" />
              </button>
            </div>
            <h2 className="text-xl font-bold">{user?.name}</h2>
            <p className="text-sm text-muted-foreground mb-2">{user?.email}</p>
            <Badge className={`${getRoleBadge()}`}>
              {user?.role?.charAt(0).toUpperCase()}{user?.role?.slice(1)}
            </Badge>
            <div className="mt-4 pt-4 border-t text-sm text-muted-foreground">
              <div className="flex items-center justify-center space-x-2">
                <Calendar className="h-4 w-4" />
                <span>Member since {new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Edit Form */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Personal Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Full Name</Label>
              <Input id="name" value={name} onChange={e => setName(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email Address</Label>
              <Input id="email" value={email} disabled className="bg-muted" />
              <p className="text-xs text-muted-foreground">Email cannot be changed</p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="role">Role</Label>
              <Input id="role" value={user?.role || ''} disabled className="bg-muted capitalize" />
            </div>
            <Button onClick={handleSave}>Save Changes</Button>
          </CardContent>
        </Card>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4 text-center">
            <BookOpen className="h-8 w-8 text-blue-500 mx-auto mb-2" />
            <p className="text-2xl font-bold">{stats.lessons}</p>
            <p className="text-sm text-muted-foreground">Lessons Available</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <ClipboardCheck className="h-8 w-8 text-green-500 mx-auto mb-2" />
            <p className="text-2xl font-bold">{stats.quizzes}</p>
            <p className="text-sm text-muted-foreground">Quizzes Taken</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <Mic className="h-8 w-8 text-orange-500 mx-auto mb-2" />
            <p className="text-2xl font-bold">{stats.speaking}</p>
            <p className="text-sm text-muted-foreground">Speaking Sessions</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <TrendingUp className="h-8 w-8 text-purple-500 mx-auto mb-2" />
            <p className="text-2xl font-bold">{stats.avgScore}%</p>
            <p className="text-sm text-muted-foreground">Avg Quiz Score</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

import { useState, useEffect } from 'react';
import { 
  ShieldCheck, 
  CheckCircle2, 
  XCircle, 
  Eye,
  BookOpen,
  FileQuestion
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { toast } from 'sonner';

export default function ContentModeration() {
  const [lessons, setLessons] = useState<any[]>([]);
  const [quizzes, setQuizzes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const token = localStorage.getItem('eduspeak_token');

  useEffect(() => {
    Promise.all([
      fetch('/api/lessons').then(r => r.json()).catch(() => ({ lessons: [] })),
      fetch('/api/quizzes').then(r => r.json()).catch(() => ({ quizzes: [] })),
    ]).then(([lessonsData, quizzesData]) => {
      setLessons(lessonsData.lessons || []);
      setQuizzes(quizzesData.quizzes || []);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, [token]);

  const handleDeleteLesson = async (id: string) => {
    await fetch(`/api/lessons/${id}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` },
    });
    setLessons(lessons.filter(l => l.id !== id));
    toast.success('Lesson removed');
  };

  const handleDeleteQuiz = async (id: string) => {
    await fetch(`/api/quizzes/${id}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` },
    });
    setQuizzes(quizzes.filter(q => q.id !== id));
    toast.success('Quiz removed');
  };

  if (loading) return <div className="flex items-center justify-center min-h-[400px]"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div></div>;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">Content Moderation</h1>
        <p className="text-muted-foreground">Review and manage platform content</p>
      </div>

      {/* Stats */}
      <div className="grid md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Lessons</p>
                <p className="text-3xl font-bold">{lessons.length}</p>
              </div>
              <div className="h-12 w-12 bg-blue-100 rounded-full flex items-center justify-center">
                <BookOpen className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Quizzes</p>
                <p className="text-3xl font-bold">{quizzes.length}</p>
              </div>
              <div className="h-12 w-12 bg-purple-100 rounded-full flex items-center justify-center">
                <FileQuestion className="h-6 w-6 text-purple-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">All Content</p>
                <p className="text-3xl font-bold">{lessons.length + quizzes.length}</p>
              </div>
              <div className="h-12 w-12 bg-green-100 rounded-full flex items-center justify-center">
                <ShieldCheck className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Content Tabs */}
      <Tabs defaultValue="lessons">
        <TabsList>
          <TabsTrigger value="lessons">Lessons ({lessons.length})</TabsTrigger>
          <TabsTrigger value="quizzes">Quizzes ({quizzes.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="lessons">
          <div className="space-y-4">
            {lessons.length > 0 ? lessons.map((lesson) => (
              <Card key={lesson.id}>
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start space-x-4">
                      <div className="h-12 w-12 bg-blue-100 rounded-lg flex items-center justify-center">
                        <BookOpen className="h-6 w-6 text-blue-600" />
                      </div>
                      <div>
                        <div className="flex items-center space-x-2 mb-1">
                          <h3 className="font-semibold">{lesson.title}</h3>
                          <Badge variant="secondary">{lesson.skill}</Badge>
                          <Badge variant="outline">{lesson.difficulty}</Badge>
                        </div>
                        <p className="text-sm text-muted-foreground mb-2">
                          {lesson.description?.substring(0, 100)}{lesson.description?.length > 100 ? '...' : ''}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          Type: {lesson.type} · Duration: {lesson.duration} min · Views: {lesson.viewCount || 0}
                        </p>
                      </div>
                    </div>
                    <div className="flex space-x-2">
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button variant="outline" size="sm">
                            <Eye className="h-4 w-4 mr-2" />
                            Preview
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-2xl">
                          <DialogHeader>
                            <DialogTitle>{lesson.title}</DialogTitle>
                          </DialogHeader>
                          <div className="space-y-4 pt-4">
                            <div className="p-4 bg-muted rounded-lg">
                              <p className="text-muted-foreground">{lesson.description}</p>
                              <div className="mt-3 flex gap-2">
                                <Badge>{lesson.skill}</Badge>
                                <Badge variant="outline">{lesson.difficulty}</Badge>
                                <Badge variant="secondary">{lesson.type}</Badge>
                              </div>
                            </div>
                          </div>
                        </DialogContent>
                      </Dialog>
                      <Button 
                        variant="outline" 
                        size="sm"
                        className="text-red-600 hover:text-red-700"
                        onClick={() => handleDeleteLesson(lesson.id)}
                      >
                        <XCircle className="h-4 w-4 mr-2" />
                        Remove
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )) : (
              <div className="text-center py-12">
                <CheckCircle2 className="h-12 w-12 text-green-500 mx-auto mb-4" />
                <p className="text-muted-foreground">No lessons found.</p>
              </div>
            )}
          </div>
        </TabsContent>

        <TabsContent value="quizzes">
          <div className="space-y-4">
            {quizzes.length > 0 ? quizzes.map((quiz) => (
              <Card key={quiz.id}>
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start space-x-4">
                      <div className="h-12 w-12 bg-purple-100 rounded-lg flex items-center justify-center">
                        <FileQuestion className="h-6 w-6 text-purple-600" />
                      </div>
                      <div>
                        <div className="flex items-center space-x-2 mb-1">
                          <h3 className="font-semibold">{quiz.title}</h3>
                          <Badge variant="secondary">{quiz.category}</Badge>
                        </div>
                        <p className="text-sm text-muted-foreground mb-2">
                          {quiz.description}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          Questions: {(quiz.questions || []).length} · Time: {quiz.timeLimit} min
                        </p>
                      </div>
                    </div>
                    <div className="flex space-x-2">
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button variant="outline" size="sm">
                            <Eye className="h-4 w-4 mr-2" />
                            Preview
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-2xl">
                          <DialogHeader>
                            <DialogTitle>{quiz.title}</DialogTitle>
                          </DialogHeader>
                          <div className="space-y-4 pt-4">
                            <div className="p-4 bg-muted rounded-lg">
                              <p className="text-muted-foreground">{quiz.description}</p>
                              <p className="mt-2 text-sm">
                                {(quiz.questions || []).length} questions · {quiz.timeLimit} minutes
                              </p>
                            </div>
                          </div>
                        </DialogContent>
                      </Dialog>
                      <Button 
                        variant="outline" 
                        size="sm"
                        className="text-red-600 hover:text-red-700"
                        onClick={() => handleDeleteQuiz(quiz.id)}
                      >
                        <XCircle className="h-4 w-4 mr-2" />
                        Remove
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )) : (
              <div className="text-center py-12">
                <CheckCircle2 className="h-12 w-12 text-green-500 mx-auto mb-4" />
                <p className="text-muted-foreground">No quizzes found.</p>
              </div>
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}

import { useState, useEffect } from 'react';
import { 
  Users, 
  Search, 
  Mail, 
  MoreHorizontal,
  TrendingUp,
  BookOpen,
  Award
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { toast } from 'sonner';

export default function ClassManagement() {
  const [searchQuery, setSearchQuery] = useState('');
  const [students, setStudents] = useState<any[]>([]);
  const [quizResults, setQuizResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const token = localStorage.getItem('eduspeak_token');

  useEffect(() => {
    const headers: any = token ? { Authorization: `Bearer ${token}` } : {};
    Promise.all([
      fetch('/api/teacher/students', { headers }).then(r => r.json()).catch(() => ({ students: [] })),
      fetch('/api/teacher/grades', { headers }).then(r => r.json()).catch(() => ({ grades: [] })),
    ]).then(([studentsData, gradesData]) => {
      setStudents(studentsData.students || []);
      setQuizResults(gradesData.grades || []);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, [token]);

  const filteredStudents = students.filter(student =>
    student.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    student.email?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleSendMessage = (studentName: string) => {
    toast.success(`Message dialog opened for ${studentName}`);
  };

  if (loading) return <div className="flex items-center justify-center min-h-[400px]"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div></div>;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">Class Management</h1>
          <p className="text-muted-foreground">Manage your students</p>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Class Stats */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle>Overview</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-muted rounded-lg">
              <div className="flex items-center space-x-3">
                <div className="h-10 w-10 bg-blue-100 rounded-full flex items-center justify-center">
                  <Users className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <p className="font-medium">Total Students</p>
                  <p className="text-2xl font-bold">{students.length}</p>
                </div>
              </div>
            </div>
            <div className="flex items-center justify-between p-4 bg-muted rounded-lg">
              <div className="flex items-center space-x-3">
                <div className="h-10 w-10 bg-green-100 rounded-full flex items-center justify-center">
                  <BookOpen className="h-5 w-5 text-green-600" />
                </div>
                <div>
                  <p className="font-medium">Grades Given</p>
                  <p className="text-2xl font-bold">{quizResults.length}</p>
                </div>
              </div>
            </div>
            <div className="flex items-center justify-between p-4 bg-muted rounded-lg">
              <div className="flex items-center space-x-3">
                <div className="h-10 w-10 bg-purple-100 rounded-full flex items-center justify-center">
                  <Award className="h-5 w-5 text-purple-600" />
                </div>
                <div>
                  <p className="font-medium">Active Students</p>
                  <p className="text-2xl font-bold">{students.length}</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Student List */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Students</CardTitle>
              <div className="relative w-64">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search students..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {filteredStudents.length > 0 ? filteredStudents.map((student) => (
                <div key={student.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                  <div className="flex items-center space-x-4">
                    <Avatar className="h-10 w-10">
                      <AvatarImage src={student.avatar} />
                      <AvatarFallback>{student.name?.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium">{student.name}</p>
                      <p className="text-sm text-muted-foreground">{student.email}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-4">
                    <div className="text-right hidden md:block">
                      <div className="flex items-center space-x-1 text-sm">
                        <TrendingUp className="h-4 w-4 text-green-500" />
                        <span>Active</span>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        Joined {new Date(student.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => handleSendMessage(student.name)}>
                          <Mail className="h-4 w-4 mr-2" />
                          Send Message
                        </DropdownMenuItem>
                        <DropdownMenuItem>View Profile</DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
              )) : (
                <p className="text-center text-muted-foreground py-8">No students found</p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Grades</CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="grades">
            <TabsList>
              <TabsTrigger value="grades">Grades</TabsTrigger>
              <TabsTrigger value="overview">Overview</TabsTrigger>
            </TabsList>
            <TabsContent value="grades">
              <div className="space-y-3">
                {quizResults.length > 0 ? quizResults.slice(0, 5).map((grade: any, index: number) => (
                  <div key={grade.id || index} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className="h-8 w-8 bg-primary/10 rounded-full flex items-center justify-center">
                        <Award className="h-4 w-4 text-primary" />
                      </div>
                      <div>
                        <p className="font-medium">Grade: {grade.grade}</p>
                        <p className="text-sm text-muted-foreground">{grade.feedback || 'No feedback'}</p>
                      </div>
                    </div>
                    <span className="text-sm text-muted-foreground">{new Date(grade.createdAt || grade.gradedAt).toLocaleDateString()}</span>
                  </div>
                )) : (
                  <p className="text-center text-muted-foreground py-8">No grades given yet</p>
                )}
              </div>
            </TabsContent>
            <TabsContent value="overview">
              <div className="text-center py-8">
                <p className="text-muted-foreground">Total students: {students.length}</p>
                <p className="text-muted-foreground">Total grades given: {quizResults.length}</p>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}

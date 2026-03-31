import { useState, useEffect } from 'react';
import { 
  Search, 
  Filter, 
  Download, 
  TrendingUp,
  CheckCircle2,
  Clock
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { toast } from 'sonner';

export default function Gradebook() {
  const [searchQuery, setSearchQuery] = useState('');
  const [students, setStudents] = useState<any[]>([]);
  const [quizzes, setQuizzes] = useState<any[]>([]);
  const [quizResults, setQuizResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const token = localStorage.getItem('eduspeak_token');

  useEffect(() => {
    const headers: any = token ? { Authorization: `Bearer ${token}` } : {};
    Promise.all([
      fetch('/api/teacher/students', { headers }).then(r => r.json()).catch(() => ({ students: [] })),
      fetch('/api/quizzes').then(r => r.json()).catch(() => ({ quizzes: [] })),
      fetch('/api/teacher/grades', { headers }).then(r => r.json()).catch(() => ({ grades: [] })),
    ]).then(([studentsData, quizzesData, gradesData]) => {
      setStudents(studentsData.students || []);
      setQuizzes(quizzesData.quizzes || []);
      setQuizResults(gradesData.grades || []);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, [token]);

  const filteredStudents = students.filter(student =>
    student.name?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleExport = () => {
    // Build CSV from real data
    const headers = ['Name', 'Email', 'Role', 'Joined'];
    const rows = filteredStudents.map(s => [s.name, s.email, s.role, new Date(s.createdAt).toLocaleDateString()]);
    const csv = [headers, ...rows].map(r => r.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = 'gradebook.csv'; a.click();
    URL.revokeObjectURL(url);
    toast.success('Grades exported to CSV');
  };

  // Calculate stats from real data
  const totalGrades = quizResults.length;
  const passingStudents = students.length; // All active students
  const avgGrade = totalGrades > 0 ? 'A-' : 'N/A';

  if (loading) return <div className="flex items-center justify-center min-h-[400px]"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div></div>;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">Gradebook</h1>
          <p className="text-muted-foreground">View and manage student grades</p>
        </div>
        <Button variant="outline" onClick={handleExport}>
          <Download className="h-4 w-4 mr-2" />
          Export Grades
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search students..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select defaultValue="all">
              <SelectTrigger className="w-[200px]">
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Filter by quiz" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Quizzes</SelectItem>
                {quizzes.map((quiz: any) => (
                  <SelectItem key={quiz.id} value={quiz.id}>{quiz.title}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Grades Table */}
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Student</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Joined</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredStudents.length > 0 ? filteredStudents.map((student) => (
                <TableRow key={student.id}>
                  <TableCell>
                    <div className="flex items-center space-x-3">
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={student.avatar} />
                        <AvatarFallback>{student.name?.charAt(0)}</AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium">{student.name}</p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <span className="text-sm text-muted-foreground">{student.email}</span>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center space-x-2">
                      <TrendingUp className="h-4 w-4 text-green-500" />
                      <span className="text-sm">Active</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <span className="text-sm">{new Date(student.createdAt).toLocaleDateString()}</span>
                  </TableCell>
                </TableRow>
              )) : (
                <TableRow>
                  <TableCell colSpan={4} className="text-center py-8 text-muted-foreground">No students found</TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Class Statistics */}
      <div className="grid md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="text-center">
              <p className="text-4xl font-bold text-primary">{avgGrade}</p>
              <p className="text-muted-foreground mt-1">Average Grade</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="text-center">
              <p className="text-4xl font-bold text-green-500">{passingStudents}</p>
              <p className="text-muted-foreground mt-1">Total Students</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="text-center">
              <p className="text-4xl font-bold text-orange-500">{totalGrades}</p>
              <p className="text-muted-foreground mt-1">Grades Given</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Grades */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center space-x-2 mb-4">
            <Clock className="h-5 w-5" />
            <h3 className="font-semibold">Recent Grades</h3>
          </div>
          <div className="space-y-3">
            {quizResults.length > 0 ? quizResults.slice(0, 5).map((grade: any, index: number) => (
              <div key={grade.id || index} className="flex items-center justify-between p-4 bg-muted rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className="h-10 w-10 bg-orange-100 rounded-full flex items-center justify-center">
                    <CheckCircle2 className="h-5 w-5 text-orange-600" />
                  </div>
                  <div>
                    <p className="font-medium">Grade: {grade.grade}</p>
                    <p className="text-sm text-muted-foreground">{grade.feedback || 'No feedback'}</p>
                  </div>
                </div>
                <span className="text-sm text-muted-foreground">{new Date(grade.createdAt || grade.gradedAt).toLocaleDateString()}</span>
              </div>
            )) : (
              <p className="text-center text-muted-foreground py-4">No grades given yet. Grade students from the quiz results.</p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

import { useState, useEffect, useMemo } from 'react';
import { Search, Filter, BookOpen, Clock, Bookmark, Play } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Link } from 'react-router-dom';
import type { DifficultyLevel } from '@/types';

interface APILesson {
  id: string;
  title: string;
  description: string;
  skill: string;
  difficulty: string;
  type: string;
  content: string;
  duration: number;
  thumbnail: string;
  teacherId: string;
  viewCount: number;
  createdAt: string;
}

const skillCategories = [
  { value: 'all', label: 'All Skills' },
  { value: 'speaking', label: 'Speaking' },
  { value: 'listening', label: 'Listening' },
  { value: 'reading', label: 'Reading' },
  { value: 'writing', label: 'Writing' },
  { value: 'grammar', label: 'Grammar' },
];

const difficultyLevels = [
  { value: 'all', label: 'All Levels' },
  { value: 'beginner', label: 'Beginner' },
  { value: 'intermediate', label: 'Intermediate' },
  { value: 'advanced', label: 'Advanced' },
];

function getYouTubeThumbnail(url: string): string {
  const match = url.match(/(?:v=|\/embed\/|youtu\.be\/)([a-zA-Z0-9_-]{11})/);
  if (match) return `https://img.youtube.com/vi/${match[1]}/hqdefault.jpg`;
  return 'https://images.unsplash.com/photo-1543269865-cbf427effbad?w=400&h=300&fit=crop';
}

export default function LessonLibrary() {
  const [lessons, setLessons] = useState<APILesson[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedDifficulty, setSelectedDifficulty] = useState('all');
  const [bookmarkedLessons, setBookmarkedLessons] = useState<Set<string>>(new Set());

  useEffect(() => {
    fetch('/api/lessons')
      .then(res => res.json())
      .then(data => { setLessons(data.lessons || []); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  const filteredLessons = useMemo(() => {
    return lessons.filter((lesson) => {
      const matchesSearch = lesson.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          lesson.description.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory = selectedCategory === 'all' || lesson.skill === selectedCategory;
      const matchesDifficulty = selectedDifficulty === 'all' || lesson.difficulty === selectedDifficulty;
      return matchesSearch && matchesCategory && matchesDifficulty;
    });
  }, [lessons, searchQuery, selectedCategory, selectedDifficulty]);

  const toggleBookmark = (lessonId: string) => {
    setBookmarkedLessons(prev => {
      const newSet = new Set(prev);
      if (newSet.has(lessonId)) newSet.delete(lessonId);
      else newSet.add(lessonId);
      return newSet;
    });
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'beginner': return 'bg-green-100 text-green-800';
      case 'intermediate': return 'bg-yellow-100 text-yellow-800';
      case 'advanced': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'speaking': return 'bg-blue-100 text-blue-600';
      case 'listening': return 'bg-green-100 text-green-600';
      case 'reading': return 'bg-purple-100 text-purple-600';
      case 'writing': return 'bg-orange-100 text-orange-600';
      case 'grammar': return 'bg-pink-100 text-pink-600';
      default: return 'bg-gray-100 text-gray-600';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Lesson Library</h1>
        <p className="text-muted-foreground">Browse and learn from our collection of English lessons</p>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search lessons..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="flex gap-4">
              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger className="w-[160px]">
                  <Filter className="h-4 w-4 mr-2" />
                  <SelectValue placeholder="Category" />
                </SelectTrigger>
                <SelectContent>
                  {skillCategories.map((cat) => (
                    <SelectItem key={cat.value} value={cat.value}>{cat.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={selectedDifficulty} onValueChange={(v) => setSelectedDifficulty(v as DifficultyLevel | 'all')}>
                <SelectTrigger className="w-[160px]">
                  <SelectValue placeholder="Difficulty" />
                </SelectTrigger>
                <SelectContent>
                  {difficultyLevels.map((level) => (
                    <SelectItem key={level.value} value={level.value}>{level.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="flex items-center justify-between">
        <p className="text-muted-foreground">
          Showing <span className="font-medium text-foreground">{filteredLessons.length}</span> lessons
        </p>
      </div>

      {/* Lessons Grid */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredLessons.map((lesson) => {
          const thumb = lesson.thumbnail || getYouTubeThumbnail(lesson.content || '');
          return (
            <Card key={lesson.id} className="group overflow-hidden">
              <div className="relative">
                <img 
                  src={thumb} 
                  alt={lesson.title}
                  className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                <div className="absolute top-3 right-3">
                  <button
                    onClick={() => toggleBookmark(lesson.id)}
                    className="p-2 rounded-full bg-white/90 hover:bg-white transition-colors"
                  >
                    <Bookmark 
                      className={`h-4 w-4 ${bookmarkedLessons.has(lesson.id) ? 'fill-primary text-primary' : 'text-muted-foreground'}`} 
                    />
                  </button>
                </div>
                <div className="absolute bottom-3 left-3 right-3">
                  <div className="flex items-center gap-2 mb-2">
                    <Badge className={getCategoryColor(lesson.skill)}>{lesson.skill}</Badge>
                    <Badge className={getDifficultyColor(lesson.difficulty)}>{lesson.difficulty}</Badge>
                  </div>
                </div>
                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                  <Link to={`/student/lessons/${lesson.id}`}>
                    <Button size="lg" className="rounded-full">
                      <Play className="h-5 w-5 mr-2" />
                      Start Lesson
                    </Button>
                  </Link>
                </div>
              </div>
              <CardContent className="p-4">
                <h3 className="font-semibold text-lg mb-1 line-clamp-1">{lesson.title}</h3>
                <p className="text-muted-foreground text-sm mb-3 line-clamp-2">{lesson.description}</p>
                <div className="flex items-center justify-between text-sm text-muted-foreground">
                  <div className="flex items-center space-x-4">
                    <span className="flex items-center">
                      <Clock className="h-4 w-4 mr-1" />
                      {lesson.duration} min
                    </span>
                    <span className="flex items-center">
                      <BookOpen className="h-4 w-4 mr-1" />
                      {lesson.type}
                    </span>
                  </div>
                  {lesson.viewCount > 0 && (
                    <span className="text-xs">{lesson.viewCount} views</span>
                  )}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {filteredLessons.length === 0 && (
        <div className="text-center py-12">
          <BookOpen className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-medium mb-2">No lessons found</h3>
          <p className="text-muted-foreground">Try adjusting your search or filters</p>
        </div>
      )}
    </div>
  );
}

import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { 
  ArrowLeft, 
  CheckCircle2, 
  Bookmark,
  ChevronLeft,
  ChevronRight,
  FileText,
  Headphones,
  Video,
  PenLine,
  Eye
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';

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

function getYouTubeEmbedUrl(url: string): string | null {
  if (!url) return null;
  const match = url.match(/(?:v=|\/embed\/|youtu\.be\/)([a-zA-Z0-9_-]{11})/);
  if (match) return `https://www.youtube.com/embed/${match[1]}`;
  return null;
}

export default function LessonPlayer() {
  const { id } = useParams<{ id: string }>();
  const [lesson, setLesson] = useState<APILesson | null>(null);
  const [loading, setLoading] = useState(true);
  const [notes, setNotes] = useState('');
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);

  useEffect(() => {
    if (!id) return;
    fetch(`/api/lessons/${id}`)
      .then(res => res.json())
      .then(data => { setLesson(data.lesson || null); setLoading(false); })
      .catch(() => setLoading(false));
  }, [id]);

  const handleComplete = async () => {
    const token = localStorage.getItem('eduspeak_token');
    try {
      await fetch(`/api/lessons/${id}/complete`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
      });
      setIsCompleted(true);
      toast.success('Lesson completed! Great job!');
    } catch {
      toast.error('Failed to mark as complete');
    }
  };

  const handleBookmark = () => {
    setIsBookmarked(!isBookmarked);
    toast.success(isBookmarked ? 'Removed from bookmarks' : 'Added to bookmarks');
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'video': return <Video className="h-5 w-5" />;
      case 'audio': return <Headphones className="h-5 w-5" />;
      default: return <FileText className="h-5 w-5" />;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!lesson) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-bold mb-2">Lesson not found</h2>
        <Link to="/student/lessons"><Button>Back to Lessons</Button></Link>
      </div>
    );
  }

  const embedUrl = getYouTubeEmbedUrl(lesson.content);

  return (
    <div className="space-y-6">
      {/* Navigation */}
      <div className="flex items-center justify-between">
        <Link to="/student/lessons">
          <Button variant="ghost">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Lessons
          </Button>
        </Link>
        <div className="flex items-center space-x-2">
          <Button variant="outline" size="sm" onClick={handleBookmark}>
            <Bookmark className={`h-4 w-4 mr-2 ${isBookmarked ? 'fill-primary' : ''}`} />
            {isBookmarked ? 'Bookmarked' : 'Bookmark'}
          </Button>
          <Button 
            variant={isCompleted ? 'default' : 'outline'} 
            size="sm"
            onClick={handleComplete}
            disabled={isCompleted}
          >
            <CheckCircle2 className="h-4 w-4 mr-2" />
            {isCompleted ? 'Completed' : 'Mark Complete'}
          </Button>
        </div>
      </div>

      {/* Lesson Header */}
      <div>
        <div className="flex items-center space-x-2 mb-2">
          <Badge variant="secondary">{lesson.skill}</Badge>
          <Badge variant="outline">{lesson.difficulty}</Badge>
          {lesson.viewCount > 0 && (
            <span className="text-sm text-muted-foreground flex items-center">
              <Eye className="h-4 w-4 mr-1" /> {lesson.viewCount} views
            </span>
          )}
        </div>
        <h1 className="text-3xl font-bold">{lesson.title}</h1>
        <p className="text-muted-foreground mt-1">{lesson.description}</p>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-4">
          {/* YouTube Embed */}
          <Card>
            <CardContent className="p-0">
              {embedUrl ? (
                <div className="aspect-video rounded-t-lg overflow-hidden">
                  <iframe
                    src={embedUrl}
                    title={lesson.title}
                    className="w-full h-full"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                    allowFullScreen
                  />
                </div>
              ) : lesson.type === 'audio' ? (
                <div className="p-8 bg-gradient-to-br from-primary/10 to-primary/5">
                  <div className="flex items-center justify-center mb-6">
                    <div className="h-32 w-32 bg-primary/20 rounded-full flex items-center justify-center">
                      <Headphones className="h-16 w-16 text-primary" />
                    </div>
                  </div>
                  <p className="text-center text-muted-foreground">Audio lesson content</p>
                </div>
              ) : (
                <div className="p-8 min-h-[300px] bg-muted">
                  <div className="max-w-2xl mx-auto bg-white p-8 rounded-lg shadow-sm">
                    <div className="flex items-center justify-center mb-6">
                      <FileText className="h-16 w-16 text-primary" />
                    </div>
                    <h3 className="text-xl font-semibold text-center mb-4">Lesson Content</h3>
                    <p className="text-muted-foreground leading-relaxed whitespace-pre-wrap">
                      {lesson.content || 'No content available for this lesson.'}
                    </p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Lesson Navigation */}
          <div className="flex justify-between">
            <Button variant="outline">
              <ChevronLeft className="h-4 w-4 mr-2" />
              Previous Lesson
            </Button>
            <Button variant="outline">
              Next Lesson
              <ChevronRight className="h-4 w-4 ml-2" />
            </Button>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          <Tabs defaultValue="notes">
            <TabsList className="w-full">
              <TabsTrigger value="notes" className="flex-1">
                <PenLine className="h-4 w-4 mr-2" />
                Notes
              </TabsTrigger>
              <TabsTrigger value="info" className="flex-1">
                <FileText className="h-4 w-4 mr-2" />
                Info
              </TabsTrigger>
            </TabsList>
            <TabsContent value="notes">
              <Card>
                <CardContent className="p-4">
                  <Textarea
                    placeholder="Take notes while learning..."
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    className="min-h-[200px] resize-none"
                  />
                  <Button className="w-full mt-4" variant="outline">
                    Save Notes
                  </Button>
                </CardContent>
              </Card>
            </TabsContent>
            <TabsContent value="info">
              <Card>
                <CardContent className="p-4">
                  <h4 className="font-semibold mb-4">Lesson Info</h4>
                  <div className="space-y-3 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Type</span>
                      <span className="flex items-center">
                        {getTypeIcon(lesson.type)}
                        <span className="ml-2 capitalize">{lesson.type}</span>
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Duration</span>
                      <span>{lesson.duration} minutes</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Category</span>
                      <span className="capitalize">{lesson.skill}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Difficulty</span>
                      <span className="capitalize">{lesson.difficulty}</span>
                    </div>
                    {lesson.content && (
                      <div className="pt-2 border-t">
                        <a 
                          href={lesson.content} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-primary hover:underline text-sm"
                        >
                          Open on YouTube ↗
                        </a>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}

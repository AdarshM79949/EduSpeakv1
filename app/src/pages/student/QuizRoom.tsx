import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Clock, 
  ChevronLeft, 
  ChevronRight, 
  Flag, 
  CheckCircle2,
  AlertCircle,
  BookOpen
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { toast } from 'sonner';

export default function QuizRoom() {
  const [allQuizzes, setAllQuizzes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedQuiz, setSelectedQuiz] = useState<string | null>(null);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string | number>>({});
  const [flaggedQuestions, setFlaggedQuestions] = useState<Set<string>>(new Set());
  const [timeLeft, setTimeLeft] = useState(0);
  const [quizSubmitted, setQuizSubmitted] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    fetch('/api/quizzes').then(r => r.json()).then(data => {
      setAllQuizzes(data.quizzes || []);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  const quiz = selectedQuiz ? allQuizzes.find(q => q.id === selectedQuiz) : null;
  const question = quiz?.questions[currentQuestion];

  useEffect(() => {
    if (quiz && timeLeft === 0) {
      setTimeLeft(quiz.timeLimit * 60);
    }
  }, [quiz]);

  useEffect(() => {
    if (timeLeft > 0 && !quizSubmitted) {
      const timer = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            handleSubmit();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [timeLeft, quizSubmitted]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleAnswer = (value: string | number) => {
    if (question) {
      setAnswers(prev => ({ ...prev, [question.id]: value }));
    }
  };

  const toggleFlag = () => {
    if (question) {
      setFlaggedQuestions(prev => {
        const newSet = new Set(prev);
        if (newSet.has(question.id)) {
          newSet.delete(question.id);
        } else {
          newSet.add(question.id);
        }
        return newSet;
      });
    }
  };

  const handleNext = () => {
    if (quiz && currentQuestion < quiz.questions.length - 1) {
      setCurrentQuestion(prev => prev + 1);
    }
  };

  const handlePrevious = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(prev => prev - 1);
    }
  };

  const handleSubmit = async () => {
    setQuizSubmitted(true);
    const token = localStorage.getItem('eduspeak_token');
    const timeTaken = (quiz?.timeLimit || 0) * 60 - timeLeft;
    
    try {
      const res = await fetch(`/api/quizzes/${selectedQuiz}/submit`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          answers: (quiz?.questions || []).map((q: any) => ({ selectedAnswer: answers[q.id] })),
          timeTaken,
        }),
      });
      const data = await res.json();
      const result = data.result || {};
      toast.success(`Quiz submitted! You scored ${result.score || 0}/${result.totalPoints || 0} points`);
      setTimeout(() => {
        navigate('/student/quiz/result', {
          state: { quiz, answers, score: result.score, totalPoints: result.totalPoints, timeTaken, percentage: result.percentage },
        });
      }, 1500);
    } catch {
      // Fallback local scoring
      let score = 0; let totalPoints = 0;
      quiz?.questions.forEach((q: any) => { totalPoints += q.points || 10; if (answers[q.id] === q.correctAnswer) score += q.points || 10; });
      toast.success(`Quiz submitted! You scored ${score}/${totalPoints} points`);
      setTimeout(() => { navigate('/student/quiz/result', { state: { quiz, answers, score, totalPoints, timeTaken } }); }, 1500);
    }
  };

  const getQuestionStatus = (index: number) => {
    const qId = quiz?.questions[index].id;
    if (answers[qId || '']) return 'answered';
    if (flaggedQuestions.has(qId || '')) return 'flagged';
    return 'unanswered';
  };

  if (!selectedQuiz) {
    if (loading) return <div className="flex items-center justify-center min-h-[400px]"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div></div>;
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Quiz Room</h1>
          <p className="text-muted-foreground">Test your knowledge with interactive quizzes</p>
        </div>

        {allQuizzes.length === 0 ? (
          <div className="text-center py-12"><BookOpen className="h-12 w-12 text-muted-foreground mx-auto mb-4" /><h3 className="text-lg font-medium">No quizzes available yet</h3></div>
        ) : (
        <div className="grid md:grid-cols-2 gap-6">
          {allQuizzes.map((q) => (
            <Card key={q.id} className="cursor-pointer hover:border-primary transition-colors">
              <CardContent className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="h-12 w-12 bg-primary/10 rounded-lg flex items-center justify-center">
                    <BookOpen className="h-6 w-6 text-primary" />
                  </div>
                  <Badge>{q.category}</Badge>
                </div>
                <h3 className="text-lg font-semibold mb-2">{q.title}</h3>
                <p className="text-muted-foreground text-sm mb-4">{q.description}</p>
                <div className="flex items-center justify-between text-sm">
                  <span className="flex items-center text-muted-foreground">
                    <Clock className="h-4 w-4 mr-1" />
                    {q.timeLimit} minutes
                  </span>
                  <span className="text-muted-foreground">
                    {(q.questions || []).length} questions
                  </span>
                </div>
                <Button 
                  className="w-full mt-4" 
                  onClick={() => setSelectedQuiz(q.id)}
                >
                  Start Quiz
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
        )}
      </div>
    );
  }

  if (!question) return null;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <Button variant="ghost" onClick={() => setSelectedQuiz(null)}>
          <ChevronLeft className="h-4 w-4 mr-2" />
          Exit Quiz
        </Button>
        <div className="flex items-center space-x-4">
          <div className={`flex items-center space-x-2 px-4 py-2 rounded-full ${
            timeLeft < 60 ? 'bg-red-100 text-red-700' : 'bg-muted'
          }`}>
            <Clock className="h-4 w-4" />
            <span className="font-mono font-medium">{formatTime(timeLeft)}</span>
          </div>
        </div>
      </div>

      {/* Progress */}
      <div className="flex items-center space-x-4">
        <Progress 
          value={((currentQuestion + 1) / (quiz?.questions.length || 1)) * 100} 
          className="flex-1"
        />
        <span className="text-sm text-muted-foreground whitespace-nowrap">
          Question {currentQuestion + 1} of {quiz?.questions.length}
        </span>
      </div>

      {/* Question Navigation */}
      <div className="flex flex-wrap gap-2">
        {quiz?.questions.map((_: any, index: number) => {
          const status = getQuestionStatus(index);
          return (
            <button
              key={index}
              onClick={() => setCurrentQuestion(index)}
              className={`h-8 w-8 rounded-full text-sm font-medium transition-colors ${
                index === currentQuestion
                  ? 'bg-primary text-primary-foreground'
                  : status === 'answered'
                  ? 'bg-green-100 text-green-700'
                  : status === 'flagged'
                  ? 'bg-yellow-100 text-yellow-700'
                  : 'bg-muted text-muted-foreground'
              }`}
            >
              {index + 1}
            </button>
          );
        })}
      </div>

      {/* Question Card */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-start justify-between mb-6">
            <Badge variant="secondary">{question.type.replace('_', ' ')}</Badge>
            <Button 
              variant="ghost" 
              size="sm"
              onClick={toggleFlag}
              className={flaggedQuestions.has(question.id) ? 'text-yellow-500' : ''}
            >
              <Flag className="h-4 w-4 mr-2" />
              {flaggedQuestions.has(question.id) ? 'Flagged' : 'Flag'}
            </Button>
          </div>

          <h3 className="text-xl font-medium mb-6">{question.question}</h3>

          {question.type === 'multiple_choice' && question.options && (
            <RadioGroup 
              value={answers[question.id]?.toString()} 
              onValueChange={(value) => handleAnswer(parseInt(value))}
              className="space-y-3"
            >
              {question.options.map((option: string, index: number) => (
                <div key={index} className="flex items-center space-x-3 p-3 rounded-lg border hover:bg-muted transition-colors">
                  <RadioGroupItem value={index.toString()} id={`option-${index}`} />
                  <Label htmlFor={`option-${index}`} className="flex-1 cursor-pointer">
                    {option}
                  </Label>
                </div>
              ))}
            </RadioGroup>
          )}

          {question.type === 'true_false' && (
            <RadioGroup 
              value={answers[question.id]?.toString()} 
              onValueChange={(value) => handleAnswer(value)}
              className="space-y-3"
            >
              <div className="flex items-center space-x-3 p-3 rounded-lg border hover:bg-muted transition-colors">
                <RadioGroupItem value="true" id="true" />
                <Label htmlFor="true" className="flex-1 cursor-pointer">True</Label>
              </div>
              <div className="flex items-center space-x-3 p-3 rounded-lg border hover:bg-muted transition-colors">
                <RadioGroupItem value="false" id="false" />
                <Label htmlFor="false" className="flex-1 cursor-pointer">False</Label>
              </div>
            </RadioGroup>
          )}

          {question.type === 'fill_blank' && (
            <div className="space-y-3">
              <Label>Your answer:</Label>
              <Input
                value={answers[question.id]?.toString() || ''}
                onChange={(e) => handleAnswer(e.target.value)}
                placeholder="Type your answer here..."
              />
            </div>
          )}

          {/* Navigation Buttons */}
          <div className="flex justify-between mt-8">
            <Button
              variant="outline"
              onClick={handlePrevious}
              disabled={currentQuestion === 0}
            >
              <ChevronLeft className="h-4 w-4 mr-2" />
              Previous
            </Button>
            
            {currentQuestion === (quiz?.questions.length || 1) - 1 ? (
              <Button onClick={handleSubmit} variant="default">
                <CheckCircle2 className="h-4 w-4 mr-2" />
                Submit Quiz
              </Button>
            ) : (
              <Button onClick={handleNext}>
                Next
                <ChevronRight className="h-4 w-4 ml-2" />
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Unanswered Warning */}
      {Object.keys(answers).length < (quiz?.questions.length || 0) && (
        <div className="flex items-center space-x-2 text-yellow-600 bg-yellow-50 p-3 rounded-lg">
          <AlertCircle className="h-5 w-5" />
          <span className="text-sm">
            You have {((quiz?.questions.length || 0) - Object.keys(answers).length)} unanswered question(s)
          </span>
        </div>
      )}
    </div>
  );
}

import { useLocation, Link } from 'react-router-dom';
import { 
  CheckCircle2, 
  XCircle, 
  Trophy, 
  RotateCcw, 
  ChevronLeft,
  Users,
  TrendingUp,
  Award
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

interface LocationState {
  quiz: {
    id: string;
    title: string;
    questions: {
      id: string;
      question: string;
      options?: string[];
      correctAnswer: string | number;
      explanation: string;
      points: number;
    }[];
  };
  answers: Record<string, string | number>;
  score: number;
  totalPoints: number;
  timeTaken: number;
}

export default function QuizResult() {
  const location = useLocation();
  const state = location.state as LocationState;

  if (!state) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">No quiz results available</p>
        <Link to="/student/quiz">
          <Button className="mt-4">Take a Quiz</Button>
        </Link>
      </div>
    );
  }

  const { quiz, answers, score, totalPoints, timeTaken } = state;
  const percentage = Math.round((score / totalPoints) * 100);
  
  const getGradeLabel = () => {
    if (percentage >= 90) return { label: 'Excellent!', color: 'text-green-600', bgColor: 'bg-green-100' };
    if (percentage >= 70) return { label: 'Good Job!', color: 'text-blue-600', bgColor: 'bg-blue-100' };
    if (percentage >= 50) return { label: 'Keep Practicing', color: 'text-yellow-600', bgColor: 'bg-yellow-100' };
    return { label: 'Needs Improvement', color: 'text-red-600', bgColor: 'bg-red-100' };
  };

  const grade = getGradeLabel();
  const minutes = Math.floor(timeTaken / 60);
  const seconds = timeTaken % 60;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <Link to="/student/quiz">
          <Button variant="ghost">
            <ChevronLeft className="h-4 w-4 mr-2" />
            Back to Quizzes
          </Button>
        </Link>
      </div>

      {/* Score Summary */}
      <Card className="border-2">
        <CardContent className="p-8">
          <div className="text-center">
            <div className={`inline-flex items-center justify-center h-24 w-24 rounded-full ${grade.bgColor} mb-4`}>
              <Trophy className={`h-12 w-12 ${grade.color}`} />
            </div>
            <h2 className="text-2xl font-bold mb-2">{grade.label}</h2>
            <p className="text-muted-foreground mb-6">You completed {quiz.title}</p>
            
            <div className="grid grid-cols-3 gap-4 max-w-lg mx-auto">
              <div className="text-center p-4 bg-muted rounded-lg">
                <p className="text-3xl font-bold text-primary">{percentage}%</p>
                <p className="text-sm text-muted-foreground">Score</p>
              </div>
              <div className="text-center p-4 bg-muted rounded-lg">
                <p className="text-3xl font-bold">{score}/{totalPoints}</p>
                <p className="text-sm text-muted-foreground">Points</p>
              </div>
              <div className="text-center p-4 bg-muted rounded-lg">
                <p className="text-3xl font-bold">{minutes}:{seconds.toString().padStart(2, '0')}</p>
                <p className="text-sm text-muted-foreground">Time Taken</p>
              </div>
            </div>

            <div className="flex justify-center space-x-4 mt-6">
              <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                <Users className="h-4 w-4" />
                <span>Class Average: 72%</span>
              </div>
              <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                <TrendingUp className="h-4 w-4" />
                <span>Your Best: 85%</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Leaderboard */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center space-x-2 mb-4">
            <Award className="h-5 w-5 text-yellow-500" />
            <h3 className="font-semibold">Top Performers</h3>
          </div>
          <div className="space-y-2">
            {[
              { name: 'Michael Brown', score: 95, avatar: 'M' },
              { name: 'You', score: percentage, avatar: 'Y', isYou: true },
              { name: 'Emma Wilson', score: 78, avatar: 'E' },
            ].map((user, index) => (
              <div 
                key={index} 
                className={`flex items-center justify-between p-3 rounded-lg ${
                  user.isYou ? 'bg-primary/10 border border-primary/30' : 'bg-muted'
                }`}
              >
                <div className="flex items-center space-x-3">
                  <span className="text-lg font-bold text-muted-foreground w-6">#{index + 1}</span>
                  <div className="h-8 w-8 rounded-full bg-primary/20 flex items-center justify-center">
                    <span className="text-sm font-medium">{user.avatar}</span>
                  </div>
                  <span className={user.isYou ? 'font-medium' : ''}>{user.name}</span>
                </div>
                <span className="font-bold">{user.score}%</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Question Review */}
      <div>
        <h3 className="text-xl font-semibold mb-4">Question Review</h3>
        <div className="space-y-4">
          {quiz.questions.map((question, index) => {
            const userAnswer = answers[question.id];
            const isCorrect = userAnswer === question.correctAnswer;
            
            return (
              <Card key={question.id} className={isCorrect ? 'border-green-200' : 'border-red-200'}>
                <CardContent className="p-4">
                  <div className="flex items-start space-x-3">
                    <div className={`h-6 w-6 rounded-full flex items-center justify-center flex-shrink-0 ${
                      isCorrect ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'
                    }`}>
                      {isCorrect ? <CheckCircle2 className="h-4 w-4" /> : <XCircle className="h-4 w-4" />}
                    </div>
                    <div className="flex-1">
                      <p className="font-medium mb-2">
                        <span className="text-muted-foreground">Q{index + 1}.</span> {question.question}
                      </p>
                      
                      <div className="space-y-2 text-sm">
                        <div className="flex items-center space-x-2">
                          <span className="text-muted-foreground">Your answer:</span>
                          <span className={isCorrect ? 'text-green-600 font-medium' : 'text-red-600 font-medium'}>
                            {typeof userAnswer === 'number' && question.options 
                              ? question.options[userAnswer] 
                              : userAnswer?.toString() || 'Not answered'}
                          </span>
                        </div>
                        
                        {!isCorrect && (
                          <div className="flex items-center space-x-2">
                            <span className="text-muted-foreground">Correct answer:</span>
                            <span className="text-green-600 font-medium">
                              {typeof question.correctAnswer === 'number' && question.options
                                ? question.options[question.correctAnswer]
                                : question.correctAnswer.toString()}
                            </span>
                          </div>
                        )}
                        
                        <div className="mt-3 p-3 bg-muted rounded-lg">
                          <p className="text-muted-foreground">
                            <span className="font-medium">Explanation:</span> {question.explanation}
                          </p>
                        </div>
                      </div>
                    </div>
                    <Badge variant={isCorrect ? 'default' : 'destructive'}>
                      {isCorrect ? `+${question.points}` : '0'}/{question.points} pts
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex justify-center space-x-4">
        <Link to="/student/quiz">
          <Button variant="outline">
            <ChevronLeft className="h-4 w-4 mr-2" />
            Back to Quizzes
          </Button>
        </Link>
        <Link to="/student/quiz">
          <Button>
            <RotateCcw className="h-4 w-4 mr-2" />
            Retake Quiz
          </Button>
        </Link>
      </div>
    </div>
  );
}

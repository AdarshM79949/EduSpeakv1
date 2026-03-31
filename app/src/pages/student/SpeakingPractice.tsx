import { useState, useEffect, useRef } from 'react';
import { 
  Mic, 
  Square, 
  RotateCcw, 
  TrendingUp,
  History,
  Lightbulb,
  Image as ImageIcon
} from 'lucide-react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';

type SpeakingExerciseType = 'read_aloud' | 'repeat' | 'free_talk' | 'describe_image';
interface SpeakingExercise {
  id: string; type: SpeakingExerciseType; title: string; prompt: string;
  targetText?: string; imageUrl?: string; difficulty: string; hints?: string[];
}
interface SpeakingSession {
  id: string; exerciseId: string; accuracyScore: number; fluencyScore: number;
  transcription: string; createdAt: string;
}

export default function SpeakingPractice() {
  const [exercises, setExercises] = useState<SpeakingExercise[]>([]);
  const [speakingHistory, setSpeakingHistory] = useState<SpeakingSession[]>([]);
  const [selectedExercise, setSelectedExercise] = useState<SpeakingExercise | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [showResults, setShowResults] = useState(false);
  const [lastResult, setLastResult] = useState<any>(null);
  const [selectedType, setSelectedType] = useState<SpeakingExerciseType | 'all'>('all');
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>('all');
  const [loading, setLoading] = useState(true);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const token = localStorage.getItem('eduspeak_token');

  useEffect(() => {
    const headers: any = token ? { Authorization: `Bearer ${token}` } : {};
    Promise.all([
      fetch('/api/speaking/exercises').then(r => r.json()),
      token ? fetch('/api/speaking/history', { headers }).then(r => r.json()).catch(() => ({ sessions: [] })) : Promise.resolve({ sessions: [] }),
    ]).then(([exData, histData]) => {
      setExercises(exData.exercises || []);
      setSpeakingHistory(histData.sessions || []);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, [token]);

  const filteredExercises = exercises.filter(ex => {
    const typeMatch = selectedType === 'all' || ex.type === selectedType;
    const difficultyMatch = selectedDifficulty === 'all' || ex.difficulty === selectedDifficulty;
    return typeMatch && difficultyMatch;
  });

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        // Simulate speech recognition, then submit to backend
        const spokenText = selectedExercise?.targetText
          ? selectedExercise.targetText.slice(0, -10)
          : 'This is a sample transcription of the speaking practice session.';
        setTranscript(spokenText);

        // Submit to backend
        const headers: any = { 'Content-Type': 'application/json' };
        if (token) headers.Authorization = `Bearer ${token}`;
        fetch('/api/speaking/submit', {
          method: 'POST', headers,
          body: JSON.stringify({ exerciseId: selectedExercise?.id, transcription: spokenText, recordingDuration: 10 }),
        }).then(r => r.json()).then(data => {
          setLastResult(data.session);
          setShowResults(true);
        }).catch(() => setShowResults(true));
      };

      mediaRecorder.start();
      setIsRecording(true);
      setTranscript('');
      setShowResults(false);
      toast.success('Recording started! Speak clearly into your microphone.');
    } catch (error) {
      toast.error('Could not access microphone. Please check permissions.');
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop());
      setIsRecording(false);
      toast.info('Processing your speech...');
    }
  };

  const resetExercise = () => {
    setTranscript('');
    setShowResults(false);
    setIsRecording(false);
  };

  const calculateAccuracy = () => {
    if (!selectedExercise?.targetText || !transcript) return 0;
    const targetWords = selectedExercise.targetText.toLowerCase().split(' ');
    const spokenWords = transcript.toLowerCase().split(' ');
    let correct = 0;
    spokenWords.forEach((word, i) => {
      if (targetWords[i] === word) correct++;
    });
    return Math.round((correct / targetWords.length) * 100);
  };

  const getExerciseTypeLabel = (type: SpeakingExerciseType) => {
    const labels: Record<SpeakingExerciseType, string> = {
      read_aloud: 'Read Aloud',
      repeat: 'Repeat After Me',
      free_talk: 'Free Talk',
      describe_image: 'Describe Image',
    };
    return labels[type];
  };

  const getExerciseIcon = (type: SpeakingExerciseType) => {
    switch (type) {
      case 'read_aloud':
        return <Mic className="h-5 w-5" />;
      case 'repeat':
        return <Mic className="h-5 w-5" />;
      case 'free_talk':
        return <TrendingUp className="h-5 w-5" />;
      case 'describe_image':
        return <ImageIcon className="h-5 w-5" />;
    }
  };

  if (loading) return <div className="flex items-center justify-center min-h-[400px]"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div></div>;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">Speaking Practice</h1>
        <p className="text-muted-foreground">Practice your pronunciation with AI-powered feedback</p>
      </div>

      {!selectedExercise ? (
        <>
          {/* Filters */}
          <Card>
            <CardContent className="p-4">
              <div className="flex flex-col md:flex-row gap-4">
                <Select value={selectedType} onValueChange={(value) => setSelectedType(value as SpeakingExerciseType | 'all')}>
                  <SelectTrigger className="w-[200px]">
                    <SelectValue placeholder="Exercise Type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Types</SelectItem>
                    <SelectItem value="read_aloud">Read Aloud</SelectItem>
                    <SelectItem value="repeat">Repeat After Me</SelectItem>
                    <SelectItem value="free_talk">Free Talk</SelectItem>
                    <SelectItem value="describe_image">Describe Image</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={selectedDifficulty} onValueChange={setSelectedDifficulty}>
                  <SelectTrigger className="w-[200px]">
                    <SelectValue placeholder="Difficulty" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Levels</SelectItem>
                    <SelectItem value="beginner">Beginner</SelectItem>
                    <SelectItem value="intermediate">Intermediate</SelectItem>
                    <SelectItem value="advanced">Advanced</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Exercise List */}
          <div className="grid md:grid-cols-2 gap-4">
            {filteredExercises.map((exercise) => (
              <Card 
                key={exercise.id} 
                className="cursor-pointer hover:border-primary transition-colors"
                onClick={() => setSelectedExercise(exercise)}
              >
                <CardContent className="p-4">
                  <div className="flex items-start space-x-4">
                    <div className="h-12 w-12 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
                      {getExerciseIcon(exercise.type)}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-1">
                        <h3 className="font-semibold">{exercise.title}</h3>
                        <Badge variant={exercise.difficulty === 'beginner' ? 'default' : exercise.difficulty === 'intermediate' ? 'secondary' : 'destructive'}>
                          {exercise.difficulty}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground mb-2">{exercise.prompt}</p>
                      <div className="flex items-center text-xs text-muted-foreground">
                        <span className="flex items-center">
                          {getExerciseIcon(exercise.type)}
                          <span className="ml-1">{getExerciseTypeLabel(exercise.type)}</span>
                        </span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* History */}
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center space-x-2">
                <History className="h-5 w-5" />
                <h3 className="font-semibold">Recent Sessions</h3>
              </div>
            </CardHeader>
            <CardContent>
              {speakingHistory.length > 0 ? (
                <div className="space-y-3">
                  {speakingHistory.slice(0, 5).map((result) => (
                    <div key={result.id} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                      <div>
                        <p className="font-medium">Speaking Exercise</p>
                        <p className="text-sm text-muted-foreground">
                          {new Date(result.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-2xl font-bold text-primary">{result.accuracyScore}%</p>
                        <p className="text-xs text-muted-foreground">Accuracy</p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-center text-muted-foreground py-4">No speaking sessions yet</p>
              )}
            </CardContent>
          </Card>
        </>
      ) : (
        /* Active Exercise */
        <div className="space-y-6">
          <Button variant="ghost" onClick={() => setSelectedExercise(null)}>
            ← Back to exercises
          </Button>

          <Card>
            <CardContent className="p-6">
              <div className="text-center mb-6">
                <Badge className="mb-2">{getExerciseTypeLabel(selectedExercise.type)}</Badge>
                <h2 className="text-2xl font-bold">{selectedExercise.title}</h2>
                <p className="text-muted-foreground mt-2">{selectedExercise.prompt}</p>
              </div>

              {/* Target Content */}
              {selectedExercise.targetText && (
                <div className="bg-muted p-6 rounded-lg mb-6">
                  <p className="text-lg leading-relaxed text-center">{selectedExercise.targetText}</p>
                </div>
              )}

              {selectedExercise.imageUrl && (
                <div className="mb-6">
                  <img 
                    src={selectedExercise.imageUrl} 
                    alt="Exercise"
                    className="max-w-md mx-auto rounded-lg"
                  />
                </div>
              )}

              {/* Hints */}
              {selectedExercise.hints && (
                <div className="mb-6">
                  <div className="flex items-center space-x-2 mb-2">
                    <Lightbulb className="h-4 w-4 text-yellow-500" />
                    <span className="font-medium text-sm">Tips</span>
                  </div>
                  <ul className="list-disc list-inside text-sm text-muted-foreground">
                    {selectedExercise.hints.map((hint, i) => (
                      <li key={i}>{hint}</li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Recording Controls */}
              <div className="flex justify-center space-x-4">
                {!isRecording ? (
                  <Button 
                    size="lg" 
                    onClick={startRecording}
                    className="rounded-full h-16 w-16 p-0"
                  >
                    <Mic className="h-8 w-8" />
                  </Button>
                ) : (
                  <Button 
                    size="lg" 
                    variant="destructive"
                    onClick={stopRecording}
                    className="rounded-full h-16 w-16 p-0 animate-pulse"
                  >
                    <Square className="h-8 w-8" />
                  </Button>
                )}
              </div>

              {isRecording && (
                <p className="text-center text-muted-foreground mt-4 animate-pulse">
                  Recording... Click the button to stop
                </p>
              )}

              {/* Waveform Visualization */}
              {isRecording && (
                <div className="flex justify-center items-center space-x-1 h-16 mt-4">
                  {[...Array(20)].map((_, i) => (
                    <div
                      key={i}
                      className="w-2 bg-primary rounded-full animate-pulse"
                      style={{
                        height: `${Math.random() * 100}%`,
                        animationDelay: `${i * 0.05}s`,
                      }}
                    />
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Results */}
          {showResults && (
            <Card>
              <CardContent className="p-6">
                <h3 className="text-xl font-semibold mb-4">Your Results</h3>
                
                <div className="grid grid-cols-2 gap-4 mb-6">
                  <div className="text-center p-4 bg-muted rounded-lg">
                    <p className="text-3xl font-bold text-primary">{lastResult?.accuracyScore || calculateAccuracy()}%</p>
                    <p className="text-sm text-muted-foreground">Accuracy</p>
                  </div>
                  <div className="text-center p-4 bg-muted rounded-lg">
                    <p className="text-3xl font-bold text-green-500">{lastResult?.fluencyScore || 78}</p>
                    <p className="text-sm text-muted-foreground">Fluency Score</p>
                  </div>
                </div>

                <div className="mb-4">
                  <p className="font-medium mb-2">What you said:</p>
                  <p className="text-muted-foreground bg-muted p-3 rounded">{transcript}</p>
                </div>

                <div className="flex justify-center space-x-4">
                  <Button variant="outline" onClick={resetExercise}>
                    <RotateCcw className="h-4 w-4 mr-2" />
                    Try Again
                  </Button>
                  <Button onClick={() => setSelectedExercise(null)}>
                    Next Exercise
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      )}
    </div>
  );
}

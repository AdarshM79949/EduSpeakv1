// User Roles
export type UserRole = 'student' | 'teacher' | 'admin';

// User Interface
export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatar?: string;
  createdAt: Date;
}

// Skill Categories
export type SkillCategory = 'speaking' | 'listening' | 'reading' | 'writing' | 'grammar';

// Difficulty Levels
export type DifficultyLevel = 'beginner' | 'intermediate' | 'advanced';

// Lesson Types
export type LessonType = 'video' | 'audio' | 'text' | 'pdf';

// Lesson Interface
export interface Lesson {
  id: string;
  title: string;
  description: string;
  category: SkillCategory;
  difficulty: DifficultyLevel;
  type: LessonType;
  duration: number; // in minutes
  thumbnail: string;
  contentUrl: string;
  teacherId: string;
  teacherName: string;
  createdAt: Date;
  completed?: boolean;
  bookmarked?: boolean;
  vocabulary?: VocabularyItem[];
  viewCount?: number;
}

// Vocabulary Item
export interface VocabularyItem {
  word: string;
  definition: string;
  example: string;
}

// Quiz Types
export type QuestionType = 'multiple_choice' | 'true_false' | 'fill_blank' | 'matching';

// Quiz Question
export interface QuizQuestion {
  id: string;
  type: QuestionType;
  question: string;
  options?: string[];
  correctAnswer: string | number;
  explanation: string;
  points: number;
}

// Quiz
export interface Quiz {
  id: string;
  title: string;
  description: string;
  category: SkillCategory;
  timeLimit: number; // in minutes
  questions: QuizQuestion[];
  teacherId: string;
  createdAt: Date;
  assignedTo?: string[];
  openDate?: Date;
  closeDate?: Date;
}

// Quiz Result
export interface QuizResult {
  id: string;
  quizId: string;
  quizTitle: string;
  studentId: string;
  score: number;
  totalPoints: number;
  percentage: number;
  answers: {
    questionId: string;
    selectedAnswer: string | number;
    isCorrect: boolean;
  }[];
  timeTaken: number; // in seconds
  completedAt: Date;
}

// Speaking Exercise Types
export type SpeakingExerciseType = 'read_aloud' | 'repeat' | 'free_talk' | 'describe_image';

// Speaking Exercise
export interface SpeakingExercise {
  id: string;
  type: SpeakingExerciseType;
  title: string;
  prompt: string;
  targetText?: string;
  imageUrl?: string;
  difficulty: DifficultyLevel;
  hints?: string[];
}

// Speaking Session Result
export interface SpeakingResult {
  id: string;
  exerciseId: string;
  studentId: string;
  transcript: string;
  targetText: string;
  accuracyScore: number;
  fluencyScore: number;
  pronunciationFeedback: {
    word: string;
    correct: boolean;
    suggestion?: string;
  }[];
  recordingUrl?: string;
  completedAt: Date;
}

// Student Progress
export interface StudentProgress {
  studentId: string;
  totalLessonsCompleted: number;
  totalQuizzesTaken: number;
  averageQuizScore: number;
  speakingSessionsCompleted: number;
  streakDays: number;
  lastActivityDate: Date;
  skillProgress: {
    [key in SkillCategory]: {
      completed: number;
      total: number;
    };
  };
  weeklyActivity: {
    day: string;
    lessons: number;
    quizzes: number;
    speaking: number;
  }[];
  recentActivity: ActivityItem[];
}

// Activity Item
export interface ActivityItem {
  id: string;
  type: 'lesson' | 'quiz' | 'speaking';
  title: string;
  description: string;
  timestamp: Date;
  score?: number;
}

// Class/Student Management
export interface Class {
  id: string;
  name: string;
  teacherId: string;
  students: StudentProfile[];
  createdAt: Date;
}

// Student Profile (for teacher view)
export interface StudentProfile {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  joinedAt: Date;
  progress: StudentProgress;
  grades: GradeItem[];
}

// Grade Item
export interface GradeItem {
  id: string;
  type: 'quiz' | 'assignment' | 'speaking';
  title: string;
  score: number;
  maxScore: number;
  feedback?: string;
  gradedAt: Date;
}

// Analytics Data (for admin)
export interface PlatformAnalytics {
  totalUsers: number;
  activeStudentsThisWeek: number;
  totalLessons: number;
  totalQuizzes: number;
  quizzesTaken: number;
  dailyActiveUsers: {
    date: string;
    count: number;
  }[];
  lessonCompletionRate: number;
  quizPassRate: number;
  recentSignups: {
    id: string;
    name: string;
    email: string;
    role: UserRole;
    signedUpAt: Date;
  }[];
  popularLessons: {
    lessonId: string;
    title: string;
    viewCount: number;
  }[];
}

// Content Moderation Item
export interface ContentModerationItem {
  id: string;
  type: 'lesson' | 'quiz';
  title: string;
  authorId: string;
  authorName: string;
  submittedAt: Date;
  status: 'pending' | 'approved' | 'rejected';
  content: Lesson | Quiz;
}

// Navigation Item
export interface NavItem {
  label: string;
  href: string;
  icon?: string;
  roles?: UserRole[];
}

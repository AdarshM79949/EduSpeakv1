import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from '@/context/AuthContext';
import { Toaster } from '@/components/ui/sonner';

// Layouts
import MainLayout from '@/layouts/MainLayout';
import DashboardLayout from '@/layouts/DashboardLayout';

// Public Pages
import LandingPage from '@/pages/LandingPage';
import LoginPage from '@/pages/LoginPage';
import RegisterPage from '@/pages/RegisterPage';
import ForgotPasswordPage from '@/pages/ForgotPasswordPage';

// Student Pages
import StudentDashboard from '@/pages/student/StudentDashboard';
import LessonLibrary from '@/pages/student/LessonLibrary';
import LessonPlayer from '@/pages/student/LessonPlayer';
import SpeakingPractice from '@/pages/student/SpeakingPractice';
import QuizRoom from '@/pages/student/QuizRoom';
import QuizResult from '@/pages/student/QuizResult';
import ProgressReport from '@/pages/student/ProgressReport';

// Teacher Pages
import TeacherDashboard from '@/pages/teacher/TeacherDashboard';
import UploadContent from '@/pages/teacher/UploadContent';
import ClassManagement from '@/pages/teacher/ClassManagement';
import Gradebook from '@/pages/teacher/Gradebook';
import QuizBuilder from '@/pages/teacher/QuizBuilder';

// Admin Pages
import AdminDashboard from '@/pages/admin/AdminDashboard';
import UserManagement from '@/pages/admin/UserManagement';
import ContentModeration from '@/pages/admin/ContentModeration';
import Analytics from '@/pages/admin/Analytics';
import Settings from '@/pages/admin/Settings';

// Error Page
import NotFoundPage from '@/pages/NotFoundPage';

// Shared Pages
import ProfilePage from '@/pages/ProfilePage';
import UserSettings from '@/pages/UserSettings';

import type { UserRole } from '@/types';

// Protected Route Component
function ProtectedRoute({ 
  children, 
  allowedRoles 
}: { 
  children: React.ReactNode; 
  allowedRoles?: UserRole[] 
}) {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    // Redirect to appropriate dashboard based on role
    if (user.role === 'student') return <Navigate to="/student/dashboard" replace />;
    if (user.role === 'teacher') return <Navigate to="/teacher/dashboard" replace />;
    if (user.role === 'admin') return <Navigate to="/admin" replace />;
  }

  return <>{children}</>;
}

// Public Route - redirects to dashboard if already logged in
function PublicRoute({ children }: { children: React.ReactNode }) {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (user) {
    if (user.role === 'student') return <Navigate to="/student/dashboard" replace />;
    if (user.role === 'teacher') return <Navigate to="/teacher/dashboard" replace />;
    if (user.role === 'admin') return <Navigate to="/admin" replace />;
  }

  return <>{children}</>;
}

function AppRoutes() {
  return (
    <Routes>
      {/* Public Routes */}
      <Route element={<MainLayout />}>
        <Route path="/" element={<PublicRoute><LandingPage /></PublicRoute>} />
        <Route path="/login" element={<PublicRoute><LoginPage /></PublicRoute>} />
        <Route path="/register" element={<PublicRoute><RegisterPage /></PublicRoute>} />
        <Route path="/forgot-password" element={<PublicRoute><ForgotPasswordPage /></PublicRoute>} />
      </Route>

      {/* Student Routes */}
      <Route element={<DashboardLayout />}>
        <Route 
          path="/student/dashboard" 
          element={
            <ProtectedRoute allowedRoles={['student']}>
              <StudentDashboard />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/student/lessons" 
          element={
            <ProtectedRoute allowedRoles={['student']}>
              <LessonLibrary />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/student/lessons/:id" 
          element={
            <ProtectedRoute allowedRoles={['student']}>
              <LessonPlayer />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/student/speaking" 
          element={
            <ProtectedRoute allowedRoles={['student']}>
              <SpeakingPractice />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/student/quiz" 
          element={
            <ProtectedRoute allowedRoles={['student']}>
              <QuizRoom />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/student/quiz/result" 
          element={
            <ProtectedRoute allowedRoles={['student']}>
              <QuizResult />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/student/progress" 
          element={
            <ProtectedRoute allowedRoles={['student']}>
              <ProgressReport />
            </ProtectedRoute>
          } 
        />

        {/* Teacher Routes */}
        <Route 
          path="/teacher/dashboard" 
          element={
            <ProtectedRoute allowedRoles={['teacher']}>
              <TeacherDashboard />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/teacher/upload" 
          element={
            <ProtectedRoute allowedRoles={['teacher']}>
              <UploadContent />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/teacher/classes" 
          element={
            <ProtectedRoute allowedRoles={['teacher']}>
              <ClassManagement />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/teacher/grades" 
          element={
            <ProtectedRoute allowedRoles={['teacher']}>
              <Gradebook />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/teacher/quiz/create" 
          element={
            <ProtectedRoute allowedRoles={['teacher']}>
              <QuizBuilder />
            </ProtectedRoute>
          } 
        />

        {/* Admin Routes */}
        <Route 
          path="/admin" 
          element={
            <ProtectedRoute allowedRoles={['admin']}>
              <AdminDashboard />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/admin/users" 
          element={
            <ProtectedRoute allowedRoles={['admin']}>
              <UserManagement />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/admin/content" 
          element={
            <ProtectedRoute allowedRoles={['admin']}>
              <ContentModeration />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/admin/analytics" 
          element={
            <ProtectedRoute allowedRoles={['admin']}>
              <Analytics />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/admin/settings" 
          element={
            <ProtectedRoute allowedRoles={['admin']}>
              <Settings />
            </ProtectedRoute>
          } 
        />

        {/* Shared Routes (all authenticated users) */}
        <Route 
          path="/profile" 
          element={
            <ProtectedRoute>
              <ProfilePage />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/settings" 
          element={
            <ProtectedRoute>
              <UserSettings />
            </ProtectedRoute>
          } 
        />
      </Route>

      {/* 404 Page */}
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
}

function App() {
  return (
    <AuthProvider>
      <Router>
        <AppRoutes />
        <Toaster position="top-right" richColors />
      </Router>
    </AuthProvider>
  );
}

export default App;

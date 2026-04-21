import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext.jsx';
import Login from './pages/Login.jsx';
import Register from './pages/Register.jsx';
import StudentDashboard from './pages/StudentDashboard.jsx';
import GradeSelection from './pages/GradeSelection.jsx';
import SubjectSelection from './pages/SubjectSelection.jsx';
import LessonView from './pages/LessonView.jsx';
import LessonDetail from './pages/LessonDetail.jsx';
import Quiz from './pages/Quiz.jsx';
import Leaderboard from './pages/Leaderboard.jsx';
import AdminDashboard from './pages/AdminDashboard.jsx';
import AdminAnalytics from './pages/AdminAnalytics.jsx';
import AdminGradesManagement from './pages/AdminGradesManagement.jsx';
import AdminLessonsManagement from './pages/AdminLessonsManagement.jsx';
import AdminStudentsManagement from './pages/AdminStudentsManagement.jsx';
import AdminQuizzesManagement from './pages/AdminQuizzesManagement.jsx';
import AdminLeaderboardManagement from './pages/AdminLeaderboardManagement.jsx';
import AdminReportsManagement from './pages/AdminReportsManagement.jsx';
import AdminUsersManagement from './pages/AdminUsersManagement.jsx';
import AdminSettings from './pages/AdminSettings.jsx';
import AdminWeeklyTestsManagement from './pages/AdminWeeklyTestsManagement.jsx';
import './styles/App.css';

const PrivateRoute = ({ children, adminOnly = false }) => {
  const { user, loading } = useAuth();
  
  if (loading) {
    return <div className="loading">Loading...</div>;
  }
  
  if (!user) {
    return <Navigate to="/login" />;
  }
  
  if (adminOnly && user.role !== 'admin') {
    return <Navigate to="/dashboard" />;
  }
  
  return children;
};

const PublicRoute = ({ children }) => {
  const { user, loading } = useAuth();
  
  if (loading) {
    return <div className="loading">Loading...</div>;
  }
  
  if (user) {
    if (user.role === 'admin') {
      return <Navigate to="/admin" />;
    }
    return <Navigate to="/dashboard" />;
  }
  
  return children;
};

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/login" element={
            <PublicRoute>
              <Login />
            </PublicRoute>
          } />
          <Route path="/register" element={
            <PublicRoute>
              <Register />
            </PublicRoute>
          } />
          <Route path="/dashboard" element={
            <PrivateRoute>
              <StudentDashboard />
            </PrivateRoute>
          } />
          <Route path="/grades" element={
            <PrivateRoute>
              <GradeSelection />
            </PrivateRoute>
          } />
          <Route path="/subjects" element={
            <PrivateRoute>
              <SubjectSelection />
            </PrivateRoute>
          } />
          <Route path="/lesson/:subjectId" element={
            <PrivateRoute>
              <LessonView />
            </PrivateRoute>
          } />
          <Route path="/lesson/:subjectId/:lessonId" element={
            <PrivateRoute>
              <LessonDetail />
            </PrivateRoute>
          } />
          <Route path="/quiz/:lessonId" element={
            <PrivateRoute>
              <Quiz />
            </PrivateRoute>
          } />
          <Route path="/leaderboard" element={
            <PrivateRoute>
              <Leaderboard />
            </PrivateRoute>
          } />
          <Route path="/admin" element={
            <PrivateRoute adminOnly={true}>
              <AdminDashboard />
            </PrivateRoute>
          } />
          <Route path="/admin/analytics" element={
            <PrivateRoute adminOnly={true}>
              <AdminAnalytics />
            </PrivateRoute>
          } />
          <Route path="/admin/grades" element={
            <PrivateRoute adminOnly={true}>
              <AdminGradesManagement />
            </PrivateRoute>
          } />
          <Route path="/admin/lessons" element={
            <PrivateRoute adminOnly={true}>
              <AdminLessonsManagement />
            </PrivateRoute>
          } />
          <Route path="/admin/students" element={
            <PrivateRoute adminOnly={true}>
              <AdminStudentsManagement />
            </PrivateRoute>
          } />
          <Route path="/admin/quizzes" element={
            <PrivateRoute adminOnly={true}>
              <AdminQuizzesManagement />
            </PrivateRoute>
          } />
          <Route path="/admin/leaderboard" element={
            <PrivateRoute adminOnly={true}>
              <AdminLeaderboardManagement />
            </PrivateRoute>
          } />
          <Route path="/admin/reports" element={
            <PrivateRoute adminOnly={true}>
              <AdminReportsManagement />
            </PrivateRoute>
          } />
          <Route path="/admin/users" element={
            <PrivateRoute adminOnly={true}>
              <AdminUsersManagement />
            </PrivateRoute>
          } />
          <Route path="/admin/settings" element={
            <PrivateRoute adminOnly={true}>
              <AdminSettings />
            </PrivateRoute>
          } />
          <Route path="/admin/weekly-tests" element={
            <PrivateRoute adminOnly={true}>
              <AdminWeeklyTestsManagement />
            </PrivateRoute>
          } />
          <Route path="/" element={<Navigate to="/login" />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;

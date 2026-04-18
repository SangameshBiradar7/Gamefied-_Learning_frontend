import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
  BarChart, Bar, PieChart, Pie, LineChart, Line, AreaChart, Area, 
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell,
  ComposedChart
} from 'recharts';
import {
  Users, Trophy, TrendingUp, TrendingDown, AlertTriangle, BookOpen, Star,
  Flame, Activity, Target, Award, Calendar, Clock, GraduationCap, School,
  CheckCircle, XCircle, Zap, Gift, Medal, Crown, Rocket, Lightbulb
} from 'lucide-react';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

// Professional Icons as SVG components
const Icons = {
  Grade: () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M22 10v6M2 10l10-5 10 5-10 5z"/>
      <path d="M6 12v5c3 3 9 3 12 0v-5"/>
    </svg>
  ),
  Subject: () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/>
      <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/>
    </svg>
  ),
  Lesson: () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <polygon points="23 7 16 12 23 17 23 7"/>
      <rect x="1" y="5" width="15" height="14" rx="2" ry="2"/>
    </svg>
  ),
  Users: () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
      <circle cx="9" cy="7" r="4"/>
      <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
      <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
    </svg>
  ),
  Trophy: () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6"/>
      <path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18"/>
      <path d="M4 22h16"/>
      <path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22"/>
      <path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22"/>
      <path d="M18 2H6v7a6 6 0 0 0 12 0V2Z"/>
    </svg>
  ),
  Check: () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <polyline points="20 6 9 17 4 12"/>
    </svg>
  ),
  Cross: () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <line x1="18" y1="6" x2="6" y2="18"/>
      <line x1="6" y1="6" x2="18" y2="18"/>
    </svg>
  ),
  AlertTriangle: () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/>
      <path d="M12 9v4"/>
      <path d="M12 17h.01"/>
    </svg>
  ),
  Flame: () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.1.2-2.2.6-3.1.8 1.8 2.2 3.2 4 4z"/>
    </svg>
  ),
  Zap: () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/>
    </svg>
  ),
  School: () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4"/>
    </svg>
  ),
  BookOpen: () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/>
      <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/>
    </svg>
  ),
  Home: () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
      <polyline points="9 22 9 12 15 12 15 22"/>
    </svg>
  ),
  TrendingUp: () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/>
      <polyline points="17 6 23 6 23 12"/>
    </svg>
  ),
  TrendingDown: () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <polyline points="23 18 13.5 8.5 8.5 13.5 1 6"/>
      <polyline points="17 18 23 18 23 12"/>
    </svg>
  ),
  Calendar: () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
      <line x1="16" y1="2" x2="16" y2="6"/>
      <line x1="8" y1="2" x2="8" y2="6"/>
      <line x1="3" y1="10" x2="21" y2="10"/>
    </svg>
  ),
  Medal: () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M7.21 15 2.66 7.14a2 2 0 0 1 .13-2.2L4.4 2.8A2 2 0 0 1 6 2h12a2 2 0 0 1 1.6.8l1.6 2.14a2 2 0 0 1 .14 2.2L16.79 15"/>
      <path d="M11 12 5.12 2.2"/>
      <path d="m13 12 5.88-9.8"/>
      <path d="M8 7h8"/>
      <circle cx="12" cy="17" r="5"/>
      <path d="M12 18v-2h-.5"/>
    </svg>
  ),
  Crown: () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M2 12h20"/>
      <path d="M12 2l-2 5h4l-2 5"/>
      <path d="M12 22V12"/>
      <path d="m5 12-3 3 3 3"/>
      <path d="m19 12-3-3-3 3"/>
    </svg>
  ),
  Rocket: () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.84.7-2.13-.09-2.91a2.18 2.18 0 0 0-2.91-.09z"/>
      <path d="m12 15-3-3a22 22 0 0 1 2-3.95A12.88 12.88 0 0 1 22 2c0 2.72-.78 7.5-6 11a22.35 22.35 0 0 1-4 2z"/>
      <path d="M9 12l-1 1"/>
      <path d="M15 9l1 1"/>
    </svg>
  ),
  Lightbulb: () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M15 14l.5-1.5L15 11"/>
      <path d="M12 10c0-1.1.9-2 2-2s2 .9 2 2-.9 2-2 2-2-.9-2-2z"/>
      <path d="M9 5v.01"/>
      <path d="M15 5v.01"/>
      <path d="M12 2a7 7 0 0 0-7 7c0 2.38 1.19 4.47 3 5.74V17a1 1 0 1 0 2 0v-.74c1.81-1.27 3-3.36 3-5.74a7 7 0 0 0-7-7z"/>
    </svg>
  ),
  Star: () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
    </svg>
  ),
  BookOpen: () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/>
      <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/>
    </svg>
  ),
  BarChart2: () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <line x1="12" y1="20" x2="12" y2="10"/>
      <line x1="18" y1="20" x2="18" y2="4"/>
      <line x1="6" y1="20" x2="6" y2="16"/>
    </svg>
  ),
  PieChart: () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M21.21 15.89A10 10 0 1 1 8 2.83"/>
      <path d="M22 12A10 10 0 0 0 12 2v10z"/>
    </svg>
  ),
  Activity: () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/>
    </svg>
  ),
  Target: () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="12" cy="12" r="10"/>
      <circle cx="12" cy="12" r="6"/>
      <circle cx="12" cy="12" r="2"/>
    </svg>
  ),
  Award: () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="12" cy="8" r="6"/>
      <path d="M15.477 12.89 17 22l-5-3-5 3 1.523-9.11"/>
    </svg>
  ),
  Save: () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/>
      <polyline points="17 21 17 13 7 13 7 21"/>
      <polyline points="7 3 7 8 15 8"/>
    </svg>
  ),
  Dashboard: () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <rect x="3" y="3" width="7" height="7"/>
      <rect x="14" y="3" width="7" height="7"/>
      <rect x="14" y="14" width="7" height="7"/>
      <rect x="3" y="14" width="7" height="7"/>
    </svg>
  ),
  ChevronDown: () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <polyline points="6 9 12 15 18 9"/>
    </svg>
  ),
  ChevronRight: () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <polyline points="9 18 15 12 9 6"/>
    </svg>
  )
};

// ============ DUMMY DATA FOR TESTING ============
const DUMMY_DATA = {
  // Student Level Distribution
  levelDistribution: [
    { level: 'Beginner', count: 120, color: '#6B7280', icon: '🌱' },
    { level: 'Learner', count: 85, color: '#3B82F6', icon: '📚' },
    { level: 'Advanced', count: 40, color: '#8B5CF6', icon: '🚀' },
    { level: 'Expert', count: 15, color: '#EC4899', icon: '⭐' },
    { level: 'Master', count: 5, color: '#FFD700', icon: '👑' }
  ],

  // Level trend over last 7 days
  levelTrend: [
    { date: 'Apr 12', Beginner: 110, Learner: 75, Advanced: 35, Expert: 12, Master: 3 },
    { date: 'Apr 13', Beginner: 115, Learner: 78, Advanced: 37, Expert: 13, Master: 3 },
    { date: 'Apr 14', Beginner: 118, Learner: 82, Advanced: 38, Expert: 14, Master: 4 },
    { date: 'Apr 15', Beginner: 119, Learner: 83, Advanced: 39, Expert: 14, Master: 4 },
    { date: 'Apr 16', Beginner: 120, Learner: 85, Advanced: 40, Expert: 15, Master: 5 },
    { date: 'Apr 17', Beginner: 120, Learner: 85, Advanced: 40, Expert: 15, Master: 5 },
    { date: 'Apr 18', Beginner: 120, Learner: 85, Advanced: 40, Expert: 15, Master: 5 }
  ],

  // Top performing students
  topStudents: [
    { rank: 1, name: 'Rahul Sharma', points: 980, level: 'Expert', grade: 'Grade 10', streak: 45, lessons: 85, avatar: 'R' },
    { rank: 2, name: 'Priya Patel', points: 920, level: 'Advanced', grade: 'Grade 9', streak: 38, lessons: 72, avatar: 'P' },
    { rank: 3, name: 'Arjun Singh', points: 870, level: 'Advanced', grade: 'Grade 10', streak: 42, lessons: 68, avatar: 'A' },
    { rank: 4, name: 'Sneha Reddy', points: 850, level: 'Advanced', grade: 'Grade 9', streak: 35, lessons: 65, avatar: 'S' },
    { rank: 5, name: 'Vikash Kumar', points: 780, level: 'Learner', grade: 'Grade 8', streak: 28, lessons: 58, avatar: 'V' },
    { rank: 6, name: 'Kavya Menon', points: 760, level: 'Learner', grade: 'Grade 8', streak: 32, lessons: 55, avatar: 'K' },
    { rank: 7, name: 'Neha Gupta', points: 720, level: 'Learner', grade: 'Grade 7', streak: 25, lessons: 52, avatar: 'N' },
    { rank: 8, name: 'Rohit Das', points: 690, level: 'Beginner', grade: 'Grade 7', streak: 22, lessons: 48, avatar: 'R' },
    { rank: 9, name: 'Aisha Khan', points: 650, level: 'Beginner', grade: 'Grade 6', streak: 18, lessons: 45, avatar: 'A' },
    { rank: 10, name: 'Aditya Bose', points: 620, level: 'Beginner', grade: 'Grade 6', streak: 15, lessons: 42, avatar: 'A' }
  ],

  // Weak students needing attention
  weakStudents: {
    lowPerformers: [
      { name: 'Raju Kumar', points: 45, avgScore: 32, quizzes: 3, issue: 'Very low quiz scores' },
      { name: 'Babu Lal', points: 60, avgScore: 38, quizzes: 4, issue: 'Consistently failing' },
      { name: 'Laxmi Devi', points: 75, avgScore: 41, quizzes: 5, issue: 'Poor performance' },
      { name: 'Mohan Singh', points: 80, avgScore: 44, quizzes: 4, issue: 'Below average' },
      { name: 'Sita Yadav', points: 90, avgScore: 46, quizzes: 6, issue: 'Struggling with basics' }
    ],
    inactive: [
      { name: 'Rameshwar', daysInactive: 15, lastLogin: 'Apr 3', issue: 'No activity for 15 days' },
      { name: 'Geeta Rani', daysInactive: 12, lastLogin: 'Apr 6', issue: 'Absent for 2 weeks' },
      { name: 'Shyam Sundar', daysInactive: 10, lastLogin: 'Apr 8', issue: 'Inactive 10 days' },
      { name: 'Kamla Bai', daysInactive: 9, lastLogin: 'Apr 9', issue: 'Not logged in recently' }
    ],
    losingStreak: [
      { name: 'Pappu Singh', streak: 0, longest: 25, issue: 'Lost 25-day streak' },
      { name: 'Munni Devi', streak: 1, longest: 18, issue: 'Streak broken after 18 days' },
      { name: 'Chhotu Kumar', streak: 2, longest: 15, issue: 'Streak dropping' }
    ],
    failedQuizzes: [
      { name: 'Bhola Nath', failed: 5, total: 5, issue: 'Failed all 5 quizzes' },
      { name: 'Jhandu Lal', failed: 4, total: 6, issue: '67% failure rate' },
      { name: 'Rinki Devi', failed: 3, total: 5, issue: 'Failed 60% quizzes' }
    ]
  },

  // Grade-wise analytics
  gradeAnalytics: [
    { grade: 'Grade 6', students: 45, avgPoints: 320, avgStreak: 4.2, completionRate: 68 },
    { grade: 'Grade 7', students: 52, avgPoints: 380, avgStreak: 5.1, completionRate: 72 },
    { grade: 'Grade 8', students: 48, avgPoints: 450, avgStreak: 6.3, completionRate: 75 },
    { grade: 'Grade 9', students: 43, avgPoints: 520, avgStreak: 7.8, completionRate: 82 },
    { grade: 'Grade 10', students: 47, avgPoints: 610, avgStreak: 9.1, completionRate: 88 }
  ],

  // Subject-wise performance
  subjectPerformance: [
    { subject: 'Mathematics', avgScore: 78, completionRate: 85, students: 185 },
    { subject: 'Science', avgScore: 82, completionRate: 88, students: 178 },
    { subject: 'English', avgScore: 75, completionRate: 80, students: 172 },
    { subject: 'History', avgScore: 72, completionRate: 76, students: 165 },
    { subject: 'Geography', avgScore: 79, completionRate: 84, students: 180 }
  ],

  // Daily activity tracking (last 14 days)
  dailyActivity: [
    { date: 'Apr 5', active: 45, lessons: 120, quizzes: 85 },
    { date: 'Apr 6', active: 52, lessons: 145, quizzes: 98 },
    { date: 'Apr 7', active: 58, lessons: 168, quizzes: 112 },
    { date: 'Apr 8', active: 62, lessons: 189, quizzes: 134 },
    { date: 'Apr 9', active: 68, lessons: 210, quizzes: 156 },
    { date: 'Apr 10', active: 71, lessons: 230, quizzes: 175 },
    { date: 'Apr 11', active: 65, lessons: 195, quizzes: 142 },
    { date: 'Apr 12', active: 59, lessons: 170, quizzes: 118 },
    { date: 'Apr 13', active: 64, lessons: 185, quizzes: 130 },
    { date: 'Apr 14', active: 72, lessons: 225, quizzes: 168 },
    { date: 'Apr 15', active: 78, lessons: 255, quizzes: 195 },
    { date: 'Apr 16', active: 82, lessons: 280, quizzes: 218 },
    { date: 'Apr 17', active: 85, lessons: 305, quizzes: 240 },
    { date: 'Apr 18', active: 88, lessons: 330, quizzes: 265 }
  ],

  // Weekly engagement summary
  weeklyEngagement: [
    { week: 'Week 1', newStudents: 23, active: 156, completions: 450 },
    { week: 'Week 2', newStudents: 31, active: 189, completions: 580 },
    { week: 'Week 3', newStudents: 28, active: 175, completions: 520 },
    { week: 'Week 4', newStudents: 35, active: 210, completions: 680 }
  ],

  // School analytics
  schoolAnalytics: [
    { school: 'Govt High School', students: 58, avgPoints: 420, avgStreak: 5.8, topLevels: 12 },
    { school: 'Kendriya Vidyalaya', students: 62, avgPoints: 510, avgStreak: 7.2, topLevels: 18 },
    { school: 'Navodaya Vidyalaya', students: 45, avgPoints: 620, avgStreak: 9.5, topLevels: 22 },
    { school: 'City Public School', students: 55, avgPoints: 480, avgStreak: 6.8, topLevels: 15 },
    { school: 'DPS', students: 48, avgPoints: 550, avgStreak: 8.1, topLevels: 19 }
  ],

  // Village analytics
  villageAnalytics: [
    { village: 'Ram Nagar', students: 32, avgPoints: 380, avgStreak: 4.5 },
    { village: 'Gandhi Nagar', students: 28, avgPoints: 420, avgStreak: 5.2 },
    { village: 'Shivaji Nagar', students: 35, avgPoints: 350, avgStreak: 4.0 },
    { village: 'Ambedkar Nagar', students: 25, avgPoints: 480, avgStreak: 6.8 },
    { village: 'Subhash Nagar', students: 30, avgPoints: 410, avgStreak: 5.5 },
    { village: 'Nehru Nagar', students: 22, avgPoints: 520, avgStreak: 7.2 },
    { village: 'Patel Nagar', students: 27, avgPoints: 390, avgStreak: 4.8 },
    { village: 'Indira Nagar', students: 33, avgPoints: 450, avgStreak: 6.1 }
  ],

  // Quick stats
  overviewStats: {
    totalStudents: 265,
    activeToday: 88,
    activeThisWeek: 210,
    activeThisMonth: 245,
    avgPoints: 450,
    perfectStreaks: 23,
    lessonsCompletedToday: 330,
    quizzesTakenToday: 265,
    newToday: 12
  }
};

const AdminDashboard = () => {
  const { user, token, logout } = useAuth();
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const navigate = useNavigate();

  useEffect(() => {
    if (!user || user.role !== 'admin') {
      navigate('/login');
      return;
    }
    setLoading(false);
  }, [user]);

  // Calculate derived stats
  const totalStudents = DUMMY_DATA.overviewStats.totalStudents;
  const levelTotal = DUMMY_DATA.levelDistribution.reduce((sum, l) => sum + l.count, 0);

  return (
    <div className="admin-dashboard">
      {/* Header */}
      <header style={{ background: '#1F2937', padding: '15px 0', boxShadow: '0 2px 10px rgba(0,0,0,0.1)' }}>
        <div className="container" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
            <div style={{ width: '45px', height: '45px', background: 'linear-gradient(135deg, #667eea, #764ba2)', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Icons.Grade />
            </div>
            <div>
              <h1 style={{ color: 'white', fontSize: '1.5rem', margin: 0, fontWeight: '800' }}>LearnQuest Admin</h1>
              <p style={{ color: '#9CA3AF', margin: 0, fontSize: '0.875rem' }}>Analytics Dashboard</p>
            </div>
          </div>
          <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
            <Link 
              to="/dashboard" 
              style={{ 
                color: '#D1D5DB', 
                textDecoration: 'none', 
                padding: '10px 20px', 
                borderRadius: '8px',
                background: 'rgba(255,255,255,0.05)',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                transition: 'all 0.2s',
                fontWeight: '600'
              }}
              onMouseOver={(e) => { e.currentTarget.style.background = 'rgba(255,255,255,0.1)'; }}
              onMouseOut={(e) => { e.currentTarget.style.background = 'rgba(255,255,255,0.05)'; }}
            >
              <Icons.Home /> Student View
            </Link>
            <button 
              onClick={logout} 
              style={{ 
                background: 'linear-gradient(135deg, #EF4444, #DC2626)', 
                color: 'white', 
                border: 'none', 
                padding: '10px 24px', 
                borderRadius: '8px', 
                cursor: 'pointer',
                fontWeight: '600',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                transition: 'all 0.2s'
              }}
              onMouseOver={(e) => { e.currentTarget.style.transform = 'translateY(-2px)'; }}
              onMouseOut={(e) => { e.currentTarget.style.transform = 'translateY(0)'; }}
            >
              Logout
            </button>
            <div style={{ 
              width: '42px', 
              height: '42px', 
              borderRadius: '50%', 
              background: 'linear-gradient(135deg, #667eea, #764ba2)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'white',
              fontWeight: '700',
              fontSize: '1.1rem'
            }}>
              {user?.username?.charAt(0).toUpperCase()}
            </div>
          </div>
        </div>
      </header>

      <main className="container" style={{ padding: '30px 20px' }}>
        {/* Dashboard Header */}
        <div style={{ marginBottom: '30px' }}>
          <h1 style={{ fontSize: '2rem', fontWeight: '800', color: '#1F2937', marginBottom: '8px' }}>
            📊 Analytics Overview
          </h1>
          <p style={{ color: '#6B7280', fontSize: '1.1rem' }}>
            Complete student performance monitoring and insights
          </p>
        </div>

        {/* ============ 1. STUDENT LEVEL ANALYTICS ============ */}
        <section style={{ marginBottom: '40px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
            <div style={{ 
              width: '40px', 
              height: '40px', 
              borderRadius: '10px',
              background: 'linear-gradient(135deg, #667eea, #764ba2)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'white'
            }}>
              <Icons.TrendingUp />
            </div>
            <div>
              <h2 style={{ color: '#1F2937', margin: 0, fontSize: '1.5rem' }}>Student Level Analytics</h2>
              <p style={{ color: '#6B7280', margin: 0, fontSize: '0.9rem' }}>
                Distribution across all learning levels • Total: <strong>{levelTotal}</strong> students
              </p>
            </div>
          </div>

          {/* Level Cards */}
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', 
            gap: '15px',
            marginBottom: '30px'
          }}>
            {DUMMY_DATA.levelDistribution.map((level, idx) => (
              <div 
                key={level.level}
                style={{
                  background: 'white',
                  padding: '24px',
                  borderRadius: '16px',
                  boxShadow: '0 4px 15px rgba(0,0,0,0.08)',
                  border: `2px solid ${level.color}`,
                  textAlign: 'center',
                  transition: 'all 0.3s ease',
                  transform: 'translateY(0)'
                }}
                onMouseOver={(e) => { e.currentTarget.style.transform = 'translateY(-5px)'; e.currentTarget.style.boxShadow = '0 8px 25px rgba(0,0,0,0.12)'; }}
                onMouseOut={(e) => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 4px 15px rgba(0,0,0,0.08)'; }}
              >
                <div style={{ fontSize: '2.5rem', marginBottom: '10px', color: level.color }}>
                  {level.icon}
                </div>
                <h3 style={{ 
                  margin: '0 0 8px 0', 
                  color: '#1F2937', 
                  fontSize: '1.1rem',
                  fontWeight: '700'
                }}>
                  {level.level}
                </h3>
                <div style={{ 
                  fontSize: '2.5rem', 
                  fontWeight: '800',
                  color: level.color,
                  marginBottom: '5px'
                }}>
                  {level.count}
                </div>
                <p style={{ margin: 0, color: '#6B7280', fontSize: '0.9rem' }}>
                  students ({Math.round((level.count/levelTotal)*100)}%)
                </p>
              </div>
            ))}
          </div>

          {/* Charts Grid */}
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', 
            gap: '25px' 
          }}>
            {/* Bar Chart */}
            <div style={{ 
              background: 'white', 
              borderRadius: '16px', 
              padding: '25px',
              boxShadow: '0 4px 15px rgba(0,0,0,0.08)'
            }}>
              <h3 style={{ color: '#1F2937', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                <Icons.BarChart2 /> Student Distribution by Level
              </h3>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={DUMMY_DATA.levelDistribution}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                  <XAxis dataKey="level" stroke="#6B7280" fontSize={12} />
                  <YAxis stroke="#6B7280" fontSize={12} />
                  <Tooltip 
                    contentStyle={{
                      background: 'white',
                      border: '1px solid #E5E7EB',
                      borderRadius: '8px',
                      boxShadow: '0 4px 15px rgba(0,0,0,0.1)'
                    }}
                  />
                  <Legend />
                  <Bar 
                    dataKey="count" 
                    name="Students" 
                    fill="#4F46E5" 
                    radius={[12, 12, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Pie Chart */}
            <div style={{ 
              background: 'white', 
              borderRadius: '16px', 
              padding: '25px',
              boxShadow: '0 4px 15px rgba(0,0,0,0.08)'
            }}>
              <h3 style={{ color: '#1F2937', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                <Icons.PieChart /> Level Distribution Breakdown
              </h3>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={DUMMY_DATA.levelDistribution}
                    dataKey="count"
                    nameKey="level"
                    cx="50%"
                    cy="50%"
                    outerRadius={100}
                    innerRadius={60}
                    paddingAngle={3}
                    label={({ level, percent }) => `${level}: ${(percent * 100).toFixed(0)}%`}
                  >
                    {DUMMY_DATA.levelDistribution.map((entry, index) => (
                      <Cell key={index} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{
                      background: 'white',
                      border: '1px solid #E5E7EB',
                      borderRadius: '8px',
                      boxShadow: '0 4px 15px rgba(0,0,0,0.1)'
                    }}
                  />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Line Chart - Trend */}
          <div style={{ 
            background: 'white', 
            borderRadius: '16px', 
            padding: '25px',
            boxShadow: '0 4px 15px rgba(0,0,0,0.08)',
            marginTop: '25px'
          }}>
            <h3 style={{ color: '#1F2937', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '10px' }}>
              <Icons.Activity /> Level Growth Trend (Last 7 Days)
            </h3>
            <ResponsiveContainer width="100%" height={350}>
              <LineChart data={DUMMY_DATA.levelTrend}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                <XAxis dataKey="date" stroke="#6B7280" fontSize={12} />
                <YAxis stroke="#6B7280" fontSize={12} />
                <Tooltip 
                  contentStyle={{
                    background: 'white',
                    border: '1px solid #E5E7EB',
                    borderRadius: '8px',
                    boxShadow: '0 4px 15px rgba(0,0,0,0.1)'
                  }}
                />
                <Legend />
                <Line type="monotone" dataKey="Beginner" stroke="#6B7280" strokeWidth={3} dot={{ r: 5 }} />
                <Line type="monotone" dataKey="Learner" stroke="#3B82F6" strokeWidth={3} dot={{ r: 5 }} />
                <Line type="monotone" dataKey="Advanced" stroke="#8B5CF6" strokeWidth={3} dot={{ r: 5 }} />
                <Line type="monotone" dataKey="Expert" stroke="#EC4899" strokeWidth={3} dot={{ r: 5 }} />
                <Line type="monotone" dataKey="Master" stroke="#FFD700" strokeWidth={3} dot={{ r: 5 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </section>

        {/* ============ 2. TOP PERFORMING STUDENTS ============ */}
        <section style={{ marginBottom: '40px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
            <div style={{ 
              width: '40px', 
              height: '40px', 
              borderRadius: '10px',
              background: 'linear-gradient(135deg, #FFD700, #FFA500)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'white'
            }}>
              <Icons.Award />
            </div>
            <div>
              <h2 style={{ color: '#1F2937', margin: 0, fontSize: '1.5rem' }}>Top Performing Students</h2>
              <p style={{ color: '#6B7280', margin: 0, fontSize: '0.9rem' }}>
                Highest points, longest streaks, most active learners
              </p>
            </div>
          </div>

          {/* Top Performers Grid */}
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', 
            gap: '20px',
            marginBottom: '30px'
          }}>
            {/* Highest Points */}
            <div style={{ background: 'white', borderRadius: '16px', padding: '25px', boxShadow: '0 4px 15px rgba(0,0,0,0.08)' }}>
              <h3 style={{ color: '#1F2937', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '10px', fontSize: '1.1rem' }}>
                <span>🏆</span> Highest Points
              </h3>
              <div style={{ spaceY: '12px' }}>
                {DUMMY_DATA.topStudents.slice(0, 5).map((student) => (
                  <div 
                    key={student.rank}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '12px',
                      padding: '12px',
                      borderRadius: '10px',
                      background: student.rank <= 3 ? 
                        (student.rank === 1 ? '#FEF3C7' : 
                         student.rank === 2 ? '#F3F4F6' : '#FEFCE8') 
                        : 'white',
                      marginBottom: '8px',
                      border: student.rank === 1 ? '2px solid #FFD700' : '1px solid #E5E7EB',
                      transition: 'all 0.2s'
                    }}
                    onMouseOver={(e) => { e.currentTarget.style.transform = 'translateX(5px)'; }}
                  >
                    <div style={{
                      width: '36px',
                      height: '36px',
                      borderRadius: '50%',
                      background: student.rank === 1 ? 'linear-gradient(135deg, #FFD700, #FFA500)' :
                                 student.rank === 2 ? 'linear-gradient(135deg, #C0C0C0, #A0A0A0)' :
                                 student.rank === 3 ? 'linear-gradient(135deg, #CD7F32, #8B4513)' : '#E5E7EB',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: student.rank <= 3 ? 'white' : '#6B7280',
                      fontWeight: 'bold',
                      fontSize: '0.9rem'
                    }}>
                      {student.rank}
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: '700', color: '#1F2937', fontSize: '0.95rem' }}>{student.name}</div>
                      <div style={{ fontSize: '0.8rem', color: '#6B7280' }}>{student.grade} • {student.level}</div>
                    </div>
                    <div style={{ 
                      fontWeight: '800', 
                      fontSize: '1.2rem', 
                      color: '#F59E0B',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px'
                    }}>
                      ⭐ {student.points}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Longest Streaks */}
            <div style={{ background: 'white', borderRadius: '16px', padding: '25px', boxShadow: '0 4px 15px rgba(0,0,0,0.08)' }}>
              <h3 style={{ color: '#1F2937', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '10px', fontSize: '1.1rem' }}>
                <Icons.Flame /> Longest Streaks
              </h3>
              <div style={{ spaceY: '12px' }}>
                {DUMMY_DATA.topStudents
                  .sort((a, b) => b.streak - a.streak)
                  .slice(0, 5)
                  .map((student, idx) => (
                  <div 
                    key={idx}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '12px',
                      padding: '12px',
                      borderRadius: '10px',
                      background: '#FEF3C7',
                      border: '1px solid #F59E0B',
                      marginBottom: '8px'
                    }}
                  >
                    <div style={{
                      width: '36px',
                      height: '36px',
                      borderRadius: '50%',
                      background: 'linear-gradient(135deg, #FF6B00, #FFD700)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: 'white',
                      fontWeight: 'bold',
                      fontSize: '0.9rem'
                    }}>
                      🔥
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: '700', color: '#1F2937', fontSize: '0.95rem' }}>{student.name}</div>
                      <div style={{ fontSize: '0.8rem', color: '#6B7280' }}>{student.lessons} lessons completed</div>
                    </div>
                    <div style={{ 
                      fontWeight: '800', 
                      fontSize: '1.2rem', 
                      color: '#F97316'
                    }}>
                      {student.streak} days
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Most Active */}
            <div style={{ background: 'white', borderRadius: '16px', padding: '25px', boxShadow: '0 4px 15px rgba(0,0,0,0.08)' }}>
              <h3 style={{ color: '#1F2937', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '10px', fontSize: '1.1rem' }}>
                <Icons.Activity /> Most Active
              </h3>
              <div style={{ spaceY: '12px' }}>
                {DUMMY_DATA.topStudents
                  .sort((a, b) => b.lessons - a.lessons)
                  .slice(0, 5)
                  .map((student, idx) => (
                  <div 
                    key={idx}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '12px',
                      padding: '12px',
                      borderRadius: '10px',
                      background: '#ECFDF5',
                      border: '1px solid #10B981',
                      marginBottom: '8px'
                    }}
                  >
                    <div style={{
                      width: '36px',
                      height: '36px',
                      borderRadius: '50%',
                      background: 'linear-gradient(135deg, #10B981, #059669)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: 'white',
                      fontWeight: 'bold',
                      fontSize: '0.9rem'
                    }}>
                      📚
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: '700', color: '#1F2937', fontSize: '0.95rem' }}>{student.name}</div>
                      <div style={{ fontSize: '0.8rem', color: '#6B7280' }}>{student.points} total points</div>
                    </div>
                    <div style={{ 
                      fontWeight: '800', 
                      fontSize: '1.2rem', 
                      color: '#10B981'
                    }}>
                      {student.lessons} lessons
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* ============ 3. WEAK STUDENTS / NEED ATTENTION ============ */}
        <section style={{ marginBottom: '40px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
            <div style={{ 
              width: '40px', 
              height: '40px', 
              borderRadius: '10px',
              background: 'linear-gradient(135deg, #EF4444, #DC2626)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'white'
            }}>
              <Icons.AlertTriangle />
            </div>
            <div>
              <h2 style={{ color: '#1F2937', margin: 0, fontSize: '1.5rem' }}>Students Need Attention</h2>
              <p style={{ color: '#6B7280', margin: 0, fontSize: '0.9rem' }}>
                Identify and help struggling students immediately
              </p>
            </div>
          </div>

          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', 
            gap: '20px' 
          }}>
            {/* Low Performers Alert */}
            <div style={{ background: '#FEF2F2', borderRadius: '16px', padding: '25px', border: '2px solid #EF4444' }}>
              <h3 style={{ color: '#DC2626', marginBottom: '15px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                <Icons.TrendingDown size={20} /> Low Performers ({'<50% avg'})
              </h3>
              <div style={{ marginBottom: '15px' }}>
                <div style={{ fontSize: '3rem', fontWeight: '800', color: '#DC2626', marginBottom: '5px' }}>
                  {DUMMY_DATA.weakStudents.lowPerformers.length}
                </div>
                <p style={{ color: '#6B7280', fontSize: '0.875rem', margin: 0 }}>students scoring below 50%</p>
              </div>
              <div style={{ maxHeight: '250px', overflowY: 'auto' }}>
                {DUMMY_DATA.weakStudents.lowPerformers.map((student, idx) => (
                  <div key={idx} style={{
                    background: 'white',
                    padding: '12px',
                    borderRadius: '8px',
                    marginBottom: '8px',
                    borderLeft: '4px solid #EF4444'
                  }}>
                    <div style={{ fontWeight: '700', color: '#1F2937', fontSize: '0.9rem' }}>{student.name}</div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', color: '#6B7280', marginTop: '4px' }}>
                      <span>Avg: <strong style={{ color: '#DC2626' }}>{student.avgScore}%</strong></span>
                      <span>{student.quizzes} quizzes</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Inactive Students */}
            <div style={{ background: '#FFFBEB', borderRadius: '16px', padding: '25px', border: '2px solid #F59E0B' }}>
              <h3 style={{ color: '#D97706', marginBottom: '15px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                <Icons.Clock size={20} /> Inactive Students
              </h3>
              <div style={{ marginBottom: '15px' }}>
                <div style={{ fontSize: '3rem', fontWeight: '800', color: '#D97706', marginBottom: '5px' }}>
                  {DUMMY_DATA.weakStudents.inactive.length}
                </div>
                <p style={{ color: '#6B7280', fontSize: '0.875rem', margin: 0 }}>no login for 7+ days</p>
              </div>
              <div style={{ maxHeight: '250px', overflowY: 'auto' }}>
                {DUMMY_DATA.weakStudents.inactive.map((student, idx) => (
                  <div key={idx} style={{
                    background: 'white',
                    padding: '12px',
                    borderRadius: '8px',
                    marginBottom: '8px',
                    borderLeft: '4px solid #F59E0B'
                  }}>
                    <div style={{ fontWeight: '700', color: '#1F2937', fontSize: '0.9rem' }}>{student.name}</div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', color: '#6B7280', marginTop: '4px' }}>
                      <span>Last: {student.lastLogin}</span>
                      <span><strong style={{ color: '#D97706' }}>{student.daysInactive} days</strong></span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Losing Streaks */}
            <div style={{ background: '#F3E8FF', borderRadius: '16px', padding: '25px', border: '2px solid #8B5CF6' }}>
              <h3 style={{ color: '#7C3AED', marginBottom: '15px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                <Icons.Flame size={20} /> Losing Streaks
              </h3>
              <div style={{ marginBottom: '15px' }}>
                <div style={{ fontSize: '3rem', fontWeight: '800', color: '#7C3AED', marginBottom: '5px' }}>
                  {DUMMY_DATA.weakStudents.losingStreak.length}
                </div>
                <p style={{ color: '#6B7280', fontSize: '0.875rem', margin: 0 }}>broken long streaks</p>
              </div>
              <div style={{ maxHeight: '250px', overflowY: 'auto' }}>
                {DUMMY_DATA.weakStudents.losingStreak.map((student, idx) => (
                  <div key={idx} style={{
                    background: 'white',
                    padding: '12px',
                    borderRadius: '8px',
                    marginBottom: '8px',
                    borderLeft: '4px solid #8B5CF6'
                  }}>
                    <div style={{ fontWeight: '700', color: '#1F2937', fontSize: '0.9rem' }}>{student.name}</div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', color: '#6B7280', marginTop: '4px' }}>
                      <span>Peak: {student.longest} days</span>
                      <span>Now: <strong style={{ color: '#7C3AED' }}>{student.streak} days</strong></span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Failed Quizzes */}
            <div style={{ background: '#FCE7F3', borderRadius: '16px', padding: '25px', border: '2px solid #EC4899' }}>
              <h3 style={{ color: '#DB2777', marginBottom: '15px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                <Icons.XCircle size={20} /> Failed Quizzes
              </h3>
              <div style={{ marginBottom: '15px' }}>
                <div style={{ fontSize: '3rem', fontWeight: '800', color: '#DB2777', marginBottom: '5px' }}>
                  {DUMMY_DATA.weakStudents.failedQuizzes.length}
                </div>
                <p style={{ color: '#6B7280', fontSize: '0.875rem', margin: 0 }}>students with multiple failures</p>
              </div>
              <div style={{ maxHeight: '250px', overflowY: 'auto' }}>
                {DUMMY_DATA.weakStudents.failedQuizzes.map((student, idx) => (
                  <div key={idx} style={{
                    background: 'white',
                    padding: '12px',
                    borderRadius: '8px',
                    marginBottom: '8px',
                    borderLeft: '4px solid #EC4899'
                  }}>
                    <div style={{ fontWeight: '700', color: '#1F2937', fontSize: '0.9rem' }}>{student.name}</div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', color: '#6B7280', marginTop: '4px' }}>
                      <span>{student.failed} failed / {student.total} total</span>
                      <span><strong style={{ color: '#DB2777' }}>{Math.round(student.failed/student.total*100)}% fail rate</strong></span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* ============ 4. GRADE-WISE ANALYTICS ============ */}
        <section style={{ marginBottom: '40px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
            <div style={{ 
              width: '40px', 
              height: '40px', 
              borderRadius: '10px',
              background: 'linear-gradient(135deg, #3B82F6, #1E40AF)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'white'
            }}>
              <Icons.GraduationCap />
            </div>
            <div>
              <h2 style={{ color: '#1F2937', margin: 0, fontSize: '1.5rem' }}>Grade-wise Student Analytics</h2>
              <p style={{ color: '#6B7280', margin: 0, fontSize: '0.9rem' }}>
                Performance metrics across all grades
              </p>
            </div>
          </div>

          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fit, minmax(450px, 1fr))', 
            gap: '25px' 
          }}>
            {/* Bar Chart - Students per Grade */}
            <div style={{ background: 'white', borderRadius: '16px', padding: '25px', boxShadow: '0 4px 15px rgba(0,0,0,0.08)' }}>
              <h3 style={{ color: '#1F2937', marginBottom: '20px', fontSize: '1.1rem' }}>
                Students per Grade
              </h3>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={DUMMY_DATA.gradeAnalytics}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                  <XAxis dataKey="grade" stroke="#6B7280" fontSize={12} />
                  <YAxis stroke="#6B7280" fontSize={12} />
                  <Tooltip 
                    contentStyle={{
                      background: 'white',
                      border: '1px solid #E5E7EB',
                      borderRadius: '8px',
                      boxShadow: '0 4px 15px rgba(0,0,0,0.1)'
                    }}
                  />
                  <Legend />
                  <Bar dataKey="students" name="Students" fill="#3B82F6" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Donut Chart - Completion Rate */}
            <div style={{ background: 'white', borderRadius: '16px', padding: '25px', boxShadow: '0 4px 15px rgba(0,0,0,0.08)' }}>
              <h3 style={{ color: '#1F2937', marginBottom: '20px', fontSize: '1.1rem' }}>
                Completion Rate by Grade
              </h3>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={DUMMY_DATA.gradeAnalytics}
                    dataKey="students"
                    nameKey="grade"
                    cx="50%"
                    cy="50%"
                    outerRadius={100}
                    innerRadius={60}
                    paddingAngle={2}
                    label={({ grade, percent }) => `${grade}: ${(percent * 100).toFixed(0)}%`}
                  >
                    {DUMMY_DATA.gradeAnalytics.map((entry, index) => {
                      const colors = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6'];
                      return <Cell key={index} fill={colors[index % colors.length]} />;
                    })}
                  </Pie>
                  <Tooltip 
                    contentStyle={{
                      background: 'white',
                      border: '1px solid #E5E7EB',
                      borderRadius: '8px',
                      boxShadow: '0 4px 15px rgba(0,0,0,0.1)'
                    }}
                  />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Grade Stats Cards */}
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', 
            gap: '15px',
            marginTop: '25px'
          }}>
            {DUMMY_DATA.gradeAnalytics.map((grade, idx) => (
              <div 
                key={grade.grade}
                style={{
                  background: 'white',
                  padding: '20px',
                  borderRadius: '12px',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
                  borderTop: `4px solid ${['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6'][idx]}`
                }}
              >
                <div style={{ color: '#6B7280', fontSize: '0.875rem', fontWeight: '600', marginBottom: '5px' }}>
                  {grade.grade}
                </div>
                <div style={{ fontSize: '2rem', fontWeight: '800', color: '#1F2937', marginBottom: '10px' }}>
                  {grade.students}
                </div>
                <div style={{ display: 'flex', gap: '15px', fontSize: '0.8rem' }}>
                  <span style={{ color: '#6B7280' }}>
                    ⭐ {grade.avgPoints} pts
                  </span>
                  <span style={{ color: '#6B7280' }}>
                    🔥 {grade.avgStreak}d
                  </span>
                </div>
                <div style={{ marginTop: '10px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', marginBottom: '4px' }}>
                    <span>Completion</span>
                    <span style={{ fontWeight: '700', color: '#10B981' }}>{grade.completionRate}%</span>
                  </div>
                  <div style={{ height: '6px', background: '#E5E7EB', borderRadius: '3px', overflow: 'hidden' }}>
                    <div style={{ 
                      height: '100%', 
                      width: `${grade.completionRate}%`, 
                      background: 'linear-gradient(90deg, #10B981, #059669)',
                      borderRadius: '3px'
                    }}></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ============ 5. SUBJECT-WISE PERFORMANCE ============ */}
        <section style={{ marginBottom: '40px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
            <div style={{ 
              width: '40px', 
              height: '40px', 
              borderRadius: '10px',
              background: 'linear-gradient(135deg, #8B5CF6, #7C3AED)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'white'
            }}>
              <Icons.BookOpen />
            </div>
            <div>
              <h2 style={{ color: '#1F2937', margin: 0, fontSize: '1.5rem' }}>Subject-wise Performance</h2>
              <p style={{ color: '#6B7280', margin: 0, fontSize: '0.9rem' }}>
                Average scores and completion rates by subject
              </p>
            </div>
          </div>

          <div style={{ background: 'white', borderRadius: '16px', padding: '25px', boxShadow: '0 4px 15px rgba(0,0,0,0.08)' }}>
            <ResponsiveContainer width="100%" height={350}>
              <BarChart data={DUMMY_DATA.subjectPerformance}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                <XAxis dataKey="subject" stroke="#6B7280" fontSize={12} />
                <YAxis stroke="#6B7280" fontSize={12} yAxisId="left" />
                <YAxis stroke="#6B7280" fontSize={12} orientation="right" yAxisId="right" />
                <Tooltip 
                  contentStyle={{
                    background: 'white',
                    border: '1px solid #E5E7EB',
                    borderRadius: '8px',
                    boxShadow: '0 4px 15px rgba(0,0,0,0.1)'
                  }}
                />
                <Legend />
                <Bar yAxisId="left" dataKey="avgScore" name="Avg Score %" fill="#3B82F6" radius={[8, 8, 0, 0]} />
                <Bar yAxisId="right" dataKey="completionRate" name="Completion %" fill="#10B981" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Subject Cards */}
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', 
            gap: '15px',
            marginTop: '20px'
          }}>
            {DUMMY_DATA.subjectPerformance.map((subject, idx) => (
              <div key={subject.subject} style={{
                background: 'white',
                padding: '20px',
                borderRadius: '12px',
                boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
                textAlign: 'center',
                borderTop: `4px solid ${['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6'][idx]}`
              }}>
                <div style={{ fontSize: '1.8rem', marginBottom: '8px' }}>
                  {['🧮', '🔬', '📖', '📜', '🌍'][idx]}
                </div>
                <h4 style={{ margin: '0 0 10px 0', color: '#1F2937', fontSize: '1rem' }}>{subject.subject}</h4>
                <div style={{ fontSize: '2rem', fontWeight: '800', color: '#1F2937', marginBottom: '5px' }}>
                  {subject.avgScore}%
                </div>
                <div style={{ 
                  height: '8px', 
                  background: '#E5E7EB', 
                  borderRadius: '4px', 
                  overflow: 'hidden',
                  marginTop: '8px'
                }}>
                  <div style={{ 
                    height: '100%', 
                    width: `${subject.avgScore}%`, 
                    background: subject.avgScore >= 80 ? '#10B981' : subject.avgScore >= 70 ? '#3B82F6' : '#F59E0B',
                    borderRadius: '4px'
                  }}></div>
                </div>
                <p style={{ fontSize: '0.8rem', color: '#6B7280', marginTop: '8px', margin: 0 }}>
                  {subject.students} students • {subject.completionRate}% completion
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* ============ 6. DAILY/WEEKLY ACTIVITY ============ */}
        <section style={{ marginBottom: '40px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
            <div style={{ 
              width: '40px', 
              height: '40px', 
              borderRadius: '10px',
              background: 'linear-gradient(135deg, #10B981, #059669)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'white'
            }}>
              <Icons.Calendar />
            </div>
            <div>
              <h2 style={{ color: '#1F2937', margin: 0, fontSize: '1.5rem' }}>Daily Activity Tracking</h2>
              <p style={{ color: '#6B7280', margin: 0, fontSize: '0.9rem' }}>
                Student engagement metrics over time
              </p>
            </div>
          </div>

          {/* Activity Stats */}
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', 
            gap: '15px',
            marginBottom: '25px'
          }}>
            {[
              { label: 'Active Today', value: DUMMY_DATA.overviewStats.activeToday, icon: Icons.Users, color: '#3B82F6' },
              { label: 'Active This Week', value: DUMMY_DATA.overviewStats.activeThisWeek, icon: Icons.Activity, color: '#10B981' },
              { label: 'Active This Month', value: DUMMY_DATA.overviewStats.activeThisMonth, icon: Icons.Calendar, color: '#F59E0B' },
              { label: 'Lessons Today', value: DUMMY_DATA.overviewStats.lessonsCompletedToday, icon: Icons.BookOpen, color: '#8B5CF6' },
              { label: 'Quizzes Today', value: DUMMY_DATA.overviewStats.quizzesTakenToday, icon: Icons.Target, color: '#EC4899' },
              { label: 'New Today', value: DUMMY_DATA.overviewStats.newToday, icon: Icons.Gift, color: '#EF4444' }
            ].map((stat, idx) => (
              <div 
                key={stat.label}
                style={{
                  background: 'white',
                  padding: '20px',
                  borderRadius: '12px',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '15px'
                }}
              >
                <div style={{
                  width: '50px',
                  height: '50px',
                  borderRadius: '12px',
                  background: `${stat.color}20`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: stat.color
                }}>
                  <stat.icon />
                </div>
                <div>
                  <div style={{ fontSize: '0.875rem', color: '#6B7280', fontWeight: '600' }}>{stat.label}</div>
                  <div style={{ fontSize: '1.8rem', fontWeight: '800', color: '#1F2937' }}>
                    {stat.value.toLocaleString()}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Activity Area Chart */}
          <div style={{ background: 'white', borderRadius: '16px', padding: '25px', boxShadow: '0 4px 15px rgba(0,0,0,0.08)' }}>
            <h3 style={{ color: '#1F2937', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '10px' }}>
              <Icons.Activity /> Daily Activity Trends (Last 14 Days)
            </h3>
            <ResponsiveContainer width="100%" height={350}>
              <AreaChart data={DUMMY_DATA.dailyActivity}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                <XAxis dataKey="date" stroke="#6B7280" fontSize={12} />
                <YAxis stroke="#6B7280" fontSize={12} />
                <Tooltip 
                  contentStyle={{
                    background: 'white',
                    border: '1px solid #E5E7EB',
                    borderRadius: '8px',
                    boxShadow: '0 4px 15px rgba(0,0,0,0.1)'
                  }}
                />
                <Legend />
                <Area type="monotone" dataKey="active" name="Active Students" stroke="#3B82F6" fill="#3B82F6" fillOpacity={0.3} strokeWidth={3} />
                <Area type="monotone" dataKey="lessons" name="Lessons Completed" stroke="#10B981" fill="#10B981" fillOpacity={0.3} strokeWidth={3} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </section>

        {/* ============ 7. LEADERBOARD ANALYTICS ============ */}
        <section style={{ marginBottom: '40px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
            <div style={{ 
              width: '40px', 
              height: '40px', 
              borderRadius: '10px',
              background: 'linear-gradient(135deg, #F59E0B, #D97706)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'white'
            }}>
              <Icons.Trophy />
            </div>
            <div>
              <h2 style={{ color: '#1F2937', margin: 0, fontSize: '1.5rem' }}>Location & Leaderboard Analytics</h2>
              <p style={{ color: '#6B7280', margin: 0, fontSize: '0.9rem' }}>
                Top performing schools and villages
              </p>
            </div>
          </div>

          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fit, minmax(450px, 1fr))', 
            gap: '25px' 
          }}>
            {/* Top Schools */}
            <div style={{ background: 'white', borderRadius: '16px', padding: '25px', boxShadow: '0 4px 15px rgba(0,0,0,0.08)' }}>
              <h3 style={{ color: '#1F2937', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                <Icons.School /> Top Performing Schools
              </h3>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={DUMMY_DATA.schoolAnalytics} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                  <XAxis type="number" stroke="#6B7280" fontSize={12} />
                  <YAxis dataKey="school" type="category" width={140} stroke="#6B7280" fontSize={11} />
                  <Tooltip 
                    contentStyle={{
                      background: 'white',
                      border: '1px solid #E5E7EB',
                      borderRadius: '8px',
                      boxShadow: '0 4px 15px rgba(0,0,0,0.1)'
                    }}
                  />
                  <Legend />
                  <Bar dataKey="avgPoints" name="Avg Points" fill="#8B5CF6" radius={[0, 8, 8, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Top Villages */}
            <div style={{ background: 'white', borderRadius: '16px', padding: '25px', boxShadow: '0 4px 15px rgba(0,0,0,0.08)' }}>
              <h3 style={{ color: '#1F2937', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                <Icons.Home /> Top Villages
              </h3>
              <ResponsiveContainer width="100%" height={300}>
                <ComposedChart data={DUMMY_DATA.villageAnalytics}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                  <XAxis dataKey="village" stroke="#6B7280" fontSize={10} interval={0} angle={-45} textAnchor="end" height={80} />
                  <YAxis stroke="#6B7280" fontSize={12} />
                  <Tooltip 
                    contentStyle={{
                      background: 'white',
                      border: '1px solid #E5E7EB',
                      borderRadius: '8px',
                      boxShadow: '0 4px 15px rgba(0,0,0,0.1)'
                    }}
                  />
                  <Legend />
                  <Bar dataKey="students" name="Students" fill="#3B82F6" radius={[8, 8, 0, 0]} />
                  <Line type="monotone" dataKey="avgPoints" name="Avg Points" stroke="#F59E0B" strokeWidth={3} />
                </ComposedChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* School & Village Cards */}
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', 
            gap: '15px',
            marginTop: '20px'
          }}>
            {DUMMY_DATA.schoolAnalytics.map((school, idx) => (
              <div key={school.school} style={{
                background: 'white',
                padding: '20px',
                borderRadius: '12px',
                boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
                borderLeft: `4px solid ${['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6'][idx]}`
              }}>
                <h4 style={{ margin: '0 0 10px 0', color: '#1F2937', fontSize: '1rem', fontWeight: '700' }}>
                  🏫 {school.school}
                </h4>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', fontSize: '0.875rem' }}>
                  <div>
                    <span style={{ color: '#6B7280' }}>Students:</span>
                    <div style={{ fontWeight: '800', fontSize: '1.2rem', color: '#1F2937' }}>{school.students}</div>
                  </div>
                  <div>
                    <span style={{ color: '#6B7280' }}>Avg Points:</span>
                    <div style={{ fontWeight: '800', fontSize: '1.2rem', color: '#3B82F6' }}>{school.avgPoints}</div>
                  </div>
                  <div>
                    <span style={{ color: '#6B7280' }}>Avg Streak:</span>
                    <div style={{ fontWeight: '800', fontSize: '1.2rem', color: '#F97316' }}>{school.avgStreak}🔥</div>
                  </div>
                  <div>
                    <span style={{ color: '#6B7280' }}>Top Levels:</span>
                    <div style={{ fontWeight: '800', fontSize: '1.2rem', color: '#8B5CF6' }}>{school.topLevels}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ============ QUICK ACTIONS ============ */}
        <section style={{ marginBottom: '40px' }}>
          <div style={{ 
            background: 'linear-gradient(135deg, #667eea, #764ba2)', 
            borderRadius: '20px', 
            padding: '40px',
            color: 'white',
            boxShadow: '0 10px 40px rgba(102, 126, 234, 0.3)'
          }}>
            <h2 style={{ margin: '0 0 15px 0', fontSize: '1.75rem', fontWeight: '800' }}>
              🎯 Quick Actions for Student Guidance
            </h2>
            <p style={{ margin: '0 0 30px 0', opacity: 0.9, fontSize: '1.1rem' }}>
              Take immediate action to help students and improve learning outcomes
            </p>
            <div style={{ 
              display: 'grid', 
              gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', 
              gap: '15px' 
            }}>
              <button style={{
                padding: '20px',
                background: 'rgba(255,255,255,0.15)',
                border: '2px solid rgba(255,255,255,0.3)',
                borderRadius: '12px',
                color: 'white',
                cursor: 'pointer',
                textAlign: 'left',
                backdropFilter: 'blur(10px)',
                transition: 'all 0.3s'
              }}>
                <div style={{ fontSize: '2rem', marginBottom: '8px' }}>💬</div>
                <div style={{ fontWeight: '700', fontSize: '1.1rem', marginBottom: '5px' }}>Send Encouragement</div>
                <div style={{ fontSize: '0.9rem', opacity: 0.9 }}>Message struggling students with motivational notes</div>
              </button>
              <button style={{
                padding: '20px',
                background: 'rgba(255,255,255,0.15)',
                border: '2px solid rgba(255,255,255,0.3)',
                borderRadius: '12px',
                color: 'white',
                cursor: 'pointer',
                textAlign: 'left',
                backdropFilter: 'blur(10px)',
                transition: 'all 0.3s'
              }}>
                <div style={{ fontSize: '2rem', marginBottom: '8px' }}>📊</div>
                <div style={{ fontWeight: '700', fontSize: '1.1rem', marginBottom: '5px' }}>View Detailed Reports</div>
                <div style={{ fontSize: '0.9rem', opacity: 0.9 }}>Deep dive into individual student progress</div>
              </button>
              <button style={{
                padding: '20px',
                background: 'rgba(255,255,255,0.15)',
                border: '2px solid rgba(255,255,255,0.3)',
                borderRadius: '12px',
                color: 'white',
                cursor: 'pointer',
                textAlign: 'left',
                backdropFilter: 'blur(10px)',
                transition: 'all 0.3s'
              }}>
                <div style={{ fontSize: '2rem', marginBottom: '8px' }}>🎯</div>
                <div style={{ fontWeight: '700', fontSize: '1.1rem', marginBottom: '5px' }}>Assign Remedial Work</div>
                <div style={{ fontSize: '0.9rem', opacity: 0.9 }}>Create custom assignments for weak students</div>
              </button>
              <button style={{
                padding: '20px',
                background: 'rgba(255,255,255,0.15)',
                border: '2px solid rgba(255,255,255,0.3)',
                borderRadius: '12px',
                color: 'white',
                cursor: 'pointer',
                textAlign: 'left',
                backdropFilter: 'blur(10px)',
                transition: 'all 0.3s'
              }}>
                <div style={{ fontSize: '2rem', marginBottom: '8px' }}>🏆</div>
                <div style={{ fontWeight: '700', fontSize: '1.1rem', marginBottom: '5px' }}>Challenge Top Students</div>
                <div style={{ fontSize: '0.9rem', opacity: 0.9 }}>Send advanced content to high achievers</div>
              </button>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
};

export default AdminDashboard;
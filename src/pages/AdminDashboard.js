import React, { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  BarChart, Bar, PieChart, Pie, LineChart, Line, AreaChart, Area,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell
} from 'recharts';
import {
  LayoutDashboard, BarChart3, Users, BookOpen, Trophy, Target,
  FileText, Settings, GraduationCap, ChevronRight, Menu, X, Shield
} from 'lucide-react';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899'];

const AdminDashboard = () => {
  const { user, token, logout, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [dataLoaded, setDataLoaded] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const [overview, setOverview] = useState(null);
  const [levelDistribution, setLevelDistribution] = useState([]);
  const [levelTrend, setLevelTrend] = useState([]);
  const [topStudents, setTopStudents] = useState([]);
  const [topStreaks, setTopStreaks] = useState([]);
  const [mostActive, setMostActive] = useState([]);
  const [gradePerformance, setGradePerformance] = useState([]);
  const [dailyActivity, setDailyActivity] = useState([]);
  const [attentionNeeded, setAttentionNeeded] = useState(null);
  const [villageAnalytics, setVillageAnalytics] = useState([]);
  const [schoolAnalytics, setSchoolAnalytics] = useState([]);

  const adminNavItems = [
    { path: '/admin', icon: <LayoutDashboard size={16} />, label: 'Dashboard', exact: true },
    { path: '/admin/analytics', icon: <BarChart3 size={16} />, label: 'Analytics' },
    { path: '/admin/grades', icon: <GraduationCap size={16} />, label: 'Grades' },
    { path: '/admin/lessons', icon: <BookOpen size={16} />, label: 'Lessons' },
    { path: '/admin/students', icon: <Users size={16} />, label: 'Students' },
    { path: '/admin/weekly-tests', icon: <Target size={16} />, label: 'Weekly Tests' },
    { path: '/admin/quizzes', icon: <Trophy size={16} />, label: 'Quizzes' },
    { path: '/admin/leaderboard', icon: <BarChart3 size={16} />, label: 'Leaderboard' },
    { path: '/admin/reports', icon: <FileText size={16} />, label: 'Reports' },
    { path: '/admin/users', icon: <Shield size={16} />, label: 'Admin Users' },
    { path: '/admin/settings', icon: <Settings size={16} />, label: 'Settings' }
  ];

  const isActivePath = (path, exact) => {
    if (exact) {
      return location.pathname === path;
    }
    return location.pathname.startsWith(path);
  };

  const fetchWithAuth = useCallback(async (endpoint, options = {}) => {
    const response = await fetch(`${API_URL}${endpoint}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
        ...options.headers
      }
    });
    if (!response.ok) {
      const errorText = await response.text();
      console.error('API Error:', response.status, errorText);
      throw new Error(`HTTP ${response.status}: ${errorText}`);
    }
    return response.json();
  }, [token, API_URL]);

  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      navigate('/login');
      return;
    }
    if (user.role !== 'admin') {
      navigate('/dashboard');
      return;
    }
    if (!dataLoaded) {
      loadDashboardData();
    }
  }, [user, navigate, authLoading, dataLoaded]);

  const loadDashboardData = async () => {
    if (!token) {
      setError('Authentication required. Please login again.');
      setLoading(false);
      return;
    }
    
    setLoading(true);
    setError(null);
    try {
      const [overviewData, levels, students, streaks, active, grades, daily, attention, villages, schools] = await Promise.all([
        fetchWithAuth('/analytics/overview'),
        fetchWithAuth('/analytics/level-distribution'),
        fetchWithAuth('/analytics/top-students?limit=10'),
        fetchWithAuth('/analytics/top-streaks?limit=10'),
        fetchWithAuth('/analytics/most-active?limit=10'),
        fetchWithAuth('/analytics/grade-performance'),
        fetchWithAuth('/analytics/daily-activity?days=14'),
        fetchWithAuth('/analytics/attention-needed'),
        fetchWithAuth('/analytics/village-analytics'),
        fetchWithAuth('/analytics/school-analytics')
      ]);

      setDataLoaded(true);
      setOverview(overviewData);
      setLevelDistribution(levels.distribution);
      setLevelTrend(levels.trend || generateTrendData());
      setTopStudents(students);
      setTopStreaks(streaks);
      setMostActive(active);
      setGradePerformance(grades);
      setDailyActivity(daily.length > 0 ? daily : generateDailyActivity());
      setAttentionNeeded(attention);
      setVillageAnalytics(villages);
      setSchoolAnalytics(schools);
    } catch (err) {
      console.error('Error loading dashboard:', err);
      setError(`Failed to load data: ${err.message}`);
      setLevelDistribution(generateDummyDistribution());
      setTopStudents(generateDummyTopStudents());
      setGradePerformance(generateDummyGrades());
      setDailyActivity(generateDailyActivity());
    } finally {
      setLoading(false);
    }
  };

  function generateDummyDistribution() {
    return [
      { level: 'Beginner', count: 120 },
      { level: 'Learner', count: 85 },
      { level: 'Advanced', count: 40 },
      { level: 'Expert', count: 15 },
      { level: 'Master', count: 5 }
    ];
  }

  function generateDummyTopStudents() {
    return [
      { _id: '1', username: 'Rahul Sharma', points: 980, level: 'Expert', grade: { displayName: 'Grade 10' }, streak: { current: 45 }, completedLessons: [{ lessonId: '1' }] },
      { _id: '2', username: 'Priya Patel', points: 920, level: 'Advanced', grade: { displayName: 'Grade 9' }, streak: { current: 38 }, completedLessons: [{ lessonId: '2' }] },
      { _id: '3', username: 'Arjun Singh', points: 870, level: 'Advanced', grade: { displayName: 'Grade 10' }, streak: { current: 42 }, completedLessons: [{ lessonId: '3' }] },
      { _id: '4', username: 'Sneha Reddy', points: 850, level: 'Advanced', grade: { displayName: 'Grade 9' }, streak: { current: 35 }, completedLessons: [{ lessonId: '4' }] },
      { _id: '5', username: 'Vikash Kumar', points: 780, level: 'Learner', grade: { displayName: 'Grade 8' }, streak: { current: 28 }, completedLessons: [{ lessonId: '5' }] }
    ];
  }

  function generateDummyGrades() {
    return [
      { gradeName: 'Grade 6', totalStudents: 45, avgPoints: 320, avgStreak: 4.2, totalCompletedLessons: 180 },
      { gradeName: 'Grade 7', totalStudents: 52, avgPoints: 380, avgStreak: 5.1, totalCompletedLessons: 220 },
      { gradeName: 'Grade 8', totalStudents: 48, avgPoints: 450, avgStreak: 6.3, totalCompletedLessons: 250 },
      { gradeName: 'Grade 9', totalStudents: 43, avgPoints: 520, avgStreak: 7.8, totalCompletedLessons: 280 },
      { gradeName: 'Grade 10', totalStudents: 47, avgPoints: 610, avgStreak: 9.1, totalCompletedLessons: 320 }
    ];
  }

  function generateDailyActivity() {
    const data = [];
    for (let i = 13; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      data.push({
        date: d.toISOString().split('T')[0],
        count: Math.floor(Math.random() * 50) + 20,
        uniqueStudents: Math.floor(Math.random() * 40) + 15
      });
    }
    return data;
  }

  function generateTrendData() {
    const dates = ['Apr 12', 'Apr 13', 'Apr 14', 'Apr 15', 'Apr 16', 'Apr 17', 'Apr 18'];
    return dates.map(date => ({
      date,
      Beginner: Math.floor(Math.random() * 20) + 100,
      Learner: Math.floor(Math.random() * 20) + 70,
      Advanced: Math.floor(Math.random() * 15) + 30,
      Expert: Math.floor(Math.random() * 10) + 10,
      Master: Math.floor(Math.random() * 5) + 2
    }));
  }

  const totalStudents = levelDistribution.reduce((sum, level) => sum + level.count, 0);

  const StatsCard = ({ icon, title, value, subtitle, color }) => (
    <div style={{
      background: 'white',
      padding: '20px',
      borderRadius: '12px',
      boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
      borderLeft: `4px solid ${color}`
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        <div style={{ 
          width: '45px', 
          height: '45px', 
          borderRadius: '10px', 
          background: `${color}20`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: color,
          fontSize: '1.5rem'
        }}>
          {icon}
        </div>
        <div>
          <p style={{ margin: 0, color: '#6B7280', fontSize: '0.875rem' }}>{title}</p>
          <p style={{ margin: 0, fontSize: '1.75rem', fontWeight: '800', color: '#1F2937' }}>{value}</p>
          {subtitle && <p style={{ margin: 0, fontSize: '0.75rem', color: '#6B7280' }}>{subtitle}</p>}
        </div>
      </div>
    </div>
  );

  const StudentRow = ({ student, rank, type = 'points' }) => (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      gap: '12px',
      padding: '12px',
      borderRadius: '8px',
      background: rank <= 3 ? (rank === 1 ? '#FEF3C7' : rank === 2 ? '#F3F4F6' : '#FEFCE8') : '#F9FAFB',
      marginBottom: '8px',
      border: rank === 1 ? '2px solid #FFD700' : '1px solid #E5E7EB'
    }}>
      <div style={{
        width: '32px',
        height: '32px',
        borderRadius: '50%',
        background: rank === 1 ? 'linear-gradient(135deg, #FFD700, #FFA500)' :
                   rank === 2 ? 'linear-gradient(135deg, #C0C0C0, #A0A0A0)' :
                   rank === 3 ? 'linear-gradient(135deg, #CD7F32, #8B4513)' : '#E5E7EB',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: rank <= 3 ? 'white' : '#6B7280',
        fontWeight: 'bold',
        fontSize: '0.8rem'
      }}>
        {rank}
      </div>
      <div style={{ flex: 1 }}>
        <div style={{ fontWeight: '600', color: '#1F2937', fontSize: '0.9rem' }}>{student.username}</div>
        <div style={{ fontSize: '0.75rem', color: '#6B7280' }}>
          {student.grade?.displayName || 'Grade 6'} • {student.level || 'Beginner'}
        </div>
      </div>
      <div style={{ fontWeight: '700', fontSize: '1rem', color: type === 'points' ? '#F59E0B' : '#10B981' }}>
        {type === 'points' ? student.points : student.streak?.current || 0} {type === 'points' ? 'pts' : 'days'}
      </div>
    </div>
  );

  if (loading) {
    return (
      <div style={{ 
        minHeight: '100vh', 
        background: '#F3F4F6',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ 
            width: '60px', 
            height: '60px', 
            border: '4px solid #E5E7EB',
            borderTop: '4px solid #3B82F6',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite',
            margin: '0 auto 20px'
          }} />
          <p style={{ color: '#6B7280', fontSize: '1rem' }}>Loading Analytics...</p>
          <style>{`@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`}</style>
        </div>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#F3F4F6' }}>
      {/* Mobile Overlay */}
      <div
        className={`sidebar-overlay ${sidebarOpen ? 'active' : ''}`}
        onClick={() => setSidebarOpen(false)}
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          background: 'rgba(0,0,0,0.5)',
          zIndex: 99,
          display: sidebarOpen ? 'block' : 'none'
        }}
      />

      {/* Sidebar */}
      <aside style={{
        position: 'fixed',
        left: 0,
        top: 0,
        width: '270px',
        height: '100vh',
        background: '#1F2937',
        borderRight: '1px solid #374151',
        zIndex: 100,
        transform: sidebarOpen ? 'translateX(0)' : 'translateX(-100%)',
        transition: 'transform 0.3s ease',
        display: 'flex',
        flexDirection: 'column'
      }}>
        {/* Sidebar Header */}
        <div style={{ padding: '20px', borderBottom: '1px solid #374151' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{ width: '42px', height: '42px', borderRadius: '12px', background: 'linear-gradient(135deg, #667eea, #764ba2)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white' }}>
              <BarChart3 size={22} />
            </div>
            <div>
              <h2 style={{ margin: 0, color: 'white', fontSize: '1.1rem', fontWeight: '800' }}>LearnQuest</h2>
              <p style={{ margin: 0, color: '#9CA3AF', fontSize: '0.75rem' }}>Admin Panel</p>
            </div>
          </div>
        </div>

        {/* Sidebar Navigation */}
        <nav style={{ flex: 1, padding: '15px 10px', overflowY: 'auto' }}>
          {adminNavItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              onClick={() => setSidebarOpen(false)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                padding: '12px 14px',
                marginBottom: '4px',
                borderRadius: '10px',
                textDecoration: 'none',
                color: isActivePath(item.path, item.exact) ? 'white' : '#9CA3AF',
                background: isActivePath(item.path, item.exact) ? 'rgba(99, 102, 241, 0.15)' : 'transparent',
                border: isActivePath(item.path, item.exact) ? '2px solid #6366F1' : '2px solid transparent',
                fontWeight: isActivePath(item.path, item.exact) ? '700' : '500',
                fontSize: '0.875rem',
                transition: 'all 0.2s'
              }}
            >
              {item.icon}
              {item.label}
            </Link>
          ))}
        </nav>

        {/* Sidebar Footer */}
        <div style={{ padding: '15px', borderTop: '1px solid #374151' }}>
          <button
            onClick={logout}
            style={{ width: '100%', display: 'flex', alignItems: 'center', gap: '10px', background: 'transparent', color: '#EF4444', border: '1px solid #EF4444', padding: '10px', borderRadius: '8px', cursor: 'pointer', fontWeight: '600', fontSize: '0.875rem' }}
          >
            <ChevronRight size={16} /> Logout
          </button>
        </div>
      </aside>

      {/* Main Content Wrapper */}
      <div style={{ flex: 1, marginLeft: '270px', display: 'flex', flexDirection: 'column' }}>
        {/* Mobile Header */}
        <div style={{
          display: 'none',
          background: '#1F2937',
          padding: '15px 20px',
          position: 'sticky',
          top: 0,
          zIndex: 50,
          borderBottom: '2px solid #374151',
          justifyContent: 'space-between',
          alignItems: 'center'
        }} className="admin-mobile-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <button
              onClick={() => setSidebarOpen(true)}
              style={{ background: 'none', border: 'none', color: 'white', cursor: 'pointer' }}
            >
              <Menu size={24} />
            </button>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: 'linear-gradient(135deg, #667eea, #764ba2)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white' }}>
                <BarChart3 size={16} />
              </div>
              <span style={{ color: 'white', fontWeight: '800', fontSize: '1.1rem' }}>LearnQuest</span>
            </div>
          </div>
          <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: 'linear-gradient(135deg, #667eea, #764ba2)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: '700' }}>
            {user?.username?.charAt(0).toUpperCase()}
          </div>
        </div>

        {/* Main Content */}
        <main style={{ padding: '30px' }}>
          {/* Quick Action Cards - Central Control */}
          <section style={{ marginBottom: '40px' }}>
            <h2 style={{ color: '#1F2937', margin: '0 0 20px 0', fontSize: '1.5rem', display: 'flex', alignItems: 'center', gap: '10px' }}>
              <span>🎯</span> Admin Quick Access
            </h2>
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
              gap: '15px'
            }}>
              {[
                { path: '/admin/grades', label: 'Manage Grades', icon: '🎓', color: '#3B82F6' },
                { path: '/admin/lessons', label: 'Manage Lessons', icon: '📚', color: '#10B981' },
                { path: '/admin/students', label: 'Manage Students', icon: '👥', color: '#F59E0B' },
                { path: '/admin/weekly-tests', label: 'Create Weekly Test', icon: '📝', color: '#EF4444' },
                { path: '/admin/quizzes', label: 'Quiz Management', icon: '🎯', color: '#8B5CF6' },
                { path: '/admin/leaderboard', label: 'Leaderboard Mgmt', icon: '🏆', color: '#EC4899' },
                { path: '/admin/reports', label: 'View Reports', icon: '📊', color: '#6366F1' },
                { path: '/admin/users', label: 'Admin Users', icon: '🔐', color: '#14B8A6' },
                { path: '/admin/settings', label: 'Settings', icon: '⚙️', color: '#64748B' }
              ].map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'flex-start',
                    gap: '8px',
                    background: 'white',
                    padding: '18px',
                    borderRadius: '12px',
                    textDecoration: 'none',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
                    transition: 'all 0.3s',
                    borderLeft: `4px solid ${item.color}`
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'translateY(-3px)';
                    e.currentTarget.style.boxShadow = '0 8px 16px rgba(0,0,0,0.1)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.06)';
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ fontSize: '1.5rem' }}>{item.icon}</span>
                    <span style={{ fontWeight: '700', color: '#1F2937', fontSize: '0.95rem' }}>{item.label}</span>
                  </div>
                </Link>
              ))}
            </div>
          </section>

          {/* Analytics Header */}
          <div style={{ marginBottom: '30px' }}>
            <h1 style={{ fontSize: '2rem', fontWeight: '800', color: '#1F2937', marginBottom: '8px' }}>
              Analytics Overview
            </h1>
            <p style={{ color: '#6B7280', fontSize: '1.1rem' }}>
              Complete student performance monitoring and insights
            </p>
          </div>

          {error && (
            <div style={{ background: '#FEF2F2', border: '1px solid #EF4444', borderRadius: '8px', padding: '12px', marginBottom: '20px', color: '#DC2626' }}>
              {error}
            </div>
          )}

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '15px', marginBottom: '40px' }}>
            <StatsCard icon="👥" title="Total Students" value={overview?.totalStudents || totalStudents} subtitle="All time" color="#3B82F6" />
            <StatsCard icon="📚" title="Active Today" value={overview?.activeStudents || 88} subtitle="Last 24 hours" color="#10B981" />
            <StatsCard icon="⭐" title="Avg Points" value={overview?.averagePoints || 450} subtitle="Per student" color="#F59E0B" />
            <StatsCard icon="🔥" title="Perfect Streaks" value={overview?.perfectStreaks || 23} subtitle="7+ days" color="#EF4444" />
            <StatsCard icon="📖" title="Lessons Today" value={overview?.lessonsToday || 330} subtitle="Completed" color="#8B5CF6" />
            <StatsCard icon="➕" title="New Today" value={overview?.newToday || 12} subtitle="Registrations" color="#EC4899" />
          </div>

          <section style={{ marginBottom: '40px' }}>
            <h2 style={{ color: '#1F2937', margin: '0 0 20px 0', fontSize: '1.5rem', display: 'flex', alignItems: 'center', gap: '10px' }}>
              <span>📈</span> Student Level Analytics
            </h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '15px', marginBottom: '25px' }}>
              {levelDistribution.map((level, idx) => (
                <div key={level.level} style={{ background: 'white', padding: '20px', borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.06)', textAlign: 'center', borderTop: `4px solid ${COLORS[idx]}` }}>
                  <div style={{ fontSize: '1.25rem', fontWeight: '700', color: COLORS[idx], marginBottom: '5px' }}>{level.level}</div>
                  <div style={{ fontSize: '2rem', fontWeight: '800', color: '#1F2937' }}>{level.count}</div>
                  <div style={{ fontSize: '0.8rem', color: '#6B7280' }}>{totalStudents > 0 ? Math.round((level.count/totalStudents)*100) : 0}%</div>
                </div>
              ))}
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '20px' }}>
              <div style={{ background: 'white', borderRadius: '12px', padding: '20px', boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
                <h3 style={{ color: '#1F2937', marginBottom: '15px' }}>Level Distribution</h3>
                <ResponsiveContainer width="100%" height={250}>
                  <BarChart data={levelDistribution}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                    <XAxis dataKey="level" stroke="#6B7280" fontSize={12} />
                    <YAxis stroke="#6B7280" fontSize={12} />
                    <Tooltip />
                    <Bar dataKey="count" fill="#3B82F6" radius={[8, 8, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
              <div style={{ background: 'white', borderRadius: '12px', padding: '20px', boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
                <h3 style={{ color: '#1F2937', marginBottom: '15px' }}>Level Breakdown</h3>
                <ResponsiveContainer width="100%" height={250}>
                  <PieChart>
                    <Pie data={levelDistribution} dataKey="count" nameKey="level" cx="50%" cy="50%" outerRadius={80} innerRadius={40} label>
                      {levelDistribution.map((entry, idx) => (
                        <Cell key={idx} fill={COLORS[idx]} />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>
          </section>

          <section style={{ marginBottom: '40px' }}>
            <h2 style={{ color: '#1F2937', margin: '0 0 20px 0', fontSize: '1.5rem', display: 'flex', alignItems: 'center', gap: '10px' }}>
              <span>🏆</span> Top Performing Students
            </h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px' }}>
              <div style={{ background: 'white', borderRadius: '12px', padding: '20px', boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
                <h3 style={{ color: '#1F2937', marginBottom: '15px' }}>Highest Points</h3>
                {topStudents.slice(0, 5).map((student, idx) => (
                  <StudentRow key={student._id} student={student} rank={idx + 1} type="points" />
                ))}
              </div>
              <div style={{ background: 'white', borderRadius: '12px', padding: '20px', boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
                <h3 style={{ color: '#1F2937', marginBottom: '15px' }}>Longest Streaks</h3>
                {topStreaks.slice(0, 5).map((student, idx) => (
                  <StudentRow key={student._id} student={student} rank={idx + 1} type="streak" />
                ))}
              </div>
              <div style={{ background: 'white', borderRadius: '12px', padding: '20px', boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
                <h3 style={{ color: '#1F2937', marginBottom: '15px' }}>Most Active</h3>
                {mostActive.slice(0, 5).map((student, idx) => (
                  <StudentRow key={student._id} student={{...student, points: student.completedLessons?.length || 0}} rank={idx + 1} type="points" />
                ))}
              </div>
            </div>
          </section>

          <section style={{ marginBottom: '40px' }}>
            <h2 style={{ color: '#1F2937', margin: '0 0 20px 0', fontSize: '1.5rem', display: 'flex', alignItems: 'center', gap: '10px' }}>
              <span>📊</span> Grade Performance
            </h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px' }}>
              <div style={{ background: 'white', borderRadius: '12px', padding: '20px', boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
                <h3 style={{ color: '#1F2937', marginBottom: '15px' }}>Students by Grade</h3>
                <ResponsiveContainer width="100%" height={250}>
                  <BarChart data={gradePerformance}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                    <XAxis dataKey="gradeName" stroke="#6B7280" fontSize={12} />
                    <YAxis stroke="#6B7280" fontSize={12} />
                    <Tooltip />
                    <Bar dataKey="totalStudents" name="Students" fill="#3B82F6" radius={[8, 8, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
              <div style={{ background: 'white', borderRadius: '12px', padding: '20px', boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
                <h3 style={{ color: '#1F2937', marginBottom: '15px' }}>Average Points by Grade</h3>
                <ResponsiveContainer width="100%" height={250}>
                  <BarChart data={gradePerformance}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                    <XAxis dataKey="gradeName" stroke="#6B7280" fontSize={12} />
                    <YAxis stroke="#6B7280" fontSize={12} />
                    <Tooltip />
                    <Bar dataKey="avgPoints" name="Avg Points" fill="#10B981" radius={[8, 8, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '15px', marginTop: '20px' }}>
              {gradePerformance.map((grade, idx) => (
                <div key={grade.gradeName} style={{ background: 'white', padding: '15px', borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.06)', borderTop: `4px solid ${COLORS[idx % COLORS.length]}` }}>
                  <div style={{ fontWeight: '600', color: '#6B7280', fontSize: '0.875rem' }}>{grade.gradeName}</div>
                  <div style={{ fontSize: '1.5rem', fontWeight: '700', color: '#1F2937' }}>{grade.totalStudents}</div>
                  <div style={{ fontSize: '0.8rem', color: '#6B7280' }}>Avg: {grade.avgPoints} pts • {grade.avgStreak}d streak</div>
                </div>
              ))}
            </div>
          </section>

          <section style={{ marginBottom: '40px' }}>
            <h2 style={{ color: '#1F2937', margin: '0 0 20px 0', fontSize: '1.5rem', display: 'flex', alignItems: 'center', gap: '10px' }}>
              <span>📈</span> Daily Activity (Last 14 Days)
            </h2>
            <div style={{ background: 'white', borderRadius: '12px', padding: '20px', boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={dailyActivity}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                  <XAxis dataKey="date" stroke="#6B7280" fontSize={12} />
                  <YAxis stroke="#6B7280" fontSize={12} />
                  <Tooltip />
                  <Area type="monotone" dataKey="uniqueStudents" name="Active Students" stackId="1" stroke="#3B82F6" fill="#3B82F6" fillOpacity={0.6} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </section>

          {attentionNeeded && (
            <section style={{ marginBottom: '40px' }}>
              <h2 style={{ color: '#1F2937', margin: '0 0 20px 0', fontSize: '1.5rem', display: 'flex', alignItems: 'center', gap: '10px', color: '#DC2626' }}>
                <span>⚠️</span> Students Need Attention
              </h2>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px' }}>
                <div style={{ background: '#FEF2F2', borderRadius: '12px', padding: '20px', border: '2px solid #EF4444' }}>
                  <h3 style={{ color: '#DC2626', marginBottom: '15px' }}>Inactive Students ({attentionNeeded.inactive?.length || 0})</h3>
                  {attentionNeeded.inactive?.slice(0, 5).map((student, idx) => (
                    <div key={idx} style={{ background: 'white', padding: '10px', borderRadius: '8px', marginBottom: '8px', borderLeft: '4px solid #EF4444' }}>
                      <div style={{ fontWeight: '600', color: '#1F2937' }}>{student.username}</div>
                      <div style={{ fontSize: '0.8rem', color: '#6B7280' }}>{student.grade?.displayName}</div>
                    </div>
                  ))}
                </div>
                <div style={{ background: '#F3E8FF', borderRadius: '12px', padding: '20px', border: '2px solid #8B5CF6' }}>
                  <h3 style={{ color: '#7C3AED', marginBottom: '15px' }}>Low Performers ({attentionNeeded.lowPerformers?.length || 0})</h3>
                  {attentionNeeded.lowPerformers?.slice(0, 5).map((student, idx) => (
                    <div key={idx} style={{ background: 'white', padding: '10px', borderRadius: '8px', marginBottom: '8px', borderLeft: '4px solid #8B5CF6' }}>
                      <div style={{ fontWeight: '600', color: '#1F2937' }}>{student.username}</div>
                      <div style={{ fontSize: '0.8rem', color: '#6B7280' }}>Avg Score: {student.avgScore}%</div>
                    </div>
                  ))}
                </div>
                <div style={{ background: '#FEF3C7', borderRadius: '12px', padding: '20px', border: '2px solid #F59E0B' }}>
                  <h3 style={{ color: '#D97706', marginBottom: '15px' }}>Lost Streaks ({attentionNeeded.lostStreaks?.length || 0})</h3>
                  {attentionNeeded.lostStreaks?.slice(0, 5).map((student, idx) => (
                    <div key={idx} style={{ background: 'white', padding: '10px', borderRadius: '8px', marginBottom: '8px', borderLeft: '4px solid #F59E0B' }}>
                      <div style={{ fontWeight: '600', color: '#1F2937' }}>{student.username}</div>
                      <div style={{ fontSize: '0.8rem', color: '#6B7280' }}>Streak: {student.streak?.current || 0} days</div>
                    </div>
                  ))}
                </div>
              </div>
            </section>
          )}

          {villageAnalytics.length > 0 && (
            <section style={{ marginBottom: '40px' }}>
              <h2 style={{ color: '#1F2937', margin: '0 0 20px 0', fontSize: '1.5rem', display: 'flex', alignItems: 'center', gap: '10px' }}>
                <span>🏘️</span> Village Performance
              </h2>
              <div style={{ background: 'white', borderRadius: '12px', padding: '20px', boxShadow: '0 2px 8px rgba(0,0,0,0.06)', overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr style={{ borderBottom: '2px solid #E5E7EB' }}>
                      <th style={{ textAlign: 'left', padding: '12px', color: '#6B7280' }}>Village</th>
                      <th style={{ textAlign: 'left', padding: '12px', color: '#6B7280' }}>Students</th>
                      <th style={{ textAlign: 'left', padding: '12px', color: '#6B7280' }}>Avg Points</th>
                      <th style={{ textAlign: 'left', padding: '12px', color: '#6B7280' }}>Avg Streak</th>
                    </tr>
                  </thead>
                  <tbody>
                    {villageAnalytics.slice(0, 10).map((village, idx) => (
                      <tr key={idx} style={{ borderBottom: '1px solid #E5E7EB' }}>
                        <td style={{ padding: '12px', fontWeight: '600' }}>{village.village}</td>
                        <td style={{ padding: '12px' }}>{village.totalStudents}</td>
                        <td style={{ padding: '12px' }}>{village.avgPoints}</td>
                        <td style={{ padding: '12px' }}>{village.avgStreak} days</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>
          )}

          <div style={{ textAlign: 'center', padding: '20px', color: '#6B7280', fontSize: '0.875rem' }}>
            <button onClick={loadDashboardData} style={{ background: '#3B82F6', color: 'white', border: 'none', padding: '12px 24px', borderRadius: '8px', cursor: 'pointer', fontWeight: '600', marginRight: '10px' }}>
              Refresh Data
            </button>
            Last updated: {new Date().toLocaleString()}
          </div>
        </main>
      </div>
    </div>
  );
};

export default AdminDashboard;

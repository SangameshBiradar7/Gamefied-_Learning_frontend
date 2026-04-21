import React, { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  BarChart, Bar, PieChart, Pie, LineChart, Line, AreaChart, Area,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell
} from 'recharts';
import {
  LayoutDashboard, BarChart3, Users, BookOpen, Trophy, Target,
  FileText, Settings, GraduationCap, ChevronRight, Menu, X, Shield,
  TrendingUp, Activity, Award, Flame, Star, Calendar, CheckCircle
} from 'lucide-react';

const API_URL = import.meta.env.VITE_API_URL || 'https://gamefied-earning-backend.onrender.com/api';

const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899'];

const AdminDashboard = () => {
  const { user, token, logout, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Real-time data state
  const [overview, setOverview] = useState(null);
  const [levelDistribution, setLevelDistribution] = useState([]);
  const [topStudents, setTopStudents] = useState([]);
  const [topStreaks, setTopStreaks] = useState([]);
  const [mostActive, setMostActive] = useState([]);
  const [gradePerformance, setGradePerformance] = useState([]);
  const [dailyActivity, setDailyActivity] = useState([]);
  const [attentionNeeded, setAttentionNeeded] = useState(null);
  const [villageAnalytics, setVillageAnalytics] = useState([]);
  const [weeklyTests, setWeeklyTests] = useState([]);
  const [quizStats, setQuizStats] = useState(null);

  const adminNavItems = [
    { path: '/admin', icon: <LayoutDashboard size={18} />, label: 'Dashboard', exact: true },
    { path: '/admin/analytics', icon: <BarChart3 size={18} />, label: 'Analytics' },
    { path: '/admin/grades', icon: <GraduationCap size={18} />, label: 'Grades' },
    { path: '/admin/lessons', icon: <BookOpen size={18} />, label: 'Lessons' },
    { path: '/admin/students', icon: <Users size={18} />, label: 'Students' },
    { path: '/admin/weekly-tests', icon: <Target size={18} />, label: 'Weekly Tests' },
    { path: '/admin/quizzes', icon: <Trophy size={18} />, label: 'Quizzes' },
    { path: '/admin/leaderboard', icon: <BarChart3 size={18} />, label: 'Leaderboard' },
    { path: '/admin/reports', icon: <FileText size={18} />, label: 'Reports' },
    { path: '/admin/users', icon: <Shield size={18} />, label: 'Admin Users' },
    { path: '/admin/settings', icon: <Settings size={18} />, label: 'Settings' }
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
    loadDashboardData();
  }, [user, navigate, authLoading]);

  const loadDashboardData = async () => {
    if (!token) {
      setError('Authentication required. Please login again.');
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);
    try {
      // Fetch all real-time data in parallel
      const [
        overviewData,
        levels,
        students,
        streaks,
        active,
        grades,
        daily,
        attention,
        villages,
        tests,
        quizData
      ] = await Promise.all([
        fetchWithAuth('/admin/dashboard'),
        fetchWithAuth('/analytics/level-distribution'),
        fetchWithAuth('/analytics/top-students?limit=10'),
        fetchWithAuth('/analytics/top-streaks?limit=10'),
        fetchWithAuth('/analytics/most-active?limit=10'),
        fetchWithAuth('/analytics/grade-performance'),
        fetchWithAuth('/analytics/daily-activity?days=14'),
        fetchWithAuth('/analytics/attention-needed'),
        fetchWithAuth('/analytics/village-analytics'),
        fetchWithAuth('/admin/weekly-tests?activeOnly=true'),
        fetchWithAuth('/analytics/quiz-completion')
      ]);

      setOverview(overviewData);
      setLevelDistribution(levels.distribution || []);
      setTopStudents(Array.isArray(students) ? students : []);
      setTopStreaks(Array.isArray(streaks) ? streaks : []);
      setMostActive(Array.isArray(active) ? active : []);
      setGradePerformance(Array.isArray(grades) ? grades : []);
      setDailyActivity(Array.isArray(daily) && daily.length > 0 ? daily : []);
      setAttentionNeeded(attention);
      setVillageAnalytics(Array.isArray(villages) ? villages : []);
      setWeeklyTests(Array.isArray(tests) ? tests : []);
      setQuizStats(quizData);
    } catch (err) {
      console.error('Error loading dashboard:', err);
      setError(`Failed to load data: ${err.message}`);
      // Set empty arrays to prevent rendering errors
      setLevelDistribution([]);
      setTopStudents([]);
      setTopStreaks([]);
      setMostActive([]);
      setGradePerformance([]);
      setDailyActivity([]);
      setVillageAnalytics([]);
      setWeeklyTests([]);
    } finally {
      setLoading(false);
    }
  };

  // Calculate totals from real data
  const totalStudents = overview?.totalStudents || levelDistribution.reduce((sum, level) => sum + level.count, 0);
  const activeStudentsToday = overview?.activeStudents || 0;
  const weeklyTestParticipants = weeklyTests.reduce((sum, test) => sum + (test.results?.attempted || 0), 0);
  const quizCompletions = quizStats?.totalQuizzes || 0;
  const totalXPEarned = overview?.totalPoints || 0;

  if (loading) {
    return (
      <div style={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #F5F7FA 0%, #E8EEF5 100%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}>
        <div style={{ textAlign: 'center', background: 'white', padding: '40px', borderRadius: '16px', boxShadow: '0 10px 40px rgba(0,0,0,0.1)' }}>
          <div style={{
            width: '60px',
            height: '60px',
            border: '4px solid #E5E7EB',
            borderTop: '4px solid #6366F1',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite',
            margin: '0 auto 20px'
          }} />
          <p style={{ color: '#6B7280', fontSize: '1rem', fontWeight: '500' }}>Loading Dashboard Data...</p>
          <style>{`@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`}</style>
        </div>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: 'linear-gradient(135deg, #F5F7FA 0%, #E8EEF5 100%)' }}>
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

      {/* Premium Sidebar */}
      <aside style={{
        position: 'fixed',
        left: 0,
        top: 0,
        width: '280px',
        height: '100vh',
        background: 'linear-gradient(180deg, #1F2937 0%, #111827 100%)',
        borderRight: '1px solid rgba(255,255,255,0.08)',
        zIndex: 100,
        transform: sidebarOpen ? 'translateX(0)' : 'translateX(-100%)',
        transition: 'transform 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        display: 'flex',
        flexDirection: 'column',
        boxShadow: '4px 0 24px rgba(0,0,0,0.15)'
      }}>
        {/* Sidebar Header */}
        <div style={{
          padding: '24px 20px',
          borderBottom: '1px solid rgba(255,255,255,0.08)',
          background: 'rgba(255,255,255,0.02)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{
              width: '48px',
              height: '48px',
              borderRadius: '14px',
              background: 'linear-gradient(135deg, #6366F1, #8B5CF6)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'white',
              boxShadow: '0 4px 12px rgba(99, 102, 241, 0.3)'
            }}>
              <BarChart3 size={24} />
            </div>
            <div>
              <h2 style={{ margin: 0, color: 'white', fontSize: '1.25rem', fontWeight: '800', letterSpacing: '-0.025em' }}>LearnQuest</h2>
              <p style={{ margin: 0, color: '#9CA3AF', fontSize: '0.75rem', fontWeight: '500', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Admin Console</p>
            </div>
          </div>
        </div>

        {/* Sidebar Navigation */}
        <nav style={{ flex: 1, padding: '20px 12px', overflowY: 'auto' }}>
          {adminNavItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              onClick={() => setSidebarOpen(false)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '14px',
                padding: '14px 16px',
                marginBottom: '6px',
                borderRadius: '12px',
                textDecoration: 'none',
                color: isActivePath(item.path, item.exact) ? 'white' : '#D1D5DB',
                background: isActivePath(item.path, item.exact)
                  ? 'linear-gradient(135deg, rgba(99, 102, 241, 0.25), rgba(139, 92, 246, 0.15))'
                  : 'transparent',
                border: isActivePath(item.path, item.exact)
                  ? '1px solid rgba(99, 102, 241, 0.4)'
                  : '1px solid transparent',
                fontWeight: isActivePath(item.path, item.exact) ? '700' : '500',
                fontSize: '0.9rem',
                transition: 'all 0.2s ease',
                backdropFilter: isActivePath(item.path, item.exact) ? 'blur(8px)' : 'none'
              }}
            >
              {item.icon}
              <span>{item.label}</span>
            </Link>
          ))}
        </nav>

        {/* Sidebar Footer */}
        <div style={{ padding: '20px', borderTop: '1px solid rgba(255,255,255,0.08)' }}>
          <button
            onClick={logout}
            style={{
              width: '100%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '10px',
              background: 'rgba(239, 68, 68, 0.1)',
              color: '#EF4444',
              border: '1px solid rgba(239, 68, 68, 0.3)',
              padding: '12px',
              borderRadius: '10px',
              cursor: 'pointer',
              fontWeight: '600',
              fontSize: '0.9rem',
              transition: 'all 0.2s'
            }}
          >
            <ChevronRight size={16} />
            <span>Logout</span>
          </button>
        </div>
      </aside>

      {/* Main Content Wrapper */}
      <div style={{ flex: 1, marginLeft: '280px', display: 'flex', flexDirection: 'column' }}>
        {/* Mobile Header */}
        <div style={{
          display: { xs: 'none', md: 'flex' },
          background: 'linear-gradient(135deg, #1F2937, #111827)',
          padding: '16px 24px',
          position: 'sticky',
          top: 0,
          zIndex: 50,
          borderBottom: '1px solid rgba(255,255,255,0.08)',
          justifyContent: 'space-between',
          alignItems: 'center',
          boxShadow: '0 2px 12px rgba(0,0,0,0.1)'
        }} className="admin-mobile-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <button
              onClick={() => setSidebarOpen(true)}
              style={{ background: 'none', border: 'none', color: 'white', cursor: 'pointer', padding: '8px' }}
            >
              <Menu size={24} />
            </button>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div style={{
                width: '36px',
                height: '36px',
                borderRadius: '10px',
                background: 'linear-gradient(135deg, #6366F1, #8B5CF6)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'white'
              }}>
                <BarChart3 size={18} />
              </div>
              <span style={{ color: 'white', fontWeight: '700', fontSize: '1.1rem' }}>LearnQuest</span>
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <Link
              to="/dashboard"
              style={{
                color: '#D1D5DB',
                textDecoration: 'none',
                padding: '8px 16px',
                borderRadius: '8px',
                fontWeight: '600',
                fontSize: '0.875rem',
                background: 'rgba(255,255,255,0.05)',
                border: '1px solid rgba(255,255,255,0.1)',
                transition: 'all 0.2s'
              }}
            >
              Student View
            </Link>
            <div style={{
              width: '40px',
              height: '40px',
              borderRadius: '50%',
              background: 'linear-gradient(135deg, #6366F1, #8B5CF6)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'white',
              fontWeight: '700',
              fontSize: '1rem',
              boxShadow: '0 4px 12px rgba(99, 102, 241, 0.3)'
            }}>
              {user?.username?.charAt(0).toUpperCase()}
            </div>
          </div>
        </div>

        {/* Main Content */}
        <main style={{ padding: '32px', maxWidth: '1600px', margin: '0 auto', width: '100%' }}>
          {/* Page Header */}
          <div style={{ marginBottom: '32px' }}>
            <h1 style={{
              fontSize: '2.25rem',
              fontWeight: '800',
              color: '#111827',
              margin: '0 0 8px 0',
              letterSpacing: '-0.025em',
              lineHeight: '1.2'
            }}>
              Admin Dashboard
            </h1>
            <p style={{ color: '#6B7280', fontSize: '1.1rem', margin: 0, fontWeight: '500' }}>
              Platform overview and performance analytics
            </p>
          </div>

          {error && (
            <div style={{
              background: 'linear-gradient(135deg, #FEF2F2, #FEE2E2)',
              border: '1px solid #FECACA',
              borderRadius: '12px',
              padding: '16px 20px',
              marginBottom: '24px',
              color: '#DC2626',
              fontWeight: '500',
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              boxShadow: '0 2px 8px rgba(239, 68, 68, 0.1)'
            }}>
              <X size={20} />
              {error}
            </div>
          )}

          {/* Premium Stats Grid */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
            gap: '20px',
            marginBottom: '40px'
          }}>
            {/* Total Students */}
            <div style={{
              background: 'white',
              borderRadius: '16px',
              padding: '24px',
              boxShadow: '0 1px 3px rgba(0,0,0,0.06), 0 1px 2px rgba(0,0,0,0.04)',
              border: '1px solid #E5E7EB',
              transition: 'all 0.3s ease',
              position: 'relative',
              overflow: 'hidden'
            }}>
              <div style={{
                position: 'absolute',
                top: 0,
                right: 0,
                width: '80px',
                height: '80px',
                background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.1), transparent)',
                borderRadius: '50%',
                transform: 'translate(30%, -30%)'
              }} />
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '16px',
                marginBottom: '12px'
              }}>
                <div style={{
                  width: '52px',
                  height: '52px',
                  borderRadius: '14px',
                  background: 'linear-gradient(135deg, #3B82F6, #2563EB)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'white',
                  boxShadow: '0 4px 12px rgba(59, 130, 246, 0.3)'
                }}>
                  <Users size={24} />
                </div>
                <div>
                  <p style={{ margin: 0, color: '#6B7280', fontSize: '0.875rem', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Total Students</p>
                  <p style={{ margin: 0, fontSize: '2rem', fontWeight: '800', color: '#111827', lineHeight: 1 }}>{totalStudents}</p>
                </div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.875rem' }}>
                <TrendingUp size={14} style={{ color: '#10B981' }} />
                <span style={{ color: '#10B981', fontWeight: '600' }}>All time registrations</span>
              </div>
            </div>

            {/* Active Today */}
            <div style={{
              background: 'white',
              borderRadius: '16px',
              padding: '24px',
              boxShadow: '0 1px 3px rgba(0,0,0,0.06), 0 1px 2px rgba(0,0,0,0.04)',
              border: '1px solid #E5E7EB',
              transition: 'all 0.3s ease',
              position: 'relative',
              overflow: 'hidden'
            }}>
              <div style={{
                position: 'absolute',
                top: 0,
                right: 0,
                width: '80px',
                height: '80px',
                background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.1), transparent)',
                borderRadius: '50%',
                transform: 'translate(30%, -30%)'
              }} />
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '16px',
                marginBottom: '12px'
              }}>
                <div style={{
                  width: '52px',
                  height: '52px',
                  borderRadius: '14px',
                  background: 'linear-gradient(135deg, #10B981, #059669)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'white',
                  boxShadow: '0 4px 12px rgba(16, 185, 129, 0.3)'
                }}>
                  <Activity size={24} />
                </div>
                <div>
                  <p style={{ margin: 0, color: '#6B7280', fontSize: '0.875rem', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Active Today</p>
                  <p style={{ margin: 0, fontSize: '2rem', fontWeight: '800', color: '#111827', lineHeight: 1 }}>{activeStudentsToday}</p>
                </div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.875rem' }}>
                <CheckCircle size={14} style={{ color: '#10B981' }} />
                <span style={{ color: '#10B981', fontWeight: '600' }}>Last 24 hours</span>
              </div>
            </div>

            {/* Total XP Earned */}
            <div style={{
              background: 'white',
              borderRadius: '16px',
              padding: '24px',
              boxShadow: '0 1px 3px rgba(0,0,0,0.06), 0 1px 2px rgba(0,0,0,0.04)',
              border: '1px solid #E5E7EB',
              transition: 'all 0.3s ease',
              position: 'relative',
              overflow: 'hidden'
            }}>
              <div style={{
                position: 'absolute',
                top: 0,
                right: 0,
                width: '80px',
                height: '80px',
                background: 'linear-gradient(135deg, rgba(245, 158, 11, 0.1), transparent)',
                borderRadius: '50%',
                transform: 'translate(30%, -30%)'
              }} />
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '16px',
                marginBottom: '12px'
              }}>
                <div style={{
                  width: '52px',
                  height: '52px',
                  borderRadius: '14px',
                  background: 'linear-gradient(135deg, #F59E0B, #D97706)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'white',
                  boxShadow: '0 4px 12px rgba(245, 158, 11, 0.3)'
                }}>
                  <Award size={24} />
                </div>
                <div>
                  <p style={{ margin: 0, color: '#6B7280', fontSize: '0.875rem', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Total XP Earned</p>
                  <p style={{ margin: 0, fontSize: '2rem', fontWeight: '800', color: '#111827', lineHeight: 1 }}>{totalXPEarned.toLocaleString()}</p>
                </div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.875rem' }}>
                <Star size={14} style={{ color: '#F59E0B' }} />
                <span style={{ color: '#6B7280', fontWeight: '600' }}>Points accumulated</span>
              </div>
            </div>

            {/* Weekly Test Participants */}
            <div style={{
              background: 'white',
              borderRadius: '16px',
              padding: '24px',
              boxShadow: '0 1px 3px rgba(0,0,0,0.06), 0 1px 2px rgba(0,0,0,0.04)',
              border: '1px solid #E5E7EB',
              transition: 'all 0.3s ease',
              position: 'relative',
              overflow: 'hidden'
            }}>
              <div style={{
                position: 'absolute',
                top: 0,
                right: 0,
                width: '80px',
                height: '80px',
                background: 'linear-gradient(135deg, rgba(139, 92, 246, 0.1), transparent)',
                borderRadius: '50%',
                transform: 'translate(30%, -30%)'
              }} />
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '16px',
                marginBottom: '12px'
              }}>
                <div style={{
                  width: '52px',
                  height: '52px',
                  borderRadius: '14px',
                  background: 'linear-gradient(135deg, #8B5CF6, #7C3AED)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'white',
                  boxShadow: '0 4px 12px rgba(139, 92, 246, 0.3)'
                }}>
                  <Target size={24} />
                </div>
                <div>
                  <p style={{ margin: 0, color: '#6B7280', fontSize: '0.875rem', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Test Participants</p>
                  <p style={{ margin: 0, fontSize: '2rem', fontWeight: '800', color: '#111827', lineHeight: 1 }}>{weeklyTestParticipants}</p>
                </div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.875rem' }}>
                <Calendar size={14} style={{ color: '#8B5CF6' }} />
                <span style={{ color: '#6B7280', fontWeight: '600' }}>{weeklyTests.length} active tests</span>
              </div>
            </div>

            {/* Quiz Completions */}
            <div style={{
              background: 'white',
              borderRadius: '16px',
              padding: '24px',
              boxShadow: '0 1px 3px rgba(0,0,0,0.06), 0 1px 2px rgba(0,0,0,0.04)',
              border: '1px solid #E5E7EB',
              transition: 'all 0.3s ease',
              position: 'relative',
              overflow: 'hidden'
            }}>
              <div style={{
                position: 'absolute',
                top: 0,
                right: 0,
                width: '80px',
                height: '80px',
                background: 'linear-gradient(135deg, rgba(236, 72, 153, 0.1), transparent)',
                borderRadius: '50%',
                transform: 'translate(30%, -30%)'
              }} />
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '16px',
                marginBottom: '12px'
              }}>
                <div style={{
                  width: '52px',
                  height: '52px',
                  borderRadius: '14px',
                  background: 'linear-gradient(135deg, #EC4899, #DB2777)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'white',
                  boxShadow: '0 4px 12px rgba(236, 72, 153, 0.3)'
                }}>
                  <Trophy size={24} />
                </div>
                <div>
                  <p style={{ margin: 0, color: '#6B7280', fontSize: '0.875rem', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Quiz Completed</p>
                  <p style={{ margin: 0, fontSize: '2rem', fontWeight: '800', color: '#111827', lineHeight: 1 }}>{quizCompletions}</p>
                </div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.875rem' }}>
                <Award size={14} style={{ color: '#EC4899' }} />
                <span style={{ color: '#6B7280', fontWeight: '600' }}>Total quizzes cleared</span>
              </div>
            </div>
          </div>

          {/* Quick Access Cards */}
          <div style={{ marginBottom: '40px' }}>
            <h2 style={{
              color: '#111827',
              margin: '0 0 20px 0',
              fontSize: '1.5rem',
              fontWeight: '700',
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              letterSpacing: '-0.025em'
            }}>
              <span style={{
                width: '36px',
                height: '36px',
                borderRadius: '10px',
                background: 'linear-gradient(135deg, #6366F1, #8B5CF6)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'white',
                fontSize: '1rem'
              }}>🎯</span>
              Admin Quick Access
            </h2>
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))',
              gap: '16px'
            }}>
              {[
                { path: '/admin/grades', label: 'Manage Grades', icon: <GraduationCap size={20} />, color: '#3B82F6', gradient: 'linear-gradient(135deg, #3B82F6, #2563EB)' },
                { path: '/admin/lessons', label: 'Manage Lessons', icon: <BookOpen size={20} />, color: '#10B981', gradient: 'linear-gradient(135deg, #10B981, #059669)' },
                { path: '/admin/students', label: 'Manage Students', icon: <Users size={20} />, color: '#F59E0B', gradient: 'linear-gradient(135deg, #F59E0B, #D97706)' },
                { path: '/admin/weekly-tests', label: 'Create Weekly Test', icon: <Target size={20} />, color: '#EF4444', gradient: 'linear-gradient(135deg, #EF4444, #DC2626)' },
                { path: '/admin/quizzes', label: 'Quiz Management', icon: <Trophy size={20} />, color: '#8B5CF6', gradient: 'linear-gradient(135deg, #8B5CF6, #7C3AED)' },
                { path: '/admin/leaderboard', label: 'Leaderboard Mgmt', icon: <BarChart3 size={20} />, color: '#EC4899', gradient: 'linear-gradient(135deg, #EC4899, #DB2777)' },
                { path: '/admin/reports', label: 'View Reports', icon: <FileText size={20} />, color: '#6366F1', gradient: 'linear-gradient(135deg, #6366F1, #4F46E5)' },
                { path: '/admin/users', label: 'Admin Users', icon: <Shield size={20} />, color: '#14B8A6', gradient: 'linear-gradient(135deg, #14B8A6, #0D9488)' },
                { path: '/admin/settings', label: 'Settings', icon: <Settings size={20} />, color: '#64748B', gradient: 'linear-gradient(135deg, #64748B, #475569)' }
              ].map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'flex-start',
                    gap: '12px',
                    background: 'white',
                    padding: '24px',
                    borderRadius: '16px',
                    textDecoration: 'none',
                    boxShadow: '0 1px 3px rgba(0,0,0,0.06), 0 1px 2px rgba(0,0,0,0.04)',
                    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                    border: '1px solid #E5E7EB',
                    position: 'relative',
                    overflow: 'hidden'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'translateY(-4px)';
                    e.currentTarget.style.boxShadow = '0 12px 24px rgba(0,0,0,0.1), 0 4px 8px rgba(0,0,0,0.05)';
                    e.currentTarget.style.borderColor = item.color;
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.boxShadow = '0 1px 3px rgba(0,0,0,0.06), 0 1px 2px rgba(0,0,0,0.04)';
                    e.currentTarget.style.borderColor = '#E5E7EB';
                  }}
                >
                  <div style={{
                    width: '48px',
                    height: '48px',
                    borderRadius: '12px',
                    background: item.gradient,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'white',
                    boxShadow: `0 4px 12px ${item.color}40`
                  }}>
                    {item.icon}
                  </div>
                  <span style={{
                    fontWeight: '700',
                    color: '#111827',
                    fontSize: '1rem',
                    lineHeight: 1.4
                  }}>{item.label}</span>
                </Link>
              ))}
            </div>
          </div>

          {/* Analytics Overview */}
          <div style={{ marginBottom: '40px' }}>
            <div style={{ marginBottom: '24px' }}>
              <h1 style={{
                fontSize: '2.25rem',
                fontWeight: '800',
                color: '#111827',
                marginBottom: '8px',
                letterSpacing: '-0.025em',
                lineHeight: '1.2'
              }}>
                Analytics Overview
              </h1>
              <p style={{ color: '#6B7280', fontSize: '1.125rem', margin: 0, fontWeight: '500' }}>
                Real-time student performance and platform insights
              </p>
            </div>

            {/* KPI Cards Row 2 */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
              gap: '16px',
              marginBottom: '32px'
            }}>
              <div style={{
                background: 'white',
                borderRadius: '14px',
                padding: '20px',
                border: '1px solid #E5E7EB',
                boxShadow: '0 1px 2px rgba(0,0,0,0.05)',
                display: 'flex',
                flexDirection: 'column'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                  <span style={{ color: '#6B7280', fontSize: '0.8rem', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Avg Points</span>
                  <TrendingUp size={16} style={{ color: '#10B981' }} />
                </div>
                <p style={{ margin: 0, fontSize: '1.75rem', fontWeight: '800', color: '#111827' }}>
                  {overview?.averagePoints || gradePerformance.length > 0
                    ? Math.round(gradePerformance.reduce((sum, g) => sum + g.avgPoints, 0) / gradePerformance.length)
                    : 0}
                </p>
                <span style={{ color: '#6B7280', fontSize: '0.8rem', fontWeight: '500' }}>Per student</span>
              </div>

              <div style={{
                background: 'white',
                borderRadius: '14px',
                padding: '20px',
                border: '1px solid #E5E7EB',
                boxShadow: '0 1px 2px rgba(0,0,0,0.05)',
                display: 'flex',
                flexDirection: 'column'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                  <span style={{ color: '#6B7280', fontSize: '0.8rem', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Perfect Streaks</span>
                  <Flame size={16} style={{ color: '#EF4444' }} />
                </div>
                <p style={{ margin: 0, fontSize: '1.75rem', fontWeight: '800', color: '#111827' }}>
                  {overview?.perfectStreaks || 0}
                </p>
                <span style={{ color: '#6B7280', fontSize: '0.8rem', fontWeight: '500' }}>7+ day streaks</span>
              </div>

              <div style={{
                background: 'white',
                borderRadius: '14px',
                padding: '20px',
                border: '1px solid #E5E7EB',
                boxShadow: '0 1px 2px rgba(0,0,0,0.05)',
                display: 'flex',
                flexDirection: 'column'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                  <span style={{ color: '#6B7280', fontSize: '0.8rem', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.05em' }}>New Today</span>
                  <Star size={16} style={{ color: '#8B5CF6' }} />
                </div>
                <p style={{ margin: 0, fontSize: '1.75rem', fontWeight: '800', color: '#111827' }}>
                  {overview?.newToday || 0}
                </p>
                <span style={{ color: '#6B7280', fontSize: '0.8rem', fontWeight: '500' }}>Registrations</span>
              </div>

              <div style={{
                background: 'white',
                borderRadius: '14px',
                padding: '20px',
                border: '1px solid #E5E7EB',
                boxShadow: '0 1px 2px rgba(0,0,0,0.05)',
                display: 'flex',
                flexDirection: 'column'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                  <span style={{ color: '#6B7280', fontSize: '0.8rem', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Lessons Today</span>
                  <BookOpen size={16} style={{ color: '#F59E0B' }} />
                </div>
                <p style={{ margin: 0, fontSize: '1.75rem', fontWeight: '800', color: '#111827' }}>
                  {overview?.lessonsToday || 0}
                </p>
                <span style={{ color: '#6B7280', fontSize: '0.8rem', fontWeight: '500' }}>Completed</span>
              </div>
            </div>
          </div>

          {/* Student Level Analytics */}
          <section style={{ marginBottom: '40px' }}>
            <h2 style={{
              color: '#111827',
              margin: '0 0 24px 0',
              fontSize: '1.5rem',
              fontWeight: '700',
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              letterSpacing: '-0.025em'
            }}>
              <span style={{
                width: '36px',
                height: '36px',
                borderRadius: '10px',
                background: 'linear-gradient(135deg, #8B5CF6, #7C3AED)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'white',
                fontSize: '1rem'
              }}>📈</span>
              Student Level Distribution
            </h2>
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
              gap: '16px',
              marginBottom: '24px'
            }}>
              {levelDistribution.map((level, idx) => (
                <div key={level.level} style={{
                  background: 'white',
                  padding: '20px',
                  borderRadius: '14px',
                  boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
                  textAlign: 'center',
                  borderTop: `4px solid ${COLORS[idx]}`,
                  transition: 'transform 0.2s'
                }}>
                  <div style={{ fontSize: '1.25rem', fontWeight: '700', color: COLORS[idx], marginBottom: '4px' }}>{level.level}</div>
                  <div style={{ fontSize: '2rem', fontWeight: '800', color: '#111827' }}>{level.count}</div>
                  <div style={{ fontSize: '0.875rem', color: '#6B7280', fontWeight: '500' }}>
                    {totalStudents > 0 ? Math.round((level.count / totalStudents) * 100) : 0}% of students
                  </div>
                </div>
              ))}
            </div>
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))',
              gap: '20px'
            }}>
              <div style={{
                background: 'white',
                borderRadius: '16px',
                padding: '24px',
                boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
                border: '1px solid #E5E7EB'
              }}>
                <h3 style={{ color: '#111827', marginBottom: '20px', fontSize: '1.125rem', fontWeight: '700' }}>Level Distribution</h3>
                <ResponsiveContainer width="100%" height={280}>
                  <BarChart data={levelDistribution}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                    <XAxis dataKey="level" stroke="#6B7280" fontSize={12} />
                    <YAxis stroke="#6B7280" fontSize={12} />
                    <Tooltip
                      contentStyle={{
                        background: 'white',
                        border: '1px solid #E5E7EB',
                        borderRadius: '8px',
                        boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
                      }}
                    />
                    <Bar dataKey="count" fill="#6366F1" radius={[8, 8, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
              <div style={{
                background: 'white',
                borderRadius: '16px',
                padding: '24px',
                boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
                border: '1px solid #E5E7EB'
              }}>
                <h3 style={{ color: '#111827', marginBottom: '20px', fontSize: '1.125rem', fontWeight: '700' }}>Level Breakdown</h3>
                <ResponsiveContainer width="100%" height={280}>
                  <PieChart>
                    <Pie
                      data={levelDistribution}
                      dataKey="count"
                      nameKey="level"
                      cx="50%"
                      cy="50%"
                      outerRadius={90}
                      innerRadius={50}
                      label
                    >
                      {levelDistribution.map((entry, idx) => (
                        <Cell key={idx} fill={COLORS[idx % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{
                        background: 'white',
                        border: '1px solid #E5E7EB',
                        borderRadius: '8px',
                        boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
                      }}
                    />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>
          </section>

          {/* Top Performing Students */}
          <section style={{ marginBottom: '40px' }}>
            <h2 style={{
              color: '#111827',
              margin: '0 0 24px 0',
              fontSize: '1.5rem',
              fontWeight: '700',
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              letterSpacing: '-0.025em'
            }}>
              <span style={{
                width: '36px',
                height: '36px',
                borderRadius: '10px',
                background: 'linear-gradient(135deg, #F59E0B, #D97706)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'white',
                fontSize: '1rem'
              }}>🏆</span>
              Top Performing Students
            </h2>
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
              gap: '20px'
            }}>
              <div style={{
                background: 'white',
                borderRadius: '16px',
                padding: '24px',
                boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
                border: '1px solid #E5E7EB'
              }}>
                <h3 style={{ color: '#111827', marginBottom: '16px', fontSize: '1.125rem', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Award size={20} style={{ color: '#F59E0B' }} />
                  Highest Points
                </h3>
                {topStudents.length > 0 ? (
                  topStudents.slice(0, 5).map((student, idx) => (
                    <div
                      key={student._id}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '12px',
                        padding: '12px',
                        borderRadius: '10px',
                        background: idx === 0 ? '#FEF3C7' : idx === 1 ? '#F3F4F6' : '#F9FAFB',
                        marginBottom: '8px',
                        border: idx === 0 ? '2px solid #FFD700' : '1px solid #E5E7EB'
                      }}
                    >
                      <div style={{
                        width: '36px',
                        height: '36px',
                        borderRadius: '50%',
                        background: idx === 1 ? 'linear-gradient(135deg, #C0C0C0, #A0A0A0)' :
                                   idx === 2 ? 'linear-gradient(135deg, #CD7F32, #8B4513)' :
                                   'linear-gradient(135deg, #E5E7EB, #D1D5DB)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: idx <= 2 ? 'white' : '#6B7280',
                        fontWeight: '700',
                        fontSize: '0.85rem'
                      }}>
                        {idx + 1}
                      </div>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontWeight: '600', color: '#111827', fontSize: '0.95rem' }}>{student.username}</div>
                        <div style={{ fontSize: '0.8rem', color: '#6B7280' }}>
                          {student.grade?.displayName || 'Grade 6'} • {student.level || 'Beginner'}
                        </div>
                      </div>
                      <div style={{ fontWeight: '700', fontSize: '1.1rem', color: '#F59E0B' }}>
                        {student.points} pts
                      </div>
                    </div>
                  ))
                ) : (
                  <div style={{ textAlign: 'center', padding: '40px', color: '#6B7280' }}>No data available</div>
                )}
              </div>

              <div style={{
                background: 'white',
                borderRadius: '16px',
                padding: '24px',
                boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
                border: '1px solid #E5E7EB'
              }}>
                <h3 style={{ color: '#111827', marginBottom: '16px', fontSize: '1.125rem', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Flame size={20} style={{ color: '#EF4444' }} />
                  Longest Streaks
                </h3>
                {topStreaks.length > 0 ? (
                  topStreaks.slice(0, 5).map((student, idx) => (
                    <div
                      key={student._id}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '12px',
                        padding: '12px',
                        borderRadius: '10px',
                        background: idx === 0 ? '#FEF3C7' : idx === 1 ? '#F3F4F6' : '#F9FAFB',
                        marginBottom: '8px',
                        border: idx === 0 ? '2px solid #FFD700' : '1px solid #E5E7EB'
                      }}
                    >
                      <div style={{
                        width: '36px',
                        height: '36px',
                        borderRadius: '50%',
                        background: idx === 1 ? 'linear-gradient(135deg, #C0C0C0, #A0A0A0)' :
                                   idx === 2 ? 'linear-gradient(135deg, #CD7F32, #8B4513)' :
                                   'linear-gradient(135deg, #E5E7EB, #D1D5DB)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: idx <= 2 ? 'white' : '#6B7280',
                        fontWeight: '700',
                        fontSize: '0.85rem'
                      }}>
                        {idx + 1}
                      </div>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontWeight: '600', color: '#111827', fontSize: '0.95rem' }}>{student.username}</div>
                        <div style={{ fontSize: '0.8rem', color: '#6B7280' }}>
                          {student.grade?.displayName || 'Grade 6'}
                        </div>
                      </div>
                      <div style={{ fontWeight: '700', fontSize: '1.1rem', color: '#EF4444' }}>
                        {student.streak?.current || 0} days
                      </div>
                    </div>
                  ))
                ) : (
                  <div style={{ textAlign: 'center', padding: '40px', color: '#6B7280' }}>No data available</div>
                )}
              </div>

              <div style={{
                background: 'white',
                borderRadius: '16px',
                padding: '24px',
                boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
                border: '1px solid #E5E7EB'
              }}>
                <h3 style={{ color: '#111827', marginBottom: '16px', fontSize: '1.125rem', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Activity size={20} style={{ color: '#10B981' }} />
                  Most Active
                </h3>
                {mostActive.length > 0 ? (
                  mostActive.slice(0, 5).map((student, idx) => (
                    <div
                      key={student._id}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '12px',
                        padding: '12px',
                        borderRadius: '10px',
                        background: idx === 0 ? '#D1FAE5' : '#F9FAFB',
                        marginBottom: '8px',
                        border: idx === 0 ? '2px solid #10B981' : '1px solid #E5E7EB'
                      }}
                    >
                      <div style={{
                        width: '36px',
                        height: '36px',
                        borderRadius: '50%',
                        background: idx === 0 ? 'linear-gradient(135deg, #10B981, #059669)' :
                                   'linear-gradient(135deg, #E5E7EB, #D1D5DB)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: idx === 0 ? 'white' : '#6B7280',
                        fontWeight: '700',
                        fontSize: '0.85rem'
                      }}>
                        {idx + 1}
                      </div>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontWeight: '600', color: '#111827', fontSize: '0.95rem' }}>{student.username}</div>
                        <div style={{ fontSize: '0.8rem', color: '#6B7280' }}>
                          {student.grade?.displayName || 'Grade 6'}
                        </div>
                      </div>
                      <div style={{ fontWeight: '700', fontSize: '1.1rem', color: '#10B981' }}>
                        {student.completedLessons?.length || 0} lessons
                      </div>
                    </div>
                  ))
                ) : (
                  <div style={{ textAlign: 'center', padding: '40px', color: '#6B7280' }}>No data available</div>
                )}
              </div>
            </div>
          </section>

          {/* Grade Performance */}
          <section style={{ marginBottom: '40px' }}>
            <h2 style={{
              color: '#111827',
              margin: '0 0 24px 0',
              fontSize: '1.5rem',
              fontWeight: '700',
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              letterSpacing: '-0.025em'
            }}>
              <span style={{
                width: '36px',
                height: '36px',
                borderRadius: '10px',
                background: 'linear-gradient(135deg, #3B82F6, #2563EB)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'white',
                fontSize: '1rem'
              }}>📊</span>
              Grade Performance Analytics
            </h2>
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
              gap: '20px',
              marginBottom: '24px'
            }}>
              <div style={{
                background: 'white',
                borderRadius: '16px',
                padding: '24px',
                boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
                border: '1px solid #E5E7EB'
              }}>
                <h3 style={{ color: '#111827', marginBottom: '20px', fontSize: '1.125rem', fontWeight: '700' }}>Students by Grade</h3>
                {gradePerformance.length > 0 ? (
                  <ResponsiveContainer width="100%" height={280}>
                    <BarChart data={gradePerformance}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                      <XAxis dataKey="gradeName" stroke="#6B7280" fontSize={12} />
                      <YAxis stroke="#6B7280" fontSize={12} />
                      <Tooltip
                        contentStyle={{
                          background: 'white',
                          border: '1px solid #E5E7EB',
                          borderRadius: '8px',
                          boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
                        }}
                      />
                      <Bar dataKey="totalStudents" name="Students" fill="#3B82F6" radius={[8, 8, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <div style={{ textAlign: 'center', padding: '60px', color: '#6B7280' }}>No grade data</div>
                )}
              </div>
              <div style={{
                background: 'white',
                borderRadius: '16px',
                padding: '24px',
                boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
                border: '1px solid #E5E7EB'
              }}>
                <h3 style={{ color: '#111827', marginBottom: '20px', fontSize: '1.125rem', fontWeight: '700' }}>Average Points by Grade</h3>
                {gradePerformance.length > 0 ? (
                  <ResponsiveContainer width="100%" height={280}>
                    <BarChart data={gradePerformance}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                      <XAxis dataKey="gradeName" stroke="#6B7280" fontSize={12} />
                      <YAxis stroke="#6B7280" fontSize={12} />
                      <Tooltip
                        contentStyle={{
                          background: 'white',
                          border: '1px solid #E5E7EB',
                          borderRadius: '8px',
                          boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
                        }}
                      />
                      <Bar dataKey="avgPoints" name="Avg Points" fill="#10B981" radius={[8, 8, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <div style={{ textAlign: 'center', padding: '60px', color: '#6B7280' }}>No performance data</div>
                )}
              </div>
            </div>

            {/* Grade Stats Cards */}
            {gradePerformance.length > 0 && (
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                gap: '16px'
              }}>
                {gradePerformance.map((grade, idx) => (
                  <div key={grade.gradeName} style={{
                    background: 'white',
                    padding: '20px',
                    borderRadius: '14px',
                    boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
                    border: `1px solid ${COLORS[idx % COLORS.length]}20`,
                    borderTop: `4px solid ${COLORS[idx % COLORS.length]}`
                  }}>
                    <div style={{ fontWeight: '600', color: '#6B7280', fontSize: '0.875rem', marginBottom: '4px' }}>{grade.gradeName}</div>
                    <div style={{ fontSize: '1.75rem', fontWeight: '800', color: '#111827' }}>{grade.totalStudents}</div>
                    <div style={{ fontSize: '0.875rem', color: '#6B7280', marginTop: '4px' }}>
                      Avg: {grade.avgPoints} pts • {grade.avgStreak}d streak
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>

          {/* Daily Activity Chart */}
          <section style={{ marginBottom: '40px' }}>
            <h2 style={{
              color: '#111827',
              margin: '0 0 24px 0',
              fontSize: '1.5rem',
              fontWeight: '700',
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              letterSpacing: '-0.025em'
            }}>
              <span style={{
                width: '36px',
                height: '36px',
                borderRadius: '10px',
                background: 'linear-gradient(135deg, #10B981, #059669)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'white',
                fontSize: '1rem'
              }}>📈</span>
              14-Day Activity Trend
            </h2>
            <div style={{
              background: 'white',
              borderRadius: '16px',
              padding: '24px',
              boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
              border: '1px solid #E5E7EB'
            }}>
              {dailyActivity.length > 0 ? (
                <ResponsiveContainer width="100%" height={320}>
                  <AreaChart data={dailyActivity}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                    <XAxis dataKey="date" stroke="#6B7280" fontSize={12} />
                    <YAxis stroke="#6B7280" fontSize={12} />
                    <Tooltip
                      contentStyle={{
                        background: 'white',
                        border: '1px solid #E5E7EB',
                        borderRadius: '8px',
                        boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
                      }}
                    />
                    <Area
                      type="monotone"
                      dataKey="uniqueStudents"
                      name="Active Students"
                      stackId="1"
                      stroke="#6366F1"
                      fill="#6366F1"
                      fillOpacity={0.6}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              ) : (
                <div style={{ textAlign: 'center', padding: '80px', color: '#6B7280' }}>No activity data available</div>
              )}
            </div>
          </section>

          {/* Students Needing Attention */}
          {attentionNeeded && (
            <section style={{ marginBottom: '40px' }}>
              <h2 style={{
                color: '#DC2626',
                margin: '0 0 24px 0',
                fontSize: '1.5rem',
                fontWeight: '700',
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                letterSpacing: '-0.025em'
              }}>
                <span style={{
                  width: '36px',
                  height: '36px',
                  borderRadius: '10px',
                  background: 'linear-gradient(135deg, #DC2626, #B91C1C)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'white',
                  fontSize: '1rem'
                }}>⚠️</span>
                Students Requiring Attention
              </h2>
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
                gap: '20px'
              }}>
                <div style={{
                  background: 'linear-gradient(135deg, #FEF2F2, #FEE2E2)',
                  borderRadius: '16px',
                  padding: '24px',
                  border: '2px solid #FECACA',
                  boxShadow: '0 2px 8px rgba(239, 68, 68, 0.08)'
                }}>
                  <h3 style={{ color: '#DC2626', marginBottom: '16px', fontSize: '1.125rem', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <XCircle size={20} />
                    Inactive Students ({attentionNeeded.inactive?.length || 0})
                  </h3>
                  {attentionNeeded.inactive?.length > 0 ? (
                    attentionNeeded.inactive.slice(0, 5).map((student, idx) => (
                      <div
                        key={idx}
                        style={{
                          background: 'white',
                          padding: '12px',
                          borderRadius: '10px',
                          marginBottom: '8px',
                          borderLeft: '4px solid #EF4444',
                          boxShadow: '0 1px 2px rgba(0,0,0,0.05)'
                        }}
                      >
                        <div style={{ fontWeight: '600', color: '#111827' }}>{student.username}</div>
                        <div style={{ fontSize: '0.875rem', color: '#6B7280' }}>{student.grade?.displayName}</div>
                      </div>
                    ))
                  ) : (
                    <div style={{ textAlign: 'center', padding: '20px', color: '#6B7280' }}>No inactive students</div>
                  )}
                </div>

                <div style={{
                  background: 'linear-gradient(135deg, #F3E8FF, #E9D5FF)',
                  borderRadius: '16px',
                  padding: '24px',
                  border: '2px solid #E9D5FF',
                  boxShadow: '0 2px 8px rgba(139, 92, 246, 0.08)'
                }}>
                  <h3 style={{ color: '#7C3AED', marginBottom: '16px', fontSize: '1.125rem', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <AlertTriangle size={20} />
                    Low Performers ({attentionNeeded.lowPerformers?.length || 0})
                  </h3>
                  {attentionNeeded.lowPerformers?.length > 0 ? (
                    attentionNeeded.lowPerformers.slice(0, 5).map((student, idx) => (
                      <div
                        key={idx}
                        style={{
                          background: 'white',
                          padding: '12px',
                          borderRadius: '10px',
                          marginBottom: '8px',
                          borderLeft: '4px solid #8B5CF6',
                          boxShadow: '0 1px 2px rgba(0,0,0,0.05)'
                        }}
                      >
                        <div style={{ fontWeight: '600', color: '#111827' }}>{student.username}</div>
                        <div style={{ fontSize: '0.875rem', color: '#6B7280' }}>Avg Score: {student.avgScore}%</div>
                      </div>
                    ))
                  ) : (
                    <div style={{ textAlign: 'center', padding: '20px', color: '#6B7280' }}>No low performers</div>
                  )}
                </div>

                <div style={{
                  background: 'linear-gradient(135deg, #FEF3C7, #FDE68A)',
                  borderRadius: '16px',
                  padding: '24px',
                  border: '2px solid #FDE68A',
                  boxShadow: '0 2px 8px rgba(245, 158, 11, 0.08)'
                }}>
                  <h3 style={{ color: '#D97706', marginBottom: '16px', fontSize: '1.125rem', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Flame size={20} />
                    Lost Streaks ({attentionNeeded.lostStreaks?.length || 0})
                  </h3>
                  {attentionNeeded.lostStreaks?.length > 0 ? (
                    attentionNeeded.lostStreaks.slice(0, 5).map((student, idx) => (
                      <div
                        key={idx}
                        style={{
                          background: 'white',
                          padding: '12px',
                          borderRadius: '10px',
                          marginBottom: '8px',
                          borderLeft: '4px solid #F59E0B',
                          boxShadow: '0 1px 2px rgba(0,0,0,0.05)'
                        }}
                      >
                        <div style={{ fontWeight: '600', color: '#111827' }}>{student.username}</div>
                        <div style={{ fontSize: '0.875rem', color: '#6B7280' }}>Streak: {student.streak?.current || 0} days</div>
                      </div>
                    ))
                  ) : (
                    <div style={{ textAlign: 'center', padding: '20px', color: '#6B7280' }}>No lost streaks</div>
                  )}
                </div>
              </div>
            </section>
          )}

          {/* Village Performance Table */}
          {villageAnalytics.length > 0 && (
            <section style={{ marginBottom: '40px' }}>
              <h2 style={{
                color: '#111827',
                margin: '0 0 24px 0',
                fontSize: '1.5rem',
                fontWeight: '700',
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                letterSpacing: '-0.025em'
              }}>
                <span style={{
                  width: '36px',
                  height: '36px',
                  borderRadius: '10px',
                  background: 'linear-gradient(135deg, #6366F1, #4F46E5)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'white',
                  fontSize: '1rem'
                }}>🏘️</span>
                Village Performance Overview
              </h2>
              <div style={{
                background: 'white',
                borderRadius: '16px',
                padding: '24px',
                boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
                border: '1px solid #E5E7EB',
                overflowX: 'auto'
              }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr style={{ borderBottom: '2px solid #E5E7EB' }}>
                      <th style={{ textAlign: 'left', padding: '14px 12px', color: '#6B7280', fontWeight: '700', fontSize: '0.875rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Village</th>
                      <th style={{ textAlign: 'left', padding: '14px 12px', color: '#6B7280', fontWeight: '700', fontSize: '0.875rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Students</th>
                      <th style={{ textAlign: 'left', padding: '14px 12px', color: '#6B7280', fontWeight: '700', fontSize: '0.875rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Avg Points</th>
                      <th style={{ textAlign: 'left', padding: '14px 12px', color: '#6B7280', fontWeight: '700', fontSize: '0.875rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Avg Streak</th>
                    </tr>
                  </thead>
                  <tbody>
                    {villageAnalytics.slice(0, 10).map((village, idx) => (
                      <tr
                        key={idx}
                        style={{
                          borderBottom: '1px solid #F3F4F6',
                          transition: 'background 0.2s'
                        }}
                        onMouseEnter={(e) => e.currentTarget.style.background = '#F9FAFB'}
                        onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                      >
                        <td style={{ padding: '14px 12px', fontWeight: '600', color: '#111827' }}>{village.village}</td>
                        <td style={{ padding: '14px 12px', color: '#6B7280' }}>{village.totalStudents}</td>
                        <td style={{ padding: '14px 12px', color: '#6B7280' }}>{village.avgPoints}</td>
                        <td style={{ padding: '14px 12px', color: '#6B7280' }}>{village.avgStreak} days</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>
          )}

          {/* Refresh Button */}
          <div style={{
            textAlign: 'center',
            padding: '24px',
            color: '#6B7280',
            fontSize: '0.875rem',
            fontWeight: '500',
            borderTop: '1px solid #E5E7EB',
            marginTop: '20px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '12px'
          }}>
            <button
              onClick={loadDashboardData}
              disabled={loading}
              style={{
                background: loading ? '#9CA3AF' : 'linear-gradient(135deg, #6366F1, #8B5CF6)',
                color: 'white',
                border: 'none',
                padding: '10px 24px',
                borderRadius: '10px',
                cursor: loading ? 'not-allowed' : 'pointer',
                fontWeight: '600',
                fontSize: '0.875rem',
                transition: 'all 0.2s',
                boxShadow: loading ? 'none' : '0 4px 12px rgba(99, 102, 241, 0.3)'
              }}
            >
              {loading ? 'Refreshing...' : 'Refresh Data'}
            </button>
            <span>Last updated: {new Date().toLocaleString()}</span>
          </div>
        </main>
      </div>
    </div>
  );
};

export default AdminDashboard;

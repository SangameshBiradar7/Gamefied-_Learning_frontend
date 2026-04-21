import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  Trophy, Medal, TrendingUp, Filter, ChevronDown, User,
  Award, BarChart3, Target, Flame, Star, Eye
} from 'lucide-react';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const AdminLeaderboardManagement = () => {
  const { user, token } = useAuth();
  const navigate = useNavigate();

  const [leaderboard, setLeaderboard] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('points');
  const [filters, setFilters] = useState({
    gradeId: '',
    school: '',
    village: '',
    timeRange: 'all'
  });
  const [availableFilters, setAvailableFilters] = useState({
    grades: [],
    schools: [],
    villages: []
  });
  const [error, setError] = useState(null);
  const [stats, setStats] = useState({
    totalStudents: 0,
    avgPoints: 0,
    topStudent: null,
    mostActive: null
  });

  useEffect(() => {
    if (!user || user.role !== 'admin') {
      navigate('/login');
      return;
    }
    fetchData();
  }, [user, activeTab, filters]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        filterBy: activeTab,
        ...(filters.gradeId && { gradeId: filters.gradeId }),
        ...(filters.timeRange !== 'all' && { timeRange: filters.timeRange })
      });

      const [leaderboardRes, filtersRes, statsRes] = await Promise.all([
        fetch(`${API_URL}/leaderboard?${params}`, { headers: { Authorization: `Bearer ${token}` } }),
        fetch(`${API_URL}/leaderboard/filters`, { headers: { Authorization: `Bearer ${token}` } }),
        fetch(`${API_URL}/analytics/overview`, { headers: { Authorization: `Bearer ${token}` } })
      ]);

      const leaderboardData = await leaderboardRes.json();
      const filtersData = await filtersRes.json();
      const statsData = await statsRes.json();

      // Apply additional client-side filtering for school/village
      let filteredData = Array.isArray(leaderboardData) ? leaderboardData : [];
      
      if (filters.school) {
        filteredData = filteredData.filter(s => s.school === filters.school);
      }
      if (filters.village) {
        filteredData = filteredData.filter(s => s.village === filters.village);
      }

      // Sort based on active tab
      if (activeTab === 'points') {
        filteredData.sort((a, b) => (b.points || 0) - (a.points || 0));
      } else if (activeTab === 'streak') {
        filteredData.sort((a, b) => (b.streak?.current || 0) - (a.streak?.current || 0));
      } else if (activeTab === 'lessons') {
        filteredData.sort((a, b) => ((b.completedLessons?.length || 0) - (a.completedLessons?.length || 0)));
      }

      setLeaderboard(filteredData);
      setAvailableFilters({
        grades: filtersData.grades || [],
        schools: filtersData.schools || [],
        villages: filtersData.villages || []
      });
      setStats({
        totalStudents: statsData.totalStudents || 0,
        avgPoints: statsData.averagePoints || 0,
        topStudent: filteredData[0] || null,
        mostActive: filteredData.filter(s => (s.completedLessons?.length || 0) > 0).slice(0, 5)
      });
    } catch (err) {
      console.error('Failed to fetch leaderboard:', err);
      setError('Failed to load leaderboard');
    } finally {
      setLoading(false);
    }
  };

  const clearFilters = () => {
    setFilters({
      gradeId: '',
      school: '',
      village: '',
      timeRange: 'all'
    });
  };

  const tabs = [
    { id: 'points', label: 'Points', icon: <Trophy size={18} />, color: '#F59E0B' },
    { id: 'streak', label: 'Streaks', icon: <Flame size={18} />, color: '#EF4444' },
    { id: 'lessons', label: 'Lessons', icon: <BookOpen size={18} />, color: '#10B981' }
  ];

  const getRankStyle = (rank) => {
    if (rank === 1) return { background: 'linear-gradient(135deg, #FFD700, #FFA500)', color: 'white' };
    if (rank === 2) return { background: 'linear-gradient(135deg, #C0C0C0, #A0A0A0)', color: 'white' };
    if (rank === 3) return { background: 'linear-gradient(135deg, #CD7F32, #8B4513)', color: 'white' };
    return { background: '#F3F4F6', color: '#6B7280' };
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}>
        <div className="loading">Loading Leaderboard...</div>
      </div>
    );
  }

  return (
    <div style={{ background: '#F3F4F6', minHeight: '100vh' }}>
      <header style={{ background: '#1F2937', padding: '15px 0', boxShadow: '0 2px 10px rgba(0,0,0,0.1)' }}>
        <div style={{ maxWidth: '1400px', margin: '0 auto', padding: '0 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
            <Link to="/admin" style={{ color: '#D1D5DB', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '8px', fontWeight: '600', padding: '8px 12px', borderRadius: '8px', background: 'rgba(255,255,255,0.05)' }}>
              ← Dashboard
            </Link>
            <div>
              <h1 style={{ color: 'white', fontSize: '1.5rem', margin: 0, fontWeight: '800', display: 'flex', alignItems: 'center', gap: '10px' }}>
                <Trophy size={24} /> Leaderboard Management
              </h1>
              <p style={{ color: '#9CA3AF', margin: 0, fontSize: '0.875rem' }}>Monitor and analyze leaderboard rankings</p>
            </div>
          </div>
          <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
            <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
              <div style={{ padding: '8px 16px', background: 'rgba(255,255,255,0.1)', borderRadius: '8px', color: 'white', fontSize: '0.875rem' }}>
                Total: {stats.totalStudents}
              </div>
              <div style={{ padding: '8px 16px', background: 'rgba(255,255,255,0.1)', borderRadius: '8px', color: 'white', fontSize: '0.875rem' }}>
                Avg: {stats.avgPoints}
              </div>
            </div>
            <div style={{ width: '42px', height: '42px', borderRadius: '50%', background: 'linear-gradient(135deg, #667eea, #764ba2)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: '700', fontSize: '1.1rem' }}>
              {user?.username?.charAt(0).toUpperCase()}
            </div>
          </div>
        </div>
      </header>

      <main style={{ maxWidth: '1400px', margin: '0 auto', padding: '30px 20px' }}>
        {error && (
          <div style={{ background: '#FEF2F2', border: '1px solid #EF4444', borderRadius: '8px', padding: '12px', marginBottom: '20px', color: '#DC2626' }}>
            {error}
          </div>
        )}

        {/* Stats Cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '15px', marginBottom: '30px' }}>
          <div style={{ background: 'white', padding: '20px', borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.06)', borderLeft: '4px solid #F59E0B' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{ width: '45px', height: '45px', borderRadius: '10px', background: '#FEF3C7', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#F59E0B' }}>
                <Trophy size={24} />
              </div>
              <div>
                <p style={{ margin: 0, color: '#6B7280', fontSize: '0.875rem' }}>Top Scorer</p>
                <p style={{ margin: 0, fontSize: '1.25rem', fontWeight: '800', color: '#1F2937' }}>
                  {stats.topStudent?.username || 'N/A'}
                </p>
              </div>
            </div>
          </div>

          <div style={{ background: 'white', padding: '20px', borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.06)', borderLeft: '4px solid #3B82F6' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{ width: '45px', height: '45px', borderRadius: '10px', background: '#DBEAFE', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#3B82F6' }}>
                <Award size={24} />
              </div>
              <div>
                <p style={{ margin: 0, color: '#6B7280', fontSize: '0.875rem' }}>Avg Points</p>
                <p style={{ margin: 0, fontSize: '1.25rem', fontWeight: '800', color: '#1F2937' }}>{stats.avgPoints}</p>
              </div>
            </div>
          </div>

          <div style={{ background: 'white', padding: '20px', borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.06)', borderLeft: '4px solid #10B981' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{ width: '45px', height: '45px', borderRadius: '10px', background: '#D1FAE5', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#10B981' }}>
                <BookOpen size={24} />
              </div>
              <div>
                <p style={{ margin: 0, color: '#6B7280', fontSize: '0.875rem' }}>Total Students</p>
                <p style={{ margin: 0, fontSize: '1.25rem', fontWeight: '800', color: '#1F2937' }}>{stats.totalStudents}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div style={{ background: 'white', borderRadius: '12px', padding: '20px', marginBottom: '25px', boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
            <h3 style={{ margin: 0, color: '#1F2937', fontSize: '1.1rem', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Filter size={18} /> Filters
            </h3>
            <button
              onClick={clearFilters}
              style={{ background: 'none', border: 'none', color: '#3B82F6', cursor: 'pointer', fontWeight: '600', fontSize: '0.875rem' }}
            >
              Clear All
            </button>
          </div>

          <div style={{ display: 'flex', gap: '15px', flexWrap: 'wrap' }}>
            <div style={{ minWidth: '200px' }}>
              <label style={{ display: 'block', marginBottom: '6px', fontWeight: '600', color: '#1F2937', fontSize: '0.875rem' }}>Grade</label>
              <select
                value={filters.gradeId}
                onChange={(e) => setFilters({ ...filters, gradeId: e.target.value })}
                style={{ width: '100%', padding: '10px', border: '2px solid #E5E7EB', borderRadius: '8px', fontSize: '0.9rem' }}
              >
                <option value="">All Grades</option>
                {availableFilters.grades.map(grade => (
                  <option key={grade._id} value={grade._id}>{grade.displayName}</option>
                ))}
              </select>
            </div>

            <div style={{ minWidth: '200px' }}>
              <label style={{ display: 'block', marginBottom: '6px', fontWeight: '600', color: '#1F2937', fontSize: '0.875rem' }}>School</label>
              <select
                value={filters.school}
                onChange={(e) => setFilters({ ...filters, school: e.target.value })}
                style={{ width: '100%', padding: '10px', border: '2px solid #E5E7EB', borderRadius: '8px', fontSize: '0.9rem' }}
              >
                <option value="">All Schools</option>
                {availableFilters.schools.map((school, idx) => (
                  <option key={idx} value={school}>{school}</option>
                ))}
              </select>
            </div>

            <div style={{ minWidth: '200px' }}>
              <label style={{ display: 'block', marginBottom: '6px', fontWeight: '600', color: '#1F2937', fontSize: '0.875rem' }}>Village</label>
              <select
                value={filters.village}
                onChange={(e) => setFilters({ ...filters, village: e.target.value })}
                style={{ width: '100%', padding: '10px', border: '2px solid #E5E7EB', borderRadius: '8px', fontSize: '0.9rem' }}
              >
                <option value="">All Villages</option>
                {availableFilters.villages.map((village, idx) => (
                  <option key={idx} value={village}>{village}</option>
                ))}
              </select>
            </div>

            <div style={{ minWidth: '150px' }}>
              <label style={{ display: 'block', marginBottom: '6px', fontWeight: '600', color: '#1F2937', fontSize: '0.875rem' }}>Time Range</label>
              <select
                value={filters.timeRange}
                onChange={(e) => setFilters({ ...filters, timeRange: e.target.value })}
                style={{ width: '100%', padding: '10px', border: '2px solid #E5E7EB', borderRadius: '8px', fontSize: '0.9rem' }}
              >
                <option value="all">All Time</option>
                <option value="week">This Week</option>
                <option value="month">This Month</option>
              </select>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div style={{ display: 'flex', gap: '10px', marginBottom: '25px', flexWrap: 'wrap' }}>
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                background: activeTab === tab.id ? 'white' : 'transparent',
                color: activeTab === tab.id ? tab.color : '#6B7280',
                border: activeTab === tab.id ? '2px solid' + tab.color.replace('#', '#') : '2px solid transparent',
                padding: '10px 20px',
                borderRadius: '10px',
                cursor: 'pointer',
                fontWeight: '600',
                fontSize: '0.95rem',
                transition: 'all 0.2s'
              }}
            >
              {tab.icon} {tab.label}
            </button>
          ))}
        </div>

        {/* Leaderboard Table */}
        <div style={{ background: 'white', borderRadius: '12px', overflow: 'hidden', boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ background: '#F9FAFB', borderBottom: '2px solid #E5E7EB' }}>
                  <th style={{ textAlign: 'left', padding: '15px 20px', fontWeight: '700', color: '#1F2937' }}>Rank</th>
                  <th style={{ textAlign: 'left', padding: '15px 20px', fontWeight: '700', color: '#1F2937' }}>Student</th>
                  <th style={{ textAlign: 'left', padding: '15px 20px', fontWeight: '700', color: '#1F2937' }}>Grade</th>
                  <th style={{ textAlign: 'right', padding: '15px 20px', fontWeight: '700', color: '#1F2937' }}>
                    {activeTab === 'points' ? 'Points' : activeTab === 'streak' ? 'Streak (days)' : 'Lessons'}
                  </th>
                  <th style={{ textAlign: 'left', padding: '15px 20px', fontWeight: '700', color: '#1F2937' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {leaderboard.slice(0, 50).map((student, index) => {
                  const rank = index + 1;
                  const rankStyle = getRankStyle(rank);
                  return (
                    <tr key={student._id} style={{ borderBottom: '1px solid #E5E7EB', transition: 'background 0.2s' }} onMouseEnter={(e) => e.currentTarget.style.background = '#F9FAFB'} onMouseLeave={(e) => e.currentTarget.style.background = 'white'}>
                      <td style={{ padding: '15px 20px' }}>
                        <div style={{
                          width: '36px',
                          height: '36px',
                          borderRadius: '50%',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontWeight: '700',
                          fontSize: '0.9rem',
                          ...rankStyle
                        }}>
                          {rank}
                        </div>
                      </td>
                      <td style={{ padding: '15px 20px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                          <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: 'linear-gradient(135deg, #667eea, #764ba2)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: '700' }}>
                            {student.username?.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <div style={{ fontWeight: '600', color: '#1F2937' }}>{student.username}</div>
                            <div style={{ fontSize: '0.8rem', color: '#6B7280' }}>
                              {student.school || 'No school'} • {student.village || 'No village'}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td style={{ padding: '15px 20px' }}>
                        <span style={{ fontSize: '0.875rem', color: '#6B7280' }}>
                          {student.grade?.displayName || 'Not assigned'}
                        </span>
                      </td>
                      <td style={{ padding: '15px 20px', textAlign: 'right' }}>
                        <div style={{ fontSize: '1.1rem', fontWeight: '700', color: '#1F2937', display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '4px' }}>
                          {activeTab === 'points' && <><Star size={16} color="#F59E0B" /> {student.points || 0}</>}
                          {activeTab === 'streak' && <><Flame size={16} color="#EF4444" /> {student.streak?.current || 0}</>}
                          {activeTab === 'lessons' && <><BookOpen size={16} color="#10B981" /> {student.completedLessons?.length || 0}</>}
                        </div>
                      </td>
                      <td style={{ padding: '15px 20px' }}>
                        <button
                          onClick={() => navigate(`/admin/students`)}
                          style={{ background: '#EFF6FF', color: '#3B82F6', border: 'none', padding: '6px 12px', borderRadius: '6px', cursor: 'pointer', fontWeight: '600', fontSize: '0.875rem', display: 'flex', alignItems: 'center', gap: '4px' }}
                        >
                          <Eye size={14} /> View
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {leaderboard.length === 0 && (
            <div style={{ textAlign: 'center', padding: '40px', color: '#6B7280' }}>
              <BarChart3 size={48} style={{ margin: '0 auto 15px', opacity: 0.5 }} />
              <p>No leaderboard data available with current filters</p>
            </div>
          )}
        </div>

        {leaderboard.length > 50 && (
          <div style={{ textAlign: 'center', marginTop: '20px', color: '#6B7280', fontSize: '0.875rem' }}>
            Showing top 50 of {leaderboard.length} students
          </div>
        )}
      </main>
    </div>
  );
};

export default AdminLeaderboardManagement;

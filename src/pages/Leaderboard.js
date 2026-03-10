import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Home, BookOpen, Trophy, Star, Flame, Filter } from 'lucide-react';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const Leaderboard = () => {
  const { user, token } = useAuth();
  const [activeTab, setActiveTab] = useState('points');
  const [leaderboard, setLeaderboard] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    gradeId: '',
    school: '',
    village: ''
  });
  const [availableFilters, setAvailableFilters] = useState({
    grades: [],
    schools: [],
    villages: []
  });
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }
    fetchFilters();
  }, [user]);

  useEffect(() => {
    fetchLeaderboard();
  }, [user, activeTab, filters]);

  const fetchFilters = async () => {
    try {
      const response = await fetch(`${API_URL}/leaderboard/filters`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await response.json();
      setAvailableFilters({
        grades: data.grades || [],
        schools: data.schools || [],
        villages: data.villages || []
      });
    } catch (err) {
      console.error('Failed to fetch filters:', err);
    }
  };

  const fetchLeaderboard = async () => {
    setLoading(true);
    try {
      let endpoint = '';
      if (activeTab === 'points') {
        endpoint = `${API_URL}/leaderboard/points`;
      } else if (activeTab === 'streaks') {
        endpoint = `${API_URL}/leaderboard/streaks`;
      }
      
      // Add query parameters for filters
      const params = new URLSearchParams();
      if (filters.gradeId) params.append('gradeId', filters.gradeId);
      if (filters.school) params.append('school', filters.school);
      if (filters.village) params.append('village', filters.village);
      
      const queryString = params.toString();
      const finalEndpoint = queryString ? `${endpoint}?${queryString}` : endpoint;
      
      const response = await fetch(finalEndpoint, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await response.json();
      setLeaderboard(data);
    } catch (err) {
      console.error('Failed to fetch leaderboard:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const clearFilters = () => {
    setFilters({
      gradeId: '',
      school: '',
      village: ''
    });
  };

  const getRankClass = (index) => {
    if (index === 0) return 'gold';
    if (index === 1) return 'silver';
    if (index === 2) return 'bronze';
    return '';
  };

  const getUserRank = () => {
    const index = leaderboard.findIndex(s => s._id === user?.id);
    return index >= 0 ? index + 1 : 0;
  };

  const hasActiveFilters = filters.gradeId || filters.school || filters.village;

  return (
    <div className="dashboard">
      <header className="dashboard-header">
        <div className="container">
          <Link to="/dashboard" className="dashboard-logo">LearnQuest</Link>
          <nav className="dashboard-nav">
            <Link to="/dashboard" className="nav-link"><Home className="nav-icon" size={20} />Home</Link>
            <Link to="/grades" className="nav-link"><BookOpen className="nav-icon" size={20} />Subjects</Link>
            <Link to="/leaderboard" className="nav-link active"><Trophy className="nav-icon" size={20} />Leaderboard</Link>
          </nav>
          <div className="user-info">
            <div className="user-stats">
              <div className="stat-item points">
                <Star className="stat-icon" size={18} color="#F59E0B" />
                <span>{user?.points || 0}</span>
              </div>
              <div className="stat-item streak">
                <Flame className="stat-icon" size={18} color="#F97316" />
                <span>{user?.streak?.current || 0}</span>
              </div>
            </div>
            <div className="user-avatar">
              {user?.username?.charAt(0).toUpperCase()}
            </div>
          </div>
        </div>
      </header>

      <main className="dashboard-content">
        <div className="container">
          <div className="page-title">
            <h1><Trophy className="icon-lg" style={{marginRight: '10px', verticalAlign: 'middle'}} />Leaderboard</h1>
            <p>See how you rank against other learners</p>
          </div>

          {/* User's Rank */}
          {getUserRank() > 0 && (
            <div className="card mb-4">
              <div className="flex-center">
                <div className="text-center">
                  <p className="text-gray">Your Rank</p>
                  <h2 style={{ fontSize: '2.5rem', color: 'var(--primary)' }}>#{getUserRank()}</h2>
                </div>
              </div>
            </div>
          )}

          {/* Filters */}
          <div className="card mb-4" style={{ padding: '20px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
              <Filter size={18} style={{color: 'var(--black)'}} />
              <span style={{ fontWeight: '600', color: 'var(--dark)' }}>Filter by:</span>
              
              <select
                value={filters.gradeId}
                onChange={(e) => handleFilterChange('gradeId', e.target.value)}
                style={{
                  padding: '8px 12px',
                  borderRadius: '8px',
                  border: '1px solid #E5E7EB',
                  background: 'white',
                  cursor: 'pointer'
                }}
              >
                <option value="">All Grades</option>
                {availableFilters.grades.map(grade => (
                  <option key={grade._id} value={grade._id}>
                    {grade.displayName}
                  </option>
                ))}
              </select>

              <select
                value={filters.school}
                onChange={(e) => handleFilterChange('school', e.target.value)}
                style={{
                  padding: '8px 12px',
                  borderRadius: '8px',
                  border: '1px solid #E5E7EB',
                  background: 'white',
                  cursor: 'pointer'
                }}
              >
                <option value="">All Schools</option>
                {availableFilters.schools.map(school => (
                  <option key={school} value={school}>
                    {school}
                  </option>
                ))}
              </select>

              <select
                value={filters.village}
                onChange={(e) => handleFilterChange('village', e.target.value)}
                style={{
                  padding: '8px 12px',
                  borderRadius: '8px',
                  border: '1px solid #E5E7EB',
                  background: 'white',
                  cursor: 'pointer'
                }}
              >
                <option value="">All Villages</option>
                {availableFilters.villages.map(village => (
                  <option key={village} value={village}>
                    {village}
                  </option>
                ))}
              </select>

              {hasActiveFilters && (
                <button
                  onClick={clearFilters}
                  style={{
                    padding: '8px 16px',
                    borderRadius: '8px',
                    border: 'none',
                    background: '#EF4444',
                    color: 'white',
                    cursor: 'pointer',
                    fontWeight: '600'
                  }}
                >
                  Clear Filters
                </button>
              )}
            </div>
          </div>

          {/* Tabs */}
          <div className="leaderboard-tabs">
            <button 
              className={`leaderboard-tab ${activeTab === 'points' ? 'active' : ''}`}
              onClick={() => setActiveTab('points')}
            >
              ⭐ Top Points
            </button>
            <button 
              className={`leaderboard-tab ${activeTab === 'streaks' ? 'active' : ''}`}
              onClick={() => setActiveTab('streaks')}
            >
              🔥 Top Streaks
            </button>
          </div>

          {/* Leaderboard List */}
          <div className="leaderboard-list">
            {loading ? (
              <div className="text-center p-4">
                <p className="text-white">Loading...</p>
              </div>
            ) : (
              leaderboard.map((student, index) => (
                <div 
                  key={student._id || index} 
                  className="leaderboard-item"
                  style={student._id === user?.id ? { background: 'rgba(79, 70, 229, 0.1)' } : {}}
                >
                  <div className={`leaderboard-rank ${getRankClass(index)}`}>
                    {index + 1}
                  </div>
                  <div className="leaderboard-user">
                    <h4>
                      {student.username} {student._id === user?.id && '(You)'}
                    </h4>
                    <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                      <span className={`level-badge ${student.level?.toLowerCase()}`}>
                        {student.level}
                      </span>
                      {student.grade?.displayName && (
                        <span style={{ fontSize: '0.75rem', color: '#6B7280' }}>
                          📚 {student.grade.displayName}
                        </span>
                      )}
                      {student.school && (
                        <span style={{ fontSize: '0.75rem', color: '#6B7280' }}>
                          🏫 {student.school}
                        </span>
                      )}
                      {student.village && (
                        <span style={{ fontSize: '0.75rem', color: '#6B7280' }}>
                          📍 {student.village}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className={`leaderboard-score ${activeTab}`}>
                    {activeTab === 'points' ? (
                      <>⭐ {student.points}</>
                    ) : (
                      <>🔥 {student.streak?.current || 0}</>
                    )}
                  </div>
                </div>
              ))
            )}
            
            {!loading && leaderboard.length === 0 && (
              <div className="text-center p-4">
                <p className="text-white">No data available</p>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default Leaderboard;

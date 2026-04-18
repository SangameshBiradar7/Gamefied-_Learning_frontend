import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  BarChart, Bar, PieChart, Pie, LineChart, Line, XAxis, YAxis, CartesianGrid,
  Tooltip, Legend, ResponsiveContainer, Area, AreaChart, ComposedChart, ScatterChart
} from 'recharts';
import {
  Home, Users, Trophy, TrendingUp, AlertTriangle, BookOpen, Star,
  Flame, Activity, Target, Award, TrendingDown, Calendar, Clock
} from 'lucide-react';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const AdminAnalytics = () => {
  const { user, token } = useAuth();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState('overview');
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState({});

  // Analytics data states
  const [levelData, setLevelData] = useState([]);
  const [performanceData, setPerformanceData] = useState({ top: [], low: [], streaks: [] });
  const [activityData, setActivityData] = useState([]);
  const [quizAnalytics, setQuizAnalytics] = useState({});
  const [locationAnalytics, setLocationAnalytics] = useState({ villages: [], schools: [] });
  const [attentionData, setAttentionData] = useState({});

  useEffect(() => {
    if (!user || user.role !== 'admin') {
      navigate('/login');
      return;
    }
    fetchAnalytics();
  }, [user, activeTab]);

  const fetchAnalytics = async () => {
    setLoading(true);
    const authHeaders = { Authorization: `Bearer ${token}` };
    try {
      let endpoint = '';
      if (activeTab === 'overview') endpoint = `${API_URL}/analytics/overview`;
      else if (activeTab === 'levels') {
        const res = await fetch(`${API_URL}/analytics/level-distribution`, { headers: authHeaders });
        const result = await res.json();
        setLevelData(result);
        setLoading(false);
        return;
      }
      else if (activeTab === 'performance') {
        await Promise.all([
          fetch(`${API_URL}/analytics/top-students?limit=10`, { headers: authHeaders }).then(r => r.json()).then(setTopStudents),
          fetch(`${API_URL}/analytics/lowest-students?limit=10`, { headers: authHeaders }).then(r => r.json()).then(setLowStudents),
          fetch(`${API_URL}/analytics/top-streaks?limit=10`, { headers: authHeaders }).then(r => r.json()).then(setStreakStudents)
        ]);
        setLoading(false);
        return;
      }
      else if (activeTab === 'activity') {
        const res = await fetch(`${API_URL}/analytics/daily-activity?days=30`, { headers: authHeaders });
        const result = await res.json();
        setActivityData(result);
        setLoading(false);
        return;
      }
      else if (activeTab === 'quizzes') {
        const res = await fetch(`${API_URL}/analytics/quiz-completion`, { headers: authHeaders });
        const quizResult = await res.json();
        setQuizAnalytics(quizResult);
        const performersRes = await fetch(`${API_URL}/analytics/top-quiz-performers?limit=10`, { headers: authHeaders });
        const performers = await performersRes.json();
        setQuizAnalytics(prev => ({ ...prev, topPerformers: performers }));
        setLoading(false);
        return;
      }
      else if (activeTab === 'locations') {
        await Promise.all([
          fetch(`${API_URL}/analytics/village-analytics`, { headers: authHeaders }).then(r => r.json()).then(setVillages),
          fetch(`${API_URL}/analytics/school-analytics`, { headers: authHeaders }).then(r => r.json()).then(setSchools)
        ]);
        setLoading(false);
        return;
      }
      else if (activeTab === 'attention') {
        const res = await fetch(`${API_URL}/analytics/attention-needed?threshold=3`, { headers: authHeaders });
        const result = await res.json();
        setAttentionData(result);
        setLoading(false);
        return;
      }

      if (endpoint) {
        const res = await fetch(endpoint, { headers: authHeaders });
        const result = await res.json();
        setData(result);
      }
    } catch (err) {
      console.error('Failed to fetch analytics:', err);
    } finally {
      setLoading(false);
    }
  };

  const setTopStudents = async (res) => { setPerformanceData(prev => ({ ...prev, top: res })); };
  const setLowStudents = async (res) => { setPerformanceData(prev => ({ ...prev, low: res })); };
  const setStreakStudents = async (res) => { setPerformanceData(prev => ({ ...prev, streaks: res })); };
  const setVillages = async (res) => { setLocationAnalytics(prev => ({ ...prev, villages: res })); };
  const setSchools = async (res) => { setLocationAnalytics(prev => ({ ...prev, schools: res })); };

  const tabs = [
    { id: 'overview', label: 'Overview', icon: <Activity size={18} /> },
    { id: 'levels', label: 'Level Analytics', icon: <Trophy size={18} /> },
    { id: 'performance', label: 'Performance', icon: <Star size={18} /> },
    { id: 'activity', label: 'Activity', icon: <Calendar size={18} /> },
    { id: 'quizzes', label: 'Quiz Analytics', icon: <Target size={18} /> },
    { id: 'locations', label: 'Locations', icon: <BookOpen size={18} /> },
    { id: 'attention', label: 'Attention Needed', icon: <AlertTriangle size={18} /> }
  ];

  return (
    <div className="admin-dashboard">
      <header className="admin-header">
        <div className="container">
          <div className="admin-logo">LearnQuest Admin Analytics</div>
          <nav className="admin-nav">
            {tabs.map(tab => (
              <button
                key={tab.id}
                className={`admin-nav-link ${activeTab === tab.id ? 'active' : ''}`}
                onClick={() => setActiveTab(tab.id)}
              >
                {tab.icon} {tab.label}
              </button>
            ))}
          </nav>
          <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
            <div className="user-avatar">{user?.username?.charAt(0).toUpperCase()}</div>
          </div>
        </div>
      </header>

      <main className="admin-content">
        <div className="container">
          {loading ? (
            <div className="text-center p-4"><p className="text-white">Loading analytics...</p></div>
          ) : (
            <>
              {activeTab === 'overview' && <OverviewTab data={data} />}
              {activeTab === 'levels' && <LevelsTab data={levelData} />}
              {activeTab === 'performance' && <PerformanceTab data={performanceData} />}
              {activeTab === 'activity' && <ActivityTab data={activityData} />}
              {activeTab === 'quizzes' && <QuizAnalyticsTab data={quizAnalytics} />}
              {activeTab === 'locations' && <LocationsTab data={locationAnalytics} />}
              {activeTab === 'attention' && <AttentionTab data={attentionData} />}
            </>
          )}
        </div>
      </main>
    </div>
  );
};

// ============ OVERVIEW TAB ============
const OverviewTab = ({ data }) => (
  <div>
    <div className="page-title"><h1>📊 Admin Overview</h1></div>
    <div className="admin-stats">
      <div className="admin-stat-card">
        <h3>👥 Total Students</h3>
        <div className="value">{data.totalStudents || 0}</div>
      </div>
      <div className="admin-stat-card">
        <h3>🎯 Active (7d)</h3>
        <div className="value">{data.activeStudents || 0}</div>
      </div>
      <div className="admin-stat-card">
        <h3>⭐ Avg Points</h3>
        <div className="value">{data.averagePoints || 0}</div>
      </div>
      <div className="admin-stat-card">
        <h3>🔥 Perfect Streaks</h3>
        <div className="value">{data.perfectStreaks || 0}</div>
      </div>
      <div className="admin-stat-card">
        <h3>📚 Total Subjects</h3>
        <div className="value">{data.totalSubjects || 0}</div>
      </div>
      <div className="admin-stat-card">
        <h3>💎 Total Lessons</h3>
        <div className="value">{data.totalLessons || 0}</div>
      </div>
      <div className="admin-stat-card">
        <h3>🆕 New Today</h3>
        <div className="value">{data.newToday || 0}</div>
      </div>
      <div className="admin-stat-card">
        <h3>🎓 Grades</h3>
        <div className="value">{data.totalGrades || 0}</div>
      </div>
    </div>
  </div>
);

// ============ LEVEL ANALYTICS TAB ============
const LevelsTab = ({ data }) => {
  const distribution = data?.distribution || [];
  const COLORS = ['#6B7280', '#3B82F6', '#8B5CF6', '#EC4899', '#FFD700'];

  return (
    <div>
      <div className="page-title"><h1>🏆 Student Levels</h1></div>
      <div className="card-grid" style={{ marginBottom: '30px' }}>
        <div className="card">
          <h3>Level Distribution</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={distribution}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="level" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="count" name="Students" fill="#4F46E5" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
        <div className="card">
          <h3>Level Breakdown</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie data={distribution} dataKey="count" nameKey="level" cx="50%" cy="50%" outerRadius={80} label />
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>
      <div className="card">
        <h3>Growth Trend (Last 30 Days)</h3>
        <ResponsiveContainer width="100%" height={350}>
          <LineChart data={[]}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Line type="monotone" dataKey="Beginner" stroke="#6B7280" strokeWidth={2} />
            <Line type="monotone" dataKey="Learner" stroke="#3B82F6" strokeWidth={2} />
            <Line type="monotone" dataKey="Advanced" stroke="#8B5CF6" strokeWidth={2} />
            <Line type="monotone" dataKey="Expert" stroke="#EC4899" strokeWidth={2} />
            <Line type="monotone" dataKey="Master" stroke="#FFD700" strokeWidth={2} />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

// ============ PERFORMANCE TAB ============
const PerformanceTab = ({ data }) => {
  const topStudents = data.top || [];
  const lowStudents = data.low || [];
  const streaks = data.streaks || [];

  return (
    <div>
      <div className="page-title"><h1>📈 Performance Analytics</h1></div>

      <div className="card-grid">
        {/* Highest Scoring Students */}
        <div className="card" style={{ gridColumn: 'span 2' }}>
          <h3><Trophy size={20} style={{color:'#FFD700',marginRight:'8px'}}/>Top Performers</h3>
          <div className="leaderboard-list">
            {topStudents.slice(0, 10).map((student, idx) => (
              <div key={student._id || idx} className="leaderboard-item">
                <div className={`leaderboard-rank ${idx < 3 ? (idx === 0 ? 'gold' : idx === 1 ? 'silver' : 'bronze') : ''}`}>
                  {idx + 1}
                </div>
                <div className="leaderboard-user">
                  <h4>{student.username}</h4>
                  <span>{student.grade?.displayName || 'N/A'} • {student.school || 'No school'}</span>
                </div>
                <div className="leaderboard-score points">⭐ {student.points}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Lowest Performing Students */}
        <div className="card" style={{ gridColumn: 'span 2' }}>
          <h3><TrendingDown size={20} style={{color:'#EF4444',marginRight:'8px'}}/>Needs Attention</h3>
          <div className="leaderboard-list">
            {lowStudents.slice(0, 10).map((student, idx) => (
              <div key={student._id || idx} className="leaderboard-item">
                <div className="leaderboard-rank" style={{background: '#FEE2E2', color: '#EF4444'}}>
                  {idx + 1}
                </div>
                <div className="leaderboard-user">
                  <h4>{student.username}</h4>
                  <span>Points: {student.points} • Completed: {student.completedLessons?.length || 0}</span>
                </div>
                <div className="leaderboard-score" style={{color: '#EF4444'}}>
                  🔻 {student.points}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Longest Streaks */}
      <div className="card" style={{ marginTop: '20px' }}>
        <h3><Flame size={20} style={{color:'#F97316',marginRight:'8px'}}/>Longest Learning Streaks</h3>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={streaks.slice(0, 10)} layout="vertical">
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis type="number" />
            <YAxis dataKey="username" type="category" width={120} />
            <Tooltip />
            <Bar dataKey="streak.current" name="Current Streak (days)" fill="#F97316" radius={[0, 8, 8, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

// ============ ACTIVITY TAB ============
const ActivityTab = ({ data }) => {
  const dailyData = data || [];

  return (
    <div>
      <div className="page-title"><h1>📅 Activity Analytics</h1></div>

      <div className="card-grid">
        <div className="card">
          <h3>📊 Daily Active Students (Last 30 Days)</h3>
          <ResponsiveContainer width="100%" height={350}>
            <AreaChart data={dailyData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Area type="monotone" dataKey="uniqueStudents" name="Unique Students" stroke="#4F46E5" fill="#818CF8" />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        <div className="card">
          <h3>📈 Weekly Engagement Summary</h3>
          <ResponsiveContainer width="100%" height={350}>
            <BarChart data={[]}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="weekNumber" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="totalLessons" name="Lessons Completed" fill="#10B981" />
              <Bar dataKey="uniqueStudents" name="Active Students" fill="#F59E0B" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

// ============ QUIZ ANALYTICS TAB ============
const QuizAnalyticsTab = ({ data }) => {
  const quizData = data || {};
  const topPerformers = data?.topPerformers || [];

  return (
    <div>
      <div className="page-title"><h1>🎯 Quiz Analytics</h1></div>

      <div className="admin-stats">
        <div className="admin-stat-card">
          <h3>✅ Completion Rate</h3>
          <div className="value">{Math.round((quizData.totalQuizAttempts / (quizData.totalLessons || 1)) * 100)}%</div>
        </div>
        <div className="admin-stat-card">
          <h3>📊 Avg Score</h3>
          <div className="value">{quizData.averageScore || 0}%</div>
        </div>
        <div className="admin-stat-card">
          <h3>❌ Failed Quizzes</h3>
          <div className="value" style={{color: '#EF4444'}}>{quizData.failedQuizzes || 0}</div>
        </div>
        <div className="admin-stat-card">
          <h3>📝 Total Attempts</h3>
          <div className="value">{quizData.totalQuizAttempts || 0}</div>
        </div>
      </div>

      <div className="card-grid" style={{ marginTop: '20px' }}>
        <div className="card" style={{ gridColumn: 'span 2' }}>
          <h3>🏅 Top Quiz Performers</h3>
          <div className="leaderboard-list">
            {topPerformers.map((student, idx) => (
              <div key={idx} className="leaderboard-item">
                <div className="leaderboard-rank gold">{idx + 1}</div>
                <div className="leaderboard-user">
                  <h4>{student.username}</h4>
                  <span>Avg: {student.avgQuizScore}% • Perfect: {student.perfectQuizzes} • Total: {student.totalQuizzes}</span>
                </div>
                <div className="leaderboard-score points">🎯 {student.avgQuizScore}%</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

// ============ LOCATIONS TAB ============
const LocationsTab = ({ data }) => {
  const villages = data.villages || [];
  const schools = data.schools || [];

  return (
    <div>
      <div className="page-title"><h1>📍 Village & School Analytics</h1></div>

      <div className="card-grid">
        <div className="card" style={{ gridColumn: 'span 2' }}>
          <h3>🏘️ Village Performance (by Avg Points)</h3>
          <ResponsiveContainer width="100%" height={350}>
            <BarChart data={villages}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="village" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="avgPoints" name="Avg Points" fill="#3B82F6" radius={[8, 8, 0, 0]} />
              <Bar dataKey="totalStudents" name="Students" fill="#10B981" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="card" style={{ gridColumn: 'span 2' }}>
          <h3>🏫 School Performance</h3>
          <ResponsiveContainer width="100%" height={350}>
            <ComposedChart data={schools}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="school" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="totalStudents" name="Students" fill="#8B5CF6" />
              <Line type="monotone" dataKey="avgPoints" name="Avg Points" stroke="#F59E0B" strokeWidth={3} />
            </ComposedChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="card-grid" style={{ marginTop: '20px' }}>
        {villages.map((village, idx) => (
          <div key={idx} className="card">
            <h4>{village.village}</h4>
            <p>👥 {village.totalStudents} students</p>
            <p>⭐ Avg: {village.avgPoints} pts</p>
            <p>🔥 Avg Streak: {village.avgStreak} days</p>
            <p>📚 Completed: {village.totalCompletedLessons} lessons</p>
          </div>
        ))}
      </div>
    </div>
  );
};

// ============ ATTENTION TAB ============
const AttentionTab = ({ data }) => {
  const attention = data || {};

  return (
    <div>
      <div className="page-title">
        <h1><AlertTriangle size={28} style={{color:'#EF4444',marginRight:'10px',verticalAlign:'middle'}}/>Attention Needed</h1>
        <p>Students who may need extra guidance and support</p>
      </div>

      <div className="card-grid">
        {/* Inactive Students */}
        <div className="card" style={{ gridColumn: 'span 2' }}>
          <h3><Clock size={20} style={{color:'#6B7280',marginRight:'8px'}}/>Inactive Students</h3>
          <p style={{color: '#6B7280', marginBottom: '15px'}}>
            Students who haven't logged in for 3+ days
          </p>
          <div className="leaderboard-list">
            {(attention.inactive || []).slice(0, 10).map((student, idx) => (
              <div key={idx} className="leaderboard-item">
                <div className="leaderboard-rank" style={{background: '#FEF3C7', color: '#D97706'}}>!</div>
                <div className="leaderboard-user">
                  <h4>{student.username}</h4>
                  <span>{student.grade?.displayName || 'N/A'} • {student.school}</span>
                </div>
                <div className="leaderboard-score streak">
                  🔥 {student.streak?.current || 0} • ⭐ {student.points}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Low Performers */}
        <div className="card" style={{ gridColumn: 'span 2' }}>
          <h3><TrendingDown size={20} style={{color:'#EF4444',marginRight:'8px'}}/>Low Performers</h3>
          <p style={{color: '#6B7280', marginBottom: '15px'}}>
            Students with average quiz scores below 50%
          </p>
          <div className="leaderboard-list">
            {(attention.lowPerformers || []).slice(0, 10).map((student, idx) => (
              <div key={idx} className="leaderboard-item">
                <div className="leaderboard-rank" style={{background: '#FEE2E2', color: '#EF4444'}}>!</div>
                <div className="leaderboard-user">
                  <h4>{student.username}</h4>
                  <span>Avg: {student.avgScore.toFixed(1)}% • {student.totalQuizzes} quizzes</span>
                </div>
                <div className="leaderboard-score" style={{color: '#EF4444'}}>
                  📉 {student.avgScore.toFixed(0)}%
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recommendations */}
      {attention.recommendations && attention.recommendations.length > 0 && (
        <div className="card" style={{ marginTop: '20px' }}>
          <h3><Target size={20} style={{color:'#4F46E5',marginRight:'8px'}}/>Suggested Actions</h3>
          <div className="mission-grid">
            {attention.recommendations.map((rec, idx) => (
              <div key={idx} className="mission-card">
                <h4>{rec.username}</h4>
                <p><strong>Issue:</strong> {rec.issue}</p>
                <p><strong>Action:</strong> {rec.action}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminAnalytics;
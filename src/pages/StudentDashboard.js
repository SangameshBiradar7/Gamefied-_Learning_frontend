import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
  Home, BookOpen, Trophy, Star, Flame, Award, 
  PlayCircle, FileText, LogOut, User, ChevronRight,
  Target, Medal, CheckCircle
} from 'lucide-react';

const API_URL = import.meta.env.VITE_API_URL || 'https://gamefied-earning-backend.onrender.com/api';

const StudentDashboard = () => {
  const { user, token, logout, updateUser } = useAuth();
  const [profile, setProfile] = useState(null);
  const [missions, setMissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }
    if (!user.grade) {
      navigate('/grades');
      return;
    }
    fetchProfile();
    fetchMissions();
  }, [user]);

  const fetchProfile = async () => {
    try {
      const response = await fetch(`${API_URL}/users/me`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await response.json();
      setProfile(data.user);
      updateUser(data.user);
    } catch (err) {
      console.error('Failed to fetch profile:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchMissions = async () => {
    try {
      const response = await fetch(`${API_URL}/missions/daily`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await response.json();
      setMissions(data);
    } catch (err) {
      console.error('Failed to fetch missions:', err);
    }
  };

  const getLevelProgress = () => {
    if (!profile) return 0;
    const levels = [
      { name: 'Beginner', points: 0 },
      { name: 'Learner', points: 500 },
      { name: 'Advanced', points: 2000 },
      { name: 'Expert', points: 5000 },
      { name: 'Master', points: 10000 }
    ];
    const currentLevelIndex = levels.findIndex(l => l.name === profile.level);
    const currentLevelPoints = levels[currentLevelIndex].points;
    const nextLevelPoints = levels[currentLevelIndex + 1]?.points || 10000;
    const progress = ((profile.points - currentLevelPoints) / (nextLevelPoints - currentLevelPoints)) * 100;
    return Math.min(100, Math.max(0, progress));
  };

  const getNextLevelPoints = () => {
    if (!profile) return 0;
    const levels = [
      { name: 'Beginner', points: 0 },
      { name: 'Learner', points: 500 },
      { name: 'Advanced', points: 2000 },
      { name: 'Expert', points: 5000 },
      { name: 'Master', points: 10000 }
    ];
    const currentLevelIndex = levels.findIndex(l => l.name === profile.level);
    return levels[currentLevelIndex + 1]?.points || 10000;
  };

  if (loading) {
    return <div className="loading">Loading...</div>;
  }

  const levelColors = {
    Beginner: 'beginner',
    Learner: 'learner',
    Advanced: 'advanced',
    Expert: 'expert',
    Master: 'master'
  };

  return (
    <div className="dashboard">
      <header className="dashboard-header">
        <div className="container">
          <Link to="/dashboard" className="dashboard-logo">LearnQuest</Link>
          <nav className="dashboard-nav">
            <Link to="/dashboard" className="nav-link active"><Home className="nav-icon" size={20} />Home</Link>
            <Link to="/grades" className="nav-link"><BookOpen className="nav-icon" size={20} />Subjects</Link>
            <Link to="/leaderboard" className="nav-link"><Trophy className="nav-icon" size={20} />Leaderboard</Link>
          </nav>
          <div className="user-info">
            <div className="user-stats">
              <div className="stat-item points">
                <Star className="stat-icon" size={18} color="#F59E0B" />
                <span>{profile?.points || 0}</span>
              </div>
              <div className="stat-item streak">
                <Flame className="stat-icon" size={18} color="#F97316" />
                <span>{profile?.streak?.current || 0}</span>
              </div>
            </div>
            <div className="user-avatar">
              {user?.username?.charAt(0).toUpperCase()}
            </div>
            <button onClick={logout} className="btn btn-outline btn-sm"><LogOut className="btn-icon" size={16} />Logout</button>
          </div>
        </div>
      </header>

      <main className="dashboard-content">
        <div className="container">
          {/* Welcome Section */}
          <div className="page-title">
            <h1>Welcome back, {user?.username}! 👋</h1>
            <p>Continue your learning journey</p>
          </div>

          {/* Level Progress */}
          <div className="level-progress">
            <div className="level-header">
              <div>
                <h3>Your Level</h3>
                <p className="text-gray">Keep learning to level up!</p>
              </div>
              <span className={`level-badge ${levelColors[profile?.level]}`}>
                {profile?.level}
              </span>
            </div>
            <div className="level-progress-bar">
              <div className="level-progress-fill" style={{ width: `${getLevelProgress()}%` }}></div>
            </div>
            <p className="text-gray mt-2">
              {profile?.points} / {getNextLevelPoints()} points to next level
            </p>
          </div>

          {/* Quick Actions */}
          <div className="card-grid mt-4">
            <Link to="/grades" className="card" style={{ textDecoration: 'none' }}>
              <div className="card-header">
                <div className="card-icon" style={{ background: 'var(--black)' }}><BookOpen size={24} /></div>
              </div>
              <h3 className="card-title">Continue Learning</h3>
              <p className="card-description">Pick up where you left off</p>
            </Link>

            <Link to="/leaderboard" className="card" style={{ textDecoration: 'none' }}>
              <div className="card-header">
                <div className="card-icon" style={{ background: 'var(--black)' }}><Trophy size={24} /></div>
              </div>
              <h3 className="card-title">Leaderboard</h3>
              <p className="card-description">See how you rank against others</p>
            </Link>
          </div>

          {/* Badges Section */}
          <div className="card mt-4">
            <h3 className="card-title mb-3"><Award className="icon-md" style={{marginRight: '8px'}} />Your Badges</h3>
            <div className="badges-container">
              {profile?.badges && profile.badges.length > 0 ? (
                profile.badges.map((badge, index) => (
                  <div 
                    key={index} 
                    className="badge-item"
                    style={{ background: 'var(--black)' }}
                    data-tooltip={badge.name}
                  >
                    <Medal size={24} color="#FFD700" />
                  </div>
                ))
              ) : (
                <p className="text-gray">Complete lessons to earn badges!</p>
              )}
            </div>
          </div>

          {/* Daily Missions */}
          <div className="mt-4">
            <h2 className="mb-3"><Target className="icon-md" style={{marginRight: '8px'}} />Daily Missions</h2>
            <div className="missions-grid">
              {missions.map((mission) => (
                <div key={mission.id} className={`mission-card ${mission.completed ? 'completed' : ''}`}>
                  <div className="mission-header">
                    <div>
                      <h4 className="mission-title">{mission.title}</h4>
                      <p className="mission-description">{mission.description}</p>
                    </div>
                    {mission.completed && <CheckCircle size={20} color="var(--secondary)" />}
                  </div>
                  <div className="mission-progress">
                    <div className="mission-progress-bar">
                      <div 
                        className="mission-progress-fill" 
                        style={{ width: `${(mission.progress / mission.targetValue) * 100}%` }}
                      ></div>
                    </div>
                    <span className="mission-points">+{mission.pointsReward}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Recent Activity */}
          {profile?.completedLessons && profile.completedLessons.length > 0 && (
            <div className="card mt-4">
              <h3 className="card-title mb-3"><PlayCircle className="icon-md" style={{marginRight: '8px'}} />Recent Lessons</h3>
              <div className="lesson-list">
                {profile.completedLessons.slice(-5).reverse().map((lesson, index) => (
                  <div key={index} className="lesson-item completed">
                    <div className="lesson-number"><CheckCircle size={20} /></div>
                    <div className="lesson-info">
                      <h4>{lesson.title}</h4>
                      <p>{lesson.subject?.displayName}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default StudentDashboard;

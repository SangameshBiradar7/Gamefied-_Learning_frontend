import React, { useState, useEffect } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Home, BookOpen, Trophy, Star, Flame, PlayCircle, FileText, CheckCircle, ArrowRight } from 'lucide-react';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const LessonView = () => {
  const { subjectId } = useParams();
  const { user, token } = useAuth();
  const [lessons, setLessons] = useState([]);
  const [completedLessons, setCompletedLessons] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }
    fetchLessons();
    fetchProgress();
  }, [user, subjectId]);

  const fetchLessons = async () => {
    try {
      const response = await fetch(`${API_URL}/lessons?subjectId=${subjectId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await response.json();
      setLessons(data);
    } catch (err) {
      console.error('Failed to fetch lessons:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchProgress = async () => {
    try {
      const response = await fetch(`${API_URL}/users/progress/${subjectId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await response.json();
      setCompletedLessons(data.lessons?.filter(l => l.completed).map(l => l.id) || []);
    } catch (err) {
      console.error('Failed to fetch progress:', err);
    }
  };

  const isCompleted = (lessonId) => {
    return completedLessons.includes(lessonId);
  };

  if (loading) {
    return <div className="loading">Loading...</div>;
  }

  return (
    <div className="dashboard">
      <header className="dashboard-header">
        <div className="container">
          <Link to="/subjects" className="dashboard-logo">LearnQuest</Link>
          <nav className="dashboard-nav">
            <Link to="/dashboard" className="nav-link"><Home className="nav-icon" size={20} />Home</Link>
            <Link to="/subjects" className="nav-link"><BookOpen className="nav-icon" size={20} />Subjects</Link>
            <Link to="/leaderboard" className="nav-link"><Trophy className="nav-icon" size={20} />Leaderboard</Link>
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
            <h1><PlayCircle className="icon-lg" style={{marginRight: '10px', verticalAlign: 'middle'}} />Lessons</h1>
            <p>Watch the video, read the notes, and take the quiz!</p>
          </div>

          <div className="lesson-list">
            {lessons.map((lesson, index) => (
              <div 
                key={lesson._id}
                className={`lesson-item ${isCompleted(lesson._id) ? 'completed' : ''}`}
                onClick={() => navigate(`/lesson/${subjectId}/${lesson._id}`)}
                style={{ cursor: 'pointer' }}
              >
                <div className="lesson-number" style={{ background: 'var(--black)' }}>
                  {isCompleted(lesson._id) ? <CheckCircle size={20} /> : index + 1}
                </div>
                <div className="lesson-info">
                  <h4>{lesson.title}</h4>
                  <p>{lesson.description}</p>
                </div>
                <span className={`lesson-status ${isCompleted(lesson._id) ? 'completed' : 'pending'}`}>
                  {isCompleted(lesson._id) ? <><CheckCircle size={14} /> Completed</> : <><ArrowRight size={14} /> Start</>}
                </span>
              </div>
            ))}
          </div>

          {lessons.length === 0 && (
            <div className="card text-center">
              <h3>No lessons available</h3>
              <p className="text-gray">Check back later for new content.</p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default LessonView;

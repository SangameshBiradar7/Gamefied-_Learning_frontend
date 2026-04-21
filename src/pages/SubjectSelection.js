import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Home, GraduationCap, BookOpen, Trophy, Star, Flame, Calculator, FlaskConical, Globe, Book } from 'lucide-react';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const SubjectSelection = () => {
  const { user, token } = useAuth();
  const [subjects, setSubjects] = useState([]);
  const [progress, setProgress] = useState({});
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
    fetchSubjects();
  }, [user]);

  const fetchSubjects = async () => {
    try {
      const response = await fetch(`${API_URL}/subjects?gradeId=${user.grade._id || user.grade}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await response.json();
      setSubjects(data);
      
      // Fetch progress for each subject
      const progressData = {};
      for (const subject of data) {
        const progressResponse = await fetch(`${API_URL}/users/progress/${subject._id}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        const progressInfo = await progressResponse.json();
        progressData[subject._id] = progressInfo;
      }
      setProgress(progressData);
    } catch (err) {
      console.error('Failed to fetch subjects:', err);
    } finally {
      setLoading(false);
    }
  };

  const getSubjectIcon = (name) => {
    const icons = {
      mathematics: <Calculator size={24} />,
      science: <FlaskConical size={24} />,
      english: <Book size={24} />,
      social_studies: <Globe size={24} />
    };
    return icons[name] || <Book size={24} />;
  };

  const getProgressPercent = (subjectId) => {
    const subjectProgress = progress[subjectId];
    if (!subjectProgress || subjectProgress.totalLessons === 0) return 0;
    return Math.round((subjectProgress.completedLessons / subjectProgress.totalLessons) * 100);
  };

  if (loading) {
    return <div className="loading">Loading...</div>;
  }

  return (
    <div className="dashboard">
      <header className="dashboard-header">
        <div className="container">
          <Link to="/dashboard" className="dashboard-logo">LearnQuest</Link>
          <nav className="dashboard-nav">
            <Link to="/dashboard" className="nav-link"><Home className="nav-icon" size={20} />Home</Link>
            <Link to="/grades" className="nav-link"><GraduationCap className="nav-icon" size={20} />Grades</Link>
            <Link to="/subjects" className="nav-link active"><BookOpen className="nav-icon" size={20} />Subjects</Link>
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
            <h1><BookOpen className="icon-lg" style={{marginRight: '10px', verticalAlign: 'middle'}} />Choose a Subject</h1>
            <p>What would you like to learn today?</p>
          </div>

          <div className="card-grid">
            {subjects.map((subject) => {
              const percent = getProgressPercent(subject._id);
              return (
                <Link 
                  key={subject._id}
                  to={`/lesson/${subject._id}`}
                  className="card subject-card"
                  style={{ textDecoration: 'none' }}
                >
                  <div 
                    className="card-icon" 
                    style={{ background: 'var(--black)' }}
                  >
                    {getSubjectIcon(subject.name)}
                  </div>
                  <h3>{subject.displayName}</h3>
                  <p className="card-description">{subject.description}</p>
                  
                  {progress[subject._id] && (
                    <div className="card-footer">
                      <div className="card-progress">
                        <div className="progress-bar">
                          <div 
                            className="progress-fill" 
                            style={{ width: `${percent}%` }}
                          ></div>
                        </div>
                        <span className="progress-text">{percent}%</span>
                      </div>
                      <span className="text-gray">
                        {progress[subject._id]?.completedLessons || 0}/{progress[subject._id]?.totalLessons || 0}
                      </span>
                    </div>
                  )}
                </Link>
              );
            })}
          </div>

          {subjects.length === 0 && (
            <div className="card text-center">
              <h3>No subjects available</h3>
              <p className="text-gray">Please check back later or contact your teacher.</p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default SubjectSelection;

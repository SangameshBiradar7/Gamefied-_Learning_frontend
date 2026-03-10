import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { GraduationCap, Trophy, ChevronRight } from 'lucide-react';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const GradeSelection = () => {
  const { user, token, updateUser } = useAuth();
  const [grades, setGrades] = useState([]);
  const [selectedGrade, setSelectedGrade] = useState(user?.grade?._id || user?.grade || '');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }
    fetchGrades();
  }, [user]);

  const fetchGrades = async () => {
    try {
      const response = await fetch(`${API_URL}/grades`);
      const data = await response.json();
      setGrades(data);
      if (user?.grade?._id) {
        setSelectedGrade(user.grade._id);
      } else if (data.length > 0 && !selectedGrade) {
        setSelectedGrade(data[0]._id);
      }
    } catch (err) {
      console.error('Failed to fetch grades:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleGradeSelect = (gradeId) => {
    setSelectedGrade(gradeId);
  };

  const handleContinue = async () => {
    if (!selectedGrade) return;
    
    setSaving(true);
    try {
      const response = await fetch(`${API_URL}/users/grade`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ gradeId: selectedGrade })
      });
      
      if (response.ok) {
        const data = await response.json();
        const updatedUser = { ...user, grade: data.grade };
        updateUser(updatedUser);
        navigate('/subjects');
      }
    } catch (err) {
      console.error('Failed to save grade:', err);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="loading">Loading...</div>;
  }

  const gradeIcons = [
    <GraduationCap size={40} />,
    <GraduationCap size={40} />,
    <GraduationCap size={40} />,
    <GraduationCap size={40} />,
    <GraduationCap size={40} />
  ];

  return (
    <div className="dashboard">
      <header className="dashboard-header">
        <div className="container">
          <Link to="/dashboard" className="dashboard-logo">LearnQuest</Link>
          <nav className="dashboard-nav">
            <Link to="/grades" className="nav-link active"><GraduationCap className="nav-icon" size={20} />Grades</Link>
            <Link to="/leaderboard" className="nav-link"><Trophy className="nav-icon" size={20} />Leaderboard</Link>
          </nav>
          <div className="user-info">
            <div className="user-avatar">
              {user?.username?.charAt(0).toUpperCase()}
            </div>
          </div>
        </div>
      </header>

      <main className="dashboard-content">
        <div className="container">
          <div className="page-title">
            <h1><GraduationCap className="icon-lg" style={{marginRight: '10px', verticalAlign: 'middle'}} />Choose Your Grade</h1>
            <p>Select the grade you want to study</p>
          </div>

          <div className="grade-grid">
            {grades.map((grade, index) => (
              <div 
                key={grade._id}
                className={`grade-card ${selectedGrade === grade._id ? 'selected' : ''}`}
                onClick={() => handleGradeSelect(grade._id)}
              >
                <div className="grade-icon" style={{ background: 'var(--black)' }}>
                  {gradeIcons[index] || <GraduationCap size={40} />}
                </div>
                <h3>{grade.displayName}</h3>
                <p>{grade.description || 'Start learning'}</p>
              </div>
            ))}
          </div>

          <div className="flex-center mt-4">
            <button 
              className="btn btn-primary" 
              onClick={handleContinue}
              disabled={!selectedGrade || saving}
            >
              {saving ? 'Saving...' : <><span>Continue</span> <ChevronRight size={18} /></>}
            </button>
          </div>
        </div>
      </main>
    </div>
  );
};

export default GradeSelection;

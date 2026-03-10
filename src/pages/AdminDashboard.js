import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

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
  Video: () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <rect x="2" y="4" width="16" height="16" rx="2"/>
      <path d="M22 8l-4 4 4 4V8z"/>
    </svg>
  ),
  Notes: () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
      <polyline points="14 2 14 8 20 8"/>
      <line x1="16" y1="13" x2="8" y2="13"/>
      <line x1="16" y1="17" x2="8" y2="17"/>
      <polyline points="10 9 9 9 8 9"/>
    </svg>
  ),
  Quiz: () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="12" cy="12" r="10"/>
      <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/>
      <line x1="12" y1="17" x2="12.01" y2="17"/>
    </svg>
  ),
  Add: () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="12" cy="12" r="10"/>
      <line x1="12" y1="8" x2="12" y2="16"/>
      <line x1="8" y1="12" x2="16" y2="12"/>
    </svg>
  ),
  Edit: () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
      <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
    </svg>
  ),
  Delete: () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <polyline points="3 6 5 6 21 6"/>
      <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
    </svg>
  ),
  Check: () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <polyline points="20 6 9 17 4 12"/>
    </svg>
  ),
  Close: () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <line x1="18" y1="6" x2="6" y2="18"/>
      <line x1="6" y1="6" x2="18" y2="18"/>
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
  ),
  Dashboard: () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <rect x="3" y="3" width="7" height="7"/>
      <rect x="14" y="3" width="7" height="7"/>
      <rect x="14" y="14" width="7" height="7"/>
      <rect x="3" y="14" width="7" height="7"/>
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
  Save: () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/>
      <polyline points="17 21 17 13 7 13 7 21"/>
      <polyline points="7 3 7 8 15 8"/>
    </svg>
  ),
  Upload: () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
      <polyline points="17 8 12 3 7 8"/>
      <line x1="12" y1="3" x2="12" y2="15"/>
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
  )
};

const AdminDashboard = () => {
  const { user, token, logout } = useAuth();
  const [content, setContent] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState('');
  const [editItem, setEditItem] = useState(null);
  const [selectedGrade, setSelectedGrade] = useState(null);
  const [selectedSubject, setSelectedSubject] = useState(null);
  const [expandedGrades, setExpandedGrades] = useState({});
  const [expandedSubjects, setExpandedSubjects] = useState({});
  const [formData, setFormData] = useState({});
  const [videoFile, setVideoFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [activeTab, setActiveTab] = useState('overview'); // overview, content, students
  const [analytics, setAnalytics] = useState(null);
  const [students, setStudents] = useState([]);
  const [leaderboard, setLeaderboard] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    if (!user || user.role !== 'admin') {
      navigate('/login');
      return;
    }
    fetchContent();
    fetchAnalytics();
  }, [user]);

  useEffect(() => {
    if (activeTab === 'students') {
      fetchStudents();
    } else if (activeTab === 'overview') {
      fetchAnalytics();
    }
  }, [activeTab]);

  const fetchAnalytics = async () => {
    try {
      const response = await fetch(`${API_URL}/analytics/overview`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await response.json();
      setAnalytics(data);
      
      // Also fetch engagement data for top performers
      const engagementRes = await fetch(`${API_URL}/analytics/engagement`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const engagementData = await engagementRes.json();
      setLeaderboard(engagementData.topPerformers || []);
    } catch (err) {
      console.error('Failed to fetch analytics:', err);
    }
  };

  const fetchStudents = async () => {
    try {
      const response = await fetch(`${API_URL}/users?role=student`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await response.json();
      setStudents(data);
    } catch (err) {
      console.error('Failed to fetch students:', err);
    }
  };

  const fetchContent = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${API_URL}/admin/content`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await response.json();
      console.log('Content fetched:', data);
      setContent(data);
    } catch (err) {
      console.error('Failed to fetch content:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (type, id) => {
    if (!confirm(`Are you sure you want to delete this ${type}?`)) return;
    
    try {
      await fetch(`${API_URL}/${type}/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchContent();
    } catch (err) {
      console.error(`Failed to delete ${type}:`, err);
    }
  };

  const openModal = (type, item = null, parentId = null) => {
    setModalType(type);
    setEditItem(item);
    setVideoFile(null); // Reset video file when opening modal
    
    if (type === 'grade') {
      setFormData(item || { name: '', displayName: '', description: '', order: 0 });
    } else if (type === 'subject') {
      setFormData(item || { name: '', displayName: '', description: '', icon: 'book', color: '#4F46E5', gradeId: parentId || '' });
    } else if (type === 'lesson') {
      setFormData(item || { 
        title: '', 
        description: '', 
        subjectId: parentId || '', 
        videoUrl: item?.videoUrl || '', 
        youtubeUrl: item?.youtubeUrl || '',
        notes: item?.notes || '', 
        quiz: item?.quiz || [], 
        pointsReward: item?.pointsReward || 50, 
        quizPointsReward: item?.quizPointsReward || 100,
        order: item?.order || 0,
        existingVideoUrl: item?.videoUrl || '',
        existingYoutubeUrl: item?.youtubeUrl || ''
      });
    }
    
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validation for lesson
    if (modalType === 'lesson' && !formData.subjectId) {
      alert('Please select a subject');
      return;
    }
    
    try {
      const endpoint = modalType === 'grade' ? 'grades' : 
                      modalType === 'subject' ? 'subjects' : 'lessons';
      
      const method = editItem ? 'PUT' : 'POST';
      const url = editItem ? `${API_URL}/${endpoint}/${editItem._id}` : `${API_URL}/${endpoint}`;
      
      console.log('Submitting:', { modalType, endpoint, url, formData, videoFile });
      
      // For lessons, always use FormData to handle video uploads and existing video
      if (modalType === 'lesson') {
        setUploading(true);
        const formDataToSend = new FormData();
        formDataToSend.append('title', formData.title);
        formDataToSend.append('description', formData.description || '');
        formDataToSend.append('subjectId', formData.subjectId || '');
        formDataToSend.append('notes', formData.notes || '');
        formDataToSend.append('videoUrl', formData.videoUrl || '');
        formDataToSend.append('youtubeUrl', formData.youtubeUrl || '');
        formDataToSend.append('existingVideoUrl', formData.existingVideoUrl || '');
        formDataToSend.append('existingYoutubeUrl', formData.existingYoutubeUrl || '');
        formDataToSend.append('quiz', JSON.stringify(formData.quiz || []));
        formDataToSend.append('pointsReward', formData.pointsReward || 50);
        formDataToSend.append('quizPointsReward', formData.quizPointsReward || 100);
        formDataToSend.append('order', formData.order || 0);
        
        // Only append video if a new file is selected
        if (videoFile) {
          formDataToSend.append('video', videoFile);
        }
        
        const response = await fetch(url, {
          method,
          headers: {
            Authorization: `Bearer ${token}`
          },
          body: formDataToSend
        });
        
        const data = await response.json();
        console.log('Lesson save response:', response.status, data);
        
        if (!response.ok) {
          throw new Error(data.error || 'Failed to save lesson');
        }
        
        setUploading(false);
      } else {
        const response = await fetch(url, {
          method,
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`
          },
          body: JSON.stringify(formData)
        });
        
        if (!response.ok) {
          const data = await response.json();
          throw new Error(data.error || 'Failed to save');
        }
      }
      
      setShowModal(false);
      setVideoFile(null);
      fetchContent();
    } catch (err) {
      console.error('Failed to save:', err);
      setUploading(false);
      alert('Failed to save: ' + err.message);
    }
  };

  const toggleGrade = (gradeId) => {
    setExpandedGrades(prev => ({ ...prev, [gradeId]: !prev[gradeId] }));
  };

  const toggleSubject = (subjectId) => {
    setExpandedSubjects(prev => ({ ...prev, [subjectId]: !prev[subjectId] }));
  };

  const addQuizQuestion = () => {
    setFormData({
      ...formData,
      quiz: [...formData.quiz, { 
        question: '', 
        type: 'multiple_choice', 
        options: ['', '', '', ''], 
        correctAnswer: '', 
        points: 10 
      }]
    });
  };

  const updateQuizQuestion = (index, field, value) => {
    const updatedQuiz = [...formData.quiz];
    updatedQuiz[index][field] = value;
    setFormData({ ...formData, quiz: updatedQuiz });
  };

  const updateQuizOption = (questionIndex, optionIndex, value) => {
    const updatedQuiz = [...formData.quiz];
    updatedQuiz[questionIndex].options[optionIndex] = value;
    setFormData({ ...formData, quiz: updatedQuiz });
  };

  const removeQuizQuestion = (index) => {
    const updatedQuiz = formData.quiz.filter((_, i) => i !== index);
    setFormData({ ...formData, quiz: updatedQuiz });
  };

  const getSubjectIcon = (name) => {
    const icons = {
      mathematics: '🧮',
      science: '🔬',
      english: '📖',
      social_studies: '🌍'
    };
    return icons[name] || '📚';
  };

  if (loading) {
    return <div className="loading">Loading...</div>;
  }

  return (
    <div className="admin-dashboard" style={{ minHeight: '100vh', background: '#F3F4F6' }}>
      {/* Header */}
      <header style={{ background: '#1F2937', padding: '15px 0', boxShadow: '0 2px 10px rgba(0,0,0,0.1)' }}>
        <div className="container" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
            <div style={{ width: '40px', height: '40px', background: 'linear-gradient(135deg, #667eea, #764ba2)', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Icons.Grade />
            </div>
            <h1 style={{ color: 'white', fontSize: '1.5rem', margin: 0 }}>LearnQuest Admin</h1>
          </div>
          <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
            <Link to="/dashboard" style={{ color: '#9CA3AF', textDecoration: 'none', padding: '8px 16px', borderRadius: '8px', background: 'rgba(255,255,255,0.1)' }}>
              Student View
            </Link>
            <button onClick={logout} style={{ background: '#EF4444', color: 'white', border: 'none', padding: '8px 16px', borderRadius: '8px', cursor: 'pointer' }}>
              Logout
            </button>
          </div>
        </div>
      </header>

      <main className="container" style={{ padding: '30px 20px' }}>
        {/* Tabs Navigation */}
        <div style={{ display: 'flex', gap: '10px', marginBottom: '30px', borderBottom: '2px solid #E5E7EB', paddingBottom: '10px' }}>
          <button 
            onClick={() => setActiveTab('overview')}
            style={{ 
              padding: '12px 24px', 
              border: 'none', 
              background: activeTab === 'overview' ? '#4F46E5' : 'transparent',
              color: activeTab === 'overview' ? 'white' : '#6B7280',
              borderRadius: '8px 8px 0 0',
              cursor: 'pointer',
              fontWeight: '600',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}
          >
            <Icons.Dashboard /> Overview
          </button>
          <button 
            onClick={() => setActiveTab('content')}
            style={{ 
              padding: '12px 24px', 
              border: 'none', 
              background: activeTab === 'content' ? '#4F46E5' : 'transparent',
              color: activeTab === 'content' ? 'white' : '#6B7280',
              borderRadius: '8px 8px 0 0',
              cursor: 'pointer',
              fontWeight: '600',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}
          >
            <Icons.Grade /> Content
          </button>
          <button 
            onClick={() => setActiveTab('students')}
            style={{ 
              padding: '12px 24px', 
              border: 'none', 
              background: activeTab === 'students' ? '#4F46E5' : 'transparent',
              color: activeTab === 'students' ? 'white' : '#6B7280',
              borderRadius: '8px 8px 0 0',
              cursor: 'pointer',
              fontWeight: '600',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}
          >
            <Icons.Users /> Students
          </button>
        </div>

        {/* Overview Tab - Analytics & Leaderboard */}
        {activeTab === 'overview' && (
          <div>
            {/* Analytics Stats */}
            <div style={{ marginBottom: '30px' }}>
              <h2 style={{ color: '#1F2937', marginBottom: '20px' }}>Analytics Overview</h2>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px' }}>
                <div style={{ background: 'white', padding: '20px', borderRadius: '12px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <div style={{ width: '40px', height: '40px', background: '#EEF2FF', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <Icons.Users />
                    </div>
                    <div>
                      <p style={{ color: '#6B7280', margin: 0, fontSize: '0.875rem' }}>Total Students</p>
                      <h3 style={{ margin: 0, fontSize: '1.5rem' }}>{analytics?.totalStudents || 0}</h3>
                    </div>
                  </div>
                </div>
                <div style={{ background: 'white', padding: '20px', borderRadius: '12px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <div style={{ width: '40px', height: '40px', background: '#ECFDF5', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <Icons.Check />
                    </div>
                    <div>
                      <p style={{ color: '#6B7280', margin: 0, fontSize: '0.875rem' }}>Active (7 days)</p>
                      <h3 style={{ margin: 0, fontSize: '1.5rem' }}>{analytics?.activeStudents || 0}</h3>
                    </div>
                  </div>
                </div>
                <div style={{ background: 'white', padding: '20px', borderRadius: '12px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <div style={{ width: '40px', height: '40px', background: '#FEF3C7', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <Icons.Grade />
                    </div>
                    <div>
                      <p style={{ color: '#6B7280', margin: 0, fontSize: '0.875rem' }}>Total Grades</p>
                      <h3 style={{ margin: 0, fontSize: '1.5rem' }}>{analytics?.totalGrades || 0}</h3>
                    </div>
                  </div>
                </div>
                <div style={{ background: 'white', padding: '20px', borderRadius: '12px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <div style={{ width: '40px', height: '40px', background: '#FCE7F3', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <Icons.Subject />
                    </div>
                    <div>
                      <p style={{ color: '#6B7280', margin: 0, fontSize: '0.875rem' }}>Total Subjects</p>
                      <h3 style={{ margin: 0, fontSize: '1.5rem' }}>{analytics?.totalSubjects || 0}</h3>
                    </div>
                  </div>
                </div>
                <div style={{ background: 'white', padding: '20px', borderRadius: '12px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <div style={{ width: '40px', height: '40px', background: '#FED7AA', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <Icons.Lesson />
                    </div>
                    <div>
                      <p style={{ color: '#6B7280', margin: 0, fontSize: '0.875rem' }}>Total Lessons</p>
                      <h3 style={{ margin: 0, fontSize: '1.5rem' }}>{analytics?.totalLessons || 0}</h3>
                    </div>
                  </div>
                </div>
                <div style={{ background: 'white', padding: '20px', borderRadius: '12px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <div style={{ width: '40px', height: '40px', background: '#DBEAFE', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <span style={{ fontSize: '1.25rem' }}>⭐</span>
                    </div>
                    <div>
                      <p style={{ color: '#6B7280', margin: 0, fontSize: '0.875rem' }}>Avg Points</p>
                      <h3 style={{ margin: 0, fontSize: '1.5rem' }}>{Math.round(analytics?.averagePoints || 0)}</h3>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Leaderboard Section */}
            <div style={{ background: 'white', borderRadius: '12px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', padding: '20px' }}>
              <h2 style={{ color: '#1F2937', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                <span>🏆</span> Top Leaderboard - Top 10 Students
              </h2>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ borderBottom: '2px solid #E5E7EB' }}>
                    <th style={{ textAlign: 'left', padding: '12px', color: '#6B7280' }}>Rank</th>
                    <th style={{ textAlign: 'left', padding: '12px', color: '#6B7280' }}>Student</th>
                    <th style={{ textAlign: 'left', padding: '12px', color: '#6B7280' }}>Level</th>
                    <th style={{ textAlign: 'left', padding: '12px', color: '#6B7280' }}>Lessons Completed</th>
                    <th style={{ textAlign: 'right', padding: '12px', color: '#6B7280' }}>Points</th>
                  </tr>
                </thead>
                <tbody>
                  {leaderboard.map((student, index) => (
                    <tr key={student._id} style={{ borderBottom: '1px solid #E5E7EB' }}>
                      <td style={{ padding: '12px' }}>
                        <span style={{ 
                          display: 'inline-flex', 
                          alignItems: 'center', 
                          justifyContent: 'center',
                          width: '30px', 
                          height: '30px', 
                          borderRadius: '50%',
                          background: index === 0 ? 'linear-gradient(135deg, #FFD700, #FFA500)' : 
                                     index === 1 ? 'linear-gradient(135deg, #C0C0C0, #808080)' : 
                                     index === 2 ? 'linear-gradient(135deg, #CD7F32, #8B4513)' : '#E5E7EB',
                          color: index < 3 ? 'white' : '#6B7280',
                          fontWeight: 'bold'
                        }}>
                          {index + 1}
                        </span>
                      </td>
                      <td style={{ padding: '12px', fontWeight: '600' }}>{student.username}</td>
                      <td style={{ padding: '12px' }}>
                        <span style={{ 
                          padding: '4px 12px', 
                          borderRadius: '20px', 
                          fontSize: '0.875rem',
                          background: student.level === 'Master' ? '#FEF3C7' : 
                                     student.level === 'Expert' ? '#F3E8FF' : 
                                     student.level === 'Advanced' ? '#D1FAE5' : 
                                     student.level === 'Learner' ? '#DBEAFE' : '#E5E7EB',
                          color: student.level === 'Master' ? '#92400E' : 
                                 student.level === 'Expert' ? '#7C3AED' : 
                                 student.level === 'Advanced' ? '#059669' : 
                                 student.level === 'Learner' ? '#2563EB' : '#6B7280'
                        }}>
                          {student.level}
                        </span>
                      </td>
                      <td style={{ padding: '12px' }}>{student.completedLessons?.length || 0}</td>
                      <td style={{ padding: '12px', textAlign: 'right', fontWeight: 'bold', color: '#4F46E5' }}>{student.points}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {leaderboard.length === 0 && (
                <p style={{ textAlign: 'center', color: '#6B7280', padding: '40px' }}>No students yet</p>
              )}
            </div>
          </div>
        )}

        {/* Content Tab - Original Content Management */}
        {activeTab === 'content' && (
          <div>
            {/* Page Title */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
              <div>
                <h2 style={{ color: '#1F2937', margin: 0 }}>Content Management</h2>
                <p style={{ color: '#6B7280', margin: '5px 0 0 0' }}>Manage grades, subjects, and lessons in hierarchical order</p>
              </div>
              <button className="btn btn-primary" onClick={() => openModal('grade')} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Icons.Add /> Add Grade
              </button>
            </div>

        {/* Hierarchical Content Display */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {content.map((gradeData) => (
            <div key={gradeData.grade._id} style={{ background: 'white', borderRadius: '12px', overflow: 'hidden', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
              {/* Grade Header */}
              <div 
                onClick={() => toggleGrade(gradeData.grade._id)}
                style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'space-between',
                  padding: '20px', 
                  background: expandedGrades[gradeData.grade._id] ? 'linear-gradient(135deg, #667eea, #764ba2)' : '#F9FAFB',
                  color: expandedGrades[gradeData.grade._id] ? 'white' : '#1F2937',
                  cursor: 'pointer',
                  transition: 'all 0.3s'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                  <div style={{ 
                    width: '48px', 
                    height: '48px', 
                    background: expandedGrades[gradeData.grade._id] ? 'rgba(255,255,255,0.2)' : '#EEF2FF',
                    borderRadius: '12px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: expandedGrades[gradeData.grade._id] ? 'white' : '#4F46E5'
                  }}>
                    <Icons.Grade />
                  </div>
                  <div>
                    <h3 style={{ margin: 0, fontSize: '1.2rem' }}>{gradeData.grade.displayName}</h3>
                    <p style={{ margin: '3px 0 0 0', opacity: 0.8, fontSize: '0.9rem' }}>{gradeData.subjects.length} Subjects</p>
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <button 
                    onClick={(e) => { e.stopPropagation(); openModal('subject', null, gradeData.grade._id); }}
                    style={{ 
                      background: expandedGrades[gradeData.grade._id] ? 'rgba(255,255,255,0.2)' : '#4F46E5', 
                      color: 'white', border: 'none', padding: '8px 16px', borderRadius: '8px', cursor: 'pointer',
                      display: 'flex', alignItems: 'center', gap: '5px', fontSize: '0.85rem'
                    }}
                  >
                    <Icons.Add /> Subject
                  </button>
                  <button 
                    onClick={(e) => { e.stopPropagation(); openModal('grade', gradeData.grade); }}
                    style={{ background: 'rgba(255,255,255,0.2)', border: 'none', padding: '8px', borderRadius: '8px', cursor: 'pointer', color: 'white' }}
                  >
                    <Icons.Edit />
                  </button>
                  {expandedGrades[gradeData.grade._id] ? <Icons.ChevronDown /> : <Icons.ChevronRight />}
                </div>
              </div>

              {/* Subjects */}
              {expandedGrades[gradeData.grade._id] && (
                <div style={{ borderTop: '1px solid #E5E7EB' }}>
                  {gradeData.subjects.map((subjectData) => (
                    <div key={subjectData.subject._id} style={{ borderBottom: '1px solid #E5E7EB' }}>
                      {/* Subject Header */}
                      <div 
                        onClick={() => toggleSubject(subjectData.subject._id)}
                        style={{ 
                          display: 'flex', 
                          alignItems: 'center', 
                          justifyContent: 'space-between',
                          padding: '15px 20px 15px 40px', 
                          background: expandedSubjects[subjectData.subject._id] ? '#EEF2FF' : 'white',
                          cursor: 'pointer',
                          transition: 'all 0.2s'
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                          <div style={{ 
                            width: '40px', 
                            height: '40px', 
                            background: subjectData.subject.color || '#4F46E5',
                            borderRadius: '10px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: '1.2rem'
                          }}>
                            {getSubjectIcon(subjectData.subject.name)}
                          </div>
                          <div>
                            <h4 style={{ margin: 0, color: '#1F2937' }}>{subjectData.subject.displayName}</h4>
                            <p style={{ margin: '3px 0 0 0', color: '#6B7280', fontSize: '0.85rem' }}>{subjectData.lessonCount} Lessons</p>
                          </div>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                          <button 
                            onClick={(e) => { e.stopPropagation(); openModal('lesson', null, subjectData.subject._id); }}
                            style={{ 
                              background: subjectData.subject.color || '#4F46E5', 
                              color: 'white', border: 'none', padding: '6px 12px', borderRadius: '6px', cursor: 'pointer',
                              fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '5px'
                            }}
                          >
                            <Icons.Add /> Lesson
                          </button>
                          <button 
                            onClick={(e) => { e.stopPropagation(); openModal('subject', subjectData.subject); }}
                            style={{ background: '#F3F4F6', border: 'none', padding: '6px', borderRadius: '6px', cursor: 'pointer', color: '#6B7280' }}
                          >
                            <Icons.Edit />
                          </button>
                          {expandedSubjects[subjectData.subject._id] ? <Icons.ChevronDown /> : <Icons.ChevronRight />}
                        </div>
                      </div>

                      {/* Lessons */}
                      {expandedSubjects[subjectData.subject._id] && (
                        <div style={{ background: '#F9FAFB', padding: '10px 20px 10px 60px' }}>
                          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '10px' }}>
                            {subjectData.lessons?.map((lesson) => (
                              <div key={lesson._id} style={{ 
                                background: 'white', 
                                borderRadius: '8px', 
                                padding: '15px',
                                border: '1px solid #E5E7EB',
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center'
                              }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flex: 1 }}>
                                  <div style={{ 
                                    width: '32px', 
                                    height: '32px', 
                                    background: '#EEF2FF',
                                    borderRadius: '6px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    color: '#4F46E5'
                                  }}>
                                    <Icons.Lesson />
                                  </div>
                                  <div style={{ flex: 1, minWidth: 0 }}>
                                    <p style={{ margin: 0, fontWeight: '600', color: '#1F2937', fontSize: '0.9rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                      {lesson.title}
                                    </p>
                                    <div style={{ display: 'flex', gap: '10px', marginTop: '3px' }}>
                                      {lesson.videoUrl && <span style={{ fontSize: '0.7rem', color: '#10B981' }}>📹 Video</span>}
                                      {lesson.quiz?.length > 0 && <span style={{ fontSize: '0.7rem', color: '#F59E0B' }}>❓ {lesson.quiz.length} Qs</span>}
                                    </div>
                                  </div>
                                </div>
                                <div style={{ display: 'flex', gap: '5px' }}>
                                  <button 
                                    onClick={() => openModal('lesson', lesson)}
                                    style={{ background: '#F3F4F6', border: 'none', padding: '6px', borderRadius: '6px', cursor: 'pointer', color: '#6B7280' }}
                                  >
                                    <Icons.Edit />
                                  </button>
                                  <button 
                                    onClick={() => handleDelete('lessons', lesson._id)}
                                    style={{ background: '#FEE2E2', border: 'none', padding: '6px', borderRadius: '6px', cursor: 'pointer', color: '#EF4444' }}
                                  >
                                    <Icons.Delete />
                                  </button>
                                </div>
                              </div>
                            ))}
                            {(!subjectData.lessons || subjectData.lessons.length === 0) && (
                              <p style={{ color: '#9CA3AF', fontSize: '0.9rem', gridColumn: '1 / -1', textAlign: 'center', padding: '20px' }}>
                                No lessons yet. Click "Lesson" to add one.
                              </p>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                  {gradeData.subjects.length === 0 && (
                    <div style={{ padding: '30px', textAlign: 'center', color: '#9CA3AF' }}>
                      No subjects yet. Click "Subject" to add one.
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}

          {content.length === 0 && (
            <div style={{ background: 'white', borderRadius: '12px', padding: '60px', textAlign: 'center' }}>
              <div style={{ width: '80px', height: '80px', background: '#F3F4F6', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px' }}>
                <Icons.Grade />
              </div>
              <h3 style={{ color: '#1F2937', marginBottom: '10px' }}>No Content Yet</h3>
              <p style={{ color: '#6B7280', marginBottom: '20px' }}>Start by adding a grade to create your content hierarchy</p>
              <button className="btn btn-primary" onClick={() => openModal('grade')}>
                <Icons.Add /> Add First Grade
              </button>
            </div>
          )}
        </div>
        </div>
        )}

        {/* Students Tab */}
        {activeTab === 'students' && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
              <div>
                <h2 style={{ color: '#1F2937', margin: 0 }}>Student Management</h2>
                <p style={{ color: '#6B7280', margin: '5px 0 0 0' }}>View and manage all registered students</p>
              </div>
              <div style={{ background: 'white', padding: '8px 16px', borderRadius: '8px' }}>
                <strong>{students.length}</strong> Students Registered
              </div>
            </div>

            <div style={{ background: 'white', borderRadius: '12px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', overflow: 'hidden' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ background: '#F9FAFB', borderBottom: '2px solid #E5E7EB' }}>
                    <th style={{ textAlign: 'left', padding: '15px', color: '#6B7280', fontWeight: '600' }}>#</th>
                    <th style={{ textAlign: 'left', padding: '15px', color: '#6B7280', fontWeight: '600' }}>Username</th>
                    <th style={{ textAlign: 'left', padding: '15px', color: '#6B7280', fontWeight: '600' }}>Grade</th>
                    <th style={{ textAlign: 'left', padding: '15px', color: '#6B7280', fontWeight: '600' }}>Level</th>
                    <th style={{ textAlign: 'center', padding: '15px', color: '#6B7280', fontWeight: '600' }}>Points</th>
                    <th style={{ textAlign: 'center', padding: '15px', color: '#6B7280', fontWeight: '600' }}>Streak</th>
                    <th style={{ textAlign: 'center', padding: '15px', color: '#6B7280', fontWeight: '600' }}>Lessons</th>
                    <th style={{ textAlign: 'center', padding: '15px', color: '#6B7280', fontWeight: '600' }}>Badges</th>
                    <th style={{ textAlign: 'center', padding: '15px', color: '#6B7280', fontWeight: '600' }}>Joined</th>
                  </tr>
                </thead>
                <tbody>
                  {students.map((student, index) => (
                    <tr key={student._id} style={{ borderBottom: '1px solid #E5E7EB' }}>
                      <td style={{ padding: '15px' }}>{index + 1}</td>
                      <td style={{ padding: '15px', fontWeight: '600' }}>{student.username}</td>
                      <td style={{ padding: '15px' }}>{student.grade?.displayName || 'Not assigned'}</td>
                      <td style={{ padding: '15px' }}>
                        <span style={{ 
                          padding: '4px 12px', 
                          borderRadius: '20px', 
                          fontSize: '0.875rem',
                          background: student.level === 'Master' ? '#FEF3C7' : 
                                     student.level === 'Expert' ? '#F3E8FF' : 
                                     student.level === 'Advanced' ? '#D1FAE5' : 
                                     student.level === 'Learner' ? '#DBEAFE' : '#E5E7EB',
                          color: student.level === 'Master' ? '#92400E' : 
                                 student.level === 'Expert' ? '#7C3AED' : 
                                 student.level === 'Advanced' ? '#059669' : 
                                 student.level === 'Learner' ? '#2563EB' : '#6B7280'
                        }}>
                          {student.level}
                        </span>
                      </td>
                      <td style={{ padding: '15px', textAlign: 'center', fontWeight: 'bold', color: '#4F46E5' }}>{student.points}</td>
                      <td style={{ padding: '15px', textAlign: 'center' }}>
                        <span style={{ color: student.streak?.current > 0 ? '#F97316' : '#6B7280' }}>
                          🔥 {student.streak?.current || 0}
                        </span>
                      </td>
                      <td style={{ padding: '15px', textAlign: 'center' }}>{student.completedLessons?.length || 0}</td>
                      <td style={{ padding: '15px', textAlign: 'center' }}>{student.badges?.length || 0}</td>
                      <td style={{ padding: '15px', textAlign: 'center', color: '#6B7280', fontSize: '0.875rem' }}>
                        {new Date(student.createdAt).toLocaleDateString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {students.length === 0 && (
                <div style={{ padding: '40px', textAlign: 'center', color: '#6B7280' }}>
                  <Icons.Users />
                  <p>No students registered yet</p>
                </div>
              )}
            </div>
          </div>
        )}
      </main>

      {/* Modal */}
      {showModal && (
        <div style={{ 
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, 
          background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', 
          justifyContent: 'center', zIndex: 1000, padding: '20px' 
        }}>
          <div style={{ 
            background: 'white', borderRadius: '16px', padding: '30px', 
            width: '100%', maxWidth: '700px', maxHeight: '90vh', overflowY: 'auto' 
          }}>
            {/* Modal Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '25px', borderBottom: '1px solid #E5E7EB', paddingBottom: '15px' }}>
              <h2 style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '10px' }}>
                {modalType === 'grade' && <><Icons.Grade /> {editItem ? 'Edit Grade' : 'Add New Grade'}</>}
                {modalType === 'subject' && <><Icons.Subject /> {editItem ? 'Edit Subject' : 'Add New Subject'}</>}
                {modalType === 'lesson' && <><Icons.Lesson /> {editItem ? 'Edit Lesson' : 'Add New Lesson'}</>}
              </h2>
              <button onClick={() => setShowModal(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '5px' }}>
                <Icons.Close />
              </button>
            </div>
            
            <form onSubmit={handleSubmit}>
              {/* Grade Form */}
              {modalType === 'grade' && (
                <>
                  <div className="form-group">
                    <label>Grade Name (URL Slug)</label>
                    <input type="text" value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value.toLowerCase().replace(/\s+/g, '_')})} required placeholder="e.g., grade_6" style={{ width: '100%', padding: '12px', border: '2px solid #E5E7EB', borderRadius: '8px' }} />
                  </div>
                  <div className="form-group">
                    <label>Display Name</label>
                    <input type="text" value={formData.displayName} onChange={(e) => setFormData({...formData, displayName: e.target.value})} required placeholder="e.g., Grade 6" style={{ width: '100%', padding: '12px', border: '2px solid #E5E7EB', borderRadius: '8px' }} />
                  </div>
                  <div className="form-group">
                    <label>Description</label>
                    <textarea value={formData.description} onChange={(e) => setFormData({...formData, description: e.target.value})} rows={3} style={{ width: '100%', padding: '12px', border: '2px solid #E5E7EB', borderRadius: '8px' }} />
                  </div>
                  <div className="form-group">
                    <label>Order</label>
                    <input type="number" value={formData.order} onChange={(e) => setFormData({...formData, order: parseInt(e.target.value)})} style={{ width: '100px', padding: '12px', border: '2px solid #E5E7EB', borderRadius: '8px' }} />
                  </div>
                </>
              )}

              {/* Subject Form */}
              {modalType === 'subject' && (
                <>
                  <div className="form-group">
                    <label>Subject Name</label>
                    <input type="text" value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value.toLowerCase().replace(/\s+/g, '_')})} required placeholder="e.g., mathematics" style={{ width: '100%', padding: '12px', border: '2px solid #E5E7EB', borderRadius: '8px' }} />
                  </div>
                  <div className="form-group">
                    <label>Display Name</label>
                    <input type="text" value={formData.displayName} onChange={(e) => setFormData({...formData, displayName: e.target.value})} required placeholder="e.g., Mathematics" style={{ width: '100%', padding: '12px', border: '2px solid #E5E7EB', borderRadius: '8px' }} />
                  </div>
                  <div className="form-group">
                    <label>Description</label>
                    <textarea value={formData.description} onChange={(e) => setFormData({...formData, description: e.target.value})} rows={2} style={{ width: '100%', padding: '12px', border: '2px solid #E5E7EB', borderRadius: '8px' }} />
                  </div>
                  <div className="form-group">
                    <label>Color Theme</label>
                    <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                      {['#4F46E5', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899', '#06B6D4', '#84CC16'].map(color => (
                        <div 
                          key={color}
                          onClick={() => setFormData({...formData, color})}
                          style={{ 
                            width: '40px', height: '40px', borderRadius: '8px', background: color, cursor: 'pointer',
                            border: formData.color === color ? '3px solid #1F2937' : '3px solid transparent'
                          }}
                        />
                      ))}
                    </div>
                  </div>
                  <div className="form-group">
                    <label>Grade</label>
                    <select value={formData.gradeId} onChange={(e) => setFormData({...formData, gradeId: e.target.value})} required style={{ width: '100%', padding: '12px', border: '2px solid #E5E7EB', borderRadius: '8px' }}>
                      <option value="">Select Grade</option>
                      {content.map((g) => (
                        <option key={g.grade._id} value={g.grade._id}>{g.grade.displayName}</option>
                      ))}
                    </select>
                  </div>
                </>
              )}

              {/* Lesson Form */}
              {modalType === 'lesson' && (
                <>
                  <div className="form-group">
                    <label>Lesson Title</label>
                    <input type="text" value={formData.title} onChange={(e) => setFormData({...formData, title: e.target.value})} required placeholder="e.g., Introduction to Algebra" style={{ width: '100%', padding: '12px', border: '2px solid #E5E7EB', borderRadius: '8px' }} />
                  </div>
                  <div className="form-group">
                    <label>Description</label>
                    <textarea value={formData.description} onChange={(e) => setFormData({...formData, description: e.target.value})} rows={2} style={{ width: '100%', padding: '12px', border: '2px solid #E5E7EB', borderRadius: '8px' }} />
                  </div>
                  <div className="form-group">
                    <label>Subject</label>
                    <select value={formData.subjectId} onChange={(e) => setFormData({...formData, subjectId: e.target.value})} required style={{ width: '100%', padding: '12px', border: '2px solid #E5E7EB', borderRadius: '8px' }}>
                      <option value="">Select Subject</option>
                      {content.flatMap(g => g.subjects.map(s => (
                        <option key={s.subject._id} value={s.subject._id}>{g.grade.displayName} - {s.subject.displayName}</option>
                      )))}
                    </select>
                  </div>
                  
                  {/* Video Upload Section */}
                  <div style={{ background: '#EEF2FF', padding: '20px', borderRadius: '12px', marginBottom: '20px' }}>
                    <h4 style={{ margin: '0 0 15px 0', display: 'flex', alignItems: 'center', gap: '8px', color: '#4F46E5' }}>
                      <Icons.Video /> Video Lecture
                    </h4>
                    
                    {/* Show existing YouTube video when editing */}
                    {editItem?.youtubeUrl && !formData.youtubeUrl && (
                      <div style={{ marginBottom: '15px', padding: '12px', background: '#D1FAE5', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#065F46' }}>
                          <Icons.Check />
                          <span>YouTube video already linked</span>
                        </div>
                        <button 
                          type="button" 
                          onClick={() => {
                            setFormData({...formData, existingYoutubeUrl: '', youtubeUrl: ''});
                          }}
                          style={{ color: '#EF4444', background: 'none', border: 'none', cursor: 'pointer', fontSize: '0.85rem' }}
                        >
                          Remove
                        </button>
                      </div>
                    )}
                    
                    {/* YouTube URL Option */}
                    <div style={{ marginBottom: '15px' }}>
                      <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500', color: '#374151' }}>YouTube Video URL</label>
                      <input 
                        type="url" 
                        value={formData.youtubeUrl || ''} 
                        onChange={(e) => {
                          setFormData({...formData, youtubeUrl: e.target.value, existingYoutubeUrl: ''});
                        }} 
                        placeholder="https://www.youtube.com/watch?v=..." 
                        style={{ width: '100%', padding: '12px', border: '2px solid #E5E7EB', borderRadius: '8px', background: 'white' }} 
                      />
                      <small style={{ color: '#6B7280', display: 'block', marginTop: '5px' }}>Paste a YouTube URL (works with youtube.com/watch, youtu.be, youtube.com/shorts)</small>
                    </div>
                    
                    <div style={{ textAlign: 'center', color: '#6B7280', margin: '10px 0', fontWeight: '500' }}>— OR —</div>
                    
                    {/* Show existing video when editing */}
                    {editItem?.videoUrl && !videoFile && !formData.youtubeUrl && (
                      <div style={{ marginBottom: '15px', padding: '12px', background: '#D1FAE5', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#065F46' }}>
                          <Icons.Check />
                          <span>Video already uploaded</span>
                        </div>
                        <button 
                          type="button" 
                          onClick={() => {
                            setFormData({...formData, existingVideoUrl: '', videoUrl: ''});
                          }}
                          style={{ color: '#EF4444', background: 'none', border: 'none', cursor: 'pointer', fontSize: '0.85rem' }}
                        >
                          Remove Video
                        </button>
                      </div>
                    )}
                    
                    {/* File Upload Option */}
                    <div style={{ marginBottom: '15px' }}>
                      <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500', color: '#374151' }}>Upload Video File</label>
                      <input 
                        type="file" 
                        accept="video/*"
                        onChange={(e) => {
                          const file = e.target.files[0];
                          if (file) {
                            setVideoFile(file);
                            setFormData({...formData, videoUrl: '', existingVideoUrl: ''});
                          }
                        }}
                        style={{ width: '100%', padding: '10px', border: '2px solid #E5E7EB', borderRadius: '8px', background: 'white' }}
                      />
                      {videoFile && (
                        <div style={{ marginTop: '10px', padding: '10px', background: '#D1FAE5', borderRadius: '6px', color: '#065F46' }}>
                          <strong>Selected:</strong> {videoFile.name}
                        </div>
                      )}
                      <small style={{ color: '#6B7280', display: 'block', marginTop: '5px' }}>Upload video directly from your computer (MP4, WebM - max 500MB)</small>
                    </div>
                    
                    <div style={{ textAlign: 'center', color: '#6B7280', margin: '10px 0', fontWeight: '500' }}>— OR —</div>
                    
                    {/* URL Input Option */}
                    <div className="form-group">
                      <label>Video URL</label>
                      <input 
                        type="url" 
                        value={formData.videoUrl || ''} 
                        onChange={(e) => {
                          setFormData({...formData, videoUrl: e.target.value, existingVideoUrl: ''});
                          setVideoFile(null);
                        }} 
                        placeholder="https://example.com/video.mp4" 
                        disabled={!!videoFile || !!formData.youtubeUrl}
                        style={{ width: '100%', padding: '12px', border: '2px solid #E5E7EB', borderRadius: '8px', background: (videoFile || formData.youtubeUrl) ? '#F9FAFB' : 'white' }} 
                      />
                      <small style={{ color: '#6B7280' }}>Paste a direct video URL (not YouTube)</small>
                    </div>
                  </div>

                  {/* Notes Section */}
                  <div style={{ background: '#FEF3C7', padding: '20px', borderRadius: '12px', marginBottom: '20px' }}>
                    <h4 style={{ margin: '0 0 15px 0', display: 'flex', alignItems: 'center', gap: '8px', color: '#D97706' }}>
                      <Icons.Notes /> Lesson Notes
                    </h4>
                    <div className="form-group">
                      <label style={{ fontWeight: '600', marginBottom: '8px', display: 'block' }}>Lesson Notes</label>
                      <textarea 
                        value={formData.notes} 
                        onChange={(e) => setFormData({...formData, notes: e.target.value})} 
                        rows={8} 
                        placeholder="Enter the lesson notes here. Use new lines for separate paragraphs..." 
                        style={{ width: '100%', padding: '12px', border: '2px solid #E5E7EB', borderRadius: '8px' }} 
                      />
                      <p style={{ fontSize: '0.8rem', color: '#6B7280', marginTop: '5px' }}>
                        💡 Tip: Press Enter for new lines. The formatting will appear exactly as you type it.
                      </p>
                    </div>
                  </div>

                  {/* Quiz Section */}
                  <div style={{ background: '#ECFDF5', padding: '20px', borderRadius: '12px', marginBottom: '20px' }}>
                    <h4 style={{ margin: '0 0 15px 0', display: 'flex', alignItems: 'center', gap: '8px', color: '#059669' }}>
                      <Icons.Quiz /> Quiz Questions
                    </h4>
                    
                    <button type="button" className="btn btn-outline" onClick={addQuizQuestion} style={{ marginBottom: '15px', borderColor: '#059669', color: '#059669' }}>
                      <Icons.Add /> Add Question
                    </button>
                    
                    {formData.quiz?.map((q, qIndex) => (
                      <div key={qIndex} style={{ background: 'white', padding: '15px', borderRadius: '10px', marginBottom: '15px', border: '1px solid #E5E7EB' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '15px' }}>
                          <h5 style={{ margin: 0, color: '#1F2937' }}>Question {qIndex + 1}</h5>
                          <button type="button" onClick={() => removeQuizQuestion(qIndex)} style={{ color: '#EF4444', background: 'none', border: 'none', cursor: 'pointer' }}>Remove</button>
                        </div>
                        
                        <div className="form-group">
                          <label>Question Text</label>
                          <input type="text" value={q.question} onChange={(e) => updateQuizQuestion(qIndex, 'question', e.target.value)} placeholder="Enter your question" required style={{ width: '100%', padding: '10px', border: '2px solid #E5E7EB', borderRadius: '8px' }} />
                        </div>
                        
                        <div className="form-group">
                          <label>Question Type</label>
                          <select value={q.type} onChange={(e) => updateQuizQuestion(qIndex, 'type', e.target.value)} style={{ width: '100%', padding: '10px', border: '2px solid #E5E7EB', borderRadius: '8px' }}>
                            <option value="multiple_choice">Multiple Choice</option>
                            <option value="true_false">True / False</option>
                          </select>
                        </div>
                        
                        {q.type === 'multiple_choice' && (
                          <div className="form-group">
                            <label style={{ color: '#1F2937', fontWeight: '500' }}>Options (select radio for correct answer)</label>
                            {q.options.map((opt, oIndex) => (
                              <div key={oIndex} style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
                                <input 
                                  type="radio" 
                                  name={`correct-${qIndex}`} 
                                  checked={q.correctAnswer === opt} 
                                  onChange={() => updateQuizQuestion(qIndex, 'correctAnswer', opt)}
                                  style={{ accentColor: '#10B981', width: '18px', height: '18px' }}
                                />
                                <input 
                                  type="text" 
                                  value={opt} 
                                  onChange={(e) => updateQuizOption(qIndex, oIndex, e.target.value)} 
                                  placeholder={`Option ${oIndex + 1}`} 
                                  required 
                                  style={{ flex: 1, padding: '10px', border: '2px solid #E5E7EB', borderRadius: '8px', background: 'white', color: '#1F2937' }}
                                />
                              </div>
                            ))}
                          </div>
                        )}
                        
                        {q.type === 'true_false' && (
                          <div className="form-group">
                            <label>Correct Answer</label>
                            <select value={q.correctAnswer} onChange={(e) => updateQuizQuestion(qIndex, 'correctAnswer', e.target.value)} required style={{ width: '100%', padding: '10px', border: '2px solid #E5E7EB', borderRadius: '8px' }}>
                              <option value="">Select Answer</option>
                              <option value="True">True</option>
                              <option value="False">False</option>
                            </select>
                          </div>
                        )}
                        
                        <div className="form-group">
                          <label>Points for this Question</label>
                          <input type="number" value={q.points} onChange={(e) => updateQuizQuestion(qIndex, 'points', parseInt(e.target.value))} min="1" style={{ width: '100px', padding: '10px', border: '2px solid #E5E7EB', borderRadius: '8px' }} />
                        </div>
                      </div>
                    ))}
                    
                    {(!formData.quiz || formData.quiz.length === 0) && (
                      <p style={{ color: '#6B7280', textAlign: 'center' }}>No quiz questions yet. Click "Add Question" to create one.</p>
                    )}
                  </div>
                  
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
                    <div className="form-group">
                      <label>Points for Completing Lesson</label>
                      <input type="number" value={formData.pointsReward} onChange={(e) => setFormData({...formData, pointsReward: parseInt(e.target.value)})} style={{ width: '100%', padding: '12px', border: '2px solid #E5E7EB', borderRadius: '8px' }} />
                    </div>
                    <div className="form-group">
                      <label>Points for Quiz</label>
                      <input type="number" value={formData.quizPointsReward} onChange={(e) => setFormData({...formData, quizPointsReward: parseInt(e.target.value)})} style={{ width: '100%', padding: '12px', border: '2px solid #E5E7EB', borderRadius: '8px' }} />
                    </div>
                  </div>
                </>
              )}

              <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end', marginTop: '25px', paddingTop: '20px', borderTop: '1px solid #E5E7EB' }}>
                <button type="button" className="btn btn-outline" onClick={() => setShowModal(false)} style={{ padding: '12px 24px' }}>Cancel</button>
                <button type="submit" className="btn btn-primary" disabled={uploading} style={{ padding: '12px 24px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  {uploading ? <><Icons.Save /> Saving...</> : <><Icons.Save /> Save {modalType}</>}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;

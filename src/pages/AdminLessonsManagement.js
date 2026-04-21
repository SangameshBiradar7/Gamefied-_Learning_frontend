import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  Plus, Edit, Trash2, X, Save, PlayCircle, FileText, Video,
  Upload, BookOpen, GraduationCap, ChevronDown, AlertCircle
} from 'lucide-react';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const AdminLessonsManagement = () => {
  const { user, token } = useAuth();
  const navigate = useNavigate();

  const [lessons, setLessons] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [editingLesson, setEditingLesson] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    subject: '',
    order: 0,
    videoUrl: '',
    youtubeUrl: '',
    notes: '',
    pointsReward: 50,
    quizPointsReward: 100,
    isActive: true,
    quiz: []
  });
  const [quizQuestions, setQuizQuestions] = useState([]);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [videoFile, setVideoFile] = useState(null);
  const [videoPreview, setVideoPreview] = useState('');
  const [showQuizBuilder, setShowQuizBuilder] = useState(false);
  const [currentQuizQuestion, setCurrentQuizQuestion] = useState({
    question: '',
    type: 'multiple_choice',
    options: ['', '', '', ''],
    correctAnswer: ''
  });

  useEffect(() => {
    if (!user || user.role !== 'admin') {
      navigate('/login');
      return;
    }
    fetchData();
  }, [user]);

  const fetchData = async () => {
    try {
      const [lessonsRes, subjectsRes] = await Promise.all([
        fetch(`${API_URL}/admin/lessons`, { headers: { Authorization: `Bearer ${token}` } }),
        fetch(`${API_URL}/admin/subjects`, { headers: { Authorization: `Bearer ${token}` } })
      ]);

      const lessonsData = await lessonsRes.json();
      const subjectsData = await subjectsRes.json();

      setLessons(lessonsData.lessons || lessonsData || []);
      setSubjects(subjectsData);
    } catch (err) {
      console.error('Failed to fetch data:', err);
      setError('Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError(null);

    try {
      const formDataObj = new FormData();

      if (editingLesson) {
        formDataObj.append('existingVideoUrl', editingLesson.videoUrl || '');
        formDataObj.append('existingYoutubeUrl', editingLesson.youtubeUrl || '');
      }

      formDataObj.append('title', formData.title);
      formDataObj.append('description', formData.description);
      formDataObj.append('subjectId', formData.subject);
      formDataObj.append('order', formData.order);
      formDataObj.append('videoUrl', formData.videoUrl);
      formDataObj.append('youtubeUrl', formData.youtubeUrl);
      formDataObj.append('notes', formData.notes);
      formDataObj.append('pointsReward', formData.pointsReward);
      formDataObj.append('quizPointsReward', formData.quizPointsReward);
      formDataObj.append('isActive', formData.isActive);
      formDataObj.append('quiz', JSON.stringify(formData.quiz));

      if (videoFile) {
        formDataObj.append('video', videoFile);
      }

      const url = editingLesson ? `${API_URL}/admin/lessons/${editinglesson._id}` : `${API_URL}/admin/lessons`;
      const method = editingLesson ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: { Authorization: `Bearer ${token}` },
        body: formDataObj
      });

      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.error || 'Failed to save lesson');
      }

      setSuccess(editingLesson ? 'Lesson updated successfully' : 'Lesson created successfully');
      fetchData();
      setShowModal(false);
      resetForm();
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (lesson) => {
    setEditingLesson(lesson);
    setFormData({
      title: lesson.title,
      description: lesson.description || '',
      subject: lesson.subject?._id || lesson.subject || '',
      order: lesson.order || 0,
      videoUrl: lesson.videoUrl || '',
      youtubeUrl: lesson.youtubeUrl || '',
      notes: lesson.notes || '',
      pointsReward: lesson.pointsReward || 50,
      quizPointsReward: lesson.quizPointsReward || 100,
      isActive: lesson.isActive !== false,
      quiz: lesson.quiz || []
    });
    setQuizQuestions(lesson.quiz || []);
    setShowModal(true);
  };

  const handleDelete = async (lessonId) => {
    if (!window.confirm('Are you sure you want to delete this lesson?')) {
      return;
    }

    try {
      const response = await fetch(`${API_URL}/admin/lessons/${lessonId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });

      if (!response.ok) {
        throw new Error('Failed to delete lesson');
      }

      setSuccess('Lesson deleted successfully');
      fetchData();
    } catch (err) {
      setError(err.message);
    }
  };

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      subject: '',
      order: 0,
      videoUrl: '',
      youtubeUrl: '',
      notes: '',
      pointsReward: 50,
      quizPointsReward: 100,
      isActive: true,
      quiz: []
    });
    setQuizQuestions([]);
    setEditingLesson(null);
    setVideoFile(null);
    setVideoPreview('');
    setError(null);
  };

  const openCreateModal = () => {
    resetForm();
    setShowModal(true);
  };

  const handleVideoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setVideoFile(file);
      const url = URL.createObjectURL(file);
      setVideoPreview(url);
    }
  };

  // Quiz builder functions
  const addQuizQuestion = () => {
    setQuizQuestions([
      ...quizQuestions,
      {
        question: '',
        type: 'multiple_choice',
        options: ['', '', '', ''],
        correctAnswer: '',
        points: 10
      }
    ]);
  };

  const updateQuizQuestion = (index, field, value) => {
    const updated = [...quizQuestions];
    updated[index][field] = value;
    setQuizQuestions(updated);
  };

  const updateQuizOption = (qIndex, optIndex, value) => {
    const updated = [...quizQuestions];
    updated[qIndex].options[optIndex] = value;
    setQuizQuestions(updated);
  };

  const removeQuizQuestion = (index) => {
    const updated = quizQuestions.filter((_, i) => i !== index);
    setQuizQuestions(updated);
  };

  const addQuizOption = (questionIndex) => {
    const updated = [...quizQuestions];
    updated[questionIndex].options.push('');
    setQuizQuestions(updated);
  };

  const removeQuizOption = (questionIndex, optionIndex) => {
    const updated = [...quizQuestions];
    updated[questionIndex].options = updated[questionIndex].options.filter((_, i) => i !== optionIndex);
    setQuizQuestions(updated);
  };

  const getSubjectName = (subjectId) => {
    const subject = subjects.find(s => s._id === subjectId || (s.id && s._id === subjectId));
    return subject ? (subject.displayName || subject.name) : 'Unknown';
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}>
        <div className="loading">Loading...</div>
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
                <PlayCircle size={24} /> Lesson Management
              </h1>
              <p style={{ color: '#9CA3AF', margin: 0, fontSize: '0.875rem' }}>Create and manage lessons with videos, notes, and quizzes</p>
            </div>
          </div>
          <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
            <button onClick={openCreateModal} style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'linear-gradient(135deg, #10B981, #059669)', color: 'white', border: 'none', padding: '10px 24px', borderRadius: '8px', cursor: 'pointer', fontWeight: '600' }}>
              <Plus size={18} /> Add Lesson
            </button>
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

        {success && (
          <div style={{ background: '#D1FAE5', border: '1px solid #10B981', borderRadius: '8px', padding: '12px', marginBottom: '20px', color: '#059669' }}>
            {success}
          </div>
        )}

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', gap: '20px' }}>
          {lessons.map((lesson, index) => (
            <div key={lesson._id} style={{ background: 'white', borderRadius: '12px', padding: '20px', boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '10px' }}>
                <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: '700', color: '#1F2937', flex: 1 }}>{lesson.title}</h3>
                <div style={{ display: 'flex', gap: '6px' }}>
                  <button onClick={() => handleEdit(lesson)} style={{ background: '#EFF6FF', color: '#3B82F6', border: 'none', padding: '6px', borderRadius: '4px', cursor: 'pointer' }}>
                    <Edit size={14} />
                  </button>
                  <button onClick={() => handleDelete(lesson._id)} style={{ background: '#FEF2F2', color: '#EF4444', border: 'none', padding: '6px', borderRadius: '4px', cursor: 'pointer' }}>
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>

              <p style={{ fontSize: '0.875rem', color: '#6B7280', marginBottom: '15px' }}>{lesson.description}</p>

              <div style={{ display: 'flex', alignItems: 'center', gap: '15px', marginBottom: '15px' }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.8rem', color: '#6B7280' }}>
                  <BookOpen size={14} /> {getSubjectName(lesson.subject)}
                </span>
                <span style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.8rem', color: '#6B7280' }}>
                  <PlayCircle size={14} /> Order {lesson.order || 0}
                </span>
              </div>

              <div style={{ display: 'flex', gap: '10px', marginBottom: '10px' }}>
                {lesson.videoUrl && (
                  <span style={{ fontSize: '0.75rem', padding: '2px 8px', borderRadius: '4px', background: '#D1FAE5', color: '#059669' }}>
                    <Video size={12} style={{ display: 'inline', marginRight: '3px' }} /> Video
                  </span>
                )}
                {lesson.youtubeUrl && (
                  <span style={{ fontSize: '0.75rem', padding: '2px 8px', borderRadius: '4px', background: '#FEF3C7', color: '#D97706' }}>
                    YouTube
                  </span>
                )}
                {lesson.quiz && lesson.quiz.length > 0 && (
                  <span style={{ fontSize: '0.75rem', padding: '2px 8px', borderRadius: '4px', background: '#E0E7FF', color: '#4338CA' }}>
                    {lesson.quiz.length} Quiz Qs
                  </span>
                )}
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ display: 'flex', gap: '10px' }}>
                  <span style={{ fontSize: '0.875rem', fontWeight: '600', color: '#059669' }}>
                    {lesson.pointsReward || 50} pts
                  </span>
                  <span style={{ fontSize: '0.875rem', fontWeight: '600', color: '#3B82F6' }}>
                    Quiz: {lesson.quizPointsReward || 100} pts
                  </span>
                </div>
                <span style={{ fontSize: '0.75rem', padding: '3px 8px', borderRadius: '4px', background: lesson.isActive ? '#D1FAE5' : '#F3F4F6', color: lesson.isActive ? '#059669' : '#6B7280' }}>
                  {lesson.isActive ? 'Active' : 'Inactive'}
                </span>
              </div>
            </div>
          ))}
        </div>

        {lessons.length === 0 && !loading && (
          <div style={{ textAlign: 'center', padding: '60px 20px', background: 'white', borderRadius: '12px' }}>
            <PlayCircle size={48} style={{ color: '#9CA3AF', marginBottom: '15px' }} />
            <h3 style={{ color: '#1F2937', marginBottom: '8px' }}>No Lessons Created</h3>
            <p style={{ color: '#6B7280', marginBottom: '20px' }}>Add lessons to your subjects with videos and quizzes</p>
            <button onClick={openCreateModal} style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', background: 'linear-gradient(135deg, #10B981, #059669)', color: 'white', border: 'none', padding: '12px 24px', borderRadius: '8px', cursor: 'pointer', fontWeight: '600' }}>
              <Plus size={18} /> Create First Lesson
            </button>
          </div>
        )}
      </main>

      {showModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, maxHeight: '100vh', overflowY: 'auto' }}>
          <div style={{ background: 'white', width: '90%', maxWidth: '800px', borderRadius: '16px', padding: '30px', position: 'relative', maxHeight: '90vh', overflowY: 'auto' }}>
            <button onClick={() => { setShowModal(false); resetForm(); setShowQuizBuilder(false); }} style={{ position: 'sticky', top: '0', float: 'right', background: 'none', border: 'none', cursor: 'pointer', color: '#6B7280' }}>
              <X size={20} />
            </button>

            <h2 style={{ marginBottom: '20px', color: '#1F2937', fontSize: '1.5rem', fontWeight: '800', clear: 'both' }}>
              {editingLesson ? 'Edit Lesson' : 'Create New Lesson'}
            </h2>

            {error && (
              <div style={{ background: '#FEF2F2', border: '1px solid #EF4444', borderRadius: '6px', padding: '10px', marginBottom: '15px', color: '#DC2626', fontSize: '0.875rem' }}>
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '20px' }}>
                <div>
                  <label style={{ display: 'block', marginBottom: '6px', fontWeight: '600', color: '#1F2937', fontSize: '0.875rem' }}>Title *</label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    placeholder="Lesson title"
                    style={{ width: '100%', padding: '12px', border: '2px solid #E5E7EB', borderRadius: '8px', fontSize: '1rem' }}
                    required
                  />
                </div>

                <div>
                  <label style={{ display: 'block', marginBottom: '6px', fontWeight: '600', color: '#1F2937', fontSize: '0.875rem' }}>Subject *</label>
                  <select
                    value={formData.subject}
                    onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                    style={{ width: '100%', padding: '12px', border: '2px solid #E5E7EB', borderRadius: '8px', fontSize: '1rem' }}
                    required
                  >
                    <option value="">Select Subject</option>
                    {subjects.map(subject => (
                      <option key={subject._id} value={subject._id}>
                        {subject.displayName || subject.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div style={{ marginBottom: '15px' }}>
                <label style={{ display: 'block', marginBottom: '6px', fontWeight: '600', color: '#1F2937', fontSize: '0.875rem' }}>Description</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Lesson description"
                  rows="3"
                  style={{ width: '100%', padding: '12px', border: '2px solid #E5E7EB', borderRadius: '8px', fontSize: '1rem', resize: 'vertical' }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '15px', marginBottom: '20px' }}>
                <div>
                  <label style={{ display: 'block', marginBottom: '6px', fontWeight: '600', color: '#1F2937', fontSize: '0.875rem' }}>Order</label>
                  <input
                    type="number"
                    value={formData.order}
                    onChange={(e) => setFormData({ ...formData, order: parseInt(e.target.value) || 0 })}
                    min="0"
                    style={{ width: '100%', padding: '12px', border: '2px solid #E5E7EB', borderRadius: '8px', fontSize: '1rem' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '6px', fontWeight: '600', color: '#1F2937', fontSize: '0.875rem' }}>Video/Note Points</label>
                  <input
                    type="number"
                    value={formData.pointsReward}
                    onChange={(e) => setFormData({ ...formData, pointsReward: parseInt(e.target.value) || 0 })}
                    min="0"
                    style={{ width: '100%', padding: '12px', border: '2px solid #E5E7EB', borderRadius: '8px', fontSize: '1rem' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '6px', fontWeight: '600', color: '#1F2937', fontSize: '0.875rem' }}>Quiz Points</label>
                  <input
                    type="number"
                    value={formData.quizPointsReward}
                    onChange={(e) => setFormData({ ...formData, quizPointsReward: parseInt(e.target.value) || 0 })}
                    min="0"
                    style={{ width: '100%', padding: '12px', border: '2px solid #E5E7EB', borderRadius: '8px', fontSize: '1rem' }}
                  />
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '28px' }}>
                  <input
                    type="checkbox"
                    id="isActive"
                    checked={formData.isActive}
                    onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                    style={{ width: '18px', height: '18px' }}
                  />
                  <label htmlFor="isActive" style={{ color: '#1F2937', fontSize: '0.875rem' }}>Active</label>
                </div>
              </div>

              <div style={{ marginBottom: '15px' }}>
                <label style={{ display: 'block', marginBottom: '6px', fontWeight: '600', color: '#1F2937', fontSize: '0.875rem' }}>Video File Upload (MP4)</label>
                <input
                  type="file"
                  accept="video/mp4,video/*"
                  onChange={handleVideoChange}
                  style={{ width: '100%', padding: '10px', border: '2px solid #E5E7EB', borderRadius: '8px', fontSize: '0.875rem' }}
                />
                {videoPreview && (
                  <div style={{ marginTop: '10px', maxWidth: '300px' }}>
                    <video src={videoPreview} controls style={{ width: '100%', borderRadius: '8px' }} />
                  </div>
                )}
              </div>

              <div style={{ marginBottom: '15px' }}>
                <label style={{ display: 'block', marginBottom: '6px', fontWeight: '600', color: '#1F2937', fontSize: '0.875rem' }}>YouTube URL</label>
                <input
                  type="url"
                  value={formData.youtubeUrl}
                  onChange={(e) => setFormData({ ...formData, youtubeUrl: e.target.value })}
                  placeholder="https://www.youtube.com/watch?v=..."
                  style={{ width: '100%', padding: '12px', border: '2px solid #E5E7EB', borderRadius: '8px', fontSize: '1rem' }}
                />
              </div>

              <div style={{ marginBottom: '15px' }}>
                <label style={{ display: 'block', marginBottom: '6px', fontWeight: '600', color: '#1F2937', fontSize: '0.875rem' }}>Notes/Study Material</label>
                <textarea
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  placeholder="Lesson notes or study material..."
                  rows="4"
                  style={{ width: '100%', padding: '12px', border: '2px solid #E5E7EB', borderRadius: '8px', fontSize: '1rem', resize: 'vertical' }}
                />
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminLessonsManagement;

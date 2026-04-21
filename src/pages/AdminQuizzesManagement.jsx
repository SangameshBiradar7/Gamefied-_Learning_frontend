import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import {
  Plus, Edit, Trash2, X, Save, Target, FileText, CheckCircle,
  XCircle, AlertTriangle, Eye
} from 'lucide-react';

const API_URL = import.meta.env.VITE_API_URL || 'https://gamefied-earning-backend.onrender.com/api';

const AdminQuizzesManagement = () => {
  const { user, token } = useAuth();
  const navigate = useNavigate();

  const [quizzes, setQuizzes] = useState([]);
  const [lessons, setLessons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [editingQuiz, setEditingQuiz] = useState(null);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [selectedLesson, setSelectedLesson] = useState('');
  const [quizData, setQuizData] = useState({
    title: '',
    description: '',
    questions: [],
    timeLimit: 0,
    passingScore: 70,
    isActive: true
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
      const [lessonsRes] = await Promise.all([
        fetch(`${API_URL}/admin/lessons`, { headers: { Authorization: `Bearer ${token}` } })
      ]);

      const lessonsData = await lessonsRes.json();
      const lessonsList = lessonsData.lessons || lessonsData || [];

      setLessons(lessonsList);

      // Build quizzes data from lessons' quiz arrays
      const quizzesList = lessonsList
        .filter(lesson => lesson.quiz && lesson.quiz.length > 0)
        .flatMap(lesson => ({
          _id: lesson._id,
          lessonId: lesson._id,
          lessonTitle: lesson.title,
          subject: lesson.subject?.displayName || lesson.subject?.name || 'Unknown',
          questions: lesson.quiz,
          pointsReward: lesson.quizPointsReward || 100,
          createdAt: lesson.createdAt
        }));

      setQuizzes(quizzesList);
    } catch (err) {
      console.error('Failed to fetch data:', err);
      setError('Failed to load quizzes');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError(null);

    try {
      // Quiz data is part of lesson; need to update the lesson's quiz array
      if (!selectedLesson) {
        throw new Error('Please select a lesson');
      }

      const payload = {
        quiz: quizData.questions,
        quizPointsReward: quizData.pointsReward
      };

      const response = await fetch(`${API_URL}/admin/lessons/${selectedLesson}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        throw new Error('Failed to save quiz');
      }

      setSuccess(editingQuiz ? 'Quiz updated successfully' : 'Quiz created successfully');
      fetchData();
      setShowModal(false);
      resetForm();
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (quiz) => {
    setEditingQuiz(quiz);
    setSelectedLesson(quiz.lessonId);
    setQuizData({
      title: quiz.lessonTitle,
      description: '',
      questions: quiz.questions || [],
      timeLimit: 0,
      passingScore: 70,
      isActive: true
    });
    setShowModal(true);
  };

  const handleDelete = async (quizId) => {
    if (!window.confirm('Are you sure you want to delete this quiz? This will remove all quiz questions.')) {
      return;
    }

    try {
      // Remove quiz from lesson by setting quiz to empty array
      const response = await fetch(`${API_URL}/admin/lessons/${quizId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ quiz: [] })
      });

      if (!response.ok) {
        throw new Error('Failed to delete quiz');
      }

      setSuccess('Quiz deleted successfully');
      fetchData();
    } catch (err) {
      setError(err.message);
    }
  };

  const resetForm = () => {
    setQuizData({
      title: '',
      description: '',
      questions: [],
      timeLimit: 0,
      passingScore: 70,
      isActive: true
    });
    setEditingQuiz(null);
    setSelectedLesson('');
    setError(null);
  };

  const openCreateModal = () => {
    resetForm();
    setShowModal(true);
  };

  // Quiz question management
  const addQuestion = () => {
    setQuizData({
      ...quizData,
      questions: [
        ...quizData.questions,
        {
          question: '',
          type: 'multiple_choice',
          options: ['', '', '', ''],
          correctAnswer: '',
          points: 10
        }
      ]
    });
  };

  const updateQuestion = (index, field, value) => {
    const updated = [...quizData.questions];
    updated[index][field] = value;
    setQuizData({ ...quizData, questions: updated });
  };

  const updateOption = (qIndex, optIndex, value) => {
    const updated = [...quizData.questions];
    updated[qIndex].options[optIndex] = value;
    setQuizData({ ...quizData, questions: updated });
  };

  const removeQuestion = (index) => {
    const updated = quizData.questions.filter((_, i) => i !== index);
    setQuizData({ ...quizData, questions: updated });
  };

  const addOption = (questionIndex) => {
    const updated = [...quizData.questions];
    updated[questionIndex].options.push('');
    setQuizData({ ...quizData, questions: updated });
  };

  const removeOption = (questionIndex, optionIndex) => {
    const updated = [...quizData.questions];
    updated[questionIndex].options = updated[questionIndex].options.filter((_, i) => i !== optionIndex);
    setQuizData({ ...quizData, questions: updated });
  };

  const getLessonTitle = (lessonId) => {
    const lesson = lessons.find(l => l._id === lessonId);
    return lesson ? lesson.title : 'Unknown Lesson';
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
                <Target size={24} /> Quiz Management
              </h1>
              <p style={{ color: '#9CA3AF', margin: 0, fontSize: '0.875rem' }}>Create and manage quizzes for lessons</p>
            </div>
          </div>
          <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
            <button onClick={openCreateModal} style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'linear-gradient(135deg, #10B981, #059669)', color: 'white', border: 'none', padding: '10px 24px', borderRadius: '8px', cursor: 'pointer', fontWeight: '600' }}>
              <Plus size={18} /> Add Quiz
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

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(400px, 1fr))', gap: '20px' }}>
          {quizzes.map((quiz) => (
            <div key={quiz._id} style={{ background: 'white', borderRadius: '12px', padding: '20px', boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '10px' }}>
                <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: '700', color: '#1F2937', flex: 1 }}>{quiz.lessonTitle}</h3>
                <div style={{ display: 'flex', gap: '6px' }}>
                  <button onClick={() => handleEdit(quiz)} style={{ background: '#EFF6FF', color: '#3B82F6', border: 'none', padding: '6px', borderRadius: '4px', cursor: 'pointer' }}>
                    <Edit size={14} />
                  </button>
                  <button onClick={() => handleDelete(quiz._id)} style={{ background: '#FEF2F2', color: '#EF4444', border: 'none', padding: '6px', borderRadius: '4px', cursor: 'pointer' }}>
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>

              <p style={{ fontSize: '0.875rem', color: '#6B7280', marginBottom: '15px' }}>
                Subject: {quiz.subject}
              </p>

              <div style={{ display: 'flex', gap: '10px', marginBottom: '10px', flexWrap: 'wrap' }}>
                <span style={{ fontSize: '0.8rem', padding: '4px 10px', borderRadius: '6px', background: '#E0E7FF', color: '#4338CA' }}>
                  <Target size={12} style={{ display: 'inline', marginRight: '4px' }} /> {quiz.questions?.length || 0} Questions
                </span>
                <span style={{ fontSize: '0.8rem', padding: '4px 10px', borderRadius: '6px', background: '#D1FAE5', color: '#059669' }}>
                  <CheckCircle size={12} style={{ display: 'inline', marginRight: '4px' }} /> {quiz.pointsReward || 100} pts
                </span>
                <span style={{ fontSize: '0.8rem', padding: '4px 10px', borderRadius: '6px', background: quiz.isActive ? '#D1FAE5' : '#F3F4F6', color: quiz.isActive ? '#059669' : '#6B7280' }}>
                  {quiz.isActive ? 'Active' : 'Inactive'}
                </span>
              </div>

              <div style={{ fontSize: '0.875rem', color: '#6B7280' }}>
                Created: {new Date(quiz.createdAt).toLocaleDateString()}
              </div>
            </div>
          ))}
        </div>

        {quizzes.length === 0 && !loading && (
          <div style={{ textAlign: 'center', padding: '60px 20px', background: 'white', borderRadius: '12px' }}>
            <Target size={48} style={{ color: '#9CA3AF', marginBottom: '15px' }} />
            <h3 style={{ color: '#1F2937', marginBottom: '8px' }}>No Quizzes Created</h3>
            <p style={{ color: '#6B7280', marginBottom: '20px' }}>Create quizzes for your lessons to test student knowledge</p>
            <button onClick={openCreateModal} style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', background: 'linear-gradient(135deg, #10B981, #059669)', color: 'white', border: 'none', padding: '12px 24px', borderRadius: '8px', cursor: 'pointer', fontWeight: '600' }}>
              <Plus size={18} /> Create Quiz
            </button>
          </div>
        )}
      </main>

      {showModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, maxHeight: '100vh', overflowY: 'auto' }}>
          <div style={{ background: 'white', width: '90%', maxWidth: '900px', borderRadius: '16px', padding: '30px', position: 'relative', maxHeight: '90vh', overflowY: 'auto' }}>
            <button onClick={() => { setShowModal(false); resetForm(); }} style={{ position: 'sticky', top: '0', float: 'right', background: 'none', border: 'none', cursor: 'pointer', color: '#6B7280' }}>
              <X size={20} />
            </button>

            <h2 style={{ marginBottom: '20px', color: '#1F2937', fontSize: '1.5rem', fontWeight: '800', clear: 'both' }}>
              {editingQuiz ? 'Edit Quiz' : 'Create New Quiz'}
            </h2>

            {error && (
              <div style={{ background: '#FEF2F2', border: '1px solid #EF4444', borderRadius: '6px', padding: '10px', marginBottom: '15px', color: '#DC2626', fontSize: '0.875rem' }}>
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit}>
              <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', marginBottom: '6px', fontWeight: '600', color: '#1F2937', fontSize: '0.875rem' }}>Lesson *</label>
                <select
                  value={selectedLesson}
                  onChange={(e) => setSelectedLesson(e.target.value)}
                  style={{ width: '100%', padding: '12px', border: '2px solid #E5E7EB', borderRadius: '8px', fontSize: '1rem' }}
                  required
                >
                  <option value="">Select Lesson</option>
                  {lessons.map(lesson => (
                    <option key={lesson._id} value={lesson._id}>
                      {lesson.title} ({lesson.subject?.displayName || 'No Subject'})
                    </option>
                  ))}
                </select>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginBottom: '20px' }}>
                <div>
                  <label style={{ display: 'block', marginBottom: '6px', fontWeight: '600', color: '#1F2937', fontSize: '0.875rem' }}>Quiz Points Reward</label>
                  <input
                    type="number"
                    value={quizData.pointsReward}
                    onChange={(e) => setQuizData({ ...quizData, pointsReward: parseInt(e.target.value) || 0 })}
                    min="0"
                    style={{ width: '100%', padding: '12px', border: '2px solid #E5E7EB', borderRadius: '8px', fontSize: '1rem' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '6px', fontWeight: '600', color: '#1F2937', fontSize: '0.875rem' }}>Time Limit (minutes, 0 = no limit)</label>
                  <input
                    type="number"
                    value={quizData.timeLimit}
                    onChange={(e) => setQuizData({ ...quizData, timeLimit: parseInt(e.target.value) || 0 })}
                    min="0"
                    style={{ width: '100%', padding: '12px', border: '2px solid #E5E7EB', borderRadius: '8px', fontSize: '1rem' }}
                  />
                </div>
              </div>

              {/* Quiz Questions Builder */}
              <div style={{ marginBottom: '20px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
                  <h3 style={{ margin: 0, color: '#1F2937', fontSize: '1.1rem', fontWeight: '700' }}>
                    Quiz Questions ({quizData.questions.length})
                  </h3>
                  <button
                    type="button"
                    onClick={addQuestion}
                    style={{ display: 'flex', alignItems: 'center', gap: '6px', background: 'linear-gradient(135deg, #3B82F6, #2563EB)', color: 'white', border: 'none', padding: '8px 16px', borderRadius: '6px', cursor: 'pointer', fontWeight: '600', fontSize: '0.875rem' }}
                  >
                    <Plus size={16} /> Add Question
                  </button>
                </div>

                {quizData.questions.map((question, qIndex) => (
                  <div key={qIndex} style={{ background: '#F9FAFB', borderRadius: '12px', padding: '20px', marginBottom: '15px', border: '2px solid #E5E7EB' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '15px' }}>
                      <h4 style={{ margin: 0, color: '#1F2937', fontSize: '1rem', fontWeight: '700' }}>
                        Question {qIndex + 1}
                      </h4>
                      <div style={{ display: 'flex', gap: '6px' }}>
                        <select
                          value={question.type}
                          onChange={(e) => updateQuestion(qIndex, 'type', e.target.value)}
                          style={{ padding: '6px 10px', border: '2px solid #E5E7EB', borderRadius: '6px', fontSize: '0.875rem' }}
                        >
                          <option value="multiple_choice">Multiple Choice</option>
                          <option value="true_false">True/False</option>
                        </select>
                        <button
                          type="button"
                          onClick={() => removeQuestion(qIndex)}
                          style={{ background: '#FEF2F2', color: '#EF4444', border: 'none', padding: '6px', borderRadius: '4px', cursor: 'pointer' }}
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>

                    <div style={{ marginBottom: '15px' }}>
                      <label style={{ display: 'block', marginBottom: '6px', fontWeight: '600', color: '#1F2937', fontSize: '0.875rem' }}>Question Text</label>
                      <input
                        type="text"
                        value={question.question}
                        onChange={(e) => updateQuestion(qIndex, 'question', e.target.value)}
                        placeholder="Enter question..."
                        style={{ width: '100%', padding: '10px', border: '2px solid #E5E7EB', borderRadius: '8px', fontSize: '0.9rem' }}
                      />
                    </div>

                    <div style={{ marginBottom: '15px' }}>
                      <label style={{ display: 'block', marginBottom: '6px', fontWeight: '600', color: '#1F2937', fontSize: '0.875rem' }}>Options</label>
                      {question.options.map((option, optIndex) => (
                        <div key={optIndex} style={{ display: 'flex', gap: '8px', marginBottom: '8px' }}>
                          <input
                            type="radio"
                            name={`correct-${qIndex}`}
                            checked={question.correctAnswer === option}
                            onChange={() => updateQuestion(qIndex, 'correctAnswer', option)}
                            style={{ marginTop: '6px' }}
                          />
                          <input
                            type="text"
                            value={option}
                            onChange={(e) => updateOption(qIndex, optIndex, e.target.value)}
                            placeholder={`Option ${optIndex + 1}`}
                            style={{ flex: 1, padding: '8px', border: '2px solid #E5E7EB', borderRadius: '6px', fontSize: '0.9rem' }}
                          />
                          {question.options.length > 2 && (
                            <button
                              type="button"
                              onClick={() => removeOption(qIndex, optIndex)}
                              style={{ background: '#FEF2F2', color: '#EF4444', border: 'none', padding: '6px', borderRadius: '4px', cursor: 'pointer' }}
                            >
                              <X size={12} />
                            </button>
                          )}
                        </div>
                      ))}
                      <button
                        type="button"
                        onClick={() => addOption(qIndex)}
                        style={{ background: 'none', border: '1px dashed #3B82F6', color: '#3B82F6', padding: '6px 12px', borderRadius: '6px', cursor: 'pointer', fontSize: '0.875rem' }}
                      >
                        + Add Option
                      </button>
                    </div>

                    <div>
                      <label style={{ display: 'block', marginBottom: '6px', fontWeight: '600', color: '#1F2937', fontSize: '0.875rem' }}>Points for this question</label>
                      <input
                        type="number"
                        value={question.points || 10}
                        onChange={(e) => updateQuestion(qIndex, 'points', parseInt(e.target.value) || 0)}
                        min="0"
                        style={{ width: '80px', padding: '8px', border: '2px solid #E5E7EB', borderRadius: '6px', fontSize: '0.9rem' }}
                      />
                    </div>
                  </div>
                ))}
              </div>

              <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end', marginTop: '30px' }}>
                <button
                  type="button"
                  onClick={() => { setShowModal(false); resetForm(); }}
                  style={{ background: '#F3F4F6', color: '#1F2937', border: 'none', padding: '12px 24px', borderRadius: '8px', cursor: 'pointer', fontWeight: '600' }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving || !selectedLesson}
                  style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'linear-gradient(135deg, #3B82F6, #2563EB)', color: 'white', border: 'none', padding: '12px 24px', borderRadius: '8px', cursor: 'pointer', fontWeight: '600', opacity: (saving || !selectedLesson) ? 0.7 : 1 }}
                >
                  {saving ? 'Saving...' : <><Save size={18} /> {editingQuiz ? 'Update Quiz' : 'Create Quiz'}</>}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminQuizzesManagement;

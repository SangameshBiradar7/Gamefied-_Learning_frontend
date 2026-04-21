import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  Calendar, Plus, Edit, Trash2, X, Save, Clock, CheckCircle,
  XCircle, AlertTriangle, Users, Award, Play, BarChart3
} from 'lucide-react';

const API_URL = import.meta.env.VITE_API_URL || 'https://gamefied-earning-backend.onrender.com/api';

const AdminWeeklyTestsManagement = () => {
  const { user, token } = useAuth();
  const navigate = useNavigate();

  const [tests, setTests] = useState([]);
  const [students, setStudents] = useState([]);
  const [grades, setGrades] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [editingTest, setEditingTest] = useState(null);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    grade: '',
    subject: '',
    weekNumber: 1,
    year: new Date().getFullYear(),
    isActive: true,
    timeLimit: 60,
    passingScore: 50,
    maxScore: 100,
    pointsReward: 100,
    questions: [],
    assignedStudents: []
  });
  const [quizQuestions, setQuizQuestions] = useState([]);
  const [selectedStudents, setSelectedStudents] = useState([]);
  const [showStudentSelector, setShowStudentSelector] = useState(false);

  useEffect(() => {
    if (!user || user.role !== 'admin') {
      navigate('/login');
      return;
    }
    fetchData();
  }, [user]);

  // Fetch subjects when grade changes
  useEffect(() => {
    if (formData.grade) {
      fetch(`${API_URL}/subjects?gradeId=${formData.grade}`, {
        headers: { Authorization: `Bearer ${token}` }
      })
        .then(res => res.json())
        .then(data => setSubjects(data || []))
        .catch(err => console.error('Failed to fetch subjects:', err));
    } else {
      setSubjects([]);
    }
  }, [formData.grade, token]);

  const fetchData = async () => {
    try {
      const [studentsRes, testsRes, gradesRes] = await Promise.all([
        fetch(`${API_URL}/admin/students?role=student`, { 
          headers: { Authorization: `Bearer ${token}` } 
        }),
        fetch(`${API_URL}/admin/weekly-tests`, { 
          headers: { Authorization: `Bearer ${token}` } 
        }),
        fetch(`${API_URL}/grades`, { 
          headers: { Authorization: `Bearer ${token}` } 
        })
      ]);

      const studentsData = await studentsRes.json();
      const testsData = await testsRes.json();
      const gradesData = await gradesRes.json();
      
      setStudents(studentsData || []);
      setTests(testsData || []);
      setGrades(gradesData || []);
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
      const payload = {
        ...formData,
        questions: quizQuestions,
        assignedStudents: selectedStudents
      };

      const url = editingTest
        ? `${API_URL}/admin/weekly-tests/${editingTest._id}`
        : `${API_URL}/admin/weekly-tests`;
      const method = editingTest ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        throw new Error('Failed to save weekly test');
      }

      setSuccess(editingTest ? 'Weekly test updated successfully' : 'Weekly test created successfully');
      fetchData();
      setShowModal(false);
      resetForm();
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (test) => {
    setEditingTest(test);
    setFormData({
      title: test.title || '',
      description: test.description || '',
      grade: test.grade?._id || '',
      subject: test.subject?._id || '',
      weekNumber: test.weekNumber || 1,
      year: test.year || new Date().getFullYear(),
      isActive: test.isActive !== false,
      timeLimit: test.timeLimit || 60,
      passingScore: test.passingScore || 50,
      maxScore: test.maxScore || 100,
      pointsReward: test.pointsReward || 100,
      questions: test.questions || [],
      assignedStudents: test.assignedStudents?.map(s => s._id || s) || []
    });
    setQuizQuestions(test.questions || []);
    setSelectedStudents(test.assignedStudents?.map(s => s._id || s) || []);
    setShowModal(true);
  };

  const handleDelete = async (testId) => {
    if (!window.confirm('Are you sure you want to delete this weekly test? Student results will be preserved but the test will be inaccessible.')) {
      return;
    }

    try {
      const response = await fetch(`${API_URL}/admin/weekly-tests/${testId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });

      if (!response.ok) {
        throw new Error('Failed to delete weekly test');
      }

      setSuccess('Weekly test deleted successfully');
      fetchData();
    } catch (err) {
      setError(err.message);
    }
  };

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      grade: '',
      subject: '',
      weekNumber: 1,
      year: new Date().getFullYear(),
      isActive: true,
      timeLimit: 60,
      passingScore: 50,
      maxScore: 100,
      pointsReward: 100,
      questions: [],
      assignedStudents: []
    });
    setQuizQuestions([]);
    setSelectedStudents([]);
    setEditingTest(null);
    setError(null);
  };

  const openCreateModal = () => {
    resetForm();
    setShowModal(true);
  };

  // Quiz question management (similar to quizzes page)
  const addQuestion = () => {
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

  const updateQuestion = (index, field, value) => {
    const updated = [...quizQuestions];
    updated[index][field] = value;
    setQuizQuestions(updated);
  };

  const updateOption = (qIndex, optIndex, value) => {
    const updated = [...quizQuestions];
    updated[qIndex].options[optIndex] = value;
    setQuizQuestions(updated);
  };

  const removeQuestion = (index) => {
    const updated = quizQuestions.filter((_, i) => i !== index);
    setQuizQuestions(updated);
  };

  const addOption = (questionIndex) => {
    const updated = [...quizQuestions];
    updated[questionIndex].options.push('');
    setQuizQuestions(updated);
  };

  const removeOption = (questionIndex, optionIndex) => {
    const updated = [...quizQuestions];
    updated[questionIndex].options = updated[questionIndex].options.filter((_, i) => i !== optionIndex);
    setQuizQuestions(updated);
  };

  const toggleStudentSelection = (studentId) => {
    setSelectedStudents(prev =>
      prev.includes(studentId)
        ? prev.filter(id => id !== studentId)
        : [...prev, studentId]
    );
  };

  const selectAllStudents = () => {
    if (selectedStudents.length === students.length) {
      setSelectedStudents([]);
    } else {
      setSelectedStudents(students.map(s => s._id));
    }
  };

  const getStudentStats = (testId) => {
    // Placeholder - would fetch from API
    return { attempted: 0, avgScore: 0, passed: 0 };
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
                <Calendar size={24} /> Weekly Tests Management
              </h1>
              <p style={{ color: '#9CA3AF', margin: 0, fontSize: '0.875rem' }}>Create and schedule weekly assessments</p>
            </div>
          </div>
          <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
            <button onClick={openCreateModal} style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'linear-gradient(135deg, #10B981, #059669)', color: 'white', border: 'none', padding: '10px 24px', borderRadius: '8px', cursor: 'pointer', fontWeight: '600' }}>
              <Plus size={18} /> Create Weekly Test
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

        {/* Tests Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', gap: '20px' }}>
          {tests.map((test) => (
            <div key={test._id} style={{ background: 'white', borderRadius: '12px', padding: '20px', boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '10px' }}>
                <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: '700', color: '#1F2937', flex: 1 }}>{test.title}</h3>
                <div style={{ display: 'flex', gap: '6px' }}>
                  <button onClick={() => handleEdit(test)} style={{ background: '#EFF6FF', color: '#3B82F6', border: 'none', padding: '6px', borderRadius: '4px', cursor: 'pointer' }}>
                    <Edit size={14} />
                  </button>
                  <button onClick={() => handleDelete(test._id)} style={{ background: '#FEF2F2', color: '#EF4444', border: 'none', padding: '6px', borderRadius: '4px', cursor: 'pointer' }}>
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>

              <p style={{ fontSize: '0.875rem', color: '#6B7280', marginBottom: '15px' }}>{test.description}</p>

               <div style={{ display: 'flex', gap: '10px', marginBottom: '15px', flexWrap: 'wrap' }}>
                 <span style={{ fontSize: '0.8rem', padding: '4px 10px', borderRadius: '6px', background: '#E0E7FF', color: '#4338CA' }}>
                   <Calendar size={12} style={{ display: 'inline', marginRight: '4px' }} /> Week {test.weekNumber}, {test.year}
                 </span>
                 <span style={{ fontSize: '0.8rem', padding: '4px 10px', borderRadius: '6px', background: '#D1FAE5', color: '#059669' }}>
                   <Clock size={12} style={{ display: 'inline', marginRight: '4px' }} /> {test.timeLimit} min
                 </span>
                 <span style={{ fontSize: '0.8rem', padding: '4px 10px', borderRadius: '6px', background: '#FEF3C7', color: '#D97706' }}>
                   {test.passingScore}% pass
                 </span>
                 {test.grade && (
                   <span style={{ fontSize: '0.8rem', padding: '4px 10px', borderRadius: '6px', background: '#F3E8FF', color: '#9333EA' }}>
                     {test.grade.displayName}
                   </span>
                 )}
                 {test.subject && (
                   <span style={{ fontSize: '0.8rem', padding: '4px 10px', borderRadius: '6px', background: '#E0F2FE', color: '#0284C7' }}>
                     {test.subject.displayName}
                   </span>
                 )}
               </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.875rem' }}>
                <span style={{ color: '#6B7280' }}>
                  <Users size={14} style={{ display: 'inline', marginRight: '4px' }} /> {test.assignedStudents?.length || 0} assigned
                </span>
                {test.questions && (
                  <span style={{ color: '#6B7280' }}>
                    {test.questions.length} questions
                  </span>
                )}
              </div>

              {test.results && (
                <div style={{ marginTop: '15px', padding: '12px', background: '#F9FAFB', borderRadius: '8px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.875rem' }}>
                    <span style={{ color: '#6B7280' }}>Attempted</span>
                    <span style={{ fontWeight: '600', color: '#1F2937' }}>{test.results.attempted}/{test.assignedStudents?.length || 0}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.875rem', marginTop: '5px' }}>
                    <span style={{ color: '#6B7280' }}>Pass Rate</span>
                    <span style={{ fontWeight: '600', color: '#059669' }}>{test.results.passRate || 0}%</span>
                  </div>
                </div>
              )}

              <div style={{ marginTop: '10px' }}>
                <span style={{ fontSize: '0.75rem', padding: '3px 8px', borderRadius: '4px', background: test.isActive ? '#D1FAE5' : '#F3F4F6', color: test.isActive ? '#059669' : '#6B7280' }}>
                  {test.isActive ? 'Active' : 'Inactive'}
                </span>
              </div>
            </div>
          ))}
        </div>

        {tests.length === 0 && !loading && (
          <div style={{ textAlign: 'center', padding: '60px 20px', background: 'white', borderRadius: '12px' }}>
            <Calendar size={48} style={{ color: '#9CA3AF', marginBottom: '15px' }} />
            <h3 style={{ color: '#1F2937', marginBottom: '8px' }}>No Weekly Tests</h3>
            <p style={{ color: '#6B7280', marginBottom: '20px' }}>Create weekly tests to assess student progress</p>
            <button onClick={openCreateModal} style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', background: 'linear-gradient(135deg, #10B981, #059669)', color: 'white', border: 'none', padding: '12px 24px', borderRadius: '8px', cursor: 'pointer', fontWeight: '600' }}>
              <Plus size={18} /> Create First Test
            </button>
          </div>
        )}
      </main>

      {showModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, maxHeight: '100vh', overflowY: 'auto' }}>
          <div style={{ background: 'white', width: '90%', maxWidth: '800px', borderRadius: '16px', padding: '30px', position: 'relative', maxHeight: '90vh', overflowY: 'auto' }}>
            <button onClick={() => { setShowModal(false); resetForm(); }} style={{ position: 'sticky', top: '0', float: 'right', background: 'none', border: 'none', cursor: 'pointer', color: '#6B7280' }}>
              <X size={20} />
            </button>

            <h2 style={{ marginBottom: '20px', color: '#1F2937', fontSize: '1.5rem', fontWeight: '800', clear: 'both' }}>
              {editingTest ? 'Edit Weekly Test' : 'Create New Weekly Test'}
            </h2>

            {error && (
              <div style={{ background: '#FEF2F2', border: '1px solid #EF4444', borderRadius: '6px', padding: '10px', marginBottom: '15px', color: '#DC2626', fontSize: '0.875rem' }}>
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit}>
               <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginBottom: '15px' }}>
                 <div>
                   <label style={{ display: 'block', marginBottom: '6px', fontWeight: '600', color: '#1F2937', fontSize: '0.875rem' }}>Title *</label>
                   <input
                     type="text"
                     value={formData.title}
                     onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                     placeholder="Weekly Test Title"
                     style={{ width: '100%', padding: '12px', border: '2px solid #E5E7EB', borderRadius: '8px', fontSize: '1rem' }}
                     required
                   />
                 </div>

                 <div>
                   <label style={{ display: 'block', marginBottom: '6px', fontWeight: '600', color: '#1F2937', fontSize: '0.875rem' }}>Description</label>
                   <input
                     type="text"
                     value={formData.description}
                     onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                     placeholder="Brief description"
                     style={{ width: '100%', padding: '12px', border: '2px solid #E5E7EB', borderRadius: '8px', fontSize: '1rem' }}
                   />
                 </div>
               </div>

               <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '15px', marginBottom: '15px' }}>
                 <div>
                   <label style={{ display: 'block', marginBottom: '6px', fontWeight: '600', color: '#1F2937', fontSize: '0.875rem' }}>Grade *</label>
                   <select
                     value={formData.grade}
                     onChange={(e) => setFormData({ ...formData, grade: e.target.value, subject: '' })}
                     style={{ width: '100%', padding: '12px', border: '2px solid #E5E7EB', borderRadius: '8px', fontSize: '1rem', background: 'white' }}
                     required
                   >
                     <option value="">Select Grade</option>
                     {grades.map(grade => (
                       <option key={grade._id} value={grade._id}>
                         {grade.displayName}
                       </option>
                     ))}
                   </select>
                 </div>

                 <div>
                   <label style={{ display: 'block', marginBottom: '6px', fontWeight: '600', color: '#1F2937', fontSize: '0.875rem' }}>Subject</label>
                   <select
                     value={formData.subject}
                     onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                     disabled={!formData.grade}
                     style={{ width: '100%', padding: '12px', border: '2px solid #E5E7EB', borderRadius: '8px', fontSize: '1rem', background: formData.grade ? 'white' : '#F3F4F6' }}
                   >
                     <option value="">Select Subject</option>
                     {subjects.map(subject => (
                       <option key={subject._id} value={subject._id}>
                         {subject.displayName}
                       </option>
                     ))}
                   </select>
                 </div>
               </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '15px', marginBottom: '20px' }}>
                <div>
                  <label style={{ display: 'block', marginBottom: '6px', fontWeight: '600', color: '#1F2937', fontSize: '0.875rem' }}>Week Number</label>
                  <input
                    type="number"
                    value={formData.weekNumber}
                    onChange={(e) => setFormData({ ...formData, weekNumber: parseInt(e.target.value) || 1 })}
                    min="1"
                    max="52"
                    style={{ width: '100%', padding: '12px', border: '2px solid #E5E7EB', borderRadius: '8px', fontSize: '1rem' }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', marginBottom: '6px', fontWeight: '600', color: '#1F2937', fontSize: '0.875rem' }}>Year</label>
                  <input
                    type="number"
                    value={formData.year}
                    onChange={(e) => setFormData({ ...formData, year: parseInt(e.target.value) || new Date().getFullYear() })}
                    min="2020"
                    max="2030"
                    style={{ width: '100%', padding: '12px', border: '2px solid #E5E7EB', borderRadius: '8px', fontSize: '1rem' }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', marginBottom: '6px', fontWeight: '600', color: '#1F2937', fontSize: '0.875rem' }}>Time Limit (mins)</label>
                  <input
                    type="number"
                    value={formData.timeLimit}
                    onChange={(e) => setFormData({ ...formData, timeLimit: parseInt(e.target.value) || 60 })}
                    min="5"
                    max="180"
                    style={{ width: '100%', padding: '12px', border: '2px solid #E5E7EB', borderRadius: '8px', fontSize: '1rem' }}
                  />
                </div>
              </div>

              <div style={{ marginBottom: '15px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                    <input
                      type="checkbox"
                      checked={formData.isActive}
                      onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                      style={{ width: '18px', height: '18px' }}
                    />
                    <span style={{ fontWeight: '600', color: '#1F2937' }}>Active</span>
                  </label>
                </div>
              </div>

              {/* Student Assignment */}
              <div style={{ marginBottom: '20px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                  <label style={{ fontWeight: '600', color: '#1F2937', fontSize: '0.875rem' }}>Assign to Students</label>
                  <button
                    type="button"
                    onClick={() => setShowStudentSelector(!showStudentSelector)}
                    style={{ background: '#EFF6FF', color: '#3B82F6', border: 'none', padding: '6px 12px', borderRadius: '6px', cursor: 'pointer', fontSize: '0.875rem' }}
                  >
                    {showStudentSelector ? 'Hide' : 'Select'} Students
                  </button>
                </div>

                {showStudentSelector && (
                  <div style={{ background: '#F9FAFB', borderRadius: '8px', padding: '15px', maxHeight: '200px', overflowY: 'auto' }}>
                    <div style={{ marginBottom: '10px' }}>
                      <button
                        type="button"
                        onClick={selectAllStudents}
                        style={{ background: 'none', border: 'none', color: '#3B82F6', cursor: 'pointer', fontSize: '0.875rem', fontWeight: '600' }}
                      >
                        {selectedStudents.length === students.length ? 'Deselect All' : 'Select All'}
                      </button>
                    </div>
                    {students.map(student => (
                      <div key={student._id} style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '8px', borderBottom: '1px solid #E5E7EB' }}>
                        <input
                          type="checkbox"
                          checked={selectedStudents.includes(student._id)}
                          onChange={() => toggleStudentSelection(student._id)}
                          style={{ width: '18px', height: '18px' }}
                        />
                        <span style={{ fontSize: '0.875rem', color: '#1F2937' }}>{student.username}</span>
                        <span style={{ fontSize: '0.8rem', color: '#6B7280' }}>{student.grade?.displayName}</span>
                      </div>
                    ))}
                  </div>
                )}

                {selectedStudents.length > 0 && (
                  <p style={{ fontSize: '0.875rem', color: '#059669', marginTop: '8px' }}>
                    {selectedStudents.length} student(s) assigned
                  </p>
                )}
              </div>

              <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end', marginTop: '20px' }}>
                <button
                  type="button"
                  onClick={() => { setShowModal(false); resetForm(); }}
                  style={{ background: '#F3F4F6', color: '#1F2937', border: 'none', padding: '12px 24px', borderRadius: '8px', cursor: 'pointer', fontWeight: '600' }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'linear-gradient(135deg, #3B82F6, #2563EB)', color: 'white', border: 'none', padding: '12px 24px', borderRadius: '8px', cursor: 'pointer', fontWeight: '600', opacity: saving ? 0.7 : 1 }}
                >
                  {saving ? 'Saving...' : <><Save size={18} /> {editingTest ? 'Update Test' : 'Create Test'}</>}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminWeeklyTestsManagement;

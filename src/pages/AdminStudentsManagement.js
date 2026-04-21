import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  Plus, Edit, Trash2, X, Save, Search, User, Award, Flame,
  BookOpen, Calendar, Filter, ChevronDown
} from 'lucide-react';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const AdminStudentsManagement = () => {
  const { user, token } = useAuth();
  const navigate = useNavigate();

  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [editingStudent, setEditingStudent] = useState(null);
  const [formData, setFormData] = useState({
    username: '',
    points: 0,
    level: 'Beginner',
    streak: { current: 0, longest: 0 },
    grade: ''
  });
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [gradeFilter, setGradeFilter] = useState('');
  const [grades, setGrades] = useState([]);
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    if (!user || user.role !== 'admin') {
      navigate('/login');
      return;
    }
    fetchData();
  }, [user]);

  const fetchData = async () => {
    try {
      const [studentsRes, gradesRes] = await Promise.all([
        fetch(`${API_URL}/admin/students?role=student`, { headers: { Authorization: `Bearer ${token}` } }),
        fetch(`${API_URL}/grades`, { headers: { Authorization: `Bearer ${token}` } })
      ]);

      const studentsData = await studentsRes.json();
      const gradesData = await gradesRes.json();

      setStudents(studentsData);
      setGrades(gradesData);
    } catch (err) {
      console.error('Failed to fetch data:', err);
      setError('Failed to load students');
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
        points: formData.points,
        level: formData.level,
        streak: formData.streak,
        grade: formData.grade || null
      };

      const url = editingStudent ? `${API_URL}/admin/students/${editingStudent._id}` : `${API_URL}/admin/students`;
      const method = editingStudent ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        throw new Error('Failed to save student');
      }

      setSuccess(editingStudent ? 'Student updated successfully' : 'Student created successfully');
      fetchData();
      setShowModal(false);
      resetForm();
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (student) => {
    setEditingStudent(student);
    setFormData({
      username: student.username,
      points: student.points || 0,
      level: student.level || 'Beginner',
      streak: student.streak || { current: 0, longest: 0 },
      grade: student.grade?._id || student.grade || ''
    });
    setShowModal(true);
  };

  const handleDelete = async (studentId) => {
    if (!window.confirm('Are you sure you want to delete this student? This action cannot be undone.')) {
      return;
    }

    try {
      const response = await fetch(`${API_URL}/admin/students/${studentId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });

      if (!response.ok) {
        throw new Error('Failed to delete student');
      }

      setSuccess('Student deleted successfully');
      fetchData();
    } catch (err) {
      setError(err.message);
    }
  };

  const resetForm = () => {
    setFormData({
      username: '',
      points: 0,
      level: 'Beginner',
      streak: { current: 0, longest: 0 },
      grade: ''
    });
    setEditingStudent(null);
    setError(null);
  };

  const openCreateModal = () => {
    resetForm();
    setShowModal(true);
  };

  const getLevelColor = (level) => {
    const colors = {
      'Beginner': '#6B7280',
      'Learner': '#3B82F6',
      'Advanced': '#8B5CF6',
      'Expert': '#EC4899',
      'Master': '#FFD700'
    };
    return colors[level] || '#6B7280';
  };

  const filteredStudents = students.filter(student => {
    const matchesSearch = student.username.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesGrade = !gradeFilter || (student.grade?._id === gradeFilter || student.grade === gradeFilter);
    return matchesSearch && matchesGrade;
  });

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
                <User size={24} /> Student Management
              </h1>
              <p style={{ color: '#9CA3AF', margin: 0, fontSize: '0.875rem' }}>Manage student accounts, grades, and performance</p>
            </div>
          </div>
          <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
            <button onClick={openCreateModal} style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'linear-gradient(135deg, #10B981, #059669)', color: 'white', border: 'none', padding: '10px 24px', borderRadius: '8px', cursor: 'pointer', fontWeight: '600' }}>
              <Plus size={18} /> Add Student
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

        {/* Filters */}
        <div style={{ background: 'white', borderRadius: '12px', padding: '20px', marginBottom: '25px', boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
            <h3 style={{ margin: 0, color: '#1F2937', fontSize: '1.1rem', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Filter size={18} /> Filters
            </h3>
            <button
              onClick={() => setShowFilters(!showFilters)}
              style={{ background: 'none', border: 'none', color: '#6B7280', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}
            >
              {showFilters ? 'Hide' : 'Show'} <ChevronDown size={16} style={{ transform: showFilters ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }} />
            </button>
          </div>

          {showFilters && (
            <div style={{ display: 'flex', gap: '15px', flexWrap: 'wrap' }}>
              <div style={{ flex: '1', minWidth: '200px' }}>
                <label style={{ display: 'block', marginBottom: '6px', fontWeight: '600', color: '#1F2937', fontSize: '0.875rem' }}>Search Students</label>
                <div style={{ position: 'relative' }}>
                  <Search size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#9CA3AF' }} />
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Search by username..."
                    style={{ width: '100%', padding: '12px 12px 12px 36px', border: '2px solid #E5E7EB', borderRadius: '8px', fontSize: '1rem' }}
                  />
                </div>
              </div>

              <div style={{ minWidth: '200px' }}>
                <label style={{ display: 'block', marginBottom: '6px', fontWeight: '600', color: '#1F2937', fontSize: '0.875rem' }}>Filter by Grade</label>
                <select
                  value={gradeFilter}
                  onChange={(e) => setGradeFilter(e.target.value)}
                  style={{ width: '100%', padding: '12px', border: '2px solid #E5E7EB', borderRadius: '8px', fontSize: '1rem' }}
                >
                  <option value="">All Grades</option>
                  {grades.map(grade => (
                    <option key={grade._id} value={grade._id}>{grade.displayName}</option>
                  ))}
                </select>
              </div>
            </div>
          )}

          <div style={{ marginTop: '15px', fontSize: '0.875rem', color: '#6B7280' }}>
            Showing {filteredStudents.length} of {students.length} students
          </div>
        </div>

        {/* Students List */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
          {filteredStudents.map((student) => (
            <div key={student._id} style={{ background: 'white', borderRadius: '12px', padding: '20px', boxShadow: '0 2px 8px rgba(0,0,0,0.06)', display: 'flex', alignItems: 'center', gap: '20px', flexWrap: 'wrap' }}>
              <div style={{ width: '50px', height: '50px', borderRadius: '50%', background: 'linear-gradient(135deg, #667eea, #764ba2)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: '700', fontSize: '1.2rem', flexShrink: 0 }}>
                {student.username?.charAt(0).toUpperCase()}
              </div>

              <div style={{ flex: '1', minWidth: '200px' }}>
                <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: '700', color: '#1F2937' }}>{student.username}</h3>
                <div style={{ display: 'flex', gap: '15px', marginTop: '5px', fontSize: '0.875rem', color: '#6B7280' }}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <BookOpen size={14} /> {student.grade?.displayName || 'No Grade'}
                  </span>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <Award size={14} /> {student.points || 0} pts
                  </span>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <Flame size={14} /> {student.streak?.current || 0} days
                  </span>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
                <span style={{
                  padding: '6px 12px',
                  borderRadius: '20px',
                  fontSize: '0.75rem',
                  fontWeight: '600',
                  background: `${getLevelColor(student.level)}20`,
                  color: getLevelColor(student.level),
                  border: `1px solid ${getLevelColor(student.level)}40`
                }}>
                  {student.level}
                </span>

                <span style={{ fontSize: '0.875rem', color: '#6B7280' }}>
                  {student.completedLessons?.length || 0} lessons done
                </span>

                <div style={{ display: 'flex', gap: '8px' }}>
                  <button onClick={() => handleEdit(student)} style={{ background: '#EFF6FF', color: '#3B82F6', border: 'none', padding: '8px 12px', borderRadius: '6px', cursor: 'pointer', fontWeight: '600', fontSize: '0.875rem', display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <Edit size={14} /> Edit
                  </button>
                  <button onClick={() => handleDelete(student._id)} style={{ background: '#FEF2F2', color: '#EF4444', border: 'none', padding: '8px 12px', borderRadius: '6px', cursor: 'pointer', fontWeight: '600', fontSize: '0.875rem', display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <Trash2 size={14} /> Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {filteredStudents.length === 0 && !loading && (
          <div style={{ textAlign: 'center', padding: '60px 20px', background: 'white', borderRadius: '12px' }}>
            <User size={48} style={{ color: '#9CA3AF', marginBottom: '15px' }} />
            <h3 style={{ color: '#1F2937', marginBottom: '8px' }}>No Students Found</h3>
            <p style={{ color: '#6B7280' }}>{searchTerm || gradeFilter ? 'Try adjusting your filters' : 'No students registered yet'}</p>
          </div>
        )}
      </main>

      {showModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div style={{ background: 'white', width: '90%', maxWidth: '500px', borderRadius: '16px', padding: '30px', position: 'relative' }}>
            <button onClick={() => { setShowModal(false); resetForm(); }} style={{ position: 'absolute', top: '15px', right: '15px', background: 'none', border: 'none', cursor: 'pointer', color: '#6B7280' }}>
              <X size={20} />
            </button>

            <h2 style={{ marginBottom: '20px', color: '#1F2937', fontSize: '1.5rem', fontWeight: '800' }}>
              {editingStudent ? 'Edit Student' : 'Add New Student'}
            </h2>

            {error && (
              <div style={{ background: '#FEF2F2', border: '1px solid #EF4444', borderRadius: '6px', padding: '10px', marginBottom: '15px', color: '#DC2626', fontSize: '0.875rem' }}>
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit}>
              {!editingStudent && (
                <div style={{ marginBottom: '15px' }}>
                  <label style={{ display: 'block', marginBottom: '6px', fontWeight: '600', color: '#1F2937', fontSize: '0.875rem' }}>Username *</label>
                  <input
                    type="text"
                    value={formData.username}
                    onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                    placeholder="Student username"
                    style={{ width: '100%', padding: '12px', border: '2px solid #E5E7EB', borderRadius: '8px', fontSize: '1rem' }}
                    required
                  />
                </div>
              )}

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginBottom: '15px' }}>
                <div>
                  <label style={{ display: 'block', marginBottom: '6px', fontWeight: '600', color: '#1F2937', fontSize: '0.875rem' }}>Points</label>
                  <input
                    type="number"
                    value={formData.points}
                    onChange={(e) => setFormData({ ...formData, points: parseInt(e.target.value) || 0 })}
                    min="0"
                    style={{ width: '100%', padding: '12px', border: '2px solid #E5E7EB', borderRadius: '8px', fontSize: '1rem' }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', marginBottom: '6px', fontWeight: '600', color: '#1F2937', fontSize: '0.875rem' }}>Level</label>
                  <select
                    value={formData.level}
                    onChange={(e) => setFormData({ ...formData, level: e.target.value })}
                    style={{ width: '100%', padding: '12px', border: '2px solid #E5E7EB', borderRadius: '8px', fontSize: '1rem' }}
                  >
                    <option value="Beginner">Beginner</option>
                    <option value="Learner">Learner</option>
                    <option value="Advanced">Advanced</option>
                    <option value="Expert">Expert</option>
                    <option value="Master">Master</option>
                  </select>
                </div>
              </div>

              <div style={{ marginBottom: '15px' }}>
                <label style={{ display: 'block', marginBottom: '6px', fontWeight: '600', color: '#1F2937', fontSize: '0.875rem' }}>Grade</label>
                <select
                  value={formData.grade}
                  onChange={(e) => setFormData({ ...formData, grade: e.target.value })}
                  style={{ width: '100%', padding: '12px', border: '2px solid #E5E7EB', borderRadius: '8px', fontSize: '1rem' }}
                >
                  <option value="">No Grade</option>
                  {grades.map(grade => (
                    <option key={grade._id} value={grade._id}>{grade.displayName}</option>
                  ))}
                </select>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginBottom: '20px' }}>
                <div>
                  <label style={{ display: 'block', marginBottom: '6px', fontWeight: '600', color: '#1F2937', fontSize: '0.875rem' }}>Current Streak</label>
                  <input
                    type="number"
                    value={formData.streak.current}
                    onChange={(e) => setFormData({ ...formData, streak: { ...formData.streak, current: parseInt(e.target.value) || 0 } })}
                    min="0"
                    style={{ width: '100%', padding: '12px', border: '2px solid #E5E7EB', borderRadius: '8px', fontSize: '1rem' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '6px', fontWeight: '600', color: '#1F2937', fontSize: '0.875rem' }}>Longest Streak</label>
                  <input
                    type="number"
                    value={formData.streak.longest}
                    onChange={(e) => setFormData({ ...formData, streak: { ...formData.streak, longest: parseInt(e.target.value) || 0 } })}
                    min="0"
                    style={{ width: '100%', padding: '12px', border: '2px solid #E5E7EB', borderRadius: '8px', fontSize: '1rem' }}
                  />
                </div>
              </div>

              <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
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
                  {saving ? 'Saving...' : <><Save size={18} /> {editingStudent ? 'Update' : 'Create'}</>}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminStudentsManagement;

import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Plus, Edit, Trash2, X, Save, School, BookOpen, Users } from 'lucide-react';

const API_URL = import.meta.env.VITE_API_URL || 'https://gamefied-earning-backend.onrender.com/api';

const AdminGradesManagement = () => {
  const { user, token } = useAuth();
  const navigate = useNavigate();

  const [grades, setGrades] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [editingGrade, setEditingGrade] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    displayName: '',
    description: '',
    order: 0,
    isActive: true
  });
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  useEffect(() => {
    if (!user || user.role !== 'admin') {
      navigate('/login');
      return;
    }
    fetchGrades();
  }, [user]);

  const fetchGrades = async () => {
    try {
      const response = await fetch(`${API_URL}/admin/grades`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await response.json();
      setGrades(data);
    } catch (err) {
      console.error('Failed to fetch grades:', err);
      setError('Failed to load grades');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError(null);

    try {
      const url = editingGrade ? `${API_URL}/admin/grades/${editingGrade._id}` : `${API_URL}/admin/grades`;
      const method = editingGrade ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      });

      if (!response.ok) {
        throw new Error('Failed to save grade');
      }

      setSuccess(editingGrade ? 'Grade updated successfully' : 'Grade created successfully');
      fetchGrades();
      setShowModal(false);
      resetForm();
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (grade) => {
    setEditingGrade(grade);
    setFormData({
      name: grade.name,
      displayName: grade.displayName,
      description: grade.description || '',
      order: grade.order || 0,
      isActive: grade.isActive
    });
    setShowModal(true);
  };

  const handleDelete = async (gradeId) => {
    if (!window.confirm('Are you sure you want to delete this grade? This will also delete all subjects and lessons under it.')) {
      return;
    }

    try {
      const response = await fetch(`${API_URL}/admin/grades/${gradeId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });

      if (!response.ok) {
        throw new Error('Failed to delete grade');
      }

      setSuccess('Grade deleted successfully');
      fetchGrades();
    } catch (err) {
      setError(err.message);
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      displayName: '',
      description: '',
      order: 0,
      isActive: true
    });
    setEditingGrade(null);
    setError(null);
  };

  const openCreateModal = () => {
    resetForm();
    setShowModal(true);
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
              ← Back to Dashboard
            </Link>
            <div>
              <h1 style={{ color: 'white', fontSize: '1.5rem', margin: 0, fontWeight: '800', display: 'flex', alignItems: 'center', gap: '10px' }}>
                <School size={24} /> Grade Management
              </h1>
              <p style={{ color: '#9CA3AF', margin: 0, fontSize: '0.875rem' }}>Create and manage grades</p>
            </div>
          </div>
          <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
            <button onClick={openCreateModal} style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'linear-gradient(135deg, #10B981, #059669)', color: 'white', border: 'none', padding: '10px 24px', borderRadius: '8px', cursor: 'pointer', fontWeight: '600' }}>
              <Plus size={18} /> Add Grade
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

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '20px' }}>
          {grades.map((grade, index) => (
            <div key={grade._id} style={{ background: 'white', borderRadius: '12px', padding: '20px', boxShadow: '0 2px 8px rgba(0,0,0,0.06)', borderTop: `4px solid ${['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6'][index % 5]}` }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '15px' }}>
                <div>
                  <h3 style={{ margin: 0, fontSize: '1.25rem', fontWeight: '700', color: '#1F2937' }}>{grade.displayName}</h3>
                  <p style={{ margin: '5px 0 0', fontSize: '0.875rem', color: '#6B7280' }}>ID: {grade.name}</p>
                </div>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <button onClick={() => handleEdit(grade)} style={{ background: '#EFF6FF', color: '#3B82F6', border: 'none', padding: '8px', borderRadius: '6px', cursor: 'pointer' }}>
                    <Edit size={16} />
                  </button>
                  <button onClick={() => handleDelete(grade._id)} style={{ background: '#FEF2F2', color: '#EF4444', border: 'none', padding: '8px', borderRadius: '6px', cursor: 'pointer' }}>
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>

              {grade.description && (
                <p style={{ fontSize: '0.875rem', color: '#6B7280', marginBottom: '15px' }}>{grade.description}</p>
              )}

              <div style={{ display: 'flex', gap: '15px', fontSize: '0.875rem', color: '#6B7280' }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <Users size={14} /> {grade.studentCount || 0} students
                </span>
                <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <BookOpen size={14} /> {grade.subjectCount || 0} subjects
                </span>
              </div>

              <div style={{ marginTop: '15px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ fontSize: '0.75rem', padding: '4px 8px', borderRadius: '4px', background: grade.isActive ? '#D1FAE5' : '#F3F4F6', color: grade.isActive ? '#059669' : '#6B7280' }}>
                  {grade.isActive ? 'Active' : 'Inactive'}
                </span>
                <span style={{ fontSize: '0.75rem', padding: '4px 8px', borderRadius: '4px', background: '#F3F4F6', color: '#6B7280' }}>Order: {grade.order || 0}</span>
              </div>
            </div>
          ))}
        </div>

        {grades.length === 0 && !loading && (
          <div style={{ textAlign: 'center', padding: '60px 20px', background: 'white', borderRadius: '12px' }}>
            <School size={48} style={{ color: '#9CA3AF', marginBottom: '15px' }} />
            <h3 style={{ color: '#1F2937', marginBottom: '8px' }}>No Grades Created</h3>
            <p style={{ color: '#6B7280', marginBottom: '20px' }}>Get started by creating your first grade</p>
            <button onClick={openCreateModal} style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', background: 'linear-gradient(135deg, #10B981, #059669)', color: 'white', border: 'none', padding: '12px 24px', borderRadius: '8px', cursor: 'pointer', fontWeight: '600' }}>
              <Plus size={18} /> Create First Grade
            </button>
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
              {editingGrade ? 'Edit Grade' : 'Create New Grade'}
            </h2>

            {error && (
              <div style={{ background: '#FEF2F2', border: '1px solid #EF4444', borderRadius: '6px', padding: '10px', marginBottom: '15px', color: '#DC2626', fontSize: '0.875rem' }}>
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit}>
              <div style={{ marginBottom: '15px' }}>
                <label style={{ display: 'block', marginBottom: '6px', fontWeight: '600', color: '#1F2937', fontSize: '0.875rem' }}>Grade Name (ID)</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g., grade6"
                  style={{ width: '100%', padding: '12px', border: '2px solid #E5E7EB', borderRadius: '8px', fontSize: '1rem' }}
                  required
                />
              </div>

              <div style={{ marginBottom: '15px' }}>
                <label style={{ display: 'block', marginBottom: '6px', fontWeight: '600', color: '#1F2937', fontSize: '0.875rem' }}>Display Name</label>
                <input
                  type="text"
                  value={formData.displayName}
                  onChange={(e) => setFormData({ ...formData, displayName: e.target.value })}
                  placeholder="e.g., Grade 6"
                  style={{ width: '100%', padding: '12px', border: '2px solid #E5E7EB', borderRadius: '8px', fontSize: '1rem' }}
                  required
                />
              </div>

              <div style={{ marginBottom: '15px' }}>
                <label style={{ display: 'block', marginBottom: '6px', fontWeight: '600', color: '#1F2937', fontSize: '0.875rem' }}>Description</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Brief description of this grade"
                  rows="3"
                  style={{ width: '100%', padding: '12px', border: '2px solid #E5E7EB', borderRadius: '8px', fontSize: '1rem', resize: 'vertical' }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginBottom: '20px' }}>
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
                  {saving ? 'Saving...' : <><Save size={18} /> {editingGrade ? 'Update' : 'Create'}</>}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminGradesManagement;

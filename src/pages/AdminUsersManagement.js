import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  Users, UserPlus, Edit, Trash2, X, Save, Shield, AlertTriangle,
  UserCheck, Search, Mail
} from 'lucide-react';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const AdminUsersManagement = () => {
  const { user, token } = useAuth();
  const navigate = useNavigate();

  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    role: 'student'
  });
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    if (!user || user.role !== 'admin') {
      navigate('/login');
      return;
    }
    fetchUsers();
  }, [user]);

  const fetchUsers = async () => {
    try {
      // Get all users (both students and admins)
      const response = await fetch(`${API_URL}/users`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await response.json();
      setUsers(data);
    } catch (err) {
      console.error('Failed to fetch users:', err);
      setError('Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError(null);

    try {
      const payload = { ...formData };
      if (!editingUser && !payload.password) {
        setError('Password is required for new users');
        setSaving(false);
        return;
      }

      const url = editingUser ? `${API_URL}/users/${editingUser._id}` : `${API_URL}/users`;
      const method = editingUser ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.error || 'Failed to save user');
      }

      setSuccess(editingUser ? 'User updated successfully' : 'User created successfully');
      fetchUsers();
      setShowModal(false);
      resetForm();
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (user) => {
    setEditingUser(user);
    setFormData({
      username: user.username,
      password: '',
      role: user.role || 'student'
    });
    setShowModal(true);
  };

  const handleDelete = async (userId) => {
    if (userId === user._id) {
      setError('You cannot delete your own account');
      return;
    }

    if (!window.confirm('Are you sure you want to delete this user? This will remove all their data.')) {
      return;
    }

    try {
      const response = await fetch(`${API_URL}/users/${userId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });

      if (!response.ok) {
        throw new Error('Failed to delete user');
      }

      setSuccess('User deleted successfully');
      fetchUsers();
    } catch (err) {
      setError(err.message);
    }
  };

  const resetForm = () => {
    setFormData({
      username: '',
      password: '',
      role: 'student'
    });
    setEditingUser(null);
    setError(null);
  };

  const openCreateModal = () => {
    resetForm();
    setShowModal(true);
  };

  const filteredUsers = users.filter(user => {
    const matchesSearch = user.username.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = !roleFilter || user.role === roleFilter;
    return matchesSearch && matchesRole;
  });

  const getRoleBadgeColor = (role) => {
    return role === 'admin' ? { bg: '#FEF3C7', text: '#D97706', border: '#FCD34D' } : { bg: '#D1FAE5', text: '#059669', border: '#6EE7B7' };
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
                <Shield size={24} /> User Management
              </h1>
              <p style={{ color: '#9CA3AF', margin: 0, fontSize: '0.875rem' }}>Manage admin and student accounts</p>
            </div>
          </div>
          <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
            <button onClick={openCreateModal} style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'linear-gradient(135deg, #10B981, #059669)', color: 'white', border: 'none', padding: '10px 24px', borderRadius: '8px', cursor: 'pointer', fontWeight: '600' }}>
              <UserPlus size={18} /> Add User
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
            <div style={{ display: 'flex', gap: '10px' }}>
              <button
                onClick={() => { setSearchTerm(''); setRoleFilter(''); }}
                style={{ background: 'none', border: 'none', color: '#3B82F6', cursor: 'pointer', fontWeight: '600', fontSize: '0.875rem' }}
              >
                Clear All
              </button>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '15px', flexWrap: 'wrap' }}>
            <div style={{ flex: '1', minWidth: '200px' }}>
              <label style={{ display: 'block', marginBottom: '6px', fontWeight: '600', color: '#1F2937', fontSize: '0.875rem' }}>Search Users</label>
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

            <div style={{ minWidth: '150px' }}>
              <label style={{ display: 'block', marginBottom: '6px', fontWeight: '600', color: '#1F2937', fontSize: '0.875rem' }}>Role</label>
              <select
                value={roleFilter}
                onChange={(e) => setRoleFilter(e.target.value)}
                style={{ width: '100%', padding: '12px', border: '2px solid #E5E7EB', borderRadius: '8px', fontSize: '1rem' }}
              >
                <option value="">All Roles</option>
                <option value="admin">Admin</option>
                <option value="student">Student</option>
              </select>
            </div>
          </div>

          <div style={{ marginTop: '15px', fontSize: '0.875rem', color: '#6B7280' }}>
            Showing {filteredUsers.length} of {users.length} users
          </div>
        </div>

        {/* Users List */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {filteredUsers.map((userItem) => {
            const roleColors = getRoleBadgeColor(userItem.role);
            return (
              <div key={userItem._id} style={{ background: 'white', borderRadius: '12px', padding: '20px', boxShadow: '0 2px 8px rgba(0,0,0,0.06)', display: 'flex', alignItems: 'center', gap: '20px', flexWrap: 'wrap' }}>
                <div style={{ width: '50px', height: '50px', borderRadius: '50%', background: userItem.role === 'admin' ? 'linear-gradient(135deg, #F59E0B, #EF4444)' : 'linear-gradient(135deg, #667eea, #764ba2)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: '700', fontSize: '1.2rem', flexShrink: 0 }}>
                  {userItem.username?.charAt(0).toUpperCase()}
                </div>

                <div style={{ flex: 1, minWidth: '200px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '5px', flexWrap: 'wrap' }}>
                    <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: '700', color: '#1F2937' }}>{userItem.username}</h3>
                    <span style={{
                      fontSize: '0.75rem',
                      fontWeight: '600',
                      padding: '3px 10px',
                      borderRadius: '12px',
                      background: roleColors.bg,
                      color: roleColors.text,
                      border: `1px solid ${roleColors.border}`
                    }}>
                      {userItem.role === 'admin' ? '🛡️ Admin' : '👤 Student'}
                    </span>
                  </div>
                  <p style={{ margin: 0, fontSize: '0.875rem', color: '#6B7280', display: 'flex', alignItems: 'center', gap: '5px' }}>
                    <Mail size={14} /> {userItem.email || 'No email'}
                  </p>
                  <p style={{ margin: '4px 0 0', fontSize: '0.8rem', color: '#9CA3AF' }}>
                    Created: {new Date(userItem.createdAt).toLocaleDateString()}
                  </p>
                </div>

                <div style={{ display: 'flex', gap: '8px' }}>
                  <button
                    onClick={() => handleEdit(userItem)}
                    disabled={userItem._id === user._id}
                    style={{
                      background: '#EFF6FF',
                      color: '#3B82F6',
                      border: 'none',
                      padding: '10px 16px',
                      borderRadius: '6px',
                      cursor: userItem._id === user._id ? 'default' : 'pointer',
                      fontWeight: '600',
                      fontSize: '0.875rem',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px',
                      opacity: userItem._id === user._id ? 0.5 : 1
                    }}
                  >
                    <Edit size={14} /> Edit
                  </button>
                  <button
                    onClick={() => handleDelete(userItem._id)}
                    disabled={userItem._id === user._id}
                    style={{
                      background: '#FEF2F2',
                      color: '#EF4444',
                      border: 'none',
                      padding: '10px 16px',
                      borderRadius: '6px',
                      cursor: userItem._id === user._id ? 'default' : 'pointer',
                      fontWeight: '600',
                      fontSize: '0.875rem',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px',
                      opacity: userItem._id === user._id ? 0.5 : 1
                    }}
                  >
                    <Trash2 size={14} /> Delete
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {filteredUsers.length === 0 && !loading && (
          <div style={{ textAlign: 'center', padding: '60px 20px', background: 'white', borderRadius: '12px' }}>
            <Users size={48} style={{ color: '#9CA3AF', marginBottom: '15px' }} />
            <h3 style={{ color: '#1F2937', marginBottom: '8px' }}>No Users Found</h3>
            <p style={{ color: '#6B7280' }}>{searchTerm || roleFilter ? 'Try adjusting your filters' : 'No users exist yet'}</p>
          </div>
        )}
      </main>

      {showModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div style={{ background: 'white', width: '90%', maxWidth: '450px', borderRadius: '16px', padding: '30px', position: 'relative' }}>
            <button onClick={() => { setShowModal(false); resetForm(); }} style={{ position: 'absolute', top: '15px', right: '15px', background: 'none', border: 'none', cursor: 'pointer', color: '#6B7280' }}>
              <X size={20} />
            </button>

            <h2 style={{ marginBottom: '20px', color: '#1F2937', fontSize: '1.5rem', fontWeight: '800' }}>
              {editingUser ? 'Edit User' : 'Create New User'}
            </h2>

            {error && (
              <div style={{ background: '#FEF2F2', border: '1px solid #EF4444', borderRadius: '6px', padding: '10px', marginBottom: '15px', color: '#DC2626', fontSize: '0.875rem' }}>
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit}>
              <div style={{ marginBottom: '15px' }}>
                <label style={{ display: 'block', marginBottom: '6px', fontWeight: '600', color: '#1F2937', fontSize: '0.875rem' }}>Username *</label>
                <input
                  type="text"
                  value={formData.username}
                  onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                  placeholder="Username"
                  disabled={!!editingUser}
                  style={{ width: '100%', padding: '12px', border: '2px solid #E5E7EB', borderRadius: '8px', fontSize: '1rem', opacity: editingUser ? 0.6 : 1 }}
                />
                {editingUser && (
                  <p style={{ fontSize: '0.8rem', color: '#6B7280', marginTop: '5px' }}>
                    Username cannot be changed
                  </p>
                )}
              </div>

              <div style={{ marginBottom: '15px' }}>
                <label style={{ display: 'block', marginBottom: '6px', fontWeight: '600', color: '#1F2937', fontSize: '0.875rem' }}>
                  Password {!editingUser && '*'}
                </label>
                <div style={{ position: 'relative' }}>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    placeholder={editingUser ? 'Leave blank to keep current' : 'Enter password'}
                    style={{ width: '100%', padding: '12px', border: '2px solid #E5E7EB', borderRadius: '8px', fontSize: '1rem', paddingRight: '40px' }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: '#6B7280', cursor: 'pointer' }}
                  >
                    {showPassword ? '🙈' : '👁️'}
                  </button>
                </div>
                {editingUser && (
                  <p style={{ fontSize: '0.8rem', color: '#6B7280', marginTop: '5px' }}>
                    Leave blank to keep current password
                  </p>
                )}
              </div>

              <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', marginBottom: '6px', fontWeight: '600', color: '#1F2937', fontSize: '0.875rem' }}>Role</label>
                <select
                  value={formData.role}
                  onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                  disabled={userItem?._id === user?._id}
                  style={{ width: '100%', padding: '12px', border: '2px solid #E5E7EB', borderRadius: '8px', fontSize: '1rem', opacity: userItem?._id === user?._id ? 0.6 : 1 }}
                >
                  <option value="student">Student</option>
                  <option value="admin">Admin</option>
                </select>
                {userItem?._id === user?._id && (
                  <p style={{ fontSize: '0.8rem', color: '#EF4444', marginTop: '5px' }}>
                    You cannot change your own role
                  </p>
                )}
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
                  disabled={saving || (!editingUser && !formData.password)}
                  style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'linear-gradient(135deg, #3B82F6, #2563EB)', color: 'white', border: 'none', padding: '12px 24px', borderRadius: '8px', cursor: 'pointer', fontWeight: '600', opacity: (saving || (!editingUser && !formData.password)) ? 0.7 : 1 }}
                >
                  {saving ? 'Saving...' : <><Save size={18} /> {editingUser ? 'Update' : 'Create'}</>}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminUsersManagement;

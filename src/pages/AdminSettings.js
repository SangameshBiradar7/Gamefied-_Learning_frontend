import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  Settings, Save, Bell, Globe, Users, Video, BookOpen,
  Award, Target, RotateCcw, Mail, Shield, Database
} from 'lucide-react';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const AdminSettings = () => {
  const { user, token } = useAuth();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState('general');
  const [success, setSuccess] = useState(null);
  const [error, setError] = useState(null);
  const [settings, setSettings] = useState({
    platformName: 'LearnQuest',
    allowSelfRegistration: true,
    requireEmailVerification: false,
    maxVideoSize: 500, // MB
    maxQuizQuestions: 20,
    pointsPerVideo: 20,
    pointsPerQuiz: 100,
    streakResetDays: 3,
    dailyMissionLimit: 3,
    weeklyMissionLimit: 7,
    enableNotifications: true,
    maintenanceMode: false,
    backupSchedule: 'daily'
  });

  useEffect(() => {
    if (!user || user.role !== 'admin') {
      navigate('/login');
      return;
    }
  }, [user]);

  const handleSave = async () => {
    setSaving(true);
    setError(null);

    try {
      // In a real app, you'd save to database via API
      // For now, simulate saving
      await new Promise(resolve => setTimeout(resolve, 500));
      setSuccess('Settings saved successfully');
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      setError('Failed to save settings');
    } finally {
      setSaving(false);
    }
  };

  const updateSetting = (key, value) => {
    setSettings({ ...settings, [key]: value });
  };

  const resetSettings = () => {
    setSettings({
      platformName: 'LearnQuest',
      allowSelfRegistration: true,
      requireEmailVerification: false,
      maxVideoSize: 500,
      maxQuizQuestions: 20,
      pointsPerVideo: 20,
      pointsPerQuiz: 100,
      streakResetDays: 3,
      dailyMissionLimit: 3,
      weeklyMissionLimit: 7,
      enableNotifications: true,
      maintenanceMode: false,
      backupSchedule: 'daily'
    });
    setSuccess('Settings reset to defaults');
    setTimeout(() => setSuccess(null), 3000);
  };

  const tabs = [
    { id: 'general', label: 'General', icon: <Settings size={18} /> },
    { id: 'points', label: 'Points & Rewards', icon: <Award size={18} /> },
    { id: 'missions', label: 'Missions', icon: <Target size={18} /> },
    { id: 'content', label: 'Content', icon: <BookOpen size={18} /> },
    { id: 'notifications', label: 'Notifications', icon: <Bell size={18} /> },
    { id: 'system', label: 'System', icon: <Database size={18} /> }
  ];

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
                <Settings size={24} /> Platform Settings
              </h1>
              <p style={{ color: '#9CA3AF', margin: 0, fontSize: '0.875rem' }}>Configure platform-wide settings</p>
            </div>
          </div>
          <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
            <button
              onClick={resetSettings}
              style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'rgba(255,255,255,0.1)', color: 'white', border: 'none', padding: '10px 16px', borderRadius: '8px', cursor: 'pointer', fontWeight: '600' }}
            >
              <RotateCcw size={16} /> Reset
            </button>
            <button
              onClick={handleSave}
              disabled={saving}
              style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'linear-gradient(135deg, #10B981, #059669)', color: 'white', border: 'none', padding: '10px 24px', borderRadius: '8px', cursor: 'pointer', fontWeight: '600', opacity: saving ? 0.7 : 1 }}
            >
              <Save size={18} /> {saving ? 'Saving...' : 'Save Settings'}
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

        <div style={{ display: 'flex', gap: '25px', flexWrap: 'wrap' }}>
          {/* Settings Navigation */}
          <div style={{ flex: '0 0 250px', minWidth: '250px' }}>
            <div style={{ background: 'white', borderRadius: '12px', padding: '15px', boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
              {tabs.map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  style={{
                    width: '100%',
                    textAlign: 'left',
                    padding: '12px 15px',
                    marginBottom: '4px',
                    background: activeTab === tab.id ? '#EFF6FF' : 'transparent',
                    border: 'none',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    fontWeight: activeTab === tab.id ? '700' : '500',
                    color: activeTab === tab.id ? '#3B82F6' : '#6B7280',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px',
                    fontSize: '0.9rem'
                  }}
                >
                  {tab.icon} {tab.label}
                </button>
              ))}
            </div>
          </div>

          {/* Settings Content */}
          <div style={{ flex: 1, minWidth: '300px' }}>
            <div style={{ background: 'white', borderRadius: '12px', padding: '25px', boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
              {/* General Settings */}
              {activeTab === 'general' && (
                <div>
                  <h2 style={{ marginBottom: '20px', color: '#1F2937', fontSize: '1.2rem', fontWeight: '700' }}>
                    <Globe size={22} style={{ display: 'inline', marginRight: '8px' }} />
                    General Settings
                  </h2>

                  <div style={{ marginBottom: '20px' }}>
                    <label style={{ display: 'block', marginBottom: '6px', fontWeight: '600', color: '#1F2937', fontSize: '0.875rem' }}>Platform Name</label>
                    <input
                      type="text"
                      value={settings.platformName}
                      onChange={(e) => updateSetting('platformName', e.target.value)}
                      style={{ width: '100%', padding: '12px', border: '2px solid #E5E7EB', borderRadius: '8px', fontSize: '1rem' }}
                    />
                  </div>

                  <div style={{ marginBottom: '20px' }}>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer' }}>
                      <input
                        type="checkbox"
                        checked={settings.allowSelfRegistration}
                        onChange={(e) => updateSetting('allowSelfRegistration', e.target.checked)}
                        style={{ width: '18px', height: '18px' }}
                      />
                      <span style={{ fontWeight: '600', color: '#1F2937' }}>Allow Self Registration</span>
                    </label>
                    <p style={{ fontSize: '0.8rem', color: '#6B7280', marginTop: '5px', marginLeft: '28px' }}>
                      Let new users create accounts without admin approval
                    </p>
                  </div>

                  <div style={{ marginBottom: '20px' }}>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer' }}>
                      <input
                        type="checkbox"
                        checked={settings.maintenanceMode}
                        onChange={(e) => updateSetting('maintenanceMode', e.target.checked)}
                        style={{ width: '18px', height: '18px' }}
                      />
                      <span style={{ fontWeight: '600', color: '#1F2937' }}>Maintenance Mode</span>
                    </label>
                    <p style={{ fontSize: '0.8rem', color: '#6B7280', marginTop: '5px', marginLeft: '28px' }}>
                      When enabled, only admins can access the platform
                    </p>
                  </div>
                </div>
              )}

              {/* Points & Rewards Settings */}
              {activeTab === 'points' && (
                <div>
                  <h2 style={{ marginBottom: '20px', color: '#1F2937', fontSize: '1.2rem', fontWeight: '700' }}>
                    <Award size={22} style={{ display: 'inline', marginRight: '8px' }} />
                    Points & Rewards
                  </h2>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                    <div>
                      <label style={{ display: 'block', marginBottom: '6px', fontWeight: '600', color: '#1F2937', fontSize: '0.875rem' }}>
                        <Video size={14} style={{ display: 'inline', marginRight: '4px' }} />
                        Points per Video Watched
                      </label>
                      <input
                        type="number"
                        value={settings.pointsPerVideo}
                        onChange={(e) => updateSetting('pointsPerVideo', parseInt(e.target.value) || 0)}
                        min="0"
                        style={{ width: '100%', padding: '12px', border: '2px solid #E5E7EB', borderRadius: '8px', fontSize: '1rem' }}
                      />
                    </div>

                    <div>
                      <label style={{ display: 'block', marginBottom: '6px', fontWeight: '600', color: '#1F2937', fontSize: '0.875rem' }}>
                        <Target size={14} style={{ display: 'inline', marginRight: '4px' }} />
                        Points per Quiz Completion
                      </label>
                      <input
                        type="number"
                        value={settings.pointsPerQuiz}
                        onChange={(e) => updateSetting('pointsPerQuiz', parseInt(e.target.value) || 0)}
                        min="0"
                        style={{ width: '100%', padding: '12px', border: '2px solid #E5E7EB', borderRadius: '8px', fontSize: '1rem' }}
                      />
                    </div>
                  </div>

                  <div style={{ marginTop: '20px' }}>
                    <label style={{ display: 'block', marginBottom: '6px', fontWeight: '600', color: '#1F2937', fontSize: '0.875rem' }}>Streak Reset After (Days)</label>
                    <input
                      type="number"
                      value={settings.streakResetDays}
                      onChange={(e) => updateSetting('streakResetDays', parseInt(e.target.value) || 1)}
                      min="1"
                      max="30"
                      style={{ width: '150px', padding: '12px', border: '2px solid #E5E7EB', borderRadius: '8px', fontSize: '1rem' }}
                    />
                    <p style={{ fontSize: '0.8rem', color: '#6B7280', marginTop: '5px' }}>
                      Number of inactive days before streak resets to 0
                    </p>
                  </div>
                </div>
              )}

              {/* Missions Settings */}
              {activeTab === 'missions' && (
                <div>
                  <h2 style={{ marginBottom: '20px', color: '#1F2937', fontSize: '1.2rem', fontWeight: '700' }}>
                    <Target size={22} style={{ display: 'inline', marginRight: '8px' }} />
                    Missions Configuration
                  </h2>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                    <div>
                      <label style={{ display: 'block', marginBottom: '6px', fontWeight: '600', color: '#1F2937', fontSize: '0.875rem' }}>
                        Daily Mission Limit
                      </label>
                      <input
                        type="number"
                        value={settings.dailyMissionLimit}
                        onChange={(e) => updateSetting('dailyMissionLimit', parseInt(e.target.value) || 1)}
                        min="1"
                        max="10"
                        style={{ width: '100%', padding: '12px', border: '2px solid #E5E7EB', borderRadius: '8px', fontSize: '1rem' }}
                      />
                    </div>

                    <div>
                      <label style={{ display: 'block', marginBottom: '6px', fontWeight: '600', color: '#1F2937', fontSize: '0.875rem' }}>
                        Weekly Mission Limit
                      </label>
                      <input
                        type="number"
                        value={settings.weeklyMissionLimit}
                        onChange={(e) => updateSetting('weeklyMissionLimit', parseInt(e.target.value) || 1)}
                        min="1"
                        max="10"
                        style={{ width: '100%', padding: '12px', border: '2px solid #E5E7EB', borderRadius: '8px', fontSize: '1rem' }}
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Content Settings */}
              {activeTab === 'content' && (
                <div>
                  <h2 style={{ marginBottom: '20px', color: '#1F2937', fontSize: '1.2rem', fontWeight: '700' }}>
                    <BookOpen size={22} style={{ display: 'inline', marginRight: '8px' }} />
                    Content Limits
                  </h2>

                  <div>
                    <label style={{ display: 'block', marginBottom: '6px', fontWeight: '600', color: '#1F2937', fontSize: '0.875rem' }}>
                      Max Video Upload Size (MB)
                    </label>
                    <input
                      type="number"
                      value={settings.maxVideoSize}
                      onChange={(e) => updateSetting('maxVideoSize', parseInt(e.target.value) || 50)}
                      min="50"
                      max="1000"
                      style={{ width: '200px', padding: '12px', border: '2px solid #E5E7EB', borderRadius: '8px', fontSize: '1rem' }}
                    />
                    <p style={{ fontSize: '0.8rem', color: '#6B7280', marginTop: '5px' }}>
                      Maximum allowed video file size for lesson uploads
                    </p>
                  </div>

                  <div style={{ marginTop: '20px' }}>
                    <label style={{ display: 'block', marginBottom: '6px', fontWeight: '600', color: '#1F2937', fontSize: '0.875rem' }}>
                      Max Questions per Quiz
                    </label>
                    <input
                      type="number"
                      value={settings.maxQuizQuestions}
                      onChange={(e) => updateSetting('maxQuizQuestions', parseInt(e.target.value) || 10)}
                      min="1"
                      max="50"
                      style={{ width: '200px', padding: '12px', border: '2px solid #E5E7EB', borderRadius: '8px', fontSize: '1rem' }}
                    />
                  </div>
                </div>
              )}

              {/* Notification Settings */}
              {activeTab === 'notifications' && (
                <div>
                  <h2 style={{ marginBottom: '20px', color: '#1F2937', fontSize: '1.2rem', fontWeight: '700' }}>
                    <Bell size={22} style={{ display: 'inline', marginRight: '8px' }} />
                    Notification Preferences
                  </h2>

                  <div style={{ marginBottom: '15px' }}>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer' }}>
                      <input
                        type="checkbox"
                        checked={settings.enableNotifications}
                        onChange={(e) => updateSetting('enableNotifications', e.target.checked)}
                        style={{ width: '18px', height: '18px' }}
                      />
                      <span style={{ fontWeight: '600', color: '#1F2937' }}>Enable Platform Notifications</span>
                    </label>
                    <p style={{ fontSize: '0.8rem', color: '#6B7280', marginTop: '5px', marginLeft: '28px' }}>
                      Send notifications to students about achievements, streak warnings, etc.
                    </p>
                  </div>
                </div>
              )}

              {/* System Settings */}
              {activeTab === 'system' && (
                <div>
                  <h2 style={{ marginBottom: '20px', color: '#1F2937', fontSize: '1.2rem', fontWeight: '700' }}>
                    <Database size={22} style={{ display: 'inline', marginRight: '8px' }} />
                    System Configuration
                  </h2>

                  <div style={{ marginBottom: '20px' }}>
                    <label style={{ display: 'block', marginBottom: '6px', fontWeight: '600', color: '#1F2937', fontSize: '0.875rem' }}>Backup Schedule</label>
                    <select
                      value={settings.backupSchedule}
                      onChange={(e) => updateSetting('backupSchedule', e.target.value)}
                      style={{ width: '200px', padding: '12px', border: '2px solid #E5E7EB', borderRadius: '8px', fontSize: '1rem' }}
                    >
                      <option value="daily">Daily</option>
                      <option value="weekly">Weekly</option>
                      <option value="monthly">Monthly</option>
                      <option value="manual">Manual Only</option>
                    </select>
                  </div>

                  <div style={{ padding: '20px', background: '#FEF3C7', borderRadius: '10px', border: '1px solid #FCD34D' }}>
                    <h4 style={{ margin: '0 0 8px', color: '#D97706', display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <AlertTriangle size={18} /> Warning
                    </h4>
                    <p style={{ margin: 0, fontSize: '0.875rem', color: '#92400E' }}>
                      System changes require proper testing. Always backup your database before making structural changes.
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default AdminSettings;

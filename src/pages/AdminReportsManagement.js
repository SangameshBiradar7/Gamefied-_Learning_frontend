import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  FileText, Download, BarChart3, PieChart, LineChart, TrendingUp,
  Calendar, Users, BookOpen, Target, Award, Filter, RefreshCw,
  FileSpreadsheet, FileJson
} from 'lucide-react';

const API_URL = import.meta.env.VITE_API_URL || 'https://gamefied-earning-backend.onrender.com/api';

const AdminReportsManagement = () => {
  const { user, token } = useAuth();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [reportType, setReportType] = useState('overview');
  const [dateRange, setDateRange] = useState('month');
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!user || user.role !== 'admin') {
      navigate('/login');
      return;
    }
    fetchReport();
  }, [user, reportType, dateRange]);

  const fetchReport = async () => {
    try {
      setLoading(true);
      setError(null);

      const endpoints = {
        overview: '/analytics/overview',
        students: '/analytics/top-students?limit=50',
        grades: '/analytics/grade-performance',
        activity: '/analytics/daily-activity?days=30',
        weekly: '/analytics/weekly-engagement',
        monthly: '/analytics/monthly-report',
        quizzes: '/analytics/quiz-completion',
        locations: '/analytics/village-analytics'
      };

      const endpoint = endpoints[reportType] || endpoints.overview;
      const response = await fetch(`${API_URL}${endpoint}`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (!response.ok) throw new Error('Failed to fetch report');
      const result = await response.json();
      setData(result);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const exportToJSON = () => {
    if (!data) return;
    const dataStr = JSON.stringify(data, null, 2);
    const blob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${reportType}-report-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const exportToCSV = () => {
    if (!data) return;

    // Simple CSV conversion for array data
    let csv = '';
    if (Array.isArray(data)) {
      if (data.length > 0) {
        const headers = Object.keys(data[0]);
        csv += headers.join(',') + '\n';
        data.forEach(row => {
          csv += headers.map(header => JSON.stringify(row[header] || '')).join(',') + '\n';
        });
      }
    } else {
      // For object data
      const headers = Object.keys(data);
      csv += headers.join(',') + '\n';
      csv += headers.map(header => JSON.stringify(data[header] || '')).join(',') + '\n';
    }

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${reportType}-report-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const getReportIcon = (type) => {
    const icons = {
      overview: <BarChart3 size={24} />,
      students: <Users size={24} />,
      grades: <GraduationCap size={24} />,
      activity: <LineChart size={24} />,
      weekly: <Calendar size={24} />,
      monthly: <FileText size={24} />,
      quizzes: <Target size={24} />,
      locations: <BookOpen size={24} />
    };
    return icons[type] || <FileText size={24} />;
  };

  const reportOptions = [
    { id: 'overview', label: 'Dashboard Overview', desc: 'Complete platform stats and metrics' },
    { id: 'students', label: 'Top Students', desc: 'High-performing student data' },
    { id: 'grades', label: 'Grade Performance', desc: 'Performance by grade level' },
    { id: 'activity', label: 'Daily Activity', desc: 'Daily engagement metrics' },
    { id: 'weekly', label: 'Weekly Engagement', desc: 'Weekly trends analysis' },
    { id: 'monthly', label: 'Monthly Report', desc: 'Monthly progress summary' },
    { id: 'quizzes', label: 'Quiz Analytics', desc: 'Quiz completion and scores' },
    { id: 'locations', label: 'Location Analytics', desc: 'Village & school data' }
  ];

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
                <FileText size={24} /> Reports Management
              </h1>
              <p style={{ color: '#9CA3AF', margin: 0, fontSize: '0.875rem' }}>Generate and export analytics reports</p>
            </div>
          </div>
          <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
            <button onClick={exportToJSON} disabled={!data} style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'rgba(255,255,255,0.1)', color: 'white', border: 'none', padding: '10px 16px', borderRadius: '8px', cursor: 'pointer', fontWeight: '600', opacity: (!data) ? 0.5 : 1 }}>
              <FileJson size={16} /> JSON
            </button>
            <button onClick={exportToCSV} disabled={!data} style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'rgba(255,255,255,0.1)', color: 'white', border: 'none', padding: '10px 16px', borderRadius: '8px', cursor: 'pointer', fontWeight: '600', opacity: (!data) ? 0.5 : 1 }}>
              <FileSpreadsheet size={16} /> CSV
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

        {/* Report Selection */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '15px', marginBottom: '30px' }}>
          {reportOptions.map(option => (
            <button
              key={option.id}
              onClick={() => setReportType(option.id)}
              style={{
                background: reportType === option.id ? 'white' : '#F9FAFB',
                border: `2px solid ${reportType === option.id ? '#3B82F6' : '#E5E7EB'}`,
                borderRadius: '12px',
                padding: '20px',
                textAlign: 'left',
                cursor: 'pointer',
                transition: 'all 0.2s',
                boxShadow: reportType === option.id ? '0 4px 12px rgba(59,130,246,0.15)' : '0 2px 8px rgba(0,0,0,0.05)'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
                <div style={{
                  width: '48px',
                  height: '48px',
                  borderRadius: '10px',
                  background: reportType === option.id ? '#EFF6FF' : '#F3F4F6',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: reportType === option.id ? '#3B82F6' : '#6B7280'
                }}>
                  {getReportIcon(option.id)}
                </div>
                <div>
                  <h3 style={{ margin: 0, fontSize: '1rem', fontWeight: '700', color: '#1F2937' }}>{option.label}</h3>
                  <p style={{ margin: 0, fontSize: '0.8rem', color: '#6B7280' }}>{option.desc}</p>
                </div>
              </div>
            </button>
          ))}
        </div>

        {/* Date Range Selector */}
        <div style={{ background: 'white', borderRadius: '12px', padding: '20px', marginBottom: '25px', boxShadow: '0 2px 8px rgba(0,0,0,0.06)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '15px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Calendar size={20} color="#6B7280" />
            <span style={{ fontWeight: '600', color: '#1F2937' }}>Date Range:</span>
            <div style={{ display: 'flex', gap: '8px' }}>
              {['week', 'month', 'quarter', 'year'].map(range => (
                <button
                  key={range}
                  onClick={() => setDateRange(range)}
                  style={{
                    background: dateRange === range ? '#3B82F6' : '#F3F4F6',
                    color: dateRange === range ? 'white' : '#1F2937',
                    border: 'none',
                    padding: '8px 16px',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    fontWeight: '600',
                    fontSize: '0.875rem'
                  }}
                >
                  {range.charAt(0).toUpperCase() + range.slice(1)}
                </button>
              ))}
            </div>
          </div>
          <button
            onClick={fetchReport}
            disabled={loading}
            style={{ display: 'flex', alignItems: 'center', gap: '8px', background: '#F3F4F6', color: '#1F2937', border: 'none', padding: '10px 16px', borderRadius: '8px', cursor: 'pointer', fontWeight: '600', fontSize: '0.875rem' }}
          >
            <RefreshCw size={16} style={{ animation: loading ? 'spin 1s linear infinite' : 'none' }} /> Refresh
          </button>
        </div>

        {/* Report Data */}
        {loading ? (
          <div style={{ textAlign: 'center', padding: '60px', background: 'white', borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
            <div style={{ width: '50px', height: '50px', border: '4px solid #E5E7EB', borderTop: '4px solid #3B82F6', borderRadius: '50%', animation: 'spin 1s linear infinite', margin: '0 auto 20px' }} />
            <p style={{ color: '#6B7280' }}>Loading report...</p>
          </div>
        ) : data ? (
          <div style={{ background: 'white', borderRadius: '12px', padding: '25px', boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
            <h2 style={{ marginBottom: '20px', color: '#1F2937', fontSize: '1.3rem', fontWeight: '800', display: 'flex', alignItems: 'center', gap: '10px' }}>
              {getReportIcon(reportType)}
              {reportOptions.find(r => r.id === reportType)?.label} Report
              <span style={{ fontSize: '0.875rem', fontWeight: 'normal', color: '#6B7280', marginLeft: '10px' }}>
                Generated: {new Date().toLocaleString()}
              </span>
            </h2>

            <div style={{ overflowX: 'auto' }}>
              {reportType === 'overview' && (
                <div>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '15px', marginBottom: '25px' }}>
                    {[
                      { label: 'Total Students', value: data.totalStudents || 0, icon: <Users size={20} />, color: '#3B82F6' },
                      { label: 'Active (7d)', value: data.activeStudents || 0, icon: <TrendingUp size={20} />, color: '#10B981' },
                      { label: 'Avg Points', value: data.averagePoints || 0, icon: <Award size={20} />, color: '#F59E0B' },
                      { label: 'Perfect Streaks', value: data.perfectStreaks || 0, icon: <Target size={20} />, color: '#EF4444' },
                      { label: 'Total Subjects', value: data.totalSubjects || 0, icon: <BookOpen size={20} />, color: '#8B5CF6' },
                      { label: 'Total Lessons', value: data.totalLessons || 0, icon: <FileText size={20} />, color: '#EC4899' }
                    ].map(stat => (
                      <div key={stat.label} style={{ background: '#F9FAFB', padding: '15px', borderRadius: '10px', borderLeft: `4px solid ${stat.color}` }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px', color: stat.color }}>
                          {stat.icon}
                          <span style={{ fontSize: '0.875rem', fontWeight: '600' }}>{stat.label}</span>
                        </div>
                        <div style={{ fontSize: '1.5rem', fontWeight: '800', color: '#1F2937' }}>{stat.value}</div>
                      </div>
                    ))}
                  </div>

                  {data.levelCounts && (
                    <div style={{ marginTop: '25px' }}>
                      <h3 style={{ marginBottom: '15px', color: '#1F2937' }}>Level Distribution</h3>
                      <div style={{ display: 'flex', gap: '15px', flexWrap: 'wrap' }}>
                        {data.levelCounts.map((level, idx) => (
                          <div key={level.level} style={{ flex: '1', minWidth: '120px', background: '#F9FAFB', padding: '15px', borderRadius: '10px', textAlign: 'center' }}>
                            <div style={{ fontSize: '1.1rem', fontWeight: '700', color: '#1F2937' }}>{level.level}</div>
                            <div style={{ fontSize: '1.5rem', fontWeight: '800', color: '#3B82F6' }}>{level.count}</div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {(reportType === 'students' || reportType === 'quizzes') && Array.isArray(data) && (
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr style={{ borderBottom: '2px solid #E5E7EB' }}>
                      {Object.keys(data[0] || {}).map(key => (
                        <th key={key} style={{ textAlign: 'left', padding: '12px', fontWeight: '600', color: '#1F2937', textTransform: 'capitalize' }}>
                          {key.replace(/([A-Z])/g, ' $1').trim()}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {data.map((row, idx) => (
                      <tr key={idx} style={{ borderBottom: '1px solid #E5E7EB' }}>
                        {Object.values(row).map((val, i) => (
                          <td key={i} style={{ padding: '12px', color: '#1F2937' }}>
                            {typeof val === 'object' ? JSON.stringify(val) : String(val || '-')}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}

              {(reportType === 'grades' || reportType === 'locations') && Array.isArray(data) && (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: '15px' }}>
                  {data.map((item, idx) => (
                    <div key={idx} style={{ background: '#F9FAFB', padding: '15px', borderRadius: '10px' }}>
                      <h4 style={{ margin: '0 0 10px', color: '#1F2937', textTransform: 'capitalize' }}>
                        {item.gradeName || item.village || item.school}
                      </h4>
                      {Object.entries(item)
                        .filter(([key]) => key !== 'gradeId' && key !== '_id' && key !== 'gradeName' && key !== 'village' && key !== 'school')
                        .map(([key, val]) => (
                          <div key={key} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px', fontSize: '0.875rem' }}>
                            <span style={{ color: '#6B7280' }}>{key.replace(/([A-Z])/g, ' $1').trim()}:</span>
                            <span style={{ fontWeight: '600', color: '#1F2937' }}>{val}</span>
                          </div>
                        ))}
                    </div>
                  ))}
                </div>
              )}

              {typeof data === 'object' && !Array.isArray(data) && reportType !== 'overview' && (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '15px' }}>
                  {Object.entries(data)
                    .filter(([key]) => !Array.isArray(data[key]))
                    .map(([key, val]) => (
                      <div key={key} style={{ background: '#F9FAFB', padding: '15px', borderRadius: '10px' }}>
                        <div style={{ fontSize: '0.875rem', color: '#6B7280', marginBottom: '5px' }}>
                          {key.replace(/([A-Z])/g, ' $1').trim()}
                        </div>
                        <div style={{ fontSize: '1.25rem', fontWeight: '700', color: '#1F2937' }}>{val}</div>
                      </div>
                    ))}
                </div>
              )}
            </div>
          </div>
        ) : (
          <div style={{ textAlign: 'center', padding: '60px', background: 'white', borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
            <FileText size={48} style={{ color: '#9CA3AF', marginBottom: '15px' }} />
            <h3 style={{ color: '#1F2937' }}>Select a Report</h3>
            <p style={{ color: '#6B7280' }}>Choose a report type from above to view data and export</p>
          </div>
        )}
      </main>

      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};

export default AdminReportsManagement;

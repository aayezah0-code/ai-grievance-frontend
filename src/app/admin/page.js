'use client';
import { useState, useEffect } from 'react';
import Sidebar from '@/components/Sidebar';
import { 
  Shield, FileText, Users, TrendingUp, CheckCircle, Clock, 
  AlertTriangle, RefreshCw, Trash2, Eye, BarChart2, Activity 
} from 'lucide-react';

const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

export default function AdminPage() {
  const [complaints, setComplaints] = useState([]);
  const [analytics, setAnalytics] = useState({ total: 0, resolved: 0, departments: {}, priorities: {} });
  const [schemes, setSchemes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [updatingId, setUpdatingId] = useState(null);

  useEffect(() => {
    fetchAll();
  }, []);

  const fetchAll = async () => {
    setLoading(true);
    try {
      const [compRes, analyticsRes, schemesRes] = await Promise.all([
        fetch(`${API}/api/complaints`),
        fetch(`${API}/api/analytics`),
        fetch(`${API}/api/schemes`),
      ]);
      const [compData, analyticsData, schemesData] = await Promise.all([
        compRes.json(), analyticsRes.json(), schemesRes.json()
      ]);
      setComplaints(compData);
      setAnalytics(analyticsData);
      setSchemes(schemesData);
    } catch (err) {
      console.error('Admin fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (id, newStatus) => {
    setUpdatingId(id);
    // Optimistic update
    setComplaints(prev => prev.map(c => c.id === id ? { ...c, status: newStatus } : c));
    // Re-fetch analytics
    try {
      const res = await fetch(`${API}/api/analytics`);
      const data = await res.json();
      setAnalytics(data);
    } catch (_) {}
    setUpdatingId(null);
  };

  const deleteScheme = async (id) => {
    if (!confirm('Delete this scheme?')) return;
    try {
      await fetch(`${API}/api/schemes/${id}`, { method: 'DELETE' });
      setSchemes(prev => prev.filter(s => s.id !== id));
    } catch (err) {
      alert('Failed to delete scheme.');
    }
  };

  const getStatusColor = (s) => {
    if (s === 'Resolved') return '#10b981';
    if (s === 'In Progress') return '#f59e0b';
    return '#ef4444';
  };

  const getPriorityColor = (p) => {
    if (p === 'Low') return '#22c55e';
    if (p === 'Medium') return '#f59e0b';
    if (p === 'High') return '#f97316';
    return '#ef4444';
  };

  const topDepts = Object.entries(analytics.departments || {})
    .sort((a, b) => b[1] - a[1]).slice(0, 5);
  const resolutionRate = analytics.total ? Math.round((analytics.resolved / analytics.total) * 100) : 0;

  return (
    <div className="dashboard-container">
      <Sidebar />
      <main className="main-content">

        {/* Header */}
        <section className="welcome-header">
          <div style={{ position: 'relative', zIndex: 2 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
              <Shield size={20} color="#a78bfa" />
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', margin: 0 }}>Admin Control Panel</p>
            </div>
            <h1>System <span>Dashboard</span></h1>
            <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: '1rem' }}>
              Manage complaints, schemes, and monitor platform analytics in real-time.
            </p>
          </div>
          <div style={{ position: 'absolute', top: '-50%', right: '-10%', width: '400px', height: '400px', background: 'radial-gradient(circle, rgba(139,92,246,0.3) 0%, transparent 70%)', filter: 'blur(40px)', zIndex: 1 }}></div>
        </section>

        {/* Tab Bar */}
        <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '2rem', borderBottom: '1px solid rgba(255,255,255,0.07)', paddingBottom: '0rem' }}>
          {[
            { id: 'overview', label: 'Overview', icon: <BarChart2 size={16} /> },
            { id: 'complaints', label: `Complaints (${complaints.length})`, icon: <FileText size={16} /> },
            { id: 'schemes', label: `Schemes (${schemes.length})`, icon: <Shield size={16} /> },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              style={{
                display: 'flex', alignItems: 'center', gap: '0.5rem',
                padding: '0.75rem 1.5rem',
                background: activeTab === tab.id ? 'rgba(139,92,246,0.15)' : 'transparent',
                border: 'none',
                borderBottom: activeTab === tab.id ? '2px solid var(--accent-purple)' : '2px solid transparent',
                color: activeTab === tab.id ? 'var(--accent-purple)' : 'var(--text-secondary)',
                fontWeight: 600, fontSize: '0.9rem', cursor: 'pointer',
                transition: 'all 0.2s', borderRadius: '8px 8px 0 0',
              }}
            >
              {tab.icon} {tab.label}
            </button>
          ))}
          <button
            onClick={fetchAll}
            style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.5rem 1rem', background: 'rgba(139,92,246,0.1)', border: '1px solid rgba(139,92,246,0.3)', borderRadius: '8px', color: 'var(--accent-purple)', cursor: 'pointer', fontSize: '0.85rem', fontWeight: 600, transition: 'all 0.2s' }}
          >
            <RefreshCw size={14} /> Refresh
          </button>
        </div>

        {loading ? (
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '40vh' }}>
            <div style={{ width: 40, height: 40, border: '3px solid rgba(255,255,255,0.1)', borderTopColor: 'var(--accent-purple)', borderRadius: '50%', animation: 'spin 1s linear infinite' }}></div>
          </div>
        ) : (
          <>
            {/* ── OVERVIEW TAB ── */}
            {activeTab === 'overview' && (
              <div>
                {/* Stats Row */}
                <section className="stats-grid" style={{ gridTemplateColumns: 'repeat(4, 1fr)', marginBottom: '2rem' }}>
                  <div className="stat-card">
                    <div className="stat-icon" style={{ background: 'rgba(139,92,246,0.1)', color: 'var(--accent-purple)' }}><FileText /></div>
                    <div className="stat-info"><h3>Total Complaints</h3><div className="value">{analytics.total}</div></div>
                  </div>
                  <div className="stat-card">
                    <div className="stat-icon" style={{ background: 'rgba(16,185,129,0.1)', color: 'var(--success)' }}><CheckCircle /></div>
                    <div className="stat-info"><h3>Resolved</h3><div className="value">{analytics.resolved}</div></div>
                  </div>
                  <div className="stat-card">
                    <div className="stat-icon" style={{ background: 'rgba(245,158,11,0.1)', color: 'var(--warning)' }}><Clock /></div>
                    <div className="stat-info"><h3>Pending</h3><div className="value">{analytics.total - analytics.resolved}</div></div>
                  </div>
                  <div className="stat-card">
                    <div className="stat-icon" style={{ background: 'rgba(59,130,246,0.1)', color: '#3b82f6' }}><TrendingUp /></div>
                    <div className="stat-info"><h3>Resolution Rate</h3><div className="value">{resolutionRate}%</div></div>
                  </div>
                </section>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
                  {/* Department Breakdown */}
                  <div className="glass-section">
                    <h2 className="section-title" style={{ marginBottom: '1.5rem' }}>Department Breakdown</h2>
                    {topDepts.length > 0 ? topDepts.map(([dept, count]) => (
                      <div key={dept} style={{ marginBottom: '1rem' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.3rem', fontSize: '0.85rem' }}>
                          <span>{dept}</span>
                          <span style={{ color: 'var(--accent-purple)' }}>{count} complaints</span>
                        </div>
                        <div style={{ height: 8, background: 'rgba(255,255,255,0.05)', borderRadius: 4, overflow: 'hidden' }}>
                          <div style={{ height: '100%', width: `${Math.min(100, (count / analytics.total) * 100)}%`, background: 'linear-gradient(90deg, #7c3aed, #4f46e5)', borderRadius: 4, transition: 'width 1s ease' }}></div>
                        </div>
                      </div>
                    )) : <p style={{ color: 'var(--text-secondary)' }}>No data yet.</p>}
                  </div>

                  {/* Priority Breakdown */}
                  <div className="glass-section">
                    <h2 className="section-title" style={{ marginBottom: '1.5rem' }}>Priority Distribution</h2>
                    {Object.entries(analytics.priorities || {}).map(([priority, count]) => (
                      <div key={priority} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.75rem 1rem', background: 'rgba(0,0,0,0.2)', borderRadius: '8px', marginBottom: '0.75rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                          <div style={{ width: 10, height: 10, borderRadius: '50%', background: getPriorityColor(priority) }}></div>
                          <span style={{ fontWeight: 600 }}>{priority}</span>
                        </div>
                        <span style={{ color: getPriorityColor(priority), fontWeight: 700 }}>{count}</span>
                      </div>
                    ))}
                    {Object.keys(analytics.priorities || {}).length === 0 && <p style={{ color: 'var(--text-secondary)' }}>No data yet.</p>}
                  </div>
                </div>
              </div>
            )}

            {/* ── COMPLAINTS TAB ── */}
            {activeTab === 'complaints' && (
              <div className="glass-section">
                <h2 className="section-title" style={{ marginBottom: '1.5rem' }}>All Complaints</h2>
                {complaints.length === 0 ? (
                  <p style={{ color: 'var(--text-secondary)', textAlign: 'center', padding: '3rem' }}>No complaints submitted yet.</p>
                ) : (
                  <div style={{ overflowX: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
                      <thead>
                        <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.07)' }}>
                          {['ID', 'Citizen', 'Department', 'Priority', 'Status', 'Date', 'Actions'].map(h => (
                            <th key={h} style={{ padding: '0.75rem 1rem', textAlign: 'left', color: 'var(--text-secondary)', fontWeight: 600, whiteSpace: 'nowrap' }}>{h}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {complaints.map(c => (
                          <tr key={c.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.04)', transition: 'background 0.2s' }}
                            onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.03)'}
                            onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                          >
                            <td style={{ padding: '0.75rem 1rem', color: 'var(--accent-purple)', fontWeight: 700 }}>#{c.id}</td>
                            <td style={{ padding: '0.75rem 1rem' }}>{c.citizen_name}</td>
                            <td style={{ padding: '0.75rem 1rem' }}>{c.department}</td>
                            <td style={{ padding: '0.75rem 1rem' }}>
                              <span style={{ color: getPriorityColor(c.priority), fontWeight: 700, fontSize: '0.8rem', padding: '2px 8px', background: getPriorityColor(c.priority) + '22', borderRadius: '6px' }}>{c.priority}</span>
                            </td>
                            <td style={{ padding: '0.75rem 1rem' }}>
                              <select
                                value={c.status}
                                disabled={updatingId === c.id}
                                onChange={e => updateStatus(c.id, e.target.value)}
                                style={{ background: getStatusColor(c.status) + '22', color: getStatusColor(c.status), border: `1px solid ${getStatusColor(c.status)}44`, borderRadius: '8px', padding: '4px 8px', cursor: 'pointer', fontWeight: 600, fontSize: '0.8rem', outline: 'none' }}
                              >
                                <option value="Pending" style={{ background: '#1a1a2e', color: 'white' }}>Pending</option>
                                <option value="In Progress" style={{ background: '#1a1a2e', color: 'white' }}>In Progress</option>
                                <option value="Resolved" style={{ background: '#1a1a2e', color: 'white' }}>Resolved</option>
                              </select>
                            </td>
                            <td style={{ padding: '0.75rem 1rem', color: 'var(--text-secondary)', whiteSpace: 'nowrap' }}>
                              {c.created_at ? new Date(c.created_at).toLocaleDateString('en-IN') : 'N/A'}
                            </td>
                            <td style={{ padding: '0.75rem 1rem' }}>
                              <div style={{ display: 'flex', gap: '0.5rem' }}>
                                {c.image_url && (
                                  <a href={c.image_url} target="_blank" rel="noreferrer" style={{ color: '#3b82f6', display: 'flex', alignItems: 'center' }} title="View Image">
                                    <Eye size={16} />
                                  </a>
                                )}
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}

            {/* ── SCHEMES TAB ── */}
            {activeTab === 'schemes' && (
              <div className="glass-section">
                <h2 className="section-title" style={{ marginBottom: '1.5rem' }}>Government Schemes</h2>
                {schemes.length === 0 ? (
                  <p style={{ color: 'var(--text-secondary)', textAlign: 'center', padding: '3rem' }}>No schemes found.</p>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    {schemes.map(s => (
                      <div key={s.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem 1.5rem', background: 'rgba(0,0,0,0.2)', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.06)' }}>
                        <div style={{ flex: 1 }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.25rem' }}>
                            <span style={{ fontWeight: 700, fontSize: '1rem' }}>{s.name}</span>
                            <span style={{ fontSize: '0.7rem', padding: '2px 8px', borderRadius: '6px', background: s.type === 'Central' ? 'rgba(139,92,246,0.2)' : 'rgba(59,130,246,0.2)', color: s.type === 'Central' ? '#a78bfa' : '#60a5fa', fontWeight: 700 }}>{s.type}</span>
                            {s.state && <span style={{ fontSize: '0.7rem', color: 'var(--text-secondary)' }}>({s.state})</span>}
                          </div>
                          <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', margin: 0 }}>{s.category} · Launched {s.launch_year || 'N/A'}</p>
                        </div>
                        <button
                          onClick={() => deleteScheme(s.id)}
                          style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: '8px', color: '#ef4444', padding: '0.4rem 0.75rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.82rem', fontWeight: 600 }}
                        >
                          <Trash2 size={14} /> Delete
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </>
        )}
      </main>
      <style jsx>{`
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
}

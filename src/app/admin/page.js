'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useUser } from '@/context/UserContext';
import { 
  Shield, FileText, Users, TrendingUp, CheckCircle, Clock, 
  AlertTriangle, RefreshCw, Trash2, Eye, BarChart2, Activity,
  LogOut, ShieldAlert, CheckCircle2, XCircle, Search, Filter,
  Building2, Layers, AlertOctagon, HelpCircle, ExternalLink, X
} from 'lucide-react';

const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

export default function AdminDashboardPage() {
  const { user, logout, loading: userLoading } = useUser();
  const router = useRouter();
  
  const [complaints, setComplaints] = useState([]);
  const [analytics, setAnalytics] = useState({ total: 0, resolved: 0, departments: {}, priorities: {} });
  const [schemes, setSchemes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('complaints'); // overview, complaints, schemes
  const [updatingId, setUpdatingId] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [selectedComplaint, setSelectedComplaint] = useState(null);

  // Admin Route Protection
  useEffect(() => {
    if (!userLoading) {
      if (!user) {
        router.push('/admin/login');
      }
    }
  }, [user, userLoading, router]);

  const handleAdminLogout = () => {
    logout();
    router.push('/admin/login');
  };

  const fetchAllData = async () => {
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
      setComplaints(compData || []);
      setAnalytics(analyticsData || { total: 0, resolved: 0, departments: {}, priorities: {} });
      setSchemes(schemesData || []);
    } catch (err) {
      console.error('Admin data fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user && user.role === 'admin') {
      fetchAllData();
    }
  }, [user]);

  const updateStatus = async (id, newStatus) => {
    const token = user?.access_token || (typeof window !== 'undefined' ? JSON.parse(localStorage.getItem('user') || '{}')?.access_token : null);

    if (!token) {
      alert("Admin authorization token missing. Please sign in again.");
      router.push('/admin/login');
      return;
    }

    setUpdatingId(id);
    try {
      const res = await fetch(`${API}/api/complaints/${id}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ status: newStatus })
      });

      if (res.ok) {
        const updatedComplaint = await res.json();
        setComplaints(prev => prev.map(c => c.id === id ? { ...c, status: updatedComplaint.status } : c));
        if (selectedComplaint && selectedComplaint.id === id) {
          setSelectedComplaint(prev => ({ ...prev, status: updatedComplaint.status }));
        }
        // Refresh analytics in background
        fetch(`${API}/api/analytics`).then(r => r.json()).then(data => setAnalytics(data)).catch(() => {});
      } else {
        const errData = await res.json().catch(() => ({}));
        if (res.status === 401) {
          alert("Your session has expired. Please sign in again.");
          router.push('/admin/login');
        } else if (res.status === 403) {
          alert("Access Denied: Admin authorization required.");
        } else {
          alert(errData.detail || `Status update failed: ${res.statusText}`);
        }
      }
    } catch (err) {
      console.error("Status update error:", err);
      alert("Network error: Could not reach server.");
    } finally {
      setUpdatingId(null);
    }
  };

  const deleteScheme = async (id) => {
    if (!confirm('Are you sure you want to delete this scheme?')) return;
    try {
      await fetch(`${API}/api/schemes/${id}`, { method: 'DELETE' });
      setSchemes(prev => prev.filter(s => s.id !== id));
    } catch (err) {
      alert('Failed to delete scheme.');
    }
  };

  const getStatusBadgeStyle = (status) => {
    const s = status?.toLowerCase() || '';
    if (s === 'completed' || s === 'resolved') {
      return { bg: 'rgba(16, 185, 129, 0.15)', border: 'rgba(16, 185, 129, 0.3)', color: '#34d399' };
    }
    if (s === 'in progress') {
      return { bg: 'rgba(59, 130, 246, 0.15)', border: 'rgba(59, 130, 246, 0.3)', color: '#60a5fa' };
    }
    if (s === 'approved') {
      return { bg: 'rgba(139, 92, 246, 0.15)', border: 'rgba(139, 92, 246, 0.3)', color: '#c084fc' };
    }
    if (s === 'rejected') {
      return { bg: 'rgba(239, 68, 68, 0.15)', border: 'rgba(239, 68, 68, 0.3)', color: '#f87171' };
    }
    return { bg: 'rgba(245, 158, 11, 0.15)', border: 'rgba(245, 158, 11, 0.3)', color: '#fbbf24' };
  };

  const getPriorityBadgeStyle = (p) => {
    const prio = p?.toLowerCase() || '';
    if (prio === 'high' || prio === 'critical') return { bg: 'rgba(239, 68, 68, 0.15)', color: '#f87171' };
    if (prio === 'medium') return { bg: 'rgba(245, 158, 11, 0.15)', color: '#fbbf24' };
    return { bg: 'rgba(16, 185, 129, 0.15)', color: '#34d399' };
  };

  // Loading state
  if (userLoading) {
    return (
      <div style={{ minHeight: '100vh', background: '#070314', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ width: 48, height: 48, border: '3px solid rgba(168, 85, 247, 0.2)', borderTopColor: '#c084fc', borderRadius: '50%', animation: 'spin 1s linear infinite', margin: '0 auto 1rem' }}></div>
          <p style={{ color: 'rgba(255,255,255,0.6)', letterSpacing: '1px' }}>VERIFYING ADMINISTRATOR CREDENTIALS...</p>
        </div>
      </div>
    );
  }

  // Access Denied guard
  if (!user || user.role !== 'admin') {
    return (
      <div style={{ minHeight: '100vh', background: '#070314', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', padding: '2rem' }}>
        <div style={{ maxWidth: '460px', width: '100%', background: 'rgba(15, 10, 30, 0.9)', border: '1px solid rgba(239, 68, 68, 0.3)', borderRadius: '24px', padding: '3rem 2rem', textAlign: 'center', boxShadow: '0 20px 50px rgba(0,0,0,0.7)' }}>
          <div style={{ width: 64, height: 64, background: 'rgba(239, 68, 68, 0.12)', borderRadius: '20px', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem', color: '#ef4444' }}>
            <ShieldAlert size={36} />
          </div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 900, marginBottom: '0.75rem' }}>Access Denied</h1>
          <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.92rem', lineHeight: 1.6, marginBottom: '2rem' }}>
            You do not have administrative privileges to access this area. This console is strictly restricted to verified government officials.
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            <button
              onClick={() => router.push('/admin/login')}
              style={{ width: '100%', padding: '0.85rem', background: 'linear-gradient(135deg, #7c3aed, #4f46e5)', border: 'none', borderRadius: '12px', color: 'white', fontWeight: 700, cursor: 'pointer' }}
            >
              Sign In as Administrator
            </button>
            <button
              onClick={() => router.push('/dashboard')}
              style={{ width: '100%', padding: '0.85rem', background: 'transparent', border: '1px solid rgba(255,255,255,0.15)', borderRadius: '12px', color: 'rgba(255,255,255,0.7)', fontWeight: 600, cursor: 'pointer' }}
            >
              Return to Citizen Portal
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Filtered complaints
  const filteredComplaints = complaints.filter(c => {
    const matchesStatus = statusFilter === 'ALL' || c.status?.toLowerCase() === statusFilter.toLowerCase();
    const query = searchQuery.toLowerCase();
    const matchesSearch = !query || 
      c.id?.toString().includes(query) ||
      c.citizen_name?.toLowerCase().includes(query) ||
      c.department?.toLowerCase().includes(query) ||
      c.category?.toLowerCase().includes(query) ||
      c.title?.toLowerCase().includes(query) ||
      c.original_text?.toLowerCase().includes(query);
    return matchesStatus && matchesSearch;
  });

  const resolutionRate = analytics.total ? Math.round((analytics.resolved / analytics.total) * 100) : 0;
  const topDepts = Object.entries(analytics.departments || {}).sort((a, b) => b[1] - a[1]).slice(0, 6);

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#070314', color: '#f8fafc', fontFamily: 'Inter, sans-serif' }}>
      
      {/* ─── DEDICATED ADMIN SIDEBAR ─── */}
      <aside style={{ width: '270px', background: 'rgba(10, 6, 22, 0.95)', borderRight: '1px solid rgba(168, 85, 247, 0.15)', display: 'flex', flexDirection: 'column', padding: '1.75rem 1.25rem', position: 'sticky', top: 0, height: '100vh', zIndex: 50 }}>
        
        {/* Admin Brand */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '2.5rem', padding: '0 0.5rem' }}>
          <div style={{ width: 38, height: 38, background: 'linear-gradient(135deg, #7c3aed, #4f46e5)', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 0 15px rgba(124, 58, 237, 0.4)' }}>
            <Shield size={22} color="white" />
          </div>
          <div>
            <div style={{ fontSize: '1.1rem', fontWeight: 900, color: 'white', letterSpacing: '-0.3px' }}>Grievance AI</div>
            <div style={{ fontSize: '0.72rem', color: '#c084fc', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1px' }}>Admin Console</div>
          </div>
        </div>

        {/* Navigation */}
        <nav style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', flex: 1 }}>
          <div style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.35)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1.2px', padding: '0.5rem 0.75rem' }}>
            Console Navigation
          </div>

          <button
            onClick={() => setActiveTab('complaints')}
            style={{
              display: 'flex', alignItems: 'center', gap: '0.75rem', width: '100%', padding: '0.8rem 1rem',
              borderRadius: '12px', border: 'none', background: activeTab === 'complaints' ? 'rgba(168, 85, 247, 0.15)' : 'transparent',
              color: activeTab === 'complaints' ? '#e9d5ff' : 'rgba(255,255,255,0.65)', fontWeight: 600, fontSize: '0.9rem',
              cursor: 'pointer', textAlign: 'left', transition: 'all 0.2s',
              borderLeft: activeTab === 'complaints' ? '3px solid #a855f7' : '3px solid transparent'
            }}
          >
            <FileText size={18} color={activeTab === 'complaints' ? '#c084fc' : 'currentColor'} />
            <span>Complaint Management</span>
            <span style={{ marginLeft: 'auto', fontSize: '0.75rem', padding: '2px 8px', borderRadius: '10px', background: 'rgba(255,255,255,0.06)', color: '#c084fc', fontWeight: 700 }}>
              {complaints.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('overview')}
            style={{
              display: 'flex', alignItems: 'center', gap: '0.75rem', width: '100%', padding: '0.8rem 1rem',
              borderRadius: '12px', border: 'none', background: activeTab === 'overview' ? 'rgba(168, 85, 247, 0.15)' : 'transparent',
              color: activeTab === 'overview' ? '#e9d5ff' : 'rgba(255,255,255,0.65)', fontWeight: 600, fontSize: '0.9rem',
              cursor: 'pointer', textAlign: 'left', transition: 'all 0.2s',
              borderLeft: activeTab === 'overview' ? '3px solid #a855f7' : '3px solid transparent'
            }}
          >
            <BarChart2 size={18} color={activeTab === 'overview' ? '#c084fc' : 'currentColor'} />
            <span>System Analytics</span>
          </button>

          <button
            onClick={() => setActiveTab('schemes')}
            style={{
              display: 'flex', alignItems: 'center', gap: '0.75rem', width: '100%', padding: '0.8rem 1rem',
              borderRadius: '12px', border: 'none', background: activeTab === 'schemes' ? 'rgba(168, 85, 247, 0.15)' : 'transparent',
              color: activeTab === 'schemes' ? '#e9d5ff' : 'rgba(255,255,255,0.65)', fontWeight: 600, fontSize: '0.9rem',
              cursor: 'pointer', textAlign: 'left', transition: 'all 0.2s',
              borderLeft: activeTab === 'schemes' ? '3px solid #a855f7' : '3px solid transparent'
            }}
          >
            <Layers size={18} color={activeTab === 'schemes' ? '#c084fc' : 'currentColor'} />
            <span>Government Schemes</span>
            <span style={{ marginLeft: 'auto', fontSize: '0.75rem', padding: '2px 8px', borderRadius: '10px', background: 'rgba(255,255,255,0.06)', color: 'rgba(255,255,255,0.6)' }}>
              {schemes.length}
            </span>
          </button>
        </nav>

        {/* User Card & Dedicated Admin Logout */}
        <div style={{ marginTop: 'auto', paddingTop: '1.25rem', borderTop: '1px solid rgba(255,255,255,0.08)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem', padding: '0.5rem' }}>
            <div style={{ width: 34, height: 34, borderRadius: '50%', background: 'linear-gradient(135deg, #a855f7, #6366f1)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: '0.85rem' }}>
              {user?.full_name?.charAt(0) || 'A'}
            </div>
            <div style={{ overflow: 'hidden' }}>
              <div style={{ fontSize: '0.85rem', fontWeight: 700, whiteSpace: 'nowrap', textOverflow: 'ellipsis', overflow: 'hidden' }}>{user?.full_name || 'Administrator'}</div>
              <div style={{ fontSize: '0.72rem', color: '#a855f7', fontWeight: 600 }}>Role: Verified Admin</div>
            </div>
          </div>

          <button
            onClick={handleAdminLogout}
            style={{
              width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem',
              padding: '0.75rem', background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.25)',
              borderRadius: '10px', color: '#fca5a5', fontWeight: 700, fontSize: '0.85rem', cursor: 'pointer',
              transition: 'all 0.2s'
            }}
          >
            <LogOut size={16} /> Admin Sign Out
          </button>
        </div>

      </aside>

      {/* ─── MAIN ADMIN CONTENT AREA ─── */}
      <main style={{ flex: 1, padding: '2rem 3rem', overflowY: 'auto', maxWidth: '1600px' }}>
        
        {/* Top Header */}
        <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', paddingBottom: '1.5rem', borderBottom: '1px solid rgba(255,255,255,0.07)' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
              <span style={{ fontSize: '0.85rem', color: '#c084fc', fontWeight: 700 }}>MUNICIPAL CONTROL</span>
              <span style={{ color: 'rgba(255,255,255,0.2)' }}>•</span>
              <span style={{ fontSize: '0.85rem', color: 'rgba(255,255,255,0.4)' }}>Real-Time AI Pipeline</span>
            </div>
            <h1 style={{ fontSize: '2.2rem', fontWeight: 900, letterSpacing: '-1px', margin: 0 }}>
              {activeTab === 'complaints' && 'Complaint Redressal Console'}
              {activeTab === 'overview' && 'Administrative Overview & AI Metrics'}
              {activeTab === 'schemes' && 'Government Schemes Portal'}
            </h1>
          </div>

          <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
            <button
              onClick={fetchAllData}
              style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', padding: '0.65rem 1.25rem', background: 'rgba(168, 85, 247, 0.1)', border: '1px solid rgba(168, 85, 247, 0.3)', borderRadius: '10px', color: '#c084fc', cursor: 'pointer', fontWeight: 600, fontSize: '0.85rem' }}
            >
              <RefreshCw size={15} /> Refresh Data
            </button>
          </div>
        </header>

        {loading ? (
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
            <div style={{ width: 44, height: 44, border: '3px solid rgba(255,255,255,0.1)', borderTopColor: '#a855f7', borderRadius: '50%', animation: 'spin 1s linear infinite' }}></div>
          </div>
        ) : (
          <>
            {/* ─── TAB: COMPLAINT MANAGEMENT ─── */}
            {activeTab === 'complaints' && (
              <div>
                {/* Filters & Search Toolbar */}
                <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between' }}>
                  
                  {/* Status Pills */}
                  <div style={{ display: 'flex', gap: '0.5rem', background: 'rgba(255,255,255,0.03)', padding: '4px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.06)' }}>
                    {['ALL', 'Pending', 'Approved', 'In Progress', 'Completed', 'Rejected'].map(status => (
                      <button
                        key={status}
                        onClick={() => setStatusFilter(status)}
                        style={{
                          padding: '0.5rem 1rem', borderRadius: '8px', border: 'none',
                          background: statusFilter === status ? 'rgba(168, 85, 247, 0.25)' : 'transparent',
                          color: statusFilter === status ? '#e9d5ff' : 'rgba(255,255,255,0.5)',
                          fontWeight: 700, fontSize: '0.82rem', cursor: 'pointer', transition: 'all 0.2s'
                        }}
                      >
                        {status}
                      </button>
                    ))}
                  </div>

                  {/* Search Bar */}
                  <div style={{ position: 'relative', width: '320px' }}>
                    <Search size={16} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'rgba(255,255,255,0.4)' }} />
                    <input
                      type="text"
                      placeholder="Search by ID, citizen, dept, issue..."
                      value={searchQuery}
                      onChange={e => setSearchQuery(e.target.value)}
                      style={{ width: '100%', padding: '0.65rem 1rem 0.65rem 2.6rem', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '10px', color: 'white', fontSize: '0.85rem', outline: 'none' }}
                    />
                  </div>
                </div>

                {/* Complaints Table */}
                <div style={{ background: 'rgba(15, 10, 30, 0.6)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '18px', overflow: 'hidden' }}>
                  {filteredComplaints.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '5rem 2rem', color: 'rgba(255,255,255,0.4)' }}>
                      <FileText size={40} style={{ margin: '0 auto 1rem', opacity: 0.3 }} />
                      <p style={{ fontSize: '1.1rem', fontWeight: 600 }}>No complaints match the selected filter.</p>
                    </div>
                  ) : (
                    <div style={{ overflowX: 'auto' }}>
                      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.88rem' }}>
                        <thead>
                          <tr style={{ background: 'rgba(255,255,255,0.02)', borderBottom: '1px solid rgba(255,255,255,0.08)', textAlign: 'left' }}>
                            <th style={{ padding: '1rem 1.25rem', color: 'rgba(255,255,255,0.5)', fontWeight: 700 }}>ID</th>
                            <th style={{ padding: '1rem 1.25rem', color: 'rgba(255,255,255,0.5)', fontWeight: 700 }}>Citizen</th>
                            <th style={{ padding: '1rem 1.25rem', color: 'rgba(255,255,255,0.5)', fontWeight: 700 }}>Issue / Department</th>
                            <th style={{ padding: '1rem 1.25rem', color: 'rgba(255,255,255,0.5)', fontWeight: 700 }}>Priority</th>
                            <th style={{ padding: '1rem 1.25rem', color: 'rgba(255,255,255,0.5)', fontWeight: 700 }}>Status Workflow</th>
                            <th style={{ padding: '1rem 1.25rem', color: 'rgba(255,255,255,0.5)', fontWeight: 700 }}>Date</th>
                            <th style={{ padding: '1rem 1.25rem', color: 'rgba(255,255,255,0.5)', fontWeight: 700 }}>Inspection</th>
                          </tr>
                        </thead>
                        <tbody>
                          {filteredComplaints.map(c => {
                            const badge = getStatusBadgeStyle(c.status);
                            const prioBadge = getPriorityBadgeStyle(c.priority);
                            return (
                              <tr key={c.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.04)', transition: 'background 0.15s' }}>
                                <td style={{ padding: '1.1rem 1.25rem', fontWeight: 800, color: '#c084fc' }}>
                                  #{c.id}
                                </td>
                                <td style={{ padding: '1.1rem 1.25rem' }}>
                                  <div style={{ fontWeight: 600 }}>{c.citizen_name || 'Anonymous'}</div>
                                  <div style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.4)' }}>
                                    {c.user_id ? `User UID: ${c.user_id}` : 'Unlinked / Legacy'}
                                  </div>
                                </td>
                                <td style={{ padding: '1.1rem 1.25rem', maxWidth: '320px' }}>
                                  <div style={{ fontWeight: 600, color: '#f8fafc', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                    {c.title || c.detected_issue || 'Civic Grievance'}
                                  </div>
                                  <div style={{ fontSize: '0.78rem', color: 'rgba(255,255,255,0.5)', marginTop: '2px' }}>
                                    {c.department} {c.category ? `• ${c.category}` : ''}
                                  </div>
                                </td>
                                <td style={{ padding: '1.1rem 1.25rem' }}>
                                  <span style={{ padding: '3px 10px', borderRadius: '6px', fontSize: '0.78rem', fontWeight: 800, background: prioBadge.bg, color: prioBadge.color }}>
                                    {c.priority || 'Medium'}
                                  </span>
                                </td>
                                <td style={{ padding: '1.1rem 1.25rem' }}>
                                  <select
                                    value={c.status}
                                    disabled={updatingId === c.id}
                                    onChange={e => updateStatus(c.id, e.target.value)}
                                    style={{
                                      background: badge.bg,
                                      color: badge.color,
                                      border: `1px solid ${badge.border}`,
                                      borderRadius: '8px',
                                      padding: '6px 12px',
                                      fontWeight: 700,
                                      fontSize: '0.82rem',
                                      cursor: 'pointer',
                                      outline: 'none'
                                    }}
                                  >
                                    <option value="Pending" style={{ background: '#110c22', color: '#fbbf24' }}>Pending</option>
                                    <option value="Approved" style={{ background: '#110c22', color: '#c084fc' }}>Approved</option>
                                    <option value="In Progress" style={{ background: '#110c22', color: '#60a5fa' }}>In Progress</option>
                                    <option value="Completed" style={{ background: '#110c22', color: '#34d399' }}>Completed</option>
                                    <option value="Rejected" style={{ background: '#110c22', color: '#f87171' }}>Rejected</option>
                                  </select>
                                </td>
                                <td style={{ padding: '1.1rem 1.25rem', color: 'rgba(255,255,255,0.5)', whiteSpace: 'nowrap', fontSize: '0.82rem' }}>
                                  {c.created_at ? new Date(c.created_at).toLocaleDateString('en-IN') : 'N/A'}
                                </td>
                                <td style={{ padding: '1.1rem 1.25rem' }}>
                                  <button
                                    onClick={() => setSelectedComplaint(c)}
                                    style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', padding: '0.45rem 0.85rem', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.12)', borderRadius: '8px', color: 'white', cursor: 'pointer', fontSize: '0.8rem', fontWeight: 600 }}
                                  >
                                    <Eye size={14} /> Inspect
                                  </button>
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* ─── TAB: ANALYTICS OVERVIEW ─── */}
            {activeTab === 'overview' && (
              <div>
                {/* Top Metrics Cards */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1.5rem', marginBottom: '2rem' }}>
                  <div style={{ background: 'rgba(15, 10, 30, 0.7)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '18px', padding: '1.5rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', color: '#c084fc', marginBottom: '0.5rem' }}>
                      <span style={{ fontSize: '0.85rem', fontWeight: 600 }}>Total Logged</span>
                      <FileText size={20} />
                    </div>
                    <div style={{ fontSize: '2.4rem', fontWeight: 900 }}>{analytics.total}</div>
                    <div style={{ fontSize: '0.78rem', color: 'rgba(255,255,255,0.4)', marginTop: '4px' }}>Across all municipal wards</div>
                  </div>

                  <div style={{ background: 'rgba(15, 10, 30, 0.7)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '18px', padding: '1.5rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', color: '#34d399', marginBottom: '0.5rem' }}>
                      <span style={{ fontSize: '0.85rem', fontWeight: 600 }}>Resolved Grievances</span>
                      <CheckCircle size={20} />
                    </div>
                    <div style={{ fontSize: '2.4rem', fontWeight: 900 }}>{analytics.resolved}</div>
                    <div style={{ fontSize: '0.78rem', color: 'rgba(255,255,255,0.4)', marginTop: '4px' }}>Resolution rate: {resolutionRate}%</div>
                  </div>

                  <div style={{ background: 'rgba(15, 10, 30, 0.7)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '18px', padding: '1.5rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', color: '#fbbf24', marginBottom: '0.5rem' }}>
                      <span style={{ fontSize: '0.85rem', fontWeight: 600 }}>Action Required</span>
                      <Clock size={20} />
                    </div>
                    <div style={{ fontSize: '2.4rem', fontWeight: 900 }}>{analytics.total - analytics.resolved}</div>
                    <div style={{ fontSize: '0.78rem', color: 'rgba(255,255,255,0.4)', marginTop: '4px' }}>Pending or In Progress</div>
                  </div>

                  <div style={{ background: 'rgba(15, 10, 30, 0.7)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '18px', padding: '1.5rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', color: '#60a5fa', marginBottom: '0.5rem' }}>
                      <span style={{ fontSize: '0.85rem', fontWeight: 600 }}>Efficiency Index</span>
                      <TrendingUp size={20} />
                    </div>
                    <div style={{ fontSize: '2.4rem', fontWeight: 900 }}>{resolutionRate}%</div>
                    <div style={{ fontSize: '0.78rem', color: 'rgba(255,255,255,0.4)', marginTop: '4px' }}>Average TAT: 48h</div>
                  </div>
                </div>

                {/* Distribution Charts */}
                <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '2rem' }}>
                  
                  {/* Department Breakdown */}
                  <div style={{ background: 'rgba(15, 10, 30, 0.7)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '18px', padding: '2rem' }}>
                    <h3 style={{ fontSize: '1.2rem', fontWeight: 800, marginBottom: '1.5rem' }}>Department Breakdown</h3>
                    {topDepts.length > 0 ? topDepts.map(([dept, count]) => (
                      <div key={dept} style={{ marginBottom: '1.25rem' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.4rem', fontSize: '0.88rem' }}>
                          <span style={{ fontWeight: 600 }}>{dept}</span>
                          <span style={{ color: '#c084fc', fontWeight: 700 }}>{count} complaints ({Math.round((count / (analytics.total || 1)) * 100)}%)</span>
                        </div>
                        <div style={{ height: 8, background: 'rgba(255,255,255,0.06)', borderRadius: 4, overflow: 'hidden' }}>
                          <div style={{ height: '100%', width: `${Math.min(100, (count / (analytics.total || 1)) * 100)}%`, background: 'linear-gradient(90deg, #7c3aed, #6366f1)', borderRadius: 4 }}></div>
                        </div>
                      </div>
                    )) : <p style={{ color: 'rgba(255,255,255,0.4)' }}>No complaint data recorded.</p>}
                  </div>

                  {/* Priority Breakdown */}
                  <div style={{ background: 'rgba(15, 10, 30, 0.7)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '18px', padding: '2rem' }}>
                    <h3 style={{ fontSize: '1.2rem', fontWeight: 800, marginBottom: '1.5rem' }}>Severity & Risk Distribution</h3>
                    {Object.entries(analytics.priorities || {}).map(([prio, count]) => {
                      const pBadge = getPriorityBadgeStyle(prio);
                      return (
                        <div key={prio} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem 1.25rem', background: 'rgba(255,255,255,0.03)', borderRadius: '12px', marginBottom: '0.75rem' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                            <div style={{ width: 10, height: 10, borderRadius: '50%', background: pBadge.color }}></div>
                            <span style={{ fontWeight: 700 }}>{prio}</span>
                          </div>
                          <span style={{ fontWeight: 800, color: pBadge.color }}>{count} items</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}

            {/* ─── TAB: SCHEMES MANAGEMENT ─── */}
            {activeTab === 'schemes' && (
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                  <p style={{ color: 'rgba(255,255,255,0.6)', margin: 0 }}>
                    Active Central and State government welfare schemes registered in the system.
                  </p>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  {schemes.length === 0 ? (
                    <p style={{ color: 'rgba(255,255,255,0.4)', textAlign: 'center', padding: '3rem' }}>No schemes found.</p>
                  ) : (
                    schemes.map(s => (
                      <div key={s.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1.25rem 1.5rem', background: 'rgba(15, 10, 30, 0.7)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '14px' }}>
                        <div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.35rem' }}>
                            <span style={{ fontWeight: 800, fontSize: '1.05rem', color: 'white' }}>{s.name}</span>
                            <span style={{ fontSize: '0.72rem', padding: '2px 8px', borderRadius: '6px', background: s.type === 'Central' ? 'rgba(139,92,246,0.2)' : 'rgba(59,130,246,0.2)', color: s.type === 'Central' ? '#c084fc' : '#60a5fa', fontWeight: 700 }}>
                              {s.type}
                            </span>
                            {s.state && <span style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.5)' }}>({s.state})</span>}
                          </div>
                          <p style={{ fontSize: '0.85rem', color: 'rgba(255,255,255,0.6)', margin: 0 }}>
                            {s.category} • Launched: {s.launch_year || 'N/A'} • {s.description?.substring(0, 100)}...
                          </p>
                        </div>
                        <button
                          onClick={() => deleteScheme(s.id)}
                          style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: '8px', color: '#ef4444', padding: '0.5rem 1rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.85rem', fontWeight: 600 }}
                        >
                          <Trash2 size={14} /> Remove
                        </button>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </>
        )}

      </main>

      {/* ─── INSPECTION MODAL ─── */}
      {selectedComplaint && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(10px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '2rem' }}>
          <div style={{ width: '100%', maxWidth: '780px', maxHeight: '90vh', overflowY: 'auto', background: '#0e091e', border: '1px solid rgba(168, 85, 247, 0.3)', borderRadius: '24px', padding: '2.5rem', position: 'relative' }}>
            
            <button
              onClick={() => setSelectedComplaint(null)}
              style={{ position: 'absolute', top: '1.5rem', right: '1.5rem', background: 'rgba(255,255,255,0.06)', border: 'none', borderRadius: '50%', width: 36, height: 36, color: 'white', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
            >
              <X size={18} />
            </button>

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
              <Shield size={18} color="#c084fc" />
              <span style={{ fontSize: '0.8rem', fontWeight: 800, color: '#c084fc', textTransform: 'uppercase', letterSpacing: '1px' }}>
                Forensic Complaint Record #{selectedComplaint.id}
              </span>
            </div>

            <h2 style={{ fontSize: '1.6rem', fontWeight: 900, marginBottom: '1.5rem' }}>
              {selectedComplaint.title || 'Civic Grievance Report'}
            </h2>

            {/* Evidence Image if available */}
            {selectedComplaint.image_url && (
              <div style={{ marginBottom: '1.5rem', borderRadius: '14px', overflow: 'hidden', border: '1px solid rgba(255,255,255,0.1)', maxHeight: '280px' }}>
                <img src={selectedComplaint.image_url} alt="Evidence" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              </div>
            )}

            {/* AI Summary */}
            <div style={{ background: 'rgba(168, 85, 247, 0.08)', border: '1px solid rgba(168, 85, 247, 0.2)', borderRadius: '14px', padding: '1.25rem', marginBottom: '1.5rem' }}>
              <div style={{ fontSize: '0.75rem', fontWeight: 800, color: '#c084fc', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '0.4rem' }}>
                AI Summary & Investigation Note
              </div>
              <p style={{ margin: 0, fontStyle: 'italic', fontSize: '0.95rem', lineHeight: 1.6 }}>
                "{selectedComplaint.ai_summary || selectedComplaint.original_text}"
              </p>
            </div>

            {/* Metadata Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '2rem' }}>
              <div style={{ background: 'rgba(255,255,255,0.03)', padding: '0.85rem 1rem', borderRadius: '10px' }}>
                <div style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase' }}>Citizen Name</div>
                <div style={{ fontWeight: 700, marginTop: '2px' }}>{selectedComplaint.citizen_name || 'Anonymous'} (UID: {selectedComplaint.user_id || 'N/A'})</div>
              </div>
              <div style={{ background: 'rgba(255,255,255,0.03)', padding: '0.85rem 1rem', borderRadius: '10px' }}>
                <div style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase' }}>Assigned Department</div>
                <div style={{ fontWeight: 700, marginTop: '2px', color: '#c084fc' }}>{selectedComplaint.department}</div>
              </div>
              <div style={{ background: 'rgba(255,255,255,0.03)', padding: '0.85rem 1rem', borderRadius: '10px' }}>
                <div style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase' }}>Severity / Priority</div>
                <div style={{ fontWeight: 700, marginTop: '2px' }}>{selectedComplaint.priority}</div>
              </div>
              <div style={{ background: 'rgba(255,255,255,0.03)', padding: '0.85rem 1rem', borderRadius: '10px' }}>
                <div style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase' }}>Current Status</div>
                <div style={{ fontWeight: 700, marginTop: '2px' }}>{selectedComplaint.status}</div>
              </div>
            </div>

            {/* Voice Call Details (Sarvam AI) */}
            {selectedComplaint.call_source === 'sarvam_voice' && (
              <div style={{ background: 'rgba(16, 185, 129, 0.07)', border: '1px solid rgba(16, 185, 129, 0.25)', borderRadius: '14px', padding: '1.25rem', marginBottom: '1.5rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}>
                  <span style={{ fontSize: '1.1rem' }}>📞</span>
                  <span style={{ fontSize: '0.75rem', fontWeight: 800, color: '#34d399', textTransform: 'uppercase', letterSpacing: '1px' }}>Voice Helpline Call (Sarvam AI)</span>
                  <span style={{ marginLeft: 'auto', fontSize: '0.7rem', padding: '2px 8px', borderRadius: '20px', background: 'rgba(16, 185, 129, 0.15)', color: '#34d399', fontWeight: 700, border: '1px solid rgba(16,185,129,0.3)' }}>🎙️ AI Voice Call</span>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', marginBottom: '0.75rem' }}>
                  <div style={{ background: 'rgba(255,255,255,0.03)', padding: '0.75rem 1rem', borderRadius: '10px' }}>
                    <div style={{ fontSize: '0.72rem', color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', marginBottom: '3px' }}>Caller Phone Number</div>
                    <div style={{ fontWeight: 700, color: '#6ee7b7', fontSize: '0.95rem' }}>{selectedComplaint.caller_phone || 'Not captured'}</div>
                  </div>
                  <div style={{ background: 'rgba(255,255,255,0.03)', padding: '0.75rem 1rem', borderRadius: '10px' }}>
                    <div style={{ fontSize: '0.72rem', color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', marginBottom: '3px' }}>Call Source</div>
                    <div style={{ fontWeight: 700, color: '#6ee7b7', fontSize: '0.95rem' }}>Sarvam AI Voice Agent</div>
                  </div>
                </div>
                {selectedComplaint.call_transcript && (
                  <div>
                    <div style={{ fontSize: '0.72rem', color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', marginBottom: '6px' }}>📝 Call Transcript</div>
                    <div style={{ background: 'rgba(0,0,0,0.3)', borderRadius: '10px', padding: '1rem', fontSize: '0.85rem', lineHeight: 1.7, color: 'rgba(255,255,255,0.85)', maxHeight: '180px', overflowY: 'auto', whiteSpace: 'pre-wrap', fontFamily: 'monospace', border: '1px solid rgba(255,255,255,0.07)' }}>
                      {selectedComplaint.call_transcript}
                    </div>
                  </div>
                )}
                {!selectedComplaint.call_transcript && (
                  <div style={{ fontSize: '0.82rem', color: 'rgba(255,255,255,0.35)', fontStyle: 'italic' }}>Transcript not available (add 'call_transcript' field in Sarvam tool params to capture it)</div>
                )}
              </div>
            )}

            {/* Quick Status Action */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '1.5rem', borderTop: '1px solid rgba(255,255,255,0.08)' }}>
              <div style={{ fontSize: '0.85rem', color: 'rgba(255,255,255,0.5)' }}>Change workflow status:</div>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                {['Approved', 'In Progress', 'Completed', 'Rejected'].map(st => (
                  <button
                    key={st}
                    onClick={() => updateStatus(selectedComplaint.id, st)}
                    style={{
                      padding: '0.5rem 1rem', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.15)',
                      background: selectedComplaint.status === st ? '#7c3aed' : 'rgba(255,255,255,0.06)',
                      color: 'white', fontWeight: 700, fontSize: '0.8rem', cursor: 'pointer'
                    }}
                  >
                    {st}
                  </button>
                ))}
              </div>
            </div>

          </div>
        </div>
      )}

      <style jsx>{`
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
}

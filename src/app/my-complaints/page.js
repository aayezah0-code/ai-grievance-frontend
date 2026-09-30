'use client';
import { useState, useEffect } from 'react';
import Sidebar from '@/components/Sidebar';
import { 
  Clock, CheckCircle, AlertTriangle, MessageSquare, MapPin, 
  Eye, Zap, Building2, Calendar, ShieldAlert, X, Loader2, Info,
  TrendingUp, BarChart3, Fingerprint, Activity, ShieldCheck
} from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';
import { useUser } from '@/context/UserContext';
import { getMediaUrl } from '@/utils/media';

// --- AI ANALYSIS MODAL COMPONENT ---
const AIAnalysisModal = ({ isOpen, onClose, data }) => {
  if (!isOpen || !data) return null;

  const getSentimentIcon = (sentiment) => {
    const s = sentiment?.toLowerCase() || '';
    if (s.includes('angry')) return <AlertTriangle size={18} className="text-red-500" />;
    if (s.includes('frustrated')) return <Activity size={18} className="text-orange-500" />;
    if (s.includes('urgent')) return <Zap size={18} className="text-yellow-500" />;
    if (s.includes('concerned')) return <Info size={18} className="text-blue-500" />;
    return <MessageSquare size={18} className="text-purple-500" />;
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content ai-modal ai-modal-full animate-modal-in">
        <div className="modal-header">
          <div className="ai-brand">
            <div className="ai-icon-pulse">
              <ShieldCheck size={28} color="#A855F7" />
            </div>
            <h3>Forensic AI Inspection Report</h3>
          </div>
          <button className="close-modal" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        <div className="modal-body">
          <div className="ai-grid-layout">
            <div className="ai-summary-box">
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
                <Fingerprint size={16} color="#A855F7" />
                <h4 style={{ margin: 0 }}>Inspection Summary</h4>
              </div>
              <p>
                "{data.ai_summary || "Our forensic engine is finalizing the summary report based on visual and textual evidence..."}"
              </p>
            </div>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div className="ai-metadata" style={{ gridTemplateColumns: '1fr', gap: '0.75rem', marginBottom: 0 }}>
                <div className="meta-item">
                  <span>Detected Issue</span>
                  <strong>{data.detected_issue || 'Civic Grievance'}</strong>
                </div>
                <div className="meta-item">
                  <span>Assigned Category</span>
                  <strong style={{ color: '#A855F7' }}>{data.category || 'General Infrastructure'}</strong>
                </div>
                <div className="meta-item">
                  <span>Severity Analysis</span>
                  <strong className={data.visual_risk_level?.toLowerCase() || 'medium'}>
                    {data.visual_risk_level || 'Moderate Risk'}
                  </strong>
                </div>
              </div>
              
              <div className="meta-item" style={{ background: 'rgba(168, 85, 247, 0.05)', borderColor: 'rgba(168, 85, 247, 0.2)' }}>
                <span>Emotional Sentiment</span>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', color: '#A855F7', fontWeight: 800 }}>
                  {getSentimentIcon(data.sentiment)}
                  {data.sentiment || 'Neutral / Descriptive'}
                </div>
              </div>

              <div className="meta-item">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                  <span>System Confidence</span>
                  <strong style={{ fontSize: '0.8rem', color: '#A855F7' }}>{data.confidence_score || 98}%</strong>
                </div>
                <div style={{ width: '100%', height: '8px', background: 'rgba(255,255,255,0.05)', borderRadius: '10px', overflow: 'hidden' }}>
                  <div 
                    className="confidence-bar-fill" 
                    style={{ 
                      width: `${data.confidence_score || 98}%`, 
                      height: '100%', 
                      background: 'linear-gradient(to right, #7C3AED, #A855F7)',
                      boxShadow: '0 0 10px rgba(168, 85, 247, 0.5)'
                    }}
                  ></div>
                </div>
              </div>
            </div>
          </div>

          <div style={{ marginBottom: '2.5rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
              <TrendingUp size={16} color="#ef4444" />
              <h4 style={{ margin: 0, fontSize: '0.8rem', color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', letterSpacing: '1px' }}>
                Risk Factors & Public Impact
              </h4>
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem' }}>
              {data.issue_tags?.split(',').map((tag, i) => (
                <div key={i} className="risk-tag">
                  <AlertTriangle size={14} /> {tag.trim()}
                </div>
              ))}
              {!data.issue_tags && (
                <span style={{ color: 'rgba(255,255,255,0.2)', fontSize: '0.9rem' }}>
                  No critical safety risks flagged in initial scan.
                </span>
              )}
            </div>
          </div>

          <button className="modal-action-btn" onClick={onClose}>
            Acknowledge & Close Report
          </button>
        </div>
      </div>
    </div>
  );
};

export default function MyComplaints() {
  const { t } = useLanguage();
  const { user, loading: userLoading } = useUser();
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedComplaint, setSelectedComplaint] = useState(null);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    // Wait for UserContext to finish loading from localStorage before deciding
    if (userLoading) return;

    const fetchComplaints = async () => {
      const token = user?.access_token || (typeof window !== 'undefined' ? JSON.parse(localStorage.getItem('user') || '{}')?.access_token : null);

      if (!token) {
        setComplaints([]);
        setLoading(false);
        return;
      }

      // Reset loading=true before each new fetch to prevent stale empty-state flash
      setLoading(true);

      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/api/my-complaints`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        if (res.ok) {
          const data = await res.json();
          setComplaints(data);
        } else if (res.status === 401) {
          console.warn('[MyComplaints] 401 - token may be expired, clearing complaints');
          setComplaints([]);
        } else if (res.status === 403) {
          console.warn('[MyComplaints] 403 - access denied');
          setComplaints([]);
        } else {
          console.error("Failed to fetch my-complaints:", res.status, res.statusText);
          setComplaints([]);
        }
      } catch (err) {
        console.error("Error fetching complaints:", err);
        setComplaints([]);
      } finally {
        setLoading(false);
      }
    };

    fetchComplaints();
  }, [user, userLoading]);

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-IN', { 
      day: '2-digit', month: 'short', year: 'numeric' 
    });
  };

  const getStatusClass = (status) => {
    const s = status?.toLowerCase() || '';
    if (s === 'completed' || s === 'resolved') return 'status-resolved';
    if (s === 'in progress') return 'status-inprogress';
    if (s === 'approved') return 'status-approved';
    if (s === 'rejected') return 'status-rejected';
    if (s === 'pending') return 'status-pending';
    return 'status-submitted';
  };

  const handleViewAI = (complaint) => {
    setSelectedComplaint(complaint);
    setShowModal(true);
  };

  return (
    <div className="dashboard-container">
      <Sidebar />
      <main className="main-content">
        
        <header className="welcome-header float-animation">
          <div style={{ position: 'relative', zIndex: 2 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
              <BarChart3 size={20} color="#A855F7" />
              <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.9rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '2px' }}>
                Intelligence Dashboard
              </p>
            </div>
            <h1 style={{ fontSize: '3.5rem', fontWeight: 900, letterSpacing: '-2px' }}>My <span>Complaints</span></h1>
            <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: '1.1rem', maxWidth: '600px', lineHeight: 1.6 }}>
              Real-time tracking of your reported grievances with advanced multimodal AI analysis and municipal routing.
            </p>
          </div>
          <div className="ai-scanner" style={{ opacity: 0.2 }}></div>
        </header>

        {loading ? (
          <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', height: '50vh', gap: '1.5rem' }}>
            <Loader2 className="animate-spin" size={64} color="#A855F7" />
            <p style={{ color: 'rgba(255,255,255,0.5)', fontWeight: 600, letterSpacing: '1px' }}>SYNCHRONIZING WITH DATABASE...</p>
          </div>
        ) : complaints.length === 0 ? (
          <div className="glass-panel" style={{ textAlign: 'center', padding: '6rem 2rem', marginTop: '2rem' }}>
            <div style={{ background: 'rgba(168, 85, 247, 0.1)', width: '100px', height: '100px', borderRadius: '30px', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 2rem', border: '1px solid rgba(168, 85, 247, 0.2)' }}>
              <Info size={48} color="#A855F7" />
            </div>
            <h2 style={{ fontSize: '2rem', fontWeight: 800 }}>No Active Grievances</h2>
            <p style={{ color: 'rgba(255,255,255,0.5)', marginTop: '1rem', fontSize: '1.1rem' }}>Your dashboard is currently clear. Report an issue to see AI-powered tracking here.</p>
          </div>
        ) : (
          <div className="dashboard-grid-premium">
            {complaints.map((complaint) => (
              <div key={complaint.id} className="complaint-card-premium">
                {/* Image Section — only rendered when an uploaded image exists */}
                {complaint.image_url ? (
                  <div className="card-image-wrapper">
                    <img
                      src={getMediaUrl(complaint.image_url)}
                      alt="Issue Evidence"
                      onError={(e) => { e.target.style.display = 'none'; }}
                    />
                    <div className="card-image-overlay"></div>
                    <div className="card-overlay-badges">
                      <span className={`status-badge-premium ${getStatusClass(complaint.status)}`}>
                        {complaint.status || 'Submitted'}
                      </span>
                      <div className="sentiment-badge-premium">
                        <Zap size={14} color="#A855F7" />
                        <span>{complaint.sentiment || 'Analyzing'}</span>
                      </div>
                    </div>
                  </div>
                ) : null}

                {/* Content Section */}
                <div className="card-content-premium">
                  {/* Badges shown here only when there is no image (image cards show them as overlays) */}
                  {!complaint.image_url && (
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                      <span className={`status-badge-premium ${getStatusClass(complaint.status)}`}>
                        {complaint.status || 'Submitted'}
                      </span>
                      <div className="sentiment-badge-premium">
                        <Zap size={14} color="#A855F7" />
                        <span>{complaint.sentiment || 'Analyzing'}</span>
                      </div>
                    </div>
                  )}
                  <div className="card-header-premium">
                    <h3 className="card-title-premium">{complaint.title || complaint.category || 'Civic Grievance'}</h3>
                    <span className="complaint-id-badge">ID-{complaint.id}</span>
                  </div>
                  
                  <p className="card-desc-premium">
                    {complaint.translated_text || complaint.original_text}
                  </p>

                  <div className="card-meta-grid">
                    <div className="meta-info-item">
                      <span>Department</span>
                      <strong>{complaint.department || 'Public Works'}</strong>
                    </div>
                    <div className="meta-info-item">
                      <span>Urgency</span>
                      <strong style={{ color: complaint.priority?.toLowerCase() === 'critical' ? '#ef4444' : '#fff' }}>
                        {complaint.priority || 'Medium'}
                      </strong>
                    </div>
                    <div className="meta-info-item">
                      <span>Region</span>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#fff' }}>
                        <MapPin size={12} color="#A855F7" />
                        <strong>{complaint.address?.substring(0, 18) || 'City Zone-1'}...</strong>
                      </div>
                    </div>
                    <div className="meta-info-item">
                      <span>Logged On</span>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#fff' }}>
                        <Calendar size={12} color="#A855F7" />
                        <strong>{formatDate(complaint.created_at)}</strong>
                      </div>
                    </div>
                  </div>

                  <div className="card-footer-premium">
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                      <span style={{ fontSize: '0.65rem', color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', fontWeight: 800, letterSpacing: '0.5px' }}>Resolution Target</span>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#10b981', fontSize: '0.95rem', fontWeight: 800 }}>
                        <Clock size={16} />
                        {complaint.estimated_resolution_time || '3-5 Working Days'}
                      </div>
                    </div>
                    
                    <button className="view-ai-btn" onClick={() => handleViewAI(complaint)}>
                      <Zap size={16} />
                      AI Analysis
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      <AIAnalysisModal 
        isOpen={showModal} 
        onClose={() => setShowModal(false)} 
        data={selectedComplaint} 
      />
    </div>
  );
}

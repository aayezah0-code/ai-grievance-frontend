'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import Sidebar from '@/components/Sidebar';
import { 
  Clock, CheckCircle, AlertTriangle, MessageSquare, MapPin, 
  Eye, Zap, Building2, Calendar, ShieldAlert, X, Loader2, Info,
  TrendingUp, BarChart3, Fingerprint, Activity, ShieldCheck,
  MessageCircle, Send, CheckCircle2
} from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';
import { useUser } from '@/context/UserContext';
import { getMediaUrl } from '@/utils/media';

const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

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

// --- FEEDBACK MODAL COMPONENT ---
const FeedbackModal = ({ isOpen, onClose, complaint, token, onFeedbackSubmitted }) => {
  const [feedbackText, setFeedbackText] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setFeedbackText('');
      setError('');
      setSuccess(false);
      setSubmitting(false);
    }
  }, [isOpen]);

  if (!isOpen || !complaint) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!feedbackText.trim()) {
      setError('Please enter your feedback before submitting.');
      return;
    }

    setSubmitting(true);
    setError('');

    try {
      const res = await fetch(`${API}/api/complaints/${complaint.id}/feedback`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ feedback_text: feedbackText.trim() })
      });

      const data = await res.json();

      if (res.ok) {
        setSuccess(true);
        if (onFeedbackSubmitted) onFeedbackSubmitted(complaint.id);
        setTimeout(() => {
          onClose();
        }, 2000);
      } else if (res.status === 409) {
        setError('Feedback has already been submitted for this complaint.');
      } else if (res.status === 403) {
        setError('You are not authorized to submit feedback for this complaint.');
      } else {
        setError(data.detail || 'Failed to submit feedback. Please try again.');
      }
    } catch (err) {
      setError('Network error. Please check your connection and try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div style={{
      position: 'fixed', inset: 0,
      background: 'rgba(0,0,0,0.85)',
      backdropFilter: 'blur(10px)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      zIndex: 2000, padding: '1rem'
    }}>
      <div style={{
        width: '100%', maxWidth: '520px',
        background: 'linear-gradient(135deg, #0e091e, #130a2a)',
        border: '1px solid rgba(168, 85, 247, 0.3)',
        borderRadius: '20px',
        padding: '2rem',
        position: 'relative',
        boxShadow: '0 25px 60px rgba(0,0,0,0.7), 0 0 30px rgba(168, 85, 247, 0.1)'
      }}>
        {/* Close button */}
        <button
          onClick={onClose}
          style={{
            position: 'absolute', top: '1.25rem', right: '1.25rem',
            background: 'rgba(255,255,255,0.06)', border: 'none',
            borderRadius: '50%', width: 34, height: 34,
            color: 'white', cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center'
          }}
        >
          <X size={16} />
        </button>

        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem' }}>
          <div style={{
            width: 40, height: 40,
            background: 'rgba(168, 85, 247, 0.15)',
            border: '1px solid rgba(168, 85, 247, 0.3)',
            borderRadius: '12px',
            display: 'flex', alignItems: 'center', justifyContent: 'center'
          }}>
            <MessageCircle size={20} color="#A855F7" />
          </div>
          <div>
            <div style={{ fontSize: '0.72rem', color: '#A855F7', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1px' }}>
              Citizen Feedback
            </div>
            <h3 style={{ margin: 0, fontSize: '1.15rem', fontWeight: 800 }}>
              Complaint #{complaint.id}
            </h3>
          </div>
        </div>

        {/* Complaint Title */}
        <div style={{
          background: 'rgba(255,255,255,0.04)',
          border: '1px solid rgba(255,255,255,0.08)',
          borderRadius: '10px',
          padding: '0.75rem 1rem',
          marginBottom: '1.5rem',
          fontSize: '0.88rem',
          color: 'rgba(255,255,255,0.7)'
        }}>
          <span style={{ fontWeight: 700, color: 'white' }}>
            {complaint.title || complaint.category || 'Civic Grievance'}
          </span>
          <span style={{ margin: '0 0.5rem', color: 'rgba(255,255,255,0.3)' }}>•</span>
          <span style={{
            fontSize: '0.76rem',
            padding: '2px 8px',
            borderRadius: '6px',
            background: 'rgba(168, 85, 247, 0.15)',
            color: '#c084fc',
            fontWeight: 700
          }}>
            {complaint.status}
          </span>
        </div>

        {success ? (
          <div style={{
            display: 'flex', flexDirection: 'column', alignItems: 'center',
            gap: '1rem', padding: '2rem 1rem', textAlign: 'center'
          }}>
            <div style={{
              width: 60, height: 60,
              background: 'rgba(16, 185, 129, 0.15)',
              border: '1px solid rgba(16, 185, 129, 0.3)',
              borderRadius: '50%',
              display: 'flex', alignItems: 'center', justifyContent: 'center'
            }}>
              <CheckCircle2 size={30} color="#10b981" />
            </div>
            <div>
              <p style={{ fontSize: '1.1rem', fontWeight: 800, color: '#10b981', marginBottom: '0.5rem' }}>
                Feedback submitted successfully!
              </p>
              <p style={{ fontSize: '0.88rem', color: 'rgba(255,255,255,0.5)' }}>
                Thank you for your response. This window will close shortly.
              </p>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            <div style={{ marginBottom: '1.25rem' }}>
              <label style={{
                display: 'block',
                fontSize: '0.82rem', fontWeight: 700,
                color: 'rgba(255,255,255,0.6)',
                textTransform: 'uppercase', letterSpacing: '0.5px',
                marginBottom: '0.6rem'
              }}>
                Your Experience
              </label>
              <textarea
                value={feedbackText}
                onChange={e => setFeedbackText(e.target.value)}
                placeholder="Tell us about your experience with this complaint..."
                rows={5}
                style={{
                  width: '100%',
                  padding: '0.85rem 1rem',
                  background: 'rgba(255,255,255,0.04)',
                  border: '1px solid rgba(255,255,255,0.12)',
                  borderRadius: '12px',
                  color: 'white',
                  fontSize: '0.92rem',
                  lineHeight: 1.6,
                  resize: 'vertical',
                  outline: 'none',
                  fontFamily: 'inherit',
                  boxSizing: 'border-box',
                  transition: 'border-color 0.2s'
                }}
                onFocus={e => e.target.style.borderColor = 'rgba(168, 85, 247, 0.5)'}
                onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.12)'}
              />
              <div style={{
                display: 'flex', justifyContent: 'flex-end',
                fontSize: '0.75rem', color: 'rgba(255,255,255,0.3)',
                marginTop: '0.35rem'
              }}>
                {feedbackText.length} characters
              </div>
            </div>

            {error && (
              <div style={{
                background: 'rgba(239, 68, 68, 0.1)',
                border: '1px solid rgba(239, 68, 68, 0.3)',
                borderRadius: '10px',
                padding: '0.75rem 1rem',
                marginBottom: '1rem',
                fontSize: '0.86rem',
                color: '#fca5a5',
                display: 'flex', alignItems: 'center', gap: '0.5rem'
              }}>
                <AlertTriangle size={15} />
                {error}
              </div>
            )}

            <div style={{ display: 'flex', gap: '0.75rem' }}>
              <button
                type="button"
                onClick={onClose}
                style={{
                  flex: 1,
                  padding: '0.8rem',
                  background: 'transparent',
                  border: '1px solid rgba(255,255,255,0.15)',
                  borderRadius: '12px',
                  color: 'rgba(255,255,255,0.6)',
                  fontWeight: 600, fontSize: '0.9rem',
                  cursor: 'pointer'
                }}
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submitting}
                style={{
                  flex: 2,
                  padding: '0.8rem',
                  background: submitting
                    ? 'rgba(168, 85, 247, 0.4)'
                    : 'linear-gradient(135deg, #7c3aed, #a855f7)',
                  border: 'none',
                  borderRadius: '12px',
                  color: 'white',
                  fontWeight: 700, fontSize: '0.9rem',
                  cursor: submitting ? 'not-allowed' : 'pointer',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem',
                  transition: 'all 0.2s',
                  boxShadow: submitting ? 'none' : '0 4px 15px rgba(124, 58, 237, 0.4)'
                }}
              >
                {submitting ? (
                  <><Loader2 size={16} style={{ animation: 'spin 1s linear infinite' }} /> Submitting...</>
                ) : (
                  <><Send size={16} /> Submit Feedback</>
                )}
              </button>
            </div>
          </form>
        )}
      </div>

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>
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

  // --- Feedback state ---
  const [feedbackComplaint, setFeedbackComplaint] = useState(null);
  const [showFeedbackModal, setShowFeedbackModal] = useState(false);
  const [feedbackSubmitted, setFeedbackSubmitted] = useState(new Set());

  useEffect(() => {
    if (userLoading) return;

    const fetchComplaints = async () => {
      const token = user?.access_token || (typeof window !== 'undefined' ? JSON.parse(localStorage.getItem('user') || '{}')?.access_token : null);

      if (!token) {
        setComplaints([]);
        setLoading(false);
        return;
      }

      setLoading(true);

      try {
        const res = await fetch(`${API}/api/my-complaints`, {
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

  const handleOpenFeedback = (complaint) => {
    setFeedbackComplaint(complaint);
    setShowFeedbackModal(true);
  };

  const handleFeedbackSubmitted = (complaintId) => {
    setFeedbackSubmitted(prev => new Set([...prev, complaintId]));
  };

  const getToken = () => {
    return user?.access_token || (typeof window !== 'undefined' ? JSON.parse(localStorage.getItem('user') || '{}')?.access_token : null);
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
        ) : !getToken() ? (
          <div className="glass-panel" style={{ textAlign: 'center', padding: '5rem 2rem', marginTop: '2rem' }}>
            <div style={{ background: 'rgba(168, 85, 247, 0.1)', width: '90px', height: '90px', borderRadius: '25px', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem', border: '1px solid rgba(168, 85, 247, 0.2)' }}>
              <ShieldAlert size={44} color="#A855F7" />
            </div>
            <h2 style={{ fontSize: '1.8rem', fontWeight: 800 }}>Please Sign In to View Your Complaints</h2>
            <p style={{ color: 'rgba(255,255,255,0.6)', marginTop: '0.75rem', fontSize: '1rem', maxWidth: '520px', margin: '0.75rem auto 1.75rem', lineHeight: 1.6 }}>
              Complaints are securely tied to your registered citizen account. Sign in to view real-time tracking, multimodal forensic AI analysis, and submit resolution feedback.
            </p>
            <Link href="/login" style={{
              display: 'inline-flex', alignItems: 'center', gap: '0.5rem',
              background: 'linear-gradient(135deg, #7c3aed, #a855f7)',
              color: 'white', padding: '0.8rem 2rem', borderRadius: '12px',
              textDecoration: 'none', fontWeight: 700, fontSize: '0.95rem',
              boxShadow: '0 8px 25px rgba(124, 58, 237, 0.4)'
            }}>
              Sign In to Your Account →
            </Link>
          </div>
        ) : complaints.length === 0 ? (
          <div className="glass-panel" style={{ textAlign: 'center', padding: '6rem 2rem', marginTop: '2rem' }}>
            <div style={{ background: 'rgba(168, 85, 247, 0.1)', width: '100px', height: '100px', borderRadius: '30px', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 2rem', border: '1px solid rgba(168, 85, 247, 0.2)' }}>
              <Info size={48} color="#A855F7" />
            </div>
            <h2 style={{ fontSize: '2rem', fontWeight: 800 }}>No Active Grievances</h2>
            <p style={{ color: 'rgba(255,255,255,0.5)', marginTop: '1rem', fontSize: '1.1rem' }}>You have not reported any issues yet under this account. Report a problem to track it live here.</p>
            <div style={{ marginTop: '1.5rem' }}>
              <Link href="/dashboard" style={{
                display: 'inline-flex', alignItems: 'center', gap: '0.5rem',
                background: 'linear-gradient(135deg, #7c3aed, #a855f7)',
                color: 'white', padding: '0.75rem 1.75rem', borderRadius: '12px',
                textDecoration: 'none', fontWeight: 700, fontSize: '0.9rem'
              }}>
                Report an Issue Now
              </Link>
            </div>
          </div>
        ) : (
          <div className="dashboard-grid-premium">
            {complaints.map((complaint) => {
              const hasFeedback = feedbackSubmitted.has(complaint.id) || !!complaint.feedback_text;
              return (
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
                    {/* Badges shown here only when there is no image */}
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
                      
                      {/* Action buttons */}
                      <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                        <button className="view-ai-btn" onClick={() => handleViewAI(complaint)}>
                          <Zap size={16} />
                          AI Analysis
                        </button>

                        {/* Give Feedback button */}
                        <button
                          onClick={() => handleOpenFeedback(complaint)}
                          disabled={hasFeedback}
                          title={hasFeedback ? 'Feedback submitted for this complaint' : 'Give feedback on this complaint'}
                          style={{
                            display: 'flex', alignItems: 'center', gap: '0.4rem',
                            padding: '0.55rem 0.9rem',
                            background: hasFeedback
                              ? 'rgba(16, 185, 129, 0.1)'
                              : 'rgba(168, 85, 247, 0.1)',
                            border: hasFeedback
                              ? '1px solid rgba(16, 185, 129, 0.3)'
                              : '1px solid rgba(168, 85, 247, 0.3)',
                            borderRadius: '10px',
                            color: hasFeedback ? '#10b981' : '#c084fc',
                            fontWeight: 700,
                            fontSize: '0.8rem',
                            cursor: hasFeedback ? 'default' : 'pointer',
                            transition: 'all 0.2s',
                            whiteSpace: 'nowrap'
                          }}
                        >
                          {hasFeedback ? (
                            <><CheckCircle2 size={14} /> Feedback Sent</>
                          ) : (
                            <><MessageCircle size={14} /> Give Feedback</>
                          )}
                        </button>
                      </div>
                    </div>

                    {/* Resolution Confirmation & Feedback Display for Completed / Reviewed complaints */}
                    {(complaint.resolution_response || complaint.feedback_text || complaint.status === 'Completed' || complaint.status === 'Resolved') && (
                      <div style={{
                        marginTop: '0.9rem',
                        padding: '0.75rem 1rem',
                        borderRadius: '12px',
                        background: complaint.resolution_response === 'solved'
                          ? 'rgba(16, 185, 129, 0.08)'
                          : complaint.resolution_response === 'not_solved'
                          ? 'rgba(239, 68, 68, 0.08)'
                          : 'rgba(245, 158, 11, 0.06)',
                        border: complaint.resolution_response === 'solved'
                          ? '1px solid rgba(16, 185, 129, 0.25)'
                          : complaint.resolution_response === 'not_solved'
                          ? '1px solid rgba(239, 68, 68, 0.25)'
                          : '1px solid rgba(245, 158, 11, 0.2)',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '0.4rem'
                      }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.5rem' }}>
                          <span style={{ fontSize: '0.72rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.8px', color: 'rgba(255,255,255,0.5)' }}>
                            Resolution Confirmation
                          </span>
                          <span style={{
                            fontSize: '0.78rem',
                            fontWeight: 800,
                            padding: '2px 8px',
                            borderRadius: '6px',
                            background: complaint.resolution_response === 'solved'
                              ? 'rgba(16, 185, 129, 0.2)'
                              : complaint.resolution_response === 'not_solved'
                              ? 'rgba(239, 68, 68, 0.2)'
                              : 'rgba(245, 158, 11, 0.15)',
                            color: complaint.resolution_response === 'solved'
                              ? '#34d399'
                              : complaint.resolution_response === 'not_solved'
                              ? '#f87171'
                              : '#fbbf24'
                          }}>
                            {complaint.resolution_response === 'solved'
                              ? '✓ Solved'
                              : complaint.resolution_response === 'not_solved'
                              ? '✕ Not Solved'
                              : 'Awaiting Response'}
                          </span>
                        </div>

                        {complaint.feedback_text && (
                          <div style={{ fontSize: '0.84rem', color: 'rgba(255,255,255,0.8)', fontStyle: 'italic', marginTop: '2px' }}>
                            "{complaint.feedback_text}"
                          </div>
                        )}
                      </div>
                    )}

                    {/* Inline success message after feedback submission in this session */}
                    {hasFeedback && !complaint.feedback_text && (
                      <div style={{
                        marginTop: '0.75rem',
                        padding: '0.6rem 0.9rem',
                        background: 'rgba(16, 185, 129, 0.08)',
                        border: '1px solid rgba(16, 185, 129, 0.2)',
                        borderRadius: '10px',
                        display: 'flex', alignItems: 'center', gap: '0.5rem',
                        fontSize: '0.82rem', color: '#34d399'
                      }}>
                        <CheckCircle2 size={14} />
                        Feedback submitted successfully. Thank you!
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>

      <AIAnalysisModal 
        isOpen={showModal} 
        onClose={() => setShowModal(false)} 
        data={selectedComplaint} 
      />

      <FeedbackModal
        isOpen={showFeedbackModal}
        onClose={() => setShowFeedbackModal(false)}
        complaint={feedbackComplaint}
        token={getToken()}
        onFeedbackSubmitted={handleFeedbackSubmitted}
      />
    </div>
  );
}

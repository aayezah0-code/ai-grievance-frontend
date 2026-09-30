'use client';
import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import dynamic from 'next/dynamic';
import Sidebar from '@/components/Sidebar';
import CivicImpactGallery from '@/components/CivicImpactGallery';
import { 
  FileText, CheckCircle, Clock, Mic, MapPin, Camera, Send, Search,
  X, Tag, Building2, Zap, Eye, PhoneCall, PhoneForwarded
} from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';
import { useUser } from '@/context/UserContext';
import { getMediaUrl } from '@/utils/media';

const DashboardMap = dynamic(() => import('@/components/DashboardMap'), { 
  ssr: false,
  loading: () => <div className="map-container" style={{display:'flex',alignItems:'center',justifyContent:'center',background:'rgba(0,0,0,0.2)'}}>Loading Map...</div>
});

const PRIORITY_COLORS = { Low:'#22c55e', Medium:'#f59e0b', High:'#f97316', Urgent:'#ef4444' };
const DEPT_ICONS = { Electricity:'⚡', 'Water Supply':'💧', Sanitation:'🗑️', Roads:'🛣️', 'Public Services':'🏛️', 'Animal Welfare':'🐾' };

export default function Dashboard() {
  const router = useRouter();
  const { t } = useLanguage();
  const { user } = useUser();
  const [userName, setUserName] = useState('Citizen');
  const [analytics, setAnalytics] = useState({ total:0, resolved:0, in_progress:0 });
  const [complaintText, setComplaintText] = useState('');
  const [address, setAddress] = useState('');
  const [pincode, setPincode] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState(null);
  const [locationName, setLocationName] = useState('No location selected');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [aiStep, setAiStep] = useState(''); // 'uploading' | 'analyzing' | ''
  const [photo, setPhoto] = useState(null);
  const [photoPreview, setPhotoPreview] = useState(null);

  const [showSummaryModal, setShowSummaryModal] = useState(false);
  const [summaryData, setSummaryData] = useState(null);
  const [showMapModal, setShowMapModal] = useState(false);
  const [lastSubmission, setLastSubmission] = useState(null);

  // AI Voice Helpline state
  const [showVoiceModal, setShowVoiceModal] = useState(false);
  const [callbackPhone, setCallbackPhone] = useState('');
  const [callbackLoading, setCallbackLoading] = useState(false);
  const [callbackResult, setCallbackResult] = useState(null);

  useEffect(() => {
    if (user) {
      setUserName(user.full_name || 'Citizen');
      if (user.mobile_no) {
        setCallbackPhone(user.mobile_no);
      }
    }
    fetchAnalytics();
  }, [user]);

  const handleRequestCallback = async () => {
    const cleanDigits = callbackPhone.replace(/\D/g, '');
    if (cleanDigits.length < 10) {
      alert("Please enter a valid 10-digit mobile number");
      return;
    }
    setCallbackLoading(true);
    setCallbackResult(null);
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/api/request-callback`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone_number: callbackPhone.trim() })
      });
      const data = await res.json();
      if (data.success) {
        setCallbackResult({ success: true, message: data.message });
      } else {
        setCallbackResult({ success: false, message: data.message || data.error || 'Failed to trigger callback' });
      }
    } catch(err) {
      setCallbackResult({ success: false, message: 'Server error. Please check connection and try again.' });
    } finally {
      setCallbackLoading(false);
    }
  };

  const fetchAnalytics = async () => {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/api/analytics`);
      const data = await res.json();
      setAnalytics({ total: data.total||0, resolved: data.resolved||0, in_progress: (data.total-data.resolved)||0 });
    } catch(err) {}
  };

  const handleMicClick = () => {
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      alert("Speech recognition not supported. Try Chrome."); return;
    }
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = new SR();
    recognition.lang = 'en-IN';
    recognition.onstart = () => setIsListening(true);
    recognition.onend = () => setIsListening(false);
    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      setComplaintText(prev => prev + ' ' + transcript);
    };
    isListening ? recognition.stop() : recognition.start();
  };

  const handlePhotoChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setPhoto(file);
    const reader = new FileReader();
    reader.onload = (ev) => setPhotoPreview(ev.target.result);
    reader.readAsDataURL(file);
  };

  const removePhoto = () => { setPhoto(null); setPhotoPreview(null); };

  const handleLocationSelect = async (latlng) => {
    setSelectedLocation(latlng);
    try {
      const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${latlng.lat}&lon=${latlng.lng}`);
      const data = await res.json();
      setLocationName(data.display_name);
      setAddress(data.display_name);
      if (data.address?.postcode) setPincode(data.address.postcode);
    } catch(err) {
      setLocationName(`Lat: ${latlng.lat.toFixed(4)}, Lng: ${latlng.lng.toFixed(4)}`);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedLocation) { alert("Please select the issue location on the map first!"); return; }
    
    setIsSubmitting(true);
    
    // Validate: must have either text OR a photo
    if (!complaintText.trim() && !photo) {
      alert("Please describe your problem or upload a photo of the issue.");
      setIsSubmitting(false);
      return;
    }
    try {
      let imageUrl = null;
      if (photo) {
        setAiStep('uploading');
        const formData = new FormData();
        formData.append('file', photo);
        const uploadRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/api/upload`, { method:'POST', body:formData });
        if (uploadRes.ok) {
          const uploadData = await uploadRes.json();
          imageUrl = uploadData.image_url;
        }
      }

      setAiStep('analyzing');
      // Read JWT from context or localStorage fallback
      const token = user?.access_token ||
        (typeof window !== 'undefined'
          ? (JSON.parse(localStorage.getItem('user') || '{}')?.access_token || null)
          : null);
      const complaintHeaders = { 'Content-Type': 'application/json' };
      if (token) complaintHeaders['Authorization'] = 'Bearer ' + token;

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/api/complaints`, {
        method: 'POST',
        headers: complaintHeaders,
        body: JSON.stringify({
          citizen_name: userName || user?.full_name || "Citizen",
          user_id: user?.user_id || user?.id || null,
          text: complaintText,
          latitude: selectedLocation?.lat?.toString(),
          longitude: selectedLocation?.lng?.toString(),
          address, pincode,
          image_url: imageUrl
        })
      });

      setAiStep('');
      if (response.ok) {
        const data = await response.json();
        setComplaintText(''); setAddress(''); setPincode('');
        setSelectedLocation(null); setLocationName(t('dashboard.noLocation'));
        setPhoto(null); setPhotoPreview(null);
        fetchAnalytics();
        setSummaryData(data);
        setLastSubmission(data);
        // setShowSummaryModal(true); // Disable the popup as requested, using the inline panel instead
      } else {
        alert(t('dashboard.errorGeneric'));
      }
    } catch(err) {
      setAiStep('');
      alert(t('dashboard.errorServer'));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="dashboard-container">
      <Sidebar />
      <main className="main-content">

        {/* Welcome */}
        <section className="welcome-header" style={{ display:'flex', justifyContent:'space-between', alignItems:'center', flexWrap:'wrap', gap:'1.5rem' }}>
          <div style={{ position:'relative', zIndex:2 }}>
            <p style={{ color:'var(--text-secondary)', fontSize:'0.9rem', marginBottom:'0.5rem' }}>{t('dashboard.overview')}</p>
            <h1>{t('dashboard.welcome')}, <span>{userName}</span> 👋</h1>
            <p style={{ color:'rgba(255,255,255,0.7)', fontSize:'1rem' }}>{t('dashboard.subtitle')}</p>
          </div>
          
          <div style={{ position:'relative', zIndex:2 }}>
            <button 
              type="button"
              onClick={() => { setShowVoiceModal(true); setCallbackResult(null); }}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.6rem',
                background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                color: 'white',
                border: 'none',
                padding: '0.75rem 1.25rem',
                borderRadius: '12px',
                fontWeight: 600,
                fontSize: '0.9rem',
                cursor: 'pointer',
                boxShadow: '0 4px 15px rgba(16,185,129,0.3)',
                transition: 'all 0.2s ease',
              }}
              onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-2px)'}
              onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}
            >
              <PhoneCall size={18} />
              <span>📞 AI Voice Helpline</span>
            </button>
          </div>

          <div style={{ position:'absolute', top:'-50%', right:'-10%', width:'400px', height:'400px', background:'radial-gradient(circle, rgba(139,92,246,0.3) 0%, transparent 70%)', filter:'blur(40px)', zIndex:1 }}></div>
        </section>

        {/* Stats */}
        <section className="stats-grid">
          <div className="stat-card">
            <div className="stat-icon" style={{ background:'rgba(139,92,246,0.1)', color:'var(--accent-purple)' }}><FileText /></div>
            <div className="stat-info"><h3>{t('dashboard.totalGrievance')}</h3><div className="value">{analytics.total}</div><div style={{ fontSize:'0.75rem', color:'var(--success)', marginTop:'0.2rem' }}>↑ 18% this month</div></div>
          </div>
          <div className="stat-card">
            <div className="stat-icon" style={{ background:'rgba(16,185,129,0.1)', color:'var(--success)' }}><CheckCircle /></div>
            <div className="stat-info"><h3>{t('dashboard.resolved')}</h3><div className="value">{analytics.resolved}</div><div style={{ fontSize:'0.75rem', color:'var(--success)', marginTop:'0.2rem' }}>↑ 25% this month</div></div>
          </div>
          <div className="stat-card">
            <div className="stat-icon" style={{ background:'rgba(245,158,11,0.1)', color:'var(--warning)' }}><Clock /></div>
            <div className="stat-info"><h3>{t('dashboard.inProgress')}</h3><div className="value">{analytics.in_progress}</div><div style={{ fontSize:'0.75rem', color:'var(--danger)', marginTop:'0.2rem' }}>↓ 5% this month</div></div>
          </div>
        </section>

        {/* Main Grid */}
        <section className="dashboard-grid">
          {/* Form */}
          <div className="glass-section">
            <h2 className="section-title">{t('dashboard.reportIssue')}</h2>
            <form onSubmit={handleSubmit}>

              <div className="form-group">
                <label className="form-label">{t('dashboard.describeProblem')}</label>
                <div className="textarea-wrapper">
                  <textarea 
                    placeholder={t('dashboard.describePlaceholder')}
                    value={complaintText}
                    onChange={(e) => setComplaintText(e.target.value)}
                  />
                  <button type="button" className={`mic-btn ${isListening ? 'listening' : ''}`} onClick={handleMicClick} style={isListening ? { animation:'pulse 1.5s infinite' } : {}}>
                    <Mic size={18} />
                  </button>
                </div>
              </div>

              <div className="form-grid-2">
                <div className="form-group">
                  <label className="form-label">{t('dashboard.addAddress')}</label>
                  <div className="input-with-icon">
                    <MapPin className="input-icon" size={16} />
                    <input type="text" placeholder={t('dashboard.addressPlaceholder')} value={address} onChange={(e) => setAddress(e.target.value)} />
                    <button 
                      type="button" 
                      className="pick-map-inline-btn"
                      onClick={() => setShowMapModal(true)}
                    >
                      <MapPin size={14} /> Pick From Map
                    </button>
                  </div>
                </div>

                {/* Photo Upload with Preview */}
                <div className="form-group">
                  <label className="form-label">{t('dashboard.uploadPhotos')}</label>
                  {!photoPreview ? (
                    <label htmlFor="photo-upload" style={{ cursor:'pointer', display:'block' }}>
                      <div style={{ border:'2px dashed rgba(139,92,246,0.4)', borderRadius:'12px', padding:'1.2rem', textAlign:'center', background:'rgba(139,92,246,0.05)', transition:'all 0.2s' }}
                        onMouseEnter={e => e.currentTarget.style.borderColor='rgba(139,92,246,0.8)'}
                        onMouseLeave={e => e.currentTarget.style.borderColor='rgba(139,92,246,0.4)'}
                      >
                        <Camera size={22} color="var(--accent-purple)" style={{ marginBottom:'0.4rem' }} />
                        <div style={{ fontSize:'0.8rem', color:'var(--text-secondary)' }}>{t('dashboard.clickToUpload')}</div>
                        <div style={{ fontSize:'0.7rem', color:'rgba(255,255,255,0.3)', marginTop:'0.2rem' }}>{t('dashboard.aiValidationHint')}</div>
                      </div>
                      <input id="photo-upload" type="file" accept="image/*" onChange={handlePhotoChange} style={{ display:'none' }} />
                    </label>
                  ) : (
                    <div style={{ position:'relative', borderRadius:'12px', overflow:'hidden', border:'2px solid rgba(139,92,246,0.4)' }}>
                      <img src={photoPreview} alt="Preview" style={{ width:'100%', height:'120px', objectFit:'cover', display:'block' }} />
                      <div style={{ position:'absolute', top:0, left:0, right:0, bottom:0, background:'linear-gradient(to bottom, rgba(0,0,0,0.3), transparent)', display:'flex', alignItems:'flex-start', justifyContent:'flex-end', padding:'0.5rem' }}>
                        <button type="button" onClick={removePhoto} style={{ background:'rgba(239,68,68,0.8)', border:'none', borderRadius:'50%', width:'28px', height:'28px', color:'white', cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center' }}>
                          <X size={14} />
                        </button>
                      </div>
                      <div style={{ position:'absolute', bottom:0, left:0, right:0, padding:'0.4rem 0.6rem', background:'rgba(0,0,0,0.6)', fontSize:'0.72rem', color:'rgba(255,255,255,0.8)', display:'flex', alignItems:'center', gap:'0.4rem' }}>
                        <Eye size={12} /> <span>{t('dashboard.aiAnalyzeHint')}</span>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">{t('dashboard.pincode')}</label>
                <div className="input-with-icon">
                  <Search className="input-icon" size={16} />
                  <input type="text" placeholder={t('dashboard.pincodePlaceholder')} value={pincode} onChange={(e) => setPincode(e.target.value)} />
                </div>
              </div>

              {/* AI Processing Indicator */}
              {isSubmitting && (
                <div style={{ marginBottom:'1rem', padding:'1rem', borderRadius:'12px', background:'rgba(139,92,246,0.1)', border:'1px solid rgba(139,92,246,0.3)', display:'flex', alignItems:'center', gap:'0.8rem' }}>
                  <div style={{ width:'20px', height:'20px', borderRadius:'50%', border:'2px solid rgba(139,92,246,0.3)', borderTopColor:'var(--accent-purple)', animation:'spin 0.8s linear infinite', flexShrink:0 }}></div>
                  <div>
                    <div style={{ fontSize:'0.85rem', fontWeight:600, color:'var(--accent-purple)' }}>
                      {aiStep === 'uploading' ? t('dashboard.uploadingImage') : t('dashboard.aiAnalyzing')}
                    </div>
                    <div style={{ fontSize:'0.75rem', color:'var(--text-secondary)', marginTop:'0.2rem' }}>
                      {aiStep === 'uploading' ? t('dashboard.preparingUpload') : t('dashboard.aiCheckingRelevance')}
                    </div>
                  </div>
                </div>
              )}

              <button type="submit" className="submit-btn" disabled={isSubmitting}>
                <Send size={18} style={{ marginRight:'8px' }} />
                {isSubmitting ? t('dashboard.submitting') : t('dashboard.submit')}
              </button>
            </form>
          </div>

          {/* Live AI Result Panel */}
          <div className="glass-section result-panel">
            {!lastSubmission ? (
              <div className="empty-result-state">
                <div className="ai-status-orb"></div>
                <h2 className="section-title">AI Assessment Engine</h2>
                <p>Submit a grievance to see real-time forensic analysis, department routing, and severity detection.</p>
                <div className="waiting-animation">
                  <div className="dot"></div>
                  <div className="dot"></div>
                  <div className="dot"></div>
                </div>
              </div>
            ) : (
              <div className="live-ai-result animate-fade-in">
                <div className="result-header">
                  <div className="success-icon-wrap">
                    <CheckCircle size={20} color="#10b981" />
                  </div>
                  <h3>Complaint Submitted Successfully</h3>
                </div>

                <div className="result-meta-row">
                  <div className="meta-chip">
                    <span className="label">ID</span>
                    <span className="val">#{lastSubmission.id}</span>
                  </div>
                  <div className="meta-chip">
                    <span className="label">OFFICER</span>
                    <span className="val">AI Engine Alpha</span>
                  </div>
                </div>

                {lastSubmission.image_url && (
                  <div className="result-image-card">
                    <img
                      src={getMediaUrl(lastSubmission.image_url)}
                      alt="Evidence"
                      onError={e => e.target.style.display = 'none'}
                    />
                    <div className="img-overlay">
                      <Camera size={14} /> Captured Evidence
                    </div>
                  </div>
                )}

                <div className="ai-report-card">
                  <div className="report-header">
                    <Zap size={14} color="#a78bfa" />
                    <span>AI Forensic Inspection</span>
                  </div>
                  <p className="report-text">{lastSubmission.ai_summary}</p>
                  
                  <div className="badge-stack">
                    <div className="badge-item severity" style={{ background: `${PRIORITY_COLORS[lastSubmission.severity] || '#3b82f6'}22`, color: PRIORITY_COLORS[lastSubmission.severity] || '#3b82f6' }}>
                      <Zap size={12} /> {lastSubmission.severity || 'Medium'} Priority
                    </div>
                    <div className="badge-item dept">
                      <Building2 size={12} /> {lastSubmission.department || 'General'}
                    </div>
                    <div className="badge-item category">
                      <Tag size={12} /> {lastSubmission.category || 'Civic'}
                    </div>
                    <div className="badge-item sentiment">
                      <Eye size={12} /> {lastSubmission.sentiment || 'Neutral'} Sentiment
                    </div>
                  </div>
                </div>

                <div className="result-actions">
                  <button className="action-btn primary" onClick={() => router.push('/my-complaints')}>
                    View My Complaints
                  </button>
                  <button className="action-btn ghost" onClick={() => setLastSubmission(null)}>
                    Report Another
                  </button>
                </div>
              </div>
            )}
          </div>
        </section>

        {/* Map Modal */}
        {showMapModal && (
          <div className="modal-overlay" onClick={() => setShowMapModal(false)}>
            <div className="map-modal-content" onClick={e => e.stopPropagation()}>
              <div className="modal-header">
                <h3>Select Issue Location</h3>
                <button className="close-btn" onClick={() => setShowMapModal(false)}><X size={20} /></button>
              </div>
              <div className="modal-map-wrap">
                <DashboardMap onLocationSelect={handleLocationSelect} />
              </div>
              <div className="modal-footer">
                <div className="location-preview">
                  <MapPin size={16} />
                  <span>{locationName}</span>
                </div>
                <button className="confirm-btn" onClick={() => {
                  if (selectedLocation) {
                    setShowMapModal(false);
                  } else {
                    alert("Please click on the map to select a location");
                  }
                }}>
                  Confirm Location
                </button>
              </div>
            </div>
          </div>
        )}

        <div style={{ marginTop:'2rem', display:'flex', gap:'2rem', alignItems:'center' }}>
          <div style={{ display:'flex', alignItems:'center', gap:'1rem', background:'rgba(139,92,246,0.1)', padding:'0.75rem 1.5rem', borderRadius:'12px', border:'1px solid rgba(139,92,246,0.2)' }}>
            <div style={{ background:'var(--accent-purple)', width:32, height:32, borderRadius:'50%', display:'flex', alignItems:'center', justifyContent:'center' }}><Mic size={16} color="white" /></div>
            <div>
              <div style={{ fontSize:'0.85rem', fontWeight:600 }}>{t('dashboard.aiLanguageSupport')}</div>
              <div style={{ fontSize:'0.75rem', color:'var(--text-secondary)' }}>{t('dashboard.aiLanguageSubtitle')}</div>
            </div>
          </div>
        </div>

        <CivicImpactGallery />
      </main>

      {/* ─── AI VOICE HELPLINE MODAL ─── */}
      {showVoiceModal && (
        <div className="modal-overlay" onClick={() => setShowVoiceModal(false)}>
          <div className="ai-modal" onClick={e => e.stopPropagation()} style={{ maxWidth:'520px', padding:'2rem' }}>
            <button className="modal-close-btn" onClick={() => setShowVoiceModal(false)}>
              <X size={16} />
            </button>

            <div style={{ textAlign:'center', marginBottom:'1.5rem' }}>
              <div style={{ width:'56px', height:'56px', borderRadius:'50%', background:'rgba(16,185,129,0.15)', border:'2px solid rgba(16,185,129,0.4)', display:'inline-flex', alignItems:'center', justifyContent:'center', marginBottom:'0.75rem' }}>
                <PhoneCall size={26} color="#10b981" />
              </div>
              <h2 style={{ fontSize:'1.4rem', fontWeight:700, margin:'0 0 0.4rem 0' }}>AI Voice Helpline</h2>
              <p style={{ color:'var(--text-secondary)', fontSize:'0.88rem', margin:0 }}>
                24/7 Automated Voice Grievance Registration in Hindi & English
              </p>
            </div>

            {/* Direct Helpline Number Box */}
            <div style={{ background:'rgba(255,255,255,0.03)', border:'1px solid rgba(255,255,255,0.1)', borderRadius:'14px', padding:'1rem 1.25rem', marginBottom:'1.25rem' }}>
              <div style={{ fontSize:'0.75rem', textTransform:'uppercase', letterSpacing:'0.05em', color:'var(--text-secondary)', marginBottom:'0.4rem', fontWeight:600 }}>
                Option 1: Direct Toll-Free Call
              </div>
              <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', gap:'1rem', flexWrap:'wrap' }}>
                <div>
                  <div style={{ fontSize:'1.25rem', fontWeight:700, color:'#34d399', letterSpacing:'0.02em' }}>
                    +91 7965480398
                  </div>
                  <div style={{ fontSize:'0.75rem', color:'rgba(255,255,255,0.6)', marginTop:'0.2rem' }}>
                    Dial anytime from any mobile phone
                  </div>
                </div>
                <a 
                  href="tel:+917965480398"
                  style={{
                    background:'rgba(16,185,129,0.2)',
                    border:'1px solid rgba(16,185,129,0.5)',
                    color:'#34d399',
                    padding:'0.5rem 1rem',
                    borderRadius:'8px',
                    textDecoration:'none',
                    fontSize:'0.82rem',
                    fontWeight:600,
                    display:'flex',
                    alignItems:'center',
                    gap:'0.4rem'
                  }}
                >
                  <PhoneCall size={14} /> Call Now
                </a>
              </div>
            </div>

            {/* Request Callback Section */}
            <div style={{ background:'rgba(139,92,246,0.06)', border:'1px solid rgba(139,92,246,0.25)', borderRadius:'14px', padding:'1.25rem' }}>
              <div style={{ fontSize:'0.75rem', textTransform:'uppercase', letterSpacing:'0.05em', color:'var(--accent-purple)', marginBottom:'0.4rem', fontWeight:600 }}>
                Option 2: Request Instant AI Callback
              </div>
              <p style={{ fontSize:'0.82rem', color:'rgba(255,255,255,0.7)', margin:'0 0 0.8rem 0' }}>
                Enter your mobile number and our AI assistant will immediately ring your phone:
              </p>

              <div style={{ display:'flex', gap:'0.5rem', marginBottom:'0.75rem' }}>
                <input
                  type="tel"
                  placeholder="Enter 10-digit number (e.g. 9876543210)"
                  value={callbackPhone}
                  onChange={e => setCallbackPhone(e.target.value)}
                  style={{
                    flex: 1,
                    background: 'rgba(0,0,0,0.3)',
                    border: '1px solid rgba(255,255,255,0.15)',
                    borderRadius: '8px',
                    padding: '0.65rem 0.85rem',
                    color: 'white',
                    fontSize: '0.9rem'
                  }}
                />
                <button
                  type="button"
                  onClick={handleRequestCallback}
                  disabled={callbackLoading}
                  style={{
                    background: 'linear-gradient(135deg, var(--accent-purple), #6366f1)',
                    color: 'white',
                    border: 'none',
                    borderRadius: '8px',
                    padding: '0.65rem 1.1rem',
                    fontWeight: 600,
                    fontSize: '0.85rem',
                    cursor: callbackLoading ? 'not-allowed' : 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.4rem',
                    whiteSpace: 'nowrap',
                    opacity: callbackLoading ? 0.7 : 1
                  }}
                >
                  <PhoneForwarded size={15} />
                  {callbackLoading ? "Calling..." : "Call Me"}
                </button>
              </div>

              {callbackResult && (
                <div style={{
                  padding: '0.65rem 0.85rem',
                  borderRadius: '8px',
                  fontSize: '0.8rem',
                  background: callbackResult.success ? 'rgba(16,185,129,0.15)' : 'rgba(239,68,68,0.15)',
                  border: `1px solid ${callbackResult.success ? 'rgba(16,185,129,0.3)' : 'rgba(239,68,68,0.3)'}`,
                  color: callbackResult.success ? '#34d399' : '#f87171'
                }}>
                  {callbackResult.message}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ─── SUCCESS MODAL ─── */}
      {showSummaryModal && summaryData && (
        <div className="modal-overlay" onClick={() => setShowSummaryModal(false)}>
          <div className="ai-modal" onClick={e => e.stopPropagation()}>

            {/* ── Close Button ── */}
            <button className="modal-close-btn" onClick={() => setShowSummaryModal(false)}>
              <X size={16} />
            </button>

            {/* ── Status Header ── */}
            <div className="modal-status-header success">
              <div className="status-icon-ring success-ring">
                <CheckCircle size={28} color="#10b981" />
              </div>
              <h2 className="status-title success-title">✅ {t('dashboard.complaintSuccess')}</h2>
            </div>

            {/* ── Complaint Details ── */}
            <div className="modal-details-row">
              <div className="detail-chip">
                <span className="chip-label">{t('dashboard.complaintId')}</span>
                <span className="chip-value purple">#{summaryData.id}</span>
              </div>
              <div className="detail-chip">
                <span className="chip-label">{t('dashboard.submittedBy')}</span>
                <span className="chip-value">👤 {summaryData.citizen_name}</span>
              </div>
            </div>

            {/* ── Uploaded Image ── */}
            {summaryData.image_url && (
              <div className="modal-image-wrap">
                <img
                  src={getMediaUrl(summaryData.image_url)}
                  alt="Complaint"
                  className="modal-complaint-img"
                  onError={e => e.target.style.display = 'none'}
                />
                <div className="img-overlay-label">📷 {t('dashboard.uploadedImage')}</div>
              </div>
            )}

            {/* ── AI Summary ── */}
            <div className="ai-summary-card">
              <div className="ai-summary-header">
                <Zap size={14} className="ai-zap-icon" />
                <span>{t('dashboard.aiInspectionReport')}</span>
              </div>
              <p className="ai-summary-text">
                {summaryData.ai_summary || 'Your complaint has been recorded and will be reviewed by the relevant authorities.'}
              </p>
            </div>

            {/* ── Action Buttons ── */}
            <div className="modal-actions">
              <button className="modal-btn primary-btn" onClick={() => router.push('/my-complaints')}>
                📋 {t('dashboard.viewMyComplaints')}
              </button>
              <button className="modal-btn ghost-btn" onClick={() => setShowSummaryModal(false)}>
                ✍️ {t('dashboard.reportAnother')}
              </button>
            </div>

          </div>
        </div>
      )}

      <style jsx>{`
        /* ── Result Panel & Map Modal Styles ── */
        .result-panel {
          min-height: 500px;
          display: flex;
          flex-direction: column;
        }

        .empty-result-state {
          flex: 1;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          text-align: center;
          padding: 2rem;
          color: rgba(255,255,255,0.4);
        }

        .ai-status-orb {
          width: 80px;
          height: 80px;
          border-radius: 50%;
          background: radial-gradient(circle, var(--accent-purple) 0%, transparent 70%);
          margin-bottom: 2rem;
          position: relative;
          opacity: 0.6;
          animation: orbPulse 4s infinite alternate;
        }
        .ai-status-orb::after {
          content: '';
          position: absolute;
          inset: -10px;
          border: 1px solid rgba(139,92,246,0.2);
          border-radius: 50%;
          animation: spin 10s linear infinite;
        }

        @keyframes orbPulse {
          from { transform: scale(1); opacity: 0.4; filter: blur(5px); }
          to { transform: scale(1.2); opacity: 0.8; filter: blur(10px); }
        }

        .waiting-animation {
          display: flex;
          gap: 0.5rem;
          margin-top: 2rem;
        }
        .waiting-animation .dot {
          width: 6px;
          height: 6px;
          background: var(--accent-purple);
          border-radius: 50%;
          animation: dotBounce 1.4s infinite;
          opacity: 0.3;
        }
        .waiting-animation .dot:nth-child(2) { animation-delay: 0.2s; }
        .waiting-animation .dot:nth-child(3) { animation-delay: 0.4s; }

        @keyframes dotBounce {
          0%, 80%, 100% { transform: translateY(0); }
          40% { transform: translateY(-10px); opacity: 1; }
        }

        .live-ai-result {
          padding: 0.5rem;
        }

        .result-header {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          margin-bottom: 1.5rem;
          padding: 1rem;
          background: rgba(16,185,129,0.05);
          border: 1px solid rgba(16,185,129,0.2);
          border-radius: 16px;
        }
        .result-header h3 {
          font-size: 1rem;
          color: #10b981;
          margin: 0;
        }

        .result-meta-row {
          display: flex;
          gap: 1rem;
          margin-bottom: 1.5rem;
        }
        .meta-chip {
          flex: 1;
          background: rgba(255,255,255,0.03);
          border: 1px solid rgba(255,255,255,0.08);
          padding: 0.75rem;
          border-radius: 12px;
          display: flex;
          flex-direction: column;
          gap: 0.2rem;
        }
        .meta-chip .label {
          font-size: 0.65rem;
          color: rgba(255,255,255,0.4);
          font-weight: 700;
          text-transform: uppercase;
        }
        .meta-chip .val {
          font-size: 0.9rem;
          font-weight: 700;
          color: white;
        }

        .result-image-card {
          width: 100%;
          border-radius: 16px;
          overflow: hidden;
          border: 1px solid rgba(255,255,255,0.1);
          margin-bottom: 1.5rem;
          position: relative;
        }
        .result-image-card img {
          width: 100%;
          height: 180px;
          object-fit: cover;
        }
        .result-image-card .img-overlay {
          position: absolute;
          bottom: 0; left: 0; right: 0;
          padding: 0.75rem;
          background: linear-gradient(transparent, rgba(0,0,0,0.8));
          font-size: 0.75rem;
          color: white;
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }

        .ai-report-card {
          background: rgba(139,92,246,0.05);
          border: 1px solid rgba(139,92,246,0.2);
          border-radius: 20px;
          padding: 1.5rem;
          margin-bottom: 2rem;
        }
        .report-header {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          font-size: 0.7rem;
          font-weight: 800;
          text-transform: uppercase;
          color: var(--accent-purple);
          margin-bottom: 1rem;
        }
        .report-text {
          font-size: 0.9rem;
          line-height: 1.6;
          color: rgba(255,255,255,0.8);
          margin-bottom: 1.5rem;
        }

        .badge-stack {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 0.75rem;
        }
        .badge-item {
          padding: 0.6rem;
          border-radius: 10px;
          font-size: 0.75rem;
          font-weight: 600;
          display: flex;
          align-items: center;
          gap: 0.5rem;
          background: rgba(255,255,255,0.05);
          border: 1px solid rgba(255,255,255,0.08);
        }

        .result-actions {
          display: flex;
          gap: 1rem;
        }
        .action-btn {
          flex: 1;
          padding: 1rem;
          border-radius: 14px;
          font-weight: 700;
          font-size: 0.9rem;
          cursor: pointer;
          transition: all 0.2s;
        }
        .action-btn.primary {
          background: linear-gradient(135deg, var(--accent-purple), #4f46e5);
          color: white;
          border: none;
        }
        .action-btn.ghost {
          background: transparent;
          border: 1px solid rgba(255,255,255,0.1);
          color: white;
        }
        .action-btn:hover { transform: translateY(-2px); opacity: 0.9; }

        /* Map Modal */
        .map-modal-content {
          background: #0a071a;
          border: 1px solid rgba(139,92,246,0.3);
          border-radius: 24px;
          width: 90%;
          max-width: 800px;
          overflow: hidden;
          display: flex;
          flex-direction: column;
          box-shadow: 0 0 50px rgba(0,0,0,0.5);
        }
        .modal-header {
          padding: 1.5rem;
          display: flex;
          justify-content: space-between;
          align-items: center;
          border-bottom: 1px solid rgba(255,255,255,0.1);
        }
        .modal-header h3 { margin: 0; font-size: 1.25rem; }
        .close-btn { background: transparent; border: none; color: white; cursor: pointer; opacity: 0.5; transition: 0.2s; }
        .close-btn:hover { opacity: 1; }

        .modal-map-wrap {
          height: 400px;
          position: relative;
        }

        .modal-footer {
          padding: 1.5rem;
          background: rgba(255,255,255,0.02);
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 2rem;
        }
        .location-preview {
          flex: 1;
          display: flex;
          align-items: center;
          gap: 0.75rem;
          color: rgba(255,255,255,0.6);
          font-size: 0.9rem;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .pick-map-inline-btn {
          background: rgba(139,92,246,0.1);
          border: 1px solid rgba(139,92,246,0.3);
          color: var(--accent-purple);
          padding: 0.5rem 0.75rem;
          border-radius: 8px;
          font-size: 0.75rem;
          font-weight: 700;
          cursor: pointer;
          display: flex;
          align-items: center;
          gap: 0.4rem;
          transition: all 0.2s;
          white-space: nowrap;
          margin-left: 0.5rem;
        }
        .pick-map-inline-btn:hover {
          background: rgba(139,92,246,0.2);
          border-color: var(--accent-purple);
        }

        /* ── Overlay ── */
        .modal-overlay {
          position: fixed; top: 0; left: 0; width: 100vw; height: 100vh;
          background: rgba(0, 0, 0, 0.75);
          backdrop-filter: blur(14px);
          display: flex; align-items: center; justify-content: center;
          z-index: 2000; padding: 1rem;
          animation: fadeIn 0.2s ease;
        }
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }

        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes pulse {
          0%   { transform: scale(1); box-shadow: 0 0 0 0 rgba(139,92,246,0.7); }
          70%  { transform: scale(1.1); box-shadow: 0 0 0 10px rgba(139,92,246,0); }
          100% { transform: scale(1); box-shadow: 0 0 0 0 rgba(139,92,246,0); }
        }
      `}</style>
    </div>
  );
}

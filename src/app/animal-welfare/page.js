'use client';
import { useState, useEffect, useRef } from 'react';
import dynamic from 'next/dynamic';
import Sidebar from '@/components/Sidebar';
import { useLanguage } from '@/context/LanguageContext';
import { Heart, Upload, Mic, MapPin, Send, Activity, AlertTriangle, Building2, Clock, ChevronRight, CheckCircle, Truck, Home, Star, Users, Shield, Stethoscope } from 'lucide-react';
import AnimalImpactGallery from '@/components/AnimalImpactGallery';
import './animal-welfare.css';

const AnimalMapPicker = dynamic(() => import('@/components/AnimalMapPicker'), { ssr: false, loading: () => <div className="aw-map-loading">Loading Map...</div> });

export default function AnimalWelfare() {
  const { t } = useLanguage();
  const TRACKER_STEPS = [
    { key: 'submitted', label: t('animalWelfare.rescuePortal'), desc: t('animalWelfare.submitToGetAI'), icon: <CheckCircle size={16}/> },
    { key: 'assigned',  label: t('animalWelfare.nearestNGO'), desc: t('animalWelfare.rescueETA'), icon: <Truck size={16}/> },
    { key: 'shelter',  label: t('animalWelfare.shelters'), desc: t('animalWelfare.animalsSaved'), icon: <Home size={16}/> },
    { key: 'closed',   label: t('animalWelfare.verifiedNGOs'), desc: t('animalWelfare.pledge'), icon: <Star size={16}/> },
  ];
  const [media, setMedia]           = useState(null);
  const [mediaPreview, setMediaPreview] = useState(null);
  const [description, setDescription] = useState('');
  const [address, setAddress]       = useState('');
  const [latLng, setLatLng]         = useState(null);
  const [isListening, setIsListening] = useState(false);
  const [showMap, setShowMap]       = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [assessment, setAssessment] = useState(null);
  const [reportId, setReportId]     = useState(null);
  const [showTracker, setShowTracker] = useState(false);
  const [trackerStep, setTrackerStep] = useState(0);
  const [trackerTimes, setTrackerTimes] = useState([]);

  const [reports, setReports]       = useState([]);
  const [analytics, setAnalytics]   = useState({ total: 0, animals_saved: 312, active_reports: 0 });

  const recognitionRef = useRef(null);

  useEffect(() => {
    fetchReports();
    fetchAnalytics();
  }, []);

  const fetchReports = async () => {
    try {
      const r = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/api/animal-reports`);
      const data = await r.json();
      setReports(data);
    } catch(_){}
  };

  const fetchAnalytics = async () => {
    try {
      const r = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/api/animal-analytics`);
      const data = await r.json();
      setAnalytics(a => ({ ...a, ...data }));
    } catch(_){}
  };

  const handleMediaChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setMedia(file);
    setMediaPreview(URL.createObjectURL(file));
  };

  const handleMic = () => {
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      alert('Speech recognition not supported.'); return;
    }
    if (isListening) { recognitionRef.current?.stop(); setIsListening(false); return; }
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    const rec = new SR();
    rec.continuous = true; rec.interimResults = false; rec.lang = 'hi-IN';
    rec.onstart  = () => setIsListening(true);
    rec.onend    = () => setIsListening(false);
    rec.onresult = (ev) => {
      const t = Array.from(ev.results).map(r => r[0].transcript).join(' ');
      setDescription(prev => prev + ' ' + t);
    };
    recognitionRef.current = rec;
    rec.start();
  };

  const handleLocationSelect = async (ll) => {
    setLatLng(ll);
    setShowMap(false);
    try {
      const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${ll.lat}&lon=${ll.lng}`);
      const data = await res.json();
      setAddress(data.display_name || `${ll.lat.toFixed(5)}, ${ll.lng.toFixed(5)}`);
    } catch(_) { setAddress(`${ll.lat.toFixed(5)}, ${ll.lng.toFixed(5)}`); }
  };

  const handleSubmit = async () => {
    if (!description.trim()) { alert('Please describe the animal condition.'); return; }
    setIsSubmitting(true);
    try {
      let mediaUrl = null;
      if (media) {
        const fd = new FormData(); fd.append('file', media);
        const up = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/api/upload`, { method: 'POST', body: fd });
        if (up.ok) { const d = await up.json(); mediaUrl = d.image_url; }
      }
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/api/animal-reports`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ description, address, latitude: latLng?.lat?.toString(), longitude: latLng?.lng?.toString(), media_url: mediaUrl })
      });
      if (res.ok) {
        const data = await res.json();
        setAssessment(data);
        setReportId(data.id);
        const now = new Date();
        setTrackerTimes([
          now,
          new Date(now.getTime() + 3 * 60000),
          new Date(now.getTime() + 15 * 60000),
          new Date(now.getTime() + 63 * 60000),
        ]);
        setTrackerStep(0);
        setShowTracker(true); // Automatically show tracker
        
        // Auto-advance tracker for demo effect
        let step = 0;
        const iv = setInterval(() => {
          step++;
          setTrackerStep(prev => {
             if (step >= 3) clearInterval(iv);
             return step;
          });
        }, 3000);

        fetchReports(); fetchAnalytics();
      } else { alert('Submission failed.'); }
    } catch(_) { alert('Error connecting to server.'); }
    finally { setIsSubmitting(false); }
  };

  const handleViewAnalysis = () => {
    setShowTracker(true);
    let step = 0;
    const iv = setInterval(() => {
      step++;
      setTrackerStep(step);
      if (step >= 3) clearInterval(iv);
    }, 1800);
  };

  const urgencyColor = (u) => {
    if (!u) return '#a855f7';
    const l = u.toLowerCase();
    if (l === 'critical') return '#ef4444';
    if (l === 'high')     return '#f59e0b';
    if (l === 'medium')   return '#06b6d4';
    return '#10b981';
  };

  const fmtTime = (d) => d ? d.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }) : '';
  const fmtDate = (d) => d ? d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : '';

  return (
    <div className="dashboard-container">
      <Sidebar />
      <main className="main-content aw-main">

        {/* ── Hero Banner ── */}
        <div className="aw-hero">
          <div className="aw-hero-left">
            <div className="aw-badge">{t('animalWelfare.badge')}</div>
            <h1 className="aw-title">{t('animalWelfare.title')} <span>Welfare</span></h1>
            <p className="aw-sub">{t('animalWelfare.subtitle')}<br/>{t('animalWelfare.subtitleHL')} <span className="aw-hl">{t('animalWelfare.subtitleEnd')}</span></p>
            <div className="aw-stats-row">
              <div className="aw-stat-pill">🐾 <strong>{analytics.animals_saved + reports.length}</strong> {t('animalWelfare.animalsSaved')}</div>
              <div className="aw-stat-pill">🏥 <strong>24</strong> {t('animalWelfare.ngosNearby')}</div>
            </div>
          </div>
          {/* Pledge Card */}
          <div className="aw-pledge-card">
            <div className="aw-pledge-label">{t('animalWelfare.pledge')}</div>
            <h2 className="aw-pledge-title">{t('animalWelfare.pledgeTitle')} <span>{t('animalWelfare.pledgeTitleHL')}</span></h2>
            <p className="aw-pledge-quote">{t('animalWelfare.pledgeQuote')}</p>
            <div className="aw-pledge-dog">🐕</div>
            <button className="aw-mission-btn">{t('animalWelfare.learnMission')}</button>
          </div>
        </div>

        {/* ── Three Column Grid ── */}
        <div className="aw-grid">

          {/* ── Col 1: Report Form ── */}
          <div className="aw-card">
            <div className="aw-card-header">
              <span className="aw-card-icon">🐾</span>
              <h3>{t('animalWelfare.reportTitle')}</h3>
            </div>

            <div className="aw-upload-row">
              {/* Upload */}
              <div className="aw-upload-zone" onClick={() => document.getElementById('aw-file').click()}>
                <input id="aw-file" type="file" accept="image/*,video/*" style={{display:'none'}} onChange={handleMediaChange}/>
                {mediaPreview ? (
                  media?.type?.startsWith('video') ?
                    <video src={mediaPreview} className="aw-preview-media" muted/> :
                    <img src={mediaPreview} className="aw-preview-media" alt="preview"/>
                ) : (
                  <>
                    <Upload size={32} className="aw-upload-icon"/>
                    <div className="aw-upload-label">{t('animalWelfare.clickUpload')}</div>
                    <div className="aw-upload-hint">{t('animalWelfare.uploadHint')}</div>
                  </>
                )}
                <div className="aw-upload-section-label">{t('animalWelfare.uploadLabel')}</div>
              </div>

              {/* Describe */}
              <div className="aw-describe-zone">
                <div className="aw-describe-label">{t('animalWelfare.describeLabel')}</div>
                <div className="aw-textarea-wrap">
                  <textarea
                    className="aw-textarea"
                    placeholder={t('animalWelfare.describePlaceholder')}
                    value={description}
                    onChange={e => setDescription(e.target.value)}
                  />
                  <button className={`aw-mic-btn${isListening ? ' listening' : ''}`} onClick={handleMic} title="Voice input – any language">
                    <Mic size={15}/>
                  </button>
                </div>
              </div>
            </div>

            {/* Address */}
            <div className="aw-address-section">
              <div className="aw-address-label">{t('animalWelfare.locationLabel')}</div>
              <div className="aw-address-row">
                <div className="aw-address-input-wrap">
                  <MapPin size={15} className="aw-addr-icon"/>
                  <input
                    className="aw-address-input"
                    placeholder={t('animalWelfare.addressPlaceholder')}
                    value={address}
                    onChange={e => setAddress(e.target.value)}
                  />
                </div>
                <button className="aw-map-btn" onClick={() => setShowMap(true)}>
                  🗺️ {t('animalWelfare.pickMap')}
                </button>
              </div>
            </div>

            <button className="aw-submit-btn" onClick={handleSubmit} disabled={isSubmitting}>
              {isSubmitting ? t('animalWelfare.submitting') : <><Send size={16}/> {t('animalWelfare.submit')}</>}
            </button>
          </div>

          {/* ── Col 2: AI Assessment ── */}
          <div className="aw-card">
            <div className="aw-card-header">
              <span className="aw-card-icon"><Activity size={18}/></span>
              <h3>{t('animalWelfare.aiAssessment')}</h3>
              <span className="aw-beta-badge">BETA</span>
            </div>

            {assessment ? (
              <>
                <div className="aw-assess-row">
                  <div className="aw-assess-icon">🐾</div>
                  <span className="aw-assess-label">{t('animalWelfare.detectedAnimal')}</span>
                  <span className="aw-assess-value" style={{color:'#06b6d4'}}>{assessment.detected_animal || '—'}</span>
                </div>
                <div className="aw-assess-row">
                  <div className="aw-assess-icon"><Stethoscope size={14}/></div>
                  <span className="aw-assess-label">Condition</span>
                  <span className="aw-assess-value" style={{color:'#ec4899'}}>{assessment.animal_condition || '—'}</span>
                </div>
                <div className="aw-assess-row">
                  <div className="aw-assess-icon"><AlertTriangle size={14}/></div>
                  <span className="aw-assess-label">{t('animalWelfare.possibleInjury')}</span>
                  <span className="aw-assess-value" style={{color:'#ef4444',fontWeight:700}}>{assessment.possible_injury || '—'}</span>
                </div>
                <div className="aw-assess-row">
                  <div className="aw-assess-icon">🛡️</div>
                  <span className="aw-assess-label">{t('animalWelfare.urgencyLevel')}</span>
                  <span className="aw-assess-value" style={{color: urgencyColor(assessment.urgency_level), fontWeight:700}}>{assessment.urgency_level || '—'}</span>
                </div>
                <div className="aw-assess-row">
                  <div className="aw-assess-icon"><Shield size={14}/></div>
                  <span className="aw-assess-label">Rescue Priority</span>
                  <span className="aw-assess-value" style={{color:'#f59e0b'}}>{assessment.rescue_priority || '—'}</span>
                </div>
                <div className="aw-assess-row">
                  <div className="aw-assess-icon"><Building2 size={14}/></div>
                  <span className="aw-assess-label">{t('animalWelfare.nearestNGO')}</span>
                  <span className="aw-assess-value" style={{color:'#a855f7'}}>{assessment.nearest_ngo || '—'}</span>
                </div>
                <div className="aw-assess-row">
                  <div className="aw-assess-icon"><Clock size={14}/></div>
                  <span className="aw-assess-label">{t('animalWelfare.rescueETA')}</span>
                  <span className="aw-assess-value" style={{color:'#10b981',fontWeight:700}}>{assessment.eta || '—'}</span>
                </div>
                <button className="aw-analysis-btn" onClick={handleViewAnalysis}>
                  {t('animalWelfare.viewAnalysis')} <ChevronRight size={16}/>
                </button>
              </>
            ) : (
              <div className="aw-assess-placeholder">
                <div className="aw-placeholder-icon">🤖</div>
                <p>{t('animalWelfare.submitToGetAI')}</p>
              </div>
            )}
          </div>

          {/* ── Col 3: Live Tracker ── */}
          <div className="aw-card">
            <div className="aw-card-header">
              <span className="aw-card-icon"><Activity size={18}/></span>
              <h3>{t('animalWelfare.liveTracker')}</h3>
            </div>

            {showTracker && trackerTimes.length > 0 ? (
              <div className="aw-tracker">
                {TRACKER_STEPS.map((step, i) => (
                  <div key={step.key} className={`aw-tracker-step${i <= trackerStep ? ' done' : ''}`}>
                    <div className="aw-tracker-dot">
                      {i <= trackerStep ? <div className="aw-tracker-dot-inner active"/> : <div className="aw-tracker-dot-inner"/>}
                      {i < TRACKER_STEPS.length - 1 && <div className={`aw-tracker-line${i < trackerStep ? ' filled' : ''}`}/>}
                    </div>
                    <div className="aw-tracker-content">
                      <div className="aw-tracker-head">
                        <span className="aw-tracker-label">{step.label}</span>
                        <span className="aw-tracker-time">
                          {fmtDate(trackerTimes[i])}<br/>{fmtTime(trackerTimes[i])}
                        </span>
                      </div>
                      <div className="aw-tracker-desc">{step.desc}</div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="aw-assess-placeholder">
                <div className="aw-placeholder-icon">📡</div>
                <p>{t('animalWelfare.clickViewAnalysis')}</p>
              </div>
            )}
          </div>
        </div>

        {/* ── Recent Animal Complaints ── */}
        {reports.length > 0 && (
          <div className="aw-reports-section">
            <h3 className="aw-reports-title">🐾 {t('animalWelfare.recentReports')}</h3>
            <div className="aw-reports-grid">
              {reports.slice(0, 6).map(r => (
                <div key={r.id} className="aw-report-card">
                  <div className="aw-report-header">
                    <span className="aw-report-animal">{r.detected_animal || 'Animal'}</span>
                    <span className="aw-report-urgency" style={{background: urgencyColor(r.urgency_level) + '22', color: urgencyColor(r.urgency_level)}}>{r.urgency_level || 'Medium'}</span>
                  </div>
                  <p className="aw-report-desc">{r.description?.slice(0,80)}...</p>
                  <div className="aw-report-footer">
                    <span className="aw-report-ngo">🏥 {r.nearest_ngo || 'NGO Dispatched'}</span>
                    <span className="aw-report-status">{r.status}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── Every Animal Matters Gallery ── */}
        <AnimalImpactGallery />

        {/* ── Rescue Support Portal Cards ── */}
        <div className="aw-support-section">
          <div className="aw-support-label">🐾 {t('animalWelfare.rescuePortal')}</div>
          <div className="aw-support-grid">
            <div className="aw-support-card" style={{background:'linear-gradient(135deg,rgba(239,68,68,0.15),rgba(239,68,68,0.05))'}}>
              <Heart size={22} style={{color:'#ef4444'}}/>
              <div className="aw-support-info"><div className="aw-support-num">{reports.filter(r=>r.status==='Rescue Team Assigned').length || 8}</div><div className="aw-support-name">{t('animalWelfare.liveRescues')}</div></div>
              <div className="aw-support-wave">〰️</div>
            </div>
            <div className="aw-support-card" style={{background:'linear-gradient(135deg,rgba(245,158,11,0.15),rgba(245,158,11,0.05))'}}>
              <AlertTriangle size={22} style={{color:'#f59e0b'}}/>
              <div className="aw-support-info"><div className="aw-support-num">{reports.length > 0 ? `${reports.length}/7` : '24/7'}</div><div className="aw-support-name">{t('animalWelfare.activeReports')}</div></div>
              <div className="aw-support-wave">〰️</div>
            </div>
            <div className="aw-support-card" style={{background:'linear-gradient(135deg,rgba(16,185,129,0.15),rgba(16,185,129,0.05))'}}>
              <Shield size={22} style={{color:'#10b981'}}/>
              <div className="aw-support-info"><div className="aw-support-num">18</div><div className="aw-support-name">{t('animalWelfare.verifiedNGOs')}</div></div>
              <div className="aw-support-wave">〰️</div>
            </div>
            <div className="aw-support-card" style={{background:'linear-gradient(135deg,rgba(6,182,212,0.15),rgba(6,182,212,0.05))'}}>
              <Users size={22} style={{color:'#06b6d4'}}/>
              <div className="aw-support-info"><div className="aw-support-num">147</div><div className="aw-support-name">{t('animalWelfare.volunteers')}</div></div>
              <div className="aw-support-wave">〰️</div>
            </div>
            <div className="aw-support-card" style={{background:'linear-gradient(135deg,rgba(168,85,247,0.15),rgba(168,85,247,0.05))'}}>
              <Stethoscope size={22} style={{color:'#a855f7'}}/>
              <div className="aw-support-info"><div className="aw-support-num">11</div><div className="aw-support-name">{t('animalWelfare.medicalPartners')}</div></div>
              <div className="aw-support-wave">〰️</div>
            </div>
            <div className="aw-support-card" style={{background:'linear-gradient(135deg,rgba(239,68,68,0.15),rgba(245,158,11,0.05))'}}>
              <Home size={22} style={{color:'#f97316'}}/>
              <div className="aw-support-info"><div className="aw-support-num">9</div><div className="aw-support-name">{t('animalWelfare.shelters')}</div></div>
              <div className="aw-support-wave">〰️</div>
            </div>
          </div>
        </div>

        {/* ── Map Modal ── */}
        {showMap && (
          <div className="aw-map-overlay" onClick={e => { if(e.target.classList.contains('aw-map-overlay')) setShowMap(false); }}>
            <div className="aw-map-modal">
              <div className="aw-map-modal-header">
                <span>📍 {t('dashboard.selectLocation')}</span>
                <button className="aw-map-close" onClick={() => setShowMap(false)}>✕</button>
              </div>
              <AnimalMapPicker onLocationSelect={handleLocationSelect}/>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

'use client';

import { useState, useEffect, useRef } from 'react';
import { 
  Users, Building, FileText, HeartHandshake, CloudUpload, Mic, Send, 
  Activity, AlertTriangle, MessageSquare, TrendingUp, Sparkles, ExternalLink, Search
} from 'lucide-react';
import Sidebar from '@/components/Sidebar';

import { useLanguage } from '@/context/LanguageContext';

export default function SocialHelp() {
  const { t } = useLanguage();
  const [stats, setStats] = useState({
    people_helped: { value: 0, change: "+0%" },
    ngos_active: { value: 0, change: "Loading..." },
    reports_received: { value: 0, change: "+0%" },
    reunited: { value: 0, change: "+0%" }
  });

  const [description, setDescription] = useState('');
  const [file, setFile] = useState(null);
  const [isRecording, setIsRecording] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [assessment, setAssessment] = useState({
    detectedCategory: "N/A",
    priorityLevel: "N/A",
    behaviorAnalysis: "N/A",
    sentimentScore: "N/A",
  });

  const reportRef = useRef(null);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/api/social-help/stats`);
      const data = await res.json();
      setStats(data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const toggleMic = () => {
    setIsRecording(!isRecording);
    if (!isRecording) {
      // Simulate listening
      setTimeout(() => setIsRecording(false), 3000);
    }
  };

  const handleSubmit = async () => {
    if (!description && !file) {
      alert("Please provide a description or upload a photo/video.");
      return;
    }
    
    setIsSubmitting(true);
    setAssessment({
      detectedCategory: "Analyzing...",
      priorityLevel: "Analyzing...",
      behaviorAnalysis: "Analyzing...",
      sentimentScore: "Analyzing...",
    });

    const formData = new FormData();
    formData.append('description', description);
    if (file) formData.append('file', file);

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/api/social-help/report`, {
        method: 'POST',
        body: formData
      });
      const data = await res.json();
      
      if (data.success) {
        setAssessment({
          detectedCategory: data.assessment.detected_category,
          priorityLevel: data.assessment.priority_level,
          behaviorAnalysis: data.assessment.behavior_analysis,
          sentimentScore: data.assessment.sentiment_score,
        });
        setDescription('');
        setFile(null);
      } else {
        alert("Failed to submit report.");
      }
    } catch (err) {
      console.error(err);
      alert("An error occurred while submitting.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const scrollToReport = () => {
    reportRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="layout-container">
      <Sidebar />
      <main className="main-content">
        <div className="social-help-container">
          
          {/* Hero Section */}
          <section className="hero-section glass-panel">
            <div className="hero-content">
              <div className="hero-badge">
                <HeartHandshake size={14} className="mr-2" />
                {t('socialHelp.badge')}
              </div>
              <h1 className="hero-title">{t('socialHelp.title')} <span className="highlight-text">{t('socialHelp.titleHL')}</span></h1>
              <p className="hero-desc">
                {t('socialHelp.subtitle')}
              </p>
              
              <div className="hero-stats">
                <div className="hero-stat-box">
                  <Users className="stat-icon text-pink" size={24} />
                  <h3>{stats.people_helped.value}</h3>
                  <p>{t('socialHelp.peopleHelped')}<br/><span>{t('socialHelp.thisMonth')}</span></p>
                </div>
                <div className="hero-stat-box">
                  <Building className="stat-icon text-blue" size={24} />
                  <h3>{stats.ngos_active.value}</h3>
                  <p>{t('socialHelp.ngosActive')}<br/><span>{t('socialHelp.active')}</span></p>
                </div>
                <div className="hero-stat-box">
                  <HeartHandshake className="stat-icon text-purple" size={24} />
                  <h3>{stats.reports_received.value}</h3>
                  <p>{t('socialHelp.reportsReceived')}<br/><span>{t('socialHelp.total')}</span></p>
                </div>
                <div className="hero-stat-box">
                  <Users className="stat-icon text-cyan" size={24} />
                  <h3>{stats.reunited.value}</h3>
                  <p>{t('socialHelp.reunited')}<br/><span>{t('socialHelp.thisMonth')}</span></p>
                </div>
              </div>
            </div>
            <div className="hero-bg-image"></div>
          </section>

          {/* Reporting Grid */}
          <section className="reporting-grid" ref={reportRef}>
            
            {/* Left Box: Report Form */}
            <div className="report-box glass-panel">
              <div className="box-header">
                <div className="icon-wrap"><HeartHandshake size={18} /></div>
                <div>
                  <h2>{t('socialHelp.reportTitle')}</h2>
                  <p>{t('socialHelp.reportSubtitle')}</p>
                </div>
              </div>

              <div className="form-grid">
                <div className="upload-section">
                  <label>{t('socialHelp.uploadLabel')}</label>
                  <div className="upload-area">
                    <input type="file" id="file-upload" accept="image/*,video/*" onChange={handleFileChange} hidden />
                    <label htmlFor="file-upload" className="upload-trigger">
                      <CloudUpload size={32} className="text-purple mb-2" />
                      <span className="font-bold">{file ? file.name : t('socialHelp.clickUpload')}</span>
                      <span className="text-xs opacity-50 mt-1">{t('socialHelp.uploadHint')}</span>
                    </label>
                  </div>
                </div>

                <div className="describe-section">
                  <label>{t('socialHelp.describeLabel')}</label>
                  <div className="textarea-wrap">
                    <textarea 
                      placeholder={t('socialHelp.describePlaceholder')}
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                    ></textarea>
                    <button className={`mic-btn ${isRecording ? 'recording' : ''}`} onClick={toggleMic}>
                      <Mic size={18} />
                    </button>
                  </div>
                </div>
              </div>

              <button className="submit-btn" onClick={handleSubmit} disabled={isSubmitting}>
                <Send size={16} /> {isSubmitting ? t('socialHelp.submitting') : t('socialHelp.submit')}
              </button>
            </div>

            {/* Right Box: AI Assessment */}
            <div className="assessment-box glass-panel">
              <div className="box-header">
                <div className="icon-wrap"><Sparkles size={18} /></div>
                <div>
                  <h2>{t('socialHelp.aiAssessment')}</h2>
                  <p>{t('socialHelp.aiSubtitle')}</p>
                </div>
              </div>

              <div className="assessment-list">
                <div className="assess-item">
                  <div className="assess-label"><Search size={16} className="text-blue" /> {t('socialHelp.detectedCategory')}</div>
                  <div className={`assess-value ${assessment.detectedCategory === 'N/A' ? 'text-pink' : 'text-white'}`}>{assessment.detectedCategory}</div>
                </div>
                <div className="assess-item">
                  <div className="assess-label"><AlertTriangle size={16} className="text-orange" /> {t('socialHelp.priorityLevel')}</div>
                  <div className={`assess-value ${assessment.priorityLevel === 'N/A' ? 'text-pink' : 'text-orange'}`}>{assessment.priorityLevel}</div>
                </div>
                <div className="assess-item">
                  <div className="assess-label"><Activity size={16} className="text-green" /> {t('socialHelp.behaviorAnalysis')}</div>
                  <div className={`assess-value ${assessment.behaviorAnalysis === 'N/A' ? 'text-orange' : 'text-white'}`}>{assessment.behaviorAnalysis}</div>
                </div>
                <div className="assess-item">
                  <div className="assess-label"><HeartHandshake size={16} className="text-pink" /> {t('socialHelp.sentimentScore')}</div>
                  <div className={`assess-value ${assessment.sentimentScore === 'N/A' ? 'text-pink' : 'text-white'}`}>{assessment.sentimentScore}</div>
                </div>
              </div>

              <button className="view-full-btn">
                <ExternalLink size={16} /> {t('socialHelp.viewFull')}
              </button>
            </div>
          </section>

          {/* Today's Impact */}
          <section className="impact-section">
            <div className="section-title-wrap">
              <Activity size={20} className="text-pink" />
              <h2>{t('socialHelp.todaysImpact')}</h2>
            </div>
            
            <div className="impact-grid">
              <div className="impact-card glass-panel pink-glow">
                <div className="card-top">
                  <div className="icon-box"><Users size={20} /></div>
                  <div className="stats-info">
                    <h3>{stats.people_helped.value}</h3>
                    <p>{t('socialHelp.peopleHelped')}</p>
                    <span className="trend positive">{stats.people_helped.change} {t('socialHelp.thisMonth')}</span>
                  </div>
                </div>
                <div className="mini-chart chart-pink"></div>
              </div>

              <div className="impact-card glass-panel purple-glow">
                <div className="card-top">
                  <div className="icon-box"><HeartHandshake size={20} /></div>
                  <div className="stats-info">
                    <h3>{stats.reunited.value}</h3>
                    <p>{t('socialHelp.reuniteFamily')}</p>
                    <span className="trend positive">{stats.reunited.change} {t('socialHelp.thisMonth')}</span>
                  </div>
                </div>
                <div className="mini-chart chart-purple"></div>
              </div>

              <div className="impact-card glass-panel blue-glow">
                <div className="card-top">
                  <div className="icon-box"><MessageSquare size={20} /></div>
                  <div className="stats-info">
                    <h3>{stats.reports_received.value}</h3>
                    <p>{t('socialHelp.reportsReceived')}</p>
                    <span className="trend positive">{stats.reports_received.change} {t('socialHelp.total')}</span>
                  </div>
                </div>
                <div className="mini-chart chart-blue"></div>
              </div>

              <div className="impact-card glass-panel orange-glow">
                <div className="card-top">
                  <div className="icon-box"><Building size={20} /></div>
                  <div className="stats-info">
                    <h3>{stats.ngos_active.value}</h3>
                    <p>{t('socialHelp.ngosNotified')}</p>
                    <span className="trend warning">{stats.ngos_active.change}</span>
                  </div>
                </div>
                <div className="mini-chart chart-orange"></div>
              </div>
            </div>
          </section>

          {/* Bottom Banner */}
          <section className="bottom-banner glass-panel">
            <div className="banner-content">
              <div className="banner-badge">{t('socialHelp.joinMovement')}</div>
              <h2>{t('socialHelp.bannerTitle')}</h2>
              <p>{t('socialHelp.bannerDesc')}</p>
              <div className="banner-actions">
                <button className="btn-primary" onClick={scrollToReport}>{t('socialHelp.reportNow')}</button>
                <button className="btn-secondary">{t('socialHelp.supportNGOs')}</button>
              </div>
            </div>
            <div className="banner-bg-image"></div>
          </section>

        </div>
      </main>

      <style jsx>{`
        .layout-container { display: flex; min-height: 100vh; background: #0f0c29; color: white; font-family: 'Inter', sans-serif; }
        .main-content { flex: 1; margin-left: 260px; padding: 2rem; overflow-y: auto; background: linear-gradient(135deg, #0f0c29 0%, #302b63 50%, #24243e 100%); }
        .social-help-container { max-width: 1400px; margin: 0 auto; display: flex; flex-direction: column; gap: 2.5rem; }
        
        .glass-panel { background: rgba(20, 15, 35, 0.6); backdrop-filter: blur(20px); border: 1px solid rgba(255, 255, 255, 0.05); border-radius: 24px; box-shadow: 0 20px 40px rgba(0,0,0,0.4); }

        /* HERO SECTION */
        .hero-section { position: relative; padding: 2rem 3rem; overflow: hidden; display: flex; justify-content: space-between; min-height: 320px; align-items: center; }
        .hero-content { position: relative; z-index: 2; max-width: 55%; display: flex; flex-direction: column; justify-content: center; }
        .hero-badge { display: inline-flex; align-items: center; padding: 0.4rem 1rem; background: rgba(219, 39, 119, 0.1); border: 1px solid rgba(219, 39, 119, 0.3); color: #ec4899; border-radius: 99px; font-size: 0.7rem; font-weight: 800; letter-spacing: 0.1em; margin-bottom: 1.25rem; width: fit-content; }
        .hero-title { font-size: 3rem; font-weight: 800; line-height: 1.1; margin-bottom: 1rem; }
        .highlight-text { background: linear-gradient(90deg, #ec4899, #8b5cf6); -webkit-background-clip: text; -webkit-text-fill-color: transparent; }
        .hero-desc { font-size: 0.95rem; color: rgba(255,255,255,0.7); line-height: 1.5; margin-bottom: 2rem; }
        
        .hero-stats { display: flex; gap: 2rem; }
        .hero-stat-box { display: flex; flex-direction: column; gap: 0.2rem; }
        .stat-icon { margin-bottom: 0.5rem; }
        .hero-stat-box h3 { font-size: 1.6rem; font-weight: 800; margin: 0; }
        .hero-stat-box p { font-size: 0.7rem; color: rgba(255,255,255,0.6); line-height: 1.4; text-transform: uppercase; letter-spacing: 0.05em; font-weight: 600; }
        .hero-stat-box p span { font-size: 0.6rem; color: rgba(255,255,255,0.4); text-transform: none; font-weight: 400; }
        
        .hero-bg-image { position: absolute; top: -10%; right: -5%; bottom: -10%; width: 65%; background-image: url('/socialhelp.bg.png'); background-size: cover; background-position: center right; opacity: 1; mask-image: linear-gradient(to left, rgba(0,0,0,1) 60%, rgba(0,0,0,0) 100%); -webkit-mask-image: linear-gradient(to left, rgba(0,0,0,1) 60%, rgba(0,0,0,0) 100%); pointer-events: none; }

        /* REPORTING GRID */
        .reporting-grid { display: grid; grid-template-columns: 1.5fr 1fr; gap: 1.5rem; }
        
        .report-box, .assessment-box { padding: 2rem; display: flex; flex-direction: column; gap: 1.5rem; }
        .box-header { display: flex; align-items: center; gap: 1rem; margin-bottom: 0.5rem; }
        .icon-wrap { width: 40px; height: 40px; border-radius: 12px; background: rgba(255,255,255,0.05); display: flex; align-items: center; justify-content: center; color: #a855f7; }
        .box-header h2 { font-size: 1.2rem; font-weight: 700; margin: 0; }
        .box-header p { font-size: 0.8rem; color: rgba(255,255,255,0.5); margin: 0; }

        .form-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 1.5rem; flex: 1; }
        .upload-section label, .describe-section label { display: block; font-size: 0.85rem; font-weight: 600; margin-bottom: 0.8rem; color: rgba(255,255,255,0.8); }
        
        .upload-area { height: 180px; border: 2px dashed rgba(255,255,255,0.1); border-radius: 16px; background: rgba(0,0,0,0.2); transition: 0.3s; }
        .upload-area:hover { border-color: rgba(168, 85, 247, 0.4); background: rgba(168, 85, 247, 0.05); }
        .upload-trigger { display: flex; flex-direction: column; align-items: center; justify-content: center; height: 100%; cursor: pointer; text-align: center; padding: 1rem; }
        
        .textarea-wrap { position: relative; height: 180px; }
        .textarea-wrap textarea { width: 100%; height: 100%; background: rgba(0,0,0,0.2); border: 1px solid rgba(255,255,255,0.1); border-radius: 16px; padding: 1rem; color: white; resize: none; outline: none; font-family: 'Inter', sans-serif; font-size: 0.9rem; transition: 0.3s; }
        .textarea-wrap textarea:focus { border-color: rgba(168, 85, 247, 0.4); box-shadow: 0 0 15px rgba(168, 85, 247, 0.1); }
        
        .mic-btn { position: absolute; bottom: 1rem; right: 1rem; width: 36px; height: 36px; border-radius: 50%; background: rgba(255,255,255,0.1); border: none; color: white; display: flex; align-items: center; justify-content: center; cursor: pointer; transition: 0.3s; }
        .mic-btn:hover { background: rgba(168, 85, 247, 0.4); }
        .mic-btn.recording { background: #ef4444; animation: pulseRed 1.5s infinite; }

        .submit-btn { width: 100%; padding: 1.2rem; background: linear-gradient(90deg, #8b5cf6, #ec4899); border: none; border-radius: 16px; color: white; font-weight: 700; font-size: 1rem; display: flex; justify-content: center; align-items: center; gap: 0.5rem; cursor: pointer; transition: 0.3s; margin-top: 0.5rem; }
        .submit-btn:hover:not(:disabled) { box-shadow: 0 10px 25px rgba(236, 72, 153, 0.3); transform: translateY(-2px); }
        .submit-btn:disabled { opacity: 0.7; cursor: wait; }

        /* AI ASSESSMENT */
        .assessment-list { display: flex; flex-direction: column; gap: 1.25rem; flex: 1; justify-content: center; }
        .assess-item { display: flex; justify-content: space-between; align-items: center; padding: 1rem; background: rgba(0,0,0,0.2); border-radius: 12px; border: 1px solid rgba(255,255,255,0.03); }
        .assess-label { display: flex; align-items: center; gap: 0.5rem; font-size: 0.85rem; font-weight: 600; color: rgba(255,255,255,0.7); }
        .assess-value { font-size: 0.9rem; font-weight: 800; text-align: right; }
        
        .view-full-btn { width: 100%; padding: 1rem; background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.1); border-radius: 12px; color: white; font-weight: 600; font-size: 0.85rem; display: flex; justify-content: center; align-items: center; gap: 0.5rem; cursor: pointer; transition: 0.3s; margin-top: 0.5rem; }
        .view-full-btn:hover { background: rgba(255,255,255,0.1); }

        /* IMPACT SECTION */
        .section-title-wrap { display: flex; align-items: center; gap: 0.75rem; margin-bottom: 1.5rem; }
        .section-title-wrap h2 { font-size: 1.2rem; font-weight: 700; margin: 0; }
        
        .impact-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 1.5rem; }
        .impact-card { padding: 1.5rem; display: flex; flex-direction: column; gap: 1rem; position: relative; overflow: hidden; }
        .card-top { display: flex; gap: 1rem; align-items: flex-start; z-index: 2; position: relative; }
        .icon-box { width: 40px; height: 40px; border-radius: 10px; background: rgba(255,255,255,0.05); display: flex; align-items: center; justify-content: center; }
        .stats-info h3 { font-size: 1.5rem; font-weight: 800; margin: 0 0 0.2rem 0; }
        .stats-info p { font-size: 0.75rem; color: rgba(255,255,255,0.6); margin: 0 0 0.5rem 0; }
        .trend { font-size: 0.65rem; font-weight: 700; }
        .trend.positive { color: #a855f7; }
        .trend.warning { color: #f59e0b; }
        
        .mini-chart { height: 40px; width: 100%; opacity: 0.5; background-size: cover; background-position: bottom; z-index: 1; position: relative; margin-top: auto; }
        .chart-pink { background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 40' preserveAspectRatio='none'%3E%3Cpath d='M0,40 Q10,30 20,35 T40,20 T60,25 T80,10 T100,5 L100,40 Z' fill='none' stroke='%23ec4899' stroke-width='2'/%3E%3Ccircle cx='100' cy='5' r='3' fill='%23ec4899'/%3E%3C/svg%3E"); }
        .chart-purple { background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 40' preserveAspectRatio='none'%3E%3Cpath d='M0,35 Q15,40 25,25 T50,30 T75,15 T100,20 L100,40 Z' fill='none' stroke='%238b5cf6' stroke-width='2'/%3E%3Ccircle cx='100' cy='20' r='3' fill='%238b5cf6'/%3E%3C/svg%3E"); }
        .chart-blue { background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 40' preserveAspectRatio='none'%3E%3Cpath d='M0,30 Q20,20 30,35 T60,20 T80,25 T100,10 L100,40 Z' fill='none' stroke='%233b82f6' stroke-width='2'/%3E%3Ccircle cx='100' cy='10' r='3' fill='%233b82f6'/%3E%3C/svg%3E"); }
        .chart-orange { background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 40' preserveAspectRatio='none'%3E%3Cpath d='M0,40 Q10,35 25,38 T45,30 T70,35 T100,25 L100,40 Z' fill='none' stroke='%23f59e0b' stroke-width='2'/%3E%3Ccircle cx='100' cy='25' r='3' fill='%23f59e0b'/%3E%3C/svg%3E"); }

        .pink-glow:hover { box-shadow: 0 10px 30px rgba(236, 72, 153, 0.15); border-color: rgba(236, 72, 153, 0.3); }
        .purple-glow:hover { box-shadow: 0 10px 30px rgba(139, 92, 246, 0.15); border-color: rgba(139, 92, 246, 0.3); }
        .blue-glow:hover { box-shadow: 0 10px 30px rgba(59, 130, 246, 0.15); border-color: rgba(59, 130, 246, 0.3); }
        .orange-glow:hover { box-shadow: 0 10px 30px rgba(245, 158, 11, 0.15); border-color: rgba(245, 158, 11, 0.3); }

        /* BOTTOM BANNER */
        .bottom-banner { position: relative; padding: 3rem; overflow: hidden; display: flex; align-items: center; min-height: 250px; }
        .banner-content { position: relative; z-index: 2; max-width: 50%; }
        .banner-badge { display: inline-block; padding: 0.3rem 0.8rem; background: rgba(255,255,255,0.1); border-radius: 99px; font-size: 0.65rem; font-weight: 700; text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 1rem; }
        .bottom-banner h2 { font-size: 2.5rem; font-weight: 800; line-height: 1.1; margin-bottom: 1rem; }
        .bottom-banner p { font-size: 0.9rem; color: rgba(255,255,255,0.7); line-height: 1.6; margin-bottom: 1.5rem; }
        
        .banner-actions { display: flex; gap: 1rem; }
        .btn-primary { padding: 0.8rem 1.5rem; background: linear-gradient(90deg, #ec4899, #a855f7); border: none; border-radius: 99px; color: white; font-weight: 700; font-size: 0.9rem; cursor: pointer; transition: 0.3s; }
        .btn-primary:hover { box-shadow: 0 0 20px rgba(236, 72, 153, 0.4); transform: scale(1.02); }
        .btn-secondary { padding: 0.8rem 1.5rem; background: transparent; border: 1px solid rgba(255,255,255,0.3); border-radius: 99px; color: white; font-weight: 700; font-size: 0.9rem; cursor: pointer; transition: 0.3s; }
        .btn-secondary:hover { background: rgba(255,255,255,0.1); }
        
        .banner-bg-image { position: absolute; top: 0; right: 0; bottom: 0; width: 70%; background-image: url('/littlehelp_bg.png'); background-size: cover; background-position: center right; opacity: 0.9; mask-image: linear-gradient(to left, rgba(0,0,0,1) 40%, rgba(0,0,0,0) 100%); -webkit-mask-image: linear-gradient(to left, rgba(0,0,0,1) 40%, rgba(0,0,0,0) 100%); }

        /* COLORS */
        .text-pink { color: #ec4899; }
        .text-blue { color: #3b82f6; }
        .text-purple { color: #a855f7; }
        .text-cyan { color: #06b6d4; }
        .text-orange { color: #f59e0b; }
        .text-green { color: #10b981; }

        @keyframes pulseRed { 0% { box-shadow: 0 0 0 0 rgba(239, 68, 68, 0.7); } 70% { box-shadow: 0 0 0 10px rgba(239, 68, 68, 0); } 100% { box-shadow: 0 0 0 0 rgba(239, 68, 68, 0); } }
      `}</style>
    </div>
  );
}

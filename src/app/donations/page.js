'use client';
import { useState, useEffect } from 'react';
import Sidebar from '@/components/Sidebar';
import DonationMap from '@/components/DonationMap';
import { useLanguage } from '@/context/LanguageContext';
import { 
  Heart, Users, Target, ShieldCheck, MapPin, 
  AlertCircle, ArrowRight, Sparkles, TrendingUp,
  Filter, Search, Clock, Info, Zap, ShieldAlert
} from 'lucide-react';

const STATES = [
  "Andhra Pradesh", "Arunachal Pradesh", "Assam", "Bihar", "Chhattisgarh", "Goa", "Gujarat", 
  "Haryana", "Himachal Pradesh", "Jharkhand", "Karnataka", "Kerala", "Madhya Pradesh", 
  "Maharashtra", "Manipur", "Meghalaya", "Mizoram", "Nagaland", "Odisha", "Punjab", 
  "Rajasthan", "Sikkim", "Tamil Nadu", "Telangana", "Tripura", "Uttar Pradesh", 
  "Uttarakhand", "West Bengal", "Delhi", "Puducherry"
];

export default function DonationsPage() {
  const { t } = useLanguage();
  const [campaigns, setCampaigns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedState, setSelectedState] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [recommendation, setRecommendation] = useState(null);

  useEffect(() => {
    fetchCampaigns();
    fetchRecommendations();
  }, [selectedState]);

  const fetchCampaigns = async () => {
    setLoading(true);
    try {
      let url = `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/api/donations/smart-match`;
      const queryParams = new URLSearchParams();
      if (selectedState) queryParams.append('state', selectedState);
      
      const storedInterests = localStorage.getItem('civicInterests');
      if (storedInterests) {
        queryParams.append('interests', storedInterests);
      }
      
      const res = await fetch(`${url}?${queryParams.toString()}`);
      const data = await res.json();
      setCampaigns(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const trackInterest = (category, points = 1) => {
    if (!category) return;
    try {
      const stored = localStorage.getItem('civicInterests');
      const interests = stored ? JSON.parse(stored) : {};
      interests[category] = (interests[category] || 0) + points;
      // Cap at a max score to avoid infinite growth
      if (interests[category] > 10) interests[category] = 10;
      localStorage.setItem('civicInterests', JSON.stringify(interests));
    } catch (e) {}
  };

  const fetchRecommendations = async () => {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/api/donations/recommendations`);
      const data = await res.json();
      setRecommendation(data);
    } catch (err) {}
  };

  const filteredCampaigns = campaigns.filter(c => 
    c.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.ngo_name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getUrgencyClass = (level) => {
    switch (level) {
      case 'Critical': return 'urgency-critical';
      case 'Urgent': return 'urgency-urgent';
      default: return 'urgency-community';
    }
  };

  // Timer Component
  const CountdownTimer = ({ expiry }) => {
    const [timeLeft, setTimeLeft] = useState('');
    
    useEffect(() => {
      if (!expiry) return;
      const interval = setInterval(() => {
        const now = new Date().getTime();
        const end = new Date(expiry).getTime();
        const diff = end - now;
        
        if (diff <= 0) {
          setTimeLeft('Campaign Ended');
          clearInterval(interval);
        } else {
          const days = Math.floor(diff / (1000 * 60 * 60 * 24));
          const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
          setTimeLeft(`${days}d ${hours}h left`);
        }
      }, 1000);
      return () => clearInterval(interval);
    }, [expiry]);
    
    return <span>{timeLeft}</span>;
  };

  return (
    <div className="dashboard-layout">
      <Sidebar />
      <main className="dashboard-content">
        <header className="dashboard-header">
          <div className="header-top">
            <div>
              <div className="impact-badge">
                <Sparkles size={14} />
                <span>{t('donations.badge')}</span>
              </div>
              <h1 className="dashboard-title">{t('donations.title')}</h1>
              <p className="dashboard-subtitle">{t('donations.subtitle')}</p>
            </div>
            
            <div className="stats-row">
              <div className="stat-card glass-panel highlight-purple">
                <TrendingUp size={20} className="stat-icon purple" />
                <div className="stat-info">
                  <span className="stat-value">85+</span>
                  <span className="stat-label">{t('socialHelp.active')}</span>
                </div>
              </div>
              <div className="stat-card glass-panel">
                <Users size={20} className="stat-icon blue" />
                <div className="stat-info">
                  <span className="stat-value">1,248+</span>
                  <span className="stat-label">{t('donations.supporters')}</span>
                </div>
              </div>
            </div>
          </div>

          {recommendation && (
            <div className="ai-recommendation glass-panel animate-fade-in">
              <div className="ai-icon-wrap">
                <Zap size={20} fill="#a855f7" />
              </div>
              <div className="ai-content">
                <div className="ai-label">{t('donations.smartMatch')}</div>
                <div className="ai-title">{recommendation.recommendation}</div>
                <p className="ai-reason">{recommendation.reason}</p>
              </div>
              <button className="ai-action-btn" onClick={() => setSearchQuery(recommendation.trending_category)}>
                {t('donations.support')}
              </button>
            </div>
          )}

          <div className="controls-row">
            <div className="search-box glass-panel">
              <Search size={18} />
              <input 
                type="text" 
                placeholder={t('donations.search')} 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            
            <div className="state-picker glass-panel">
              <MapPin size={18} />
              <select value={selectedState} onChange={(e) => setSelectedState(e.target.value)}>
                <option value="">{t('notifications.allStates')}</option>
                {STATES.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
          </div>
        </header>

        <DonationMap />

        <div className="campaigns-grid">
          {loading ? (
            [1, 2, 3].map(i => <div key={i} className="shimmer-card glass-panel" />)
          ) : filteredCampaigns.length > 0 ? (
            filteredCampaigns.map((camp) => {
              const progress = Math.min(100, (camp.amount_raised / camp.target_amount) * 100);
              const isExpired = camp.expiry_date && new Date(camp.expiry_date) < new Date();

              const isUnderReview = camp.moderation_status === "Under Review";

              return (
                <div key={camp.id} className={`campaign-card glass-panel animate-slide-up ${isExpired ? 'expired' : ''} ${isUnderReview ? 'under-review' : ''}`}>
                  {isUnderReview && (
                    <div className="review-overlay">
                      <ShieldAlert size={24} className="text-orange" />
                      <span>{t('donations.underReview')}</span>
                    </div>
                  )}
                  {camp.smart_label && !isUnderReview && (
                    <div className="smart-badge">
                      <Sparkles size={12} />
                      {camp.smart_label}
                    </div>
                  )}
                  <div className="card-top">
                    <div className="card-meta">
                      {isUnderReview ? (
                        <span className="urgency-badge urgency-urgent">
                          {camp.risk_score}
                        </span>
                      ) : (
                        <span className={`urgency-badge ${getUrgencyClass(camp.urgency_level)}`}>
                          {t(`donations.${camp.urgency_level.toLowerCase()}`)}
                        </span>
                      )}
                      <span className="timer-badge">
                        <Clock size={12} />
                        <CountdownTimer expiry={camp.expiry_date} />
                      </span>
                    </div>
                    <div className="location-tag">
                      <MapPin size={12} />
                      {camp.location}
                    </div>
                  </div>

                  <div className="card-body">
                    <h3 className="camp-title">{camp.title}</h3>
                    <div className="ngo-info">
                      <span className="ngo-name">by {camp.ngo_name}</span>
                    </div>
                    <p className="camp-desc">{camp.description}</p>
                    
                    {camp.ai_reason && (
                      <div className="ai-reason-box">
                        <Zap size={12} className="ai-icon" />
                        <span>{camp.ai_reason}</span>
                      </div>
                    )}
                    
                    <div className="progress-section">
                      <div className="progress-labels">
                        <span className="raised-val">₹{camp.amount_raised.toLocaleString()} <small>{t('donations.raised')}</small></span>
                        <span className="percent-val">{Math.round(progress)}%</span>
                      </div>
                      <div className="progress-bar-wrap">
                        <div className="progress-bar-fill" style={{ width: `${progress}%` }}>
                          <div className="progress-glow" />
                        </div>
                      </div>
                      <div className="target-label">Goal: ₹{camp.target_amount.toLocaleString()}</div>
                    </div>

                    <div className="card-footer">
                      <div className="impact-pill">
                        <TrendingUp size={14} />
                        {camp.impact_metrics}
                      </div>
                      <div className="donor-count">
                        <Users size={14} />
                        {camp.contributor_count}
                      </div>
                    </div>

                    <button 
                      className={`donate-btn ${isUnderReview ? 'disabled' : ''}`}
                      disabled={isUnderReview}
                      onClick={() => {
                        if (isUnderReview) return;
                        trackInterest(camp.related_complaint_category || camp.category, 3);
                        alert("Support intent registered! This will boost similar campaigns in your personalized feed.");
                      }}
                    >
                      {isUnderReview ? t('donations.underReview') : t('donations.support')} {!isUnderReview && <ArrowRight size={16} />}
                    </button>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="empty-state glass-panel animate-fade-in">
              <Info size={48} color="rgba(255,255,255,0.1)" />
              <h3>{t('donations.noResults')}</h3>
              <p>{t('donations.noResults')}</p>
              <button className="reset-btn" onClick={() => setSelectedState('')}>{t('notifications.allStates')}</button>
            </div>
          )}
        </div>
      </main>

      <style jsx>{`
        .dashboard-layout { display: flex; min-height: 100vh; background: #030014; color: white; font-family: 'Inter', sans-serif; }
        .dashboard-content { flex: 1; padding: 3rem 4rem; overflow-y: auto; margin-left: 260px; }
        @media (max-width: 1024px) { .dashboard-content { margin-left: 0; padding: 2rem; } }

        .dashboard-header { margin-bottom: 4rem; }
        .header-top { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 3rem; gap: 2rem; }
        
        .impact-badge { display: inline-flex; align-items: center; gap: 0.5rem; background: rgba(168, 85, 247, 0.1); border: 1px solid rgba(168, 85, 247, 0.3); padding: 0.5rem 1.25rem; border-radius: 99px; font-size: 0.75rem; font-weight: 800; color: #a855f7; margin-bottom: 1.5rem; letter-spacing: 0.05em; }
        .dashboard-title { font-size: 3.5rem; font-weight: 900; letter-spacing: -0.03em; margin-bottom: 1rem; }
        .gradient-text { background: linear-gradient(135deg, #a855f7, #3b82f6); -webkit-background-clip: text; -webkit-text-fill-color: transparent; }
        .dashboard-subtitle { color: rgba(255,255,255,0.5); font-size: 1.2rem; }

        .stats-row { display: flex; gap: 1.5rem; }
        .stat-card { display: flex; align-items: center; gap: 1.25rem; padding: 1.25rem 2rem; border-radius: 24px; border: 1px solid rgba(255,255,255,0.05); min-width: 200px; }
        .stat-icon { width: 44px; height: 44px; border-radius: 12px; display: flex; align-items: center; justify-content: center; background: rgba(255,255,255,0.05); }
        .stat-icon.purple { color: #a855f7; }
        .stat-icon.blue { color: #3b82f6; }
        .stat-info { display: flex; flex-direction: column; }
        .stat-value { font-size: 1.5rem; font-weight: 800; }
        .stat-label { font-size: 0.8rem; color: rgba(255,255,255,0.4); font-weight: 600; text-transform: uppercase; letter-spacing: 0.05em; }

        .controls-row { display: flex; gap: 1.5rem; align-items: center; }
        .search-box { flex: 1; max-width: 500px; display: flex; align-items: center; gap: 1rem; padding: 0.8rem 1.5rem; border-radius: 18px; border: 1px solid rgba(255,255,255,0.08); color: rgba(255,255,255,0.4); }
        .search-box input { background: transparent; border: none; color: white; width: 100%; outline: none; font-size: 1rem; }
        
        .state-picker { display: flex; align-items: center; gap: 0.8rem; padding: 0.8rem 1.5rem; border-radius: 18px; border: 1px solid rgba(255,255,255,0.08); }
        .state-picker select { background: transparent; border: none; color: white; font-weight: 700; outline: none; cursor: pointer; }
        .state-picker select option { background: #030014; }

        .campaigns-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(400px, 1fr)); gap: 2.5rem; }
        @media (max-width: 640px) { .campaigns-grid { grid-template-columns: 1fr; } }

        .campaign-card { border-radius: 32px; border: 1px solid rgba(255,255,255,0.06); padding: 2rem; transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275); position: relative; overflow: hidden; }
        .campaign-card:hover { transform: translateY(-10px) scale(1.02); background: rgba(255,255,255,0.06); border-color: rgba(168, 85, 247, 0.3); box-shadow: 0 20px 40px rgba(0,0,0,0.4); }
        
        .card-top { display: flex; justify-content: space-between; align-items: center; margin-bottom: 2rem; }
        .card-meta { display: flex; gap: 0.75rem; }
        
        .urgency-badge { font-size: 0.7rem; font-weight: 800; text-transform: uppercase; padding: 0.4rem 0.8rem; border-radius: 8px; letter-spacing: 0.05em; }
        .urgency-critical { background: rgba(239, 68, 68, 0.1); color: #ef4444; border: 1px solid rgba(239, 68, 68, 0.2); }
        .urgency-urgent { background: rgba(245, 158, 11, 0.1); color: #f59e0b; border: 1px solid rgba(245, 158, 11, 0.2); }
        .urgency-community { background: rgba(59, 130, 246, 0.1); color: #3b82f6; border: 1px solid rgba(59, 130, 246, 0.2); }

        .timer-badge { display: flex; align-items: center; gap: 0.3rem; font-size: 0.7rem; font-weight: 700; color: rgba(255,255,255,0.6); background: rgba(255,255,255,0.05); padding: 0.4rem 0.8rem; border-radius: 8px; border: 1px solid rgba(255,255,255,0.1); }
        .verified-badge { display: flex; align-items: center; gap: 0.3rem; font-size: 0.7rem; font-weight: 700; color: #10b981; background: rgba(16, 185, 129, 0.05); padding: 0.4rem 0.8rem; border-radius: 8px; border: 1px solid rgba(16, 185, 129, 0.2); }
        
        .ai-recommendation { margin-bottom: 2.5rem; display: flex; align-items: center; gap: 1.5rem; padding: 1.5rem 2rem; border-radius: 24px; border: 1px solid rgba(168, 85, 247, 0.2); background: linear-gradient(90deg, rgba(168, 85, 247, 0.05), rgba(59, 130, 246, 0.05)); }
        .ai-icon-wrap { width: 48px; height: 48px; border-radius: 14px; background: rgba(168, 85, 247, 0.1); display: flex; align-items: center; justify-content: center; box-shadow: 0 0 20px rgba(168, 85, 247, 0.2); }
        .ai-content { flex: 1; }
        .ai-label { font-size: 0.65rem; font-weight: 900; color: #a855f7; letter-spacing: 0.1em; margin-bottom: 0.25rem; }
        .ai-title { font-size: 1.1rem; font-weight: 800; color: white; margin-bottom: 0.2rem; }
        .ai-reason { font-size: 0.85rem; color: rgba(255,255,255,0.5); }
        .ai-action-btn { background: rgba(168, 85, 247, 0.2); border: 1px solid rgba(168, 85, 247, 0.3); color: white; padding: 0.6rem 1.5rem; border-radius: 12px; font-weight: 700; font-size: 0.85rem; cursor: pointer; transition: 0.3s; }
        .ai-action-btn:hover { background: #a855f7; border-color: #a855f7; box-shadow: 0 0 15px rgba(168, 85, 247, 0.4); }

        .campaign-card.expired { opacity: 0.6; filter: grayscale(0.5); pointer-events: none; }
        .campaign-card.expired .donate-btn { display: none; }
        .campaign-card.expired::after { content: "CAMPAIGN ENDED"; position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%) rotate(-15deg); font-size: 2rem; font-weight: 900; color: rgba(255,255,255,0.1); border: 4px solid rgba(255,255,255,0.1); padding: 0.5rem 1rem; pointer-events: none; }

        .campaign-card.under-review { border-color: rgba(245, 158, 11, 0.4); box-shadow: 0 0 20px rgba(245, 158, 11, 0.1); }
        .campaign-card.under-review .progress-bar-fill { filter: grayscale(1); opacity: 0.5; }
        .review-overlay { position: absolute; top: 0; left: 0; right: 0; background: rgba(245, 158, 11, 0.15); border-bottom: 1px solid rgba(245, 158, 11, 0.3); padding: 0.5rem; display: flex; align-items: center; justify-content: center; gap: 0.5rem; font-size: 0.75rem; font-weight: 800; color: #fcd34d; z-index: 10; backdrop-filter: blur(5px); }
        .text-orange { color: #f59e0b; }

        .highlight-purple { border-color: rgba(168, 85, 247, 0.3) !important; box-shadow: 0 0 20px rgba(168, 85, 247, 0.1); }
        .location-tag { display: flex; align-items: center; gap: 0.3rem; font-size: 0.75rem; color: rgba(255,255,255,0.4); font-weight: 600; }

        .camp-title { font-size: 1.5rem; font-weight: 800; margin: 0 0 0.5rem; line-height: 1.2; }
        .ngo-info { margin-bottom: 1.25rem; }
        .ngo-name { font-size: 0.85rem; font-weight: 700; color: #a855f7; }
        .camp-desc { color: rgba(255,255,255,0.6); line-height: 1.6; margin-bottom: 1.5rem; font-size: 0.95rem; }

        .smart-badge { position: absolute; top: -12px; left: 2rem; background: linear-gradient(90deg, #a855f7, #ec4899); color: white; padding: 0.3rem 0.8rem; border-radius: 8px; font-size: 0.65rem; font-weight: 800; display: flex; align-items: center; gap: 0.4rem; letter-spacing: 0.05em; box-shadow: 0 4px 15px rgba(168, 85, 247, 0.4); z-index: 10; }
        .ai-reason-box { display: flex; align-items: flex-start; gap: 0.5rem; background: rgba(168, 85, 247, 0.05); border: 1px solid rgba(168, 85, 247, 0.2); padding: 0.75rem 1rem; border-radius: 12px; margin-bottom: 1.5rem; }
        .ai-reason-box .ai-icon { color: #a855f7; margin-top: 0.1rem; flex-shrink: 0; }
        .ai-reason-box span { font-size: 0.75rem; color: rgba(255,255,255,0.7); font-weight: 500; line-height: 1.4; }

        .progress-section { margin-bottom: 2rem; }
        .progress-labels { display: flex; justify-content: space-between; align-items: flex-end; margin-bottom: 0.75rem; }
        .raised-val { font-size: 1.25rem; font-weight: 900; color: white; }
        .raised-val small { font-size: 0.8rem; color: rgba(255,255,255,0.4); font-weight: 600; margin-left: 0.3rem; }
        .percent-val { font-size: 1.1rem; font-weight: 800; color: #3b82f6; }
        
        .progress-bar-wrap { height: 10px; background: rgba(255,255,255,0.05); border-radius: 99px; overflow: hidden; margin-bottom: 0.5rem; border: 1px solid rgba(255,255,255,0.05); }
        .progress-bar-fill { height: 100%; background: linear-gradient(90deg, #a855f7, #3b82f6); border-radius: 99px; position: relative; transition: width 1.5s cubic-bezier(0.34, 1.56, 0.64, 1); }
        .progress-glow { position: absolute; right: 0; top: 0; width: 40px; height: 100%; background: white; filter: blur(10px); opacity: 0.3; }
        .target-label { font-size: 0.8rem; color: rgba(255,255,255,0.3); font-weight: 600; text-align: right; }

        .card-footer { display: flex; justify-content: space-between; align-items: center; margin-bottom: 2rem; padding-top: 1.5rem; border-top: 1px solid rgba(255,255,255,0.05); }
        .impact-pill { display: flex; align-items: center; gap: 0.5rem; font-size: 0.8rem; font-weight: 700; color: #10b981; background: rgba(16, 185, 129, 0.1); padding: 0.5rem 1rem; border-radius: 12px; }
        .donor-count { display: flex; align-items: center; gap: 0.4rem; font-size: 0.85rem; color: rgba(255,255,255,0.5); font-weight: 600; }

        .donate-btn { width: 100%; background: white; color: black; border: none; padding: 1.25rem; border-radius: 20px; font-weight: 800; font-size: 1rem; cursor: pointer; transition: 0.3s; display: flex; align-items: center; justify-content: center; gap: 0.75rem; }
        .donate-btn:hover:not(.disabled) { background: #a855f7; color: white; transform: scale(1.02); box-shadow: 0 10px 25px rgba(168, 85, 247, 0.4); }
        .donate-btn.disabled { background: rgba(255,255,255,0.1); color: rgba(255,255,255,0.4); cursor: not-allowed; }

        .shimmer-card { height: 480px; border-radius: 32px; position: relative; overflow: hidden; }
        .shimmer-card::after { content: ""; position: absolute; inset: 0; transform: translateX(-100%); background: linear-gradient(90deg, transparent, rgba(255,255,255,0.05), transparent); animation: shimmer 2s infinite; }
        @keyframes shimmer { 100% { transform: translateX(100%); } }

        .empty-state { text-align: center; padding: 6rem 2rem; border-radius: 32px; display: flex; flex-direction: column; align-items: center; gap: 1.5rem; }
        .empty-state h3 { font-size: 1.75rem; font-weight: 800; margin: 0; }
        .empty-state p { color: rgba(255,255,255,0.4); max-width: 400px; line-height: 1.6; }
        .reset-btn { background: #3b82f6; border: none; padding: 0.8rem 2rem; border-radius: 99px; color: white; font-weight: 700; cursor: pointer; transition: 0.3s; }

        .glass-panel { background: rgba(255,255,255,0.03); backdrop-filter: blur(20px); }
        .animate-slide-up { animation: slideUp 0.6s cubic-bezier(0.2, 0.8, 0.2, 1); }
        .animate-fade-in { animation: fadeIn 0.6s ease-out; }
        @keyframes slideUp { from { transform: translateY(30px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
      `}</style>
    </div>
  );
}

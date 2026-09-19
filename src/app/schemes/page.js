'use client';
import { useState, useEffect, Suspense } from 'react';
import Sidebar from '@/components/Sidebar';

import { useSearchParams } from 'next/navigation';
import { useLanguage } from '@/context/LanguageContext';
import { 
  Search, ExternalLink, Info, Calendar, ChevronRight, 
  CheckCircle2, Award, Zap, Globe, MapPin, Layers, Sparkles
} from 'lucide-react';

const STATES = [
  "Andhra Pradesh", "Arunachal Pradesh", "Assam", "Bihar", "Chhattisgarh", "Goa", "Gujarat", 
  "Haryana", "Himachal Pradesh", "Jharkhand", "Karnataka", "Kerala", "Madhya Pradesh", 
  "Maharashtra", "Manipur", "Meghalaya", "Mizoram", "Nagaland", "Odisha", "Punjab", 
  "Rajasthan", "Sikkim", "Tamil Nadu", "Telangana", "Tripura", "Uttar Pradesh", 
  "Uttarakhand", "West Bengal", "Delhi", "Puducherry"
];

const ACCENT_COLORS = [
  { color: '#A855F7', name: 'purple', glow: 'rgba(168, 85, 247, 0.4)' },
  { color: '#3B82F6', name: 'blue',   glow: 'rgba(59, 130, 246, 0.4)' },
  { color: '#06B6D4', name: 'cyan',   glow: 'rgba(6, 182, 212, 0.4)' },
  { color: '#14B8A6', name: 'teal',   glow: 'rgba(20, 184, 166, 0.4)' },
  { color: '#EC4899', name: 'pink',   glow: 'rgba(236, 72, 153, 0.4)' },
];

// Wrap the main content in a Suspense boundary because useSearchParams requires it
export default function GovSchemes() {
  return (
    <Suspense fallback={<div className="loading-state">Loading Schemes...</div>}>
      <GovSchemesContent />
    </Suspense>
  );
}

function GovSchemesContent() {
  const { t } = useLanguage();
  const [activeTab, setActiveTab] = useState('All'); // 'All' | 'Central' | 'State'
  const [selectedState, setSelectedState] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [schemes, setSchemes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedScheme, setSelectedScheme] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  
  const searchParams = useSearchParams();
  const openSchemeId = searchParams.get('openSchemeId');

  useEffect(() => {
    fetchSchemes();
  }, [activeTab, selectedState]);

  useEffect(() => {
    if (openSchemeId && schemes.length > 0) {
      const scheme = schemes.find(s => s.id === parseInt(openSchemeId));
      if (scheme) {
        setSelectedScheme(scheme);
        setShowDetailModal(true);
      }
    }
  }, [openSchemeId, schemes]);

  const fetchSchemes = async () => {
    setLoading(true);
    try {
      let url = `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/api/schemes`;
      const params = new URLSearchParams();
      if (activeTab !== 'All') params.append('type', activeTab);
      if (activeTab === 'State' && selectedState) params.append('state', selectedState);
      
      const res = await fetch(`${url}?${params.toString()}`);
      const data = await res.json();
      setSchemes(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const filteredSchemes = schemes.filter(s => 
    s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    s.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getSchemeIcon = (category) => {
    const cat = category.toLowerCase();
    if (cat.includes('health')) return '🏥';
    if (cat.includes('edu')) return '🎓';
    if (cat.includes('social')) return '🤝';
    if (cat.includes('employment') || cat.includes('job')) return '💼';
    return '📜';
  };

  return (
    <div className="schemes-container">
      <Sidebar />
      
      <main className="main-content">
        <div className="bg-decorations">
          <div className="blob blob-1"></div>
          <div className="blob blob-2"></div>
          <div className="blob blob-3"></div>
        </div>

        <section className="hero-section">
          <div className="glowing-badge">
            <Sparkles size={14} />
            <span>{t('schemes.badge')}</span>
          </div>
          <h1 className="hero-title">
            {t('schemes.title')}
          </h1>
          <p className="hero-subtitle">
            {t('schemes.subtitle')}
          </p>
        </section>

        <section className="controls-row">
          <div className="tabs-pill">
            {['All', 'Central', 'State'].map((tab) => (
              <button 
                key={tab}
                className={`tab-item ${activeTab === tab ? 'active' : ''}`}
                onClick={() => {
                  setActiveTab(tab);
                  if (tab !== 'State') setSelectedState('');
                }}
              >
                {tab === 'All' ? t('schemes.all') : tab === 'Central' ? t('schemes.central') : t('schemes.state')}
              </button>
            ))}
          </div>

          <div className="search-wrap">
            <Search className="search-icon" size={18} />
            <input 
              type="text" 
              placeholder={t('schemes.search')} 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="glass-input"
            />
          </div>
        </section>

        {activeTab === 'State' && (
          <div className="state-picker animate-fade-in">
            <div className="state-select-container">
              <MapPin size={18} className="pin-icon" />
              <select 
                value={selectedState}
                onChange={(e) => setSelectedState(e.target.value)}
                className="glass-select"
              >
                <option value="">{t('schemes.selectState')}</option>
                {STATES.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
          </div>
        )}

        <div className="schemes-grid">
          {loading ? (
            [1, 2, 3, 4, 5, 6].map(i => <div key={i} className="skeleton-card glass-card"></div>)
          ) : filteredSchemes.length > 0 ? (
            filteredSchemes.map((scheme, idx) => {
              const accent = ACCENT_COLORS[idx % ACCENT_COLORS.length];
              return (
                <div 
                  key={scheme.id} 
                  className="scheme-card glass-card animate-slide-up"
                  style={{ '--accent': accent.color, '--glow': accent.glow }}
                  onClick={() => { setSelectedScheme(scheme); setShowDetailModal(true); }}
                >
                  <div className="card-image-wrap">
                    <img 
                      src={scheme.category.includes('Health') ? '/scheme_2.png' : '/scheme_1.png'} 
                      alt="Scheme Visual"
                      className="card-img"
                    />
                    <div className="category-badge">{scheme.category}</div>
                  </div>
                  
                  <div className="card-content">
                    <div className="card-header">
                      <div className="icon-box">
                        {getSchemeIcon(scheme.category)}
                      </div>
                      <h3 className="card-title">{scheme.name}</h3>
                    </div>
                    
                    <p className="card-desc">
                      {scheme.description.length > 90 ? scheme.description.substring(0, 87) + '...' : scheme.description}
                    </p>
                    
                    <div className="card-info-row">
                      <div className="info-item">
                        <Calendar size={14} />
                        <span>{t('schemes.launched')} {scheme.launch_year || '2024'}</span>
                      </div>
                      <div className="info-item">
                        <Layers size={14} />
                        <span>{scheme.type}</span>
                      </div>
                    </div>

                    <button className="cta-btn">
                      {t('schemes.viewDetails')} <ChevronRight size={16} />
                    </button>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="no-results glass-card animate-fade-in">
              <div className="empty-icon-wrap">
                <Globe size={60} className="empty-icon" />
              </div>
              <h3>{t('schemes.noSchemes')}</h3>
              <p>{t('schemes.noSchemesHint')}</p>
              <button className="reset-btn" onClick={() => { setActiveTab('All'); setSelectedState(''); setSearchQuery(''); }}>
                {t('schemes.all')}
              </button>
            </div>
          )}
        </div>
      </main>

      {showDetailModal && selectedScheme && (
        <div className="modal-overlay" onClick={() => setShowDetailModal(false)}>
          <div className="modal-viewport glass-card animate-modal-in" onClick={e => e.stopPropagation()}>
            <button className="modal-close" onClick={() => setShowDetailModal(false)}>×</button>
            
            <div className="modal-content">
              <div className="modal-visual">
                <img 
                  src={selectedScheme.category.includes('Health') ? '/scheme_2.png' : '/scheme_1.png'} 
                  alt="Scheme"
                />
                <div className="modal-cat-badge">{selectedScheme.category}</div>
              </div>
              
              <div className="modal-text">
                <h2 className="modal-title">{selectedScheme.name}</h2>
                <div className="modal-chips">
                  <span className="chip"><Globe size={14}/> {selectedScheme.type}</span>
                  <span className="chip"><Calendar size={14}/> {selectedScheme.launch_year || '2024'}</span>
                </div>
                
                <div className="scroll-area">
                  <div className="detail-section">
                    <h4>{t('dashboard.describeProblem')}</h4>
                    <p>{selectedScheme.description}</p>
                  </div>
                  
                  <div className="detail-section">
                    <h4>{t('schemes.benefits')}</h4>
                    <p>{selectedScheme.benefits || 'Financial and social assistance as per government norms.'}</p>
                  </div>

                  <div className="detail-section">
                    <h4>{t('schemes.eligibility')}</h4>
                    <p>{selectedScheme.eligibility_summary}</p>
                  </div>
                  
                  {selectedScheme.application_steps && (
                    <div className="detail-section">
                      <h4>{t('schemes.howToApply')}</h4>
                      <div className="steps-list">
                        {selectedScheme.application_steps.split('\n').map((step, i) => (
                          <div key={i} className="step-item">
                            <span className="step-num">{t('schemes.step')} {i+1}</span>
                            <span>{step}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                <div className="modal-actions">
                  <a 
                    href={selectedScheme.website_url} 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className="action-btn website"
                  >
                    <ExternalLink size={18} /> {t('schemes.visitPortal')}
                  </a>
                  <button className="action-btn apply" onClick={() => setShowDetailModal(false)}>
                    <Zap size={18} /> {t('schemes.applyNow')}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      <style jsx>{`
        .schemes-container {
          display: flex;
          min-height: 100vh;
          background: #030014;
          color: white;
          overflow: hidden;
        }

        .main-content {
          flex: 1;
          margin-left: 260px; /* var(--sidebar-width) from global */
          padding: 3rem 4rem;
          position: relative;
          z-index: 1;
          height: 100vh;
          overflow-y: auto;
          scrollbar-width: thin;
        }

        @media (max-width: 1024px) {
          .main-content { padding: 2rem; }
        }

        @media (max-width: 768px) {
          .main-content { margin-left: 0; padding: 1.5rem; }
        }

        /* Background Decorations */
        .bg-decorations {
          position: fixed;
          top: 0; left: 0; right: 0; bottom: 0;
          z-index: -1;
          pointer-events: none;
          overflow: hidden;
        }
        .blob {
          position: absolute;
          border-radius: 50%;
          filter: blur(120px);
          opacity: 0.15;
          animation: float 20s infinite alternate;
        }
        .blob-1 { width: 400px; height: 400px; background: #8b5cf6; top: -100px; right: -100px; }
        .blob-2 { width: 300px; height: 300px; background: #3b82f6; bottom: -50px; left: -50px; animation-delay: -5s; }
        .blob-3 { width: 250px; height: 250px; background: #ec4899; top: 40%; left: 20%; animation-delay: -10s; }

        @keyframes float {
          0% { transform: translate(0, 0); }
          100% { transform: translate(30px, 30px); }
        }

        /* Hero Section */
        .hero-section {
          text-align: center;
          margin-bottom: 4rem;
          margin-top: 1rem;
        }
        .glowing-badge {
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
          background: rgba(168, 85, 247, 0.1);
          border: 1px solid rgba(168, 85, 247, 0.3);
          padding: 0.5rem 1rem;
          border-radius: 99px;
          font-size: 0.75rem;
          font-weight: 700;
          letter-spacing: 0.1em;
          color: #a855f7;
          box-shadow: 0 0 20px rgba(168, 85, 247, 0.1);
          margin-bottom: 1.5rem;
        }
        .hero-title {
          font-size: 3.5rem;
          font-weight: 900;
          margin-bottom: 1rem;
          letter-spacing: -0.02em;
        }
        .gradient-text {
          background: linear-gradient(135deg, #a855f7, #3b82f6);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
        }
        .hero-subtitle {
          font-size: 1.25rem;
          color: rgba(255, 255, 255, 0.5);
          max-width: 600px;
          margin: 0 auto;
        }

        /* Controls Row */
        .controls-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 2rem;
          margin-bottom: 3rem;
        }
        .tabs-pill {
          display: flex;
          background: rgba(255, 255, 255, 0.03);
          padding: 0.4rem;
          border-radius: 99px;
          border: 1px solid rgba(255, 255, 255, 0.05);
        }
        .tab-item {
          padding: 0.75rem 1.75rem;
          border-radius: 99px;
          border: none;
          background: transparent;
          color: rgba(255, 255, 255, 0.6);
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s ease;
        }
        .tab-item.active {
          background: linear-gradient(135deg, #a855f7, #3b82f6);
          color: white;
          box-shadow: 0 0 20px rgba(139, 92, 246, 0.3);
        }

        .search-wrap {
          flex: 1;
          max-width: 450px;
          position: relative;
        }
        .search-icon {
          position: absolute;
          left: 1.25rem;
          top: 50%;
          transform: translateY(-50%);
          color: rgba(255, 255, 255, 0.4);
        }
        .glass-input {
          width: 100%;
          background: rgba(255, 255, 255, 0.03);
          border: 1px solid rgba(255, 255, 255, 0.08);
          padding: 1rem 1rem 1rem 3.5rem;
          border-radius: 16px;
          color: white;
          outline: none;
          transition: all 0.3s ease;
        }
        .glass-input:focus {
          border-color: #a855f7;
          background: rgba(255, 255, 255, 0.06);
          box-shadow: 0 0 20px rgba(168, 85, 247, 0.2);
        }

        /* State Picker */
        .state-picker {
          margin-bottom: 3rem;
          display: flex;
          justify-content: center;
        }
        .state-select-container {
          background: rgba(168, 85, 247, 0.05);
          border: 1px solid rgba(168, 85, 247, 0.2);
          border-radius: 16px;
          padding: 0 1.25rem;
          display: flex;
          align-items: center;
          gap: 0.75rem;
        }
        .glass-select {
          background: transparent;
          border: none;
          color: white;
          padding: 1rem 0;
          font-size: 1rem;
          font-weight: 600;
          outline: none;
          cursor: pointer;
        }
        .glass-select option { background: #030014; }

        /* Schemes Grid */
        .schemes-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(340px, 1fr));
          gap: 2rem;
          margin-bottom: 5rem;
        }

        .glass-card {
          background: rgba(255, 255, 255, 0.03);
          backdrop-filter: blur(10px);
          border: 1px solid rgba(255, 255, 255, 0.08);
          border-radius: 28px;
          overflow: hidden;
          transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
        }

        .scheme-card {
          cursor: pointer;
          position: relative;
        }
        .scheme-card::before {
          content: '';
          position: absolute;
          inset: 0;
          border-radius: 28px;
          padding: 1px;
          background: linear-gradient(135deg, rgba(255, 255, 255, 0.1), transparent, var(--accent));
          -webkit-mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
          mask-composite: exclude;
          pointer-events: none;
        }
        .scheme-card:hover {
          transform: translateY(-10px) scale(1.02);
          background: rgba(255, 255, 255, 0.05);
          border-color: var(--accent);
          box-shadow: 0 20px 40px rgba(0, 0, 0, 0.4), 0 0 30px var(--glow);
        }

        .card-image-wrap {
          height: 180px;
          position: relative;
          overflow: hidden;
        }
        .card-img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          transition: transform 0.5s ease;
        }
        .scheme-card:hover .card-img {
          transform: scale(1.1);
        }
        .category-badge {
          position: absolute;
          top: 1rem;
          right: 1rem;
          background: rgba(0, 0, 0, 0.6);
          backdrop-filter: blur(5px);
          padding: 0.4rem 0.8rem;
          border-radius: 10px;
          font-size: 0.7rem;
          font-weight: 800;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          border: 1px solid rgba(255, 255, 255, 0.1);
        }

        .card-content {
          padding: 1.75rem;
        }
        .card-header {
          display: flex;
          gap: 1rem;
          margin-bottom: 1.25rem;
          align-items: flex-start;
        }
        .icon-box {
          width: 48px;
          height: 48px;
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 14px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 1.5rem;
          flex-shrink: 0;
        }
        .card-title {
          font-size: 1.25rem;
          font-weight: 700;
          line-height: 1.3;
          color: white;
        }
        .card-desc {
          font-size: 0.95rem;
          color: rgba(255, 255, 255, 0.5);
          line-height: 1.6;
          margin-bottom: 1.5rem;
        }
        .card-info-row {
          display: flex;
          gap: 1.25rem;
          margin-bottom: 1.5rem;
          padding-top: 1rem;
          border-top: 1px solid rgba(255, 255, 255, 0.05);
        }
        .info-item {
          display: flex;
          align-items: center;
          gap: 0.4rem;
          font-size: 0.8rem;
          color: rgba(255, 255, 255, 0.4);
          font-weight: 500;
        }

        .cta-btn {
          width: 100%;
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid rgba(255, 255, 255, 0.1);
          padding: 0.9rem;
          border-radius: 14px;
          color: white;
          font-weight: 700;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.5rem;
          cursor: pointer;
          transition: all 0.3s ease;
        }
        .scheme-card:hover .cta-btn {
          background: var(--accent);
          border-color: transparent;
          box-shadow: 0 10px 20px var(--glow);
        }

        /* Skeleton/Empty States */
        .skeleton-card {
          height: 420px;
          background: rgba(255, 255, 255, 0.02);
          position: relative;
          overflow: hidden;
        }
        .skeleton-card::after {
          content: "";
          position: absolute;
          inset: 0;
          transform: translateX(-100%);
          background: linear-gradient(90deg, transparent, rgba(255,255,255,0.05), transparent);
          animation: shimmer 2s infinite;
        }
        @keyframes shimmer {
          100% { transform: translateX(100%); }
        }

        .no-results {
          grid-column: 1 / -1;
          text-align: center;
          padding: 6rem 2rem;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 1.5rem;
        }
        .empty-icon-wrap {
          width: 120px;
          height: 120px;
          background: rgba(168, 85, 247, 0.05);
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          margin-bottom: 1rem;
          border: 1px dashed rgba(168, 85, 247, 0.3);
          animation: pulse-slow 3s infinite;
        }
        .empty-icon { color: rgba(168, 85, 247, 0.4); }
        .no-results h3 { font-size: 1.75rem; font-weight: 800; margin: 0; }
        .no-results p { color: rgba(255, 255, 255, 0.5); max-width: 400px; margin: 0; line-height: 1.6; }
        .reset-btn {
          margin-top: 1rem;
          background: linear-gradient(135deg, #a855f7, #3b82f6);
          border: none;
          padding: 0.8rem 2rem;
          border-radius: 99px;
          color: white;
          font-weight: 700;
          cursor: pointer;
          transition: all 0.3s ease;
        }
        .reset-btn:hover { transform: scale(1.05); box-shadow: 0 0 20px rgba(168, 85, 247, 0.4); }

        @keyframes pulse-slow {
          0%, 100% { transform: scale(1); opacity: 1; }
          50% { transform: scale(1.05); opacity: 0.7; }
        }

        /* Modal Redesign */
        .modal-overlay {
          position: fixed;
          inset: 0;
          background: rgba(0, 0, 0, 0.85);
          backdrop-filter: blur(15px);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 2000;
          padding: 2rem;
        }
        .modal-viewport {
          width: 100%;
          max-width: 950px;
          max-height: 90vh;
          position: relative;
          background: #06031A;
          border: 1px solid rgba(139, 92, 246, 0.3);
          box-shadow: 0 0 50px rgba(0, 0, 0, 0.5);
        }
        .modal-close {
          position: absolute;
          top: 1.5rem;
          right: 1.5rem;
          width: 40px;
          height: 40px;
          border-radius: 50%;
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid rgba(255, 255, 255, 0.1);
          color: white;
          font-size: 1.5rem;
          cursor: pointer;
          z-index: 10;
        }
        
        .modal-content {
          display: grid;
          grid-template-columns: 400px 1fr;
          height: 100%;
          overflow: hidden;
        }
        @media (max-width: 900px) {
          .modal-content { grid-template-columns: 1fr; }
          .modal-visual { height: 250px !important; }
        }

        .modal-visual {
          position: relative;
          height: 100%;
        }
        .modal-visual img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }
        .modal-cat-badge {
          position: absolute;
          top: 2rem;
          left: 2rem;
          background: rgba(139, 92, 246, 0.2);
          backdrop-filter: blur(10px);
          padding: 0.6rem 1.2rem;
          border-radius: 12px;
          color: #c084fc;
          font-weight: 800;
          border: 1px solid rgba(139, 92, 246, 0.3);
          font-size: 0.8rem;
          text-transform: uppercase;
        }

        .modal-text {
          padding: 3rem;
          display: flex;
          flex-direction: column;
          overflow-y: auto;
        }
        .modal-title {
          font-size: 2.25rem;
          font-weight: 800;
          margin-bottom: 1rem;
          line-height: 1.2;
        }
        .modal-chips {
          display: flex;
          gap: 1rem;
          margin-bottom: 2rem;
        }
        .chip {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          background: rgba(255, 255, 255, 0.05);
          padding: 0.4rem 0.8rem;
          border-radius: 8px;
          font-size: 0.8rem;
          color: rgba(255, 255, 255, 0.6);
          font-weight: 600;
        }

        .scroll-area {
          flex: 1;
          margin-bottom: 2rem;
        }
        .detail-section {
          margin-bottom: 2rem;
        }
        .detail-section h4 {
          color: #c084fc;
          margin-bottom: 0.75rem;
          font-size: 1rem;
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }
        .detail-section p {
          color: rgba(255, 255, 255, 0.7);
          line-height: 1.8;
          font-size: 1.05rem;
        }

        .steps-list {
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }
        .step-item {
          display: flex;
          gap: 1rem;
          background: rgba(255, 255, 255, 0.02);
          padding: 1rem;
          border-radius: 12px;
          border: 1px solid rgba(255, 255, 255, 0.05);
          color: rgba(255, 255, 255, 0.8);
        }
        .step-num {
          width: 24px;
          height: 24px;
          background: #8b5cf6;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 0.8rem;
          font-weight: 800;
          flex-shrink: 0;
        }

        .modal-actions {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 1rem;
          margin-top: auto;
        }
        .action-btn {
          padding: 1.1rem;
          border-radius: 16px;
          font-weight: 700;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.75rem;
          cursor: pointer;
          transition: all 0.3s ease;
          border: none;
          text-decoration: none;
          font-size: 0.95rem;
        }
        .action-btn.website {
          background: rgba(255, 255, 255, 0.05);
          color: white;
          border: 1px solid rgba(255, 255, 255, 0.1);
        }
        .action-btn.website:hover { background: rgba(255, 255, 255, 0.1); }
        .action-btn.apply {
          background: linear-gradient(135deg, #a855f7, #3b82f6);
          color: white;
          box-shadow: 0 10px 20px rgba(139, 92, 246, 0.3);
        }
        .action-btn.apply:hover { transform: translateY(-3px); box-shadow: 0 15px 30px rgba(139, 92, 246, 0.5); }

        /* Animations */
        .animate-fade-in { animation: fadeIn 0.5s ease-out forwards; }
        .animate-slide-up { animation: slideUp 0.6s cubic-bezier(0.2, 0.8, 0.2, 1) forwards; }
        .animate-modal-in { animation: modalIn 0.4s cubic-bezier(0.34, 1.56, 0.64, 1) forwards; }

        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        @keyframes slideUp { from { transform: translateY(40px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
        @keyframes modalIn { from { transform: scale(0.9) translateY(20px); opacity: 0; } to { transform: scale(1) translateY(0); opacity: 1; } }
      `}</style>
    </div>
  );
}

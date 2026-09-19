'use client';
import { useState, useRef, useEffect } from 'react';
import './CivicImpactGallery.css';
import { useLanguage } from '@/context/LanguageContext';

const slidesData = [
  {
    id: 1,
    title: "Pothole on Main Road",
    location: "Karol Bagh, Delhi",
    date: "Resolved on 03 Apr 2024",
    beforeImage: "/civicimpact1.png",
    afterImage: "/civicimpact3.png",
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>
      </svg>
    )
  },
  {
    id: 2,
    title: "Street Light Repair",
    location: "Sector 15, Noida",
    date: "Resolved on 12 May 2024",
    beforeImage: "/civicimpact4.png",
    afterImage: "/civicimpact5.png",
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M9 18h6M10 22h4M12 2v1M12 7v1"/>
      </svg>
    )
  },
  {
    id: 3,
    title: "Clean & Green Drive",
    location: "Indore, Madhya Pradesh",
    date: "Resolved on 28 Apr 2024",
    beforeImage: "/civicimpact6.png",
    afterImage: "/civicimpact7.png",
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
      </svg>
    )
  }
];

export default function CivicImpactGallery() {
  const { t } = useLanguage();
  const [activeIdx, setActiveIdx] = useState(1);
  const [sliderPos, setSliderPos] = useState(50);
  
  const handlePrev = () => {
    setActiveIdx((prev) => (prev === 0 ? slidesData.length - 1 : prev - 1));
    setSliderPos(50);
  };

  const handleNext = () => {
    setActiveIdx((prev) => (prev === slidesData.length - 1 ? 0 : prev + 1));
    setSliderPos(50);
  };

  const handleSliderChange = (e) => {
    setSliderPos(e.target.value);
  };

  return (
    <div className="civic-gallery-section">
      <div className="gallery-header-box">
        <div className="gallery-pill">{t('gallery.pill')}</div>
        <h2 className="gallery-title">{t('gallery.titlePrefix')}<span>{t('gallery.titleSuffix')}</span></h2>
        <p className="gallery-subtitle">{t('gallery.subtitle')}</p>
      </div>

      <div className="carousel-container">
        <button className="nav-btn prev-btn" onClick={handlePrev}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M15 18l-6-6 6-6"/>
          </svg>
        </button>

        <div className="slides-wrapper">
          {slidesData.map((slide, index) => {
            let positionClass = 'slide-hidden';
            if (index === activeIdx) positionClass = 'slide-active';
            else if (index === activeIdx - 1 || (activeIdx === 0 && index === slidesData.length - 1)) positionClass = 'slide-prev';
            else if (index === activeIdx + 1 || (activeIdx === slidesData.length - 1 && index === 0)) positionClass = 'slide-next';

            return (
              <div key={slide.id} className={`gallery-slide ${positionClass}`}>
                {index === activeIdx ? (
                  <div className="before-after-container">
                    <img src={slide.afterImage} alt="After" className="img-base after-img" />
                    
                    <div className="img-overlay before-img-wrapper" style={{ clipPath: `inset(0 ${100 - sliderPos}% 0 0)` }}>
                      <img src={slide.beforeImage} alt="Before" className="img-overlay-img" />
                      <div className="label-badge label-before">{t('gallery.before')}</div>
                    </div>
                    
                    <div className="label-badge label-after">{t('gallery.after')}</div>

                    <input 
                      type="range" 
                      min="0" 
                      max="100" 
                      value={sliderPos} 
                      onChange={handleSliderChange}
                      className="slider-input"
                    />
                    
                    <div className="slider-line" style={{ left: `${sliderPos}%` }}>
                      <div className="slider-handle">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M15 18l-6-6 6-6 M9 18l6-6-6-6" />
                        </svg>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="inactive-slide-container">
                    <img src={positionClass === 'slide-prev' ? slide.beforeImage : slide.afterImage} alt="Slide" className="img-base" />
                    <div className="label-badge label-before">{positionClass === 'slide-prev' ? t('gallery.before') : t('gallery.after')}</div>
                    <div className="dark-overlay"></div>
                  </div>
                )}

                <div className="slide-info-card">
                  <div className="slide-icon">{slide.icon}</div>
                  <div className="slide-text">
                    <h4>{slide.title}</h4>
                    <p className="location">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg>
                      {slide.location}
                    </p>
                    <p className="date">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>
                      {slide.date}
                    </p>
                  </div>
                  {index === activeIdx && (
                    <div className="resolved-badge">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><polyline points="20 6 9 17 4 12"></polyline></svg>
                      {t('gallery.resolved')}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        <button className="nav-btn next-btn" onClick={handleNext}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M9 18l6-6-6-6"/>
          </svg>
        </button>
      </div>

      <div className="pagination-dots">
        {slidesData.map((_, idx) => (
          <div key={idx} className={`dot ${idx === activeIdx ? 'active' : ''}`} onClick={() => {setActiveIdx(idx); setSliderPos(50);}}></div>
        ))}
        <div className="dot"></div>
        <div className="dot"></div>
      </div>

      <div className="gallery-stats-bar">
        <div className="stat-item">
          <div className="stat-icon-wrapper purple"><svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg></div>
          <div>
            <h3>1,248+</h3>
            <p>{t('gallery.issuesReported')}</p>
          </div>
        </div>
        <div className="stat-item">
          <div className="stat-icon-wrapper blue"><svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg></div>
          <div>
            <h3>892+</h3>
            <p>{t('gallery.issuesResolved')}</p>
          </div>
        </div>
        <div className="stat-item">
          <div className="stat-icon-wrapper purple"><svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg></div>
          <div>
            <h3>50,000+</h3>
            <p>{t('gallery.activeCitizens')}</p>
          </div>
        </div>
        <div className="stat-item">
          <div className="stat-icon-wrapper pink"><svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon></svg></div>
          <div>
            <h3>95%</h3>
            <p>{t('gallery.satisfactionRate')}</p>
          </div>
        </div>
      </div>
    </div>
  );
}

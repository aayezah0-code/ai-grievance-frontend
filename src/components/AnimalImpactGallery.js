'use client';
import { useState, useRef, useEffect } from 'react';
import './AnimalImpactGallery.css';
import { useLanguage } from '@/context/LanguageContext';
import { Heart, Shield, Activity, Users, Star, Dog, Cat, Stethoscope, MapPin } from 'lucide-react';

const slidesData = [
  {
    id: 1,
    title: "Rescued & Rehabilitated",
    location: "South Delhi, India",
    date: "Recovered on 15 Apr 2024",
    beforeImage: "/animalgallery1.png",
    afterImage: "/animalgallery4.png",
    icon: <Dog size={24} />
  },
  {
    id: 2,
    title: "Sick Cat Recovered",
    location: "Bandra, Mumbai",
    date: "Recovered on 12 May 2024",
    beforeImage: "/animalgallery2.png",
    afterImage: "/animalgallery2.png", // Using same as placeholder if pair not clear
    icon: <Cat size={24} />
  },
  {
    id: 3,
    title: "Injured Puppy Saved",
    location: "Indiranagar, Bangalore",
    date: "Recovered on 28 Apr 2024",
    beforeImage: "/animalgallery3.png",
    afterImage: "/animalgallery3.png", // Using same as placeholder
    icon: <Heart size={24} />
  },
  {
    id: 4,
    title: "Malnourished Calf Recovered",
    location: "Pune, Maharashtra",
    date: "Recovered on 05 May 2024",
    beforeImage: "/animalgallery4.png",
    afterImage: "/animalgallery1.png", // Swapped for demo
    icon: <Stethoscope size={24} />
  }
];

export default function AnimalImpactGallery() {
  const { t } = useLanguage();
  const [activeIdx, setActiveIdx] = useState(0);
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
    <div className="civic-gallery-section animal-gallery-section">
      <div className="gallery-header-box">
        <div className="gallery-pill">EVERY ANIMAL MATTERS GALLERY</div>
        <h2 className="gallery-title">Every Animal Matters. <span>Every Life Counts.</span></h2>
        <p className="gallery-subtitle">A glimpse of rescued, healed and rehabilitated animals helped through our platform.</p>
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
                      <div className="label-badge label-before">BEFORE</div>
                    </div>
                    
                    <div className="label-badge label-after">AFTER</div>

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
                    <div className="label-badge label-before">{positionClass === 'slide-prev' ? 'BEFORE' : 'AFTER'}</div>
                    <div className="dark-overlay"></div>
                  </div>
                )}

                <div className="slide-info-card">
                  <div className="slide-icon">{slide.icon}</div>
                  <div className="slide-text">
                    <h4>{slide.title}</h4>
                    <p className="location">
                      <MapPin size={14} />
                      {slide.location}
                    </p>
                    <p className="date">
                      <Activity size={14} />
                      {slide.date}
                    </p>
                  </div>
                  {index === activeIdx && (
                    <div className="resolved-badge">
                      <Shield size={16} />
                      Rescued
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
      </div>

      <div className="gallery-stats-bar">
        <div className="stat-item">
          <div className="stat-icon-wrapper purple"><Heart size={24} /></div>
          <div>
            <h3>312+</h3>
            <p>Animals Saved</p>
          </div>
        </div>
        <div className="stat-item">
          <div className="stat-icon-wrapper blue"><Shield size={24} /></div>
          <div>
            <h3>24</h3>
            <p>Verified NGOs</p>
          </div>
        </div>
        <div className="stat-item">
          <div className="stat-icon-wrapper purple"><Users size={24} /></div>
          <div>
            <h3>147</h3>
            <p>Volunteers</p>
          </div>
        </div>
        <div className="stat-item">
          <div className="stat-icon-wrapper pink"><Star size={24} /></div>
          <div>
            <h3>98%</h3>
            <p>Survival Rate</p>
          </div>
        </div>
      </div>
    </div>
  );
}

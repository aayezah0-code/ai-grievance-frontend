'use client';
import Link from 'next/link';
import { useLanguage } from '@/context/LanguageContext';
import ProjectMonitor from '@/components/ProjectMonitor';

export default function Home() {
  const { t, language, changeLanguage } = useLanguage();
  return (
    <>
      <div className="hero-bg"></div>

      {/* Top Navbar */}
      <nav className="glass-nav" style={{ padding: '0.75rem 4rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div style={{ width: '36px', height: '36px', background: 'linear-gradient(135deg, #8b5cf6, #3b82f6)', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: '1.2rem', boxShadow: '0 0 15px rgba(139, 92, 246, 0.4)' }}>
            ⊞
          </div>
          <span style={{ fontSize: '1.5rem', fontWeight: 800, letterSpacing: '-0.5px', color: 'white' }}>CitizenConnect</span>
        </div>
        
        <div style={{ display: 'flex', gap: '2.5rem', fontSize: '0.95rem', fontWeight: 500, position: 'absolute', left: '50%', transform: 'translateX(-50%)' }}>
          <Link href="/" style={{ color: 'white', textDecoration: 'none', position: 'relative' }}>
            {t('sidebar.dashboard')}
            <span style={{ position: 'absolute', bottom: '-4px', left: 0, right: 0, height: '2px', background: '#8b5cf6', borderRadius: '2px' }}></span>
          </Link>
          <Link href="/about" className="nav-link">{t('sidebar.support')}</Link>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
          <button style={{ background: 'transparent', border: 'none', color: 'white', cursor: 'pointer', fontSize: '1.1rem' }}>☀</button>
          <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
            <select 
              value={language} 
              onChange={(e) => changeLanguage(e.target.value)}
              style={{ 
                background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: 'white', 
                padding: '0.4rem 0.8rem', borderRadius: '8px', cursor: 'pointer', outline: 'none', fontSize: '0.85rem'
              }}
            >
              <option value="en" style={{background: '#0f172a'}}>EN</option>
              <option value="hi" style={{background: '#0f172a'}}>HI</option>
              <option value="mr" style={{background: '#0f172a'}}>MR</option>
              <option value="gu" style={{background: '#0f172a'}}>GU</option>
              <option value="ta" style={{background: '#0f172a'}}>TA</option>
              <option value="ml" style={{background: '#0f172a'}}>ML</option>
              <option value="ur" style={{background: '#0f172a'}}>UR</option>
            </select>
          </div>
          <Link href="/login" style={{ color: 'white', textDecoration: 'none', fontSize: '0.95rem', fontWeight: 500 }}>{t('auth.login')}</Link>
          <Link href="/signup" style={{ background: 'linear-gradient(135deg, #8b5cf6, #6366f1)', padding: '0.6rem 1.75rem', borderRadius: '999px', color: 'white', textDecoration: 'none', fontSize: '0.95rem', fontWeight: 600, boxShadow: '0 5px 15px rgba(139, 92, 246, 0.3)' }}>{t('auth.register')}</Link>
        </div>
      </nav>

      {/* Main Content Container */}
      <main style={{ maxWidth: '1400px', margin: '0 auto', padding: '10rem 4rem 4rem', position: 'relative', zIndex: 1 }}>
        
        {/* Hero Section */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.2fr', gap: '2rem', alignItems: 'center', marginBottom: '8rem' }}>
          
          {/* Left: Typography & CTA */}
          <div className="animate-fade-in-up">
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.6rem', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', padding: '0.35rem 1.25rem', borderRadius: '999px', fontSize: '0.85rem', color: 'rgba(255,255,255,0.8)', marginBottom: '2rem', backdropFilter: 'blur(10px)' }}>
              <span style={{ width: '8px', height: '8px', background: '#a78bfa', borderRadius: '50%', boxShadow: '0 0 10px #a78bfa' }}></span>
              {t('dashboard.overview')}
            </div>
            
            <h1 style={{ fontSize: '5rem', letterSpacing: '-2px', marginBottom: '2rem', lineHeight: 1.1 }}>
              {t('socialHelp.heroTitle1')} <br/>
              <span className="text-gradient-purple">{t('socialHelp.heroTitle2')}</span>, <br/>
              {t('socialHelp.heroTitle3')} <span className="text-gradient-blue">{t('socialHelp.heroTitle4')}</span>
            </h1>
            
            <p style={{ fontSize: '1.2rem', color: 'rgba(255,255,255,0.8)', lineHeight: 1.8, marginBottom: '3rem', maxWidth: '540px' }}>
              {t('dashboard.subtitle')}
            </p>
            
            <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'center' }}>
              <Link href="/signup" className="btn-primary">
                {t('dashboard.submit')} <span style={{ fontSize: '1.2rem' }}>→</span>
              </Link>
              <button className="btn-secondary">
                {t('socialHelp.explore')} <span style={{ fontSize: '1.2rem' }}>▷</span>
              </button>
            </div>
          </div>

          {/* Right: Monitor Mockup */}
          <div className="animate-fade-in-up delay-1">
            <ProjectMonitor videoSrc="/videos/ProjectDemo.mp4" />
          </div>
        </div>

        {/* Features Section */}
        <div className="animate-fade-in-up delay-2" style={{ textAlign: 'center', marginBottom: '8rem' }}>
          <h2 style={{ fontSize: '3rem', fontWeight: 800, marginBottom: '1.5rem', color: 'white' }}>{t('socialHelp.category')}</h2>
          <div style={{ width: '100px', height: '5px', background: 'linear-gradient(to right, #8b5cf6, #3b82f6)', margin: '0 auto 5rem', borderRadius: '5px' }}></div>
          
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '2.5rem', textAlign: 'left' }}>
            
            {/* Feature 1 */}
            <div className="feature-card">
              <div className="feature-icon-wrapper">📝</div>
              <h3>{t('sidebar.myComplaints')}</h3>
              <p className="feature-desc">{t('dashboard.reportIssue')}</p>
              <Link href="/my-complaints" className="feature-arrow">→</Link>
            </div>

            {/* Feature 2 */}
            <div className="feature-card">
              <div className="feature-icon-wrapper">🤖</div>
              <h3>{t('dashboard.aiLanguageSupport')}</h3>
              <p className="feature-desc">{t('dashboard.aiLanguageSubtitle')}</p>
              <Link href="/dashboard" className="feature-arrow">→</Link>
            </div>

            {/* Feature 3 */}
            <div className="feature-card">
              <div className="feature-icon-wrapper">📍</div>
              <h3>{t('dashboard.selectLocation')}</h3>
              <p className="feature-desc">{t('dashboard.locationSubtitle')}</p>
              <Link href="/dashboard" className="feature-arrow">→</Link>
            </div>

            {/* Feature 4 */}
            <div className="feature-card">
              <div className="feature-icon-wrapper">🏛️</div>
              <h3>{t('sidebar.govSchemes')}</h3>
              <p className="feature-desc">{t('schemes.subtitle')}</p>
              <Link href="/schemes" className="feature-arrow">→</Link>
            </div>

            {/* Feature 5 */}
            <div className="feature-card">
              <div className="feature-icon-wrapper">🔔</div>
              <h3>{t('sidebar.notifications')}</h3>
              <p className="feature-desc">{t('notifications.subtitle')}</p>
              <Link href="/notifications" className="feature-arrow">→</Link>
            </div>

            {/* Feature 6 */}
            <div className="feature-card">
              <div className="feature-icon-wrapper">⭐</div>
              <h3>{t('sidebar.donations')}</h3>
              <p className="feature-desc">{t('donations.subtitle')}</p>
              <Link href="/donations" className="feature-arrow">→</Link>
            </div>
          </div>
        </div>

        {/* Footer Stats Banner */}
        <div className="glass-panel animate-fade-in-up delay-3" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '3.5rem 5rem', borderRadius: '40px' }}>
          <div className="stats-banner-item">
            <div className="stats-banner-icon">👥</div>
            <div>
              <div style={{ fontSize: '2rem', fontWeight: 800, color: 'white' }}>50+</div>
              <div style={{ fontSize: '1rem', color: 'rgba(255,255,255,0.7)' }}>Cities Connected</div>
            </div>
          </div>
          <div className="stats-banner-item">
            <div className="stats-banner-icon">✓</div>
            <div>
              <div style={{ fontSize: '2rem', fontWeight: 800, color: 'white' }}>12,482+</div>
              <div style={{ fontSize: '1rem', color: 'rgba(255,255,255,0.7)' }}>Issues Resolved</div>
            </div>
          </div>
          <div className="stats-banner-item">
            <div className="stats-banner-icon">⏱</div>
            <div>
              <div style={{ fontSize: '2rem', fontWeight: 800, color: 'white' }}>48 hrs</div>
              <div style={{ fontSize: '1rem', color: 'rgba(255,255,255,0.7)' }}>Avg. Resolution</div>
            </div>
          </div>
          <div className="stats-banner-item">
            <div className="stats-banner-icon">😊</div>
            <div>
              <div style={{ fontSize: '2rem', fontWeight: 800, color: 'white' }}>98%</div>
              <div style={{ fontSize: '1rem', color: 'rgba(255,255,255,0.7)' }}>Satisfaction Rate</div>
            </div>
          </div>
        </div>

      </main>
    </>
  );
}

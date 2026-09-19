'use client';
import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

import ParticleBackground from '@/components/ParticleBackground';
import { useLanguage } from '@/context/LanguageContext';
import { useUser } from '@/context/UserContext';

export default function LoginPage() {
  const router = useRouter();
  const { t } = useLanguage();
  const { updateUser } = useUser();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      
      const data = await response.json();
      
      if (response.ok) {
        updateUser(data);
        router.push('/dashboard');
      } else {
        alert(data.detail || t('auth.loginFailed'));
      }
    } catch (error) {
      alert(t('auth.serverError'));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="auth-page animate-fade-in-up">
      <ParticleBackground />
      <div className="auth-bg"></div>
      
      <div className="auth-panel">
        <div className="auth-header">
          <div className="auth-logo">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="3" width="7" height="7" rx="1"></rect>
              <rect x="14" y="3" width="7" height="7" rx="1"></rect>
              <rect x="14" y="14" width="7" height="7" rx="1"></rect>
              <rect x="3" y="14" width="7" height="7" rx="1"></rect>
            </svg>
          </div>
          <h1 className="auth-title">CitizenConnect</h1>
          <h2 className="auth-subtitle" style={{ fontSize: '1rem', color: 'white' }}>{t('auth.welcomeBack')}</h2>
        </div>

        <form onSubmit={handleLogin}>
          <div className="auth-input-group">
            <input 
              type="email" 
              className="auth-input" 
              placeholder={t('auth.email')} 
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <span className="auth-icon">✉</span>
          </div>

          <div className="auth-input-group">
            <input 
              type={showPassword ? "text" : "password"}
              className="auth-input" 
              placeholder={t('auth.password')} 
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <span className="auth-icon">🔒</span>
            <span 
              className="auth-icon-right" 
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? '👁️' : '🙈'}
            </span>
          </div>

          <div className="auth-options">
            <label className="auth-checkbox-label">
              <input type="checkbox" className="auth-checkbox" />
              {t('auth.rememberMe')}
            </label>
            <Link href="#" className="auth-link">{t('auth.forgotPassword')}</Link>
          </div>

          <button type="submit" className="auth-btn" disabled={isLoading}>
            {isLoading ? t('auth.loggingIn') : t('auth.login')} <span>&rarr;</span>
          </button>
        </form>

        <div className="auth-divider">{t('auth.orContinueWith')}</div>

        <div className="social-grid">
          <button className="social-btn">
            <span style={{ color: '#ea4335', fontWeight: 'bold' }}>G</span> {t('auth.google')}
          </button>
          <button className="social-btn">
            <span style={{ color: '#1877f2', fontWeight: 'bold' }}>f</span> {t('auth.facebook')}
          </button>
        </div>

        <div className="auth-footer">
          {t('auth.noAccount')} <Link href="/signup" className="auth-link">{t('auth.register')}</Link>
        </div>
      </div>
    </div>
  );
}

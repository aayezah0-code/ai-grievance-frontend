'use client';
import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

import ParticleBackground from '@/components/ParticleBackground';
import { useLanguage } from '@/context/LanguageContext';
import { useUser } from '@/context/UserContext';

export default function SignupPage() {
  const router = useRouter();
  const { t } = useLanguage();
  const { updateUser } = useUser();
  const [formData, setFormData] = useState({
    fullName: '',
    mobileNo: '',
    email: '',
    address: '',
    city: '',
    state: '',
    pincode: '',
    password: '',
    confirmPassword: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    
    if (formData.password !== formData.confirmPassword) {
      alert(t('auth.passwordsDoNotMatch'));
      return;
    }

    setIsLoading(true);
    
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/api/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          full_name: formData.fullName,
          mobile_no: formData.mobileNo,
          email: formData.email,
          address: formData.address,
          city: formData.city,
          state: formData.state,
          pincode: formData.pincode,
          password: formData.password
        })
      });
      
      const data = await response.json();
      
      if (response.ok) {
        alert(data.message || 'Registration successful! Please check your email for a 6-digit verification code.');
        const emailEncoded = encodeURIComponent(data.email || formData.email);
        router.push('/verify-email?email=' + emailEncoded);
      } else {
        const detailMsg = data.detail || t('auth.registrationFailed');
        if (detailMsg.toLowerCase().includes('already registered and verified') || detailMsg.toLowerCase().includes('login page')) {
          if (confirm(`${detailMsg}\n\nWould you like to go to the Login page now?`)) {
            router.push('/login');
            return;
          }
        }
        alert(detailMsg);
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
      
      <div className="auth-panel wide">
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
          <h2 className="auth-subtitle" style={{ fontSize: '1rem', color: 'white' }}>{t('auth.createAccount')}</h2>
        </div>

        <form onSubmit={handleRegister}>
          <div className="auth-input-group">
            <input 
              type="text" 
              name="fullName"
              className="auth-input" 
              placeholder={t('auth.fullName')} 
              required
              value={formData.fullName}
              onChange={handleChange}
            />
            <span className="auth-icon">👤</span>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
            <div className="auth-input-group" style={{ marginBottom: 0 }}>
              <input 
                type="tel" 
                name="mobileNo"
                className="auth-input" 
                placeholder={t('auth.mobileNo')} 
                required
                value={formData.mobileNo}
                onChange={handleChange}
              />
              <span className="auth-icon">📞</span>
            </div>
            <div className="auth-input-group" style={{ marginBottom: 0 }}>
              <input 
                type="email" 
                name="email"
                className="auth-input" 
                placeholder={t('auth.email')} 
                required
                value={formData.email}
                onChange={handleChange}
              />
              <span className="auth-icon">✉</span>
            </div>
          </div>

          <div className="auth-input-group">
            <input 
              type="text" 
              name="address"
              className="auth-input" 
              placeholder={t('auth.address')} 
              required
              value={formData.address}
              onChange={handleChange}
            />
            <span className="auth-icon">📍</span>
          </div>

          {/* Grid for City, State, Pincode */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
            <div className="auth-input-group" style={{ marginBottom: 0 }}>
              <input type="text" name="city" className="auth-input" placeholder={t('auth.city')} required value={formData.city} onChange={handleChange} />
              <span className="auth-icon">🏙️</span>
            </div>
            <div className="auth-input-group" style={{ marginBottom: 0 }}>
              <input type="text" name="state" className="auth-input" placeholder={t('auth.state')} required value={formData.state} onChange={handleChange} />
              <span className="auth-icon">🗺️</span>
            </div>
            <div className="auth-input-group" style={{ marginBottom: 0 }}>
              <input type="text" name="pincode" className="auth-input" placeholder={t('auth.pincode')} required value={formData.pincode} onChange={handleChange} />
              <span className="auth-icon">📮</span>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.5rem' }}>
            <div className="auth-input-group" style={{ marginBottom: 0 }}>
              <input 
                type={showPassword ? "text" : "password"}
                name="password"
                className="auth-input" 
                placeholder={t('auth.password')} 
                required
                value={formData.password}
                onChange={handleChange}
              />
              <span className="auth-icon">🔒</span>
              <span className="auth-icon-right" onClick={() => setShowPassword(!showPassword)}>
                {showPassword ? '👁️' : '🙈'}
              </span>
            </div>
            <div className="auth-input-group" style={{ marginBottom: 0 }}>
              <input 
                type={showConfirmPassword ? "text" : "password"}
                name="confirmPassword"
                className="auth-input" 
                placeholder={t('auth.confirm')} 
                required
                value={formData.confirmPassword}
                onChange={handleChange}
              />
              <span className="auth-icon">🔒</span>
              <span className="auth-icon-right" onClick={() => setShowConfirmPassword(!showConfirmPassword)}>
                {showConfirmPassword ? '👁️' : '🙈'}
              </span>
            </div>
          </div>

          <button type="submit" className="auth-btn" disabled={isLoading}>
            {isLoading ? t('auth.registering') : t('auth.register')} <span>&rarr;</span>
          </button>
        </form>

        <div className="auth-footer" style={{ marginTop: '1.5rem' }}>
          {t('auth.haveAccount')} <Link href="/login" className="auth-link">{t('auth.login')}</Link>
        </div>
      </div>
    </div>
  );
}

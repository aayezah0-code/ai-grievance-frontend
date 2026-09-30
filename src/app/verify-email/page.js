'use client';
import { useState, useEffect, useRef } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import ParticleBackground from '@/components/ParticleBackground';

const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

function maskEmail(email) {
  if (!email) return '';
  const [local, domain] = email.split('@');
  if (!local || !domain) return email;
  const visible = local.charAt(0);
  const masked = '*'.repeat(Math.max(local.length - 1, 3));
  return visible + masked + '@' + domain;
}

export default function VerifyEmailPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialEmail = searchParams.get('email') || '';

  const [email, setEmail] = useState(initialEmail);
  const [digits, setDigits] = useState(['', '', '', '', '', '']);
  const [status, setStatus] = useState('idle'); // idle | loading | success | error
  const [message, setMessage] = useState('');
  const [resendStatus, setResendStatus] = useState('idle'); // idle | sending | sent | error
  const [resendMsg, setResendMsg] = useState('');
  const [resendCooldown, setResendCooldown] = useState(0);

  const inputRefs = useRef([]);

  // Countdown timer for resend
  useEffect(() => {
    if (resendCooldown <= 0) return;
    const timer = setTimeout(() => setResendCooldown(prev => prev - 1), 1000);
    return () => clearTimeout(timer);
  }, [resendCooldown]);

  function handleDigitChange(idx, value) {
    const char = value.replace(/\D/g, '').slice(-1);
    const next = [...digits];
    next[idx] = char;
    setDigits(next);
    if (char && idx < 5) {
      inputRefs.current[idx + 1]?.focus();
    }
  }

  function handleDigitKeyDown(idx, e) {
    if (e.key === 'Backspace' && !digits[idx] && idx > 0) {
      inputRefs.current[idx - 1]?.focus();
    }
  }

  function handleDigitPaste(e) {
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    if (pasted.length === 6) {
      setDigits(pasted.split(''));
      inputRefs.current[5]?.focus();
      e.preventDefault();
    }
  }

  async function handleVerify(e) {
    e.preventDefault();
    const code = digits.join('');
    if (code.length !== 6) {
      setMessage('Please enter the complete 6-digit code.');
      setStatus('error');
      return;
    }
    setStatus('loading');
    setMessage('');
    try {
      const res = await fetch(API + '/api/auth/verify-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, code })
      });
      const data = await res.json();
      if (res.ok) {
        setStatus('success');
        setMessage(data.message || 'Email verified successfully!');
      } else {
        setStatus('error');
        setMessage(data.detail || 'Verification failed.');
        setDigits(['', '', '', '', '', '']);
        inputRefs.current[0]?.focus();
      }
    } catch {
      setStatus('error');
      setMessage('Network error. Please try again.');
    }
  }

  async function handleResend() {
    if (resendCooldown > 0) return;
    setResendStatus('sending');
    setResendMsg('');
    try {
      const res = await fetch(API + '/api/auth/resend-verification', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      });
      const data = await res.json();
      if (res.ok) {
        setResendStatus('sent');
        setResendMsg(data.message || 'A new code has been sent.');
        setResendCooldown(60);
      } else {
        setResendStatus('error');
        setResendMsg(data.detail || 'Failed to resend. Please try again.');
      }
    } catch {
      setResendStatus('error');
      setResendMsg('Network error. Please try again.');
    }
  }

  return (
    <div className="auth-page animate-fade-in-up">
      <ParticleBackground />
      <div className="auth-bg"></div>

      <div className="auth-panel" style={{ maxWidth: '460px' }}>
        <div className="auth-header">
          <div className="auth-logo">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07A19.5 19.5 0 013.95 13a19.79 19.79 0 01-3.07-8.67A2 2 0 012.88 2h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L7.09 9.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0122 16.92z"/>
            </svg>
          </div>
          <h1 className="auth-title">Verify Your Email</h1>
          <h2 className="auth-subtitle" style={{ fontSize: '0.95rem', color: 'rgba(255,255,255,0.7)', marginTop: '0.5rem' }}>
            {status === 'success'
              ? 'Your account is verified!'
              : 'We sent a 6-digit code to:'}
          </h2>
          {status !== 'success' && (
            <p style={{ color: 'var(--accent-cyan)', fontWeight: 600, fontSize: '0.95rem', marginTop: '0.35rem' }}>
              {maskEmail(email)}
            </p>
          )}
        </div>

        {status === 'success' ? (
          <div style={{ textAlign: 'center' }}>
            <div style={{
              width: 72, height: 72, borderRadius: '50%',
              background: 'linear-gradient(135deg, #10b981, #059669)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              margin: '0 auto 1.5rem',
              boxShadow: '0 0 30px rgba(16,185,129,0.4)'
            }}>
              <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5">
                <polyline points="20 6 9 17 4 12"/>
              </svg>
            </div>
            <p style={{ color: 'rgba(255,255,255,0.8)', marginBottom: '2rem', lineHeight: 1.6 }}>
              {message}
            </p>
            <button className="auth-btn" onClick={() => router.push('/login')}>
              Continue to Login <span>&rarr;</span>
            </button>
          </div>
        ) : (
          <form onSubmit={handleVerify}>
            {/* OTP Digit Boxes */}
            <div style={{ display: 'flex', gap: '0.6rem', justifyContent: 'center', marginBottom: '1.5rem' }} onPaste={handleDigitPaste}>
              {digits.map((d, i) => (
                <input
                  key={i}
                  ref={el => inputRefs.current[i] = el}
                  type="text"
                  inputMode="numeric"
                  maxLength={1}
                  value={d}
                  onChange={e => handleDigitChange(i, e.target.value)}
                  onKeyDown={e => handleDigitKeyDown(i, e)}
                  style={{
                    width: '52px', height: '60px',
                    textAlign: 'center', fontSize: '1.6rem', fontWeight: 700,
                    background: 'rgba(255,255,255,0.05)',
                    border: `2px solid ${d ? 'var(--accent-purple)' : 'rgba(255,255,255,0.15)'}`,
                    borderRadius: '14px', color: 'white',
                    outline: 'none', caretColor: 'var(--accent-purple)',
                    transition: 'border-color 0.2s, box-shadow 0.2s',
                    boxShadow: d ? '0 0 12px rgba(139,92,246,0.3)' : 'none',
                  }}
                  onFocus={e => e.target.style.borderColor = 'var(--accent-purple)'}
                  onBlur={e => e.target.style.borderColor = d ? 'var(--accent-purple)' : 'rgba(255,255,255,0.15)'}
                />
              ))}
            </div>

            {/* Error/Info Message */}
            {message && (
              <div style={{
                background: status === 'error' ? 'rgba(239,68,68,0.12)' : 'rgba(16,185,129,0.12)',
                border: `1px solid ${status === 'error' ? 'rgba(239,68,68,0.4)' : 'rgba(16,185,129,0.4)'}`,
                borderRadius: '12px', padding: '0.75rem 1rem',
                color: status === 'error' ? '#fca5a5' : '#6ee7b7',
                fontSize: '0.9rem', marginBottom: '1rem', textAlign: 'center'
              }}>
                {message}
              </div>
            )}

            <button type="submit" className="auth-btn" disabled={status === 'loading'}>
              {status === 'loading' ? 'Verifying...' : 'Verify Email'} <span>&rarr;</span>
            </button>

            <div style={{ marginTop: '1.5rem', textAlign: 'center' }}>
              <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.9rem', marginBottom: '0.75rem' }}>
                Didn&apos;t receive the code?
              </p>
              {resendMsg && (
                <p style={{
                  fontSize: '0.85rem', marginBottom: '0.75rem',
                  color: resendStatus === 'error' ? '#fca5a5' : '#6ee7b7'
                }}>
                  {resendMsg}
                </p>
              )}
              <button
                type="button"
                onClick={handleResend}
                disabled={resendCooldown > 0 || resendStatus === 'sending'}
                style={{
                  background: 'transparent', border: 'none', cursor: resendCooldown > 0 ? 'not-allowed' : 'pointer',
                  color: resendCooldown > 0 ? 'rgba(255,255,255,0.3)' : 'var(--accent-cyan)',
                  fontWeight: 600, fontSize: '0.9rem', textDecoration: 'underline', padding: 0
                }}
              >
                {resendStatus === 'sending' ? 'Sending...' :
                  resendCooldown > 0 ? `Resend Code (${resendCooldown}s)` : 'Resend Code'}
              </button>
            </div>
          </form>
        )}

        <div className="auth-footer" style={{ marginTop: '1.5rem', textAlign: 'center' }}>
          <Link href="/login" className="auth-link">
            ← Back to Login
          </Link>
        </div>
      </div>
    </div>
  );
}

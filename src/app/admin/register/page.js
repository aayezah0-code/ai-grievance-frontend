'use client';
import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import ParticleBackground from '@/components/ParticleBackground';
import { Shield, Lock, Mail, User, Key, ArrowRight, ArrowLeft, CheckCircle2, AlertCircle } from 'lucide-react';

export default function AdminRegisterPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
    confirmPassword: '',
    adminCode: 'ADMIN2026'
  });
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const handleChange = (e) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleAdminRegister = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    if (formData.password !== formData.confirmPassword) {
      setErrorMsg('Passwords do not match.');
      return;
    }

    if (formData.password.length < 6) {
      setErrorMsg('Password must be at least 6 characters long.');
      return;
    }

    setIsLoading(true);

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/api/auth/admin/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          full_name: formData.fullName,
          email: formData.email,
          password: formData.password,
          admin_code: formData.adminCode
        })
      });

      const data = await res.json();

      if (res.ok) {
        setSuccessMsg('Administrator account registered successfully! Redirecting to admin login...');
        setTimeout(() => {
          router.push('/admin/login');
        }, 1500);
      } else {
        setErrorMsg(data.detail || 'Registration failed. Please verify the admin code and details.');
      }
    } catch (err) {
      console.error('Admin register error:', err);
      setErrorMsg('Server connection failed. Ensure backend service is active.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="auth-page animate-fade-in-up" style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#070314', position: 'relative', padding: '2rem 1rem' }}>
      <ParticleBackground />
      <div className="auth-bg" style={{ background: 'radial-gradient(circle at 50% 20%, rgba(139, 92, 246, 0.15) 0%, transparent 60%)' }}></div>

      <div className="auth-panel" style={{ width: '100%', maxWidth: '480px', background: 'rgba(15, 10, 30, 0.85)', backdropFilter: 'blur(20px)', border: '1px solid rgba(168, 85, 247, 0.3)', borderRadius: '24px', padding: '2.5rem', boxShadow: '0 20px 50px rgba(0,0,0,0.6)', zIndex: 10 }}>
        
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div style={{ width: '56px', height: '56px', background: 'linear-gradient(135deg, #7c3aed, #4f46e5)', borderRadius: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1rem', boxShadow: '0 0 25px rgba(124, 58, 237, 0.5)' }}>
            <Shield size={30} color="white" />
          </div>
          <div style={{ display: 'inline-block', padding: '0.2rem 0.8rem', background: 'rgba(168, 85, 247, 0.15)', border: '1px solid rgba(168, 85, 247, 0.3)', borderRadius: '999px', fontSize: '0.75rem', fontWeight: 700, color: '#c084fc', textTransform: 'uppercase', letterSpacing: '1.5px', marginBottom: '0.5rem' }}>
            Official Staff Registration
          </div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 900, color: 'white', margin: '0 0 0.25rem' }}>Admin Enrollment</h1>
          <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.85rem', margin: 0 }}>Register a new administrator account</p>
        </div>

        {/* Notifications */}
        {errorMsg && (
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.6rem', padding: '0.85rem 1rem', background: 'rgba(239, 68, 68, 0.12)', border: '1px solid rgba(239, 68, 68, 0.3)', borderRadius: '12px', color: '#fca5a5', fontSize: '0.85rem', marginBottom: '1.5rem', lineHeight: 1.4 }}>
            <AlertCircle size={18} style={{ flexShrink: 0, marginTop: '2px' }} />
            <span>{errorMsg}</span>
          </div>
        )}

        {successMsg && (
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.6rem', padding: '0.85rem 1rem', background: 'rgba(16, 185, 129, 0.12)', border: '1px solid rgba(16, 185, 129, 0.3)', borderRadius: '12px', color: '#6ee7b7', fontSize: '0.85rem', marginBottom: '1.5rem', lineHeight: 1.4 }}>
            <CheckCircle2 size={18} style={{ flexShrink: 0, marginTop: '2px' }} />
            <span>{successMsg}</span>
          </div>
        )}

        <form onSubmit={handleAdminRegister} style={{ display: 'flex', flexDirection: 'column', gap: '1.1rem' }}>
          
          <div className="auth-input-group" style={{ marginBottom: 0 }}>
            <input 
              type="text" 
              name="fullName"
              className="auth-input" 
              placeholder="Admin Full Name" 
              required
              value={formData.fullName}
              onChange={handleChange}
              style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)', color: 'white', padding: '0.85rem 1rem 0.85rem 2.75rem', borderRadius: '12px', width: '100%', fontSize: '0.92rem' }}
            />
            <span className="auth-icon" style={{ left: '1rem', color: 'rgba(255,255,255,0.4)' }}>
              <User size={16} />
            </span>
          </div>

          <div className="auth-input-group" style={{ marginBottom: 0 }}>
            <input 
              type="email" 
              name="email"
              className="auth-input" 
              placeholder="Official Gov / Admin Email" 
              required
              value={formData.email}
              onChange={handleChange}
              style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)', color: 'white', padding: '0.85rem 1rem 0.85rem 2.75rem', borderRadius: '12px', width: '100%', fontSize: '0.92rem' }}
            />
            <span className="auth-icon" style={{ left: '1rem', color: 'rgba(255,255,255,0.4)' }}>
              <Mail size={16} />
            </span>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div className="auth-input-group" style={{ marginBottom: 0 }}>
              <input 
                type="password" 
                name="password"
                className="auth-input" 
                placeholder="Password" 
                required
                value={formData.password}
                onChange={handleChange}
                style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)', color: 'white', padding: '0.85rem 1rem 0.85rem 2.75rem', borderRadius: '12px', width: '100%', fontSize: '0.92rem' }}
              />
              <span className="auth-icon" style={{ left: '1rem', color: 'rgba(255,255,255,0.4)' }}>
                <Lock size={16} />
              </span>
            </div>

            <div className="auth-input-group" style={{ marginBottom: 0 }}>
              <input 
                type="password" 
                name="confirmPassword"
                className="auth-input" 
                placeholder="Confirm" 
                required
                value={formData.confirmPassword}
                onChange={handleChange}
                style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)', color: 'white', padding: '0.85rem 1rem 0.85rem 2.75rem', borderRadius: '12px', width: '100%', fontSize: '0.92rem' }}
              />
              <span className="auth-icon" style={{ left: '1rem', color: 'rgba(255,255,255,0.4)' }}>
                <Lock size={16} />
              </span>
            </div>
          </div>

          <div className="auth-input-group" style={{ marginBottom: 0 }}>
            <input 
              type="text" 
              name="adminCode"
              className="auth-input" 
              placeholder="Admin Security Code (e.g. ADMIN2026)" 
              value={formData.adminCode}
              onChange={handleChange}
              style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)', color: '#c084fc', padding: '0.85rem 1rem 0.85rem 2.75rem', borderRadius: '12px', width: '100%', fontSize: '0.92rem', fontWeight: 600 }}
            />
            <span className="auth-icon" style={{ left: '1rem', color: '#c084fc' }}>
              <Key size={16} />
            </span>
          </div>

          <button 
            type="submit" 
            disabled={isLoading}
            style={{ 
              marginTop: '0.5rem',
              padding: '0.9rem', 
              background: 'linear-gradient(135deg, #8b5cf6, #6366f1)', 
              border: 'none', 
              borderRadius: '12px', 
              color: 'white', 
              fontWeight: 700, 
              fontSize: '0.95rem', 
              cursor: isLoading ? 'not-allowed' : 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.5rem',
              boxShadow: '0 4px 15px rgba(139, 92, 246, 0.4)',
              transition: 'all 0.2s'
            }}
          >
            {isLoading ? 'Creating Administrator Account...' : 'Complete Admin Registration'} <ArrowRight size={18} />
          </button>
        </form>

        <div style={{ marginTop: '2rem', paddingTop: '1.5rem', borderTop: '1px solid rgba(255,255,255,0.08)', display: 'flex', flexDirection: 'column', gap: '0.75rem', textAlign: 'center', fontSize: '0.85rem' }}>
          <div>
            <span style={{ color: 'rgba(255,255,255,0.5)' }}>Already registered as admin? </span>
            <Link href="/admin/login" style={{ color: '#c084fc', textDecoration: 'none', fontWeight: 600 }}>Sign In</Link>
          </div>
          <div>
            <Link href="/" style={{ color: 'rgba(255,255,255,0.4)', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '0.3rem' }}>
              <ArrowLeft size={14} /> Back to Citizen Portal
            </Link>
          </div>
        </div>

      </div>
    </div>
  );
}

'use client';
import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import ParticleBackground from '@/components/ParticleBackground';
import { useUser } from '@/context/UserContext';
import { Shield, Lock, Mail, Eye, EyeOff, AlertCircle, ArrowRight, ArrowLeft } from 'lucide-react';

export default function AdminLoginPage() {
  const router = useRouter();
  const { updateUser } = useUser();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleAdminLogin = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMsg('');

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });

      const data = await res.json();

      if (res.ok) {
        // Backend authorization verification
        if (data.role !== 'admin') {
          setErrorMsg('Access Denied: This portal is restricted to authorized administrators only. Citizen accounts cannot access the admin console.');
          return;
        }

        // Save admin user state
        updateUser(data);
        router.push('/admin');
      } else {
        setErrorMsg(data.detail || 'Invalid administrator credentials. Please check your email and password.');
      }
    } catch (err) {
      console.error('Admin login error:', err);
      setErrorMsg('Cannot connect to authentication service. Ensure the server is running.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="auth-page animate-fade-in-up" style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#070314', position: 'relative' }}>
      <ParticleBackground />
      <div className="auth-bg" style={{ background: 'radial-gradient(circle at 50% 20%, rgba(139, 92, 246, 0.15) 0%, transparent 60%)' }}></div>

      <div className="auth-panel" style={{ width: '100%', maxWidth: '440px', background: 'rgba(15, 10, 30, 0.85)', backdropFilter: 'blur(20px)', border: '1px solid rgba(168, 85, 247, 0.3)', borderRadius: '24px', padding: '2.5rem', boxShadow: '0 20px 50px rgba(0,0,0,0.6)', zIndex: 10 }}>
        
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div style={{ width: '56px', height: '56px', background: 'linear-gradient(135deg, #7c3aed, #4f46e5)', borderRadius: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1rem', boxShadow: '0 0 25px rgba(124, 58, 237, 0.5)' }}>
            <Shield size={30} color="white" />
          </div>
          <div style={{ display: 'inline-block', padding: '0.2rem 0.8rem', background: 'rgba(168, 85, 247, 0.15)', border: '1px solid rgba(168, 85, 247, 0.3)', borderRadius: '999px', fontSize: '0.75rem', fontWeight: 700, color: '#c084fc', textTransform: 'uppercase', letterSpacing: '1.5px', marginBottom: '0.5rem' }}>
            Administrative Console
          </div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 900, color: 'white', margin: '0 0 0.25rem' }}>Admin Access</h1>
          <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.85rem', margin: 0 }}>Sign in with your verified staff credentials</p>
        </div>

        {/* Error notification */}
        {errorMsg && (
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.6rem', padding: '0.85rem 1rem', background: 'rgba(239, 68, 68, 0.12)', border: '1px solid rgba(239, 68, 68, 0.3)', borderRadius: '12px', color: '#fca5a5', fontSize: '0.85rem', marginBottom: '1.5rem', lineHeight: 1.4 }}>
            <AlertCircle size={18} style={{ flexShrink: 0, marginTop: '2px' }} />
            <span>{errorMsg}</span>
          </div>
        )}

        <form onSubmit={handleAdminLogin} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          
          <div className="auth-input-group" style={{ marginBottom: 0 }}>
            <input 
              type="email" 
              className="auth-input" 
              placeholder="Admin Email Address" 
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)', color: 'white', padding: '0.85rem 1rem 0.85rem 2.75rem', borderRadius: '12px', width: '100%', fontSize: '0.92rem' }}
            />
            <span className="auth-icon" style={{ left: '1rem', color: 'rgba(255,255,255,0.4)' }}>
              <Mail size={16} />
            </span>
          </div>

          <div className="auth-input-group" style={{ marginBottom: 0, position: 'relative' }}>
            <input 
              type={showPassword ? "text" : "password"}
              className="auth-input" 
              placeholder="Admin Password" 
              required
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)', color: 'white', padding: '0.85rem 2.75rem 0.85rem 2.75rem', borderRadius: '12px', width: '100%', fontSize: '0.92rem' }}
            />
            <span className="auth-icon" style={{ left: '1rem', color: 'rgba(255,255,255,0.4)' }}>
              <Lock size={16} />
            </span>
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              style={{ position: 'absolute', right: '1rem', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: 'rgba(255,255,255,0.4)', cursor: 'pointer', padding: 0 }}
            >
              {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
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
            {isLoading ? 'Verifying Admin Access...' : 'Sign In as Administrator'} <ArrowRight size={18} />
          </button>
        </form>

        <div style={{ marginTop: '2rem', paddingTop: '1.5rem', borderTop: '1px solid rgba(255,255,255,0.08)', display: 'flex', flexDirection: 'column', gap: '0.75rem', textAlign: 'center', fontSize: '0.85rem' }}>
          <div>
            <span style={{ color: 'rgba(255,255,255,0.5)' }}>New official staff member? </span>
            <Link href="/admin/register" style={{ color: '#c084fc', textDecoration: 'none', fontWeight: 600 }}>Register Admin Account</Link>
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

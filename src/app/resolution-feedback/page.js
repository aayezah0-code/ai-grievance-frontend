'use client';
import { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { CheckCircle2, AlertTriangle, ShieldCheck, ArrowRight, Loader2, Home } from 'lucide-react';
import Link from 'next/link';

const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

function ResolutionFeedbackContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const token = searchParams.get('token');

  const [loading, setLoading] = useState(true);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!token) {
      setLoading(false);
      setError('Invalid or missing confirmation token. Please use the link provided in your email.');
      return;
    }

    const verifyAndRecord = async () => {
      try {
        const res = await fetch(`${API}/api/complaints/email-feedback?token=${encodeURIComponent(token)}`);
        const data = await res.json();

        if (res.ok) {
          setResult(data);
        } else if (res.status === 410) {
          setError('This confirmation link has expired (valid for 72 hours). If your issue persists, please check your Citizen dashboard.');
        } else if (res.status === 401 || res.status === 403) {
          setError('This confirmation link is invalid or unauthorized.');
        } else {
          setError(data.detail || 'Could not process confirmation. Please try again later.');
        }
      } catch (err) {
        console.error('Resolution confirmation error:', err);
        setError('Network error: Unable to reach the server. Please check your connection and try again.');
      } finally {
        setLoading(false);
      }
    };

    verifyAndRecord();
  }, [token]);

  const isSolved = result?.response === 'solved';

  return (
    <div style={{
      minHeight: '100vh',
      background: 'radial-gradient(ellipse at top, #1e1138 0%, #0c071a 70%, #06030d 100%)',
      color: '#f8fafc',
      fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '2rem 1rem'
    }}>
      {/* Brand Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '2rem' }}>
        <div style={{
          width: 44,
          height: 44,
          borderRadius: 14,
          background: 'linear-gradient(135deg, #7c3aed, #a855f7)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: '0 10px 25px rgba(168, 85, 247, 0.4)'
        }}>
          <ShieldCheck size={26} color="#ffffff" />
        </div>
        <div>
          <h1 style={{ margin: 0, fontSize: '1.4rem', fontWeight: 900, letterSpacing: '-0.5px' }}>
            Citizen<span style={{ color: '#c084fc' }}>Connect</span>
          </h1>
          <p style={{ margin: 0, fontSize: '0.75rem', color: 'rgba(255,255,255,0.5)', textTransform: 'uppercase', letterSpacing: '1px' }}>
            Civic Grievance Redressal
          </p>
        </div>
      </div>

      {/* Main Confirmation Card */}
      <div style={{
        width: '100%',
        maxWidth: '540px',
        background: 'rgba(255, 255, 255, 0.03)',
        backdropFilter: 'blur(20px)',
        border: '1px solid rgba(255, 255, 255, 0.1)',
        borderRadius: '24px',
        padding: '2.5rem',
        boxShadow: '0 25px 60px rgba(0,0,0,0.6), 0 0 40px rgba(168, 85, 247, 0.08)',
        textAlign: 'center'
      }}>
        {loading ? (
          <div style={{ padding: '2rem 0', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1.25rem' }}>
            <Loader2 className="animate-spin" size={48} color="#a855f7" />
            <h2 style={{ fontSize: '1.25rem', fontWeight: 700, margin: 0 }}>
              Verifying Your Response...
            </h2>
            <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.9rem', margin: 0 }}>
              Connecting with municipal records...
            </p>
          </div>
        ) : error ? (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1.25rem' }}>
            <div style={{
              width: 72,
              height: 72,
              borderRadius: '50%',
              background: 'rgba(239, 68, 68, 0.12)',
              border: '1px solid rgba(239, 68, 68, 0.3)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: '0.5rem'
            }}>
              <AlertTriangle size={36} color="#ef4444" />
            </div>
            <h2 style={{ fontSize: '1.4rem', fontWeight: 800, margin: 0, color: '#fca5a5' }}>
              Confirmation Notice
            </h2>
            <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.95rem', lineHeight: 1.6, margin: 0 }}>
              {error}
            </p>
            <div style={{ marginTop: '1.5rem', display: 'flex', gap: '0.75rem', width: '100%', justifyContent: 'center' }}>
              <Link
                href="/my-complaints"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  background: 'rgba(255,255,255,0.08)',
                  border: '1px solid rgba(255,255,255,0.15)',
                  color: '#ffffff',
                  padding: '0.75rem 1.25rem',
                  borderRadius: '12px',
                  textDecoration: 'none',
                  fontWeight: 700,
                  fontSize: '0.9rem'
                }}
              >
                Go to My Complaints <ArrowRight size={16} />
              </Link>
            </div>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1.25rem' }}>
            {/* Status Icon Badge */}
            <div style={{
              width: 76,
              height: 76,
              borderRadius: '50%',
              background: isSolved ? 'rgba(16, 185, 129, 0.15)' : 'rgba(239, 68, 68, 0.15)',
              border: `1px solid ${isSolved ? 'rgba(16, 185, 129, 0.4)' : 'rgba(239, 68, 68, 0.4)'}`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: isSolved ? '0 0 30px rgba(16, 185, 129, 0.2)' : '0 0 30px rgba(239, 68, 68, 0.2)'
            }}>
              {isSolved ? (
                <CheckCircle2 size={42} color="#10b981" />
              ) : (
                <AlertTriangle size={42} color="#ef4444" />
              )}
            </div>

            {/* Title & Tag */}
            <div>
              <div style={{
                display: 'inline-block',
                padding: '4px 12px',
                borderRadius: '8px',
                background: isSolved ? 'rgba(16, 185, 129, 0.15)' : 'rgba(239, 68, 68, 0.15)',
                color: isSolved ? '#34d399' : '#f87171',
                fontSize: '0.75rem',
                fontWeight: 800,
                textTransform: 'uppercase',
                letterSpacing: '1px',
                marginBottom: '0.5rem'
              }}>
                {isSolved ? 'Issue Confirmed Solved' : 'Issue Reported As Unresolved'}
              </div>
              <h2 style={{ fontSize: '1.5rem', fontWeight: 800, margin: 0 }}>
                {isSolved ? 'Thank You For Confirming!' : 'Response Recorded'}
              </h2>
            </div>

            {/* Description Text */}
            <p style={{
              color: 'rgba(255,255,255,0.75)',
              fontSize: '0.98rem',
              lineHeight: 1.6,
              margin: 0,
              maxWidth: '460px'
            }}>
              {isSolved
                ? 'Your complaint has been marked as resolved according to your confirmation. Thank you for helping keep our civic infrastructure functional.'
                : 'Your feedback has been recorded. The municipal administration has been notified that the issue is still unresolved and requires follow-up.'}
            </p>

            {/* Complaint Badge */}
            {result?.complaint_id && (
              <div style={{
                padding: '0.6rem 1.25rem',
                background: 'rgba(255,255,255,0.04)',
                border: '1px solid rgba(255,255,255,0.08)',
                borderRadius: '12px',
                fontSize: '0.85rem',
                color: 'rgba(255,255,255,0.6)'
              }}>
                Reference: <strong style={{ color: '#ffffff' }}>Complaint #{result.complaint_id}</strong>
              </div>
            )}

            {/* Action Buttons */}
            <div style={{ marginTop: '1.5rem', display: 'flex', gap: '0.75rem', width: '100%', justifyContent: 'center', flexWrap: 'wrap' }}>
              <Link
                href="/my-complaints"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  background: 'linear-gradient(135deg, #7c3aed, #9333ea)',
                  color: '#ffffff',
                  padding: '0.75rem 1.5rem',
                  borderRadius: '12px',
                  textDecoration: 'none',
                  fontWeight: 700,
                  fontSize: '0.9rem',
                  boxShadow: '0 10px 25px rgba(124, 58, 237, 0.35)'
                }}
              >
                View My Complaints <ArrowRight size={16} />
              </Link>
              <Link
                href="/"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  background: 'rgba(255,255,255,0.06)',
                  border: '1px solid rgba(255,255,255,0.12)',
                  color: '#ffffff',
                  padding: '0.75rem 1.25rem',
                  borderRadius: '12px',
                  textDecoration: 'none',
                  fontWeight: 700,
                  fontSize: '0.9rem'
                }}
              >
                <Home size={16} /> Home
              </Link>
            </div>
          </div>
        )}
      </div>

      <style jsx>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
        .animate-spin {
          animation: spin 1s linear infinite;
        }
      `}</style>
    </div>
  );
}

export default function ResolutionFeedbackPage() {
  return (
    <Suspense fallback={
      <div style={{
        minHeight: '100vh',
        background: '#0c071a',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: '#ffffff'
      }}>
        <Loader2 className="animate-spin" size={48} color="#a855f7" />
      </div>
    }>
      <ResolutionFeedbackContent />
    </Suspense>
  );
}

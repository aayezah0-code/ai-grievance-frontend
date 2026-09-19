'use client';
import { Shield, Target, Users, Zap, Award, Globe, ArrowRight } from 'lucide-react';
import Link from 'next/link';

export default function AboutPage() {
  const features = [
    {
      title: "Our Mission",
      desc: "To bridge the gap between citizens and municipal authorities through state-of-the-art AI, ensuring every grievance is heard and resolved.",
      icon: <Target size={32} />,
      color: "#8b5cf6"
    },
    {
      title: "Our Vision",
      desc: "Creating a future where civic management is transparent, instant, and automated, empowering every citizen to shape their city.",
      icon: <Globe size={32} />,
      color: "#3b82f6"
    },
    {
      title: "AI-Powered Impact",
      desc: "Leveraging multimodal Gemini Vision to forensicly analyze civic issues—from potholes to pipeline leaks—with unmatched accuracy.",
      icon: <Zap size={32} />,
      color: "#ec4899"
    }
  ];

  const values = [
    { title: "Smart Grievance Management", desc: "Automated routing and priority detection.", icon: <Shield size={20} /> },
    { title: "Citizen Empowerment", desc: "Giving power back to the people via data.", icon: <Users size={20} /> },
    { title: "Public Welfare Goals", desc: "Committed to sustainable urban growth.", icon: <Award size={20} /> },
  ];

  return (
    <div className="about-container">
      <div className="about-hero">
        <h1 className="hero-title">About <span className="text-gradient">CitizenConnect</span></h1>
        <p className="hero-subtitle">The Future of Intelligent Civic Governance</p>
        <div className="hero-glow"></div>
      </div>

      <div className="features-grid">
        {features.map((f, i) => (
          <div key={i} className="glass-card feature-card">
            <div className="card-icon-box" style={{ background: `rgba(${f.color === '#8b5cf6' ? '139, 92, 246' : f.color === '#3b82f6' ? '59, 130, 246' : '236, 72, 153'}, 0.1)`, color: f.color }}>
              {f.icon}
            </div>
            <h3>{f.title}</h3>
            <p>{f.desc}</p>
            <div className="card-border-glow"></div>
          </div>
        ))}
      </div>

      <div className="impact-section">
        <div className="glass-card impact-content">
          <div className="impact-text">
            <h2>Driving <span className="text-pink">Smart Governance</span></h2>
            <p>CitizenConnect isn't just a platform; it's a digital revolution. By integrating high-fidelity AI analysis with a reactive rescue tracker, we ensure that both civic infrastructure and animal welfare are managed with forensic precision.</p>
            <div className="values-list">
              {values.map((v, i) => (
                <div key={i} className="value-item">
                  <div className="value-icon">{v.icon}</div>
                  <div>
                    <span className="value-title">{v.title}</span>
                    <p className="value-desc">{v.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className="impact-visual">
            <div className="visual-circle"></div>
            <div className="visual-bars">
              {[1, 2, 3, 4, 5].map(b => <div key={b} className="bar" style={{height: `${20 + b*15}px`, animationDelay: `${b*0.2}s`}}></div>)}
            </div>
          </div>
        </div>
      </div>

      <div className="about-footer">
        <p>Ready to make an impact?</p>
        <Link href="/report" style={{textDecoration:'none'}}>
          <button className="cta-btn">
            Report a Grievance <ArrowRight size={18} />
          </button>
        </Link>
      </div>

      <style jsx>{`
        .about-container {
          padding: 4rem 2rem;
          max-width: 1200px;
          margin: 0 auto;
          color: white;
          font-family: 'Inter', sans-serif;
        }

        .about-hero {
          text-align: center;
          margin-bottom: 6rem;
          position: relative;
        }

        .hero-title {
          font-family: 'Poppins', sans-serif;
          font-size: 4rem;
          font-weight: 900;
          margin-bottom: 1rem;
          letter-spacing: -2px;
        }

        .text-gradient {
          background: linear-gradient(135deg, #8b5cf6, #3b82f6);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
        }

        .hero-subtitle {
          font-size: 1.5rem;
          color: rgba(255, 255, 255, 0.6);
          font-weight: 500;
        }

        .hero-glow {
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          width: 300px;
          height: 300px;
          background: var(--accent-purple);
          filter: blur(150px);
          opacity: 0.2;
          z-index: -1;
        }

        .features-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
          gap: 2.5rem;
          margin-bottom: 6rem;
        }

        .glass-card {
          background: rgba(255, 255, 255, 0.03);
          backdrop-filter: blur(20px);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 32px;
          padding: 3rem;
          position: relative;
          overflow: hidden;
          transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
        }

        .feature-card:hover {
          transform: translateY(-10px);
          background: rgba(255, 255, 255, 0.05);
          border-color: rgba(255, 255, 255, 0.2);
          box-shadow: 0 30px 60px rgba(0,0,0,0.4);
        }

        .card-icon-box {
          width: 70px;
          height: 70px;
          border-radius: 20px;
          display: flex;
          align-items: center;
          justify-content: center;
          margin-bottom: 2rem;
        }

        .feature-card h3 {
          font-family: 'Poppins', sans-serif;
          font-size: 1.5rem;
          margin-bottom: 1rem;
        }

        .feature-card p {
          color: rgba(255, 255, 255, 0.5);
          line-height: 1.7;
          font-size: 1rem;
        }

        .card-border-glow {
          position: absolute;
          top: 0; left: 0; right: 0; height: 2px;
          background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.3), transparent);
          transform: translateX(-100%);
          transition: transform 0.6s ease;
        }

        .feature-card:hover .card-border-glow {
          transform: translateX(100%);
        }

        .impact-section {
          margin-bottom: 6rem;
        }

        .impact-content {
          display: flex;
          align-items: center;
          gap: 4rem;
          background: linear-gradient(135deg, rgba(255, 255, 255, 0.05), rgba(255, 255, 255, 0.01));
        }

        .impact-text h2 {
          font-family: 'Poppins', sans-serif;
          font-size: 2.5rem;
          margin-bottom: 1.5rem;
        }

        .text-pink {
          color: #ec4899;
        }

        .impact-text p {
          color: rgba(255, 255, 255, 0.7);
          line-height: 1.8;
          margin-bottom: 2.5rem;
        }

        .values-list {
          display: grid;
          gap: 1.5rem;
        }

        .value-item {
          display: flex;
          gap: 1.25rem;
          align-items: flex-start;
        }

        .value-icon {
          color: #8b5cf6;
          padding-top: 4px;
        }

        .value-title {
          font-weight: 700;
          display: block;
          margin-bottom: 0.25rem;
        }

        .value-desc {
          font-size: 0.9rem;
          color: rgba(255, 255, 255, 0.4);
        }

        .impact-visual {
          position: relative;
          width: 300px;
          height: 300px;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .visual-circle {
          position: absolute;
          width: 200px;
          height: 200px;
          border: 1px dashed rgba(255, 255, 255, 0.1);
          border-radius: 50%;
          animation: rotate 20s linear infinite;
        }

        @keyframes rotate {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }

        .visual-bars {
          display: flex;
          align-items: flex-end;
          gap: 8px;
        }

        .bar {
          width: 12px;
          background: linear-gradient(to top, #3b82f6, #8b5cf6);
          border-radius: 6px;
          animation: pulse 2s ease-in-out infinite alternate;
        }

        @keyframes pulse {
          from { opacity: 0.5; filter: brightness(1); }
          to { opacity: 1; filter: brightness(1.5); }
        }

        .about-footer {
          text-align: center;
        }

        .about-footer p {
          font-size: 1.25rem;
          margin-bottom: 2rem;
          color: rgba(255, 255, 255, 0.5);
        }

        .cta-btn {
          background: linear-gradient(135deg, #8b5cf6, #3b82f6);
          color: white;
          border: none;
          padding: 1rem 2.5rem;
          border-radius: 100px;
          font-weight: 700;
          font-size: 1.1rem;
          display: inline-flex;
          align-items: center;
          gap: 1rem;
          cursor: pointer;
          transition: all 0.3s ease;
          box-shadow: 0 10px 30px rgba(139, 92, 246, 0.3);
        }

        .cta-btn:hover {
          transform: translateY(-5px) scale(1.05);
          box-shadow: 0 20px 40px rgba(139, 92, 246, 0.5);
        }

        @media (max-width: 768px) {
          .hero-title { font-size: 2.5rem; }
          .impact-content { flex-direction: column; padding: 2rem; }
          .impact-visual { margin-top: 2rem; }
        }
      `}</style>
    </div>
  );
}

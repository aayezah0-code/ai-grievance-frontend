'use client';
import { useState } from 'react';

export default function ProjectMonitor({ videoSrc = "/videos/ProjectDemo.mp4", poster = "/bg.png" }) {
  const [isPlaying, setIsPlaying] = useState(true);

  return (
    <div className="monitor-wrapper">
      <div className="monitor-screen">
        <div className="monitor-inner">
          {/* Top Bar */}
          <div style={{ 
            position: 'absolute', top: 0, left: 0, right: 0, 
            padding: '12px 20px', 
            background: 'linear-gradient(to bottom, rgba(0,0,0,0.85), transparent)', 
            zIndex: 10, display: 'flex', justifyContent: 'space-between', alignItems: 'center' 
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div style={{ 
                width: '22px', height: '22px', 
                background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)', 
                borderRadius: '50%', display: 'flex', alignItems: 'center', 
                justifyContent: 'center', fontSize: '10px', boxShadow: '0 0 10px rgba(59, 130, 246, 0.5)' 
              }}>⊞</div>
              <span style={{ fontSize: '0.85rem', fontWeight: 600, letterSpacing: '0.5px' }}>CitizenConnect Platform Demo</span>
            </div>
            <div style={{ fontSize: '1.4rem', color: 'rgba(255,255,255,0.4)', cursor: 'pointer', transition: 'color 0.3s' }}>×</div>
          </div>
          
          {/* Video Container */}
          <div style={{ position: 'relative', width: '100%', height: '100%', overflow: 'hidden' }}>
            <video 
              src={videoSrc} 
              poster={poster} 
              autoPlay 
              loop 
              muted 
              playsInline
              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
            />
            
            {/* Cinematic Reflection Overlay */}
            <div style={{ 
              position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, 
              background: 'linear-gradient(135deg, rgba(255,255,255,0.1) 0%, transparent 40%, rgba(255,255,255,0.05) 50%, transparent 100%)',
              pointerEvents: 'none',
              zIndex: 5
            }}></div>
            
            {/* Screen Glow Effect */}
            <div style={{ 
              position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, 
              boxShadow: 'inset 0 0 100px rgba(139, 92, 246, 0.15)',
              pointerEvents: 'none',
              zIndex: 6
            }}></div>
          </div>

          {/* Player Controls Bar */}
          <div style={{ 
            position: 'absolute', bottom: 0, left: 0, right: 0, 
            padding: '20px 25px', 
            background: 'linear-gradient(to top, rgba(0,0,0,0.9), transparent)', 
            zIndex: 10, display: 'flex', alignItems: 'center', gap: '20px' 
          }}>
            <div 
              style={{ fontSize: '1.4rem', cursor: 'pointer', color: 'white', opacity: 0.9 }}
              onClick={() => setIsPlaying(!isPlaying)}
            >
              {isPlaying ? '⏸' : '▶'}
            </div>
            <div style={{ fontSize: '1.4rem', cursor: 'pointer', color: 'rgba(255,255,255,0.7)' }}>⏭</div>
            <div style={{ fontSize: '0.85rem', color: '#aaa', fontWeight: 500, fontFamily: 'monospace' }}>0:04 / 2:15</div>
            <div style={{ flex: 1, height: '5px', background: 'rgba(255,255,255,0.1)', borderRadius: '10px', position: 'relative' }}>
              <div style={{ 
                position: 'absolute', top: 0, left: 0, width: '35%', height: '100%', 
                background: 'linear-gradient(90deg, #8b5cf6, #3b82f6)', 
                borderRadius: '10px', boxShadow: '0 0 15px rgba(139, 92, 246, 0.6)' 
              }}></div>
            </div>
            <div style={{ fontSize: '1.1rem', cursor: 'pointer', color: '#aaa' }}>⚙</div>
            <div style={{ fontSize: '1.1rem', cursor: 'pointer', color: '#aaa' }}>⛶</div>
          </div>
        </div>
      </div>
      <div className="monitor-stand"></div>
      <div className="monitor-base"></div>

      <style jsx>{`
        .monitor-wrapper {
          position: relative;
          width: 100%;
          max-width: 800px;
          margin: 0 auto;
          perspective: 1500px;
        }

        .monitor-screen {
          background: #111;
          border: 12px solid #1a1a1a;
          border-radius: 24px;
          aspect-ratio: 16/10;
          overflow: hidden;
          box-shadow: 
            0 30px 60px rgba(0, 0, 0, 0.8),
            0 0 40px rgba(139, 92, 246, 0.1),
            inset 0 0 20px rgba(0, 0, 0, 0.5);
          position: relative;
          transform: rotateX(2deg);
          transition: transform 0.5s ease;
        }

        .monitor-wrapper:hover .monitor-screen {
          transform: rotateX(0deg) translateY(-5px);
        }

        .monitor-inner {
          position: relative;
          width: 100%;
          height: 100%;
          background: #000;
        }

        .monitor-stand {
          width: 80px;
          height: 40px;
          background: linear-gradient(to right, #1a1a1a, #2a2a2a, #1a1a1a);
          margin: -2px auto 0;
          position: relative;
          z-index: -1;
        }

        .monitor-base {
          width: 220px;
          height: 12px;
          background: linear-gradient(to bottom, #2a2a2a, #111);
          margin: 0 auto;
          border-radius: 20px 20px 4px 4px;
          box-shadow: 0 10px 20px rgba(0,0,0,0.5);
        }
      `}</style>
    </div>
  );
}

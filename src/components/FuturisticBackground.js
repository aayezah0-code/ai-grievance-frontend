'use client';
import { useEffect, useRef } from 'react';

export default function FuturisticBackground() {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    let animationFrameId;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    window.addEventListener('resize', resize);
    resize();

    // Particle Configuration
    const particleCount = 150;
    const particles = [];
    const colors = ['#A855F7', '#3B82F6', '#EC4899', '#8B5CF6'];

    class Particle {
      constructor() {
        this.init();
      }

      init() {
        this.x = Math.random() * canvas.width;
        this.y = Math.random() * canvas.height;
        this.size = Math.random() * 2 + 0.5;
        this.speedX = Math.random() * 0.5 - 0.25;
        this.speedY = Math.random() * 0.5 - 0.25;
        this.color = colors[Math.floor(Math.random() * colors.length)];
        this.opacity = Math.random() * 0.5 + 0.2;
        this.pulse = Math.random() * 0.02;
        this.pulseDir = 1;
      }

      update() {
        this.x += this.speedX;
        this.y += this.speedY;

        if (this.x < 0 || this.x > canvas.width) this.speedX *= -1;
        if (this.y < 0 || this.y > canvas.height) this.speedY *= -1;

        // Pulse opacity
        this.opacity += this.pulse * this.pulseDir;
        if (this.opacity > 0.8 || this.opacity < 0.2) this.pulseDir *= -1;
      }

      draw() {
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fillStyle = this.color;
        ctx.globalAlpha = this.opacity;
        ctx.shadowBlur = 10;
        ctx.shadowColor = this.color;
        ctx.fill();
      }
    }

    // Energy Waves Configuration
    let waves = [];
    const waveCount = 3;

    class Wave {
      constructor(index) {
        this.index = index;
        this.y = canvas.height * (0.3 + index * 0.2);
        this.amplitude = Math.random() * 50 + 20;
        this.frequency = Math.random() * 0.005 + 0.002;
        this.phase = Math.random() * Math.PI * 2;
        this.speed = Math.random() * 0.01 + 0.005;
        this.color = colors[index % colors.length];
      }

      draw(t) {
        ctx.beginPath();
        ctx.lineWidth = 1;
        ctx.strokeStyle = this.color;
        ctx.globalAlpha = 0.05;
        
        ctx.moveTo(0, this.y);
        for (let x = 0; x < canvas.width; x += 10) {
          const y = this.y + Math.sin(x * this.frequency + this.phase + t * this.speed) * this.amplitude;
          ctx.lineTo(x, y);
        }
        
        ctx.stroke();
      }
    }

    for (let i = 0; i < particleCount; i++) {
      particles.push(new Particle());
    }

    for (let i = 0; i < waveCount; i++) {
      waves.push(new Wave(i));
    }

    let time = 0;
    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      // Draw background glow
      const gradient = ctx.createRadialGradient(
        canvas.width / 2, canvas.height / 2, 0,
        canvas.width / 2, canvas.height / 2, canvas.width / 1.5
      );
      gradient.addColorStop(0, 'rgba(30, 27, 75, 0.2)');
      gradient.addColorStop(1, 'rgba(5, 8, 22, 0)');
      ctx.fillStyle = gradient;
      ctx.globalAlpha = 1;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      time += 1;

      waves.forEach(wave => wave.draw(time));

      particles.forEach(p => {
        p.update();
        p.draw();
      });

      animationFrameId = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      window.removeEventListener('resize', resize);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <div className="futuristic-bg-container">
      <div className="gradient-overlay"></div>
      <canvas ref={canvasRef} className="particle-canvas" />
      <style jsx>{`
        .futuristic-bg-container {
          position: fixed;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background: #050816;
          z-index: -1;
          overflow: hidden;
        }

        .gradient-overlay {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background: 
            radial-gradient(circle at 20% 30%, rgba(168, 85, 247, 0.1) 0%, transparent 40%),
            radial-gradient(circle at 80% 70%, rgba(59, 130, 246, 0.1) 0%, transparent 40%),
            linear-gradient(to bottom, #050816, #0B1023, #111827);
          opacity: 0.8;
        }

        .particle-canvas {
          display: block;
          position: absolute;
          top: 0;
          left: 0;
        }
      `}</style>
    </div>
  );
}

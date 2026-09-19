'use client';
import { useEffect, useRef } from 'react';
import './ParticleBackground.css';

export default function ParticleBackground() {
  const canvasRef = useRef(null);
  const mouse = useRef({ x: null, y: null });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    let animationFrameId;

    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    const handleMouseMove = (e) => {
      mouse.current.x = e.clientX;
      mouse.current.y = e.clientY;
    };

    window.addEventListener('resize', resizeCanvas);
    window.addEventListener('mousemove', handleMouseMove);
    resizeCanvas();

    const particleCount = 150;
    const particles = [];
    // Vibrant neon colors
    const colors = ['#8b5cf6', '#3b82f6', '#ec4899', '#06b6d4', '#7c3aed', '#60a5fa'];

    class Particle {
      constructor() {
        this.init();
      }

      init() {
        this.x = Math.random() * canvas.width;
        this.y = Math.random() * canvas.height;
        this.size = Math.random() * 3 + 1;
        this.speedX = Math.random() * 0.8 - 0.4;
        this.speedY = Math.random() * 0.8 - 0.4;
        this.color = colors[Math.floor(Math.random() * colors.length)];
        this.opacity = Math.random() * 0.8 + 0.2;
      }

      update() {
        // Mouse influence
        if (mouse.current.x !== null && mouse.current.y !== null) {
          const dx = mouse.current.x - this.x;
          const dy = mouse.current.y - this.y;
          const distance = Math.sqrt(dx * dx + dy * dy);
          if (distance < 200) {
            const force = (200 - distance) / 200;
            const forceDirectionX = dx / distance;
            const forceDirectionY = dy / distance;
            this.x -= forceDirectionX * force * 3;
            this.y -= forceDirectionY * force * 3;
          }
        }

        this.x += this.speedX;
        this.y += this.speedY;

        if (this.x < 0) this.x = canvas.width;
        if (this.x > canvas.width) this.x = 0;
        if (this.y < 0) this.y = canvas.height;
        if (this.y > canvas.height) this.y = 0;
      }

      draw() {
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fillStyle = this.color;
        ctx.globalAlpha = this.opacity;
        
        // Intense glow
        ctx.shadowBlur = 15;
        ctx.shadowColor = this.color;
        
        ctx.fill();
        ctx.shadowBlur = 0; // Reset for performance
      }
    }

    class Wave {
      constructor(y, color1, color2, speed, amplitude, frequency, opacity) {
        this.y = y;
        this.color1 = color1;
        this.color2 = color2;
        this.speed = speed;
        this.amplitude = amplitude;
        this.frequency = frequency;
        this.opacity = opacity;
        this.offset = Math.random() * 1000;
      }

      draw() {
        this.offset += this.speed;
        
        // Create neon gradient for the wave
        const gradient = ctx.createLinearGradient(0, this.y - this.amplitude, canvas.width, this.y + this.amplitude);
        gradient.addColorStop(0, this.color1);
        gradient.addColorStop(0.5, this.color2);
        gradient.addColorStop(1, this.color1);

        ctx.beginPath();
        ctx.moveTo(0, this.y);
        
        for (let x = 0; x < canvas.width; x += 10) {
          const dy = Math.sin(x * this.frequency + this.offset) * this.amplitude;
          ctx.lineTo(x, this.y + dy);
        }
        
        ctx.strokeStyle = gradient;
        ctx.lineWidth = 3;
        ctx.globalAlpha = this.opacity;
        ctx.shadowBlur = 30;
        ctx.shadowColor = this.color1;
        ctx.stroke();
        ctx.shadowBlur = 0;
      }
    }

    for (let i = 0; i < particleCount; i++) {
      particles.push(new Particle());
    }

    const waves = [
      new Wave(canvas.height * 0.2, '#8b5cf6', '#3b82f6', 0.005, 50, 0.001, 0.3),
      new Wave(canvas.height * 0.5, '#ec4899', '#8b5cf6', 0.007, 70, 0.0008, 0.2),
      new Wave(canvas.height * 0.8, '#06b6d4', '#3b82f6', 0.006, 60, 0.0012, 0.25),
    ];

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      waves.forEach(wave => wave.draw());

      particles.forEach(particle => {
        particle.update();
        particle.draw();
      });

      // Connections
      ctx.beginPath();
      ctx.lineWidth = 0.5;
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x;
          const dy = particles[i].y - particles[j].y;
          const distance = Math.sqrt(dx * dx + dy * dy);

          if (distance < 120) {
            ctx.globalAlpha = (1 - distance / 120) * 0.2;
            ctx.strokeStyle = particles[i].color;
            ctx.moveTo(particles[i].x, particles[i].y);
            ctx.lineTo(particles[j].x, particles[j].y);
          }
        }
      }
      ctx.stroke();

      animationFrameId = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      window.removeEventListener('resize', resizeCanvas);
      window.removeEventListener('mousemove', handleMouseMove);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return <canvas ref={canvasRef} className="particles-canvas" />;
}

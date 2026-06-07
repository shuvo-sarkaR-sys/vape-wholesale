import React, { useEffect, useRef } from 'react';

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  maxLife: number;
  size: number;
  growth: number;
  rotation: number;
  rotationSpeed: number;
  color: string;
  alpha: number;
}

interface SmokeEffectProps {
  density?: number; // Spawning frequency modifier
  colorType?: 'gold' | 'charcoal' | 'mixed';
}

export default function SmokeEffect({ density = 1.5, colorType = 'mixed' }: SmokeEffectProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const mouseRef = useRef({ x: -1000, y: -1000, vx: 0, vy: 0, lastX: 0, lastY: 0 });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationId: number;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    let particles: Particle[] = [];

    // Handles smart resizing
    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };
    window.addEventListener('resize', handleResize);

    // Mouse interactive drift trackers
    const handleMouseMove = (e: MouseEvent) => {
      const mouse = mouseRef.current;
      mouse.x = e.clientX;
      mouse.y = e.clientY;
      mouse.vx = (mouse.x - mouse.lastX) * 0.15;
      mouse.vy = (mouse.y - mouse.lastY) * 0.15;
      mouse.lastX = mouse.x;
      mouse.lastY = mouse.y;

      // Spawn extra interactive wisps trailing the cursor
      if (Math.random() < 0.4) {
        spawnParticle(mouse.x, mouse.y, true);
      }
    };

    const handleMouseLeave = () => {
      const mouse = mouseRef.current;
      mouse.x = -1000;
      mouse.y = -1000;
      mouse.vx = 0;
      mouse.vy = 0;
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseleave', handleMouseLeave);

    // Dynamic color picker for luxury look and feel
    const getSmokeColor = () => {
      const rand = Math.random();
      if (colorType === 'gold') {
        // Soft amber/gold micro-glowing particles
        return rand > 0.5 ? '245, 158, 11' : '251, 191, 36';
      } else if (colorType === 'charcoal') {
        // Deep warm gray ash wisps
        return rand > 0.5 ? '115, 115, 115' : '82, 82, 82';
      } else {
        // Rich mixed twilight distribution
        if (rand < 0.3) return '245, 158, 11'; // Gold
        if (rand < 0.6) return '163, 163, 163'; // Silver
        return '64, 64, 64'; // Warm Charcoal
      }
    };

    // Particle spawning engine
    const spawnParticle = (x: number, y: number, isInteractive = false) => {
      const size = isInteractive 
        ? Math.random() * 25 + 15 
        : Math.random() * 45 + 30;

      const maxLife = isInteractive
        ? Math.random() * 60 + 50
        : Math.random() * 180 + 120;

      const vy = isInteractive ? (Math.random() * -1 - 0.5) : (Math.random() * -0.9 - 0.3);
      const vx = isInteractive ? (Math.random() * 1 - 0.5) : (Math.random() * 0.8 - 0.4);

      particles.push({
        x,
        y,
        vx: vx + mouseRef.current.vx * 0.1,
        vy: vy + mouseRef.current.vy * 0.15,
        life: 0,
        maxLife,
        size,
        growth: Math.random() * 0.45 + 0.2,
        rotation: Math.random() * Math.PI * 2,
        rotationSpeed: (Math.random() - 0.5) * 0.015,
        color: getSmokeColor(),
        alpha: Math.random() * 0.12 + 0.03
      });
    };

    // Physics Update Loop
    const update = () => {
      // Gentle spawning from the base of the viewport window
      // Density slider controls allocation
      if (Math.random() < 0.06 * density) {
        // Spawns multiple columns mimicking luxurious incense elements or vaporized vents
        const columnX = Math.random() * width;
        spawnParticle(columnX, height + 50);
      }

      // Add centralized smoke plumes simulating high fashion showroom vapor sources
      if (Math.random() < 0.03 * density) {
        spawnParticle(width * 0.25, height + 40);
        spawnParticle(width * 0.75, height + 40);
      }

      // Process the active matrix
      for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i];
        p.life++;

        // Drifts upward with micro-sinusoidal horizontal sway
        p.y += p.vy;
        p.x += p.vx + Math.sin(p.life * 0.015) * 0.15;

        // Apply progressive size increase as smoke cools and disperses
        p.size += p.growth;
        p.rotation += p.rotationSpeed;

        // Interactive displacement from mouse vector
        const mouse = mouseRef.current;
        if (mouse.x !== -1000) {
          const dx = p.x - mouse.x;
          const dy = p.y - mouse.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 180) {
            const force = (180 - dist) / 180;
            p.vx += (dx / dist) * force * 0.3;
            p.vy += (dy / dist) * force * 0.3;
          }
        }

        // Friction to prevent particles from accelerating indefinitely
        p.vx *= 0.985;
        p.vy *= 0.985;

        // Evaporated / Expired
        if (p.life >= p.maxLife || p.x + p.size < 0 || p.x - p.size > width || p.y + p.size < 0) {
          particles.splice(i, 1);
        }
      }
    };

    // Render step
    const draw = () => {
      ctx.clearRect(0, 0, width, height);

      particles.forEach((p) => {
        const ratio = p.life / p.maxLife;
        // Natural ease-in and fade-out transparency timeline
        let alpha = p.alpha;
        if (ratio < 0.2) {
          alpha = (ratio / 0.2) * p.alpha;
        } else if (ratio > 0.6) {
          alpha = (1 - (ratio - 0.6) / 0.4) * p.alpha;
        }

        if (alpha <= 0) return;

        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate(p.rotation);

        // Draw soft feathered gradient plumes
        const grad = ctx.createRadialGradient(0, 0, 0, 0, 0, p.size);
        grad.addColorStop(0, `rgba(${p.color}, ${alpha})`);
        grad.addColorStop(0.3, `rgba(${p.color}, ${alpha * 0.5})`);
        grad.addColorStop(0.7, `rgba(${p.color}, ${alpha * 0.12})`);
        grad.addColorStop(1, `rgba(${p.color}, 0)`);

        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.arc(0, 0, p.size, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      });
    };

    const loop = () => {
      update();
      draw();
      animationId = requestAnimationFrame(loop);
    };

    loop();

    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseleave', handleMouseLeave);
      cancelAnimationFrame(animationId);
    };
  }, [density, colorType]);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 w-full h-full pointer-events-none z-10"
      id="ambient-smoke-canvas"
    />
  );
}

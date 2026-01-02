import { useEffect, useRef, memo, useState } from 'react';
import { useAmbient, AmbientMode } from '@/contexts/AmbientContext';
import { useTheme } from '@/contexts/ThemeContext';
import { cn } from '@/lib/utils';

// Rain effect component with puddles at bottom
const RainEffect = memo(({ isDark, intensity }: { isDark: boolean; intensity: number }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number>();

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener('resize', resize);

    const intensityFactor = intensity / 100;
    // Increased drop count for better visibility
    const baseDropCount = isDark ? 25 : 40;
    const dropCount = Math.round(baseDropCount + (intensityFactor * 50));
    
    const drops: { x: number; y: number; speed: number; length: number; opacity: number }[] = [];
    const splashes: { x: number; y: number; radius: number; opacity: number; maxRadius: number }[] = [];
    const puddles: { x: number; width: number; opacity: number }[] = [];

    // Create puddles at the bottom
    const puddleCount = Math.round(3 + intensityFactor * 5);
    for (let i = 0; i < puddleCount; i++) {
      puddles.push({
        x: Math.random() * canvas.width,
        width: 30 + Math.random() * 60,
        opacity: 0.05 + Math.random() * 0.1 * intensityFactor,
      });
    }

    for (let i = 0; i < dropCount; i++) {
      // Increased opacity range for better visibility
      const baseOpacity = isDark ? 0.08 : 0.25;
      const maxOpacity = isDark ? 0.25 : 0.65;
      drops.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        speed: 2.5 + Math.random() * 2.5,
        length: 15 + Math.random() * 22,
        opacity: baseOpacity + (Math.random() * (maxOpacity - baseOpacity) * intensityFactor),
      });
    }

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Draw puddles at bottom
      puddles.forEach((puddle) => {
        ctx.beginPath();
        ctx.ellipse(puddle.x, canvas.height - 5, puddle.width, 4, 0, 0, Math.PI * 2);
        ctx.fillStyle = isDark 
          ? `rgba(100, 130, 160, ${puddle.opacity})`
          : `rgba(142, 174, 207, ${puddle.opacity})`;
        ctx.fill();
      });

      // Draw and update splashes
      for (let i = splashes.length - 1; i >= 0; i--) {
        const splash = splashes[i];
        ctx.beginPath();
        ctx.arc(splash.x, splash.y, splash.radius, 0, Math.PI * 2);
        ctx.strokeStyle = isDark 
          ? `rgba(180, 200, 220, ${splash.opacity})`
          : `rgba(142, 174, 207, ${splash.opacity})`;
        ctx.lineWidth = 1;
        ctx.stroke();
        
        splash.radius += 0.5;
        splash.opacity -= 0.02;
        
        if (splash.opacity <= 0 || splash.radius >= splash.maxRadius) {
          splashes.splice(i, 1);
        }
      }

      // Draw rain drops
      drops.forEach((drop) => {
        ctx.beginPath();
        ctx.moveTo(drop.x, drop.y);
        ctx.lineTo(drop.x + 0.3, drop.y + drop.length);
        ctx.strokeStyle = isDark 
          ? `rgba(180, 200, 220, ${drop.opacity})`
          : `rgba(142, 174, 207, ${drop.opacity})`;
        ctx.lineWidth = isDark ? 0.8 : 1;
        ctx.stroke();

        drop.y += drop.speed;
        if (drop.y > canvas.height - 20) {
          // Create splash
          if (Math.random() < 0.3) {
            splashes.push({
              x: drop.x,
              y: canvas.height - 10,
              radius: 1,
              opacity: 0.3 * intensityFactor,
              maxRadius: 8 + Math.random() * 6,
            });
          }
          drop.y = -drop.length;
          drop.x = Math.random() * canvas.width;
        }
      });

      animationRef.current = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      window.removeEventListener('resize', resize);
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [isDark, intensity]);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0"
      style={{ filter: 'blur(0.3px)' }}
    />
  );
});

RainEffect.displayName = 'RainEffect';

// Sun rays effect component with improved dynamic animations
const SunRaysEffect = memo(({ isDark, intensity }: { isDark: boolean; intensity: number }) => {
  const intensityFactor = intensity / 100;
  const rayCount = Math.round(4 + intensityFactor * 4);
  
  // Increased base opacity for better visibility
  const baseOpacity = isDark ? 0.03 : 0.12;
  const maxOpacity = isDark ? 0.08 : 0.35;
  const opacityRange = maxOpacity - baseOpacity;
  
  return (
    <div className="absolute inset-0 overflow-hidden">
      {[...Array(rayCount)].map((_, i) => (
        <div
          key={i}
          className="absolute"
          style={{
            top: '-50%',
            right: `${5 + i * 12}%`,
            width: isDark ? '140px' : '180px',
            height: '250%',
            background: isDark
              ? `linear-gradient(
                  135deg,
                  rgba(255, 250, 230, ${baseOpacity + (i * 0.008 * intensityFactor) + (opacityRange * intensityFactor * 0.4)}) 0%,
                  rgba(255, 235, 180, ${baseOpacity * 0.6 + (opacityRange * intensityFactor * 0.25)}) 50%,
                  transparent 100%
                )`
              : `linear-gradient(
                  135deg,
                  rgba(255, 230, 160, ${baseOpacity + (i * 0.02 * intensityFactor) + (opacityRange * intensityFactor * 0.6)}) 0%,
                  rgba(255, 220, 140, ${baseOpacity * 0.4 + (opacityRange * intensityFactor * 0.35)}) 50%,
                  transparent 100%
                )`,
            transform: `rotate(${18 + i * 10}deg)`,
            filter: isDark ? 'blur(35px)' : 'blur(30px)',
            animation: `sunRayMove${i} ${8 + i * 2}s ease-in-out infinite, sunRayPulse ${3 + i * 0.5}s ease-in-out infinite`,
            animationDelay: `${i * 1.2}s`,
          }}
        />
      ))}
      {/* Additional floating light particles for more dynamic feel */}
      {[...Array(Math.round(3 * intensityFactor))].map((_, i) => (
        <div
          key={`particle-${i}`}
          className="absolute rounded-full"
          style={{
            top: `${20 + i * 25}%`,
            right: `${10 + i * 20}%`,
            width: '100px',
            height: '100px',
            background: isDark
              ? `radial-gradient(circle, rgba(255, 250, 200, ${0.08 * intensityFactor}) 0%, transparent 70%)`
              : `radial-gradient(circle, rgba(255, 240, 180, ${0.2 * intensityFactor}) 0%, transparent 70%)`,
            animation: `sunParticleFloat ${6 + i * 2}s ease-in-out infinite`,
            animationDelay: `${i * 1.5}s`,
          }}
        />
      ))}
      <style>{`
        @keyframes sunRayMove0 {
          0%, 100% { 
            opacity: ${0.5 + intensityFactor * 0.4}; 
            transform: rotate(18deg) translateX(0) scaleY(1); 
          }
          25% { 
            opacity: ${0.7 + intensityFactor * 0.3}; 
            transform: rotate(20deg) translateX(5px) scaleY(1.02); 
          }
          50% { 
            opacity: ${0.6 + intensityFactor * 0.4}; 
            transform: rotate(18deg) translateX(0) scaleY(1.03); 
          }
          75% { 
            opacity: ${0.8 + intensityFactor * 0.2}; 
            transform: rotate(16deg) translateX(-5px) scaleY(1.01); 
          }
        }
        @keyframes sunRayMove1 {
          0%, 100% { opacity: ${0.45 + intensityFactor * 0.45}; transform: rotate(28deg) translateX(0) scaleY(1); }
          33% { opacity: ${0.7 + intensityFactor * 0.3}; transform: rotate(30deg) translateX(8px) scaleY(1.03); }
          66% { opacity: ${0.55 + intensityFactor * 0.4}; transform: rotate(26deg) translateX(-8px) scaleY(1.02); }
        }
        @keyframes sunRayMove2 {
          0%, 100% { opacity: ${0.4 + intensityFactor * 0.5}; transform: rotate(38deg) translateX(0) scaleY(1); }
          50% { opacity: ${0.75 + intensityFactor * 0.25}; transform: rotate(40deg) translateX(6px) scaleY(1.04); }
        }
        @keyframes sunRayMove3 {
          0%, 100% { opacity: ${0.45 + intensityFactor * 0.45}; transform: rotate(48deg) translateX(0) scaleY(1); }
          40% { opacity: ${0.65 + intensityFactor * 0.35}; transform: rotate(50deg) translateX(10px) scaleY(1.02); }
          80% { opacity: ${0.8 + intensityFactor * 0.2}; transform: rotate(46deg) translateX(-6px) scaleY(1.03); }
        }
        @keyframes sunRayMove4 {
          0%, 100% { opacity: ${0.4 + intensityFactor * 0.5}; transform: rotate(58deg) translateX(0) scaleY(1); }
          50% { opacity: ${0.7 + intensityFactor * 0.3}; transform: rotate(60deg) translateX(7px) scaleY(1.02); }
        }
        @keyframes sunRayMove5 {
          0%, 100% { opacity: ${0.45 + intensityFactor * 0.45}; transform: rotate(68deg) translateX(0) scaleY(1); }
          35% { opacity: ${0.65 + intensityFactor * 0.35}; transform: rotate(70deg) translateX(5px) scaleY(1.03); }
          70% { opacity: ${0.75 + intensityFactor * 0.25}; transform: rotate(66deg) translateX(-5px) scaleY(1.01); }
        }
        @keyframes sunRayMove6 {
          0%, 100% { opacity: ${0.4 + intensityFactor * 0.5}; transform: rotate(78deg) translateX(0) scaleY(1); }
          50% { opacity: ${0.7 + intensityFactor * 0.3}; transform: rotate(80deg) translateX(8px) scaleY(1.02); }
        }
        @keyframes sunRayMove7 {
          0%, 100% { opacity: ${0.45 + intensityFactor * 0.45}; transform: rotate(88deg) translateX(0) scaleY(1); }
          50% { opacity: ${0.65 + intensityFactor * 0.35}; transform: rotate(90deg) translateX(6px) scaleY(1.03); }
        }
        @keyframes sunRayPulse {
          0%, 100% { filter: blur(30px) brightness(1); }
          50% { filter: blur(28px) brightness(1.15); }
        }
        @keyframes sunParticleFloat {
          0%, 100% { transform: translate(0, 0) scale(1); opacity: 0.6; }
          25% { transform: translate(10px, -15px) scale(1.1); opacity: 0.8; }
          50% { transform: translate(20px, 0) scale(1); opacity: 0.7; }
          75% { transform: translate(10px, 15px) scale(1.15); opacity: 0.9; }
        }
      `}</style>
    </div>
  );
});

SunRaysEffect.displayName = 'SunRaysEffect';

// Snow effect component with snow piling at bottom
const SnowEffect = memo(({ isDark, intensity }: { isDark: boolean; intensity: number }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number>();

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener('resize', resize);

    const intensityFactor = intensity / 100;
    // Increased flake count for better visibility
    const baseFlakeCount = isDark ? 20 : 35;
    const flakeCount = Math.round(baseFlakeCount + (intensityFactor * 40));

    const flakes: { x: number; y: number; speed: number; size: number; opacity: number; drift: number }[] = [];
    
    // Snow pile data - heights at different x positions
    const pileSegments = 50;
    const snowPile: number[] = new Array(pileSegments).fill(0).map(() => Math.random() * 3);

    for (let i = 0; i < flakeCount; i++) {
      // Increased opacity for better visibility
      const baseOpacity = isDark ? 0.1 : 0.35;
      const maxOpacity = isDark ? 0.35 : 0.75;
      flakes.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        speed: 0.4 + Math.random() * 0.5,
        size: isDark ? (2 + Math.random() * 2.5) : (2.5 + Math.random() * 3),
        opacity: baseOpacity + (Math.random() * (maxOpacity - baseOpacity) * intensityFactor),
        drift: Math.random() * 0.3 - 0.15,
      });
    }

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Draw snow pile at bottom
      ctx.beginPath();
      ctx.moveTo(0, canvas.height);
      
      const segmentWidth = canvas.width / (pileSegments - 1);
      for (let i = 0; i < pileSegments; i++) {
        const x = i * segmentWidth;
        const pileHeight = snowPile[i] * intensityFactor * 3;
        ctx.lineTo(x, canvas.height - pileHeight);
      }
      
      ctx.lineTo(canvas.width, canvas.height);
      ctx.closePath();
      ctx.fillStyle = isDark 
        ? `rgba(200, 210, 220, ${0.15 * intensityFactor})`
        : `rgba(240, 245, 250, ${0.25 * intensityFactor})`;
      ctx.fill();

      // Draw snowflakes
      flakes.forEach((flake) => {
        ctx.beginPath();
        ctx.arc(flake.x, flake.y, flake.size, 0, Math.PI * 2);
        ctx.fillStyle = isDark 
          ? `rgba(255, 255, 255, ${flake.opacity})`
          : `rgba(220, 230, 240, ${flake.opacity})`;
        ctx.fill();

        flake.y += flake.speed;
        flake.x += flake.drift + Math.sin(flake.y * 0.008) * 0.2;

        // Check if flake reached bottom
        const segmentIndex = Math.floor((flake.x / canvas.width) * pileSegments);
        const clampedIndex = Math.max(0, Math.min(pileSegments - 1, segmentIndex));
        const pileHeight = snowPile[clampedIndex] * intensityFactor * 3;
        
        if (flake.y > canvas.height - pileHeight - 5) {
          // Add to pile slightly
          snowPile[clampedIndex] = Math.min(snowPile[clampedIndex] + 0.02, 8);
          flake.y = -flake.size;
          flake.x = Math.random() * canvas.width;
        }
        
        if (flake.x > canvas.width) flake.x = 0;
        if (flake.x < 0) flake.x = canvas.width;
      });

      animationRef.current = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      window.removeEventListener('resize', resize);
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [isDark, intensity]);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0"
      style={{ filter: 'blur(0.3px)' }}
    />
  );
});

SnowEffect.displayName = 'SnowEffect';

// Fireflies effect component
const FirefliesEffect = memo(({ isDark, intensity }: { isDark: boolean; intensity: number }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number>();

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener('resize', resize);

    const intensityFactor = intensity / 100;
    const fireflyCount = Math.round(8 + intensityFactor * 20);

    const fireflies: { x: number; y: number; vx: number; vy: number; size: number; brightness: number; phase: number }[] = [];

    for (let i = 0; i < fireflyCount; i++) {
      fireflies.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        vx: (Math.random() - 0.5) * 0.5,
        vy: (Math.random() - 0.5) * 0.5,
        size: 2 + Math.random() * 3,
        brightness: Math.random(),
        phase: Math.random() * Math.PI * 2,
      });
    }

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      fireflies.forEach((fly) => {
        fly.phase += 0.03;
        const glow = (Math.sin(fly.phase) + 1) / 2;
        const alpha = (0.2 + glow * 0.8) * intensityFactor;

        // Draw glow
        const gradient = ctx.createRadialGradient(fly.x, fly.y, 0, fly.x, fly.y, fly.size * 4);
        gradient.addColorStop(0, isDark ? `rgba(255, 255, 150, ${alpha})` : `rgba(255, 220, 100, ${alpha * 0.8})`);
        gradient.addColorStop(0.5, isDark ? `rgba(255, 200, 50, ${alpha * 0.3})` : `rgba(255, 180, 50, ${alpha * 0.2})`);
        gradient.addColorStop(1, 'transparent');

        ctx.beginPath();
        ctx.arc(fly.x, fly.y, fly.size * 4, 0, Math.PI * 2);
        ctx.fillStyle = gradient;
        ctx.fill();

        // Draw core
        ctx.beginPath();
        ctx.arc(fly.x, fly.y, fly.size * 0.5, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255, 255, 200, ${alpha})`;
        ctx.fill();

        // Move
        fly.x += fly.vx + Math.sin(fly.phase * 0.5) * 0.3;
        fly.y += fly.vy + Math.cos(fly.phase * 0.3) * 0.2;

        // Bounce
        if (fly.x < 0 || fly.x > canvas.width) fly.vx *= -1;
        if (fly.y < 0 || fly.y > canvas.height) fly.vy *= -1;
      });

      animationRef.current = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      window.removeEventListener('resize', resize);
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
    };
  }, [isDark, intensity]);

  return <canvas ref={canvasRef} className="absolute inset-0" />;
});

FirefliesEffect.displayName = 'FirefliesEffect';

// Cherry blossoms effect component
const CherryBlossomsEffect = memo(({ isDark, intensity }: { isDark: boolean; intensity: number }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number>();

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener('resize', resize);

    const intensityFactor = intensity / 100;
    const petalCount = Math.round(12 + intensityFactor * 25);

    const petals: { x: number; y: number; size: number; rotation: number; rotationSpeed: number; speed: number; drift: number; opacity: number }[] = [];

    for (let i = 0; i < petalCount; i++) {
      petals.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height - canvas.height,
        size: 6 + Math.random() * 8,
        rotation: Math.random() * Math.PI * 2,
        rotationSpeed: (Math.random() - 0.5) * 0.05,
        speed: 0.5 + Math.random() * 0.8,
        drift: (Math.random() - 0.5) * 0.8,
        opacity: (0.4 + Math.random() * 0.4) * intensityFactor,
      });
    }

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      petals.forEach((petal) => {
        ctx.save();
        ctx.translate(petal.x, petal.y);
        ctx.rotate(petal.rotation);

        // Draw petal shape
        ctx.beginPath();
        ctx.ellipse(0, 0, petal.size, petal.size * 0.5, 0, 0, Math.PI * 2);
        ctx.fillStyle = isDark 
          ? `rgba(255, 180, 200, ${petal.opacity * 0.7})`
          : `rgba(255, 182, 193, ${petal.opacity})`;
        ctx.fill();

        ctx.restore();

        // Update position
        petal.y += petal.speed;
        petal.x += petal.drift + Math.sin(petal.y * 0.01) * 0.5;
        petal.rotation += petal.rotationSpeed;

        if (petal.y > canvas.height + petal.size) {
          petal.y = -petal.size;
          petal.x = Math.random() * canvas.width;
        }
      });

      animationRef.current = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      window.removeEventListener('resize', resize);
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
    };
  }, [isDark, intensity]);

  return <canvas ref={canvasRef} className="absolute inset-0" />;
});

CherryBlossomsEffect.displayName = 'CherryBlossomsEffect';

// Autumn leaves effect component
const AutumnLeavesEffect = memo(({ isDark, intensity }: { isDark: boolean; intensity: number }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number>();

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener('resize', resize);

    const intensityFactor = intensity / 100;
    const leafCount = Math.round(10 + intensityFactor * 20);

    const colors = isDark 
      ? ['rgba(200, 120, 50, ', 'rgba(180, 80, 40, ', 'rgba(220, 150, 60, ', 'rgba(160, 100, 40, ']
      : ['rgba(220, 120, 40, ', 'rgba(200, 80, 30, ', 'rgba(240, 160, 50, ', 'rgba(180, 90, 30, '];

    const leaves: { x: number; y: number; size: number; rotation: number; rotationSpeed: number; speed: number; sway: number; swayPhase: number; color: string; opacity: number }[] = [];

    for (let i = 0; i < leafCount; i++) {
      leaves.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height - canvas.height,
        size: 10 + Math.random() * 15,
        rotation: Math.random() * Math.PI * 2,
        rotationSpeed: (Math.random() - 0.5) * 0.03,
        speed: 0.6 + Math.random() * 0.6,
        sway: 1 + Math.random() * 2,
        swayPhase: Math.random() * Math.PI * 2,
        color: colors[Math.floor(Math.random() * colors.length)],
        opacity: (0.5 + Math.random() * 0.3) * intensityFactor,
      });
    }

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      leaves.forEach((leaf) => {
        ctx.save();
        ctx.translate(leaf.x, leaf.y);
        ctx.rotate(leaf.rotation);

        // Draw leaf shape
        ctx.beginPath();
        ctx.moveTo(0, -leaf.size / 2);
        ctx.quadraticCurveTo(leaf.size / 2, 0, 0, leaf.size / 2);
        ctx.quadraticCurveTo(-leaf.size / 2, 0, 0, -leaf.size / 2);
        ctx.fillStyle = leaf.color + leaf.opacity + ')';
        ctx.fill();

        // Draw stem
        ctx.beginPath();
        ctx.moveTo(0, leaf.size / 2);
        ctx.lineTo(0, leaf.size / 2 + 4);
        ctx.strokeStyle = leaf.color + (leaf.opacity * 0.8) + ')';
        ctx.lineWidth = 1;
        ctx.stroke();

        ctx.restore();

        // Update position
        leaf.swayPhase += 0.02;
        leaf.y += leaf.speed;
        leaf.x += Math.sin(leaf.swayPhase) * leaf.sway * 0.3;
        leaf.rotation += leaf.rotationSpeed;

        if (leaf.y > canvas.height + leaf.size) {
          leaf.y = -leaf.size;
          leaf.x = Math.random() * canvas.width;
        }
      });

      animationRef.current = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      window.removeEventListener('resize', resize);
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
    };
  }, [isDark, intensity]);

  return <canvas ref={canvasRef} className="absolute inset-0" />;
});

AutumnLeavesEffect.displayName = 'AutumnLeavesEffect';

export function AmbientLayer() {
  const { ambientMode, visualsEnabled, intensity } = useAmbient();
  const { resolvedTheme } = useTheme();
  const [isVisible, setIsVisible] = useState(false);
  const [currentMode, setCurrentMode] = useState<AmbientMode>(ambientMode);

  const isDark = resolvedTheme === 'dark';

  // Handle fade transitions
  useEffect(() => {
    if (visualsEnabled && ambientMode !== 'off') {
      setCurrentMode(ambientMode);
      const timer = setTimeout(() => setIsVisible(true), 50);
      return () => clearTimeout(timer);
    } else {
      setIsVisible(false);
    }
  }, [ambientMode, visualsEnabled]);

  if (!visualsEnabled && !isVisible) {
    return null;
  }

  const showOverlay = isVisible && !isDark && currentMode !== 'off';
  const overlayOpacity = 0.03 + (intensity / 100) * 0.04;

  // Get effect component based on mode
  const getEffectComponent = () => {
    switch (currentMode) {
      case 'rain':
        return <RainEffect isDark={isDark} intensity={intensity} />;
      case 'sun_rays':
        return <SunRaysEffect isDark={isDark} intensity={intensity} />;
      case 'snow':
        return <SnowEffect isDark={isDark} intensity={intensity} />;
      case 'fireflies':
        return <FirefliesEffect isDark={isDark} intensity={intensity} />;
      case 'cherry_blossoms':
        return <CherryBlossomsEffect isDark={isDark} intensity={intensity} />;
      case 'autumn_leaves':
        return <AutumnLeavesEffect isDark={isDark} intensity={intensity} />;
      default:
        return null;
    }
  };

  const EffectComponent = getEffectComponent();

  return (
    <>
      {/* Subtle darkening overlay for Light Mode only */}
      <div
        className={cn(
          'fixed inset-0 pointer-events-none z-10 transition-opacity duration-500 ease-in-out',
          showOverlay ? 'opacity-100' : 'opacity-0'
        )}
        style={{ backgroundColor: `rgba(0, 0, 0, ${overlayOpacity})` }}
        aria-hidden="true"
      />
      
      {/* Ambient effects layer */}
      <div
        className={cn(
          'fixed inset-0 pointer-events-none z-20 transition-opacity duration-700 ease-in-out',
          isVisible && EffectComponent ? 'opacity-100' : 'opacity-0'
        )}
        aria-hidden="true"
      >
        {EffectComponent}
      </div>
    </>
  );
}

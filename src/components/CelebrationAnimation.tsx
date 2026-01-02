import { useEffect, useState } from 'react';
import { cn } from '@/lib/utils';

// ============================================
// CELEBRATION ANIMATION
// ============================================
// iOS-style celebration for habit completion
// Includes confetti + milestone celebrations (7, 14, 30 days)

interface CelebrationAnimationProps {
  type?: 'daily' | 'milestone';
  streak?: number;
  onComplete?: () => void;
}

const CONFETTI_COLORS = [
  'hsl(var(--primary))',
  'hsl(var(--category-health))',
  'hsl(var(--category-productivity))',
  'hsl(var(--category-fitness))',
  'hsl(var(--category-mindset))',
  'hsl(var(--accent))',
];

const MILESTONE_COLORS = [
  '#FFD700', // Gold
  '#FFA500', // Orange
  '#FF6B6B', // Red
  '#4ECDC4', // Teal
  '#FF69B4', // Pink
  '#9B59B6', // Purple
];

interface Particle {
  id: number;
  x: number;
  y: number;
  color: string;
  size: number;
  delay: number;
  rotation: number;
  velocityX: number;
  velocityY: number;
  shape: 'circle' | 'square' | 'star';
}

function generateParticles(count: number, colors: string[], isMilestone: boolean): Particle[] {
  return Array.from({ length: count }, (_, i) => ({
    id: i,
    x: 50 + (Math.random() - 0.5) * 30,
    y: isMilestone ? 50 : 30,
    color: colors[Math.floor(Math.random() * colors.length)],
    size: isMilestone ? 8 + Math.random() * 8 : 6 + Math.random() * 4,
    delay: Math.random() * 0.3,
    rotation: Math.random() * 360,
    velocityX: (Math.random() - 0.5) * (isMilestone ? 400 : 200),
    velocityY: -200 - Math.random() * (isMilestone ? 300 : 150),
    shape: ['circle', 'square', 'star'][Math.floor(Math.random() * 3)] as 'circle' | 'square' | 'star',
  }));
}

export function CelebrationAnimation({ 
  type = 'daily', 
  streak = 0,
  onComplete 
}: CelebrationAnimationProps) {
  const [particles, setParticles] = useState<Particle[]>([]);
  const [showMilestoneText, setShowMilestoneText] = useState(false);
  
  const isMilestone = type === 'milestone' || [7, 14, 30, 60, 100, 365].includes(streak);
  const particleCount = isMilestone ? 50 : 25;
  const colors = isMilestone ? MILESTONE_COLORS : CONFETTI_COLORS;
  const duration = isMilestone ? 2500 : 1500;

  useEffect(() => {
    setParticles(generateParticles(particleCount, colors, isMilestone));
    
    if (isMilestone) {
      setTimeout(() => setShowMilestoneText(true), 200);
    }

    const timer = setTimeout(() => {
      setParticles([]);
      setShowMilestoneText(false);
      onComplete?.();
    }, duration);

    return () => clearTimeout(timer);
  }, []);

  if (particles.length === 0 && !showMilestoneText) return null;

  const getMilestoneMessage = () => {
    if (streak >= 365) return '🏆 1 Year!';
    if (streak >= 100) return '💯 100 Days!';
    if (streak >= 60) return '🌟 60 Days!';
    if (streak >= 30) return '🔥 30 Days!';
    if (streak >= 14) return '⭐ 2 Weeks!';
    if (streak >= 7) return '🎯 1 Week!';
    return '✨ Great Job!';
  };

  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-50">
      {/* Particles */}
      {particles.map((particle) => (
        <div
          key={particle.id}
          className={cn(
            'absolute opacity-0',
            isMilestone ? 'animate-confetti-burst' : 'animate-confetti-fall'
          )}
          style={{
            left: `${particle.x}%`,
            top: `${particle.y}%`,
            width: particle.size,
            height: particle.size,
            backgroundColor: particle.color,
            borderRadius: particle.shape === 'circle' ? '50%' : particle.shape === 'star' ? '0' : '2px',
            animationDelay: `${particle.delay}s`,
            animationDuration: `${duration / 1000}s`,
            transform: `rotate(${particle.rotation}deg)`,
            '--velocity-x': `${particle.velocityX}px`,
            '--velocity-y': `${particle.velocityY}px`,
          } as React.CSSProperties}
        />
      ))}

      {/* Milestone text overlay */}
      {showMilestoneText && isMilestone && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="animate-milestone-pop text-center">
            <div className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent drop-shadow-lg">
              {getMilestoneMessage()}
            </div>
            <div className="text-lg text-muted-foreground mt-2 animate-fade-in" style={{ animationDelay: '0.3s' }}>
              {streak} day streak! Keep going!
            </div>
          </div>
        </div>
      )}

      {/* Glow effect for milestones */}
      {isMilestone && (
        <div className="absolute inset-0 bg-primary/5 animate-pulse-glow pointer-events-none" />
      )}
    </div>
  );
}

// Hook to manage celebration state
export function useCelebration() {
  const [celebration, setCelebration] = useState<{
    show: boolean;
    type: 'daily' | 'milestone';
    streak: number;
  } | null>(null);

  const celebrate = (streak: number, wasCompletedBefore: boolean) => {
    if (wasCompletedBefore) return; // Don't celebrate if unchecking
    
    const isMilestone = [7, 14, 30, 60, 100, 365].includes(streak);
    setCelebration({
      show: true,
      type: isMilestone ? 'milestone' : 'daily',
      streak,
    });
  };

  const clearCelebration = () => setCelebration(null);

  return { celebration, celebrate, clearCelebration };
}

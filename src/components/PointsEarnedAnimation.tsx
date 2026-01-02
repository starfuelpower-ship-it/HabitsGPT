import { useEffect, useState } from 'react';
import { Sparkles, Coins } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useSoundEffects } from '@/hooks/useSoundEffects';

interface Particle {
  id: number;
  x: number;
  y: number;
  rotation: number;
  scale: number;
  delay: number;
}

interface PointsEarnedAnimationProps {
  amount: number;
  type: string;
  onComplete?: () => void;
}

export function PointsEarnedAnimation({ amount, type, onComplete }: PointsEarnedAnimationProps) {
  const [particles, setParticles] = useState<Particle[]>([]);
  const [showAmount, setShowAmount] = useState(true);
  const { playSound } = useSoundEffects();

  useEffect(() => {
    // Play coin sound
    playSound('success');

    // Generate sparkle particles
    const newParticles: Particle[] = Array.from({ length: 12 }, (_, i) => ({
      id: i,
      x: Math.random() * 100 - 50,
      y: Math.random() * 60 - 30,
      rotation: Math.random() * 360,
      scale: 0.5 + Math.random() * 0.5,
      delay: Math.random() * 0.3,
    }));
    setParticles(newParticles);

    // Clean up after animation
    const timer = setTimeout(() => {
      setShowAmount(false);
      onComplete?.();
    }, 2000);

    return () => clearTimeout(timer);
  }, [amount, playSound, onComplete]);

  if (!showAmount) return null;

  return (
    <div className="fixed inset-0 pointer-events-none z-50 flex items-center justify-center">
      {/* Central coin burst */}
      <div className="relative animate-bounce-in">
        {/* Glow effect */}
        <div className="absolute inset-0 bg-amber-400/30 rounded-full blur-xl animate-pulse scale-150" />
        
        {/* Main coin display */}
        <div className={cn(
          "relative flex items-center gap-3 px-6 py-4 rounded-2xl",
          "bg-gradient-to-br from-amber-100 via-yellow-100 to-amber-200",
          "dark:from-amber-900/90 dark:via-yellow-900/90 dark:to-amber-800/90",
          "border-2 border-amber-300/50 dark:border-amber-600/50",
          "shadow-2xl shadow-amber-500/30"
        )}>
          <div className="relative">
            <Coins className="w-10 h-10 text-amber-600 dark:text-amber-400 animate-spin-slow" />
            <Sparkles className="absolute -top-1 -right-1 w-4 h-4 text-amber-500 animate-pulse" />
          </div>
          <div className="flex flex-col">
            <span className="text-3xl font-bold text-amber-700 dark:text-amber-300 animate-scale-in">
              +{amount}
            </span>
            <span className="text-xs text-amber-600/80 dark:text-amber-400/80 font-medium">
              {type === 'habit_complete' && 'Habit completed!'}
              {type === 'streak_bonus' && 'Streak bonus!'}
              {type === 'all_complete' && 'All habits done!'}
              {type === 'daily_bonus' && 'Daily check-in!'}
              {type === 'weekly_bonus' && 'Weekly bonus!'}
              {!['habit_complete', 'streak_bonus', 'all_complete', 'daily_bonus', 'weekly_bonus'].includes(type) && 'Points earned!'}
            </span>
          </div>
        </div>

        {/* Sparkle particles */}
        {particles.map((particle) => (
          <div
            key={particle.id}
            className="absolute top-1/2 left-1/2 animate-sparkle-burst"
            style={{
              transform: `translate(-50%, -50%) translate(${particle.x}px, ${particle.y}px) rotate(${particle.rotation}deg) scale(${particle.scale})`,
              animationDelay: `${particle.delay}s`,
            }}
          >
            <Sparkles className="w-4 h-4 text-amber-400" />
          </div>
        ))}
      </div>

      <style>{`
        @keyframes bounce-in {
          0% { opacity: 0; transform: scale(0.3); }
          50% { opacity: 1; transform: scale(1.1); }
          70% { transform: scale(0.9); }
          100% { transform: scale(1); }
        }
        @keyframes scale-in {
          0% { transform: scale(0); }
          100% { transform: scale(1); }
        }
        @keyframes spin-slow {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        @keyframes sparkle-burst {
          0% { opacity: 1; transform: translate(-50%, -50%) translate(0, 0) scale(0); }
          50% { opacity: 1; transform: translate(-50%, -50%) translate(var(--x, 0), var(--y, 0)) scale(1); }
          100% { opacity: 0; transform: translate(-50%, -50%) translate(var(--x, 0), var(--y, 0)) scale(0); }
        }
        .animate-bounce-in {
          animation: bounce-in 0.6s cubic-bezier(0.68, -0.55, 0.265, 1.55) forwards;
        }
        .animate-scale-in {
          animation: scale-in 0.4s ease-out 0.2s backwards;
        }
        .animate-spin-slow {
          animation: spin-slow 3s linear infinite;
        }
        .animate-sparkle-burst {
          animation: sparkle-burst 1s ease-out forwards;
        }
      `}</style>
    </div>
  );
}

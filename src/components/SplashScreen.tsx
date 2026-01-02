import { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';

interface SplashScreenProps {
  onComplete: () => void;
  minDuration?: number;
}

export function SplashScreen({ onComplete, minDuration = 2000 }: SplashScreenProps) {
  const [phase, setPhase] = useState<'growing' | 'complete'>('growing');
  const [plantStage, setPlantStage] = useState(0);

  useEffect(() => {
    // Animate plant growth
    const growthInterval = setInterval(() => {
      setPlantStage(prev => {
        if (prev >= 4) {
          clearInterval(growthInterval);
          return prev;
        }
        return prev + 1;
      });
    }, 400);

    // Complete after min duration
    const timer = setTimeout(() => {
      setPhase('complete');
      setTimeout(onComplete, 500);
    }, minDuration);

    return () => {
      clearInterval(growthInterval);
      clearTimeout(timer);
    };
  }, [minDuration, onComplete]);

  return (
    <div 
      className={cn(
        'fixed inset-0 z-[100] bg-background flex flex-col items-center justify-center transition-opacity duration-500',
        phase === 'complete' && 'opacity-0 pointer-events-none'
      )}
    >
      {/* Plant Animation */}
      <div className="relative w-32 h-32 mb-8">
        <svg viewBox="0 0 100 100" className="w-full h-full">
          {/* Pot */}
          <path
            d="M30 80 L35 95 L65 95 L70 80 Z"
            className="fill-amber-600"
          />
          <ellipse cx="50" cy="80" rx="22" ry="5" className="fill-amber-700" />
          
          {/* Soil */}
          <ellipse cx="50" cy="80" rx="18" ry="4" className="fill-amber-900" />
          
          {/* Plant stages */}
          {plantStage >= 0 && (
            <g className="animate-fade-in">
              {/* Seed/Sprout */}
              {plantStage === 0 && (
                <circle cx="50" cy="76" r="3" className="fill-green-700" />
              )}
              
              {/* Small sprout */}
              {plantStage >= 1 && (
                <path
                  d="M50 76 L50 65"
                  className="stroke-green-600"
                  strokeWidth="3"
                  strokeLinecap="round"
                />
              )}
              
              {/* First leaves */}
              {plantStage >= 2 && (
                <g className="animate-scale-in">
                  <ellipse cx="44" cy="62" rx="6" ry="4" className="fill-green-500" transform="rotate(-30 44 62)" />
                  <ellipse cx="56" cy="62" rx="6" ry="4" className="fill-green-500" transform="rotate(30 56 62)" />
                </g>
              )}
              
              {/* Growing stem */}
              {plantStage >= 3 && (
                <path
                  d="M50 65 L50 50"
                  className="stroke-green-600 animate-fade-in"
                  strokeWidth="3"
                  strokeLinecap="round"
                />
              )}
              
              {/* More leaves and flower */}
              {plantStage >= 4 && (
                <g className="animate-scale-in">
                  <ellipse cx="42" cy="52" rx="7" ry="5" className="fill-green-400" transform="rotate(-40 42 52)" />
                  <ellipse cx="58" cy="52" rx="7" ry="5" className="fill-green-400" transform="rotate(40 58 52)" />
                  <circle cx="50" cy="42" r="8" className="fill-primary" />
                  <circle cx="50" cy="42" r="5" className="fill-yellow-300" />
                </g>
              )}
            </g>
          )}
        </svg>
        
        {/* Sparkles */}
        {plantStage >= 4 && (
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute top-4 left-8 w-2 h-2 bg-yellow-300 rounded-full animate-ping" />
            <div className="absolute top-8 right-6 w-1.5 h-1.5 bg-primary rounded-full animate-ping" style={{ animationDelay: '0.3s' }} />
            <div className="absolute top-2 right-10 w-1 h-1 bg-yellow-200 rounded-full animate-ping" style={{ animationDelay: '0.6s' }} />
          </div>
        )}
      </div>

      {/* App Name */}
      <h1 className="text-3xl font-bold text-foreground mb-2 animate-fade-in">
        Cozy Habits
      </h1>
      <p className="text-muted-foreground animate-fade-in" style={{ animationDelay: '0.3s' }}>
        Grow your habits, grow yourself
      </p>

      {/* Loading indicator */}
      <div className="mt-8 flex gap-1">
        {[0, 1, 2].map((i) => (
          <div
            key={i}
            className="w-2 h-2 rounded-full bg-primary animate-bounce"
            style={{ animationDelay: `${i * 0.15}s` }}
          />
        ))}
      </div>
    </div>
  );
}

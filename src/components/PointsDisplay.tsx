import { usePoints } from '@/contexts/PointsContext';
import { useAuth } from '@/contexts/AuthContext';
import { Coins, Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useNavigate } from 'react-router-dom';
import { useSoundEffects } from '@/hooks/useSoundEffects';

export function PointsDisplay() {
  const { user } = useAuth();
  const { balance, recentEarning, isLoading } = usePoints();
  const navigate = useNavigate();
  const { playSound } = useSoundEffects();

  if (!user) return null;

  const handleClick = () => {
    playSound('click');
    navigate('/rewards');
  };

  return (
    <button
      onClick={handleClick}
      className={cn(
        'relative flex items-center gap-2 px-3 py-1.5 rounded-full',
        'bg-gradient-to-r from-amber-100 to-yellow-100 dark:from-amber-900/30 dark:to-yellow-900/30',
        'border border-amber-200/50 dark:border-amber-700/50',
        'hover:scale-105 active:scale-95 transition-all duration-200',
        'shadow-sm hover:shadow-md'
      )}
    >
      <Coins className="w-4 h-4 text-amber-600 dark:text-amber-400" />
      <span className="font-semibold text-amber-700 dark:text-amber-300 text-sm">
        {isLoading ? '...' : balance.toLocaleString()}
      </span>

      {/* Point earning animation */}
      {recentEarning && (
        <div className="absolute -top-6 left-1/2 -translate-x-1/2 animate-bounce-up">
          <div className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-green-500 text-white text-xs font-bold shadow-lg">
            <Sparkles className="w-3 h-3" />
            +{recentEarning.amount}
          </div>
        </div>
      )}

      <style>{`
        @keyframes bounce-up {
          0% { opacity: 0; transform: translateX(-50%) translateY(0); }
          20% { opacity: 1; transform: translateX(-50%) translateY(-10px); }
          100% { opacity: 0; transform: translateX(-50%) translateY(-30px); }
        }
        .animate-bounce-up {
          animation: bounce-up 1.5s ease-out forwards;
        }
      `}</style>
    </button>
  );
}

import { Star, Zap, Trophy } from 'lucide-react';
import { Progress } from '@/components/ui/progress';

interface GroupXPBarProps {
  totalXP: number;
  level: number;
}

export const GroupXPBar = ({ totalXP, level }: GroupXPBarProps) => {
  const xpPerLevel = 500;
  const currentLevelXP = totalXP % xpPerLevel;
  const progressPercent = (currentLevelXP / xpPerLevel) * 100;
  const xpToNextLevel = xpPerLevel - currentLevelXP;

  const getLevelColor = () => {
    if (level >= 10) return 'from-yellow-400 to-amber-500';
    if (level >= 7) return 'from-purple-400 to-pink-500';
    if (level >= 4) return 'from-blue-400 to-cyan-500';
    return 'from-green-400 to-emerald-500';
  };

  const getLevelTitle = () => {
    if (level >= 10) return 'Legendary';
    if (level >= 7) return 'Elite';
    if (level >= 4) return 'Advanced';
    return 'Rising';
  };

  return (
    <div className="bg-gradient-to-r from-primary/5 via-accent/5 to-secondary/5 rounded-2xl p-4 border border-primary/10">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${getLevelColor()} flex items-center justify-center shadow-lg`}>
            <span className="text-lg font-bold text-white">{level}</span>
          </div>
          <div>
            <h4 className="font-semibold text-sm">Group Level</h4>
            <p className="text-xs text-muted-foreground">{getLevelTitle()} Team</p>
          </div>
        </div>
        <div className="flex items-center gap-1 bg-background/80 px-3 py-1.5 rounded-full">
          <Star className="w-4 h-4 text-yellow-500" />
          <span className="font-bold text-sm">{totalXP} XP</span>
        </div>
      </div>

      <div className="space-y-2">
        <div className="flex justify-between text-xs text-muted-foreground">
          <span className="flex items-center gap-1">
            <Zap className="w-3 h-3" />
            Level {level}
          </span>
          <span className="flex items-center gap-1">
            <Trophy className="w-3 h-3" />
            Level {level + 1}
          </span>
        </div>
        <div className="relative">
          <Progress value={progressPercent} className="h-3 bg-muted/50" />
          <div 
            className={`absolute inset-y-0 left-0 bg-gradient-to-r ${getLevelColor()} rounded-full transition-all duration-500`}
            style={{ width: `${progressPercent}%` }}
          />
        </div>
        <p className="text-xs text-center text-muted-foreground">
          {xpToNextLevel} XP to next level
        </p>
      </div>

      <div className="mt-3 grid grid-cols-3 gap-2 text-center">
        <div className="bg-background/60 rounded-lg p-2">
          <span className="text-xs text-muted-foreground">Habit</span>
          <p className="text-sm font-semibold text-green-500">+10 XP</p>
        </div>
        <div className="bg-background/60 rounded-lg p-2">
          <span className="text-xs text-muted-foreground">Streak</span>
          <p className="text-sm font-semibold text-orange-500">+25 XP</p>
        </div>
        <div className="bg-background/60 rounded-lg p-2">
          <span className="text-xs text-muted-foreground">Challenge</span>
          <p className="text-sm font-semibold text-purple-500">+50 XP</p>
        </div>
      </div>
    </div>
  );
};

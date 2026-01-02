import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCozyCompanion, Achievement } from '@/hooks/useCozyCompanion';
import { BottomTabBar } from '@/components/BottomTabBar';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Trophy, Lock, Sparkles, Gift, Cat, Leaf, Clock, Compass } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useSoundEffects } from '@/hooks/useSoundEffects';

const CATEGORY_INFO: Record<string, { label: string; icon: React.ReactNode; color: string }> = {
  habit: { label: 'Habits', icon: <Leaf className="w-4 h-4" />, color: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300' },
  cat: { label: 'Cat', icon: <Cat className="w-4 h-4" />, color: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300' },
  plant: { label: 'Plant', icon: <Leaf className="w-4 h-4" />, color: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300' },
  discovery: { label: 'Discovery', icon: <Compass className="w-4 h-4" />, color: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300' },
  time: { label: 'Milestones', icon: <Clock className="w-4 h-4" />, color: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300' },
};

const AchievementCard = ({ achievement }: { achievement: Achievement }) => {
  const isLocked = !achievement.isEarned && achievement.isHidden;
  const categoryInfo = CATEGORY_INFO[achievement.category] || CATEGORY_INFO.habit;

  return (
    <div
      className={cn(
        'relative p-4 rounded-2xl border transition-all',
        achievement.isEarned
          ? 'bg-primary/5 border-primary/30'
          : isLocked
          ? 'bg-muted/50 border-border opacity-60'
          : 'bg-card border-border'
      )}
    >
      {/* Badge for earned */}
      {achievement.isEarned && (
        <div className="absolute -top-2 -right-2">
          <div className="w-6 h-6 rounded-full bg-primary flex items-center justify-center">
            <Sparkles className="w-3 h-3 text-primary-foreground" />
          </div>
        </div>
      )}

      <div className="flex items-start gap-3">
        {/* Icon */}
        <div
          className={cn(
            'flex-shrink-0 w-12 h-12 rounded-xl flex items-center justify-center text-2xl',
            achievement.isEarned ? 'bg-primary/10' : 'bg-muted'
          )}
        >
          {isLocked ? (
            <Lock className="w-5 h-5 text-muted-foreground" />
          ) : (
            <span>{achievement.icon}</span>
          )}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <h3 className={cn(
              'font-semibold text-sm',
              achievement.isEarned ? 'text-foreground' : 'text-muted-foreground'
            )}>
              {isLocked ? '???' : achievement.name}
            </h3>
            <Badge variant="secondary" className={cn('text-[10px] px-1.5 py-0', categoryInfo.color)}>
              {categoryInfo.label}
            </Badge>
          </div>
          <p className={cn(
            'text-xs leading-relaxed',
            achievement.isEarned ? 'text-muted-foreground' : 'text-muted-foreground/70'
          )}>
            {isLocked ? 'Keep exploring to discover this achievement...' : achievement.description}
          </p>
          
          {/* Points reward */}
          {achievement.pointsReward > 0 && !isLocked && (
            <div className="flex items-center gap-1 mt-2">
              <Gift className="w-3 h-3 text-amber-500" />
              <span className="text-xs text-amber-600 dark:text-amber-400 font-medium">
                +{achievement.pointsReward} points
              </span>
            </div>
          )}

          {/* Earned date */}
          {achievement.isEarned && achievement.earnedAt && (
            <p className="text-[10px] text-muted-foreground mt-1">
              Earned {new Date(achievement.earnedAt).toLocaleDateString()}
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

const Achievements = () => {
  const navigate = useNavigate();
  const { playSound } = useSoundEffects();
  const { achievements, earnedAchievements, isLoading } = useCozyCompanion();
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  const categories = ['all', 'habit', 'cat', 'plant', 'discovery', 'time'];

  const filteredAchievements = selectedCategory === 'all'
    ? achievements
    : achievements.filter(a => a.category === selectedCategory);

  // Sort: earned first, then by sort order, hidden at end
  const sortedAchievements = [...filteredAchievements].sort((a, b) => {
    if (a.isEarned && !b.isEarned) return -1;
    if (!a.isEarned && b.isEarned) return 1;
    if (a.isHidden && !a.isEarned && (!b.isHidden || b.isEarned)) return 1;
    if (b.isHidden && !b.isEarned && (!a.isHidden || a.isEarned)) return -1;
    return 0;
  });

  const earnedCount = earnedAchievements.length;
  const totalCount = achievements.filter(a => !a.isHidden || a.isEarned).length;

  return (
    <div className="min-h-screen bg-background pb-24">
      <div className="max-w-lg mx-auto px-4 pt-6">
        {/* Header */}
        <header className="flex items-center gap-3 mb-6">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => {
              playSound('click');
              navigate(-1);
            }}
            className="text-muted-foreground"
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div className="flex-1">
            <h1 className="text-2xl font-bold text-foreground">Achievements</h1>
            <p className="text-sm text-muted-foreground">Little moments, big meaning</p>
          </div>
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-primary/10">
            <Trophy className="w-4 h-4 text-primary" />
            <span className="font-bold text-primary">{earnedCount}/{totalCount}</span>
          </div>
        </header>

        {/* Progress */}
        <div className="ios-card p-4 mb-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-muted-foreground">Collection Progress</span>
            <span className="text-sm font-medium text-foreground">
              {Math.round((earnedCount / Math.max(totalCount, 1)) * 100)}%
            </span>
          </div>
          <div className="h-2 bg-muted rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-primary to-primary/70 rounded-full transition-all duration-500"
              style={{ width: `${(earnedCount / Math.max(totalCount, 1)) * 100}%` }}
            />
          </div>
          <p className="text-xs text-muted-foreground mt-2 text-center">
            {earnedCount === 0
              ? 'Start your cozy journey to unlock achievements'
              : earnedCount < 5
              ? 'Keep going! More discoveries await'
              : earnedCount < 10
              ? 'You are building something beautiful'
              : 'Amazing progress! You are a true companion'}
          </p>
        </div>

        {/* Category Filter */}
        <div className="flex gap-2 mb-6 overflow-x-auto pb-2 -mx-2 px-2">
          {categories.map((cat) => {
            const info = CATEGORY_INFO[cat];
            return (
              <button
                key={cat}
                onClick={() => {
                  playSound('click');
                  setSelectedCategory(cat);
                }}
                className={cn(
                  'flex items-center gap-1.5 px-3 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all',
                  selectedCategory === cat
                    ? 'bg-primary text-primary-foreground shadow-md'
                    : 'bg-muted hover:bg-muted/80 text-muted-foreground'
                )}
              >
                {cat === 'all' ? (
                  <>
                    <Trophy className="w-3.5 h-3.5" />
                    All
                  </>
                ) : (
                  <>
                    {info?.icon}
                    {info?.label}
                  </>
                )}
              </button>
            );
          })}
        </div>

        {/* Achievements List */}
        {isLoading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-24 rounded-2xl bg-muted animate-pulse" />
            ))}
          </div>
        ) : sortedAchievements.length === 0 ? (
          <div className="text-center py-12">
            <Trophy className="w-12 h-12 mx-auto mb-4 text-muted-foreground/50" />
            <p className="text-muted-foreground">No achievements in this category yet</p>
          </div>
        ) : (
          <div className="space-y-3">
            {sortedAchievements.map((achievement) => (
              <AchievementCard key={achievement.id} achievement={achievement} />
            ))}
          </div>
        )}

        {/* Hidden achievements hint */}
        {achievements.some(a => a.isHidden && !a.isEarned) && (
          <div className="mt-6 p-4 rounded-2xl bg-muted/50 border border-dashed border-border">
            <p className="text-xs text-muted-foreground text-center">
              ✨ Some achievements are hidden. Keep exploring to discover them naturally.
            </p>
          </div>
        )}
      </div>

      <BottomTabBar />
    </div>
  );
};

export default Achievements;

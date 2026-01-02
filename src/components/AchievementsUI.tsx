import { Trophy, Lock, Sparkles, ChevronDown } from 'lucide-react';
import { useAchievements } from '@/hooks/useAchievements';
import { cn } from '@/lib/utils';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';

interface AchievementsUIProps {
  compact?: boolean;
}

export function AchievementsUI({ compact = false }: AchievementsUIProps) {
  const {
    achievementsByCategory,
    sortedCategories,
    earnedAchievements,
    loading,
    totalAchievements,
    earnedCount,
    totalPoints,
    CATEGORY_LABELS,
  } = useAchievements();

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary" />
      </div>
    );
  }

  if (compact) {
    return (
      <div className="flex items-center gap-2">
        <Trophy className="w-4 h-4 text-primary" />
        <span className="text-sm font-medium">{earnedCount}/{totalAchievements}</span>
        <span className="text-xs text-muted-foreground">achievements</span>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Trophy className="w-5 h-5 text-primary" />
          <h3 className="font-semibold text-foreground">Achievements</h3>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-sm text-muted-foreground">
            {earnedCount}/{totalAchievements}
          </span>
          {totalPoints > 0 && (
            <span className="text-xs text-primary font-medium">
              +{totalPoints} pts earned
            </span>
          )}
        </div>
      </div>

      {/* Achievement Categories as Accordions */}
      <Accordion type="multiple" className="space-y-2">
        {sortedCategories.map((category) => {
          const categoryAchievements = achievementsByCategory[category];
          const visibleAchievements = categoryAchievements.filter(a => 
            !a.is_hidden || earnedAchievements.has(a.id)
          );
          
          if (visibleAchievements.length === 0) return null;

          const earnedInCategory = visibleAchievements.filter(a => earnedAchievements.has(a.id)).length;

          return (
            <AccordionItem 
              key={category} 
              value={category}
              className="border border-border/50 rounded-xl overflow-hidden bg-card/50"
            >
              <AccordionTrigger className="px-4 py-3 hover:no-underline hover:bg-muted/30">
                <div className="flex items-center justify-between w-full pr-2">
                  <span className="text-sm font-medium text-foreground">
                    {CATEGORY_LABELS[category] || category}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {earnedInCategory}/{visibleAchievements.length}
                  </span>
                </div>
              </AccordionTrigger>
              <AccordionContent className="px-4 pb-4">
                <div className="grid grid-cols-2 gap-2 pt-2">
                  {visibleAchievements.map((achievement) => {
                    const isEarned = earnedAchievements.has(achievement.id);
                    const isSecret = achievement.is_hidden;

                    return (
                      <div
                        key={achievement.id}
                        className={cn(
                          'relative p-3 rounded-xl border transition-all',
                          isEarned
                            ? 'bg-primary/5 border-primary/30'
                            : 'bg-muted/30 border-border/50'
                        )}
                      >
                        {/* Icon */}
                        <div
                          className={cn(
                            'w-10 h-10 rounded-lg flex items-center justify-center mb-2 text-xl',
                            isEarned ? 'bg-primary/15' : 'bg-muted'
                          )}
                        >
                          {isEarned ? (
                            achievement.icon
                          ) : (
                            <Lock className="w-4 h-4 text-muted-foreground" />
                          )}
                        </div>

                        {/* Info */}
                        <h5 className={cn(
                          'font-medium text-xs mb-0.5 line-clamp-1',
                          isEarned ? 'text-foreground' : 'text-muted-foreground'
                        )}>
                          {achievement.name}
                        </h5>
                        <p className="text-[10px] text-muted-foreground line-clamp-2">
                          {achievement.description}
                        </p>

                        {/* Points Badge */}
                        {isEarned && achievement.points_reward > 0 && (
                          <div className="absolute top-2 right-2 flex items-center gap-0.5 text-[10px] text-primary font-medium">
                            <Sparkles className="w-3 h-3" />
                            +{achievement.points_reward}
                          </div>
                        )}

                        {/* Secret Badge */}
                        {isSecret && isEarned && (
                          <div className="absolute bottom-2 right-2">
                            <span className="text-[9px] text-muted-foreground bg-muted px-1.5 py-0.5 rounded">
                              Secret
                            </span>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </AccordionContent>
            </AccordionItem>
          );
        })}
      </Accordion>

      {/* Encouragement Footer */}
      <div className="text-center pt-2">
        <p className="text-xs text-muted-foreground">
          {earnedCount === 0 
            ? "Every small step counts. You're doing great just by being here."
            : earnedCount < 5
            ? "You're making progress! Keep showing up."
            : earnedCount < 15
            ? "Look at all you've achieved! Keep going."
            : "You're amazing! So many achievements unlocked."}
        </p>
      </div>
    </div>
  );
}

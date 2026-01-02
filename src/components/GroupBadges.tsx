import { Award, Lock, Star } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

interface Badge {
  id: string;
  name: string;
  description: string | null;
  icon: string;
  xp_required: number;
  badge_type: string;
}

interface UserBadge {
  badge_id: string;
  earned_at: string;
}

interface GroupBadgesProps {
  allBadges: Badge[];
  userBadges: UserBadge[];
  totalXP: number;
}

export const GroupBadges = ({ allBadges, userBadges, totalXP }: GroupBadgesProps) => {
  const earnedBadgeIds = new Set(userBadges.map(ub => ub.badge_id));

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold flex items-center gap-2">
          <Award className="w-5 h-5 text-primary" />
          Badges
        </h3>
        <span className="text-xs text-muted-foreground">
          {userBadges.length}/{allBadges.length} earned
        </span>
      </div>

      <div className="grid grid-cols-4 gap-3">
        <TooltipProvider>
          {allBadges.map((badge) => {
            const isEarned = earnedBadgeIds.has(badge.id);
            const canUnlock = totalXP >= badge.xp_required;

            return (
              <Tooltip key={badge.id}>
                <TooltipTrigger asChild>
                  <Card 
                    className={`p-3 text-center transition-all cursor-pointer hover:scale-105 ${
                      isEarned 
                        ? 'bg-gradient-to-br from-primary/10 to-accent/10 border-primary/30 shadow-lg' 
                        : canUnlock
                        ? 'bg-muted/30 border-dashed border-primary/30'
                        : 'bg-muted/20 opacity-50'
                    }`}
                  >
                    <div className="relative">
                      <span className="text-2xl">{badge.icon}</span>
                      {!isEarned && (
                        <div className="absolute -bottom-1 -right-1">
                          <Lock className="w-3 h-3 text-muted-foreground" />
                        </div>
                      )}
                      {isEarned && (
                        <div className="absolute -top-1 -right-1">
                          <Star className="w-3 h-3 text-yellow-500 fill-yellow-500" />
                        </div>
                      )}
                    </div>
                    <p className="text-xs font-medium mt-1 truncate">{badge.name}</p>
                  </Card>
                </TooltipTrigger>
                <TooltipContent side="bottom" className="max-w-[200px]">
                  <div className="text-center">
                    <p className="font-semibold">{badge.name}</p>
                    <p className="text-xs text-muted-foreground">{badge.description}</p>
                    {!isEarned && (
                      <p className="text-xs mt-1 text-primary">
                        Requires {badge.xp_required} XP
                      </p>
                    )}
                  </div>
                </TooltipContent>
              </Tooltip>
            );
          })}
        </TooltipProvider>
      </div>
    </div>
  );
};

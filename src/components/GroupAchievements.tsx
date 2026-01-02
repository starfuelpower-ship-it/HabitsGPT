import { Trophy, Sparkles, Star, Target, Users, Flame } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { formatDistanceToNow } from 'date-fns';

interface Achievement {
  id: string;
  achievement_type: string;
  title: string;
  description: string | null;
  achieved_at: string;
}

interface GroupAchievementsProps {
  achievements: Achievement[];
}

const achievementIcons: Record<string, { icon: React.ReactNode; color: string }> = {
  'first_challenge': { icon: <Target className="w-5 h-5" />, color: 'text-blue-500' },
  'level_up': { icon: <Star className="w-5 h-5" />, color: 'text-yellow-500' },
  'streak_milestone': { icon: <Flame className="w-5 h-5" />, color: 'text-orange-500' },
  'member_milestone': { icon: <Users className="w-5 h-5" />, color: 'text-green-500' },
  'challenge_complete': { icon: <Trophy className="w-5 h-5" />, color: 'text-purple-500' },
  'default': { icon: <Sparkles className="w-5 h-5" />, color: 'text-primary' },
};

export const GroupAchievements = ({ achievements }: GroupAchievementsProps) => {
  if (achievements.length === 0) {
    return (
      <div className="space-y-4">
        <h3 className="font-semibold flex items-center gap-2">
          <Trophy className="w-5 h-5 text-primary" />
          Group Achievements
        </h3>
        <Card className="p-6 text-center bg-muted/30">
          <Sparkles className="w-10 h-10 mx-auto mb-2 text-muted-foreground/50" />
          <p className="text-sm text-muted-foreground">No achievements yet</p>
          <p className="text-xs text-muted-foreground mt-1">Keep going to unlock rewards!</p>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold flex items-center gap-2">
          <Trophy className="w-5 h-5 text-primary" />
          Group Achievements
        </h3>
        <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded-full font-medium">
          {achievements.length} unlocked
        </span>
      </div>

      <div className="space-y-2">
        {achievements.slice(0, 5).map((achievement) => {
          const { icon, color } = achievementIcons[achievement.achievement_type] || achievementIcons.default;

          return (
            <Card 
              key={achievement.id}
              className="p-3 flex items-center gap-3 bg-gradient-to-r from-primary/5 to-transparent hover:from-primary/10 transition-colors"
            >
              <div className={`w-10 h-10 rounded-xl bg-background flex items-center justify-center ${color}`}>
                {icon}
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="font-medium text-sm truncate">{achievement.title}</h4>
                {achievement.description && (
                  <p className="text-xs text-muted-foreground truncate">{achievement.description}</p>
                )}
              </div>
              <span className="text-xs text-muted-foreground whitespace-nowrap">
                {formatDistanceToNow(new Date(achievement.achieved_at), { addSuffix: true })}
              </span>
            </Card>
          );
        })}
      </div>

      {achievements.length > 5 && (
        <p className="text-xs text-center text-muted-foreground">
          +{achievements.length - 5} more achievements
        </p>
      )}
    </div>
  );
};

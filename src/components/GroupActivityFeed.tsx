import { useState } from 'react';
import { Flame, CheckCircle, Star, Zap } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface Activity {
  id: string;
  user_id: string;
  activity_type: string;
  habit_name: string | null;
  streak_count: number | null;
  created_at: string;
  profile?: {
    display_name: string | null;
    email: string | null;
  };
  reactions: { emoji: string; count: number; hasReacted: boolean }[];
}

interface GroupActivityFeedProps {
  activities: Activity[];
  currentUserId: string;
  onReactionChange: () => void;
}

const REACTION_EMOJIS = ['🔥', '👏', '💪', '✨'];

export function GroupActivityFeed({ activities, currentUserId, onReactionChange }: GroupActivityFeedProps) {
  const [loadingReaction, setLoadingReaction] = useState<string | null>(null);

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'habit_completed':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'all_completed':
        return <Star className="w-4 h-4 text-yellow-500" />;
      case 'streak_milestone':
        return <Zap className="w-4 h-4 text-orange-500" />;
      default:
        return <CheckCircle className="w-4 h-4 text-primary" />;
    }
  };

  const getActivityMessage = (activity: Activity) => {
    const name = activity.profile?.display_name || activity.profile?.email?.split('@')[0] || 'Someone';
    switch (activity.activity_type) {
      case 'habit_completed':
        return <><strong>{name}</strong> completed <strong>{activity.habit_name}</strong></>;
      case 'all_completed':
        return <><strong>{name}</strong> completed all habits today! 🎉</>;
      case 'streak_milestone':
        return <><strong>{name}</strong> reached a {activity.streak_count}-day streak! 🔥</>;
      default:
        return <><strong>{name}</strong> did something awesome</>;
    }
  };

  const handleReaction = async (activityId: string, emoji: string, hasReacted: boolean) => {
    setLoadingReaction(`${activityId}-${emoji}`);
    try {
      if (hasReacted) {
        await supabase
          .from('group_reactions')
          .delete()
          .eq('activity_id', activityId)
          .eq('user_id', currentUserId)
          .eq('emoji', emoji);
      } else {
        await supabase
          .from('group_reactions')
          .insert({
            activity_id: activityId,
            user_id: currentUserId,
            emoji
          });
      }
      onReactionChange();
    } catch (error) {
      console.error('Error toggling reaction:', error);
      toast.error('Failed to add reaction');
    } finally {
      setLoadingReaction(null);
    }
  };

  if (activities.length === 0) {
    return (
      <div className="ios-card p-6">
        <div className="flex items-center gap-2 mb-4">
          <Flame className="w-5 h-5 text-primary" />
          <h3 className="font-semibold text-foreground">Activity Feed</h3>
        </div>
        <p className="text-center text-muted-foreground py-8">
          No activity yet. Complete habits to see updates here!
        </p>
      </div>
    );
  }

  return (
    <div className="ios-card p-6">
      <div className="flex items-center gap-2 mb-4">
        <Flame className="w-5 h-5 text-primary" />
        <h3 className="font-semibold text-foreground">Activity Feed</h3>
      </div>
      <div className="space-y-4">
        {activities.map((activity) => (
          <div key={activity.id} className="p-3 rounded-xl bg-muted/30">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                <span className="text-sm">
                  {activity.profile?.display_name?.[0]?.toUpperCase() || 
                   activity.profile?.email?.[0]?.toUpperCase() || '?'}
                </span>
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  {getActivityIcon(activity.activity_type)}
                  <p className="text-sm text-foreground">
                    {getActivityMessage(activity)}
                  </p>
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  {formatDistanceToNow(new Date(activity.created_at), { addSuffix: true })}
                </p>
                
                {/* Reactions */}
                <div className="flex items-center gap-1 mt-2 flex-wrap">
                  {REACTION_EMOJIS.map((emoji) => {
                    const reaction = activity.reactions.find(r => r.emoji === emoji);
                    const count = reaction?.count || 0;
                    const hasReacted = reaction?.hasReacted || false;
                    const isLoading = loadingReaction === `${activity.id}-${emoji}`;
                    
                    return (
                      <button
                        key={emoji}
                        onClick={() => handleReaction(activity.id, emoji, hasReacted)}
                        disabled={isLoading}
                        className={`
                          flex items-center gap-1 px-2 py-1 rounded-full text-sm transition-all
                          ${hasReacted 
                            ? 'bg-primary/20 border border-primary/30' 
                            : 'bg-muted/50 border border-transparent hover:bg-muted'
                          }
                          ${isLoading ? 'opacity-50' : ''}
                        `}
                      >
                        <span>{emoji}</span>
                        {count > 0 && <span className="text-xs text-muted-foreground">{count}</span>}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

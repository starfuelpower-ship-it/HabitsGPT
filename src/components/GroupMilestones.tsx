import { Heart, Lock } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useGroupMilestones, MilestoneWithStatus } from '@/hooks/useGroupMilestones';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { formatDistanceToNow } from 'date-fns';

interface GroupMilestonesProps {
  groupId: string;
}

export function GroupMilestones({ groupId }: GroupMilestonesProps) {
  const {
    groupedMilestones,
    earnedCount,
    totalCount,
    isLoading,
    CATEGORY_LABELS
  } = useGroupMilestones(groupId);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary" />
      </div>
    );
  }

  const categories = Object.keys(groupedMilestones);

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="ios-card p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Heart className="w-5 h-5 text-primary" />
            <h3 className="font-semibold text-foreground">Shared Moments</h3>
          </div>
          <span className="text-sm text-muted-foreground">
            {earnedCount}/{totalCount} together
          </span>
        </div>
        <p className="text-xs text-muted-foreground mt-2">
          These are moments you reached as a group. No pressure, just warmth.
        </p>
      </div>

      {/* Milestones by Category */}
      <Accordion type="multiple" className="space-y-2">
        {categories.map((category) => {
          const milestones = groupedMilestones[category];
          const earnedInCategory = milestones.filter(m => m.isEarned).length;
          
          // Hide seasonal if none earned
          if (category === 'seasonal' && earnedInCategory === 0) return null;

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
                    {earnedInCategory}/{milestones.length}
                  </span>
                </div>
              </AccordionTrigger>
              <AccordionContent className="px-4 pb-4">
                <div className="space-y-3 pt-2">
                  {milestones.map((milestone) => (
                    <MilestoneCard key={milestone.id} milestone={milestone} />
                  ))}
                </div>
              </AccordionContent>
            </AccordionItem>
          );
        })}
      </Accordion>

      {/* Encouragement */}
      <div className="text-center pt-2">
        <p className="text-xs text-muted-foreground">
          {earnedCount === 0
            ? "Every journey starts with showing up. You're already here together."
            : earnedCount < 3
            ? "You're building something gentle together."
            : "Look at all these moments you've shared."}
        </p>
      </div>
    </div>
  );
}

function MilestoneCard({ milestone }: { milestone: MilestoneWithStatus }) {
  return (
    <div
      className={cn(
        'relative p-4 rounded-xl border transition-all',
        milestone.isEarned
          ? 'bg-primary/5 border-primary/30'
          : 'bg-muted/30 border-border/50 opacity-60'
      )}
    >
      <div className="flex items-start gap-3">
        {/* Icon */}
        <div
          className={cn(
            'w-10 h-10 rounded-lg flex items-center justify-center text-xl flex-shrink-0',
            milestone.isEarned ? 'bg-primary/15' : 'bg-muted'
          )}
        >
          {milestone.isEarned ? (
            milestone.icon
          ) : (
            <Lock className="w-4 h-4 text-muted-foreground" />
          )}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <h4 className={cn(
            'font-medium text-sm',
            milestone.isEarned ? 'text-foreground' : 'text-muted-foreground'
          )}>
            {milestone.name}
          </h4>
          <p className="text-xs text-muted-foreground mt-0.5">
            {milestone.description}
          </p>
          
          {/* Achievement time */}
          {milestone.isEarned && milestone.achievedAt && (
            <p className="text-[10px] text-primary mt-2">
              Reached together {formatDistanceToNow(new Date(milestone.achievedAt), { addSuffix: true })}
            </p>
          )}
        </div>
      </div>

      {/* Seasonal badge */}
      {milestone.is_seasonal && milestone.isEarned && (
        <div className="absolute top-2 right-2">
          <span className="text-[9px] text-muted-foreground bg-muted px-1.5 py-0.5 rounded">
            Seasonal
          </span>
        </div>
      )}
    </div>
  );
}

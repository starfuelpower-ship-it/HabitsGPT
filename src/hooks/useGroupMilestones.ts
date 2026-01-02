import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

export interface MilestoneDefinition {
  id: string;
  key: string;
  name: string;
  description: string;
  category: string;
  icon: string;
  is_seasonal: boolean;
  sort_order: number;
}

export interface GroupMilestone {
  id: string;
  group_id: string;
  milestone_key: string;
  achieved_at: string;
}

export interface MilestoneWithStatus extends MilestoneDefinition {
  isEarned: boolean;
  achievedAt?: string;
}

const CATEGORY_LABELS: Record<string, string> = {
  progress: 'Gentle Progress',
  supportive: 'Supportive Moments',
  reflection: 'Reflection & Presence',
  seasonal: 'Seasonal Moments'
};

export function useGroupMilestones(groupId: string | null) {
  const { user } = useAuth();
  const [definitions, setDefinitions] = useState<MilestoneDefinition[]>([]);
  const [earnedMilestones, setEarnedMilestones] = useState<GroupMilestone[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchMilestones = useCallback(async () => {
    if (!groupId || !user) return;

    setIsLoading(true);
    try {
      const [defsResult, earnedResult] = await Promise.all([
        supabase
          .from('group_milestone_definitions')
          .select('*')
          .order('sort_order', { ascending: true }),
        supabase
          .from('group_milestones')
          .select('*')
          .eq('group_id', groupId)
      ]);

      if (defsResult.data) setDefinitions(defsResult.data);
      if (earnedResult.data) setEarnedMilestones(earnedResult.data);
    } catch (error) {
      console.error('Error fetching milestones:', error);
    } finally {
      setIsLoading(false);
    }
  }, [groupId, user]);

  useEffect(() => {
    fetchMilestones();
  }, [fetchMilestones]);

  const checkAndAwardMilestones = useCallback(async (context: {
    totalMembersWithHabits?: number;
    totalMembers?: number;
    uniqueActiveDays?: number;
    groupAgeDays?: number;
    memberReturned?: boolean;
    journalEntriesDays?: number;
    moodLogsDays?: number;
  }) => {
    if (!groupId || !user) return;

    const earnedKeys = new Set(earnedMilestones.map(m => m.milestone_key));
    const milestonesToAward: string[] = [];

    // First Steps Together - all members completed at least one habit
    if (context.totalMembersWithHabits && context.totalMembers && 
        context.totalMembersWithHabits >= context.totalMembers && 
        !earnedKeys.has('first_steps_together')) {
      milestonesToAward.push('first_steps_together');
    }

    // Seven Calm Days - habits across 7 different days
    if (context.uniqueActiveDays && context.uniqueActiveDays >= 7 && 
        !earnedKeys.has('seven_calm_days')) {
      milestonesToAward.push('seven_calm_days');
    }

    // Still Here - group active for 14 days
    if (context.groupAgeDays && context.groupAgeDays >= 14 && 
        !earnedKeys.has('still_here')) {
      milestonesToAward.push('still_here');
    }

    // Gentle Return - member returned after time away
    if (context.memberReturned && !earnedKeys.has('gentle_return')) {
      milestonesToAward.push('gentle_return');
    }

    // Shared Reflection - journal entries on different days
    if (context.journalEntriesDays && context.journalEntriesDays >= 3 && 
        !earnedKeys.has('shared_reflection')) {
      milestonesToAward.push('shared_reflection');
    }

    // Calm Check-Ins - moods logged across multiple days
    if (context.moodLogsDays && context.moodLogsDays >= 3 && 
        !earnedKeys.has('calm_check_ins')) {
      milestonesToAward.push('calm_check_ins');
    }

    // Check seasonal milestones
    const month = new Date().getMonth();
    let seasonKey: string | null = null;
    if (month >= 11 || month <= 1) seasonKey = 'winter_together';
    else if (month >= 2 && month <= 4) seasonKey = 'spring_reset';
    else if (month >= 5 && month <= 7) seasonKey = 'summer_ease';
    else if (month >= 8 && month <= 10) seasonKey = 'autumn_calm';

    if (seasonKey && context.groupAgeDays && context.groupAgeDays >= 14 && 
        !earnedKeys.has(seasonKey)) {
      milestonesToAward.push(seasonKey);
    }

    // Award milestones
    for (const key of milestonesToAward) {
      try {
        const { data } = await supabase.rpc('award_group_milestone', {
          _group_id: groupId,
          _milestone_key: key
        });

        const result = data as { success?: boolean; milestone_name?: string } | null;
        if (result?.success) {
          const def = definitions.find(d => d.key === key);
          toast.success(`${def?.icon || '🌟'} ${result.milestone_name}`, {
            description: 'You reached this together'
          });
        }
      } catch (error) {
        console.error('Error awarding milestone:', error);
      }
    }

    if (milestonesToAward.length > 0) {
      fetchMilestones();
    }
  }, [groupId, user, earnedMilestones, definitions, fetchMilestones]);

  const milestonesWithStatus: MilestoneWithStatus[] = definitions.map(def => {
    const earned = earnedMilestones.find(m => m.milestone_key === def.key);
    return {
      ...def,
      isEarned: !!earned,
      achievedAt: earned?.achieved_at
    };
  });

  const groupedMilestones = milestonesWithStatus.reduce((acc, milestone) => {
    const category = milestone.category;
    if (!acc[category]) {
      acc[category] = [];
    }
    acc[category].push(milestone);
    return acc;
  }, {} as Record<string, MilestoneWithStatus[]>);

  const earnedCount = earnedMilestones.length;
  const totalCount = definitions.filter(d => !d.is_seasonal).length;

  return {
    milestonesWithStatus,
    groupedMilestones,
    earnedCount,
    totalCount,
    isLoading,
    checkAndAwardMilestones,
    refreshMilestones: fetchMilestones,
    CATEGORY_LABELS
  };
}

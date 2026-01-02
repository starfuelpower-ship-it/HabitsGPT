import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

export interface Group {
  id: string;
  name: string;
  created_by: string;
  invite_code: string;
  created_at: string;
  total_xp: number;
  level: number;
}

export interface GroupMember {
  id: string;
  user_id: string;
  group_id: string;
  joined_at: string;
  streak: number;
  profile?: {
    display_name: string | null;
    email: string | null;
  };
}

export interface GroupActivity {
  id: string;
  group_id: string;
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

export interface Challenge {
  id: string;
  group_id: string;
  title: string;
  description: string | null;
  target_count: number;
  start_date: string;
  end_date: string;
  is_active: boolean;
  created_by: string;
  progress?: { user_id: string; progress_count: number; completed: boolean }[];
}

export interface Badge {
  id: string;
  name: string;
  description: string | null;
  icon: string;
  xp_required: number;
  badge_type: string;
}

export interface UserBadge {
  badge_id: string;
  earned_at: string;
}

export interface ChatMessage {
  id: string;
  user_id: string;
  message: string;
  created_at: string;
  profiles?: {
    display_name: string | null;
    email: string | null;
  };
}

export interface GroupAchievement {
  id: string;
  group_id: string;
  achievement_type: string;
  title: string;
  description: string | null;
  achieved_at: string;
}

export function useGroups() {
  const { user } = useAuth();
  const [groups, setGroups] = useState<Group[]>([]);
  const [members, setMembers] = useState<GroupMember[]>([]);
  const [activities, setActivities] = useState<GroupActivity[]>([]);
  const [challenges, setChallenges] = useState<Challenge[]>([]);
  const [badges, setBadges] = useState<Badge[]>([]);
  const [userBadges, setUserBadges] = useState<UserBadge[]>([]);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [achievements, setAchievements] = useState<GroupAchievement[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentGroup, setCurrentGroup] = useState<Group | null>(null);

  const generateInviteCode = () => {
    return Math.random().toString(36).substring(2, 8).toUpperCase();
  };

  const fetchUserGroups = useCallback(async () => {
    if (!user) return;
    
    setIsLoading(true);
    try {
      const { data: memberData, error: memberError } = await supabase
        .from('group_members')
        .select('group_id')
        .eq('user_id', user.id);

      if (memberError) throw memberError;

      if (memberData && memberData.length > 0) {
        const groupIds = memberData.map(m => m.group_id);
        const { data: groupsData, error: groupsError } = await supabase
          .from('groups')
          .select('*')
          .in('id', groupIds);

        if (groupsError) throw groupsError;
        setGroups(groupsData || []);
        
        if (groupsData && groupsData.length > 0) {
          setCurrentGroup(groupsData[0]);
        }
      } else {
        setGroups([]);
        setCurrentGroup(null);
      }
    } catch (error) {
      console.error('Error fetching groups:', error);
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  const fetchGroupMembers = useCallback(async (groupId: string) => {
    if (!user) return;

    try {
      const { data: membersData, error: membersError } = await supabase
        .from('group_members')
        .select('*')
        .eq('group_id', groupId);

      if (membersError) throw membersError;

      if (membersData && membersData.length > 0) {
        const userIds = membersData.map(m => m.user_id);
        const { data: profilesData } = await supabase
          .from('profiles')
          .select('id, display_name, email')
          .in('id', userIds);

        const membersWithProfiles = membersData.map(member => ({
          ...member,
          profile: profilesData?.find(p => p.id === member.user_id) || null
        }));

        setMembers(membersWithProfiles);
      } else {
        setMembers([]);
      }
    } catch (error) {
      console.error('Error fetching members:', error);
    }
  }, [user]);

  const fetchGroupActivities = useCallback(async (groupId: string) => {
    if (!user) return;

    try {
      const { data: activitiesData, error: activitiesError } = await supabase
        .from('group_activities')
        .select('*')
        .eq('group_id', groupId)
        .order('created_at', { ascending: false })
        .limit(20);

      if (activitiesError) throw activitiesError;

      if (activitiesData && activitiesData.length > 0) {
        const userIds = [...new Set(activitiesData.map(a => a.user_id))];
        const { data: profilesData } = await supabase
          .from('profiles')
          .select('id, display_name, email')
          .in('id', userIds);

        const activityIds = activitiesData.map(a => a.id);
        const { data: reactionsData } = await supabase
          .from('group_reactions')
          .select('*')
          .in('activity_id', activityIds);

        const activitiesWithDetails = activitiesData.map(activity => {
          const activityReactions = reactionsData?.filter(r => r.activity_id === activity.id) || [];
          const reactionCounts: Record<string, { count: number; hasReacted: boolean }> = {};
          
          activityReactions.forEach(r => {
            if (!reactionCounts[r.emoji]) {
              reactionCounts[r.emoji] = { count: 0, hasReacted: false };
            }
            reactionCounts[r.emoji].count++;
            if (r.user_id === user.id) {
              reactionCounts[r.emoji].hasReacted = true;
            }
          });

          return {
            ...activity,
            profile: profilesData?.find(p => p.id === activity.user_id) || null,
            reactions: Object.entries(reactionCounts).map(([emoji, data]) => ({
              emoji,
              count: data.count,
              hasReacted: data.hasReacted
            }))
          };
        });

        setActivities(activitiesWithDetails);
      } else {
        setActivities([]);
      }
    } catch (error) {
      console.error('Error fetching activities:', error);
    }
  }, [user]);

  const fetchChallenges = useCallback(async (groupId: string) => {
    if (!user) return;

    try {
      const { data: challengesData, error } = await supabase
        .from('group_challenges')
        .select('*')
        .eq('group_id', groupId)
        .order('created_at', { ascending: false });

      if (error) throw error;

      if (challengesData && challengesData.length > 0) {
        const challengeIds = challengesData.map(c => c.id);
        const { data: progressData } = await supabase
          .from('group_challenge_progress')
          .select('*')
          .in('challenge_id', challengeIds);

        const challengesWithProgress = challengesData.map(challenge => ({
          ...challenge,
          progress: progressData?.filter(p => p.challenge_id === challenge.id) || []
        }));

        setChallenges(challengesWithProgress);
      } else {
        setChallenges([]);
      }
    } catch (error) {
      console.error('Error fetching challenges:', error);
    }
  }, [user]);

  const fetchBadges = useCallback(async (groupId: string) => {
    if (!user) return;

    try {
      const [badgesResult, userBadgesResult] = await Promise.all([
        supabase.from('badges').select('*'),
        supabase.from('user_badges').select('badge_id, earned_at').eq('user_id', user.id)
      ]);

      if (badgesResult.data) setBadges(badgesResult.data);
      if (userBadgesResult.data) setUserBadges(userBadgesResult.data);
    } catch (error) {
      console.error('Error fetching badges:', error);
    }
  }, [user]);

  const fetchChatMessages = useCallback(async (groupId: string) => {
    if (!user) return;

    try {
      const { data: messagesData, error } = await supabase
        .from('group_chat')
        .select('*')
        .eq('group_id', groupId)
        .order('created_at', { ascending: true })
        .limit(100);

      if (error) throw error;

      if (messagesData && messagesData.length > 0) {
        const userIds = [...new Set(messagesData.map(m => m.user_id))];
        const { data: profilesData } = await supabase
          .from('profiles')
          .select('id, display_name, email')
          .in('id', userIds);

        const messagesWithProfiles = messagesData.map(msg => ({
          ...msg,
          profiles: profilesData?.find(p => p.id === msg.user_id) || null
        }));

        setChatMessages(messagesWithProfiles);
      } else {
        setChatMessages([]);
      }
    } catch (error) {
      console.error('Error fetching chat:', error);
    }
  }, [user]);

  const fetchAchievements = useCallback(async (groupId: string) => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('group_achievements')
        .select('*')
        .eq('group_id', groupId)
        .order('achieved_at', { ascending: false });

      if (error) throw error;
      setAchievements(data || []);
    } catch (error) {
      console.error('Error fetching achievements:', error);
    }
  }, [user]);

  const createGroup = async (name: string) => {
    if (!user) return null;

    const inviteCode = generateInviteCode();

    try {
      const { data: groupData, error: groupError } = await supabase
        .from('groups')
        .insert({
          name,
          created_by: user.id,
          invite_code: inviteCode,
          total_xp: 0,
          level: 1
        })
        .select()
        .single();

      if (groupError) throw groupError;

      const { error: memberError } = await supabase
        .from('group_members')
        .insert({
          user_id: user.id,
          group_id: groupData.id,
          streak: 0
        });

      if (memberError) throw memberError;

      toast.success('Group created!');
      await fetchUserGroups();
      return groupData;
    } catch (error: any) {
      console.error('Error creating group:', error);
      toast.error('Failed to create group');
      return null;
    }
  };

  const joinGroup = async (inviteCode: string) => {
    if (!user) return false;

    try {
      const { data: groupData, error: groupError } = await supabase
        .from('groups')
        .select('*')
        .eq('invite_code', inviteCode.toUpperCase())
        .maybeSingle();

      if (groupError) throw groupError;

      if (!groupData) {
        toast.error('Invalid invite code');
        return false;
      }

      const { data: existingMember } = await supabase
        .from('group_members')
        .select('id')
        .eq('user_id', user.id)
        .eq('group_id', groupData.id)
        .maybeSingle();

      if (existingMember) {
        toast.error('You are already in this group');
        return false;
      }

      const { error: joinError } = await supabase
        .from('group_members')
        .insert({
          user_id: user.id,
          group_id: groupData.id,
          streak: 0
        });

      if (joinError) throw joinError;

      toast.success(`Joined "${groupData.name}"!`);
      await fetchUserGroups();
      return true;
    } catch (error: any) {
      console.error('Error joining group:', error);
      toast.error('Failed to join group');
      return false;
    }
  };

  const leaveGroup = async (groupId: string) => {
    if (!user) return false;

    try {
      const { error } = await supabase
        .from('group_members')
        .delete()
        .eq('user_id', user.id)
        .eq('group_id', groupId);

      if (error) throw error;

      toast.success('Left the group');
      setCurrentGroup(null);
      setMembers([]);
      setActivities([]);
      setChallenges([]);
      setChatMessages([]);
      setAchievements([]);
      await fetchUserGroups();
      return true;
    } catch (error) {
      console.error('Error leaving group:', error);
      toast.error('Failed to leave group');
      return false;
    }
  };

  const postActivity = async (
    groupId: string, 
    activityType: 'habit_completed' | 'all_completed' | 'streak_milestone',
    habitName?: string,
    streakCount?: number
  ) => {
    if (!user) return;

    try {
      await supabase
        .from('group_activities')
        .insert({
          group_id: groupId,
          user_id: user.id,
          activity_type: activityType,
          habit_name: habitName || null,
          streak_count: streakCount || null
        });

      // Add XP for activity
      const xpGain = activityType === 'all_completed' ? 25 : 10;
      await addGroupXP(groupId, xpGain);

      if (currentGroup?.id === groupId) {
        fetchGroupActivities(groupId);
      }
    } catch (error) {
      console.error('Error posting activity:', error);
    }
  };

  const createChallenge = async (
    groupId: string,
    title: string,
    description: string,
    targetCount: number,
    endDate: string
  ) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('group_challenges')
        .insert({
          group_id: groupId,
          title,
          description: description || null,
          target_count: targetCount,
          end_date: endDate,
          created_by: user.id
        });

      if (error) throw error;

      toast.success('Challenge created!');
      fetchChallenges(groupId);
    } catch (error) {
      console.error('Error creating challenge:', error);
      toast.error('Failed to create challenge');
    }
  };

  const sendChatMessage = async (groupId: string, message: string) => {
    if (!user) return;

    // Validate message on client-side as well
    const trimmedMessage = message.trim();
    if (!trimmedMessage || trimmedMessage.length > 2000) {
      console.error('Invalid message: must be 1-2000 characters');
      return;
    }

    try {
      const { error } = await supabase
        .from('group_chat')
        .insert({
          group_id: groupId,
          user_id: user.id,
          message: trimmedMessage
        });

      if (error) throw error;
      fetchChatMessages(groupId);
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  const addGroupXP = async (groupId: string, xp: number) => {
    if (!user || !currentGroup) return;

    try {
      // Use secure server-side RPC to add XP (validates membership and amount)
      const { data, error } = await supabase.rpc('add_group_xp', {
        _group_id: groupId,
        _xp_amount: xp
      });

      if (error) throw error;

      const result = data as { success: boolean; total_xp?: number; level?: number; leveled_up?: boolean; error?: string } | null;

      if (result?.success) {
        // Update local state with server-validated values
        setCurrentGroup(prev => prev ? { 
          ...prev, 
          total_xp: result.total_xp ?? prev.total_xp, 
          level: result.level ?? prev.level 
        } : null);

        // Refresh achievements if leveled up (server handles achievement creation)
        if (result.leveled_up) {
          fetchAchievements(groupId);
        }
      } else {
        console.error('Failed to add XP:', result?.error);
      }
    } catch (error) {
      console.error('Error adding XP:', error);
    }
  };

  // Subscribe to realtime chat
  useEffect(() => {
    if (!currentGroup) return;

    const channel = supabase
      .channel('group-chat')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'group_chat',
          filter: `group_id=eq.${currentGroup.id}`
        },
        () => {
          fetchChatMessages(currentGroup.id);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [currentGroup, fetchChatMessages]);

  useEffect(() => {
    fetchUserGroups();
  }, [fetchUserGroups]);

  useEffect(() => {
    if (currentGroup) {
      fetchGroupMembers(currentGroup.id);
      fetchGroupActivities(currentGroup.id);
      fetchChallenges(currentGroup.id);
      fetchBadges(currentGroup.id);
      fetchChatMessages(currentGroup.id);
      fetchAchievements(currentGroup.id);
    }
  }, [currentGroup, fetchGroupMembers, fetchGroupActivities, fetchChallenges, fetchBadges, fetchChatMessages, fetchAchievements]);

  return {
    groups,
    members,
    activities,
    challenges,
    badges,
    userBadges,
    chatMessages,
    achievements,
    currentGroup,
    isLoading,
    createGroup,
    joinGroup,
    leaveGroup,
    postActivity,
    createChallenge,
    sendChatMessage,
    addGroupXP,
    setCurrentGroup,
    refetch: fetchUserGroups,
    refetchActivities: () => currentGroup && fetchGroupActivities(currentGroup.id)
  };
}

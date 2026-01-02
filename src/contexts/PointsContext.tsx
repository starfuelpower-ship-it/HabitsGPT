import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { useAuth } from './AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

// Point values (for reference - actual amounts are controlled server-side)
export const POINTS = {
  HABIT_COMPLETE: 10,
  ALL_HABITS_COMPLETE: 25,
  STREAK_BONUS_3: 15,
  STREAK_BONUS_7: 30,
  STREAK_BONUS_14: 50,
  STREAK_BONUS_30: 100,
  DAILY_CHECK_IN: 5,
  WEEKLY_BONUS: 50,
};

interface PointsAnimation {
  amount: number;
  type: string;
  id: number;
}

interface PointsContextType {
  balance: number;
  totalEarned: number;
  isLoading: boolean;
  earnPoints: (amount: number, type: string, description: string) => Promise<void>;
  spendPoints: (amount: number, description: string) => Promise<boolean>;
  checkDailyBonus: () => Promise<void>;
  checkWeeklyBonus: () => Promise<void>;
  recentEarning: { amount: number; type: string } | null;
  clearRecentEarning: () => void;
  currentAnimation: PointsAnimation | null;
  clearAnimation: () => void;
}

const PointsContext = createContext<PointsContextType | undefined>(undefined);

export function PointsProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const [balance, setBalance] = useState(0);
  const [totalEarned, setTotalEarned] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [recentEarning, setRecentEarning] = useState<{ amount: number; type: string } | null>(null);
  const [currentAnimation, setCurrentAnimation] = useState<PointsAnimation | null>(null);
  const animationIdRef = useRef(0);
  const initialized = useRef(false);

  // Fetch user points
  const fetchPoints = useCallback(async () => {
    if (!user) {
      setBalance(0);
      setTotalEarned(0);
      setIsLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from('user_points')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (error && error.code !== 'PGRST116') {
        throw error;
      }

      if (data) {
        // Ensure we never have negative or invalid values
        setBalance(Math.max(0, data.balance || 0));
        setTotalEarned(Math.max(0, data.total_earned || 0));
      } else {
        // Create initial points record via INSERT (allowed by RLS)
        const { data: newData, error: insertError } = await supabase
          .from('user_points')
          .insert({ user_id: user.id, balance: 0, total_earned: 0 })
          .select()
          .single();

        if (insertError) throw insertError;
        if (newData) {
          setBalance(0);
          setTotalEarned(0);
        }
      }
    } catch (error) {
      console.error('Error fetching points:', error);
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  useEffect(() => {
    if (user && !initialized.current) {
      fetchPoints();
      initialized.current = true;
    } else if (!user) {
      initialized.current = false;
      setIsLoading(false);
    }
  }, [user, fetchPoints]);

  // Secure server-side point earning via RPC
  const earnPoints = useCallback(async (amount: number, type: string, description: string) => {
    if (!user) return;

    try {
      const { data, error } = await supabase.rpc('award_points', {
        _amount: amount,
        _type: type,
        _description: description
      });

      if (error) {
        console.error('Error earning points:', error);
        return;
      }

      const result = data as { success: boolean; balance?: number; total_earned?: number; error?: string };
      
      if (!result.success) {
        console.error('Failed to earn points:', result.error);
        return;
      }

      // Update local state from server response
      if (result.balance !== undefined) {
        setBalance(result.balance);
      }
      if (result.total_earned !== undefined) {
        setTotalEarned(result.total_earned);
      }

      setRecentEarning({ amount, type });
      
      // Trigger animation
      animationIdRef.current += 1;
      setCurrentAnimation({ amount, type, id: animationIdRef.current });

      // Clear the recent earning after animation
      setTimeout(() => setRecentEarning(null), 3000);
    } catch (error) {
      console.error('Error earning points:', error);
    }
  }, [user]);

  // Secure server-side point spending via RPC
  const spendPoints = useCallback(async (amount: number, description: string): Promise<boolean> => {
    if (!user || amount <= 0) return false;

    try {
      const { data, error } = await supabase.rpc('spend_points', {
        _amount: amount,
        _description: description
      });

      if (error) {
        console.error('Error spending points:', error);
        toast.error('Failed to complete purchase');
        return false;
      }

      const result = data as { success: boolean; balance?: number; error?: string };
      
      if (!result.success) {
        if (result.error === 'Insufficient balance') {
          toast.error('Not enough points');
        } else {
          toast.error('Failed to complete purchase');
        }
        return false;
      }

      // Update local state from server response
      if (result.balance !== undefined) {
        setBalance(result.balance);
      }

      return true;
    } catch (error) {
      console.error('Error spending points:', error);
      toast.error('Failed to complete purchase');
      return false;
    }
  }, [user]);

  // Secure server-side daily bonus via RPC
  const checkDailyBonus = useCallback(async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase.rpc('claim_daily_bonus');

      if (error) {
        console.error('Error claiming daily bonus:', error);
        return;
      }

      const result = data as { success: boolean; amount?: number; already_claimed?: boolean; error?: string };
      
      if (result.success && result.amount) {
        // Refresh balance from server
        await fetchPoints();
        
        toast.success(`+${result.amount} points for checking in today!`, {
          icon: '✨',
        });
      }
      // Silently ignore if already claimed
    } catch (error) {
      console.error('Error checking daily bonus:', error);
    }
  }, [user, fetchPoints]);

  // Secure server-side weekly bonus via RPC
  const checkWeeklyBonus = useCallback(async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase.rpc('claim_weekly_bonus');

      if (error) {
        // This might fail on non-Sunday/Monday - that's expected
        return;
      }

      const result = data as { success: boolean; amount?: number; already_claimed?: boolean; error?: string };
      
      if (result.success && result.amount) {
        // Refresh balance from server
        await fetchPoints();
        
        toast.success(`+${result.amount} points weekly bonus!`, {
          icon: '🎉',
        });
      }
      // Silently ignore if already claimed or wrong day
    } catch (error) {
      console.error('Error checking weekly bonus:', error);
    }
  }, [user, fetchPoints]);

  const clearRecentEarning = useCallback(() => {
    setRecentEarning(null);
  }, []);

  const clearAnimation = useCallback(() => {
    setCurrentAnimation(null);
  }, []);

  return (
    <PointsContext.Provider
      value={{
        balance,
        totalEarned,
        isLoading,
        earnPoints,
        spendPoints,
        checkDailyBonus,
        checkWeeklyBonus,
        recentEarning,
        clearRecentEarning,
        currentAnimation,
        clearAnimation,
      }}
    >
      {children}
    </PointsContext.Provider>
  );
}

export function usePoints() {
  const context = useContext(PointsContext);
  if (context === undefined) {
    throw new Error('usePoints must be used within a PointsProvider');
  }
  return context;
}

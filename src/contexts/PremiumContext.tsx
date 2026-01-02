import { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './AuthContext';

type Platform = 'apple' | 'google' | 'web';

interface PremiumContextType {
  isPremium: boolean;
  isLoading: boolean;
  activatePremium: (
    planId: string, 
    transactionId: string, 
    receipt?: string,
    purchaseToken?: string,
    platform?: Platform
  ) => Promise<boolean>;
  refreshPremiumStatus: () => Promise<void>;
}

const PremiumContext = createContext<PremiumContextType | undefined>(undefined);

export function PremiumProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [isPremium, setIsPremium] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const fetchPremiumStatus = useCallback(async () => {
    if (!user) {
      setIsPremium(false);
      setIsLoading(false);
      return;
    }
    
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('is_premium, premium_expires_at')
        .eq('id', user.id)
        .maybeSingle();

      if (error) throw error;

      if (data) {
        const isActive = data.is_premium && 
          (!data.premium_expires_at || new Date(data.premium_expires_at) > new Date());
        setIsPremium(isActive);
      }
    } catch (error) {
      console.error('Error fetching premium status:', error);
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchPremiumStatus();
  }, [fetchPremiumStatus]);

  /**
   * Activates premium status via secure server-side verification.
   * This function calls the edge function which verifies the purchase
   * and updates the database with service role permissions.
   */
  const activatePremium = useCallback(async (
    planId: string, 
    transactionId: string, 
    receipt?: string,
    purchaseToken?: string,
    platform?: Platform
  ): Promise<boolean> => {
    if (!user) {
      console.error('Cannot activate premium: no user logged in');
      return false;
    }

    try {
      const { data, error } = await supabase.functions.invoke('verify-premium-purchase', {
        body: { planId, transactionId, receipt, purchaseToken, platform }
      });

      if (error) {
        console.error('Premium activation error:', error);
        return false;
      }

      if (data?.success) {
        setIsPremium(true);
        return true;
      }

      console.error('Premium activation failed:', data?.error);
      return false;
    } catch (error) {
      console.error('Error activating premium:', error);
      return false;
    }
  }, [user]);

  const refreshPremiumStatus = useCallback(async () => {
    await fetchPremiumStatus();
  }, [fetchPremiumStatus]);

  return (
    <PremiumContext.Provider value={{ isPremium, isLoading, activatePremium, refreshPremiumStatus }}>
      {children}
    </PremiumContext.Provider>
  );
}

export function usePremium() {
  const context = useContext(PremiumContext);
  if (!context) {
    throw new Error('usePremium must be used within a PremiumProvider');
  }
  return context;
}

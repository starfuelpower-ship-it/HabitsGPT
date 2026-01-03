import { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './AuthContext';
import { iapService } from '@/services/iapService';

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
      // Prefer native entitlement status if running on device
      if (iapService.isAvailable()) {
        iapService.setAppUserId(user.id);
        const { isPremium: nativePremium, expiresAt } = await iapService.checkPremiumStatus();
        setIsPremium(nativePremium);

        // Best-effort sync to Supabase so web sessions (or other devices) can reflect status.
        // (Not fully tamper-proof, but helps keep the app consistent.)
        try {
          await supabase
            .from('profiles')
            .update({
              is_premium: nativePremium,
              premium_expires_at: expiresAt ? new Date(expiresAt).toISOString() : null,
            })
            .eq('id', user.id);
        } catch {
          // ignore sync errors
        }

        return;
      }

      // Web fallback: read from DB
      const { data, error } = await supabase
        .from('profiles')
        .select('is_premium, premium_expires_at')
        .eq('id', user.id)
        .maybeSingle();

      if (error) throw error;

      if (data) {
        const isActive =
          data.is_premium && (!data.premium_expires_at || new Date(data.premium_expires_at) > new Date());
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
   * Legacy activation path (edge-function verification).
   * If you keep using `verify-premium-purchase`, ensure that function's product IDs match your store setup.
   * With RevenueCat, premium should unlock from entitlements immediately after purchase.
   */
  const activatePremium = useCallback(
    async (
      _planId: string,
      _transactionId: string,
      _receipt?: string,
      _purchaseToken?: string,
      _platform?: Platform
    ): Promise<boolean> => {
      // RevenueCat entitlement should already be active after purchase.
      // Just refresh local + DB status.
      await fetchPremiumStatus();
      return true;
    },
    [fetchPremiumStatus]
  );

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

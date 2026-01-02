/**
 * React hook for Cross-Platform In-App Purchases
 * 
 * Provides easy access to IAP functionality with loading states and error handling.
 * Compliant with both Apple App Store and Google Play Store Guidelines.
 */

import { useState, useEffect, useCallback } from 'react';
import { 
  iapService,
  appleIAP, // backwards compatibility
  IAP_PRODUCT_IDS, 
  POINT_BUNDLE_TO_IAP,
  SUBSCRIPTION_TO_IAP,
  getCurrentPlatform,
  type IAPProduct, 
  type ProductId,
  type Platform,
} from '@/services/iapService';
import { usePoints } from '@/contexts/PointsContext';
import { usePremium } from '@/contexts/PremiumContext';
import { toast } from 'sonner';

// Points awarded per bundle purchase
const POINTS_PER_BUNDLE: Record<string, number> = {
  'small': 500,
  'medium': 1650, // 1500 + 150 bonus
  'large': 5750,  // 5000 + 750 bonus
  'mega': 14000,  // 12000 + 2000 bonus
};

export function useAppleIAP() {
  const [isInitialized, setIsInitialized] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [products, setProducts] = useState<Map<ProductId, IAPProduct>>(new Map());
  const { earnPoints } = usePoints();
  const { activatePremium } = usePremium();
  const platform = getCurrentPlatform();

  // Initialize IAP on mount
  useEffect(() => {
    const init = async () => {
      const success = await iapService.initialize();
      setIsInitialized(success);
      
      if (success) {
        // Fetch all products
        const allProductIds = Object.values(IAP_PRODUCT_IDS);
        const fetchedProducts = await iapService.fetchProducts(allProductIds);
        
        const productMap = new Map<ProductId, IAPProduct>();
        fetchedProducts.forEach(p => productMap.set(p.productId as ProductId, p));
        setProducts(productMap);
      }
    };
    
    init();
  }, []);

  /**
   * Purchase a premium subscription
   */
  const purchaseSubscription = useCallback(async (planId: 'monthly' | 'annual' | 'lifetime'): Promise<boolean> => {
    const productId = SUBSCRIPTION_TO_IAP[planId];
    if (!productId) {
      toast.error('Invalid subscription plan');
      return false;
    }

    setIsLoading(true);
    try {
      const result = await iapService.purchase(productId);
      
      if (result.success) {
        // Activate premium via secure server-side verification
        // Pass platform-specific data for validation
        const transactionId = result.transactionId || '';
        const receipt = result.receipt; // Apple receipt
        const purchaseToken = result.purchaseToken; // Google purchase token
        const purchasePlatform = result.platform;
        
        const activated = await activatePremium(planId, transactionId, receipt, purchaseToken, purchasePlatform);
        
        if (activated) {
          toast.success('Welcome to Premium! 🎉');
          return true;
        } else {
          toast.error('Failed to activate premium. Please contact support.');
          return false;
        }
      } else {
        if (result.error !== 'Purchase cancelled') {
          toast.error(result.error || 'Purchase failed');
        }
        return false;
      }
    } catch (error) {
      console.error('[IAP] Subscription purchase error:', error);
      toast.error('Something went wrong. Please try again.');
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [activatePremium]);

  /**
   * Purchase a points bundle
   * NOTE: Points purchases should also be server-verified in production
   */
  const purchasePointBundle = useCallback(async (bundleId: string): Promise<boolean> => {
    const productId = POINT_BUNDLE_TO_IAP[bundleId];
    const pointsToAward = POINTS_PER_BUNDLE[bundleId];
    
    if (!productId || !pointsToAward) {
      toast.error('Invalid bundle');
      return false;
    }

    setIsLoading(true);
    try {
      const result = await iapService.purchase(productId);
      
      if (result.success) {
        // TODO: Implement server-side verification for point purchases
        // For now, award points directly (should be moved to edge function)
        await earnPoints(pointsToAward, 'purchase', `Purchased ${bundleId} bundle`);
        toast.success(`You received ${pointsToAward.toLocaleString()} points! 🎉`);
        return true;
      } else {
        if (result.error !== 'Purchase cancelled') {
          toast.error(result.error || 'Purchase failed');
        }
        return false;
      }
    } catch (error) {
      console.error('[IAP] Points purchase error:', error);
      toast.error('Something went wrong. Please try again.');
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [earnPoints]);

  /**
   * Restore previous purchases
   */
  const restorePurchases = useCallback(async (): Promise<boolean> => {
    setIsLoading(true);
    try {
      const result = await iapService.restorePurchases();
      
      if (result.error) {
        toast.error(result.error);
        return false;
      }
      
      if (result.restored.length > 0) {
        // Check if any restored purchases are premium subscriptions
        const hasPremium = result.restored.some(id => 
          id === IAP_PRODUCT_IDS.PREMIUM_MONTHLY ||
          id === IAP_PRODUCT_IDS.PREMIUM_ANNUAL ||
          id === IAP_PRODUCT_IDS.PREMIUM_LIFETIME
        );
        
        if (hasPremium) {
          // For restores, we use a special transaction ID to indicate a restore
          await activatePremium('restored', 'restore_' + Date.now());
        }
        
        toast.success(`Restored ${result.restored.length} purchase(s)`);
        return true;
      } else {
        toast.info('No purchases to restore');
        return false;
      }
    } catch (error) {
      console.error('[IAP] Restore error:', error);
      toast.error('Failed to restore purchases');
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [activatePremium]);

  /**
   * Get product info by ID
   */
  const getProduct = useCallback((productId: ProductId): IAPProduct | undefined => {
    return products.get(productId);
  }, [products]);

  /**
   * Check if running on native platform
   */
  const isNativePlatform = iapService.isAvailable();

  return {
    isInitialized,
    isLoading,
    isNativePlatform,
    platform,
    products,
    purchaseSubscription,
    purchasePointBundle,
    restorePurchases,
    getProduct,
  };
}

// Re-export for backwards compatibility
export { appleIAP, iapService };

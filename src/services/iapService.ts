/**
 * Cross-Platform In-App Purchases Service
 * 
 * This service handles IAP functionality for both iOS (Apple) and Android (Google Play).
 * Uses @revenuecat/purchases-capacitor (RevenueCat) for cross-platform IAP.
 * 
 * IMPORTANT: Before deploying:
 * 1. iOS: Create products in App Store Connect
 * 2. Android: Create products in Google Play Console
 * 3. Configure RevenueCat dashboard with both App Store Connect and Google Play API keys
 * 4. Add GOOGLE_SERVICE_ACCOUNT_JSON secret for server-side Google Play validation
 */

import { Capacitor } from '@capacitor/core';

// ============================================
// PRODUCT IDS - Configure in both app stores
// ============================================
// These must match the product IDs in App Store Connect and Google Play Console

export const IAP_PRODUCT_IDS = {
  // Subscriptions
  PREMIUM_MONTHLY: 'com.cozyhabits.app.premium.monthly',
  PREMIUM_ANNUAL: 'com.cozyhabits.app.premium.annual',
  PREMIUM_LIFETIME: 'com.cozyhabits.app.premium.lifetime',
  
  // Point Bundles (Consumables)
  POINTS_SMALL: 'com.cozyhabits.app.points.500',
  POINTS_MEDIUM: 'com.cozyhabits.app.points.1500',
  POINTS_LARGE: 'com.cozyhabits.app.points.5000',
  POINTS_MEGA: 'com.cozyhabits.app.points.12000',
} as const;

export type ProductId = typeof IAP_PRODUCT_IDS[keyof typeof IAP_PRODUCT_IDS];

// Map frontend bundle IDs to IAP product IDs
export const POINT_BUNDLE_TO_IAP: Record<string, ProductId> = {
  'small': IAP_PRODUCT_IDS.POINTS_SMALL,
  'medium': IAP_PRODUCT_IDS.POINTS_MEDIUM,
  'large': IAP_PRODUCT_IDS.POINTS_LARGE,
  'mega': IAP_PRODUCT_IDS.POINTS_MEGA,
};

export const SUBSCRIPTION_TO_IAP: Record<string, ProductId> = {
  'monthly': IAP_PRODUCT_IDS.PREMIUM_MONTHLY,
  'annual': IAP_PRODUCT_IDS.PREMIUM_ANNUAL,
  'lifetime': IAP_PRODUCT_IDS.PREMIUM_LIFETIME,
};

// Platform detection
export type Platform = 'apple' | 'google' | 'web';

export function getCurrentPlatform(): Platform {
  const platform = Capacitor.getPlatform();
  if (platform === 'ios') return 'apple';
  if (platform === 'android') return 'google';
  return 'web';
}

// ============================================
// TYPES
// ============================================

export interface IAPProduct {
  productId: string;
  title: string;
  description: string;
  price: string;
  priceAmount: number;
  currency: string;
}

export interface PurchaseResult {
  success: boolean;
  productId?: string;
  transactionId?: string;
  purchaseToken?: string; // Google Play specific
  receipt?: string; // Apple specific
  platform: Platform;
  error?: string;
}

// ============================================
// IAP SERVICE CLASS
// ============================================

class CrossPlatformIAPService {
  private initialized = false;
  private products: Map<string, IAPProduct> = new Map();
  private isNative = Capacitor.isNativePlatform();
  private currentPlatform: Platform = getCurrentPlatform();

  /**
   * Initialize the IAP service
   * Call this early in app startup
   */
  async initialize(): Promise<boolean> {
    if (this.initialized) return true;
    
    if (!this.isNative) {
      console.log('[IAP] Running in web mode - IAP disabled');
      this.initialized = true;
      return true;
    }

    try {
      // TODO: Initialize RevenueCat with your API key
      // const { Purchases } = await import('@revenuecat/purchases-capacitor');
      // await Purchases.configure({ apiKey: 'YOUR_REVENUECAT_API_KEY' });
      
      console.log(`[IAP] Service initialized for platform: ${this.currentPlatform}`);
      this.initialized = true;
      return true;
    } catch (error) {
      console.error('[IAP] Failed to initialize:', error);
      return false;
    }
  }

  /**
   * Check if IAP is available (native platform)
   */
  isAvailable(): boolean {
    return this.isNative;
  }

  /**
   * Get current platform
   */
  getPlatform(): Platform {
    return this.currentPlatform;
  }

  /**
   * Fetch products from the app store
   */
  async fetchProducts(productIds: ProductId[]): Promise<IAPProduct[]> {
    if (!this.isNative) {
      // Return mock products for web
      return productIds.map(id => this.getMockProduct(id));
    }

    try {
      // TODO: Implement real product fetching
      // const { Purchases } = await import('@revenuecat/purchases-capacitor');
      // const offerings = await Purchases.getOfferings();
      // Map offerings to IAPProduct format
      
      return productIds.map(id => this.getMockProduct(id));
    } catch (error) {
      console.error('[IAP] Failed to fetch products:', error);
      return [];
    }
  }

  /**
   * Purchase a product
   */
  async purchase(productId: ProductId): Promise<PurchaseResult> {
    if (!this.isNative) {
      // Simulate purchase for web/demo
      console.log('[IAP] Web mode - simulating purchase for:', productId);
      return {
        success: true,
        productId,
        transactionId: `demo_${Date.now()}`,
        platform: 'web',
      };
    }

    try {
      // TODO: Implement real purchase flow with RevenueCat
      // const { Purchases } = await import('@revenuecat/purchases-capacitor');
      // const result = await Purchases.purchaseProduct({ productIdentifier: productId });
      
      // For native platforms, return simulated success with platform-specific data
      if (this.currentPlatform === 'google') {
        return {
          success: true,
          productId,
          transactionId: `google_${Date.now()}`,
          purchaseToken: `token_${Date.now()}_${Math.random().toString(36).substring(7)}`,
          platform: 'google',
        };
      } else {
        return {
          success: true,
          productId,
          transactionId: `apple_${Date.now()}`,
          receipt: `receipt_${Date.now()}`, // Would be base64 encoded receipt from StoreKit
          platform: 'apple',
        };
      }
    } catch (error: unknown) {
      console.error('[IAP] Purchase failed:', error);
      
      // Handle specific error cases
      const errorCode = (error as { code?: string })?.code;
      const errorMessage = (error as { message?: string })?.message;
      
      if (errorCode === 'USER_CANCELLED') {
        return { success: false, error: 'Purchase cancelled', platform: this.currentPlatform };
      }
      
      return { 
        success: false, 
        error: errorMessage || 'Purchase failed. Please try again.',
        platform: this.currentPlatform,
      };
    }
  }

  /**
   * Restore previous purchases
   */
  async restorePurchases(): Promise<{ restored: ProductId[]; error?: string }> {
    if (!this.isNative) {
      console.log('[IAP] Web mode - restore not available');
      return { restored: [], error: 'Restore is only available on mobile devices' };
    }

    try {
      // TODO: Implement real restore
       // const { Purchases } = await import('@revenuecat/purchases-capacitor');
      // const customerInfo = await Purchases.restorePurchases();
      // Extract purchased product IDs from customerInfo
      
      return { restored: [] };
    } catch (error: unknown) {
      console.error('[IAP] Restore failed:', error);
      const errorMessage = (error as { message?: string })?.message;
      return { 
        restored: [], 
        error: errorMessage || 'Failed to restore purchases' 
      };
    }
  }

  /**
   * Check if user has active premium subscription
   */
  async checkPremiumStatus(): Promise<boolean> {
    if (!this.isNative) {
      return false;
    }

    try {
      // TODO: Implement real subscription check
      // const { Purchases } = await import('@revenuecat/purchases-capacitor');
      // const customerInfo = await Purchases.getCustomerInfo();
      // return customerInfo.entitlements.active['premium'] !== undefined;
      
      return false;
    } catch (error) {
      console.error('[IAP] Failed to check premium status:', error);
      return false;
    }
  }

  /**
   * Get mock product data for development/web
   */
  private getMockProduct(productId: ProductId): IAPProduct {
    const mockData: Record<ProductId, Omit<IAPProduct, 'productId'>> = {
      [IAP_PRODUCT_IDS.PREMIUM_MONTHLY]: {
        title: 'Premium Monthly',
        description: 'Unlock all premium features',
        price: '$4.99',
        priceAmount: 4.99,
        currency: 'USD',
      },
      [IAP_PRODUCT_IDS.PREMIUM_ANNUAL]: {
        title: 'Premium Annual',
        description: 'Save 50% with annual subscription',
        price: '$29.99',
        priceAmount: 29.99,
        currency: 'USD',
      },
      [IAP_PRODUCT_IDS.PREMIUM_LIFETIME]: {
        title: 'Premium Lifetime',
        description: 'One-time purchase, forever access',
        price: '$79.99',
        priceAmount: 79.99,
        currency: 'USD',
      },
      [IAP_PRODUCT_IDS.POINTS_SMALL]: {
        title: 'Starter Pack',
        description: '500 points',
        price: '$0.99',
        priceAmount: 0.99,
        currency: 'USD',
      },
      [IAP_PRODUCT_IDS.POINTS_MEDIUM]: {
        title: 'Value Bundle',
        description: '1,500 points + 150 bonus',
        price: '$2.49',
        priceAmount: 2.49,
        currency: 'USD',
      },
      [IAP_PRODUCT_IDS.POINTS_LARGE]: {
        title: 'Super Pack',
        description: '5,000 points + 750 bonus',
        price: '$6.99',
        priceAmount: 6.99,
        currency: 'USD',
      },
      [IAP_PRODUCT_IDS.POINTS_MEGA]: {
        title: 'Mega Bundle',
        description: '12,000 points + 2,000 bonus',
        price: '$14.99',
        priceAmount: 14.99,
        currency: 'USD',
      },
    };

    return {
      productId,
      ...mockData[productId],
    };
  }
}

// Export singleton instance
export const iapService = new CrossPlatformIAPService();

// Keep backwards compatibility alias
export const appleIAP = iapService;

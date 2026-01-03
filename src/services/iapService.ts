/**
 * Cross-Platform In-App Purchases Service (RevenueCat + Capacitor)
 *
 * Notes:
 * - Web builds: IAP is not available. UI should hide/disable purchase buttons on web.
 * - Native builds (Android/iOS): Uses RevenueCat SDK to talk to Google Play / App Store.
 *
 * REQUIRED SETUP (before it will work):
 * 1) Create products in Google Play Console / App Store Connect with IDs below
 * 2) In RevenueCat dashboard:
 *    - Add both store integrations
 *    - Create an Entitlement with id: "premium"
 *    - Create an Offering (set as Default) that includes monthly, annual, and lifetime packages
 * 3) Add public SDK keys to env:
 *    - VITE_REVENUECAT_PUBLIC_GOOGLE_KEY
 *    - VITE_REVENUECAT_PUBLIC_APPLE_KEY
 */

import { Capacitor } from '@capacitor/core';

export type Platform = 'apple' | 'google' | 'web';

// Exposed helper for UI/hooks (web builds like Vercel need this exported).
export function getCurrentPlatform(): Platform {
  const platform = Capacitor.getPlatform();
  if (platform === 'ios') return 'apple';
  if (platform === 'android') return 'google';
  return 'web';
}

export type ProductId = string;

// ============================================
// PRODUCT IDS - Must match the app stores
// ============================================
export const IAP_PRODUCT_IDS = {
  // Premium (monthly/annual are subscriptions; lifetime is a one-time non-consumable)
  PREMIUM_MONTHLY: 'cozy_premium_monthly',
  PREMIUM_ANNUAL: 'cozy_premium_annual',
  PREMIUM_LIFETIME: 'lifetime',

  // Point Bundles (Consumables) - optional
  POINTS_SMALL: 'com.cozyhabits.app.points.500',
  POINTS_MEDIUM: 'com.cozyhabits.app.points.1500',
  POINTS_LARGE: 'com.cozyhabits.app.points.5000',
  POINTS_XL: 'com.cozyhabits.app.points.12000',
} as const;

export interface IAPProduct {
  productId: string;
  title: string;
  description: string;
  price: string; // localized price string
  priceAmount: number; // numeric amount if available
  currency: string; // currency code if available
}

export interface PurchaseResult {
  success: boolean;
  productId?: string;
  transactionId?: string;
  platform: Platform;
  // best-effort metadata (may vary by platform / SDK version)
  raw?: unknown;
  error?: string;
}

type PurchasesSDK = typeof import('@revenuecat/purchases-capacitor');

class IAPService {
  private isNative = Capacitor.isNativePlatform();
  private currentPlatform: Platform = 'web';
  private configured = false;
  private appUserId?: string;

  constructor() {
    this.currentPlatform = this.getCurrentPlatform();
  }

  isAvailable(): boolean {
    return this.isNative;
  }

  getPlatform(): Platform {
    return this.currentPlatform;
  }

  /**
   * Optional: set app user id (recommended: use your Supabase user.id)
   * Call this after login.
   */
  setAppUserId(appUserId?: string) {
    this.appUserId = appUserId || undefined;
    // Re-configure next time so RevenueCat links purchases to the correct user
    this.configured = false;
  }

  private getCurrentPlatform(): Platform {
    const platform = Capacitor.getPlatform();
    if (platform === 'ios') return 'apple';
    if (platform === 'android') return 'google';
    return 'web';
  }

  private getApiKey(): string | undefined {
    // Vite env vars are injected at build time
    const googleKey = (import.meta as any).env?.VITE_REVENUECAT_PUBLIC_GOOGLE_KEY as string | undefined;
    const appleKey = (import.meta as any).env?.VITE_REVENUECAT_PUBLIC_APPLE_KEY as string | undefined;

    if (this.currentPlatform === 'google') return googleKey;
    if (this.currentPlatform === 'apple') return appleKey;
    return undefined;
  }

  private async sdk(): Promise<PurchasesSDK> {
    return await import('@revenuecat/purchases-capacitor');
  }

  private async ensureConfigured(): Promise<void> {
    if (!this.isNative) return;
    if (this.configured) return;

    const apiKey = this.getApiKey();
    if (!apiKey) {
      throw new Error(
        `[IAP] Missing RevenueCat API key. Set VITE_REVENUECAT_PUBLIC_${this.currentPlatform === 'google' ? 'GOOGLE' : 'APPLE'}_KEY in .env`
      );
    }

    const { Purchases, LOG_LEVEL } = await this.sdk();

    // Helpful logs during store testing. Reduce in prod if desired.
    try {
      await Purchases.setLogLevel({ level: LOG_LEVEL.DEBUG });
    } catch {
      // Some versions may not expose setLogLevel - safe to ignore
    }

    await Purchases.configure({
      apiKey,
      appUserID: this.appUserId, // optional
    });

    this.configured = true;
  }

  /**
   * Fetch products via RevenueCat Offerings (recommended).
   * If Offerings are not configured, this will return [].
   */
  async getProducts(productIds: ProductId[]): Promise<IAPProduct[]> {
    if (!this.isNative) return [];
    await this.ensureConfigured();

    const { Purchases } = await this.sdk();
    const offerings = await Purchases.getOfferings();

    const pkgs: any[] = offerings?.current?.availablePackages || [];
    if (!pkgs.length) return [];

    const byProductId = new Map<string, any>();
    for (const p of pkgs) {
      const pid = p?.product?.identifier || p?.product?.productIdentifier || p?.identifier;
      if (pid) byProductId.set(pid, p);
    }

    const results: IAPProduct[] = [];
    for (const requestedId of productIds) {
      const pkg = byProductId.get(requestedId);
      if (!pkg) continue;

      const product = pkg.product || {};
      const price =
        product?.priceString ||
        product?.localizedPriceString ||
        product?.price ||
        product?.formattedPrice ||
        '';

      const currency =
        product?.currencyCode ||
        product?.currency ||
        '';

      const priceAmount =
        typeof product?.price === 'number'
          ? product.price
          : typeof product?.priceAmount === 'number'
            ? product.priceAmount
            : Number(product?.priceAmountMicros ? product.priceAmountMicros / 1_000_000 : NaN);

      results.push({
        productId: requestedId,
        title: product?.title || product?.name || 'Premium',
        description: product?.description || '',
        price: String(price),
        priceAmount: Number.isFinite(priceAmount) ? priceAmount : 0,
        currency: String(currency),
      });
    }

    return results;
  }

  /**
   * Purchase a product by product id (mapped to a RevenueCat package in the default Offering).
   */
  async purchase(productId: ProductId): Promise<PurchaseResult> {
    if (!this.isNative) {
      return { success: false, platform: 'web', error: 'Purchases are only available on mobile devices.' };
    }

    await this.ensureConfigured();
    const { Purchases } = await this.sdk();

    try {
      const offerings = await Purchases.getOfferings();
      const pkgs: any[] = offerings?.current?.availablePackages || [];

      const pkg = pkgs.find(p => {
        const pid = p?.product?.identifier || p?.product?.productIdentifier || p?.identifier;
        return pid === productId;
      });

      if (!pkg) {
        return {
          success: false,
          platform: this.currentPlatform,
          error: `Product not found in RevenueCat Offering: ${productId}. Check RevenueCat Offering + product IDs.`,
        };
      }

      const result: any = await Purchases.purchasePackage({ packageToPurchase: pkg });

      // Result shape varies; keep raw for debugging
      const transactionId =
        result?.storeTransaction?.transactionIdentifier ||
        result?.storeTransaction?.orderId ||
        result?.transaction?.transactionIdentifier ||
        result?.transactionIdentifier ||
        result?.customerInfo?.originalPurchaseDate ||
        '';

      return {
        success: true,
        productId,
        transactionId: transactionId ? String(transactionId) : undefined,
        platform: this.currentPlatform,
        raw: result,
      };
    } catch (error: any) {
      const msg = error?.message || 'Purchase failed';
      const code = error?.code || error?.errorCode;

      // RevenueCat commonly returns userCancelled flag in error or separate param in callbacks.
      if (code === 'USER_CANCELLED' || msg.toLowerCase().includes('cancel')) {
        return { success: false, platform: this.currentPlatform, error: 'Purchase cancelled' };
      }

      return { success: false, platform: this.currentPlatform, error: msg, raw: error };
    }
  }

  /**
   * Restore purchases (Apple/Google)
   */
  async restorePurchases(): Promise<{ restored: ProductId[]; error?: string }> {
    if (!this.isNative) {
      return { restored: [], error: 'Restore is only available on mobile devices' };
    }

    try {
      await this.ensureConfigured();
      const { Purchases } = await this.sdk();

      const customerInfo: any = await Purchases.restorePurchases();

      const active = customerInfo?.entitlements?.active || {};
      const restoredProducts: string[] = [];

      // If entitlement is active, we consider premium restored.
      // We also attempt to pull product identifiers if present.
      for (const [_, ent] of Object.entries<any>(active)) {
        if (ent?.productIdentifier) restoredProducts.push(ent.productIdentifier);
      }

      return { restored: restoredProducts };
    } catch (error: any) {
      return { restored: [], error: error?.message || 'Failed to restore purchases' };
    }
  }

  /**
   * Check if the RevenueCat entitlement "premium" is active.
   */
  async checkPremiumStatus(): Promise<{ isPremium: boolean; expiresAt?: string | null }> {
    if (!this.isNative) return { isPremium: false };

    try {
      await this.ensureConfigured();
      const { Purchases } = await this.sdk();

      const customerInfo: any = await Purchases.getCustomerInfo();
      const premiumEntitlement = customerInfo?.entitlements?.active?.premium;

      const isPremium = !!premiumEntitlement;
      const expiresAt = premiumEntitlement?.expirationDate || premiumEntitlement?.expiresDate || null;

      return { isPremium, expiresAt: expiresAt ? String(expiresAt) : null };
    } catch (error) {
      console.error('[IAP] Failed to check premium status:', error);
      return { isPremium: false };
    }
  }
}

export const iapService = new IAPService();
/**
 * @deprecated Use iapService from '@/services/iapService' instead
 * This file is kept for backwards compatibility
 */

export {
  iapService as appleIAP,
  iapService,
  IAP_PRODUCT_IDS,
  POINT_BUNDLE_TO_IAP,
  SUBSCRIPTION_TO_IAP,
  getCurrentPlatform,
  type IAPProduct,
  type ProductId,
  type Platform,
  type PurchaseResult,
} from './iapService';

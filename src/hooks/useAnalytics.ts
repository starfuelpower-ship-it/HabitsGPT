import { useCallback, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';

// Privacy-safe analytics event types
type AnalyticsEvent = 
  | 'app_open'
  | 'onboarding_started'
  | 'onboarding_completed'
  | 'onboarding_skipped'
  | 'habit_created'
  | 'habit_completed'
  | 'habit_deleted'
  | 'streak_milestone'
  | 'plant_stage_advanced'
  | 'costume_purchased'
  | 'costume_equipped'
  | 'premium_page_viewed'
  | 'premium_purchased'
  | 'points_shop_viewed'
  | 'points_bundle_purchased'
  | 'settings_opened'
  | 'theme_changed'
  | 'ambient_mode_changed'
  | 'music_toggled'
  | 'notification_enabled'
  | 'group_created'
  | 'group_joined';

interface AnalyticsData {
  [key: string]: string | number | boolean | undefined;
}

// In-memory analytics queue for batching
const analyticsQueue: Array<{ event: AnalyticsEvent; data?: AnalyticsData; timestamp: number }> = [];
const BATCH_SIZE = 10;
const BATCH_INTERVAL = 30000; // 30 seconds

// Simple analytics storage (privacy-safe, no PII)
const storeAnalytics = (event: AnalyticsEvent, data?: AnalyticsData) => {
  const entry = {
    event,
    data: data || {},
    timestamp: Date.now(),
  };
  
  analyticsQueue.push(entry);
  
  // Store locally for debugging (no network calls in this simple implementation)
  if (process.env.NODE_ENV === 'development') {
    console.log('[Analytics]', event, data);
  }
  
  // In production, you would batch and send to your analytics service
  // For now, we store in localStorage for local analytics
  try {
    const stored = localStorage.getItem('cozy_habits_analytics') || '[]';
    const events = JSON.parse(stored);
    events.push(entry);
    
    // Keep only last 100 events to prevent storage bloat
    if (events.length > 100) {
      events.splice(0, events.length - 100);
    }
    
    localStorage.setItem('cozy_habits_analytics', JSON.stringify(events));
  } catch (e) {
    // Silently fail - analytics should never break the app
  }
};

export function useAnalytics() {
  const { user } = useAuth();

  // Track app open on mount
  useEffect(() => {
    storeAnalytics('app_open', { hasUser: !!user });
  }, []);

  const trackEvent = useCallback((event: AnalyticsEvent, data?: AnalyticsData) => {
    // Never track PII - only anonymous usage data
    const sanitizedData = data ? { ...data } : {};
    
    // Remove any potential PII
    delete (sanitizedData as any).email;
    delete (sanitizedData as any).name;
    delete (sanitizedData as any).userId;
    
    storeAnalytics(event, sanitizedData);
  }, []);

  const trackOnboardingStarted = useCallback(() => {
    trackEvent('onboarding_started');
  }, [trackEvent]);

  const trackOnboardingCompleted = useCallback(() => {
    trackEvent('onboarding_completed');
  }, [trackEvent]);

  const trackOnboardingSkipped = useCallback(() => {
    trackEvent('onboarding_skipped');
  }, [trackEvent]);

  const trackHabitCreated = useCallback((category?: string) => {
    trackEvent('habit_created', { category });
  }, [trackEvent]);

  const trackHabitCompleted = useCallback((streak?: number) => {
    trackEvent('habit_completed', { streak });
  }, [trackEvent]);

  const trackStreakMilestone = useCallback((days: number) => {
    trackEvent('streak_milestone', { days });
  }, [trackEvent]);

  const trackPlantAdvanced = useCallback((stage: number) => {
    trackEvent('plant_stage_advanced', { stage });
  }, [trackEvent]);

  const trackPremiumViewed = useCallback(() => {
    trackEvent('premium_page_viewed');
  }, [trackEvent]);

  const trackPremiumPurchased = useCallback((plan?: string) => {
    trackEvent('premium_purchased', { plan });
  }, [trackEvent]);

  const trackFeatureUsed = useCallback((feature: string) => {
    trackEvent(feature as AnalyticsEvent);
  }, [trackEvent]);

  return {
    trackEvent,
    trackOnboardingStarted,
    trackOnboardingCompleted,
    trackOnboardingSkipped,
    trackHabitCreated,
    trackHabitCompleted,
    trackStreakMilestone,
    trackPlantAdvanced,
    trackPremiumViewed,
    trackPremiumPurchased,
    trackFeatureUsed,
  };
}

// Get analytics summary (for debugging/export)
export function getAnalyticsSummary() {
  try {
    const stored = localStorage.getItem('cozy_habits_analytics') || '[]';
    const events = JSON.parse(stored);
    
    const summary: Record<string, number> = {};
    events.forEach((e: { event: string }) => {
      summary[e.event] = (summary[e.event] || 0) + 1;
    });
    
    return summary;
  } catch {
    return {};
  }
}

// Clear analytics data (for privacy compliance)
export function clearAnalyticsData() {
  localStorage.removeItem('cozy_habits_analytics');
  analyticsQueue.length = 0;
}

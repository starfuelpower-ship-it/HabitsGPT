import { useEffect, useCallback } from 'react';
import { Capacitor } from '@capacitor/core';

const REVIEW_STORAGE_KEY = 'cozy_habits_review_data';
const MIN_HABITS_COMPLETED = 5;
const MIN_APP_OPENS = 3;

interface ReviewData {
  habitsCompleted: number;
  appOpens: number;
  hasRequestedReview: boolean;
  lastRequestDate?: string;
}

const getReviewData = (): ReviewData => {
  try {
    const stored = localStorage.getItem(REVIEW_STORAGE_KEY);
    if (stored) {
      return JSON.parse(stored);
    }
  } catch {}
  return { habitsCompleted: 0, appOpens: 0, hasRequestedReview: false };
};

const saveReviewData = (data: ReviewData) => {
  localStorage.setItem(REVIEW_STORAGE_KEY, JSON.stringify(data));
};

export function useInAppReview() {
  // Track app opens on mount
  useEffect(() => {
    const data = getReviewData();
    data.appOpens = (data.appOpens || 0) + 1;
    saveReviewData(data);
  }, []);

  const trackHabitCompletion = useCallback(() => {
    const data = getReviewData();
    data.habitsCompleted = (data.habitsCompleted || 0) + 1;
    saveReviewData(data);
  }, []);

  const shouldRequestReview = useCallback((): boolean => {
    const data = getReviewData();
    
    // Don't request if already requested
    if (data.hasRequestedReview) {
      return false;
    }

    // Check if user meets criteria
    const meetsHabitCriteria = data.habitsCompleted >= MIN_HABITS_COMPLETED;
    const meetsOpenCriteria = data.appOpens >= MIN_APP_OPENS;

    return meetsHabitCriteria && meetsOpenCriteria;
  }, []);

  const requestReview = useCallback(async () => {
    if (!Capacitor.isNativePlatform()) {
      console.log('In-app review only available on native platforms');
      return;
    }

    try {
      // Dynamically import to avoid errors on web
      const { InAppReview } = await import('@capacitor-community/in-app-review');
      await InAppReview.requestReview();
      
      // Mark as requested
      const data = getReviewData();
      data.hasRequestedReview = true;
      data.lastRequestDate = new Date().toISOString();
      saveReviewData(data);
    } catch (error) {
      console.error('Failed to request in-app review:', error);
    }
  }, []);

  const tryRequestReview = useCallback(async () => {
    if (shouldRequestReview()) {
      await requestReview();
    }
  }, [shouldRequestReview, requestReview]);

  return {
    trackHabitCompletion,
    tryRequestReview,
    requestReview,
  };
}

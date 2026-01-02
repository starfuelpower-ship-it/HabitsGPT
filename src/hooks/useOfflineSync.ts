import { useState, useEffect, useCallback } from 'react';
import { toast } from 'sonner';

const OFFLINE_QUEUE_KEY = 'daily-reset-offline-queue';
const OFFLINE_HABITS_KEY = 'daily-reset-offline-habits';

interface OfflineAction {
  id: string;
  type: 'toggle' | 'add' | 'delete' | 'update';
  payload: any;
  timestamp: number;
}

export function useOfflineSync() {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [pendingActions, setPendingActions] = useState<OfflineAction[]>([]);
  const [isSyncing, setIsSyncing] = useState(false);

  // Load pending actions from storage
  useEffect(() => {
    const stored = localStorage.getItem(OFFLINE_QUEUE_KEY);
    if (stored) {
      setPendingActions(JSON.parse(stored));
    }
  }, []);

  // Save pending actions to storage
  useEffect(() => {
    localStorage.setItem(OFFLINE_QUEUE_KEY, JSON.stringify(pendingActions));
  }, [pendingActions]);

  // Listen for online/offline events
  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      toast.success('Back online! Syncing your changes...');
    };

    const handleOffline = () => {
      setIsOnline(false);
      toast.info('You\'re offline. Changes will sync when you reconnect.');
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Queue an action for later sync
  const queueAction = useCallback((action: Omit<OfflineAction, 'id' | 'timestamp'>) => {
    const newAction: OfflineAction = {
      ...action,
      id: Math.random().toString(36).substring(2, 9),
      timestamp: Date.now(),
    };
    setPendingActions(prev => [...prev, newAction]);
  }, []);

  // Clear a specific action from the queue
  const clearAction = useCallback((actionId: string) => {
    setPendingActions(prev => prev.filter(a => a.id !== actionId));
  }, []);

  // Clear all pending actions
  const clearAllActions = useCallback(() => {
    setPendingActions([]);
    localStorage.removeItem(OFFLINE_QUEUE_KEY);
  }, []);

  // Cache habits for offline viewing
  const cacheHabits = useCallback((habits: any[]) => {
    localStorage.setItem(OFFLINE_HABITS_KEY, JSON.stringify({
      habits,
      cachedAt: Date.now(),
    }));
  }, []);

  // Get cached habits
  const getCachedHabits = useCallback(() => {
    const stored = localStorage.getItem(OFFLINE_HABITS_KEY);
    if (stored) {
      const { habits, cachedAt } = JSON.parse(stored);
      return { habits, cachedAt };
    }
    return null;
  }, []);

  return {
    isOnline,
    isSyncing,
    pendingActions,
    hasPendingActions: pendingActions.length > 0,
    queueAction,
    clearAction,
    clearAllActions,
    cacheHabits,
    getCachedHabits,
    setIsSyncing,
  };
}

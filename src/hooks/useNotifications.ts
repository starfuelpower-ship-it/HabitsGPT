import { useState, useEffect, useCallback } from 'react';
import { toast } from 'sonner';

interface NotificationSettings {
  enabled: boolean;
  morningReminder: boolean;
  morningTime: string;
  eveningReminder: boolean;
  eveningTime: string;
  streakWarning: boolean;
  catReminder: boolean;
}

const DEFAULT_SETTINGS: NotificationSettings = {
  enabled: false, // OFF by default - user must explicitly opt-in
  morningReminder: true,
  morningTime: '08:00',
  eveningReminder: true,
  eveningTime: '20:00',
  streakWarning: true,
  catReminder: false, // Less important, default off
};

const NOTIFICATION_SETTINGS_KEY = 'daily-reset-notification-settings';

// Example notification messages
export const NOTIFICATION_MESSAGES = {
  morning: [
    "🌅 Good morning! Time to start your daily habits.",
    "☀️ Rise and shine! Your habits are waiting for you.",
    "🌱 A new day, new opportunities to grow!",
  ],
  evening: [
    "🌙 Don't forget to complete your habits before bed!",
    "✨ Evening check-in: How's your progress today?",
    "🎯 Last chance to check off today's habits!",
  ],
  streakWarning: [
    "🔥 Don't break your streak! Complete your habits today.",
    "⚡ Your streak is at risk! Open the app to keep it going.",
    "💪 Stay consistent! You've got habits to complete.",
  ],
  catReminder: [
    "🐱 Your cat companion misses you! Come say hi.",
    "😺 Meow! Your furry friend is waiting in the app.",
    "🐾 The cat is getting lonely... time for a habit check!",
  ],
};

export function useNotifications() {
  const [settings, setSettings] = useState<NotificationSettings>(() => {
    const stored = localStorage.getItem(NOTIFICATION_SETTINGS_KEY);
    return stored ? JSON.parse(stored) : DEFAULT_SETTINGS;
  });
  const [permission, setPermission] = useState<NotificationPermission>('default');

  // Check notification permission
  useEffect(() => {
    if ('Notification' in window) {
      setPermission(Notification.permission);
    }
  }, []);

  // Save settings
  useEffect(() => {
    localStorage.setItem(NOTIFICATION_SETTINGS_KEY, JSON.stringify(settings));
  }, [settings]);

  // Request permission
  const requestPermission = useCallback(async () => {
    if (!('Notification' in window)) {
      toast.error('Notifications not supported on this device');
      return false;
    }

    try {
      const result = await Notification.requestPermission();
      setPermission(result);
      
      if (result === 'granted') {
        toast.success('Notifications enabled!');
        return true;
      } else {
        toast.error('Notification permission denied');
        return false;
      }
    } catch (error) {
      toast.error('Failed to request notification permission');
      return false;
    }
  }, []);

  // Send a local notification (demo)
  const sendNotification = useCallback((title: string, body: string, tag?: string) => {
    if (permission !== 'granted') return;

    try {
      const notification = new Notification(title, {
        body,
        icon: '/favicon.ico',
        tag: tag || 'daily-reset',
      });

      notification.onclick = () => {
        window.focus();
        notification.close();
      };
    } catch (error) {
      // Fallback to toast if notification fails
      toast(title, { description: body });
    }
  }, [permission]);

  // Schedule notifications (scaffolding - actual scheduling requires service worker)
  const scheduleNotifications = useCallback(() => {
    if (!settings.enabled || permission !== 'granted') return;

    // This is scaffolding - in production, you'd use a service worker
    // or push notification service for actual scheduling
    console.log('Notification scheduling configured:', {
      morning: settings.morningReminder ? settings.morningTime : 'disabled',
      evening: settings.eveningReminder ? settings.eveningTime : 'disabled',
      streakWarning: settings.streakWarning,
      catReminder: settings.catReminder,
    });

    toast.info('Notifications scheduled! (Demo mode)');
  }, [settings, permission]);

  // Update a setting
  const updateSetting = useCallback(<K extends keyof NotificationSettings>(
    key: K,
    value: NotificationSettings[K]
  ) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  }, []);

  // Test notification
  const testNotification = useCallback((type: keyof typeof NOTIFICATION_MESSAGES) => {
    const messages = NOTIFICATION_MESSAGES[type];
    const message = messages[Math.floor(Math.random() * messages.length)];
    sendNotification('Cozy Habits', message, type);
  }, [sendNotification]);

  return {
    settings,
    permission,
    isSupported: 'Notification' in window,
    requestPermission,
    sendNotification,
    scheduleNotifications,
    updateSetting,
    testNotification,
  };
}

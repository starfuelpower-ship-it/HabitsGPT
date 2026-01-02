import { useState } from 'react';
import { Bell, BellOff, Sun, Moon, Flame, Cat, Info } from 'lucide-react';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useNotifications } from '@/hooks/useNotifications';

export function NotificationSettings() {
  const {
    settings,
    permission,
    isSupported,
    requestPermission,
    updateSetting,
    testNotification,
    scheduleNotifications,
  } = useNotifications();
  
  const [showExplanation, setShowExplanation] = useState(false);

  if (!isSupported) {
    return (
      <div className="text-center py-4 text-muted-foreground">
        <BellOff className="w-8 h-8 mx-auto mb-2 opacity-50" />
        <p className="text-sm">Notifications not supported on this device</p>
      </div>
    );
  }

  // Show explanation before requesting permission
  const handleEnableClick = () => {
    if (permission === 'default') {
      setShowExplanation(true);
    } else {
      requestPermission();
    }
  };

  const handleConfirmEnable = async () => {
    setShowExplanation(false);
    const granted = await requestPermission();
    if (granted) {
      updateSetting('enabled', true);
    }
  };

  return (
    <div className="space-y-4">
      {/* Explanation Modal/Card */}
      {showExplanation && (
        <div className="p-4 rounded-xl bg-primary/10 border border-primary/20 space-y-3">
          <div className="flex items-start gap-3">
            <Info className="w-5 h-5 text-primary mt-0.5" />
            <div className="space-y-2">
              <p className="text-sm font-medium text-foreground">Why enable notifications?</p>
              <ul className="text-xs text-muted-foreground space-y-1">
                <li>• Get gentle reminders to complete your habits</li>
                <li>• Celebrate streak milestones (3, 7, 30 days!)</li>
                <li>• Never miss a day and keep your progress</li>
              </ul>
              <p className="text-xs text-muted-foreground">
                We respect your time — no ads, no spam. You control exactly which notifications you receive.
              </p>
            </div>
          </div>
          <div className="flex gap-2">
            <Button size="sm" variant="outline" onClick={() => setShowExplanation(false)} className="flex-1">
              Not Now
            </Button>
            <Button size="sm" onClick={handleConfirmEnable} className="flex-1">
              Enable Notifications
            </Button>
          </div>
        </div>
      )}

      {/* Enable Notifications */}
      {!showExplanation && (
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Bell className="w-5 h-5 text-muted-foreground" />
            <div>
              <p className="font-medium text-foreground">Enable Notifications</p>
              <p className="text-xs text-muted-foreground">
                {permission === 'granted' 
                  ? 'Notifications enabled' 
                  : permission === 'denied'
                  ? 'Permission denied in settings'
                  : 'Get reminders for your habits'}
              </p>
            </div>
          </div>
          {permission === 'denied' ? (
            <span className="text-xs text-muted-foreground">Blocked</span>
          ) : permission !== 'granted' ? (
            <Button size="sm" onClick={handleEnableClick} variant="outline">
              Enable
            </Button>
          ) : (
            <Switch
              checked={settings.enabled}
              onCheckedChange={(checked) => updateSetting('enabled', checked)}
            />
          )}
        </div>
      )}

      {settings.enabled && permission === 'granted' && (
        <>
          {/* Morning Reminder */}
          <div className="pl-8 space-y-3 border-l-2 border-border ml-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Sun className="w-4 h-4 text-yellow-500" />
                <span className="text-sm">Morning Reminder</span>
              </div>
              <Switch
                checked={settings.morningReminder}
                onCheckedChange={(checked) => updateSetting('morningReminder', checked)}
              />
            </div>
            {settings.morningReminder && (
              <div className="flex items-center gap-2">
                <Label className="text-xs text-muted-foreground">Time:</Label>
                <Input
                  type="time"
                  value={settings.morningTime}
                  onChange={(e) => updateSetting('morningTime', e.target.value)}
                  className="w-28 h-8 text-sm"
                />
              </div>
            )}
          </div>

          {/* Evening Reminder */}
          <div className="pl-8 space-y-3 border-l-2 border-border ml-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Moon className="w-4 h-4 text-indigo-400" />
                <span className="text-sm">Evening Reminder</span>
              </div>
              <Switch
                checked={settings.eveningReminder}
                onCheckedChange={(checked) => updateSetting('eveningReminder', checked)}
              />
            </div>
            {settings.eveningReminder && (
              <div className="flex items-center gap-2">
                <Label className="text-xs text-muted-foreground">Time:</Label>
                <Input
                  type="time"
                  value={settings.eveningTime}
                  onChange={(e) => updateSetting('eveningTime', e.target.value)}
                  className="w-28 h-8 text-sm"
                />
              </div>
            )}
          </div>

          {/* Streak Warning */}
          <div className="pl-8 border-l-2 border-border ml-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Flame className="w-4 h-4 text-orange-500" />
                <div>
                  <span className="text-sm">Streak Warning</span>
                  <p className="text-xs text-muted-foreground">Remind if habits incomplete late in day</p>
                </div>
              </div>
              <Switch
                checked={settings.streakWarning}
                onCheckedChange={(checked) => updateSetting('streakWarning', checked)}
              />
            </div>
          </div>

          {/* Cat Reminder */}
          <div className="pl-8 border-l-2 border-border ml-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Cat className="w-4 h-4 text-amber-500" />
                <span className="text-sm">Cat Companion Reminder</span>
              </div>
              <Switch
                checked={settings.catReminder}
                onCheckedChange={(checked) => updateSetting('catReminder', checked)}
              />
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2 pt-2">
            <Button
              size="sm"
              variant="outline"
              onClick={() => testNotification('morning')}
              className="flex-1"
            >
              Test
            </Button>
            <Button
              size="sm"
              onClick={scheduleNotifications}
              className="flex-1"
            >
              Save Settings
            </Button>
          </div>
        </>
      )}
    </div>
  );
}

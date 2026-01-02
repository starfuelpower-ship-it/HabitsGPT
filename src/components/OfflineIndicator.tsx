import { WifiOff, Cloud, RefreshCw } from 'lucide-react';
import { useOfflineSync } from '@/hooks/useOfflineSync';
import { cn } from '@/lib/utils';

export function OfflineIndicator() {
  const { isOnline, hasPendingActions, pendingActions } = useOfflineSync();

  if (isOnline && !hasPendingActions) return null;

  return (
    <div
      className={cn(
        'fixed top-4 left-1/2 -translate-x-1/2 z-50 px-4 py-2 rounded-full shadow-lg flex items-center gap-2 text-sm font-medium transition-all animate-fade-in',
        isOnline
          ? 'bg-yellow-500/90 text-yellow-950'
          : 'bg-muted/90 text-foreground border border-border'
      )}
    >
      {!isOnline ? (
        <>
          <WifiOff className="w-4 h-4" />
          <span>Offline Mode</span>
        </>
      ) : hasPendingActions ? (
        <>
          <RefreshCw className="w-4 h-4 animate-spin" />
          <span>Syncing {pendingActions.length} changes...</span>
        </>
      ) : null}
    </div>
  );
}

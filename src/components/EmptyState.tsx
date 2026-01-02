import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';

// ============================================
// EMPTY STATE
// ============================================
// Friendly empty state with illustration
// Customize: Change the illustration, text, or button

interface EmptyStateProps {
  title?: string;
  description?: string;
  actionLabel?: string;
  onAction?: () => void;
  illustration?: 'habits' | 'groups' | 'journal' | 'stats';
}

const illustrations: Record<string, string> = {
  habits: '🌱',
  groups: '👥',
  journal: '📔',
  stats: '📊',
};

export function EmptyState({
  title = 'No habits yet',
  description = 'Start building better habits by adding your first one below.',
  actionLabel,
  onAction,
  illustration = 'habits',
}: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-12 px-6 text-center animate-fade-in">
      {/* Illustration */}
      <div className="w-32 h-32 rounded-full bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center mb-6">
        <span className="text-6xl">{illustrations[illustration]}</span>
      </div>

      {/* Text */}
      <h3 className="text-xl font-semibold text-foreground mb-2">{title}</h3>
      <p className="text-muted-foreground max-w-xs mb-6">{description}</p>

      {/* Action button */}
      {actionLabel && onAction && (
        <Button onClick={onAction} className="gap-2">
          <Plus className="w-4 h-4" />
          {actionLabel}
        </Button>
      )}
    </div>
  );
}

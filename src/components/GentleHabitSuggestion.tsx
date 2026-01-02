import { useState } from 'react';
import { Feather, Loader2, Check, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { cn } from '@/lib/utils';

interface GentleHabitSuggestionProps {
  habitName: string;
  isPremium: boolean;
  onAccept: (gentlerName: string) => void;
  onUpgrade?: () => void;
}

export function GentleHabitSuggestion({ 
  habitName, 
  isPremium, 
  onAccept,
  onUpgrade 
}: GentleHabitSuggestionProps) {
  const [suggestion, setSuggestion] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [visible, setVisible] = useState(false);

  const getSuggestion = async () => {
    if (!habitName.trim()) return;
    
    setLoading(true);
    setVisible(true);
    
    try {
      const { data, error } = await supabase.functions.invoke('gentle-ai', {
        body: { type: 'habit', content: habitName.trim() }
      });

      if (error || data?.fallback || !data?.reflection) {
        setSuggestion(null);
        setVisible(false);
      } else {
        setSuggestion(data.reflection);
      }
    } catch (err) {
      setSuggestion(null);
      setVisible(false);
    } finally {
      setLoading(false);
    }
  };

  const handleClick = () => {
    if (!isPremium && onUpgrade) {
      onUpgrade();
      return;
    }
    getSuggestion();
  };

  const handleAccept = () => {
    if (suggestion) {
      onAccept(suggestion);
      setVisible(false);
      setSuggestion(null);
    }
  };

  const handleDismiss = () => {
    setVisible(false);
    setSuggestion(null);
  };

  if (!visible) {
    return (
      <Button
        type="button"
        variant="ghost"
        size="sm"
        onClick={handleClick}
        disabled={!habitName.trim() || habitName.length < 3}
        className="gap-1.5 text-xs text-muted-foreground hover:text-primary transition-colors h-7 px-2"
      >
        <Feather className="w-3 h-3" />
        <span>Make it gentler</span>
        {!isPremium && (
          <span className="text-[10px] bg-primary/10 text-primary px-1 py-0.5 rounded-full">Pro</span>
        )}
      </Button>
    );
  }

  return (
    <div 
      className={cn(
        "rounded-xl p-3 bg-gradient-to-br from-primary/5 to-accent/5 border border-primary/10",
        "animate-in fade-in-0 slide-in-from-top-2 duration-300"
      )}
    >
      {loading ? (
        <div className="flex items-center gap-2 text-muted-foreground">
          <Loader2 className="w-3 h-3 animate-spin" />
          <span className="text-xs italic">Finding a gentler way...</span>
        </div>
      ) : suggestion ? (
        <div className="space-y-2">
          <div className="flex items-start gap-2">
            <Feather className="w-3 h-3 text-primary mt-0.5 shrink-0" />
            <p className="text-sm text-foreground/90">
              {suggestion}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button
              type="button"
              size="sm"
              variant="ghost"
              onClick={handleAccept}
              className="h-7 px-2 gap-1 text-xs text-primary hover:text-primary"
            >
              <Check className="w-3 h-3" />
              Use this
            </Button>
            <Button
              type="button"
              size="sm"
              variant="ghost"
              onClick={handleDismiss}
              className="h-7 px-2 gap-1 text-xs text-muted-foreground"
            >
              <X className="w-3 h-3" />
              Keep original
            </Button>
          </div>
        </div>
      ) : null}
    </div>
  );
}

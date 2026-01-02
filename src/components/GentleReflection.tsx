import { useState } from 'react';
import { Sparkles, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { useAchievements } from '@/hooks/useAchievements';
import { cn } from '@/lib/utils';

interface GentleReflectionProps {
  content: string;
  isPremium: boolean;
  onUpgrade?: () => void;
}

const FALLBACK_MESSAGES = [
  "That's okay — your words are still enough.",
  "Sometimes just writing it down is its own kind of care.",
  "Your reflection matters, even without words back.",
];

export function GentleReflection({ content, isPremium, onUpgrade }: GentleReflectionProps) {
  const [reflection, setReflection] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [visible, setVisible] = useState(false);
  const { checkAndAwardAchievements } = useAchievements();

  const getReflection = async () => {
    if (!content.trim()) return;
    
    setLoading(true);
    setVisible(true);
    
    try {
      const { data, error } = await supabase.functions.invoke('gentle-ai', {
        body: { type: 'journal', content: content.trim() }
      });

      if (error || data?.fallback) {
        const fallback = FALLBACK_MESSAGES[Math.floor(Math.random() * FALLBACK_MESSAGES.length)];
        setReflection(fallback);
      } else {
        setReflection(data.reflection);
        // Award AI achievement when successfully getting a reflection
        checkAndAwardAchievements({ aiUsed: true });
      }
    } catch (err) {
      const fallback = FALLBACK_MESSAGES[Math.floor(Math.random() * FALLBACK_MESSAGES.length)];
      setReflection(fallback);
    } finally {
      setLoading(false);
    }
  };

  const handleClick = () => {
    if (!isPremium && onUpgrade) {
      onUpgrade();
      return;
    }
    getReflection();
  };

  if (!visible) {
    return (
      <Button
        variant="ghost"
        size="sm"
        onClick={handleClick}
        disabled={!content.trim()}
        className="gap-2 text-muted-foreground hover:text-primary transition-colors"
      >
        <Sparkles className="w-4 h-4" />
        <span className="text-sm">Gentle reflection</span>
        {!isPremium && (
          <span className="text-xs bg-primary/10 text-primary px-1.5 py-0.5 rounded-full">Pro</span>
        )}
      </Button>
    );
  }

  return (
    <div 
      className={cn(
        "rounded-2xl p-4 bg-gradient-to-br from-primary/5 to-accent/5 border border-primary/10",
        "animate-in fade-in-0 slide-in-from-bottom-2 duration-500"
      )}
    >
      {loading ? (
        <div className="flex items-center gap-3 text-muted-foreground">
          <Loader2 className="w-4 h-4 animate-spin" />
          <span className="text-sm italic">Reflecting...</span>
        </div>
      ) : (
        <div className="space-y-2">
          <div className="flex items-start gap-2">
            <Sparkles className="w-4 h-4 text-primary mt-0.5 shrink-0" />
            <p className="text-sm text-foreground/90 leading-relaxed italic">
              {reflection}
            </p>
          </div>
          <button 
            onClick={() => setVisible(false)}
            className="text-xs text-muted-foreground hover:text-foreground transition-colors"
          >
            Dismiss
          </button>
        </div>
      )}
    </div>
  );
}

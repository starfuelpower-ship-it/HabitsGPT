import { useQuotes } from '@/contexts/QuotesContext';
import { Quote, ChevronLeft } from 'lucide-react';
import { useSoundEffects } from '@/hooks/useSoundEffects';

export function QuoteDisplay() {
  const { currentQuote, refreshQuote, goBack, canGoBack } = useQuotes();
  const { playSound } = useSoundEffects();

  if (!currentQuote) return null;

  const handleTap = () => {
    playSound('click');
    refreshQuote();
  };

  const handleGoBack = (e: React.MouseEvent) => {
    e.stopPropagation();
    playSound('click');
    goBack();
  };

  return (
    <div className="relative">
      {canGoBack && (
        <button
          onClick={handleGoBack}
          className="absolute -left-2 top-1/2 -translate-y-1/2 w-8 h-8 flex items-center justify-center rounded-full bg-muted/80 hover:bg-muted text-muted-foreground hover:text-foreground transition-all z-10"
          aria-label="Previous quote"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>
      )}
      <button
        onClick={handleTap}
        className="w-full flex items-start gap-2 px-4 py-3 rounded-xl bg-primary/5 border border-primary/10 animate-fade-in hover:bg-primary/10 active:scale-[0.98] transition-all text-left cursor-pointer"
      >
        <Quote className="w-4 h-4 text-primary/60 flex-shrink-0 mt-0.5" />
        <p className="text-sm text-foreground/70 font-medium leading-relaxed italic">
          {currentQuote}
        </p>
      </button>
    </div>
  );
}

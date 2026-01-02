import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { WidgetPreviews } from '@/components/WidgetPreviews';
import { BottomTabBar } from '@/components/BottomTabBar';

export default function Widgets() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-lg mx-auto px-4 py-6 pb-32">
        {/* Header */}
        <div className="flex items-center gap-4 mb-6">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate(-1)}
            className="shrink-0"
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <h1 className="text-2xl font-bold text-foreground">Widgets</h1>
        </div>

        {/* Widget Previews */}
        <WidgetPreviews />
      </div>

      <BottomTabBar />
    </div>
  );
}

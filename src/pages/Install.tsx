import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Download, Smartphone, Check, Share, Plus, MoreVertical } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

const Install = () => {
  const navigate = useNavigate();
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isInstalled, setIsInstalled] = useState(false);
  const [isIOS, setIsIOS] = useState(false);

  useEffect(() => {
    // Check if already installed
    if (window.matchMedia("(display-mode: standalone)").matches) {
      setIsInstalled(true);
    }

    // Detect iOS
    const iOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
    setIsIOS(iOS);

    // Listen for install prompt (Android/Desktop)
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);

    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) return;

    await deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;

    if (outcome === "accepted") {
      setIsInstalled(true);
    }
    setDeferredPrompt(null);
  };

  if (isInstalled) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="max-w-md w-full">
          <CardContent className="pt-6 text-center">
            <div className="w-16 h-16 bg-primary/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <Check className="w-8 h-8 text-primary" />
            </div>
            <h1 className="text-2xl font-bold text-foreground mb-2">Already Installed!</h1>
            <p className="text-muted-foreground mb-6">
              Cozy Habits is installed on your device. Open it from your home screen for the best experience.
            </p>
            <Button onClick={() => navigate("/")} className="w-full">
              Open App
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="max-w-md w-full">
        <CardContent className="pt-6">
          <div className="text-center mb-6">
            <div className="w-20 h-20 bg-gradient-to-br from-primary/30 to-accent/30 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
              <span className="text-4xl">🌱</span>
            </div>
            <h1 className="text-2xl font-bold text-foreground mb-2">Install Cozy Habits</h1>
            <p className="text-muted-foreground">
              Add to your home screen for quick access and a native app experience
            </p>
          </div>

          {/* Benefits */}
          <div className="space-y-3 mb-6">
            <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
              <Smartphone className="w-5 h-5 text-primary" />
              <span className="text-sm text-foreground">Works offline</span>
            </div>
            <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
              <Download className="w-5 h-5 text-primary" />
              <span className="text-sm text-foreground">Quick launch from home screen</span>
            </div>
            <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
              <Check className="w-5 h-5 text-primary" />
              <span className="text-sm text-foreground">Full screen experience</span>
            </div>
          </div>

          {/* Install Instructions */}
          {isIOS ? (
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground text-center font-medium">
                To install on your device:
              </p>
              <div className="space-y-3">
                <div className="flex items-center gap-3 p-3 border border-border rounded-lg">
                  <div className="w-8 h-8 bg-primary/20 rounded-full flex items-center justify-center text-sm font-bold text-primary">
                    1
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm">Tap the</span>
                    <Share className="w-5 h-5 text-primary" />
                    <span className="text-sm">Share button</span>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-3 border border-border rounded-lg">
                  <div className="w-8 h-8 bg-primary/20 rounded-full flex items-center justify-center text-sm font-bold text-primary">
                    2
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm">Tap</span>
                    <Plus className="w-5 h-5 text-primary" />
                    <span className="text-sm font-medium">"Add to Home Screen"</span>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-3 border border-border rounded-lg">
                  <div className="w-8 h-8 bg-primary/20 rounded-full flex items-center justify-center text-sm font-bold text-primary">
                    3
                  </div>
                  <span className="text-sm">Tap <span className="font-medium">"Add"</span> to confirm</span>
                </div>
              </div>
            </div>
          ) : deferredPrompt ? (
            <Button onClick={handleInstall} className="w-full" size="lg">
              <Download className="w-5 h-5 mr-2" />
              Install App
            </Button>
          ) : (
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground text-center font-medium">
                To install on Android:
              </p>
              <div className="space-y-3">
                <div className="flex items-center gap-3 p-3 border border-border rounded-lg">
                  <div className="w-8 h-8 bg-primary/20 rounded-full flex items-center justify-center text-sm font-bold text-primary">
                    1
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm">Tap the</span>
                    <MoreVertical className="w-5 h-5 text-primary" />
                    <span className="text-sm">menu button</span>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-3 border border-border rounded-lg">
                  <div className="w-8 h-8 bg-primary/20 rounded-full flex items-center justify-center text-sm font-bold text-primary">
                    2
                  </div>
                  <span className="text-sm">Tap <span className="font-medium">"Install app"</span> or <span className="font-medium">"Add to Home screen"</span></span>
                </div>
              </div>
            </div>
          )}

          <Button
            variant="ghost"
            onClick={() => navigate("/")}
            className="w-full mt-4"
          >
            Continue in browser
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default Install;

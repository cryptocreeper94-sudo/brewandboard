import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Download, X, Smartphone } from "lucide-react";
import { Button } from "@/components/ui/button";

export function InstallPrompt() {
  const [showPrompt, setShowPrompt] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);

  useEffect(() => {
    const hasSeenInstall = localStorage.getItem("has_seen_install_prompt");
    
    const handleBeforeInstall = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
      
      if (!hasSeenInstall) {
        setTimeout(() => setShowPrompt(true), 2000);
      }
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstall);
    
    if (!hasSeenInstall && !window.matchMedia('(display-mode: standalone)').matches) {
      setTimeout(() => setShowPrompt(true), 3000);
    }

    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstall);
    };
  }, []);

  const handleInstall = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === "accepted") {
        localStorage.setItem("has_seen_install_prompt", "true");
      }
      setDeferredPrompt(null);
    } else {
      localStorage.setItem("has_seen_install_prompt", "true");
    }
    setShowPrompt(false);
  };

  const handleDismiss = () => {
    localStorage.setItem("has_seen_install_prompt", "true");
    setShowPrompt(false);
  };

  if (window.matchMedia('(display-mode: standalone)').matches) {
    return null;
  }

  return (
    <AnimatePresence>
      {showPrompt && (
        <motion.div
          initial={{ opacity: 0, y: 50, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 50, scale: 0.9 }}
          className="fixed bottom-24 left-4 right-4 z-50 max-w-sm mx-auto"
        >
          <div className="bg-card border border-border/50 rounded-2xl shadow-2xl overflow-hidden">
            {/* Header */}
            <div className="bg-gradient-to-r from-amber-600 to-amber-700 p-4 text-white relative">
              <button
                onClick={handleDismiss}
                className="absolute top-3 right-3 p-1 rounded-full hover:bg-white/20 transition-colors"
                data-testid="button-dismiss-install"
              >
                <X className="h-4 w-4" />
              </button>
              <div className="flex items-center gap-3">
                <div className="p-2 bg-white/20 rounded-full">
                  <Smartphone className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="font-serif font-bold">Install Coffee Talk</h3>
                  <p className="text-amber-100 text-xs">Add to home screen for quick access</p>
                </div>
              </div>
            </div>
            
            {/* Content */}
            <div className="p-4 space-y-3">
              <p className="text-sm text-muted-foreground">
                Install our app for a faster, native-like experience. Access your orders and portfolio instantly!
              </p>
              
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleDismiss}
                  className="flex-1"
                  data-testid="button-install-later"
                >
                  Not Now
                </Button>
                <Button
                  size="sm"
                  onClick={handleInstall}
                  className="flex-1 bg-amber-600 hover:bg-amber-700 text-white"
                  data-testid="button-install-app"
                >
                  <Download className="mr-2 h-4 w-4" />
                  Install
                </Button>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export default InstallPrompt;

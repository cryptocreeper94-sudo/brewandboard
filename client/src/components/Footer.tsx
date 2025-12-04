import { useState } from "react";
import { motion } from "framer-motion";
import { Code, Lock } from "lucide-react";
import { useLocation } from "wouter";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";

const DEVELOPER_PIN = "0424";

export function Footer() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [showDevLogin, setShowDevLogin] = useState(false);
  const [pin, setPin] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleDevLogin = () => {
    setIsLoading(true);
    
    setTimeout(() => {
      if (pin === DEVELOPER_PIN) {
        // Create developer user for full access to all features
        const devUser = {
          id: "developer-admin",
          email: "dev@coffeetalk.app",
          businessName: "Coffee Talk Developer",
          contactName: "Developer Admin",
          isDeveloper: true
        };
        localStorage.setItem("coffee_user", JSON.stringify(devUser));
        localStorage.setItem("coffee_dev_auth", "true");
        // Set a long session expiry (30 days)
        const thirtyDays = 30 * 24 * 60 * 60 * 1000;
        localStorage.setItem("coffee_session_expiry", String(Date.now() + thirtyDays));
        
        toast({
          title: "Developer Access Granted",
          description: "Full access enabled. Welcome to Coffee Talk!",
        });
        setShowDevLogin(false);
        setPin("");
        setLocation("/developers");
      } else {
        toast({
          title: "Access Denied",
          description: "Invalid developer PIN.",
          variant: "destructive"
        });
      }
      setIsLoading(false);
    }, 500);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && pin.length === 4) {
      handleDevLogin();
    }
  };

  return (
    <>
      <motion.footer
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="fixed bottom-0 left-0 right-0 z-30 bg-background/80 backdrop-blur-md border-t border-border/30"
      >
        <div className="container max-w-5xl mx-auto px-4 py-3">
          <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground">
            <span>Powered by</span>
            <a 
              href="https://darkwavestudios.io" 
              target="_blank" 
              rel="noopener noreferrer"
              className="font-serif font-semibold text-foreground hover:text-amber-600 transition-colors underline-offset-2 hover:underline"
              data-testid="link-darkwave"
            >
              Darkwave Studios, LLC
            </a>
            <span className="mx-1">•</span>
            <span>&copy; 2025</span>
            <span className="mx-1">•</span>
            <button
              onClick={() => setShowDevLogin(true)}
              className="flex items-center gap-1 text-muted-foreground/60 hover:text-amber-600 transition-colors"
              data-testid="button-dev-login"
            >
              <Code className="h-3 w-3" />
              <span>Developer</span>
            </button>
          </div>
        </div>
      </motion.footer>

      <Dialog open={showDevLogin} onOpenChange={setShowDevLogin}>
        <DialogContent className="sm:max-w-[320px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Lock className="h-5 w-5 text-primary" />
              Developer Access
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 pt-2">
            <p className="text-sm text-muted-foreground">
              Enter your developer PIN to access the Developer Hub.
            </p>
            <Input
              type="password"
              placeholder="Enter 4-digit PIN"
              maxLength={4}
              value={pin}
              onChange={(e) => setPin(e.target.value.replace(/\D/g, ""))}
              onKeyDown={handleKeyDown}
              className="text-center text-lg tracking-widest"
              data-testid="input-dev-pin"
              autoFocus
            />
            <Button 
              onClick={handleDevLogin} 
              className="w-full"
              disabled={pin.length !== 4 || isLoading}
              data-testid="button-dev-submit"
            >
              {isLoading ? "Verifying..." : "Access Developer Hub"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}

export default Footer;

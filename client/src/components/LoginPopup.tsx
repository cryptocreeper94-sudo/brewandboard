import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useLocation } from "wouter";
import { LogIn, AlertTriangle, KeyRound } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface LoginPopupProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  onSwitchToRegister: () => void;
}

export function LoginPopup({ isOpen, onClose, onSuccess, onSwitchToRegister }: LoginPopupProps) {
  const [loginPin, setLoginPin] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const [, setLocation] = useLocation();
  
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    // Developer PIN bypass - go directly to developers portal
    if (loginPin === "0424") {
      const devUser = {
        id: "developer-admin",
        email: "dev@brewandboard.coffee",
        businessName: "Brew & Board Developer",
        contactName: "Developer Admin",
        name: "Developer Admin",
        isDeveloper: true
      };
      localStorage.setItem("coffee_user", JSON.stringify(devUser));
      localStorage.setItem("coffee_dev_auth", "true");
      localStorage.setItem("user_name", "Developer Admin");
      localStorage.removeItem("is_guest");
      const thirtyDays = 30 * 24 * 60 * 60 * 1000;
      localStorage.setItem("coffee_session_expiry", String(Date.now() + thirtyDays));
      
      toast({
        title: "Developer Access Granted",
        description: "Full access enabled. Welcome to Brew & Board!",
      });
      onClose();
      setLocation("/developers");
      return;
    }
    
    // Partner PIN - Sarah's full access to Partner Hub
    if (loginPin === "0777") {
      const partnerUser = {
        id: "partner-sarah",
        email: "sarah@brewandboard.coffee",
        businessName: "Brew & Board Partner",
        contactName: "Sarah",
        name: "Sarah",
        isPartner: true,
        role: "partner"
      };
      localStorage.setItem("coffee_user", JSON.stringify(partnerUser));
      localStorage.setItem("coffee_partner_auth", "true");
      localStorage.setItem("user_name", "Sarah");
      localStorage.removeItem("is_guest");
      const thirtyDays = 30 * 24 * 60 * 60 * 1000;
      localStorage.setItem("coffee_session_expiry", String(Date.now() + thirtyDays));
      
      toast({
        title: "Welcome, Sarah!",
        description: "Partner access granted. Your Partner Hub is ready.",
      });
      onClose();
      setLocation("/partner");
      return;
    }
    
    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ pin: loginPin })
      });

      if (!response.ok) {
        toast({
          title: "Access Denied",
          description: "Invalid PIN. Please try again or register.",
          variant: "destructive",
        });
        setLoginPin("");
        setIsLoading(false);
        return;
      }

      const user = await response.json();
      localStorage.setItem("coffee_user", JSON.stringify(user));
      localStorage.setItem("user_name", user.name);
      localStorage.removeItem("is_guest");
      
      if (rememberMe) {
        const expiry = new Date().getTime() + (30 * 24 * 60 * 60 * 1000);
        localStorage.setItem("coffee_session_expiry", expiry.toString());
      } else {
        const expiry = new Date().getTime() + (60 * 60 * 1000);
        localStorage.setItem("coffee_session_expiry", expiry.toString());
      }
      
      toast({
        title: "Welcome Back!",
        description: `Hello, ${user.name}!`,
      });
      onSuccess();
      onClose();
    } catch (error) {
      toast({
        title: "Error",
        description: "Login failed. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-sm bg-card border-border/50 overflow-hidden p-0">
        {/* Header with gradient */}
        <div className="bg-gradient-to-r from-amber-700 to-amber-800 p-6 text-white relative overflow-hidden">
          <div className="absolute inset-0 opacity-20">
            <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_30%_50%,rgba(255,255,255,0.3),transparent_50%)]" />
          </div>
          <div className="relative z-10 flex items-center gap-3">
            <div className="p-2 bg-white/20 rounded-full">
              <KeyRound className="h-6 w-6" />
            </div>
            <div>
              <DialogTitle className="text-xl font-serif text-white">Welcome Back!</DialogTitle>
              <p className="text-amber-100 text-sm mt-1">Enter your PIN to continue</p>
            </div>
          </div>
        </div>

        <form onSubmit={handleLogin} className="p-6 space-y-4">
          <div className="space-y-2">
            <Label className="text-xs uppercase tracking-widest text-muted-foreground font-semibold text-center block">
              Enter Your 4-Digit PIN
            </Label>
            <Input 
              type="password" 
              maxLength={4}
              value={loginPin}
              onChange={(e) => setLoginPin(e.target.value.replace(/\D/g, ''))}
              className="text-center text-3xl tracking-[0.5em] h-16 font-serif"
              placeholder="••••"
              autoFocus
              data-testid="input-login-pin"
            />
          </div>

          <div className="space-y-3 bg-muted/50 p-3 rounded-lg border border-border/30">
            <div className="flex items-center space-x-2">
              <Checkbox 
                id="persist-login" 
                checked={rememberMe}
                onCheckedChange={(checked) => setRememberMe(checked === true)}
                data-testid="checkbox-login-remember"
              />
              <label
                htmlFor="persist-login"
                className="text-sm font-medium leading-none cursor-pointer"
              >
                Keep me logged in for 30 days
              </label>
            </div>
            
            <AnimatePresence>
              {rememberMe && (
                <motion.div 
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="flex items-start gap-2 text-amber-600 text-xs bg-amber-50 dark:bg-amber-950/30 p-2 rounded"
                >
                  <AlertTriangle className="h-4 w-4 flex-shrink-0 mt-0.5" />
                  <span>Warning: Your account will be accessible to anyone who uses this device.</span>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <Button 
            type="submit" 
            className="w-full bg-amber-600 hover:bg-amber-700 text-white"
            disabled={isLoading || loginPin.length !== 4}
            data-testid="button-submit-login"
          >
            {isLoading ? "Logging in..." : (
              <>
                <LogIn className="mr-2 h-4 w-4" />
                Access My Account
              </>
            )}
          </Button>

          <div className="text-center pt-2">
            <button 
              type="button"
              onClick={onSwitchToRegister}
              className="text-sm text-amber-600 hover:text-amber-700 underline decoration-amber-300 underline-offset-4 transition-colors"
            >
              Don't have an account? Register
            </button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export default LoginPopup;

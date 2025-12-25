import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useLocation } from "wouter";
import { LogIn, AlertTriangle, KeyRound, User, Mail, Phone, Shield } from "lucide-react";
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

interface PartnerOnboardingData {
  partnerId: string;
  partnerName: string;
  initialPin: string;
}

export function LoginPopup({ isOpen, onClose, onSuccess, onSwitchToRegister }: LoginPopupProps) {
  const [loginPin, setLoginPin] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const [, setLocation] = useLocation();
  
  // Partner onboarding state
  const [showPartnerOnboarding, setShowPartnerOnboarding] = useState(false);
  const [partnerOnboardingData, setPartnerOnboardingData] = useState<PartnerOnboardingData | null>(null);
  const [onboardingForm, setOnboardingForm] = useState({
    fullName: "",
    email: "",
    phone: "",
    newPin: "",
    confirmPin: ""
  });
  
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
    
    // Ryan Admin PIN - DISABLED
    // Access revoked for security reasons
    
    // Try partner login via API (handles both initial 3-digit and personal 4-digit PINs)
    try {
      const partnerResponse = await fetch("/api/partners/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ pin: loginPin })
      });
      
      if (partnerResponse.ok) {
        const data = await partnerResponse.json();
        const { partner, usedInitialPin, needsOnboarding, showWelcomeModal, isPreviewMode } = data;
        
        // Store partner data for the Partner Hub
        localStorage.setItem("coffee_partner_data", JSON.stringify({
          partner,
          usedInitialPin,
          needsOnboarding,
          showWelcomeModal,
          isPreviewMode
        }));
        
        const partnerUser = {
          id: partner.id,
          email: `${partner.name.toLowerCase()}@brewandboard.coffee`,
          businessName: "Brew & Board Partner",
          contactName: partner.name,
          name: partner.name,
          isPartner: true,
          role: partner.role || "partner"
        };
        
        localStorage.setItem("coffee_user", JSON.stringify(partnerUser));
        localStorage.setItem("coffee_partner_auth", "true");
        localStorage.setItem("user_name", partner.name);
        localStorage.removeItem("is_guest");
        const thirtyDays = 30 * 24 * 60 * 60 * 1000;
        localStorage.setItem("coffee_session_expiry", String(Date.now() + thirtyDays));
        
        toast({
          title: `Welcome, ${partner.name}!`,
          description: needsOnboarding 
            ? "Please complete your account setup." 
            : "Partner access granted. Your Partner Hub is ready.",
        });
        
        onClose();
        setLocation("/partner");
        setIsLoading(false);
        return;
      } else if (partnerResponse.status === 403) {
        const error = await partnerResponse.json();
        toast({
          title: "Access Disabled",
          description: error.error || "Partner access is currently disabled.",
          variant: "destructive"
        });
        setLoginPin("");
        setIsLoading(false);
        return;
      }
      // If 401 or other error, continue to regular login flow
    } catch (e) {
      // Partner API not available, continue to regular login
      console.log("Partner login API not available, trying regular login");
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

  const handlePartnerOnboarding = async () => {
    if (!partnerOnboardingData) return;
    
    // Validate form
    if (!onboardingForm.fullName.trim()) {
      toast({ title: "Name required", description: "Please enter your full name.", variant: "destructive" });
      return;
    }
    if (!onboardingForm.email.trim() || !onboardingForm.email.includes("@")) {
      toast({ title: "Valid email required", description: "Please enter a valid email address.", variant: "destructive" });
      return;
    }
    if (!onboardingForm.phone.trim()) {
      toast({ title: "Phone required", description: "Please enter your phone number.", variant: "destructive" });
      return;
    }
    if (onboardingForm.newPin.length !== 4 || !/^\d{4}$/.test(onboardingForm.newPin)) {
      toast({ title: "Invalid PIN", description: "Please enter a 4-digit PIN.", variant: "destructive" });
      return;
    }
    if (onboardingForm.newPin !== onboardingForm.confirmPin) {
      toast({ title: "PINs don't match", description: "Please make sure your PINs match.", variant: "destructive" });
      return;
    }
    // Don't allow reserved PINs
    if (["444", "0424", "5555", "7777"].includes(onboardingForm.newPin)) {
      toast({ title: "Reserved PIN", description: "This PIN is reserved. Please choose a different 4-digit PIN.", variant: "destructive" });
      return;
    }
    
    setIsLoading(true);
    
    // Save partner data to localStorage
    const partnerData = {
      fullName: onboardingForm.fullName,
      email: onboardingForm.email,
      phone: onboardingForm.phone,
      pin: onboardingForm.newPin,
      onboardedAt: new Date().toISOString()
    };
    
    localStorage.setItem(`partner_data_${partnerOnboardingData.partnerId}`, JSON.stringify(partnerData));
    localStorage.setItem(`partner_onboarded_${partnerOnboardingData.partnerId}`, "true");
    
    // Now log them in
    const partnerUser = {
      id: partnerOnboardingData.partnerId,
      email: onboardingForm.email,
      businessName: "Brew & Board Partner",
      contactName: onboardingForm.fullName,
      name: onboardingForm.fullName,
      phone: onboardingForm.phone,
      isPartner: true,
      role: "partner"
    };
    localStorage.setItem("coffee_user", JSON.stringify(partnerUser));
    localStorage.setItem("coffee_partner_auth", "true");
    localStorage.setItem("user_name", onboardingForm.fullName);
    localStorage.removeItem("is_guest");
    const thirtyDays = 30 * 24 * 60 * 60 * 1000;
    localStorage.setItem("coffee_session_expiry", String(Date.now() + thirtyDays));
    
    toast({
      title: `Welcome, ${onboardingForm.fullName}!`,
      description: "Your account is set up. Remember your new 4-digit PIN for future logins.",
    });
    
    setShowPartnerOnboarding(false);
    setPartnerOnboardingData(null);
    setIsLoading(false);
    onClose();
    setLocation("/partner");
  };

  // Partner onboarding modal
  if (showPartnerOnboarding && partnerOnboardingData) {
    return (
      <Dialog open={true} onOpenChange={() => { setShowPartnerOnboarding(false); setPartnerOnboardingData(null); }}>
        <DialogContent className="sm:max-w-md bg-card border-border/50 overflow-hidden p-0">
          <div className="bg-gradient-to-r from-amber-600 to-amber-700 p-6 text-white relative overflow-hidden">
            <div className="absolute inset-0 opacity-20">
              <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_30%_50%,rgba(255,255,255,0.3),transparent_50%)]" />
            </div>
            <div className="relative z-10 flex items-center gap-3">
              <div className="p-2 bg-white/20 rounded-full">
                <Shield className="h-6 w-6" />
              </div>
              <div>
                <DialogTitle className="text-xl font-serif text-white">Welcome, {partnerOnboardingData.partnerName}!</DialogTitle>
                <p className="text-amber-100 text-sm mt-1">Complete your partner account setup</p>
              </div>
            </div>
          </div>

          <div className="p-6 space-y-4">
            <p className="text-sm text-muted-foreground text-center">
              Please provide your contact information and create a personal 4-digit PIN for future logins.
            </p>

            <div className="space-y-3">
              <div className="space-y-1">
                <Label className="text-xs font-semibold text-muted-foreground flex items-center gap-2">
                  <User className="h-3 w-3" /> Full Name
                </Label>
                <Input 
                  value={onboardingForm.fullName}
                  onChange={(e) => setOnboardingForm(prev => ({ ...prev, fullName: e.target.value }))}
                  placeholder="Your full name"
                  className="h-10"
                  data-testid="input-partner-name"
                />
              </div>
              
              <div className="space-y-1">
                <Label className="text-xs font-semibold text-muted-foreground flex items-center gap-2">
                  <Mail className="h-3 w-3" /> Email Address
                </Label>
                <Input 
                  type="email"
                  value={onboardingForm.email}
                  onChange={(e) => setOnboardingForm(prev => ({ ...prev, email: e.target.value }))}
                  placeholder="your@email.com"
                  className="h-10"
                  data-testid="input-partner-email"
                />
              </div>
              
              <div className="space-y-1">
                <Label className="text-xs font-semibold text-muted-foreground flex items-center gap-2">
                  <Phone className="h-3 w-3" /> Phone Number
                </Label>
                <Input 
                  type="tel"
                  value={onboardingForm.phone}
                  onChange={(e) => setOnboardingForm(prev => ({ ...prev, phone: e.target.value }))}
                  placeholder="(555) 123-4567"
                  className="h-10"
                  data-testid="input-partner-phone"
                />
              </div>
              
              <div className="border-t pt-3 mt-3">
                <p className="text-xs text-center text-muted-foreground mb-3">Create your personal 4-digit PIN</p>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <Label className="text-xs font-semibold text-muted-foreground">New PIN</Label>
                    <Input 
                      type="password"
                      maxLength={4}
                      value={onboardingForm.newPin}
                      onChange={(e) => setOnboardingForm(prev => ({ ...prev, newPin: e.target.value.replace(/\D/g, '') }))}
                      placeholder="••••"
                      className="text-center text-xl tracking-widest h-12"
                      data-testid="input-partner-new-pin"
                    />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs font-semibold text-muted-foreground">Confirm PIN</Label>
                    <Input 
                      type="password"
                      maxLength={4}
                      value={onboardingForm.confirmPin}
                      onChange={(e) => setOnboardingForm(prev => ({ ...prev, confirmPin: e.target.value.replace(/\D/g, '') }))}
                      placeholder="••••"
                      className="text-center text-xl tracking-widest h-12"
                      data-testid="input-partner-confirm-pin"
                    />
                  </div>
                </div>
              </div>
            </div>

            <Button 
              onClick={handlePartnerOnboarding}
              className="w-full bg-amber-600 hover:bg-amber-700 text-white h-12 text-base"
              disabled={isLoading}
              data-testid="button-complete-partner-setup"
            >
              {isLoading ? "Setting up..." : "Complete Setup & Enter Partner Hub"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

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
              Enter Your PIN
            </Label>
            <Input 
              type="password" 
              maxLength={4}
              value={loginPin}
              onChange={(e) => setLoginPin(e.target.value.replace(/\D/g, ''))}
              className="text-center text-3xl tracking-[0.5em] h-16 font-serif"
              placeholder="•••"
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
            disabled={isLoading || loginPin.length < 3 || loginPin.length > 4}
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

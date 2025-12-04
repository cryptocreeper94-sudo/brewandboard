import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useLocation } from "wouter";
import { X, Gift, AlertTriangle, UserPlus } from "lucide-react";
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

interface RegistrationPopupProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export function RegistrationPopup({ isOpen, onClose, onSuccess }: RegistrationPopupProps) {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    company: "",
    phone: "",
    pin: "",
    confirmPin: ""
  });
  const [rememberMe, setRememberMe] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const [, setLocation] = useLocation();

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (formData.pin.length !== 4) {
      toast({ title: "Invalid PIN", description: "PIN must be 4 digits.", variant: "destructive" });
      return;
    }
    
    if (formData.pin !== formData.confirmPin) {
      toast({ title: "Mismatch", description: "PINs do not match.", variant: "destructive" });
      return;
    }

    if (!formData.name || !formData.email) {
      toast({ title: "Missing Info", description: "Please fill out name and email.", variant: "destructive" });
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          company: formData.company,
          phone: formData.phone,
          pin: formData.pin
        })
      });

      if (!response.ok) {
        const error = await response.json();
        toast({ title: "Registration Failed", description: error.error, variant: "destructive" });
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
      
      toast({ title: "Welcome!", description: "Your account has been created." });
      onSuccess();
      onClose();
    } catch (error) {
      toast({ title: "Error", description: "Failed to register. Please try again.", variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md bg-card border-border/50 overflow-hidden p-0">
        {/* Header with gradient */}
        <div className="bg-gradient-to-r from-amber-600 to-amber-700 p-6 text-white relative overflow-hidden">
          <div className="absolute inset-0 opacity-20">
            <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_30%_50%,rgba(255,255,255,0.3),transparent_50%)]" />
          </div>
          <div className="relative z-10 flex items-center gap-3">
            <div className="p-2 bg-white/20 rounded-full">
              <Gift className="h-6 w-6" />
            </div>
            <div>
              <DialogTitle className="text-xl font-serif text-white">Register for Free!</DialogTitle>
              <p className="text-amber-100 text-sm mt-1">Unlock exclusive offers and save your preferences</p>
            </div>
          </div>
        </div>

        <form onSubmit={handleRegister} className="p-6 space-y-4">
          <div className="space-y-2">
            <Label className="text-foreground">Full Name</Label>
            <Input 
              value={formData.name}
              onChange={(e) => setFormData({...formData, name: e.target.value})}
              placeholder="Jane Doe"
              required
              data-testid="input-register-name"
            />
          </div>
          
          <div className="space-y-2">
            <Label className="text-foreground">Email Address</Label>
            <Input 
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({...formData, email: e.target.value})}
              placeholder="jane@company.com"
              required
              data-testid="input-register-email"
            />
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-foreground">Company (Optional)</Label>
              <Input 
                value={formData.company}
                onChange={(e) => setFormData({...formData, company: e.target.value})}
                placeholder="Acme Inc"
                data-testid="input-register-company"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-foreground">Phone (Optional)</Label>
              <Input 
                type="tel"
                value={formData.phone}
                onChange={(e) => setFormData({...formData, phone: e.target.value})}
                placeholder="(615) 555-0123"
                data-testid="input-register-phone"
              />
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-foreground">Create 4-Digit PIN</Label>
              <Input 
                type="password"
                maxLength={4}
                value={formData.pin}
                onChange={(e) => setFormData({...formData, pin: e.target.value.replace(/\D/g, '')})}
                className="text-center tracking-widest"
                placeholder="••••"
                required
                data-testid="input-register-pin"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-foreground">Confirm PIN</Label>
              <Input 
                type="password"
                maxLength={4}
                value={formData.confirmPin}
                onChange={(e) => setFormData({...formData, confirmPin: e.target.value.replace(/\D/g, '')})}
                className="text-center tracking-widest"
                placeholder="••••"
                required
                data-testid="input-register-confirm-pin"
              />
            </div>
          </div>

          <div className="space-y-3 bg-muted/50 p-3 rounded-lg border border-border/30">
            <div className="flex items-center space-x-2">
              <Checkbox 
                id="persist-popup" 
                checked={rememberMe}
                onCheckedChange={(checked) => setRememberMe(checked === true)}
                data-testid="checkbox-remember-me"
              />
              <label
                htmlFor="persist-popup"
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

          <div className="flex gap-3 pt-2">
            <Button 
              type="button" 
              variant="outline" 
              onClick={onClose}
              className="flex-1"
              data-testid="button-cancel-register"
            >
              Maybe Later
            </Button>
            <Button 
              type="submit" 
              className="flex-1 bg-amber-600 hover:bg-amber-700 text-white"
              disabled={isLoading}
              data-testid="button-submit-register"
            >
              {isLoading ? "Creating..." : (
                <>
                  <UserPlus className="mr-2 h-4 w-4" />
                  Create Account
                </>
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export default RegistrationPopup;

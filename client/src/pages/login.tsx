import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { AlertTriangle, UserPlus, LogIn } from "lucide-react";

export default function LoginPage() {
  const [isRegistering, setIsRegistering] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    pin: "",
    confirmPin: ""
  });
  const [loginPin, setLoginPin] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [, setLocation] = useLocation();
  const { toast } = useToast();

  // Check for existing session
  useEffect(() => {
    const savedUser = localStorage.getItem("coffee_user");
    const sessionExpiry = localStorage.getItem("coffee_session_expiry");
    
    if (savedUser && sessionExpiry) {
      if (new Date().getTime() < parseInt(sessionExpiry)) {
        setLocation("/dashboard");
      } else {
        // Session expired
        localStorage.removeItem("coffee_session_expiry");
      }
    }
  }, [setLocation]);

  const handleRegister = (e: React.FormEvent) => {
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
      toast({ title: "Missing Info", description: "Please fill out all fields.", variant: "destructive" });
      return;
    }

    // Save user data (mock backend)
    const user = {
      name: formData.name,
      email: formData.email,
      pin: formData.pin
    };
    
    localStorage.setItem("coffee_user", JSON.stringify(user));
    localStorage.setItem("user_name", user.name); // For dashboard compatibility
    
    handleLoginSuccess();
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Check against registered user or demo user
    const storedUserStr = localStorage.getItem("coffee_user");
    const storedUser = storedUserStr ? JSON.parse(storedUserStr) : null;
    
    const isValidUser = storedUser && storedUser.pin === loginPin;
    const isDemoUser = loginPin === "1111"; // Fallback demo

    if (isValidUser || isDemoUser) {
      if (isDemoUser && !storedUser) {
        localStorage.setItem("user_name", "Only");
      }
      handleLoginSuccess();
    } else {
      toast({
        title: "Access Denied",
        description: "Invalid PIN. Please try again or register.",
        variant: "destructive",
      });
      setLoginPin("");
    }
  };

  const handleLoginSuccess = () => {
    if (rememberMe) {
      // 30 days
      const expiry = new Date().getTime() + (30 * 24 * 60 * 60 * 1000);
      localStorage.setItem("coffee_session_expiry", expiry.toString());
    } else {
      // Session only (mock 1 hour)
      const expiry = new Date().getTime() + (60 * 60 * 1000);
      localStorage.setItem("coffee_session_expiry", expiry.toString());
    }
    
    toast({
      title: "Welcome Back",
      description: "Successfully logged in.",
    });
    setLocation("/dashboard");
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-[url('/attached_assets/generated_images/premium_nashville_coffee_shop_interior.png')] bg-cover bg-center">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" />
      
      <motion.div 
        layout
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="relative z-10 w-full max-w-md p-8 bg-black/40 backdrop-blur-xl border border-white/10 rounded-3xl shadow-2xl overflow-hidden"
      >
        <div className="text-center mb-8">
          <h1 className="font-serif text-4xl text-white mb-2">Coffee Talk</h1>
          <p className="text-white/70 font-light text-sm">Nashville's Premium Meeting Catering</p>
        </div>

        <AnimatePresence mode="wait">
          {isRegistering ? (
            <motion.form
              key="register"
              initial={{ x: 20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: -20, opacity: 0 }}
              onSubmit={handleRegister}
              className="space-y-4"
            >
              <div className="space-y-2">
                <Label className="text-white/80">Full Name</Label>
                <Input 
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  className="bg-white/5 border-white/10 text-white placeholder:text-white/20"
                  placeholder="Jane Doe"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-white/80">Email Address</Label>
                <Input 
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                  className="bg-white/5 border-white/10 text-white placeholder:text-white/20"
                  placeholder="jane@company.com"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-white/80">Create PIN</Label>
                  <Input 
                    type="password"
                    maxLength={4}
                    value={formData.pin}
                    onChange={(e) => setFormData({...formData, pin: e.target.value})}
                    className="bg-white/5 border-white/10 text-white placeholder:text-white/20 text-center tracking-widest"
                    placeholder="••••"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-white/80">Confirm PIN</Label>
                  <Input 
                    type="password"
                    maxLength={4}
                    value={formData.confirmPin}
                    onChange={(e) => setFormData({...formData, confirmPin: e.target.value})}
                    className="bg-white/5 border-white/10 text-white placeholder:text-white/20 text-center tracking-widest"
                    placeholder="••••"
                  />
                </div>
              </div>

              <div className="pt-4 space-y-4">
                 {/* Persistence Checkbox (Same logic for register) */}
                 <div className="space-y-3 bg-white/5 p-3 rounded-lg border border-white/5">
                  <div className="flex items-center space-x-2">
                    <Checkbox 
                      id="persist-reg" 
                      checked={rememberMe}
                      onCheckedChange={(checked) => setRememberMe(checked === true)}
                      className="border-white/50 data-[state=checked]:bg-amber-600 data-[state=checked]:border-amber-600"
                    />
                    <label
                      htmlFor="persist-reg"
                      className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 text-white/90"
                    >
                      Keep me logged in for 30 days
                    </label>
                  </div>
                  
                  {rememberMe && (
                    <motion.div 
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      className="flex items-start gap-2 text-amber-200/90 text-xs bg-amber-900/20 p-2 rounded"
                    >
                      <AlertTriangle className="h-4 w-4 flex-shrink-0 mt-0.5" />
                      <span>Warning: If you choose this option your account will be available to anyone who uses this device.</span>
                    </motion.div>
                  )}
                </div>

                <Button type="submit" className="w-full h-12 bg-amber-700 hover:bg-amber-600 text-white font-medium tracking-wide">
                  CREATE ACCOUNT
                </Button>
                
                <div className="text-center">
                  <button 
                    type="button"
                    onClick={() => setIsRegistering(false)}
                    className="text-sm text-white/60 hover:text-white underline decoration-white/30 underline-offset-4 transition-colors"
                  >
                    Already have a PIN? Log In
                  </button>
                </div>
              </div>
            </motion.form>
          ) : (
            <motion.form
              key="login"
              initial={{ x: -20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: 20, opacity: 0 }}
              onSubmit={handleLogin}
              className="space-y-6"
            >
              <div className="space-y-2">
                <Label className="text-xs uppercase tracking-widest text-white/50 font-semibold text-center block">Enter PIN</Label>
                <Input 
                  type="password" 
                  maxLength={4}
                  value={loginPin}
                  onChange={(e) => setLoginPin(e.target.value)}
                  className="text-center text-3xl tracking-[1em] h-20 bg-white/5 border-white/10 text-white placeholder:text-white/10 focus:border-amber-500/50 focus:ring-amber-500/20 transition-all font-serif"
                  placeholder="••••"
                  autoFocus
                />
              </div>
              
              <div className="space-y-3 bg-white/5 p-3 rounded-lg border border-white/5">
                <div className="flex items-center space-x-2">
                  <Checkbox 
                    id="persist" 
                    checked={rememberMe}
                    onCheckedChange={(checked) => setRememberMe(checked === true)}
                    className="border-white/50 data-[state=checked]:bg-amber-600 data-[state=checked]:border-amber-600"
                  />
                  <label
                    htmlFor="persist"
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 text-white/90"
                  >
                    Keep me logged in for 30 days
                  </label>
                </div>
                
                {rememberMe && (
                  <motion.div 
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    className="flex items-start gap-2 text-amber-200/90 text-xs bg-amber-900/20 p-2 rounded"
                  >
                    <AlertTriangle className="h-4 w-4 flex-shrink-0 mt-0.5" />
                    <span>Warning: If you choose this option your account will be available to anyone who uses this device.</span>
                  </motion.div>
                )}
              </div>

              <div className="space-y-4">
                <Button 
                  type="submit" 
                  className="w-full h-12 bg-white text-black hover:bg-white/90 font-medium tracking-wide transition-all"
                >
                  <LogIn className="mr-2 h-4 w-4" /> ACCESS DASHBOARD
                </Button>
                
                <div className="text-center">
                  <button 
                    type="button"
                    onClick={() => setIsRegistering(true)}
                    className="text-sm text-amber-400/80 hover:text-amber-300 transition-colors flex items-center justify-center w-full gap-2"
                  >
                    <UserPlus className="h-4 w-4" /> New User? Register Here
                  </button>
                </div>
              </div>
            </motion.form>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}

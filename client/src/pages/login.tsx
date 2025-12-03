import { useState } from "react";
import { useLocation } from "wouter";
import { motion } from "framer-motion";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

export default function LoginPage() {
  const [pin, setPin] = useState("");
  const [, setLocation] = useLocation();
  const { toast } = useToast();

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (pin === "1111" || pin === "1234") {
      localStorage.setItem("user_name", "Only");
      setLocation("/dashboard");
    } else {
      toast({
        title: "Invalid PIN",
        description: "Please enter the correct access code.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-[url('/attached_assets/generated_images/premium_nashville_coffee_shop_interior.png')] bg-cover bg-center">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
      
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative z-10 w-full max-w-md p-8 bg-black/40 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl"
      >
        <div className="text-center mb-8">
          <h1 className="font-serif text-4xl text-white mb-2">Coffee Talk</h1>
          <p className="text-white/70 font-light">Nashville's Premium Meeting Catering</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-6">
          <div className="space-y-2">
            <label className="text-xs uppercase tracking-widest text-white/50 font-semibold">Access PIN</label>
            <Input 
              type="password" 
              maxLength={4}
              value={pin}
              onChange={(e) => setPin(e.target.value)}
              className="text-center text-2xl tracking-[1em] h-16 bg-white/5 border-white/10 text-white placeholder:text-white/20 focus:border-amber-500/50 focus:ring-amber-500/20 transition-all"
              placeholder="••••"
              autoFocus
            />
          </div>
          
          <Button 
            type="submit" 
            className="w-full h-12 bg-amber-700 hover:bg-amber-600 text-white font-medium tracking-wide transition-all"
          >
            ENTER
          </Button>
        </form>

        <div className="mt-8 text-center">
          <p className="text-white/30 text-xs">Demo Access: 1111</p>
        </div>
      </motion.div>
    </div>
  );
}

import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Coffee, Sparkles, ArrowRight, Star } from "lucide-react";

export default function LandingPage() {
  const [, setLocation] = useLocation();

  useEffect(() => {
    const savedUser = localStorage.getItem("coffee_user");
    const sessionExpiry = localStorage.getItem("coffee_session_expiry");
    
    if (savedUser && sessionExpiry) {
      if (new Date().getTime() < parseInt(sessionExpiry)) {
        setLocation("/dashboard");
      } else {
        localStorage.removeItem("coffee_session_expiry");
      }
    }
  }, [setLocation]);

  const handleExplore = () => {
    localStorage.setItem("is_guest", "true");
    setLocation("/dashboard");
  };

  return (
    <div className="min-h-screen w-full flex flex-col relative overflow-hidden">
      {/* Coffee Banner - Dark Coffee with Cream Mixing Effect */}
      <div 
        className="relative h-48 md:h-64 overflow-hidden"
        style={{ background: 'linear-gradient(135deg, #1a0f0a 0%, #2d1810 20%, #3d2418 40%, #2a1612 60%, #1f110c 80%, #1a0f0a 100%)' }}
      >
        {/* Subtle cream mixing overlay - like cream swirling into dark coffee */}
        <div 
          className="absolute inset-0"
          style={{ 
            background: 'radial-gradient(ellipse 100% 60% at 25% 30%, rgba(210,180,140,0.15) 0%, transparent 50%), radial-gradient(ellipse 80% 50% at 75% 50%, rgba(205,175,130,0.12) 0%, transparent 45%), radial-gradient(ellipse 60% 40% at 40% 70%, rgba(200,170,120,0.1) 0%, transparent 40%), radial-gradient(ellipse 50% 35% at 60% 25%, rgba(215,185,145,0.08) 0%, transparent 35%)'
          }}
        />

        {/* Logo/Title in banner */}
        <div className="absolute inset-0 flex items-center justify-center z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="text-center"
          >
            <h1 className="font-serif text-5xl md:text-6xl text-amber-100 font-bold tracking-tight drop-shadow-lg">
              Coffee Talk
            </h1>
            <p className="text-amber-200/70 text-lg mt-2 font-light">
              Nashville's Premium Meeting Catering
            </p>
          </motion.div>
        </div>

        {/* Decorative bottom wave */}
        <div className="absolute bottom-0 left-0 right-0">
          <svg viewBox="0 0 1200 50" className="w-full h-12 fill-background">
            <path d="M0,50 L0,25 Q300,0 600,25 T1200,25 L1200,50 Z" />
          </svg>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 bg-background flex flex-col items-center justify-center px-6 py-12">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
          className="max-w-lg text-center space-y-8"
        >
          {/* Feature highlights */}
          <div className="grid grid-cols-3 gap-4 mb-8">
            {[
              { icon: Coffee, label: "Premium Coffee" },
              { icon: Star, label: "Top Vendors" },
              { icon: Sparkles, label: "Easy Ordering" },
            ].map((item, i) => (
              <motion.div
                key={item.label}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1 + i * 0.1 }}
                className="flex flex-col items-center gap-2 p-4 rounded-xl bg-card/50 border border-border/30"
              >
                <div className="p-3 rounded-full bg-amber-500/10">
                  <item.icon className="h-6 w-6 text-amber-600" />
                </div>
                <span className="text-xs text-muted-foreground font-medium">{item.label}</span>
              </motion.div>
            ))}
          </div>

          <div className="space-y-4">
            <h2 className="font-serif text-3xl font-bold text-foreground">
              Elevate Your Meetings
            </h2>
            <p className="text-muted-foreground text-lg leading-relaxed">
              Connect with Nashville's finest coffee shops and bring premium coffee service to your business meetings.
            </p>
          </div>

          {/* CTA Button */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 1.2 }}
          >
            <Button
              onClick={handleExplore}
              size="lg"
              className="w-full max-w-xs h-14 bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-700 hover:to-amber-800 text-white text-lg font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all group"
              data-testid="button-explore"
            >
              Explore What We Offer
              <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
            </Button>
          </motion.div>

          <p className="text-xs text-muted-foreground/60 pt-4">
            Free to browse • No account required to explore
          </p>
        </motion.div>
      </div>

      {/* Bottom branding */}
      <div className="py-4 text-center text-xs text-muted-foreground border-t border-border/30 bg-card/30">
        <span>Powered by </span>
        <span className="font-serif font-semibold text-foreground">Darkwave Studios, LLC</span>
        <span> • &copy; 2025</span>
      </div>
    </div>
  );
}

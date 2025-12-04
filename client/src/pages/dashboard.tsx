import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { 
  Coffee, 
  MapPin, 
  ChevronRight,
  Star,
  Plus,
  Download,
  Users,
  Calendar,
  Scan,
  Code2,
  Sparkles,
  LogIn
} from "lucide-react";
import { Link, useLocation } from "wouter";
import { COFFEE_SHOPS } from "@/lib/mock-data";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Web3Search } from "@/components/Web3Search";
import { RegistrationPopup } from "@/components/RegistrationPopup";
import { LoginPopup } from "@/components/LoginPopup";
import { InstallPrompt } from "@/components/InstallPrompt";

export default function Dashboard() {
  const userName = localStorage.getItem("user_name") || "Guest";
  const isGuest = localStorage.getItem("is_guest") === "true";
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [showRegister, setShowRegister] = useState(false);
  const [showLogin, setShowLogin] = useState(false);

  useEffect(() => {
    if (isGuest) {
      const hasSeenRegister = localStorage.getItem("has_seen_register_prompt");
      if (!hasSeenRegister) {
        setTimeout(() => {
          setShowRegister(true);
          localStorage.setItem("has_seen_register_prompt", "true");
        }, 2000);
      }
    }
  }, [isGuest]);

  return (
    <div className="min-h-screen bg-background text-foreground pb-20">
      {/* Coffee Banner - Dark Coffee with Cream Mixing Effect */}
      <div className="relative h-24 overflow-hidden" style={{ background: 'linear-gradient(135deg, #1a0f0a 0%, #2d1810 25%, #3d2418 45%, #2a1612 55%, #1f110c 75%, #1a0f0a 100%)' }}>
        {/* Subtle cream mixing overlay */}
        <div 
          className="absolute inset-0 opacity-20"
          style={{ 
            background: 'radial-gradient(ellipse 80% 50% at 30% 40%, rgba(210,180,140,0.4) 0%, transparent 50%), radial-gradient(ellipse 60% 40% at 70% 60%, rgba(205,175,130,0.3) 0%, transparent 45%), radial-gradient(ellipse 40% 30% at 50% 30%, rgba(200,170,120,0.25) 0%, transparent 40%)'
          }}
        />
        <div className="absolute inset-0 flex items-center justify-center">
          <h1 className="font-serif text-2xl md:text-3xl text-amber-100 font-bold tracking-tight drop-shadow-lg">
            Coffee Talk
          </h1>
        </div>
        <div className="absolute bottom-0 left-0 right-0">
          <svg viewBox="0 0 1200 20" className="w-full h-4 fill-background">
            <path d="M0,20 L0,10 Q300,0 600,10 T1200,10 L1200,20 Z" />
          </svg>
        </div>
      </div>

      {/* Header */}
      <header className="sticky top-0 z-40 bg-background/80 backdrop-blur-md border-b border-border/50">
        <div className="container max-w-5xl mx-auto px-4 h-14 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Coffee className="h-5 w-5 text-amber-600" />
            <span className="text-sm font-medium text-foreground">Coffee Talk</span>
          </div>
          <div className="flex items-center gap-3">
            {isGuest && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowLogin(true)}
                className="gap-2 text-xs"
                data-testid="button-login"
              >
                <LogIn className="h-3 w-3" />
                Sign In
              </Button>
            )}
          </div>
        </div>
      </header>

      <main className="container max-w-5xl mx-auto px-4 py-8 space-y-8">
        
        {/* Web3 Research Search Bar */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col items-center gap-2"
        >
          <div className="flex items-center gap-2 text-xs text-muted-foreground mb-1">
            <Sparkles className="h-3 w-3 text-primary" />
            <span className="font-medium">Web3 Research</span>
            <span className="text-muted-foreground/60">• Search tokens, contracts, URLs</span>
          </div>
          <Web3Search />
        </motion.div>
        
        {/* Bento Grid Layout */}
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4">
          
          {/* Weather Widget - Compact */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="md:col-span-2 lg:col-span-2 bg-card border border-border/50 rounded-2xl p-6 flex items-center justify-between relative overflow-hidden group h-32"
          >
            <div className="relative z-10">
              <div className="flex items-center gap-2 text-muted-foreground mb-1">
                <MapPin className="h-3 w-3" />
                <span className="text-[10px] font-medium uppercase tracking-wider">Nashville, TN</span>
              </div>
              <div className="text-3xl font-serif font-medium">64°</div>
              <div className="text-xs text-muted-foreground mt-1">Partly Cloudy</div>
            </div>
            {/* Removed weather icon as requested to save space/avoid clutter */}
            <div className="absolute right-[-10px] top-[-10px] opacity-10 group-hover:opacity-20 transition-opacity">
               <div className="w-24 h-24 rounded-full bg-amber-500 blur-2xl"></div>
            </div>
          </motion.div>

          {/* Quick Action - Portfolio */}
          <Link href="/portfolio">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-amber-700 text-white rounded-2xl p-6 flex flex-col justify-between cursor-pointer hover:scale-[1.02] transition-transform h-32"
            >
              <div className="h-8 w-8 bg-white/20 rounded-full flex items-center justify-center mb-2">
                <Users className="h-4 w-4" />
              </div>
              <div>
                <h3 className="font-serif text-md leading-none mb-1">My Portfolio</h3>
                <p className="text-white/60 text-[10px]">Client notes & templates</p>
              </div>
            </motion.div>
          </Link>

          {/* Quick Action - Order */}
          <Link href="/schedule">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-primary text-primary-foreground rounded-2xl p-6 flex flex-col justify-between cursor-pointer hover:scale-[1.02] transition-transform h-32"
            >
              <div className="h-8 w-8 bg-white/20 rounded-full flex items-center justify-center mb-2">
                <Calendar className="h-4 w-4" />
              </div>
              <div>
                <h3 className="font-serif text-md leading-none mb-1">Schedule Order</h3>
                <p className="text-primary-foreground/60 text-[10px]">Coffee delivery</p>
              </div>
            </motion.div>
          </Link>

          {/* Quick Action - Document Scanner */}
          <Link href="/scan">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15 }}
              className="bg-gradient-to-br from-slate-800 to-slate-900 text-white rounded-2xl p-6 flex flex-col justify-between cursor-pointer hover:scale-[1.02] transition-transform h-32"
              data-testid="button-scan-documents"
            >
              <div className="h-8 w-8 bg-white/20 rounded-full flex items-center justify-center mb-2">
                <Scan className="h-4 w-4" />
              </div>
              <div>
                <h3 className="font-serif text-md leading-none mb-1">Scan Document</h3>
                <p className="text-white/60 text-[10px]">Create & share PDFs</p>
              </div>
            </motion.div>
          </Link>

          {/* Developer Hub */}
          <Link href="/developers">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-gradient-to-br from-purple-600 via-indigo-600 to-blue-600 text-white rounded-2xl p-6 flex flex-col justify-between cursor-pointer hover:scale-[1.02] transition-transform h-32 relative overflow-hidden shine-effect"
              data-testid="button-developers"
            >
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.2),transparent_70%)]" />
              <div className="h-8 w-8 bg-white/20 rounded-full flex items-center justify-center mb-2 relative z-10">
                <Code2 className="h-4 w-4" />
              </div>
              <div className="relative z-10">
                <h3 className="font-serif text-md leading-none mb-1 flex items-center gap-1">
                  Developer Hub
                  <Sparkles className="h-3 w-3" />
                </h3>
                <p className="text-white/60 text-[10px]">API & integrations</p>
              </div>
            </motion.div>
          </Link>

          {/* Recent Vendors Scroll */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="md:col-span-3 lg:col-span-4"
          >
            <div className="flex items-center justify-between mb-4 px-1">
              <h3 className="font-serif text-lg">Curated Roasters</h3>
              <span className="text-xs font-medium text-muted-foreground hover:text-primary cursor-pointer">View All</span>
            </div>
            
            <ScrollArea className="w-full whitespace-nowrap rounded-2xl">
              <div className="flex w-max space-x-4 pb-4">
                {COFFEE_SHOPS.map((shop) => (
                  <div 
                    key={shop.id} 
                    className="w-[280px] h-[320px] rounded-2xl overflow-hidden relative group cursor-pointer shadow-sm hover:shadow-md transition-all"
                  >
                    <img 
                      src={shop.image} 
                      alt={shop.name} 
                      className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent" />
                    
                    <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
                      <div className="flex justify-between items-start mb-2">
                        <Badge className="bg-amber-500 text-white hover:bg-amber-600 border-none text-xs">{shop.rating} <Star className="h-3 w-3 ml-1 fill-current" /></Badge>
                        {shop.id === 'crema' && <Badge variant="secondary" className="bg-white/20 backdrop-blur-md text-white border-none text-[10px]">Trending</Badge>}
                      </div>
                      <h3 className="font-serif text-xl font-bold mb-1">{shop.name}</h3>
                      <p className="text-sm text-white/80 flex items-center gap-1">
                        <MapPin className="h-3 w-3" /> {shop.location}
                      </p>
                      
                      <div className="mt-4 pt-4 border-t border-white/20 flex items-center justify-between opacity-0 group-hover:opacity-100 transition-opacity transform translate-y-2 group-hover:translate-y-0">
                        <span className="text-xs text-white/80">{shop.specialty}</span>
                        <Button size="sm" className="h-8 bg-white text-black hover:bg-white/90 font-medium">View Menu</Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              <ScrollBar orientation="horizontal" className="invisible" />
            </ScrollArea>
          </motion.div>
        </div>
      </main>

      {/* Registration Popup for Guests */}
      <RegistrationPopup
        isOpen={showRegister}
        onClose={() => setShowRegister(false)}
        onSuccess={() => window.location.reload()}
      />

      {/* Login Popup */}
      <LoginPopup
        isOpen={showLogin}
        onClose={() => setShowLogin(false)}
        onSuccess={() => window.location.reload()}
        onSwitchToRegister={() => {
          setShowLogin(false);
          setShowRegister(true);
        }}
      />

      {/* Install App Prompt */}
      <InstallPrompt />
    </div>
  );
}

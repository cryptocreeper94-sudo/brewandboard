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
  LogIn,
  Cloud,
  Sun,
  CloudRain,
  X,
  Radar
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
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

export default function Dashboard() {
  const userName = localStorage.getItem("user_name") || "Guest";
  const isGuest = localStorage.getItem("is_guest") === "true";
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [showRegister, setShowRegister] = useState(false);
  const [showLogin, setShowLogin] = useState(false);
  const [showWeatherRadar, setShowWeatherRadar] = useState(false);

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

  const quickActions = [
    {
      id: "portfolio",
      title: "My Portfolio",
      subtitle: "Client notes & templates",
      href: "/portfolio",
      icon: Users,
      bgClass: "bg-amber-700",
      textClass: "text-white"
    },
    {
      id: "schedule",
      title: "Schedule Order",
      subtitle: "Coffee delivery",
      href: "/schedule",
      icon: Calendar,
      bgClass: "bg-primary",
      textClass: "text-primary-foreground"
    },
    {
      id: "scan",
      title: "Scan Document",
      subtitle: "Create & share PDFs",
      href: "/scan",
      icon: Scan,
      bgClass: "bg-gradient-to-br from-slate-800 to-slate-900",
      textClass: "text-white"
    },
    {
      id: "developers",
      title: "Developer Hub",
      subtitle: "API & integrations",
      href: "/developers",
      icon: Code2,
      bgClass: "bg-gradient-to-br from-purple-600 via-indigo-600 to-blue-600",
      textClass: "text-white",
      hasSparkle: true
    }
  ];

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
            {/* Weather Button - Clickable */}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowWeatherRadar(true)}
              className="gap-2 text-xs hover:bg-amber-50 dark:hover:bg-amber-950/30"
              data-testid="button-weather"
            >
              <Sun className="h-4 w-4 text-amber-500" />
              <span className="font-medium">64°</span>
            </Button>
            
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

      <main className="container max-w-5xl mx-auto px-4 py-6 space-y-6">
        
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
        
        {/* Quick Actions - Horizontal Carousel */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <div className="flex items-center justify-between mb-3 px-1">
            <h3 className="font-serif text-lg">Quick Actions</h3>
          </div>
          
          <ScrollArea className="w-full">
            <div className="flex gap-4 pb-4">
              {quickActions.map((action, index) => (
                <Link key={action.id} href={action.href}>
                  <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.1 + index * 0.05 }}
                    className={`flex-shrink-0 w-[160px] h-[140px] ${action.bgClass} ${action.textClass} rounded-2xl p-5 flex flex-col justify-between cursor-pointer hover:scale-[1.03] transition-transform shadow-sm hover:shadow-lg relative overflow-hidden`}
                    data-testid={`button-${action.id}`}
                  >
                    {action.hasSparkle && (
                      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.2),transparent_70%)]" />
                    )}
                    <div className="h-10 w-10 bg-white/20 rounded-xl flex items-center justify-center relative z-10">
                      <action.icon className="h-5 w-5" />
                    </div>
                    <div className="relative z-10">
                      <h4 className="font-serif text-sm font-semibold leading-tight mb-0.5 flex items-center gap-1">
                        {action.title}
                        {action.hasSparkle && <Sparkles className="h-3 w-3" />}
                      </h4>
                      <p className="text-[10px] opacity-70">{action.subtitle}</p>
                    </div>
                  </motion.div>
                </Link>
              ))}
            </div>
            <ScrollBar orientation="horizontal" className="invisible" />
          </ScrollArea>
        </motion.div>

        {/* Curated Roasters - Horizontal Carousel */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <div className="flex items-center justify-between mb-3 px-1">
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
      </main>

      {/* Weather Radar Modal */}
      <Dialog open={showWeatherRadar} onOpenChange={setShowWeatherRadar}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-hidden p-0">
          <DialogHeader className="p-4 pb-2 border-b">
            <DialogTitle className="flex items-center gap-2 font-serif">
              <Radar className="h-5 w-5 text-amber-600" />
              Nashville Weather Radar
            </DialogTitle>
          </DialogHeader>
          <div className="p-4 space-y-4">
            {/* Current Conditions */}
            <div className="bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-950/30 dark:to-orange-950/30 rounded-xl p-6">
              <div className="flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-2 text-muted-foreground mb-2">
                    <MapPin className="h-4 w-4" />
                    <span className="text-sm font-medium">Nashville, Tennessee</span>
                  </div>
                  <div className="text-5xl font-serif font-bold text-foreground">64°F</div>
                  <p className="text-muted-foreground mt-1">Partly Cloudy</p>
                </div>
                <div className="text-right">
                  <Sun className="h-16 w-16 text-amber-500 mb-2" />
                  <p className="text-sm text-muted-foreground">Feels like 62°</p>
                </div>
              </div>
              
              <div className="grid grid-cols-4 gap-4 mt-6 pt-4 border-t border-amber-200/50 dark:border-amber-800/30">
                <div className="text-center">
                  <p className="text-xs text-muted-foreground">Humidity</p>
                  <p className="font-semibold">45%</p>
                </div>
                <div className="text-center">
                  <p className="text-xs text-muted-foreground">Wind</p>
                  <p className="font-semibold">8 mph</p>
                </div>
                <div className="text-center">
                  <p className="text-xs text-muted-foreground">UV Index</p>
                  <p className="font-semibold">Moderate</p>
                </div>
                <div className="text-center">
                  <p className="text-xs text-muted-foreground">Visibility</p>
                  <p className="font-semibold">10 mi</p>
                </div>
              </div>
            </div>

            {/* Radar Map */}
            <div className="bg-card border rounded-xl overflow-hidden">
              <div className="p-3 border-b bg-muted/30 flex items-center justify-between">
                <span className="text-sm font-medium">Live Radar</span>
                <span className="text-xs text-muted-foreground">Last updated: Just now</span>
              </div>
              <div className="relative aspect-video bg-slate-900">
                <iframe
                  src="https://embed.windy.com/embed2.html?lat=36.16&lon=-86.78&detailLat=36.16&detailLon=-86.78&width=650&height=450&zoom=8&level=surface&overlay=radar&product=radar&menu=&message=&marker=&calendar=now&pressure=&type=map&location=coordinates&detail=&metricWind=default&metricTemp=default&radarRange=-1"
                  className="w-full h-full border-0"
                  title="Nashville Weather Radar"
                />
              </div>
            </div>

            {/* 5-Day Forecast */}
            <div className="bg-card border rounded-xl p-4">
              <h4 className="text-sm font-medium mb-4">5-Day Forecast</h4>
              <div className="grid grid-cols-5 gap-3">
                {[
                  { day: "Today", high: 64, low: 48, icon: Sun },
                  { day: "Wed", high: 68, low: 52, icon: Sun },
                  { day: "Thu", high: 62, low: 50, icon: Cloud },
                  { day: "Fri", high: 58, low: 45, icon: CloudRain },
                  { day: "Sat", high: 65, low: 48, icon: Sun },
                ].map((forecast) => (
                  <div key={forecast.day} className="text-center p-3 rounded-lg bg-muted/30">
                    <p className="text-xs font-medium text-muted-foreground mb-2">{forecast.day}</p>
                    <forecast.icon className="h-6 w-6 mx-auto mb-2 text-amber-500" />
                    <p className="text-sm font-semibold">{forecast.high}°</p>
                    <p className="text-xs text-muted-foreground">{forecast.low}°</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>

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

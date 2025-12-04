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
  Radar,
  Newspaper,
  ExternalLink,
  RefreshCw,
  Shield
} from "lucide-react";
import { Link, useLocation } from "wouter";
import { COFFEE_SHOPS } from "@/lib/mock-data";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { WebSearch } from "@/components/WebSearch";
import { RegistrationPopup } from "@/components/RegistrationPopup";
import { LoginPopup } from "@/components/LoginPopup";
import { InstallPrompt } from "@/components/InstallPrompt";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

import cremaImage from "@assets/generated_images/crema_coffee_shop_interior.png";
import baristaParlorImage from "@assets/generated_images/barista_parlor_interior.png";
import frothyMonkeyImage from "@assets/generated_images/frothy_monkey_interior.png";
import mascotImage from "@assets/generated_images/kawaii_coffee_cup_mascot_character.png";

const shopImages: Record<string, string> = {
  'crema': cremaImage,
  'barista-parlor': baristaParlorImage,
  'frothy-monkey': frothyMonkeyImage,
};

const FloatingBean = ({ delay, duration, x, size }: { delay: number; duration: number; x: number; size: number }) => (
  <motion.div
    className="absolute text-amber-600/30"
    initial={{ y: "100vh", x: `${x}vw`, rotate: 0, opacity: 0 }}
    animate={{ 
      y: "-20vh", 
      rotate: 360,
      opacity: [0, 0.6, 0.6, 0]
    }}
    transition={{ 
      duration, 
      delay,
      repeat: Infinity,
      ease: "linear"
    }}
    style={{ fontSize: size }}
  >
    ☕
  </motion.div>
);

interface NewsItem {
  title: string;
  link: string;
  pubDate: string;
  description: string;
  image: string | null;
}

export default function Dashboard() {
  const userName = localStorage.getItem("user_name") || "Guest";
  const isGuest = localStorage.getItem("is_guest") === "true";
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [showRegister, setShowRegister] = useState(false);
  const [showLogin, setShowLogin] = useState(false);
  const [showWeatherRadar, setShowWeatherRadar] = useState(false);
  const [newsItems, setNewsItems] = useState<NewsItem[]>([]);
  const [newsLoading, setNewsLoading] = useState(true);
  const [newsError, setNewsError] = useState(false);

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

  const fetchNews = async () => {
    setNewsLoading(true);
    setNewsError(false);
    try {
      const response = await fetch('/api/news/nashville');
      if (!response.ok) throw new Error('Failed to fetch news');
      const data = await response.json();
      setNewsItems(data.items || []);
    } catch (error) {
      setNewsError(true);
      console.error('Error fetching news:', error);
    } finally {
      setNewsLoading(false);
    }
  };

  useEffect(() => {
    fetchNews();
  }, []);

  const quickActions = [
    {
      id: "schedule",
      title: "Create Order",
      subtitle: "Premium coffee delivery",
      href: "/schedule",
      icon: Calendar,
      gradient: "from-amber-800 via-amber-700 to-amber-600",
      shadowColor: "shadow-amber-800/40"
    },
    {
      id: "portfolio",
      title: "My Portfolio",
      subtitle: "Client notes & templates",
      href: "/portfolio",
      icon: Users,
      gradient: "from-stone-800 via-stone-700 to-stone-600",
      shadowColor: "shadow-stone-800/40"
    },
    {
      id: "scan",
      title: "Scan Document",
      subtitle: "Create & share PDFs",
      href: "/scan",
      icon: Scan,
      gradient: "from-yellow-900 via-yellow-800 to-amber-700",
      shadowColor: "shadow-yellow-900/40"
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-amber-50 via-orange-50/30 to-background dark:from-amber-950/30 dark:via-background dark:to-background text-foreground pb-20 overflow-x-hidden">
      {/* Floating Coffee Beans Background */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        <FloatingBean delay={0} duration={15} x={10} size={24} />
        <FloatingBean delay={3} duration={18} x={25} size={20} />
        <FloatingBean delay={6} duration={20} x={45} size={28} />
        <FloatingBean delay={2} duration={16} x={65} size={22} />
        <FloatingBean delay={8} duration={22} x={80} size={26} />
        <FloatingBean delay={4} duration={17} x={90} size={18} />
      </div>

      {/* Hero Banner - Shimmering Dark Brown */}
      <div className="relative overflow-hidden">
        {/* Rich dark brown gradient background */}
        <div 
          className="absolute inset-0"
          style={{ 
            background: 'linear-gradient(135deg, #1a0f09 0%, #2d1810 25%, #3d2216 50%, #4a2c1c 75%, #5a3620 100%)'
          }}
        />
        {/* Animated shine effect */}
        <motion.div 
          className="absolute inset-0 opacity-30"
          animate={{
            background: [
              'linear-gradient(45deg, transparent 0%, rgba(255,255,255,0.3) 50%, transparent 100%)',
              'linear-gradient(45deg, transparent 100%, rgba(255,255,255,0.3) 150%, transparent 200%)',
            ]
          }}
          transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
          style={{
            backgroundSize: '200% 200%',
          }}
        />
        {/* Sparkle particles */}
        <div className="absolute inset-0">
          {[...Array(20)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-1 h-1 bg-white rounded-full"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
              }}
              animate={{
                opacity: [0, 1, 0],
                scale: [0, 1.5, 0],
              }}
              transition={{
                duration: 2 + Math.random() * 2,
                delay: Math.random() * 3,
                repeat: Infinity,
              }}
            />
          ))}
        </div>
        
        <div className="relative z-10 px-4 py-8 md:py-12">
          <div className="container max-w-5xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
            {/* Left side - Text */}
            <motion.div 
              className="text-center md:text-left"
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
            >
              <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm rounded-full px-3 py-1 mb-3"
              >
                <Sparkles className="h-3 w-3 text-yellow-200" />
                <span className="text-xs font-medium text-white">Nashville's Coffee Concierge</span>
              </motion.div>
              <h1 className="font-serif text-3xl md:text-5xl text-white font-bold tracking-tight drop-shadow-lg mb-2">
                Brew & Board
              </h1>
              <p className="text-amber-200/90 text-sm md:text-base max-w-md">
                Premium coffee delivery for your business meetings
              </p>
              <motion.div 
                className="flex gap-3 mt-4 justify-center md:justify-start"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
              >
                <Link href="/schedule">
                  <Button className="bg-amber-500 text-white hover:bg-amber-400 font-semibold shadow-lg hover:shadow-xl transition-all border border-amber-400/50">
                    <Calendar className="h-4 w-4 mr-2" />
                    Order Now
                  </Button>
                </Link>
                <Link href="/verify/BB-0000000001">
                  <Button variant="outline" className="border-amber-400/50 text-amber-100 hover:bg-amber-800/30 backdrop-blur-sm">
                    <Shield className="h-4 w-4 mr-2" />
                    Verified
                  </Button>
                </Link>
              </motion.div>
            </motion.div>
            
            {/* Right side - Mascot */}
            <motion.div
              initial={{ opacity: 0, scale: 0.8, rotate: -10 }}
              animate={{ opacity: 1, scale: 1, rotate: 0 }}
              transition={{ duration: 0.6, delay: 0.3, type: "spring" }}
              className="relative"
            >
              <motion.div
                animate={{ y: [0, -8, 0] }}
                transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
              >
                <img 
                  src={mascotImage} 
                  alt="Brew & Board Mascot" 
                  className="w-32 h-32 md:w-44 md:h-44 object-contain drop-shadow-2xl"
                />
              </motion.div>
              {/* Glow effect behind mascot */}
              <div className="absolute inset-0 bg-gradient-radial from-yellow-300/40 to-transparent blur-2xl -z-10 scale-150" />
            </motion.div>
          </div>
        </div>
        
        {/* Wave divider */}
        <div className="absolute bottom-0 left-0 right-0">
          <svg viewBox="0 0 1200 40" className="w-full h-8 fill-amber-50 dark:fill-background" preserveAspectRatio="none">
            <path d="M0,40 L0,20 Q150,0 300,15 T600,10 T900,20 T1200,10 L1200,40 Z" />
          </svg>
        </div>
      </div>

      {/* Header */}
      <header className="sticky top-0 z-40 bg-background/80 backdrop-blur-md border-b border-border/50">
        <div className="container max-w-5xl mx-auto px-4 h-14 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <Coffee className="h-5 w-5 text-amber-600" />
              <span className="text-sm font-medium text-foreground">Brew & Board</span>
            </div>
            <Link href="/verify/BB-0000000001">
              <Badge 
                className="bg-gradient-to-r from-emerald-500/10 to-teal-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-700 hover:from-emerald-500/20 hover:to-teal-500/20 cursor-pointer transition-all text-[10px] py-0.5 gap-1"
                data-testid="badge-solana-certified"
              >
                <Shield className="h-2.5 w-2.5" />
                <span className="font-mono">BB-0000000001</span>
              </Badge>
            </Link>
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
        
        {/* Quick Search Bar */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col items-center gap-2"
        >
          <div className="flex items-center gap-2 text-xs text-muted-foreground mb-1">
            <Sparkles className="h-3 w-3 text-primary" />
            <span className="font-medium">Quick Search</span>
            <span className="text-muted-foreground/60">• Search the web or visit URLs</span>
          </div>
          <WebSearch />
        </motion.div>
        
        {/* Quick Actions - Full Width Grid */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <div className="flex items-center justify-between mb-3 px-1">
            <h3 className="font-serif text-lg">Quick Actions</h3>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {quickActions.map((action, index) => (
              <Link key={action.id} href={action.href}>
                <motion.div
                  initial={{ opacity: 0, y: 20, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  transition={{ delay: 0.1 + index * 0.08, type: "spring", stiffness: 100 }}
                  whileHover={{ scale: 1.03, y: -4 }}
                  whileTap={{ scale: 0.98 }}
                  className={`relative h-[150px] bg-gradient-to-br ${action.gradient} text-white rounded-2xl p-5 flex flex-col justify-between cursor-pointer shadow-lg ${action.shadowColor} hover:shadow-2xl transition-all overflow-hidden`}
                  data-testid={`button-${action.id}`}
                >
                  {/* Animated shine effect */}
                  <motion.div 
                    className="absolute inset-0 opacity-0 hover:opacity-100 transition-opacity"
                    style={{
                      background: 'linear-gradient(105deg, transparent 40%, rgba(255,255,255,0.2) 45%, transparent 50%)',
                    }}
                  />
                  {/* Decorative circles */}
                  <div className="absolute -right-6 -top-6 w-24 h-24 bg-white/10 rounded-full" />
                  <div className="absolute -right-2 -bottom-8 w-16 h-16 bg-white/10 rounded-full" />
                  
                  <div className="relative z-10">
                    <motion.div 
                      className="h-12 w-12 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center shadow-inner"
                      whileHover={{ rotate: 5 }}
                    >
                      <action.icon className="h-6 w-6" />
                    </motion.div>
                  </div>
                  <div className="relative z-10">
                    <h4 className="font-serif text-base font-bold leading-tight mb-1">
                      {action.title}
                    </h4>
                    <p className="text-xs text-white/80">{action.subtitle}</p>
                  </div>
                </motion.div>
              </Link>
            ))}
          </div>
        </motion.div>

        {/* Curated Roasters - Horizontal Carousel */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <div className="flex items-center justify-between mb-3 px-1">
            <h3 className="font-serif text-lg">Curated Roasters</h3>
            <span className="text-xs font-medium text-muted-foreground flex items-center gap-1">
              <ChevronRight className="h-3 w-3" />
              Scroll to explore
            </span>
          </div>
        </motion.div>
        
        {/* Carousel container - breaks out of parent padding for full-width scroll */}
        <div className="relative -mx-4 md:-mx-8 lg:-mx-12">
          <div 
            className="flex gap-4 overflow-x-auto px-4 md:px-8 lg:px-12 pb-4 snap-x snap-mandatory"
            style={{ 
              scrollbarWidth: 'none', 
              msOverflowStyle: 'none',
              WebkitOverflowScrolling: 'touch'
            }}
          >
            <style>{`.snap-x::-webkit-scrollbar { display: none; }`}</style>
            {COFFEE_SHOPS.slice(0, 8).map((shop, index) => (
              <motion.div 
                key={shop.id}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.05 * index }}
                className="w-[260px] md:w-[280px] h-[300px] md:h-[320px] rounded-2xl overflow-hidden relative group cursor-pointer shadow-lg hover:shadow-xl transition-all flex-shrink-0 snap-start"
              >
                <img 
                  src={shopImages[shop.id] || shop.image} 
                  alt={shop.name} 
                  className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent" />
                
                <div className="absolute bottom-0 left-0 right-0 p-5 md:p-6 text-white">
                  <div className="flex justify-between items-start mb-2">
                    <Badge className="bg-amber-500 text-white hover:bg-amber-600 border-none text-xs">{shop.rating} <Star className="h-3 w-3 ml-1 fill-current" /></Badge>
                    {index === 0 && <Badge variant="secondary" className="bg-white/20 backdrop-blur-md text-white border-none text-[10px]">Featured</Badge>}
                  </div>
                  <h3 className="font-serif text-lg md:text-xl font-bold mb-1">{shop.name}</h3>
                  <p className="text-sm text-white/80 flex items-center gap-1">
                    <MapPin className="h-3 w-3" /> {shop.location}
                  </p>
                  
                  <div className="mt-3 pt-3 border-t border-white/20 flex items-center justify-between">
                    <span className="text-xs text-white/70">{shop.specialty}</span>
                    <Button size="sm" className="h-7 text-xs bg-white text-black hover:bg-white/90 font-medium">View Menu</Button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Nashville News Section */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <div className="flex items-center justify-between mb-3 px-1">
            <div className="flex items-center gap-2">
              <Newspaper className="h-5 w-5 text-amber-600" />
              <h3 className="font-serif text-lg">Nashville News</h3>
              <span className="text-[10px] text-muted-foreground bg-muted px-2 py-0.5 rounded-full">WKRN</span>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={fetchNews}
              disabled={newsLoading}
              className="h-7 px-2 text-xs"
              data-testid="button-refresh-news"
            >
              <RefreshCw className={`h-3 w-3 ${newsLoading ? 'animate-spin' : ''}`} />
            </Button>
          </div>

          {newsLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="bg-card border rounded-xl p-4 animate-pulse">
                  <div className="h-4 bg-muted rounded w-3/4 mb-2" />
                  <div className="h-3 bg-muted rounded w-1/2" />
                </div>
              ))}
            </div>
          ) : newsError ? (
            <div className="bg-card border rounded-xl p-6 text-center text-muted-foreground">
              <Newspaper className="h-8 w-8 mx-auto mb-2 opacity-50" />
              <p className="text-sm">Unable to load news</p>
              <Button
                variant="outline"
                size="sm"
                onClick={fetchNews}
                className="mt-3"
              >
                Try Again
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {newsItems.slice(0, 6).map((item, index) => (
                <a
                  key={index}
                  href={item.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group bg-card border rounded-xl p-4 hover:border-amber-500/50 hover:shadow-md transition-all"
                  data-testid={`news-item-${index}`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <h4 className="text-sm font-medium leading-snug line-clamp-2 group-hover:text-amber-600 transition-colors">
                        {item.title}
                      </h4>
                      {item.description && (
                        <p className="text-xs text-muted-foreground mt-1.5 line-clamp-2">
                          {item.description}
                        </p>
                      )}
                      <p className="text-[10px] text-muted-foreground/70 mt-2">
                        {new Date(item.pubDate).toLocaleDateString('en-US', { 
                          month: 'short', 
                          day: 'numeric',
                          hour: 'numeric',
                          minute: '2-digit'
                        })}
                      </p>
                    </div>
                    <ExternalLink className="h-4 w-4 text-muted-foreground/30 group-hover:text-amber-500 transition-colors flex-shrink-0" />
                  </div>
                </a>
              ))}
            </div>
          )}
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

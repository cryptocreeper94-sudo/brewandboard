import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import { 
  Coffee, 
  MapPin, 
  ChevronRight,
  ChevronLeft,
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
  CloudDrizzle,
  CloudLightning,
  CloudSun,
  Snowflake,
  Wind,
  Droplets,
  X,
  Radar,
  Newspaper,
  ExternalLink,
  RefreshCw,
  Shield,
  ShoppingCart,
  Navigation,
  Cookie,
  Croissant,
  UtensilsCrossed,
  Settings2,
  MessageCircle,
  UserCheck,
  Send,
  Building2,
  Globe2
} from "lucide-react";
import { Link, useLocation } from "wouter";
import { COFFEE_SHOPS, Product, Shop } from "@/lib/mock-data";
import { useCart } from "@/contexts/CartContext";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { WebSearch } from "@/components/WebSearch";
import { RegistrationPopup } from "@/components/RegistrationPopup";
import { LoginPopup } from "@/components/LoginPopup";
import { InstallPrompt } from "@/components/InstallPrompt";
import { SettingsMenu } from "@/components/SettingsMenu";
import { ItemCustomizationModal } from "@/components/ItemCustomizationModal";
import { TeamChat } from "@/components/TeamChat";
import { MascotButton } from "@/components/MascotButton";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

import cremaImage from "@assets/generated_images/crema_coffee_shop_interior.png";
import baristaParlorImage from "@assets/generated_images/barista_parlor_interior.png";
import frothyMonkeyImage from "@assets/generated_images/frothy_monkey_interior.png";

const shopImages: Record<string, string> = {
  'crema': cremaImage,
  'barista-parlor': baristaParlorImage,
  'frothy-monkey': frothyMonkeyImage,
};

const FloatingBean = ({ delay, duration, x, size }: { delay: number; duration: number; x: number; size: number }) => (
  <motion.div
    className="absolute"
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
    style={{ fontSize: size, color: 'rgba(92, 64, 51, 0.3)' }}
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

function CuratedRoastersCarousel() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showMenu, setShowMenu] = useState(false);
  const [customizeItem, setCustomizeItem] = useState<{ product: Product; shop: Shop } | null>(null);
  const { addItem, getItemQuantity, itemCount } = useCart();
  const { toast } = useToast();
  const shops = COFFEE_SHOPS.slice(0, 8);
  
  const goNext = () => {
    setCurrentIndex((prev) => (prev + 1) % shops.length);
  };
  
  const goPrev = () => {
    setCurrentIndex((prev) => (prev - 1 + shops.length) % shops.length);
  };
  
  const shop = shops[currentIndex];
  
  const categories = Array.from(new Set(shop.menu.map(item => item.category)));
  
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3 }}
    >
      <div className="flex items-center justify-between mb-3 px-1">
        <h3 className="font-serif text-lg">Curated Vendors</h3>
        <span className="text-xs font-medium text-muted-foreground">
          {currentIndex + 1} of {shops.length}
        </span>
      </div>
      
      <div className="relative">
        {/* Card */}
        <motion.div
          key={shop.id}
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -50 }}
          transition={{ duration: 0.3 }}
          className="w-full h-[320px] md:h-[360px] rounded-2xl overflow-hidden relative group cursor-pointer shadow-lg"
        >
          <img 
            src={shopImages[shop.id] || shop.image} 
            alt={shop.name} 
            className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent" />
          
          <div className="absolute bottom-0 left-0 right-0 p-6 md:p-8 text-white">
            <div className="flex justify-between items-start mb-3">
              <Badge className="text-white hover:opacity-90 border-none text-sm px-3 py-1" style={{ background: 'linear-gradient(135deg, #5c4033 0%, #3d2418 100%)' }}>
                {shop.rating} <Star className="h-3.5 w-3.5 ml-1 fill-current" />
              </Badge>
              {currentIndex === 0 && (
                <Badge variant="secondary" className="bg-white/20 backdrop-blur-md text-white border-none">
                  Featured
                </Badge>
              )}
            </div>
            <h3 className="font-serif text-2xl md:text-3xl font-bold mb-2">{shop.name}</h3>
            <p className="text-base text-white/80 flex items-center gap-2 mb-4">
              <MapPin className="h-4 w-4" /> {shop.location}
            </p>
            
            <div className="flex items-center justify-between pt-4 border-t border-white/20">
              <Button
                variant="outline"
                size="icon"
                onClick={(e) => { e.stopPropagation(); goPrev(); }}
                className="h-9 w-9 rounded-full bg-white/20 backdrop-blur-sm hover:bg-white/40 border-white/30"
                data-testid="button-carousel-prev"
              >
                <ChevronLeft className="h-5 w-5 text-white" />
              </Button>
              <Button 
                size="sm" 
                className="bg-white text-black hover:bg-white/90 font-medium"
                onClick={(e) => { e.stopPropagation(); setShowMenu(true); }}
                data-testid="button-view-menu"
              >
                View Menu
              </Button>
              <Button
                variant="outline"
                size="icon"
                onClick={(e) => { e.stopPropagation(); goNext(); }}
                className="h-9 w-9 rounded-full bg-white/20 backdrop-blur-sm hover:bg-white/40 border-white/30"
                data-testid="button-carousel-next"
              >
                <ChevronRight className="h-5 w-5 text-white" />
              </Button>
            </div>
          </div>
        </motion.div>
        
        {/* Dots indicator */}
        <div className="flex justify-center gap-2 mt-4">
          {shops.map((_, idx) => (
            <button
              key={idx}
              onClick={() => setCurrentIndex(idx)}
              className={`w-2 h-2 rounded-full transition-all`}
              style={{ 
                background: idx === currentIndex ? '#3d2418' : 'rgba(61, 36, 24, 0.3)',
                width: idx === currentIndex ? '1.5rem' : undefined
              }}
              data-testid={`button-carousel-dot-${idx}`}
            />
          ))}
        </div>
      </div>
      
      {/* Menu Modal */}
      <Dialog open={showMenu} onOpenChange={setShowMenu}>
        <DialogContent className="max-w-lg max-h-[80vh] overflow-hidden bg-gradient-to-br from-[#1a0f09] to-[#2d1810] border-[#3d2418]/30">
          <DialogHeader className="pb-2">
            <DialogTitle className="font-serif text-2xl text-stone-100 flex items-center gap-3">
              <Coffee className="h-6 w-6 text-[#d4c4b0]" />
              {shop.name}
            </DialogTitle>
            <p className="text-stone-300/60 text-sm flex items-center gap-1">
              <MapPin className="h-3 w-3" /> {shop.location}
            </p>
          </DialogHeader>
          
          <ScrollArea className="max-h-[55vh] pr-4">
            <div className="space-y-6">
              {categories.map(category => (
                <div key={category}>
                  <h4 className="text-[#d4c4b0] font-semibold text-sm uppercase tracking-wider mb-3 border-b border-[#3d2418]/30 pb-2">
                    {category}
                  </h4>
                  <div className="space-y-2">
                    {shop.menu
                      .filter(item => item.category === category)
                      .map(item => {
                        const qty = getItemQuantity(item.id);
                        return (
                          <div 
                            key={item.id} 
                            className="p-3 rounded-lg bg-[#3d2418]/40 hover:bg-[#3d2418]/60 transition-colors border border-[#5c4033]/20"
                            data-testid={`menu-item-${item.id}`}
                          >
                            <div className="flex items-start justify-between gap-2 mb-2">
                              <div className="flex-1 min-w-0">
                                <h5 className="text-stone-100 font-medium text-sm">{item.name}</h5>
                                <p className="text-stone-300 text-xs line-clamp-2">{item.description}</p>
                              </div>
                              <span className="text-[#d4c4b0] font-semibold text-sm whitespace-nowrap">
                                ${item.price.toFixed(2)}
                              </span>
                            </div>
                            <Button
                              size="sm"
                              variant={qty > 0 ? "default" : "outline"}
                              className={`w-full shine-effect ${qty > 0 ? "text-white" : "text-[#d4c4b0] hover:bg-[#3d2418]/30"}`}
                              style={qty > 0 ? { background: 'linear-gradient(135deg, #5c4033 0%, #3d2418 100%)' } : { borderColor: '#5c4033' }}
                              onClick={() => {
                                if (item.modifiers && item.modifiers.length > 0) {
                                  setCustomizeItem({ product: item, shop });
                                } else {
                                  addItem(shop, item);
                                  toast({
                                    title: "Added to Cart",
                                    description: `${item.name} added`
                                  });
                                }
                              }}
                              data-testid={`button-add-${item.id}`}
                            >
                              {item.modifiers && item.modifiers.length > 0 ? (
                                <Settings2 className="h-3 w-3 mr-1" />
                              ) : null}
                              {qty > 0 ? `${qty} in cart` : "Add to Cart"}
                            </Button>
                          </div>
                        );
                      })}
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
          
          <div className="pt-3 border-t border-[#3d2418]/30">
            {itemCount > 0 ? (
              <Link href="/schedule">
                <Button 
                  className="w-full text-white shine-effect"
                  style={{ background: 'linear-gradient(135deg, #5c4033 0%, #3d2418 50%, #2d1810 100%)' }}
                  onClick={() => setShowMenu(false)}
                  data-testid="button-checkout"
                >
                  <ShoppingCart className="h-4 w-4 mr-2" />
                  Checkout ({itemCount} items)
                </Button>
              </Link>
            ) : (
              <p className="text-center text-stone-300/50 text-sm py-2">
                Add items to your cart to checkout
              </p>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {customizeItem && (
        <ItemCustomizationModal
          isOpen={!!customizeItem}
          onClose={() => setCustomizeItem(null)}
          product={customizeItem.product}
          shop={customizeItem.shop}
        />
      )}
    </motion.div>
  );
}

function FeaturedBoardsCarousel() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showMenu, setShowMenu] = useState(false);
  const [customizeItem, setCustomizeItem] = useState<{ product: Product; shop: Shop } | null>(null);
  const { addItem, getItemQuantity, itemCount } = useCart();
  const { toast } = useToast();
  
  const foodShops = COFFEE_SHOPS.filter(shop => 
    ['bakery', 'donut', 'breakfast'].includes(shop.type) || 
    shop.name.includes('Crumbl') || 
    shop.name.includes('Donut') ||
    shop.name.includes('Biscuit')
  ).slice(0, 8);
  
  if (foodShops.length === 0) return null;
  
  const goNext = () => {
    setCurrentIndex((prev) => (prev + 1) % foodShops.length);
  };
  
  const goPrev = () => {
    setCurrentIndex((prev) => (prev - 1 + foodShops.length) % foodShops.length);
  };
  
  const shop = foodShops[currentIndex];
  const categories = Array.from(new Set(shop.menu.map(item => item.category)));
  
  const getTypeLabel = (type: string) => {
    switch(type) {
      case 'bakery': return 'Bakery';
      case 'donut': return 'Donuts';
      case 'breakfast': return 'Breakfast';
      default: return 'Treats';
    }
  };
  
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.35 }}
    >
      <div className="flex items-center justify-between mb-3 px-1">
        <div className="flex items-center gap-2">
          <Croissant className="h-5 w-5" style={{ color: '#5c4033' }} />
          <h3 className="font-serif text-lg">Featured Boards & Treats</h3>
        </div>
        <span className="text-xs font-medium text-muted-foreground">
          {currentIndex + 1} of {foodShops.length}
        </span>
      </div>
      
      <div className="relative">
        <motion.div
          key={shop.id}
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -50 }}
          transition={{ duration: 0.3 }}
          className="w-full h-[280px] md:h-[320px] rounded-2xl overflow-hidden relative group cursor-pointer shadow-lg"
        >
          <img 
            src={shop.image} 
            alt={shop.name} 
            className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
          />
          <div className="absolute inset-0" style={{ background: 'linear-gradient(to top, rgba(0,0,0,0.9) 0%, rgba(26,15,9,0.4) 50%, rgba(45,24,16,0.2) 100%)' }} />
          
          <div className="absolute bottom-0 left-0 right-0 p-6 md:p-8 text-white">
            <div className="flex justify-between items-start mb-3">
              <Badge className="text-white hover:opacity-90 border-none text-sm px-3 py-1" style={{ background: 'linear-gradient(135deg, #5c4033 0%, #3d2418 100%)' }}>
                {shop.rating} <Star className="h-3.5 w-3.5 ml-1 fill-current" />
              </Badge>
              <Badge variant="secondary" className="bg-white/20 backdrop-blur-md text-white border-none">
                {getTypeLabel(shop.type)}
              </Badge>
            </div>
            <h3 className="font-serif text-2xl md:text-3xl font-bold mb-2">{shop.name}</h3>
            <p className="text-base text-white/80 flex items-center gap-2 mb-4">
              <MapPin className="h-4 w-4" /> {shop.location}
            </p>
            
            <div className="flex items-center justify-between pt-4 border-t border-white/20">
              <Button
                variant="outline"
                size="icon"
                onClick={(e) => { e.stopPropagation(); goPrev(); }}
                className="h-9 w-9 rounded-full bg-white/20 backdrop-blur-sm hover:bg-white/40 border-white/30"
                data-testid="button-boards-carousel-prev"
              >
                <ChevronLeft className="h-5 w-5 text-white" />
              </Button>
              <Button 
                size="sm" 
                className="bg-white text-black hover:bg-white/90 font-medium"
                onClick={(e) => { e.stopPropagation(); setShowMenu(true); }}
                data-testid="button-boards-view-menu"
              >
                View Menu
              </Button>
              <Button
                variant="outline"
                size="icon"
                onClick={(e) => { e.stopPropagation(); goNext(); }}
                className="h-9 w-9 rounded-full bg-white/20 backdrop-blur-sm hover:bg-white/40 border-white/30"
                data-testid="button-boards-carousel-next"
              >
                <ChevronRight className="h-5 w-5 text-white" />
              </Button>
            </div>
          </div>
        </motion.div>
        
        <div className="flex justify-center gap-2 mt-4">
          {foodShops.map((_, idx) => (
            <button
              key={idx}
              onClick={() => setCurrentIndex(idx)}
              className="w-2 h-2 rounded-full transition-all"
              style={{ 
                background: idx === currentIndex ? '#3d2418' : 'rgba(61, 36, 24, 0.3)',
                width: idx === currentIndex ? '1.5rem' : undefined
              }}
              data-testid={`button-boards-carousel-dot-${idx}`}
            />
          ))}
        </div>
      </div>
      
      <Dialog open={showMenu} onOpenChange={setShowMenu}>
        <DialogContent className="max-w-lg max-h-[80vh] overflow-hidden bg-gradient-to-br from-[#1a0f09] to-[#2d1810] border-[#3d2418]/30">
          <DialogHeader className="pb-2">
            <DialogTitle className="font-serif text-2xl text-stone-100 flex items-center gap-3">
              <Croissant className="h-6 w-6" style={{ color: '#d4c4b0' }} />
              {shop.name}
            </DialogTitle>
            <p className="text-stone-300/60 text-sm flex items-center gap-1">
              <MapPin className="h-3 w-3" /> {shop.location}
            </p>
          </DialogHeader>
          
          <ScrollArea className="max-h-[55vh] pr-4">
            <div className="space-y-6">
              {categories.map(category => (
                <div key={category}>
                  <h4 className="text-[#d4c4b0] font-semibold text-sm uppercase tracking-wider mb-3 border-b border-[#3d2418]/30 pb-2">
                    {category}
                  </h4>
                  <div className="space-y-2">
                    {shop.menu
                      .filter(item => item.category === category)
                      .map(item => {
                        const qty = getItemQuantity(item.id);
                        return (
                          <div 
                            key={item.id} 
                            className="p-3 rounded-lg bg-[#3d2418]/40 hover:bg-[#3d2418]/60 transition-colors border border-[#5c4033]/20"
                            data-testid={`boards-menu-item-${item.id}`}
                          >
                            <div className="flex items-start justify-between gap-2 mb-2">
                              <div className="flex-1 min-w-0">
                                <h5 className="font-medium text-stone-100 text-sm">{item.name}</h5>
                                <p className="text-xs text-stone-300 line-clamp-2">{item.description}</p>
                              </div>
                              <span className="text-[#d4c4b0] font-semibold text-sm flex-shrink-0">${item.price.toFixed(2)}</span>
                            </div>
                            <Button
                              size="sm"
                              variant={qty > 0 ? "secondary" : "outline"}
                              className={`w-full shine-effect ${qty > 0 ? "text-white border-none" : "text-[#d4c4b0] hover:bg-[#3d2418]/30"}`}
                              style={qty > 0 ? { background: 'linear-gradient(135deg, #5c4033 0%, #3d2418 100%)' } : { borderColor: '#5c4033' }}
                              onClick={() => {
                                if (item.modifiers && item.modifiers.length > 0) {
                                  setCustomizeItem({ product: item, shop });
                                } else {
                                  addItem(shop, item);
                                  toast({
                                    title: "Added to cart",
                                    description: `${item.name} - $${item.price.toFixed(2)}`,
                                  });
                                }
                              }}
                              data-testid={`button-add-boards-${item.id}`}
                            >
                              {item.modifiers && item.modifiers.length > 0 ? (
                                <Settings2 className="h-3 w-3 mr-1" />
                              ) : (
                                <Plus className="h-3 w-3 mr-1" />
                              )}
                              {qty > 0 ? `${qty} in cart` : "Add to Cart"}
                            </Button>
                          </div>
                        );
                      })}
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
          
          <div className="pt-3 border-t border-[#3d2418]/30">
            {itemCount > 0 ? (
              <Link href="/schedule">
                <Button 
                  className="w-full text-white shine-effect"
                  style={{ background: 'linear-gradient(135deg, #5c4033 0%, #3d2418 50%, #2d1810 100%)' }}
                  onClick={() => setShowMenu(false)}
                  data-testid="button-boards-checkout"
                >
                  <ShoppingCart className="h-4 w-4 mr-2" />
                  Checkout ({itemCount} items)
                </Button>
              </Link>
            ) : (
              <p className="text-center text-stone-300/50 text-sm py-2">
                Add items to your cart to checkout
              </p>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {customizeItem && (
        <ItemCustomizationModal
          isOpen={!!customizeItem}
          onClose={() => setCustomizeItem(null)}
          product={customizeItem.product}
          shop={customizeItem.shop}
        />
      )}
    </motion.div>
  );
}

// Weather icon helper
const getWeatherIcon = (icon: string, className: string = "h-4 w-4") => {
  switch (icon) {
    case 'sun': return <Sun className={`${className}`} style={{ color: '#d4c4b0' }} />;
    case 'cloud-sun': return <CloudSun className={`${className}`} style={{ color: '#d4c4b0' }} />;
    case 'cloud': return <Cloud className={`${className} text-gray-400`} />;
    case 'cloud-rain': return <CloudRain className={`${className} text-blue-400`} />;
    case 'cloud-drizzle': return <CloudDrizzle className={`${className} text-blue-300`} />;
    case 'cloud-lightning': return <CloudLightning className={`${className} text-purple-500`} />;
    case 'snowflake': return <Snowflake className={`${className} text-cyan-300`} />;
    default: return <Cloud className={`${className} text-gray-400`} />;
  }
};

interface WeatherData {
  current: {
    temperature: number;
    feelsLike: number;
    humidity: number;
    windSpeed: number;
    precipitation: number;
    condition: string;
    icon: string;
  };
  forecast: Array<{
    date: string;
    high: number;
    low: number;
    condition: string;
    icon: string;
  }>;
  lastUpdated: string;
}

export default function Dashboard() {
  const userName = localStorage.getItem("user_name") || "Guest";
  const isGuest = localStorage.getItem("is_guest") === "true";
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [showRegister, setShowRegister] = useState(false);
  const [showLogin, setShowLogin] = useState(false);

  // Check for action parameter in URL to auto-open register/login popup
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const action = urlParams.get('action');
    if (action === 'register') {
      setShowRegister(true);
      // Clean up URL
      window.history.replaceState({}, '', '/dashboard');
    } else if (action === 'login') {
      setShowLogin(true);
      // Clean up URL
      window.history.replaceState({}, '', '/dashboard');
    }
  }, []);
  const [showWeatherRadar, setShowWeatherRadar] = useState(false);
  const [newsItems, setNewsItems] = useState<NewsItem[]>([]);
  const [newsLoading, setNewsLoading] = useState(true);
  const [newsError, setNewsError] = useState(false);

  // Fetch real weather data
  const { data: weather } = useQuery<WeatherData>({
    queryKey: ['weather', 'nashville'],
    queryFn: async () => {
      const res = await fetch('/api/weather/nashville');
      if (!res.ok) throw new Error('Failed to fetch weather');
      return res.json();
    },
    refetchInterval: 10 * 60 * 1000, // Refetch every 10 minutes
    staleTime: 5 * 60 * 1000, // Consider fresh for 5 minutes
  });

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

const { itemCount } = useCart();

  const quickActions = [
    {
      id: "schedule",
      title: "Create Order",
      subtitle: "Premium catering delivery",
      href: "/schedule",
      icon: Calendar,
      gradient: "from-[#5c4033] via-[#3d2418] to-[#2d1810]",
      shadowColor: "shadow-[#2d1810]/40"
    },
    {
      id: "find-baristas",
      title: "Find Vendors",
      subtitle: "Coffee, donuts & more",
      href: "/find-baristas",
      icon: Navigation,
      gradient: "from-[#6b4423] via-[#4a2c1c] to-[#3d2418]",
      shadowColor: "shadow-[#3d2418]/40"
    },
    {
      id: "portfolio",
      title: "My Portfolio",
      subtitle: "Client notes & templates",
      href: "/portfolio",
      icon: Users,
      gradient: "from-[#78552b] via-[#5c4033] to-[#4a2c1c]",
      shadowColor: "shadow-[#4a2c1c]/40"
    },
    {
      id: "scan",
      title: "Scan Document",
      subtitle: "Create & share PDFs",
      href: "/scan",
      icon: Scan,
      gradient: "from-[#4a2c1c] via-[#3d2418] to-[#2d1810]",
      shadowColor: "shadow-[#2d1810]/40"
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-stone-100 via-stone-50 to-background dark:from-[#1a0f09]/30 dark:via-background dark:to-background text-foreground pb-20 overflow-x-hidden">
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
      <div className="relative overflow-hidden pt-4 md:pt-6">
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
                <span className="text-xs font-medium text-white">Nashville's Eclectic Catering Concierge</span>
              </motion.div>
              <h1 className="font-serif text-3xl md:text-5xl text-white font-bold tracking-tight drop-shadow-lg mb-2">
                Brews & Boards
              </h1>
              <p className="text-[#d4c4b0] text-sm md:text-base max-w-md">
                Coffee, tea, donuts & breakfast boards — delivered with Nashville style
              </p>
              <motion.div 
                className="flex gap-3 mt-4 justify-center md:justify-start"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
              >
                <Link href="/schedule">
                  <Button className="text-white font-semibold shadow-lg hover:shadow-xl transition-all shine-effect" style={{ background: 'linear-gradient(135deg, #5c4033 0%, #3d2418 50%, #2d1810 100%)', borderColor: 'rgba(212,196,176,0.3)' }}>
                    <Calendar className="h-4 w-4 mr-2" />
                    Order Now
                  </Button>
                </Link>
                <Link href="/verify/BB-0000000001">
                  <Button variant="outline" className="border-[#d4c4b0]/50 text-[#d4c4b0] hover:bg-[#2d1810]/30 backdrop-blur-sm">
                    <Shield className="h-4 w-4 mr-2" />
                    Verified
                  </Button>
                </Link>
              </motion.div>
            </motion.div>
            
          </div>
        </div>
        
        {/* Wave divider */}
        <div className="absolute bottom-0 left-0 right-0">
          <svg viewBox="0 0 1200 40" className="w-full h-8 fill-stone-100 dark:fill-background" preserveAspectRatio="none">
            <path d="M0,40 L0,20 Q150,0 300,15 T600,10 T900,20 T1200,10 L1200,40 Z" />
          </svg>
        </div>
      </div>

      {/* Header */}
      <header className="sticky top-0 z-40 bg-background/80 backdrop-blur-md border-b border-border/50">
        <div className="container max-w-5xl mx-auto px-4 h-14 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <Coffee className="h-5 w-5" style={{ color: '#5c4033' }} />
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
              className="gap-2 text-xs hover:bg-stone-100 dark:hover:bg-[#1a0f09]/30"
              data-testid="button-weather"
            >
              {weather ? getWeatherIcon(weather.current.icon) : <Cloud className="h-4 w-4 text-gray-400" />}
              <span className="font-medium">{weather?.current.temperature ?? '--'}°</span>
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
            
            <SettingsMenu />
          </div>
        </div>
      </header>

      <main className="container max-w-5xl mx-auto px-4 py-6 space-y-6">
        
        {/* Quick Search Bar */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col items-center gap-1"
        >
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
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
            {quickActions.map((action, index) => (
              <Link key={action.id} href={action.href}>
                <motion.div
                  initial={{ opacity: 0, y: 20, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  transition={{ delay: 0.1 + index * 0.08, type: "spring", stiffness: 100 }}
                  whileHover={{ scale: 1.03, y: -4 }}
                  whileTap={{ scale: 0.98 }}
                  className={`relative h-[100px] md:h-[130px] bg-gradient-to-br ${action.gradient} text-white rounded-xl md:rounded-2xl p-3 md:p-4 flex flex-col justify-between cursor-pointer shadow-lg ${action.shadowColor} hover:shadow-2xl transition-all overflow-hidden`}
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
                  <div className="absolute -right-6 -top-6 w-20 h-20 bg-white/10 rounded-full" />
                  <div className="absolute -right-2 -bottom-6 w-14 h-14 bg-white/10 rounded-full" />
                  
                  <div className="relative z-10">
                    <motion.div 
                      className="h-8 w-8 md:h-10 md:w-10 bg-white/20 backdrop-blur-sm rounded-lg flex items-center justify-center shadow-inner"
                      whileHover={{ rotate: 5 }}
                    >
                      <action.icon className="h-4 w-4 md:h-5 md:w-5" />
                    </motion.div>
                  </div>
                  <div className="relative z-10">
                    <h4 className="font-serif text-sm md:text-base font-bold leading-tight line-clamp-1">
                      {action.title}
                    </h4>
                    <p className="text-[10px] md:text-xs text-white/80 line-clamp-1 hidden md:block">{action.subtitle}</p>
                  </div>
                </motion.div>
              </Link>
            ))}
          </div>
        </motion.div>

        {/* Virtual Host Feature - Hero Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
        >
          <div className="flex items-center justify-between mb-3 px-1">
            <div className="flex items-center gap-2">
              <h3 className="font-serif text-lg">Virtual Host</h3>
              <Badge variant="secondary" className="bg-gradient-to-r from-amber-500/20 to-orange-500/20 text-amber-700 dark:text-amber-400 border-amber-300 dark:border-amber-700 text-[10px]">
                NEW
              </Badge>
            </div>
          </div>
          
          <Link href="/virtual-host">
            <motion.div
              whileHover={{ scale: 1.01, y: -2 }}
              whileTap={{ scale: 0.99 }}
              className="relative overflow-hidden rounded-2xl cursor-pointer shadow-lg hover:shadow-xl transition-all"
              style={{
                background: 'linear-gradient(135deg, #1a0f09 0%, #2d1810 30%, #3d2418 60%, #5c4033 100%)'
              }}
              data-testid="card-virtual-host"
            >
              {/* Animated shine overlay */}
              <motion.div 
                className="absolute inset-0 opacity-20"
                animate={{
                  background: [
                    'linear-gradient(105deg, transparent 40%, rgba(255,255,255,0.3) 45%, transparent 50%)',
                    'linear-gradient(105deg, transparent 60%, rgba(255,255,255,0.3) 65%, transparent 70%)',
                    'linear-gradient(105deg, transparent 40%, rgba(255,255,255,0.3) 45%, transparent 50%)',
                  ]
                }}
                transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
              />
              
              {/* Decorative elements */}
              <div className="absolute -right-8 -top-8 w-32 h-32 bg-white/5 rounded-full" />
              <div className="absolute -right-4 -bottom-12 w-24 h-24 bg-white/5 rounded-full" />
              
              <div className="relative z-10 p-5 md:p-6">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                  {/* Left content */}
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="h-12 w-12 bg-white/10 backdrop-blur-sm rounded-xl flex items-center justify-center">
                        <UserCheck className="h-6 w-6 text-amber-300" />
                      </div>
                      <div>
                        <h4 className="font-serif text-xl text-white font-bold">Order for Your Team</h4>
                        <p className="text-sm text-[#d4c4b0]">Multi-location catering made easy</p>
                      </div>
                    </div>
                    
                    <p className="text-sm text-white/70 mb-4 max-w-lg">
                      Hosting a meeting with attendees at different locations? Let each person pick their own brews & boards, 
                      delivered right to their desk — Nashville or nationwide.
                    </p>
                    
                    {/* Feature badges */}
                    <div className="flex flex-wrap gap-2">
                      <div className="flex items-center gap-1.5 bg-white/10 rounded-full px-3 py-1">
                        <Building2 className="h-3.5 w-3.5 text-amber-300" />
                        <span className="text-xs text-white/90">Local Nashville</span>
                      </div>
                      <div className="flex items-center gap-1.5 bg-white/10 rounded-full px-3 py-1 relative">
                        <Globe2 className="h-3.5 w-3.5 text-blue-300" />
                        <span className="text-xs text-white/90">Nationwide</span>
                        <Badge className="absolute -top-2 -right-2 text-[8px] px-1.5 py-0 bg-blue-500/80 border-none text-white">Soon</Badge>
                      </div>
                      <div className="flex items-center gap-1.5 bg-white/10 rounded-full px-3 py-1">
                        <Send className="h-3.5 w-3.5 text-emerald-300" />
                        <span className="text-xs text-white/90">Budget Controls</span>
                      </div>
                    </div>
                  </div>
                  
                  {/* Right CTA */}
                  <div className="flex md:flex-col items-center gap-3">
                    <Button 
                      className="text-white font-semibold shine-effect whitespace-nowrap"
                      style={{ background: 'linear-gradient(135deg, #5c4033 0%, #3d2418 100%)' }}
                      data-testid="button-start-virtual-host"
                    >
                      <Sparkles className="h-4 w-4 mr-2" />
                      Get Started
                    </Button>
                    <span className="text-xs text-white/50">2-hour lead time</span>
                  </div>
                </div>
              </div>
            </motion.div>
          </Link>
        </motion.div>

        {/* Curated Vendors - Coffee & Beverages */}
        <CuratedRoastersCarousel />

        {/* Featured Boards & Treats - Food Section */}
        <FeaturedBoardsCarousel />

        {/* Nashville News Section */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <div className="flex items-center justify-between mb-3 px-1">
            <div className="flex items-center gap-2">
              <Newspaper className="h-5 w-5" style={{ color: '#5c4033' }} />
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
                  className="group bg-card border rounded-xl p-4 hover:border-[#5c4033]/50 hover:shadow-md transition-all"
                  data-testid={`news-item-${index}`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <h4 className="text-sm font-medium leading-snug line-clamp-2 group-hover:text-[#5c4033] transition-colors">
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
                    <ExternalLink className="h-4 w-4 text-muted-foreground/30 group-hover:text-[#5c4033] transition-colors flex-shrink-0" />
                  </div>
                </a>
              ))}
            </div>
          )}
        </motion.div>
      </main>

      {/* Weather Radar Modal */}
      <Dialog open={showWeatherRadar} onOpenChange={setShowWeatherRadar}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden p-0">
          <DialogHeader className="p-4 pb-2 border-b">
            <DialogTitle className="flex items-center gap-2 font-serif">
              <Radar className="h-5 w-5" style={{ color: '#5c4033' }} />
              Nashville Weather
            </DialogTitle>
          </DialogHeader>
          <div className="p-4 space-y-4 overflow-y-auto max-h-[calc(90vh-80px)]">
            {/* Current Conditions - Real Data */}
            <div className="bg-gradient-to-br from-stone-100 to-stone-50 dark:from-[#1a0f09]/30 dark:to-[#2d1810]/30 rounded-xl p-6">
              <div className="flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-2 text-muted-foreground mb-2">
                    <MapPin className="h-4 w-4" />
                    <span className="text-sm font-medium">Nashville, Tennessee</span>
                  </div>
                  <div className="text-5xl font-serif font-bold text-foreground">
                    {weather?.current.temperature ?? '--'}°F
                  </div>
                  <p className="text-muted-foreground mt-1">{weather?.current.condition ?? 'Loading...'}</p>
                </div>
                <div className="text-right">
                  {weather ? getWeatherIcon(weather.current.icon, "h-16 w-16") : <Cloud className="h-16 w-16 text-gray-400" />}
                  <p className="text-sm text-muted-foreground mt-2">Feels like {weather?.current.feelsLike ?? '--'}°</p>
                </div>
              </div>
              
              <div className="grid grid-cols-4 gap-4 mt-6 pt-4 border-t border-stone-200/50 dark:border-[#3d2418]/30">
                <div className="text-center">
                  <div className="flex items-center justify-center gap-1 text-muted-foreground mb-1">
                    <Droplets className="h-3 w-3" />
                    <p className="text-xs">Humidity</p>
                  </div>
                  <p className="font-semibold">{weather?.current.humidity ?? '--'}%</p>
                </div>
                <div className="text-center">
                  <div className="flex items-center justify-center gap-1 text-muted-foreground mb-1">
                    <Wind className="h-3 w-3" />
                    <p className="text-xs">Wind</p>
                  </div>
                  <p className="font-semibold">{weather?.current.windSpeed ?? '--'} mph</p>
                </div>
                <div className="text-center">
                  <div className="flex items-center justify-center gap-1 text-muted-foreground mb-1">
                    <CloudRain className="h-3 w-3" />
                    <p className="text-xs">Precip</p>
                  </div>
                  <p className="font-semibold">{weather?.current.precipitation ?? 0}"</p>
                </div>
                <div className="text-center">
                  <p className="text-xs text-muted-foreground mb-1">Updated</p>
                  <p className="font-semibold text-xs">
                    {weather?.lastUpdated ? new Date(weather.lastUpdated).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' }) : '--'}
                  </p>
                </div>
              </div>
            </div>

            {/* Interactive Radar Map - Full Featured with All Layers */}
            <div className="bg-card border rounded-xl overflow-hidden">
              <div className="p-3 border-b bg-muted/30 flex items-center justify-between">
                <span className="text-sm font-medium flex items-center gap-2">
                  <Radar className="h-4 w-4 text-blue-500" />
                  Interactive Radar Map
                </span>
                <span className="text-xs text-muted-foreground">Use menu for layers: Rain, Wind, Storms, Temp</span>
              </div>
              <div className="relative" style={{ height: '450px' }}>
                <iframe
                  src="https://embed.windy.com/embed2.html?lat=36.16&lon=-86.78&detailLat=36.16&detailLon=-86.78&width=650&height=450&zoom=7&level=surface&overlay=radar&product=radar&menu=true&message=true&marker=true&calendar=now&pressure=true&type=map&location=coordinates&detail=true&metricWind=mph&metricTemp=°F&radarRange=-1"
                  className="w-full h-full border-0"
                  title="Nashville Weather Radar"
                  allowFullScreen
                />
              </div>
              <div className="p-2 bg-muted/20 border-t">
                <p className="text-xs text-muted-foreground text-center">
                  Click the menu icon (☰) to switch layers: Radar, Rain, Wind, Temperature, Clouds, Thunderstorms
                </p>
              </div>
            </div>

            {/* 5-Day Forecast - Real Data */}
            <div className="bg-card border rounded-xl p-4">
              <h4 className="text-sm font-medium mb-4">5-Day Forecast</h4>
              <div className="grid grid-cols-5 gap-3">
                {weather?.forecast?.length ? weather.forecast.map((day, i) => {
                  const dayName = i === 0 ? 'Today' : new Date(day.date).toLocaleDateString('en-US', { weekday: 'short' });
                  return (
                    <div key={day.date} className="text-center p-3 rounded-lg bg-muted/30">
                      <p className="text-xs font-medium text-muted-foreground mb-2">{dayName}</p>
                      {getWeatherIcon(day.icon, "h-6 w-6 mx-auto mb-2")}
                      <p className="text-sm font-semibold">{day.high}°</p>
                      <p className="text-xs text-muted-foreground">{day.low}°</p>
                    </div>
                  );
                }) : (
                  // Fallback skeleton
                  Array.from({ length: 5 }).map((_, i) => (
                    <div key={i} className="text-center p-3 rounded-lg bg-muted/30 animate-pulse">
                      <div className="h-3 bg-muted rounded w-8 mx-auto mb-2" />
                      <div className="h-6 w-6 bg-muted rounded-full mx-auto mb-2" />
                      <div className="h-4 bg-muted rounded w-6 mx-auto mb-1" />
                      <div className="h-3 bg-muted rounded w-5 mx-auto" />
                    </div>
                  ))
                )}
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

      {/* Team Chat for Operators */}
      <TeamChat />

      {/* Floating Mascot AI Assistant Button */}
      <MascotButton />
    </div>
  );
}

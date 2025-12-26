import { useState, useEffect, useRef } from "react";
import { Link, useLocation } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import { 
  ShoppingCart, 
  Store, 
  BarChart3, 
  Play,
  FlaskConical,
  ChevronRight,
  ChevronLeft,
  Coffee,
  MapPin,
  FileText,
  Shield,
  Sparkles,
  LogOut,
  TrendingUp,
  Package,
  Clock,
  Bug,
  CheckCircle2,
  AlertTriangle,
  Eye,
  Lock,
  X,
  Calendar,
  Users,
  Presentation,
  Scan,
  ArrowRight,
  Star,
  Zap,
  DollarSign,
  Wallet,
  PiggyBank,
  Receipt,
  Settings,
  Database,
  Activity
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";

interface ErrorReport {
  id: string;
  title: string;
  description: string;
  category: string;
  severity: string;
  status: string;
  reporterName: string | null;
  reporterEmail: string | null;
  createdAt: string;
}

interface PartnerInfo {
  id: string;
  name: string;
  hasCompletedOnboarding: boolean;
  welcomeModalDismissed: boolean;
  isPreviewMode: boolean;
}

// Carousel Component - Accessible with keyboard navigation
function Carousel({ children, className = "", label = "content" }: { children: React.ReactNode; className?: string; label?: string }) {
  const trackRef = useRef<HTMLDivElement>(null);
  
  const scroll = (direction: 'left' | 'right') => {
    if (trackRef.current) {
      const scrollAmount = 180;
      trackRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth'
      });
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowLeft') {
      scroll('left');
    } else if (e.key === 'ArrowRight') {
      scroll('right');
    }
  };

  return (
    <div 
      className={`relative ${className}`}
      role="region"
      aria-label={`${label} carousel`}
      onKeyDown={handleKeyDown}
    >
      <button 
        onClick={() => scroll('left')} 
        className="absolute left-0 top-1/2 -translate-y-1/2 z-10 w-8 h-8 rounded-full bg-amber-900/80 border border-amber-600/50 text-amber-300 flex items-center justify-center hover:bg-amber-800 transition-all focus:outline-none focus:ring-2 focus:ring-amber-500"
        aria-label={`Scroll ${label} left`}
        data-testid="carousel-left"
      >
        <ChevronLeft className="h-4 w-4" />
      </button>
      <div 
        ref={trackRef} 
        className="flex gap-3 overflow-x-auto scroll-smooth scrollbar-hide py-2 px-10"
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        tabIndex={0}
        role="list"
      >
        {children}
      </div>
      <button 
        onClick={() => scroll('right')} 
        className="absolute right-0 top-1/2 -translate-y-1/2 z-10 w-8 h-8 rounded-full bg-amber-900/80 border border-amber-600/50 text-amber-300 flex items-center justify-center hover:bg-amber-800 transition-all focus:outline-none focus:ring-2 focus:ring-amber-500"
        aria-label={`Scroll ${label} right`}
        data-testid="carousel-right"
      >
        <ChevronRight className="h-4 w-4" />
      </button>
    </div>
  );
}

// Bento Card Component
function BentoCard({ 
  children, 
  className = "", 
  span = 4,
  variant = "default",
  onClick
}: { 
  children: React.ReactNode; 
  className?: string;
  span?: 1 | 2 | 3 | 4 | 6 | 8 | 12;
  variant?: "default" | "3d" | "glow" | "glass";
  onClick?: () => void;
}) {
  const spanClass = `bento-span-${span}`;
  const variantClass = variant === "3d" ? "bento-card-3d" : 
                       variant === "glow" ? "stat-card-glow" :
                       variant === "glass" ? "glass-card-dark p-5" :
                       "bento-card-dark";
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`${spanClass} ${variantClass} ${className}`}
      onClick={onClick}
      whileHover={{ scale: 1.02 }}
      transition={{ duration: 0.2 }}
    >
      {children}
    </motion.div>
  );
}

export default function PartnerHub() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [sandboxMode, setSandboxMode] = useState(() => {
    return localStorage.getItem("sandbox_mode") === "true";
  });
  const [errorReports, setErrorReports] = useState<ErrorReport[]>([]);
  const [loadingReports, setLoadingReports] = useState(true);
  
  // Partner state
  const [partnerInfo, setPartnerInfo] = useState<PartnerInfo | null>(null);
  const [showWelcomeModal, setShowWelcomeModal] = useState(false);
  const [showPinChangeModal, setShowPinChangeModal] = useState(false);
  const [newPin, setNewPin] = useState("");
  const [confirmPin, setConfirmPin] = useState("");
  const [pinError, setPinError] = useState("");
  const [isPreviewMode, setIsPreviewMode] = useState(true);

  useEffect(() => {
    const saved = localStorage.getItem("sandbox_mode");
    if (saved === "true") {
      setSandboxMode(true);
    }
    
    // Load partner info from localStorage
    const partnerData = localStorage.getItem("coffee_partner_data");
    if (partnerData) {
      try {
        const data = JSON.parse(partnerData);
        setPartnerInfo(data.partner);
        setIsPreviewMode(data.isPreviewMode !== false);
        
        // Show welcome modal if not dismissed
        if (!data.partner.welcomeModalDismissed) {
          setShowWelcomeModal(true);
        }
        
        // Show PIN change modal if not onboarded
        if (!data.partner.hasCompletedOnboarding) {
          setShowPinChangeModal(true);
        }
      } catch (e) {
        console.error("Failed to parse partner data:", e);
      }
    }
    
    // Fetch error reports
    async function fetchReports() {
      try {
        const res = await fetch("/api/error-reports");
        if (res.ok) {
          const data = await res.json();
          setErrorReports(data);
        }
      } catch (error) {
        console.error("Failed to fetch error reports:", error);
      } finally {
        setLoadingReports(false);
      }
    }
    fetchReports();
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("coffee_user");
    localStorage.removeItem("coffee_partner_auth");
    localStorage.removeItem("coffee_partner_data");
    localStorage.removeItem("user_name");
    localStorage.removeItem("coffee_session_expiry");
    toast({
      title: "Logged Out",
      description: `See you soon${partnerInfo ? `, ${partnerInfo.name}` : ''}!`,
    });
    setLocation("/");
  };

  const toggleSandbox = () => {
    setSandboxMode(!sandboxMode);
    localStorage.setItem("sandbox_mode", (!sandboxMode).toString());
    toast({
      title: sandboxMode ? "Live Mode Activated" : "Sandbox Mode Activated",
      description: sandboxMode 
        ? "You're now viewing live data and real transactions." 
        : "Safe testing mode - no real orders or payments will be processed.",
    });
  };

  const handleDismissWelcome = async () => {
    if (partnerInfo) {
      try {
        await fetch(`/api/partners/${partnerInfo.id}/dismiss-welcome`, { method: 'POST' });
        setShowWelcomeModal(false);
        
        // Update local storage
        const partnerData = localStorage.getItem("coffee_partner_data");
        if (partnerData) {
          const data = JSON.parse(partnerData);
          data.partner.welcomeModalDismissed = true;
          localStorage.setItem("coffee_partner_data", JSON.stringify(data));
        }
      } catch (e) {
        console.error("Failed to dismiss welcome:", e);
      }
    }
    setShowWelcomeModal(false);
  };

  const handlePinChange = async () => {
    setPinError("");
    
    if (newPin.length !== 4) {
      setPinError("PIN must be exactly 4 digits");
      return;
    }
    
    if (!/^\d{4}$/.test(newPin)) {
      setPinError("PIN must contain only numbers");
      return;
    }
    
    if (newPin !== confirmPin) {
      setPinError("PINs do not match");
      return;
    }
    
    if (partnerInfo) {
      try {
        const res = await fetch(`/api/partners/${partnerInfo.id}/complete-onboarding`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ newPin })
        });
        
        if (!res.ok) {
          const error = await res.json();
          setPinError(error.error || "Failed to set PIN");
          return;
        }
        
        toast({
          title: "PIN Updated!",
          description: "Your new 4-digit PIN is now active. Use it to log in next time.",
        });
        
        setShowPinChangeModal(false);
        
        // Update local storage
        const partnerData = localStorage.getItem("coffee_partner_data");
        if (partnerData) {
          const data = JSON.parse(partnerData);
          data.partner.hasCompletedOnboarding = true;
          localStorage.setItem("coffee_partner_data", JSON.stringify(data));
          setPartnerInfo({ ...partnerInfo, hasCompletedOnboarding: true });
        }
      } catch (e) {
        setPinError("Failed to update PIN. Please try again.");
      }
    }
  };

  const quickStats = [
    { label: "Active Orders", value: "12", icon: Package, trend: "+3 today", color: "text-amber-400" },
    { label: "Vendors Online", value: "37", icon: Store, trend: "All active", color: "text-emerald-400" },
    { label: "This Week", value: "$2,847", icon: TrendingUp, trend: "+18%", color: "text-green-400" },
    { label: "Delivery Time", value: "1.8h", icon: Clock, trend: "On target", color: "text-sky-400" },
  ];

  const quickActions = [
    { label: "Operations", icon: Package, href: "/operations", color: "from-red-500 to-rose-600" },
    { label: "New Order", icon: ShoppingCart, href: "/schedule", color: "from-amber-500 to-orange-600" },
    { label: "View Vendors", icon: Store, href: "/vendors", color: "from-emerald-500 to-green-600" },
    { label: "Portfolio", icon: FileText, href: "/portfolio", color: "from-blue-500 to-indigo-600" },
    { label: "Scanner", icon: Scan, href: "/scan", color: "from-purple-500 to-violet-600" },
    { label: "Virtual Host", icon: Users, href: "/virtual-host", color: "from-pink-500 to-rose-600" },
    { label: "Presentations", icon: Presentation, href: "/meeting-presentations", color: "from-cyan-500 to-teal-600" },
    { label: "Dev Hub", icon: Shield, href: "/developers", color: "from-slate-500 to-zinc-600" },
  ];

  const platformFeatures = [
    { title: "Operations Center", desc: "Live order board with status tracking", icon: Package },
    { title: "Order Scheduling", desc: "Calendar-based ordering with 2hr lead time", icon: Calendar },
    { title: "Quick Reorder", desc: "One-tap repeat orders & favorites", icon: ShoppingCart },
    { title: "Loyalty Program", desc: "Points, tiers, referral rewards", icon: Star },
    { title: "Team Management", desc: "Company accounts with spending limits", icon: Users },
    { title: "Calendar Sync", desc: "Google/Outlook meeting integration", icon: Calendar },
    { title: "Blockchain", desc: "Solana hallmark verification", icon: Shield },
    { title: "AI Recommendations", desc: "Smart suggestions for meetings", icon: TrendingUp },
  ];

  // Royalty tracking data for Sidonie
  const royaltyData = {
    totalEarned: 12847.50,
    thisMonth: 1524.00,
    lastMonth: 1380.25,
    pendingPayout: 847.50,
    nextPayoutDate: "Jan 15, 2025",
    royaltyRate: 3.5,
    totalOrders: 342,
    monthlyOrders: 38,
  };

  const partnerName = partnerInfo?.name || "Partner";

  // Welcome modal content personalized for Sarah and Sid
  const getWelcomeContent = () => {
    if (partnerName === "Sarah") {
      return {
        greeting: "Hey Sarah!",
        intro: "It's Jason. Thanks for taking a look at Brew & Board Coffee! v1.2.8 just dropped with our 7-Phase UX Enhancement Suite:",
        improvements: [
          "Welcome Wizard & Guided Tour - First-time user onboarding experience",
          "Quick Reorder & Favorites - One-tap repeat orders, save vendors/items",
          "AI Recommendations - Context-aware meeting suggestions",
          "Order Tracking Timeline - Real-time status with driver info & ETA",
          "Team Management - Company accounts with role-based access",
          "Loyalty Program - Points, tiers (bronze→platinum), referral codes",
          "Calendar Integration - Google/Outlook sync with auto-suggestions"
        ],
        overview: "This B2B platform connects Nashville businesses with local coffee shops for pre-meeting catering. Now featuring live operations management, blockchain verification on Solana, subscription tiers ($29-$199), and franchise opportunities.",
        closing: "Check out the new dashboard widgets after signing in! You're in Preview Mode so nothing saves to the live system."
      };
    } else if (partnerName === "Sid" || partnerName === "Sidonie") {
      return {
        greeting: "Hey Sidonie!",
        intro: "Welcome to your Partner Hub! As my partner, you have full access to everything including:",
        improvements: [
          "Royalty Tracker - Track your earnings, pending payouts, and monthly stats",
          "Operations Center - Live order board with real-time status tracking",
          "Developer Hub - Full system access, settings, and controls",
          "Analytics Dashboard - Complete business intelligence and metrics",
          "Regional Management - Multi-region coordination and oversight",
          "All Platform Features - Order scheduling, CRM, blockchain verification",
          "Admin Controls - Full administrative capabilities"
        ],
        overview: "This is the B2B coffee platform we've been building together. Your Partner Hub is your central command for managing royalties, accessing all admin tools, and monitoring the business.",
        closing: "This is your dashboard - you have full access to everything. Let me know if you need anything!"
      };
    }
    return {
      greeting: `Hey ${partnerName}!`,
      intro: "Welcome to Brew & Board Coffee v1.2.8!",
      improvements: [
        "Welcome wizard & guided tour for new users",
        "Quick reorder, favorites, and order templates",
        "AI recommendations & order tracking timeline",
        "Team management & loyalty rewards program",
        "Calendar integration for meeting sync"
      ],
      overview: "A B2B coffee catering platform for Nashville businesses with blockchain verification and subscription tiers.",
      closing: "Explore freely in Preview Mode - nothing saves to the live system."
    };
  };

  const welcomeContent = getWelcomeContent();

  return (
    <div className="min-h-screen mobile-safe-scroll" style={{ background: 'linear-gradient(135deg, #1a0f09 0%, #2d1810 50%, #3d2418 100%)' }}>
      {/* Preview Mode Banner */}
      {isPreviewMode && (
        <motion.div 
          initial={{ y: -50 }}
          animate={{ y: 0 }}
          className="bg-gradient-to-r from-amber-500 via-amber-400 to-amber-500 text-amber-950 px-4 py-2 text-center text-sm font-medium flex items-center justify-center gap-2"
        >
          <Eye className="h-4 w-4" />
          <span>Preview Mode</span>
          <span className="hidden sm:inline">- Data will not be saved</span>
        </motion.div>
      )}

      {/* Welcome Modal - Premium Styled */}
      <Dialog open={showWelcomeModal && !showPinChangeModal} onOpenChange={setShowWelcomeModal}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto bg-gradient-to-br from-amber-50 to-orange-50 border-amber-200">
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            {[...Array(8)].map((_, i) => (
              <motion.div
                key={i}
                className="absolute text-amber-300"
                style={{
                  left: `${10 + Math.random() * 80}%`,
                  top: `${10 + Math.random() * 80}%`,
                }}
                animate={{
                  opacity: [0, 1, 0],
                  scale: [0.5, 1, 0.5],
                  rotate: [0, 180, 360],
                }}
                transition={{
                  duration: 3 + Math.random() * 2,
                  delay: Math.random() * 2,
                  repeat: Infinity,
                }}
              >
                <Sparkles className="h-4 w-4" />
              </motion.div>
            ))}
          </div>
          
          <DialogHeader className="relative">
            <DialogTitle className="text-2xl font-serif text-amber-900 flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center shadow-lg">
                <Coffee className="h-5 w-5 text-white" />
              </div>
              {welcomeContent.greeting}
            </DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4 text-sm relative">
            <p className="text-gray-700">{welcomeContent.intro}</p>
            
            <div className="bg-gradient-to-r from-emerald-50 to-green-50 border border-emerald-200 rounded-xl p-4 shadow-sm">
              <h4 className="font-semibold text-emerald-800 mb-2 flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4" />
                Recent Improvements
              </h4>
              <ul className="space-y-2 text-emerald-700">
                {welcomeContent.improvements.map((item, i) => (
                  <motion.li 
                    key={i} 
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.1 * i }}
                    className="flex items-start gap-2"
                  >
                    <Star className="h-3 w-3 text-emerald-500 mt-1 flex-shrink-0" />
                    {item}
                  </motion.li>
                ))}
              </ul>
            </div>
            
            <div className="bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 rounded-xl p-4 shadow-sm">
              <h4 className="font-semibold text-amber-800 mb-2 flex items-center gap-2">
                <Zap className="h-4 w-4" />
                What This Platform Does
              </h4>
              <p className="text-amber-700">{welcomeContent.overview}</p>
            </div>
            
            <p className="text-gray-600 italic text-center">{welcomeContent.closing}</p>
            
            <Button 
              onClick={handleDismissWelcome}
              className="w-full bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700 shadow-lg"
              data-testid="button-enter-dashboard"
            >
              <span>Enter My Dashboard</span>
              <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* PIN Change Modal - Premium Styled */}
      <Dialog open={showPinChangeModal} onOpenChange={() => {}}>
        <DialogContent className="max-w-md bg-gradient-to-br from-slate-50 to-gray-100 border-amber-200" onPointerDownOutside={(e) => e.preventDefault()}>
          <DialogHeader>
            <DialogTitle className="text-xl font-serif text-amber-900 flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center shadow-lg">
                <Lock className="h-5 w-5 text-white" />
              </div>
              Set Your Personal PIN
            </DialogTitle>
            <DialogDescription>
              Welcome, {partnerName}! Please create a 4-digit PIN that you'll use to log in from now on.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium text-gray-700">New 4-Digit PIN</label>
              <Input
                type="password"
                maxLength={4}
                value={newPin}
                onChange={(e) => setNewPin(e.target.value.replace(/\D/g, ''))}
                placeholder="••••"
                className="text-center text-2xl tracking-widest mt-1 border-amber-200 focus:ring-amber-500"
                data-testid="input-new-pin"
              />
            </div>
            
            <div>
              <label className="text-sm font-medium text-gray-700">Confirm PIN</label>
              <Input
                type="password"
                maxLength={4}
                value={confirmPin}
                onChange={(e) => setConfirmPin(e.target.value.replace(/\D/g, ''))}
                placeholder="••••"
                className="text-center text-2xl tracking-widest mt-1 border-amber-200 focus:ring-amber-500"
                data-testid="input-confirm-pin"
              />
            </div>
            
            {pinError && (
              <motion.p 
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-red-600 text-sm flex items-center gap-2 bg-red-50 p-2 rounded-lg"
              >
                <AlertTriangle className="h-4 w-4" />
                {pinError}
              </motion.p>
            )}
            
            <Button 
              onClick={handlePinChange}
              className="w-full bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700"
              disabled={newPin.length !== 4 || confirmPin.length !== 4}
              data-testid="button-set-pin"
            >
              Set My PIN
            </Button>
            
            <p className="text-xs text-gray-500 text-center">
              Your initial PIN ({partnerName === "Sarah" ? "5555" : "4444"}) will be deactivated after this.
            </p>
          </div>
        </DialogContent>
      </Dialog>

      {/* Floating Particles */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        {[...Array(20)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-1 h-1 bg-amber-400/40 rounded-full"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
            }}
            animate={{
              opacity: [0, 1, 0],
              scale: [0, 1.5, 0],
              y: [0, -50, -100],
            }}
            transition={{
              duration: 3 + Math.random() * 3,
              delay: Math.random() * 5,
              repeat: Infinity,
            }}
          />
        ))}
      </div>

      <div className="relative z-10 container max-w-7xl mx-auto px-4 py-6 mobile-p-safe">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 gap-4"
        >
          <div className="flex items-center gap-4">
            <div className="h-14 w-14 rounded-2xl flex items-center justify-center shadow-lg gold-shimmer" style={{ background: 'linear-gradient(135deg, #5c4033 0%, #3d2418 100%)' }}>
              <Coffee className="h-7 w-7 text-amber-200" />
            </div>
            <div>
              <h1 className="font-serif text-2xl sm:text-3xl text-white font-bold">Partner Hub</h1>
              <p className="text-amber-200/70 text-sm flex items-center gap-2">
                Hey {partnerName} 
                <Sparkles className="h-3 w-3 text-amber-400" />
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            {isPreviewMode && (
              <Badge className="bg-amber-500/20 text-amber-300 border-amber-500/30 badge-glow">
                <Eye className="h-3 w-3 mr-1" />
                Preview
              </Badge>
            )}
            {sandboxMode && (
              <Badge className="bg-purple-500/20 text-purple-300 border-purple-500/30">
                <FlaskConical className="h-3 w-3 mr-1" />
                Sandbox
              </Badge>
            )}
            <Button
              variant="outline"
              size="sm"
              onClick={handleLogout}
              className="border-amber-700/50 text-amber-200 hover:bg-amber-900/30"
              data-testid="button-logout"
            >
              <LogOut className="h-4 w-4 sm:mr-2" />
              <span className="hidden sm:inline">Logout</span>
            </Button>
          </div>
        </motion.div>

        {/* Bento Grid Layout */}
        <div className="bento-grid">
          {/* Hero Welcome Card - Full Width */}
          <BentoCard span={12} variant="3d" className="gold-shimmer">
            <div className="flex flex-col md:flex-row items-center justify-between gap-4">
              <div>
                <h2 className="text-xl sm:text-2xl font-serif text-white mb-2">
                  Welcome to Your Dashboard
                </h2>
                <p className="text-amber-200/70 text-sm max-w-xl">
                  Manage orders, track vendors, and grow your Nashville coffee business all from one place.
                </p>
              </div>
              <div className="flex gap-2">
                <Button
                  onClick={toggleSandbox}
                  className="btn-glass-dark"
                  data-testid="button-toggle-sandbox"
                >
                  <FlaskConical className="h-4 w-4 mr-2" />
                  {sandboxMode ? "Exit Sandbox" : "Sandbox Mode"}
                </Button>
              </div>
            </div>
          </BentoCard>

          {/* Stats Cards - 4 columns on desktop */}
          {quickStats.map((stat, index) => (
            <BentoCard key={stat.label} span={3} variant="glow">
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.1 * index }}
              >
                <div className="flex items-center justify-between mb-3">
                  <div className={`p-2 rounded-lg bg-gradient-to-br from-amber-900/50 to-amber-800/30`}>
                    <stat.icon className={`h-5 w-5 ${stat.color}`} />
                  </div>
                  <span className="text-xs text-emerald-400 font-medium">{stat.trend}</span>
                </div>
                <p className="text-2xl sm:text-3xl font-bold text-white">{stat.value}</p>
                <p className="text-xs text-amber-200/60 mt-1">{stat.label}</p>
              </motion.div>
            </BentoCard>
          ))}

          {/* Royalty Tracker - 6 columns */}
          <BentoCard span={6} variant="glass" className="overflow-visible">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-lg bg-gradient-to-br from-emerald-500/30 to-green-600/30">
                  <PiggyBank className="h-5 w-5 text-emerald-400" />
                </div>
                <h3 className="font-semibold text-white">Royalty Tracker</h3>
              </div>
              <Badge className="bg-emerald-500/20 text-emerald-300 border-emerald-500/30">
                {royaltyData.royaltyRate}% Rate
              </Badge>
            </div>
            <div className="grid grid-cols-2 gap-3 mb-4">
              <motion.div 
                whileHover={{ scale: 1.02 }}
                className="p-3 rounded-xl bg-gradient-to-br from-emerald-900/40 to-green-800/30 border border-emerald-600/20"
              >
                <div className="flex items-center gap-2 mb-1">
                  <Wallet className="h-4 w-4 text-emerald-400" />
                  <span className="text-xs text-emerald-300/70">Total Earned</span>
                </div>
                <p className="text-xl font-bold text-white">${royaltyData.totalEarned.toLocaleString()}</p>
              </motion.div>
              <motion.div 
                whileHover={{ scale: 1.02 }}
                className="p-3 rounded-xl bg-gradient-to-br from-amber-900/40 to-orange-800/30 border border-amber-600/20"
              >
                <div className="flex items-center gap-2 mb-1">
                  <DollarSign className="h-4 w-4 text-amber-400" />
                  <span className="text-xs text-amber-300/70">Pending</span>
                </div>
                <p className="text-xl font-bold text-white">${royaltyData.pendingPayout.toLocaleString()}</p>
              </motion.div>
            </div>
            <div className="flex items-center justify-between p-2 rounded-lg bg-amber-900/20 border border-amber-700/20">
              <div className="flex items-center gap-2">
                <Receipt className="h-4 w-4 text-amber-400" />
                <span className="text-xs text-amber-200/70">Next Payout</span>
              </div>
              <span className="text-sm font-medium text-amber-200">{royaltyData.nextPayoutDate}</span>
            </div>
            <Accordion type="single" collapsible className="mt-3">
              <AccordionItem value="details" className="border-none">
                <AccordionTrigger className="py-2 hover:no-underline text-amber-200/70 text-xs">
                  View Monthly Details
                </AccordionTrigger>
                <AccordionContent className="pt-2">
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between items-center">
                      <span className="text-amber-200/60">This Month</span>
                      <span className="text-emerald-400 font-medium">${royaltyData.thisMonth.toLocaleString()} ({royaltyData.monthlyOrders} orders)</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-amber-200/60">Last Month</span>
                      <span className="text-white">${royaltyData.lastMonth.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-amber-200/60">All Time</span>
                      <span className="text-white">{royaltyData.totalOrders} orders</span>
                    </div>
                  </div>
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </BentoCard>

          {/* Admin Controls - 6 columns */}
          <BentoCard span={6} variant="3d" className="overflow-visible">
            <div className="flex items-center gap-2 mb-4">
              <div className="p-2 rounded-lg bg-gradient-to-br from-purple-500/30 to-indigo-600/30">
                <Settings className="h-5 w-5 text-purple-400" />
              </div>
              <h3 className="font-semibold text-white">Admin Controls</h3>
              <Badge className="bg-purple-500/20 text-purple-300 border-purple-500/30 ml-auto">
                Full Access
              </Badge>
            </div>
            <Carousel label="admin controls">
              <Link href="/operations">
                <motion.div whileHover={{ scale: 1.05, y: -4 }} whileTap={{ scale: 0.98 }} className="flex-shrink-0">
                  <div className="bg-gradient-to-br from-red-500 to-rose-600 p-3 rounded-xl shadow-lg cursor-pointer w-[100px] h-[80px] flex flex-col items-center justify-center gap-1 text-white">
                    <Activity className="h-5 w-5" />
                    <span className="text-xs font-medium text-center">Operations</span>
                  </div>
                </motion.div>
              </Link>
              <Link href="/developers">
                <motion.div whileHover={{ scale: 1.05, y: -4 }} whileTap={{ scale: 0.98 }} className="flex-shrink-0">
                  <div className="bg-gradient-to-br from-purple-500 to-indigo-600 p-3 rounded-xl shadow-lg cursor-pointer w-[100px] h-[80px] flex flex-col items-center justify-center gap-1 text-white">
                    <Database className="h-5 w-5" />
                    <span className="text-xs font-medium text-center">Dev Hub</span>
                  </div>
                </motion.div>
              </Link>
              <Link href="/analytics">
                <motion.div whileHover={{ scale: 1.05, y: -4 }} whileTap={{ scale: 0.98 }} className="flex-shrink-0">
                  <div className="bg-gradient-to-br from-blue-500 to-cyan-600 p-3 rounded-xl shadow-lg cursor-pointer w-[100px] h-[80px] flex flex-col items-center justify-center gap-1 text-white">
                    <BarChart3 className="h-5 w-5" />
                    <span className="text-xs font-medium text-center">Analytics</span>
                  </div>
                </motion.div>
              </Link>
              <Link href="/regional">
                <motion.div whileHover={{ scale: 1.05, y: -4 }} whileTap={{ scale: 0.98 }} className="flex-shrink-0">
                  <div className="bg-gradient-to-br from-emerald-500 to-green-600 p-3 rounded-xl shadow-lg cursor-pointer w-[100px] h-[80px] flex flex-col items-center justify-center gap-1 text-white">
                    <MapPin className="h-5 w-5" />
                    <span className="text-xs font-medium text-center">Regions</span>
                  </div>
                </motion.div>
              </Link>
            </Carousel>
          </BentoCard>

          {/* Quick Actions Carousel - 12 columns (full width) */}
          <BentoCard span={12} variant="default" className="overflow-visible">
            <div className="flex items-center gap-2 mb-4">
              <Play className="h-5 w-5 text-amber-400" />
              <h3 className="font-semibold text-white">Quick Actions</h3>
            </div>
            <Carousel label="quick actions">
              {quickActions.map((action) => (
                <Link key={action.label} href={action.href}>
                  <motion.div
                    whileHover={{ scale: 1.05, y: -4 }}
                    whileTap={{ scale: 0.98 }}
                    className="flex-shrink-0"
                    role="listitem"
                    data-testid={`action-${action.label.toLowerCase().replace(' ', '-')}`}
                  >
                    <div className={`bg-gradient-to-br ${action.color} p-3 sm:p-4 rounded-xl shadow-lg cursor-pointer w-[110px] sm:w-[130px] h-[85px] sm:h-[95px] flex flex-col items-center justify-center gap-1.5 sm:gap-2 text-white`}>
                      <action.icon className="h-5 w-5 sm:h-6 sm:w-6" />
                      <span className="text-xs sm:text-sm font-medium text-center leading-tight">{action.label}</span>
                    </div>
                  </motion.div>
                </Link>
              ))}
            </Carousel>
          </BentoCard>


          {/* Platform Features - 6 columns */}
          <BentoCard span={6} variant="default">
            <Accordion type="single" collapsible>
              <AccordionItem value="features" className="border-none">
                <AccordionTrigger className="py-0 hover:no-underline">
                  <div className="flex items-center gap-2">
                    <Sparkles className="h-5 w-5 text-amber-400" />
                    <span className="font-semibold text-white">Platform Features</span>
                  </div>
                </AccordionTrigger>
                <AccordionContent className="pt-4">
                  <div className="grid grid-cols-2 gap-3">
                    {platformFeatures.map((feature, i) => (
                      <motion.div
                        key={feature.title}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.05 * i }}
                        className="p-3 rounded-lg bg-amber-900/30 border border-amber-700/20"
                      >
                        <feature.icon className="h-4 w-4 text-amber-400 mb-2" />
                        <p className="text-sm text-white font-medium">{feature.title}</p>
                        <p className="text-xs text-amber-200/60">{feature.desc}</p>
                      </motion.div>
                    ))}
                  </div>
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </BentoCard>

          {/* Bug Reports - 6 columns */}
          <BentoCard span={6} variant="default">
            <Accordion type="single" collapsible>
              <AccordionItem value="bugs" className="border-none">
                <AccordionTrigger className="py-0 hover:no-underline">
                  <div className="flex items-center gap-2">
                    <Bug className="h-5 w-5 text-amber-400" />
                    <span className="font-semibold text-white">Bug Reports</span>
                    {errorReports.length > 0 && (
                      <Badge className="bg-rose-500/20 text-rose-300 border-rose-500/30 ml-2">
                        {errorReports.length}
                      </Badge>
                    )}
                  </div>
                </AccordionTrigger>
                <AccordionContent className="pt-4">
                  {loadingReports ? (
                    <div className="text-center py-4 text-amber-200/60">Loading reports...</div>
                  ) : errorReports.length === 0 ? (
                    <div className="text-center py-4">
                      <CheckCircle2 className="h-8 w-8 mx-auto mb-2 text-emerald-400" />
                      <p className="text-amber-200/60 text-sm">No bug reports - everything is running smoothly!</p>
                    </div>
                  ) : (
                    <Carousel label="bug reports">
                      {errorReports.slice(0, 8).map((report) => (
                        <div 
                          key={report.id}
                          className="flex-shrink-0 w-[180px] sm:w-[200px]"
                          role="listitem"
                        >
                          <div className="p-3 rounded-lg bg-amber-900/30 border border-amber-700/20 h-full">
                            <div className="flex items-center justify-between mb-2 gap-2">
                              <span className="font-medium text-amber-200 text-xs sm:text-sm truncate flex-1">{report.title}</span>
                              <Badge 
                                className={`text-xs flex-shrink-0 ${
                                  report.status === 'resolved' 
                                    ? 'bg-emerald-500/20 text-emerald-300' 
                                    : report.severity === 'critical'
                                    ? 'bg-rose-500/20 text-rose-300'
                                    : 'bg-amber-500/20 text-amber-300'
                                }`}
                              >
                                {report.status}
                              </Badge>
                            </div>
                            <p className="text-xs text-amber-200/50">{report.category}</p>
                            <p className="text-xs text-amber-200/40 mt-1">{new Date(report.createdAt).toLocaleDateString()}</p>
                          </div>
                        </div>
                      ))}
                    </Carousel>
                  )}
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </BentoCard>
        </div>

        {/* Back Button */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="mt-8 text-center"
        >
          <Link href="/">
            <Button variant="ghost" className="text-amber-200/60 hover:text-amber-200 hover:bg-amber-900/30" data-testid="button-back-home">
              ← Back to Home
            </Button>
          </Link>
        </motion.div>
      </div>
    </div>
  );
}

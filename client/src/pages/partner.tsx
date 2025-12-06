import { useState, useEffect } from "react";
import { Link, useLocation } from "wouter";
import { motion } from "framer-motion";
import { 
  LayoutDashboard, 
  ShoppingCart, 
  Store, 
  Users, 
  BarChart3, 
  Settings, 
  Play,
  FlaskConical,
  ChevronRight,
  Coffee,
  MapPin,
  Calendar,
  FileText,
  Shield,
  Sparkles,
  LogOut,
  Eye,
  Bell,
  TrendingUp,
  Package,
  Clock
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";

export default function PartnerHub() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [sandboxMode, setSandboxMode] = useState(() => {
    return localStorage.getItem("sandbox_mode") === "true";
  });

  useEffect(() => {
    const saved = localStorage.getItem("sandbox_mode");
    if (saved === "true") {
      setSandboxMode(true);
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("coffee_user");
    localStorage.removeItem("coffee_partner_auth");
    localStorage.removeItem("user_name");
    localStorage.removeItem("coffee_session_expiry");
    toast({
      title: "Logged Out",
      description: "See you soon, Sarah!",
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

  const navigationCards = [
    {
      id: "live-app",
      title: "Live Customer App",
      description: "See the platform as customers experience it",
      icon: Play,
      href: "/dashboard",
      gradient: "from-emerald-600 to-emerald-800",
      badge: "Live",
      badgeColor: "bg-emerald-500"
    },
    {
      id: "sandbox",
      title: "Sandbox Mode",
      description: "Test features safely with demo data",
      icon: FlaskConical,
      onClick: toggleSandbox,
      gradient: "from-purple-600 to-purple-800",
      badge: sandboxMode ? "Active" : "Off",
      badgeColor: sandboxMode ? "bg-purple-500" : "bg-gray-500"
    },
    {
      id: "orders",
      title: "Orders Dashboard",
      description: "View and manage all customer orders",
      icon: ShoppingCart,
      href: "/admin",
      gradient: "from-blue-600 to-blue-800",
      stats: "View Orders"
    },
    {
      id: "vendors",
      title: "Vendor Management",
      description: "Coffee shops, bakeries & more",
      icon: Store,
      href: "/vendors",
      gradient: "from-amber-600 to-amber-800",
      stats: "37+ Vendors"
    },
    {
      id: "regional",
      title: "Regional Managers",
      description: "Territory assignments & performance",
      icon: MapPin,
      href: "/regional",
      gradient: "from-rose-600 to-rose-800",
      stats: "Nashville Metro"
    },
    {
      id: "analytics",
      title: "Business Analytics",
      description: "Revenue, trends & insights",
      icon: BarChart3,
      href: "/developers",
      gradient: "from-indigo-600 to-indigo-800",
      stats: "View Reports"
    },
    {
      id: "portfolio",
      title: "CRM & Portfolio",
      description: "Contacts, notes & documents",
      icon: FileText,
      href: "/portfolio",
      gradient: "from-teal-600 to-teal-800",
      stats: "Digital Briefcase"
    },
    {
      id: "blockchain",
      title: "Blockchain Hallmarks",
      description: "Document verification system",
      icon: Shield,
      href: "/blockchain-tutorial",
      gradient: "from-cyan-600 to-cyan-800",
      stats: "Solana Verified"
    }
  ];

  const quickStats = [
    { label: "Active Orders", value: "12", icon: Package, trend: "+3 today" },
    { label: "Vendors Online", value: "37", icon: Store, trend: "All active" },
    { label: "This Week Revenue", value: "$2,847", icon: TrendingUp, trend: "+18%" },
    { label: "Avg Delivery Time", value: "1.8h", icon: Clock, trend: "On target" },
  ];

  return (
    <div className="min-h-screen" style={{ background: 'linear-gradient(135deg, #1a0f09 0%, #2d1810 50%, #3d2418 100%)' }}>
      <div className="absolute inset-0">
        {[...Array(15)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-1 h-1 bg-amber-300/30 rounded-full"
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

      <div className="relative z-10 container max-w-6xl mx-auto px-4 py-8">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between mb-8"
        >
          <div className="flex items-center gap-4">
            <div className="h-14 w-14 rounded-full flex items-center justify-center shadow-lg" style={{ background: 'linear-gradient(135deg, #5c4033 0%, #3d2418 100%)' }}>
              <Coffee className="h-7 w-7 text-amber-200" />
            </div>
            <div>
              <h1 className="font-serif text-3xl text-white font-bold">Partner Hub</h1>
              <p className="text-amber-200/70 text-sm">Welcome back, Sarah</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {sandboxMode && (
              <Badge className="bg-purple-500/20 text-purple-300 border-purple-500/30">
                <FlaskConical className="h-3 w-3 mr-1" />
                Sandbox Active
              </Badge>
            )}
            <Button
              variant="outline"
              size="sm"
              onClick={handleLogout}
              className="border-amber-700/50 text-amber-200 hover:bg-amber-900/30"
              data-testid="button-logout"
            >
              <LogOut className="h-4 w-4 mr-2" />
              Logout
            </Button>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8"
        >
          {quickStats.map((stat, index) => (
            <div
              key={stat.label}
              className="bg-white/5 backdrop-blur-sm rounded-xl p-4 border border-amber-900/30"
            >
              <div className="flex items-center gap-2 mb-2">
                <stat.icon className="h-4 w-4 text-amber-400" />
                <span className="text-amber-200/70 text-xs">{stat.label}</span>
              </div>
              <div className="text-2xl font-bold text-white">{stat.value}</div>
              <div className="text-xs text-emerald-400">{stat.trend}</div>
            </div>
          ))}
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="mb-6"
        >
          <h2 className="text-amber-200/70 text-sm font-medium uppercase tracking-wider mb-4 flex items-center gap-2">
            <LayoutDashboard className="h-4 w-4" />
            Navigation
          </h2>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {navigationCards.map((card, index) => {
            const CardWrapper = card.href ? Link : 'div';
            const cardProps = card.href ? { href: card.href } : { onClick: card.onClick };
            
            return (
              <motion.div
                key={card.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 + index * 0.05 }}
              >
                {card.href ? (
                  <Link href={card.href}>
                    <div
                      className={`group relative overflow-hidden rounded-2xl p-5 cursor-pointer transition-all duration-300 hover:scale-[1.02] hover:shadow-xl bg-gradient-to-br ${card.gradient}`}
                      data-testid={`card-${card.id}`}
                    >
                      <div className="absolute inset-0 bg-white/0 group-hover:bg-white/5 transition-colors" />
                      
                      <div className="relative z-10">
                        <div className="flex items-start justify-between mb-3">
                          <div className="p-2 bg-white/20 rounded-lg">
                            <card.icon className="h-5 w-5 text-white" />
                          </div>
                          {card.badge && (
                            <Badge className={`${card.badgeColor} text-white text-[10px]`}>
                              {card.badge}
                            </Badge>
                          )}
                        </div>
                        
                        <h3 className="text-white font-semibold mb-1">{card.title}</h3>
                        <p className="text-white/70 text-xs mb-3">{card.description}</p>
                        
                        <div className="flex items-center justify-between">
                          {card.stats && (
                            <span className="text-white/60 text-xs">{card.stats}</span>
                          )}
                          <ChevronRight className="h-4 w-4 text-white/50 group-hover:text-white group-hover:translate-x-1 transition-all" />
                        </div>
                      </div>
                    </div>
                  </Link>
                ) : (
                  <div
                    onClick={card.onClick}
                    className={`group relative overflow-hidden rounded-2xl p-5 cursor-pointer transition-all duration-300 hover:scale-[1.02] hover:shadow-xl bg-gradient-to-br ${card.gradient}`}
                    data-testid={`card-${card.id}`}
                  >
                    <div className="absolute inset-0 bg-white/0 group-hover:bg-white/5 transition-colors" />
                    
                    <div className="relative z-10">
                      <div className="flex items-start justify-between mb-3">
                        <div className="p-2 bg-white/20 rounded-lg">
                          <card.icon className="h-5 w-5 text-white" />
                        </div>
                        {card.badge && (
                          <Badge className={`${card.badgeColor} text-white text-[10px]`}>
                            {card.badge}
                          </Badge>
                        )}
                      </div>
                      
                      <h3 className="text-white font-semibold mb-1">{card.title}</h3>
                      <p className="text-white/70 text-xs mb-3">{card.description}</p>
                      
                      <div className="flex items-center justify-between">
                        {card.stats && (
                          <span className="text-white/60 text-xs">{card.stats}</span>
                        )}
                        <ChevronRight className="h-4 w-4 text-white/50 group-hover:text-white group-hover:translate-x-1 transition-all" />
                      </div>
                    </div>
                  </div>
                )}
              </motion.div>
            );
          })}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="mt-8 bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-amber-900/30"
        >
          <div className="flex items-center gap-3 mb-4">
            <Sparkles className="h-5 w-5 text-amber-400" />
            <h3 className="text-white font-semibold">System Overview</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            <div className="flex items-center gap-3 p-3 bg-white/5 rounded-lg">
              <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
              <span className="text-amber-200/70">Customer App</span>
              <span className="text-emerald-400 ml-auto">Online</span>
            </div>
            <div className="flex items-center gap-3 p-3 bg-white/5 rounded-lg">
              <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
              <span className="text-amber-200/70">Payment System</span>
              <span className="text-emerald-400 ml-auto">Stripe Active</span>
            </div>
            <div className="flex items-center gap-3 p-3 bg-white/5 rounded-lg">
              <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
              <span className="text-amber-200/70">Blockchain</span>
              <span className="text-emerald-400 ml-auto">Solana Mainnet</span>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="mt-6 text-center text-amber-200/40 text-xs"
        >
          Brew & Board Coffee Partner Portal v1.1.8
        </motion.div>
      </div>
    </div>
  );
}

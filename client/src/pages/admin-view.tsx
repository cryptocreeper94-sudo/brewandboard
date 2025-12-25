import { useState, useEffect } from "react";
import { useLocation, Link } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import {
  Package,
  Store,
  TrendingUp,
  Clock,
  Calendar,
  Users,
  Shield,
  BarChart3,
  MapPin,
  Coffee,
  Sparkles,
  ArrowRight,
  Lock,
  Eye,
  CheckCircle2,
  Globe,
  Layers,
  Database,
  Zap,
  Settings,
  FileText,
  CreditCard,
  X,
  ChevronRight,
  Building2,
  Truck,
  Star,
  Target,
  Rocket
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";

export default function AdminView() {
  const [, setLocation] = useLocation();
  const [showWelcomeModal, setShowWelcomeModal] = useState(false);
  const [showPinChangeModal, setShowPinChangeModal] = useState(false);
  const [newPin, setNewPin] = useState("");
  const [confirmPin, setConfirmPin] = useState("");
  const [pinError, setPinError] = useState("");
  const [userName, setUserName] = useState("Ryan");

  useEffect(() => {
    const userData = localStorage.getItem("coffee_user");
    if (userData) {
      const user = JSON.parse(userData);
      setUserName(user.name || "Ryan");
      
      if (!localStorage.getItem("ryan_pin_changed")) {
        setShowPinChangeModal(true);
      } else if (localStorage.getItem("ryan_show_welcome")) {
        setShowWelcomeModal(true);
      }
    }
  }, []);

  const handlePinChange = () => {
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
    
    if (["0424", "7777", "1234", "0000"].includes(newPin)) {
      setPinError("Please choose a more secure PIN");
      return;
    }
    
    localStorage.setItem("ryan_pin_changed", "true");
    localStorage.setItem("ryan_personal_pin", newPin);
    setShowPinChangeModal(false);
    setShowWelcomeModal(true);
  };

  const handleDismissWelcome = () => {
    localStorage.setItem("ryan_welcomed", "true");
    localStorage.removeItem("ryan_show_welcome");
    setShowWelcomeModal(false);
  };

  const adminTools = [
    { 
      title: "Operations Center", 
      desc: "Live order board with real-time status tracking", 
      icon: Package, 
      href: "/operations",
      color: "from-red-500 to-rose-600"
    },
    { 
      title: "Order Scheduling", 
      desc: "Calendar-based ordering system", 
      icon: Calendar, 
      href: "/schedule",
      color: "from-amber-500 to-orange-600"
    },
    { 
      title: "Vendor Catalog", 
      desc: "37+ Nashville coffee shops & vendors", 
      icon: Store, 
      href: "/vendors",
      color: "from-emerald-500 to-green-600"
    },
    { 
      title: "Developer Hub", 
      desc: "API keys, blockchain verification, analytics", 
      icon: Shield, 
      href: "/developers",
      color: "from-purple-500 to-violet-600"
    },
    { 
      title: "Virtual Host", 
      desc: "Multi-site meeting coordination", 
      icon: Users, 
      href: "/virtual-host",
      color: "from-blue-500 to-indigo-600"
    },
    { 
      title: "Regional Manager", 
      desc: "Territory management & analytics", 
      icon: MapPin, 
      href: "/regional",
      color: "from-cyan-500 to-teal-600"
    },
    { 
      title: "Document Scanner", 
      desc: "OCR scanning with PDF export", 
      icon: FileText, 
      href: "/scan",
      color: "from-pink-500 to-rose-600"
    },
    { 
      title: "Presentations", 
      desc: "Meeting slideshow builder", 
      icon: BarChart3, 
      href: "/meeting-presentations",
      color: "from-slate-500 to-zinc-600"
    },
  ];

  const systemCapabilities = [
    { icon: Globe, title: "Multi-Region Ready", desc: "Deploy anywhere in the US" },
    { icon: Layers, title: "White-Label Franchise", desc: "Full brand customization" },
    { icon: Database, title: "54 Database Tables", desc: "Enterprise-grade data model" },
    { icon: Shield, title: "Blockchain Verified", desc: "Solana mainnet hallmarks" },
    { icon: CreditCard, title: "Stripe Integration", desc: "Subscriptions & one-time" },
    { icon: Truck, title: "Delivery Partners", desc: "DoorDash & Uber Direct ready" },
    { icon: Users, title: "Team Management", desc: "Roles & spending limits" },
    { icon: Star, title: "Loyalty Program", desc: "Points, tiers, referrals" },
  ];

  return (
    <div className="min-h-screen" style={{ background: 'linear-gradient(135deg, #1a0f09 0%, #2d1810 50%, #3d2418 100%)' }}>
      {/* View Only Banner */}
      <motion.div 
        initial={{ y: -50 }}
        animate={{ y: 0 }}
        className="bg-gradient-to-r from-blue-600 via-blue-500 to-blue-600 text-white px-4 py-2 text-center text-sm font-medium flex items-center justify-center gap-2"
      >
        <Eye className="h-4 w-4" />
        <span>Admin View Mode</span>
        <span className="hidden sm:inline">- Full visibility, view-only access</span>
      </motion.div>

      {/* Welcome Modal - Premium Full System Overview */}
      <Dialog open={showWelcomeModal && !showPinChangeModal} onOpenChange={setShowWelcomeModal}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 border-amber-500/30 text-white">
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            {[...Array(12)].map((_, i) => (
              <motion.div
                key={i}
                className="absolute text-amber-400/30"
                style={{
                  left: `${5 + Math.random() * 90}%`,
                  top: `${5 + Math.random() * 90}%`,
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
            <DialogTitle className="text-3xl font-serif text-amber-400 flex items-center gap-3">
              <div className="h-12 w-12 rounded-full bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center shadow-lg shadow-amber-500/30">
                <Coffee className="h-6 w-6 text-white" />
              </div>
              Welcome to Brew & Board, {userName}!
            </DialogTitle>
          </DialogHeader>
          
          <div className="space-y-6 text-sm relative">
            <p className="text-gray-300 text-base leading-relaxed">
              You're looking at a <span className="text-amber-400 font-semibold">complete B2B coffee and catering platform</span> built 
              for scale. This isn't just a Nashville app — it's a franchise-ready system that can deploy 
              anywhere in the country with full white-label customization.
            </p>
            
            {/* System Architecture */}
            <div className="bg-gradient-to-r from-amber-900/30 to-orange-900/30 border border-amber-500/30 rounded-xl p-5 shadow-lg">
              <h4 className="font-semibold text-amber-400 mb-4 flex items-center gap-2 text-lg">
                <Rocket className="h-5 w-5" />
                What This Platform Does
              </h4>
              <div className="grid grid-cols-2 gap-3">
                {systemCapabilities.map((cap, i) => (
                  <motion.div 
                    key={i}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.05 * i }}
                    className="flex items-start gap-3 bg-slate-800/50 rounded-lg p-3"
                  >
                    <cap.icon className="h-5 w-5 text-amber-400 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="text-white font-medium text-sm">{cap.title}</p>
                      <p className="text-gray-400 text-xs">{cap.desc}</p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
            
            {/* Expansion Ready */}
            <div className="bg-gradient-to-r from-emerald-900/30 to-green-900/30 border border-emerald-500/30 rounded-xl p-5 shadow-lg">
              <h4 className="font-semibold text-emerald-400 mb-3 flex items-center gap-2 text-lg">
                <Target className="h-5 w-5" />
                Built for National Expansion
              </h4>
              <ul className="space-y-2 text-gray-300">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                  <span>Regional Manager system for territory control</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                  <span>White-label franchise branding per location</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                  <span>Multi-tenant data isolation for franchisees</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                  <span>Subscription tiers: $29 - $199/month</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                  <span>Blockchain verification on Solana mainnet</span>
                </li>
              </ul>
            </div>

            {/* Revenue Model */}
            <div className="bg-gradient-to-r from-purple-900/30 to-violet-900/30 border border-purple-500/30 rounded-xl p-5 shadow-lg">
              <h4 className="font-semibold text-purple-400 mb-3 flex items-center gap-2 text-lg">
                <TrendingUp className="h-5 w-5" />
                Revenue Streams
              </h4>
              <div className="grid grid-cols-2 gap-3 text-gray-300 text-sm">
                <div className="bg-slate-800/50 rounded-lg p-3">
                  <p className="text-purple-400 font-semibold">15% Service Fee</p>
                  <p className="text-xs text-gray-400">On every one-off order</p>
                </div>
                <div className="bg-slate-800/50 rounded-lg p-3">
                  <p className="text-purple-400 font-semibold">Subscriptions</p>
                  <p className="text-xs text-gray-400">Monthly recurring revenue</p>
                </div>
                <div className="bg-slate-800/50 rounded-lg p-3">
                  <p className="text-purple-400 font-semibold">Franchise Fees</p>
                  <p className="text-xs text-gray-400">License + royalties</p>
                </div>
                <div className="bg-slate-800/50 rounded-lg p-3">
                  <p className="text-purple-400 font-semibold">Delivery Margin</p>
                  <p className="text-xs text-gray-400">Distance-based fees</p>
                </div>
              </div>
            </div>
            
            <p className="text-gray-400 italic text-center text-base">
              Explore everything freely. You have full visibility into the entire system.
            </p>
            
            <Button 
              onClick={handleDismissWelcome}
              className="w-full bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700 shadow-lg shadow-amber-500/20 text-lg py-6"
              data-testid="button-enter-admin"
            >
              <span>Explore the Platform</span>
              <ArrowRight className="h-5 w-5 ml-2" />
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* PIN Change Modal */}
      <Dialog open={showPinChangeModal} onOpenChange={() => {}}>
        <DialogContent className="max-w-md bg-gradient-to-br from-slate-900 to-slate-800 border-amber-500/30 text-white" onPointerDownOutside={(e) => e.preventDefault()}>
          <DialogHeader>
            <DialogTitle className="text-xl font-serif text-amber-400 flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center shadow-lg">
                <Lock className="h-5 w-5 text-white" />
              </div>
              Set Your Personal PIN
            </DialogTitle>
            <DialogDescription className="text-gray-400">
              Welcome, {userName}! For security, please create your own 4-digit PIN. You'll use this to log in from now on.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium text-gray-300">New 4-Digit PIN</label>
              <Input
                type="password"
                maxLength={4}
                value={newPin}
                onChange={(e) => setNewPin(e.target.value.replace(/\D/g, ''))}
                placeholder="Enter 4 digits"
                className="mt-1 bg-slate-800 border-slate-600 text-white text-center text-2xl tracking-widest"
                data-testid="input-new-pin"
              />
            </div>
            
            <div>
              <label className="text-sm font-medium text-gray-300">Confirm PIN</label>
              <Input
                type="password"
                maxLength={4}
                value={confirmPin}
                onChange={(e) => setConfirmPin(e.target.value.replace(/\D/g, ''))}
                placeholder="Confirm 4 digits"
                className="mt-1 bg-slate-800 border-slate-600 text-white text-center text-2xl tracking-widest"
                data-testid="input-confirm-pin"
              />
            </div>
            
            {pinError && (
              <p className="text-red-400 text-sm text-center">{pinError}</p>
            )}
            
            <Button 
              onClick={handlePinChange}
              className="w-full bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700"
              data-testid="button-set-pin"
            >
              Set My PIN
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Header */}
      <header className="px-4 py-6 border-b border-amber-900/30">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-full bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center">
              <Coffee className="h-5 w-5 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-serif text-amber-100">Brew & Board</h1>
              <p className="text-xs text-amber-400/70">Admin Dashboard</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Badge variant="outline" className="border-blue-500/50 text-blue-400">
              <Eye className="h-3 w-3 mr-1" />
              View Only
            </Badge>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                localStorage.removeItem("coffee_user");
                localStorage.removeItem("coffee_admin_auth");
                setLocation("/");
              }}
              className="text-gray-400 hover:text-white"
              data-testid="button-logout"
            >
              Logout
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="px-4 py-8 max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h2 className="text-2xl font-serif text-amber-100 mb-2">Welcome back, {userName}</h2>
          <p className="text-gray-400">Explore the full Brew & Board platform below.</p>
        </motion.div>

        {/* Quick Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {[
            { label: "Active Orders", value: "12", icon: Package, color: "text-amber-400" },
            { label: "Vendors", value: "37+", icon: Store, color: "text-emerald-400" },
            { label: "Database Tables", value: "54", icon: Database, color: "text-blue-400" },
            { label: "Regions", value: "Nashville", icon: MapPin, color: "text-purple-400" },
          ].map((stat, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 * i }}
              className="bg-slate-900/50 border border-amber-900/30 rounded-xl p-4"
            >
              <stat.icon className={`h-5 w-5 ${stat.color} mb-2`} />
              <p className="text-2xl font-bold text-white">{stat.value}</p>
              <p className="text-xs text-gray-400">{stat.label}</p>
            </motion.div>
          ))}
        </div>

        {/* Admin Tools Grid */}
        <h3 className="text-lg font-semibold text-amber-100 mb-4">Platform Tools</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {adminTools.map((tool, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.05 * i }}
            >
              <Link href={tool.href}>
                <div className="bg-slate-900/50 border border-amber-900/30 rounded-xl p-5 hover:border-amber-500/50 transition-all cursor-pointer group">
                  <div className={`h-10 w-10 rounded-lg bg-gradient-to-br ${tool.color} flex items-center justify-center mb-3 group-hover:scale-110 transition-transform`}>
                    <tool.icon className="h-5 w-5 text-white" />
                  </div>
                  <h4 className="text-white font-medium mb-1">{tool.title}</h4>
                  <p className="text-gray-400 text-sm">{tool.desc}</p>
                  <div className="flex items-center gap-1 text-amber-400 text-sm mt-3 group-hover:gap-2 transition-all">
                    <span>View</span>
                    <ChevronRight className="h-4 w-4" />
                  </div>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>

        {/* System Overview */}
        <div className="mt-8 bg-gradient-to-r from-amber-900/20 to-orange-900/20 border border-amber-500/20 rounded-xl p-6">
          <h3 className="text-lg font-semibold text-amber-100 mb-4 flex items-center gap-2">
            <Zap className="h-5 w-5 text-amber-400" />
            System Capabilities
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {systemCapabilities.map((cap, i) => (
              <div key={i} className="flex items-center gap-3">
                <cap.icon className="h-5 w-5 text-amber-400" />
                <div>
                  <p className="text-white text-sm font-medium">{cap.title}</p>
                  <p className="text-gray-500 text-xs">{cap.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}

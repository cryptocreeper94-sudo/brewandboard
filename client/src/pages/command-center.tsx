import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { motion } from "framer-motion";
import {
  ArrowLeft, LogOut, Lock, Shield, LayoutGrid, Truck, Users, BarChart3,
  Code, DollarSign, Globe, ShoppingCart, Calendar, MapPin,
  Building, Briefcase, FileText, Scan, Presentation, Video, Coffee,
  Server, Link2, Scale, Eye, UserCheck, Sparkles, Activity, Star
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";

import ccOperations from "@/assets/images/cc-operations.png";
import ccOrders from "@/assets/images/cc-orders.png";
import ccSchedule from "@/assets/images/cc-schedule.png";
import ccAdmin from "@/assets/images/cc-admin.png";
import ccRegional from "@/assets/images/cc-regional.png";
import ccMonitoring from "@/assets/images/cc-monitoring.png";
import ccPartner from "@/assets/images/cc-partner.png";
import ccInvestor from "@/assets/images/cc-investor.png";
import ccPortfolio from "@/assets/images/cc-portfolio.png";
import ccBlockchain from "@/assets/images/cc-blockchain.png";
import ccVendors from "@/assets/images/cc-vendors.png";
import ccVirtualHost from "@/assets/images/cc-virtual-host.png";
import ccPresentations from "@/assets/images/cc-presentations.png";
import ccScanner from "@/assets/images/cc-scanner.png";
import ccDevelopers from "@/assets/images/cc-developers.png";
import ccPricing from "@/assets/images/cc-pricing.png";
import ccFranchise from "@/assets/images/cc-franchise.png";
import ccBaristas from "@/assets/images/cc-baristas.png";
import ccLegal from "@/assets/images/cc-legal.png";
import ccTracking from "@/assets/images/cc-tracking.png";

const glowMap: Record<string, string> = {
  "shadow-orange-500/30": "hover:shadow-[0_0_30px_rgba(249,115,22,0.3)]",
  "shadow-amber-500/20": "hover:shadow-[0_0_25px_rgba(245,158,11,0.2)]",
  "shadow-orange-500/20": "hover:shadow-[0_0_25px_rgba(249,115,22,0.2)]",
  "shadow-yellow-500/20": "hover:shadow-[0_0_25px_rgba(234,179,8,0.2)]",
  "shadow-amber-500/30": "hover:shadow-[0_0_30px_rgba(245,158,11,0.3)]",
  "shadow-purple-500/30": "hover:shadow-[0_0_30px_rgba(168,85,247,0.3)]",
  "shadow-violet-500/20": "hover:shadow-[0_0_25px_rgba(139,92,246,0.2)]",
  "shadow-indigo-500/20": "hover:shadow-[0_0_25px_rgba(99,102,241,0.2)]",
  "shadow-green-500/20": "hover:shadow-[0_0_25px_rgba(34,197,94,0.2)]",
  "shadow-emerald-500/30": "hover:shadow-[0_0_30px_rgba(16,185,129,0.3)]",
  "shadow-teal-500/20": "hover:shadow-[0_0_25px_rgba(20,184,166,0.2)]",
  "shadow-emerald-500/20": "hover:shadow-[0_0_25px_rgba(16,185,129,0.2)]",
  "shadow-rose-500/30": "hover:shadow-[0_0_30px_rgba(244,63,94,0.3)]",
  "shadow-pink-500/20": "hover:shadow-[0_0_25px_rgba(236,72,153,0.2)]",
  "shadow-green-500/30": "hover:shadow-[0_0_30px_rgba(34,197,94,0.3)]",
  "shadow-cyan-500/30": "hover:shadow-[0_0_30px_rgba(6,182,212,0.3)]",
  "shadow-blue-500/20": "hover:shadow-[0_0_25px_rgba(59,130,246,0.2)]",
  "shadow-violet-500/30": "hover:shadow-[0_0_30px_rgba(139,92,246,0.3)]",
  "shadow-slate-500/20": "hover:shadow-[0_0_25px_rgba(100,116,139,0.2)]",
  "shadow-gray-500/20": "hover:shadow-[0_0_25px_rgba(107,114,128,0.2)]",
};

interface LaunchCard {
  label: string;
  description: string;
  href: string;
  icon: React.ReactNode;
  image: string;
  glowColor: string;
  badge?: string;
  featured?: boolean;
}

interface Category {
  title: string;
  icon: React.ReactNode;
  gradient: string;
  description: string;
  cards: LaunchCard[];
}

const categories: Category[] = [
  {
    title: "Operations & Orders",
    icon: <Truck className="size-4" />,
    gradient: "from-orange-500 to-amber-500",
    description: "Live order management, delivery tracking, and day-to-day operational tools. Monitor every order from placement to delivery completion.",
    cards: [
      {
        label: "Operations Center",
        description: "Live order board with real-time status tracking",
        href: "/operations",
        icon: <Activity className="size-5" />,
        image: ccOperations,
        glowColor: "shadow-orange-500/30",
        badge: "Live",
        featured: true,
      },
      {
        label: "Order Scheduling",
        description: "Calendar-based order management and scheduling",
        href: "/schedule",
        icon: <Calendar className="size-5" />,
        image: ccSchedule,
        glowColor: "shadow-amber-500/20",
      },
      {
        label: "One-Off Orders",
        description: "Place single catering orders for meetings",
        href: "/one-off-order",
        icon: <ShoppingCart className="size-5" />,
        image: ccOrders,
        glowColor: "shadow-orange-500/20",
      },
      {
        label: "Order History",
        description: "View all past orders and reorder favorites",
        href: "/order-history",
        icon: <FileText className="size-5" />,
        image: ccTracking,
        glowColor: "shadow-yellow-500/20",
      },
      {
        label: "Virtual Host",
        description: "Coordinate orders for attendees at different locations",
        href: "/virtual-host",
        icon: <Video className="size-5" />,
        image: ccVirtualHost,
        glowColor: "shadow-orange-500/20",
      },
    ],
  },
  {
    title: "Vendor Network",
    icon: <Coffee className="size-4" />,
    gradient: "from-amber-600 to-yellow-500",
    description: "Browse and manage our 37+ vendor network across Nashville. View menus, track vendor performance, and discover new partners.",
    cards: [
      {
        label: "Vendor Catalog",
        description: "Browse all Nashville coffee shops and caterers",
        href: "/vendors",
        icon: <Coffee className="size-5" />,
        image: ccVendors,
        glowColor: "shadow-amber-500/30",
        featured: true,
      },
      {
        label: "Find Baristas",
        description: "Search available baristas for white-glove service",
        href: "/find-baristas",
        icon: <UserCheck className="size-5" />,
        image: ccBaristas,
        glowColor: "shadow-yellow-500/20",
      },
      {
        label: "Franchise Hub",
        description: "Franchise expansion and territory management",
        href: "/franchise",
        icon: <Building className="size-5" />,
        image: ccFranchise,
        glowColor: "shadow-amber-500/20",
        badge: "Expand",
      },
    ],
  },
  {
    title: "Administration",
    icon: <Shield className="size-4" />,
    gradient: "from-purple-500 to-violet-500",
    description: "Full system administration including user management, platform settings, and regional oversight. Control every aspect of the platform.",
    cards: [
      {
        label: "Admin Dashboard",
        description: "User management and platform controls",
        href: "/admin",
        icon: <Shield className="size-5" />,
        image: ccAdmin,
        glowColor: "shadow-purple-500/30",
        featured: true,
      },
      {
        label: "Admin View",
        description: "Detailed administrative data and controls",
        href: "/admin-view",
        icon: <Eye className="size-5" />,
        image: ccAdmin,
        glowColor: "shadow-violet-500/20",
      },
      {
        label: "Regional Manager",
        description: "Regional delivery zones and territory management",
        href: "/regional",
        icon: <MapPin className="size-5" />,
        image: ccRegional,
        glowColor: "shadow-indigo-500/20",
      },
      {
        label: "System Monitoring",
        description: "Server health, uptime, and performance metrics",
        href: "/monitoring",
        icon: <Server className="size-5" />,
        image: ccMonitoring,
        glowColor: "shadow-green-500/20",
        badge: "Live",
      },
    ],
  },
  {
    title: "Business & CRM",
    icon: <Briefcase className="size-4" />,
    gradient: "from-emerald-500 to-teal-500",
    description: "Customer relationship management, portfolio tracking, and business tools. Manage client notes, meeting presentations, and document scanning.",
    cards: [
      {
        label: "Portfolio / CRM",
        description: "Client notes, industry templates, and voice memos",
        href: "/portfolio",
        icon: <Briefcase className="size-5" />,
        image: ccPortfolio,
        glowColor: "shadow-emerald-500/30",
        featured: true,
      },
      {
        label: "Meeting Presentations",
        description: "Build slideshow presentations for clients",
        href: "/meeting-presentations",
        icon: <Presentation className="size-5" />,
        image: ccPresentations,
        glowColor: "shadow-teal-500/20",
      },
      {
        label: "Document Scanner",
        description: "Universal OCR scanner for PDF creation",
        href: "/scan",
        icon: <Scan className="size-5" />,
        image: ccScanner,
        glowColor: "shadow-emerald-500/20",
      },
      {
        label: "Contact Us",
        description: "Customer support and business inquiries",
        href: "/contact",
        icon: <Users className="size-5" />,
        image: ccPartner,
        glowColor: "shadow-green-500/20",
      },
    ],
  },
  {
    title: "Partners & Investors",
    icon: <Star className="size-4" />,
    gradient: "from-rose-500 to-pink-500",
    description: "Partner management hub and investor relations portal. Access partner tools, submit bug reports, and review investment opportunities.",
    cards: [
      {
        label: "Partner Hub",
        description: "Partner tools, bug reports, and system controls",
        href: "/partner",
        icon: <Link2 className="size-5" />,
        image: ccPartner,
        glowColor: "shadow-rose-500/30",
        featured: true,
      },
      {
        label: "Investor Portal",
        description: "Investment metrics and growth analytics",
        href: "/investor",
        icon: <BarChart3 className="size-5" />,
        image: ccInvestor,
        glowColor: "shadow-pink-500/20",
        badge: "Earn",
      },
    ],
  },
  {
    title: "Finance & Pricing",
    icon: <DollarSign className="size-4" />,
    gradient: "from-green-500 to-emerald-500",
    description: "Pricing models, payment processing, and financial management. Manage subscription tiers, service fees, and payment integrations.",
    cards: [
      {
        label: "Pricing & Plans",
        description: "Subscription tiers and service fee breakdown",
        href: "/pricing",
        icon: <DollarSign className="size-5" />,
        image: ccPricing,
        glowColor: "shadow-green-500/30",
        featured: true,
      },
    ],
  },
  {
    title: "Blockchain & Verification",
    icon: <Sparkles className="size-4" />,
    gradient: "from-cyan-500 to-blue-500",
    description: "Solana-based blockchain hallmark system for document authenticity. Create, manage, and verify blockchain-stamped documents.",
    cards: [
      {
        label: "My Hallmarks",
        description: "View and manage your blockchain hallmarks",
        href: "/my-hallmarks",
        icon: <Sparkles className="size-5" />,
        image: ccBlockchain,
        glowColor: "shadow-cyan-500/30",
        featured: true,
      },
      {
        label: "Blockchain Tutorial",
        description: "Learn how hallmark verification works",
        href: "/blockchain-tutorial",
        icon: <Globe className="size-5" />,
        image: ccBlockchain,
        glowColor: "shadow-blue-500/20",
        badge: "Learn",
      },
    ],
  },
  {
    title: "Developer Tools",
    icon: <Code className="size-4" />,
    gradient: "from-violet-500 to-purple-500",
    description: "Technical tools for developers and system integrators. API access, app ecosystem management, and system diagnostics.",
    cards: [
      {
        label: "Developer Portal",
        description: "API access, diagnostics, and database tools",
        href: "/developers",
        icon: <Code className="size-5" />,
        image: ccDevelopers,
        glowColor: "shadow-violet-500/30",
        featured: true,
      },
    ],
  },
  {
    title: "Legal & Compliance",
    icon: <Scale className="size-4" />,
    gradient: "from-slate-400 to-gray-500",
    description: "Terms of service, privacy policy, and compliance documentation. Ensure your business meets all regulatory requirements.",
    cards: [
      {
        label: "Terms & Conditions",
        description: "Platform terms of service agreement",
        href: "/terms",
        icon: <Scale className="size-5" />,
        image: ccLegal,
        glowColor: "shadow-slate-500/20",
      },
      {
        label: "Privacy Policy",
        description: "How we collect and protect your data",
        href: "/privacy",
        icon: <Eye className="size-5" />,
        image: ccLegal,
        glowColor: "shadow-gray-500/20",
      },
      {
        label: "SMS Consent",
        description: "SMS opt-in verification page",
        href: "/sms-consent",
        icon: <FileText className="size-5" />,
        image: ccLegal,
        glowColor: "shadow-slate-500/20",
      },
    ],
  },
];

function SkeletonLoader() {
  return (
    <div className="min-h-screen p-8" style={{ background: 'linear-gradient(135deg, #070b16 0%, #0c1222 50%, #070b16 100%)' }}>
      <div className="max-w-7xl mx-auto space-y-10">
        <div className="flex items-center gap-4 mb-8">
          <div className="w-10 h-10 rounded-xl bg-white/5 animate-pulse" />
          <div className="h-8 w-64 bg-white/5 rounded-lg animate-pulse" />
        </div>
        {[1, 2, 3].map((i) => (
          <div key={i} className="space-y-4">
            <div className="h-6 w-48 bg-white/5 rounded animate-pulse" />
            <div className="h-4 w-96 bg-white/5 rounded animate-pulse" />
            <div className="flex gap-4">
              {[1, 2, 3, 4].map((j) => (
                <div key={j} className="w-[280px] h-[200px] rounded-2xl bg-white/[0.03] animate-pulse flex-shrink-0" />
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function LaunchCardComponent({ card, index }: { card: LaunchCard; index: number }) {
  const [, setLocation] = useLocation();
  const hoverGlow = glowMap[card.glowColor] || "";
  const cardSlug = card.label.toLowerCase().replace(/[\s\/&]+/g, '-');

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05, duration: 0.4 }}
      onClick={() => setLocation(card.href)}
      className={`relative rounded-2xl overflow-hidden cursor-pointer group transition-all duration-300 hover:scale-[1.03] ${hoverGlow} ${card.featured ? 'ring-1 ring-white/10' : ''}`}
      style={{ width: card.featured ? 320 : 280, height: 200, flexShrink: 0 }}
      data-testid={`card-${cardSlug}`}
    >
      <img
        src={card.image}
        alt={card.label}
        className="absolute inset-0 w-full h-full object-cover brightness-110"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/60 to-black/30" />

      {card.badge && (
        <div className="absolute top-3 right-3 z-10">
          <Badge className="bg-gradient-to-r from-orange-500 to-rose-500 text-white border-0 text-[10px] px-2 py-0.5 font-bold" data-testid={`badge-${cardSlug}`}>
            {card.badge}
          </Badge>
        </div>
      )}

      <div className="absolute bottom-0 left-0 right-0 p-4 z-10">
        <div className="flex items-center gap-2 mb-2">
          <div className="w-8 h-8 rounded-lg bg-white/10 backdrop-blur-sm flex items-center justify-center text-white">
            {card.icon}
          </div>
          <h3 className="text-white font-semibold text-sm" data-testid={`text-label-${cardSlug}`}>{card.label}</h3>
        </div>
        <p className="text-white/60 text-xs leading-relaxed" data-testid={`text-desc-${cardSlug}`}>{card.description}</p>
      </div>

      <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-2xl ring-1 ring-white/20" />
    </motion.div>
  );
}

function CategorySection({ category, categoryIndex }: { category: Category; categoryIndex: number }) {
  const catSlug = category.title.toLowerCase().replace(/[\s\/&]+/g, '-');
  return (
    <motion.section
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: categoryIndex * 0.1, duration: 0.5 }}
      className="space-y-4"
      data-testid={`section-${catSlug}`}
    >
      <div className="flex items-start gap-3">
        <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${category.gradient} flex items-center justify-center text-white flex-shrink-0 mt-0.5`}>
          {category.icon}
        </div>
        <div>
          <h2 className="text-white font-bold text-lg" data-testid={`text-category-${catSlug}`}>{category.title}</h2>
          <p className="text-white/50 text-sm leading-relaxed mt-1 max-w-2xl" data-testid={`text-category-desc-${catSlug}`}>{category.description}</p>
        </div>
      </div>

      <div className="relative pl-1">
        <Carousel
          opts={{ align: "start", loop: false }}
          className="w-full"
        >
          <CarouselContent className="-ml-3">
            {category.cards.map((card, i) => (
              <CarouselItem key={card.label} className="pl-3 basis-auto">
                <LaunchCardComponent card={card} index={i} />
              </CarouselItem>
            ))}
          </CarouselContent>
          {category.cards.length > 3 && (
            <>
              <CarouselPrevious className="hidden md:flex -left-4 bg-white/5 border-white/10 text-white hover:bg-white/10" data-testid={`button-carousel-prev-${catSlug}`} />
              <CarouselNext className="hidden md:flex -right-4 bg-white/5 border-white/10 text-white hover:bg-white/10" data-testid={`button-carousel-next-${catSlug}`} />
            </>
          )}
        </Carousel>
      </div>
    </motion.section>
  );
}

export default function CommandCenterPage() {
  const [, setLocation] = useLocation();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [pin, setPin] = useState("");
  const [error, setError] = useState("");
  const [attempts, setAttempts] = useState(0);

  useEffect(() => {
    const stored = sessionStorage.getItem("command_center_auth");
    if (stored === "true") {
      setIsAuthenticated(true);
    }
    setIsLoading(false);
  }, []);

  const handlePinSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (attempts >= 5) {
      setError("Too many attempts. Please try again later.");
      return;
    }

    try {
      const res = await fetch("/api/auth/pin-login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ pin, role: "admin" }),
      });

      if (res.ok) {
        sessionStorage.setItem("command_center_auth", "true");
        setIsAuthenticated(true);
        setError("");
      } else {
        setAttempts((a) => a + 1);
        setError("Invalid PIN. Please try again.");
        setPin("");
      }
    } catch {
      setError("Connection error. Please try again.");
    }
  };

  const handleLogout = () => {
    sessionStorage.removeItem("command_center_auth");
    setIsAuthenticated(false);
    setPin("");
  };

  if (isLoading) return <SkeletonLoader />;

  if (!isAuthenticated) {
    return (
      <div
        className="min-h-screen flex items-center justify-center p-4"
        style={{ background: 'linear-gradient(135deg, #070b16 0%, #0c1222 50%, #070b16 100%)' }}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.4 }}
        >
          <Card className="w-full max-w-md bg-white/[0.03] backdrop-blur-xl border-white/5 rounded-2xl">
            <CardContent className="p-8">
              <div className="text-center mb-8">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-orange-500 to-amber-500 flex items-center justify-center mx-auto mb-4">
                  <Lock className="size-7 text-white" />
                </div>
                <h1 className="text-2xl font-bold text-white font-serif" data-testid="text-pin-title">Command Center</h1>
                <p className="text-white/50 text-sm mt-2" data-testid="text-pin-subtitle">Brew & Board Coffee</p>
                <p className="text-white/40 text-xs mt-1" data-testid="text-pin-helper">Enter your admin PIN to access mission control</p>
              </div>

              <form onSubmit={handlePinSubmit} className="space-y-4">
                <Input
                  type="password"
                  value={pin}
                  onChange={(e) => setPin(e.target.value)}
                  placeholder="Enter PIN"
                  className="bg-white/5 border-white/10 text-white text-center text-lg tracking-[0.5em] placeholder:tracking-normal placeholder:text-white/30 h-12 rounded-xl"
                  maxLength={10}
                  data-testid="input-command-pin"
                  autoFocus
                />
                {error && (
                  <p className="text-red-400 text-xs text-center" data-testid="text-pin-error">{error}</p>
                )}
                <Button
                  type="submit"
                  className="w-full bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white font-semibold h-11 rounded-xl"
                  disabled={!pin || attempts >= 5}
                  data-testid="button-command-login"
                >
                  Access Command Center
                </Button>
              </form>

              <div className="mt-6 text-center">
                <button
                  onClick={() => setLocation("/dashboard")}
                  className="text-white/30 text-xs hover:text-white/50 transition-colors"
                  data-testid="button-pin-back-dashboard"
                >
                  Back to Dashboard
                </button>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    );
  }

  return (
    <div
      className="min-h-screen pb-20"
      style={{ background: 'linear-gradient(135deg, #070b16 0%, #0c1222 50%, #070b16 100%)' }}
    >
      <header className="sticky top-0 z-50 backdrop-blur-xl border-b border-white/5" style={{ background: 'rgba(7, 11, 22, 0.8)' }}>
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button onClick={() => setLocation("/dashboard")} className="text-white/50 hover:text-white transition-colors" data-testid="button-cc-back">
              <ArrowLeft className="size-5" />
            </button>
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-orange-500 to-amber-500 flex items-center justify-center">
              <LayoutGrid className="size-4 text-white" />
            </div>
            <div>
              <h1 className="text-white font-bold text-sm" data-testid="text-header-title">Command Center</h1>
              <p className="text-white/40 text-[10px]" data-testid="text-header-subtitle">Brew & Board Coffee</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-white/40 text-xs hidden sm:block" data-testid="text-mission-control">Mission Control</span>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleLogout}
              className="text-white/50 hover:text-white hover:bg-white/5 text-xs"
              data-testid="button-cc-logout"
            >
              <LogOut className="size-4 mr-1" />
              Logout
            </Button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8 space-y-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-6"
        >
          <h2 className="text-white/80 text-sm font-medium tracking-wide uppercase" data-testid="text-status">All Systems Operational</h2>
          <p className="text-white/30 text-xs mt-1" data-testid="text-tool-count">{categories.reduce((acc, c) => acc + c.cards.length, 0)} tools across {categories.length} categories</p>
        </motion.div>

        {categories.map((category, i) => (
          <CategorySection key={category.title} category={category} categoryIndex={i} />
        ))}
      </main>
    </div>
  );
}

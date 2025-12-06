import { useState, useEffect } from "react";
import { Link, useLocation } from "wouter";
import { motion } from "framer-motion";
import { 
  ShoppingCart, 
  Store, 
  BarChart3, 
  Play,
  FlaskConical,
  ChevronRight,
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
  CheckCircle2
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

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

export default function PartnerHub() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [sandboxMode, setSandboxMode] = useState(() => {
    return localStorage.getItem("sandbox_mode") === "true";
  });
  const [errorReports, setErrorReports] = useState<ErrorReport[]>([]);
  const [loadingReports, setLoadingReports] = useState(true);

  useEffect(() => {
    const saved = localStorage.getItem("sandbox_mode");
    if (saved === "true") {
      setSandboxMode(true);
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

        {/* Quick Actions - Top 2 cards in a compact row */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="grid grid-cols-2 gap-3 mb-6"
        >
          <Link href="/dashboard">
            <div className="group relative overflow-hidden rounded-xl p-4 cursor-pointer transition-all bg-gradient-to-br from-emerald-600 to-emerald-800 border border-emerald-500/30">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-white/20 rounded-lg">
                  <Play className="h-5 w-5 text-white" />
                </div>
                <div>
                  <h3 className="text-white font-semibold text-sm">Live App</h3>
                  <Badge className="bg-emerald-500 text-white text-[10px] mt-1">Live</Badge>
                </div>
              </div>
            </div>
          </Link>
          
          <div
            onClick={toggleSandbox}
            className="group relative overflow-hidden rounded-xl p-4 cursor-pointer transition-all bg-gradient-to-br from-purple-600 to-purple-800 border border-purple-500/30"
          >
            <div className="flex items-center gap-3">
              <div className="p-2 bg-white/20 rounded-lg">
                <FlaskConical className="h-5 w-5 text-white" />
              </div>
              <div>
                <h3 className="text-white font-semibold text-sm">Sandbox</h3>
                <Badge className={`${sandboxMode ? 'bg-purple-500' : 'bg-gray-500'} text-white text-[10px] mt-1`}>
                  {sandboxMode ? 'Active' : 'Off'}
                </Badge>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Accordion Navigation */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
        >
          <Accordion type="multiple" defaultValue={["operations"]} className="space-y-3">
            <AccordionItem value="operations" className="bg-white/5 backdrop-blur-sm rounded-xl border border-amber-900/30 overflow-hidden">
              <AccordionTrigger className="px-4 py-3 hover:no-underline hover:bg-white/5">
                <div className="flex items-center gap-3">
                  <div className="p-1.5 bg-amber-500/20 rounded-lg">
                    <ShoppingCart className="h-4 w-4 text-amber-400" />
                  </div>
                  <span className="text-amber-100 font-medium">Operations</span>
                </div>
              </AccordionTrigger>
              <AccordionContent className="px-4 pb-4">
                <div className="space-y-2">
                  <Link href="/admin">
                    <div className="flex items-center justify-between p-3 bg-white/5 rounded-lg hover:bg-white/10 transition-colors cursor-pointer">
                      <div className="flex items-center gap-3">
                        <ShoppingCart className="h-4 w-4 text-blue-400" />
                        <span className="text-amber-200 text-sm">Orders Dashboard</span>
                      </div>
                      <ChevronRight className="h-4 w-4 text-amber-400/50" />
                    </div>
                  </Link>
                  <Link href="/vendors">
                    <div className="flex items-center justify-between p-3 bg-white/5 rounded-lg hover:bg-white/10 transition-colors cursor-pointer">
                      <div className="flex items-center gap-3">
                        <Store className="h-4 w-4 text-amber-400" />
                        <span className="text-amber-200 text-sm">Vendor Management</span>
                      </div>
                      <span className="text-amber-400/60 text-xs">37+</span>
                    </div>
                  </Link>
                  <Link href="/regional">
                    <div className="flex items-center justify-between p-3 bg-white/5 rounded-lg hover:bg-white/10 transition-colors cursor-pointer">
                      <div className="flex items-center gap-3">
                        <MapPin className="h-4 w-4 text-rose-400" />
                        <span className="text-amber-200 text-sm">Regional Managers</span>
                      </div>
                      <ChevronRight className="h-4 w-4 text-amber-400/50" />
                    </div>
                  </Link>
                </div>
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="tools" className="bg-white/5 backdrop-blur-sm rounded-xl border border-amber-900/30 overflow-hidden">
              <AccordionTrigger className="px-4 py-3 hover:no-underline hover:bg-white/5">
                <div className="flex items-center gap-3">
                  <div className="p-1.5 bg-teal-500/20 rounded-lg">
                    <FileText className="h-4 w-4 text-teal-400" />
                  </div>
                  <span className="text-amber-100 font-medium">Tools & Analytics</span>
                </div>
              </AccordionTrigger>
              <AccordionContent className="px-4 pb-4">
                <div className="space-y-2">
                  <Link href="/developers">
                    <div className="flex items-center justify-between p-3 bg-white/5 rounded-lg hover:bg-white/10 transition-colors cursor-pointer">
                      <div className="flex items-center gap-3">
                        <BarChart3 className="h-4 w-4 text-indigo-400" />
                        <span className="text-amber-200 text-sm">Business Analytics</span>
                      </div>
                      <ChevronRight className="h-4 w-4 text-amber-400/50" />
                    </div>
                  </Link>
                  <Link href="/portfolio">
                    <div className="flex items-center justify-between p-3 bg-white/5 rounded-lg hover:bg-white/10 transition-colors cursor-pointer">
                      <div className="flex items-center gap-3">
                        <FileText className="h-4 w-4 text-teal-400" />
                        <span className="text-amber-200 text-sm">CRM & Portfolio</span>
                      </div>
                      <ChevronRight className="h-4 w-4 text-amber-400/50" />
                    </div>
                  </Link>
                  <Link href="/blockchain-tutorial">
                    <div className="flex items-center justify-between p-3 bg-white/5 rounded-lg hover:bg-white/10 transition-colors cursor-pointer">
                      <div className="flex items-center gap-3">
                        <Shield className="h-4 w-4 text-cyan-400" />
                        <span className="text-amber-200 text-sm">Blockchain Hallmarks</span>
                      </div>
                      <ChevronRight className="h-4 w-4 text-amber-400/50" />
                    </div>
                  </Link>
                </div>
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="system" className="bg-white/5 backdrop-blur-sm rounded-xl border border-amber-900/30 overflow-hidden">
              <AccordionTrigger className="px-4 py-3 hover:no-underline hover:bg-white/5">
                <div className="flex items-center gap-3">
                  <div className="p-1.5 bg-emerald-500/20 rounded-lg">
                    <Sparkles className="h-4 w-4 text-emerald-400" />
                  </div>
                  <span className="text-amber-100 font-medium">System Status</span>
                  <div className="flex items-center gap-1 ml-2">
                    <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
                    <span className="text-emerald-400 text-xs">All Online</span>
                  </div>
                </div>
              </AccordionTrigger>
              <AccordionContent className="px-4 pb-4">
                <div className="space-y-2">
                  <div className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
                    <span className="text-amber-200/70 text-sm">Customer App</span>
                    <span className="text-emerald-400 text-xs">Online</span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
                    <span className="text-amber-200/70 text-sm">Payment System</span>
                    <span className="text-emerald-400 text-xs">Stripe Active</span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
                    <span className="text-amber-200/70 text-sm">Blockchain</span>
                    <span className="text-emerald-400 text-xs">Solana Mainnet</span>
                  </div>
                </div>
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="reports" className="bg-white/5 backdrop-blur-sm rounded-xl border border-red-900/30 overflow-hidden">
              <AccordionTrigger className="px-4 py-3 hover:no-underline hover:bg-white/5">
                <div className="flex items-center gap-3">
                  <div className="p-1.5 bg-red-500/20 rounded-lg">
                    <Bug className="h-4 w-4 text-red-400" />
                  </div>
                  <span className="text-amber-100 font-medium">Bug Reports</span>
                  {errorReports.filter(r => r.status === 'open').length > 0 && (
                    <Badge className="bg-red-500/20 text-red-300 border-red-500/30 text-[10px]">
                      {errorReports.filter(r => r.status === 'open').length} Open
                    </Badge>
                  )}
                </div>
              </AccordionTrigger>
              <AccordionContent className="px-4 pb-4">
                {loadingReports ? (
                  <div className="text-center py-4 text-amber-200/50 text-sm">Loading...</div>
                ) : errorReports.length === 0 ? (
                  <div className="text-center py-4">
                    <CheckCircle2 className="h-6 w-6 text-emerald-500 mx-auto mb-2" />
                    <p className="text-amber-200/70 text-sm">No issues reported</p>
                  </div>
                ) : (
                  <div className="space-y-2 max-h-48 overflow-y-auto">
                    {errorReports.slice(0, 5).map((report) => (
                      <div key={report.id} className="p-3 bg-white/5 rounded-lg">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-white text-sm font-medium">{report.title}</span>
                          <Badge className={`text-[10px] ${
                            report.status === 'open' ? 'bg-red-500/20 text-red-300' : 'bg-emerald-500/20 text-emerald-300'
                          }`}>{report.status}</Badge>
                        </div>
                        <p className="text-amber-200/50 text-xs">{report.category} • {report.severity}</p>
                      </div>
                    ))}
                  </div>
                )}
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="mt-6 text-center text-amber-200/40 text-xs"
        >
          Brew & Board Coffee Partner Portal v1.1.9
        </motion.div>
      </div>
    </div>
  );
}

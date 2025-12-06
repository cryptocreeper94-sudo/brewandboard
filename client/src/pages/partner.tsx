import { useState, useEffect } from "react";
import { Link, useLocation } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
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
  CheckCircle2,
  AlertTriangle,
  Eye,
  Lock,
  X
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
    { label: "Active Orders", value: "12", icon: Package, trend: "+3 today" },
    { label: "Vendors Online", value: "37", icon: Store, trend: "All active" },
    { label: "This Week Revenue", value: "$2,847", icon: TrendingUp, trend: "+18%" },
    { label: "Avg Delivery Time", value: "1.8h", icon: Clock, trend: "On target" },
  ];

  const partnerName = partnerInfo?.name || "Partner";

  // Welcome modal content personalized for Sarah and Sid
  const getWelcomeContent = () => {
    if (partnerName === "Sarah") {
      return {
        greeting: "Hey Sarah!",
        intro: "It's Jason. Thanks for taking a look at Brew & Board Coffee! I wanted to personally thank you for catching those errors earlier - your feedback has been incredibly valuable.",
        improvements: [
          "Fixed the 1099 Compliance Portal field names you spotted",
          "Added proper server-side validation for tax ID entries",
          "Corrected the payment ledger display issues",
          "Enhanced security with masked tax ID display (***-**-XXXX)"
        ],
        overview: "This platform connects Nashville businesses with local coffee shops for pre-meeting catering. It includes order scheduling, a CRM portfolio, document scanning, meeting presentations, and blockchain verification on Solana.",
        closing: "Feel free to explore everything - you're in Preview Mode so nothing will save to the live system. I've set it up so you can see exactly how it works!"
      };
    } else if (partnerName === "Sid") {
      return {
        greeting: "Hey Sid!",
        intro: "It's Jason. Welcome to Brew & Board Coffee! I'm excited to show you what we've been building here in Nashville.",
        improvements: [
          "1099 Compliance Portal for tracking contractor payments",
          "Partner Hub with personalized dashboards",
          "Emergency admin controls and system monitoring",
          "Enhanced security features throughout"
        ],
        overview: "This B2B platform connects Nashville businesses with local coffee shops for pre-meeting catering. Features include order scheduling, CRM, document scanning, meeting presentations, and blockchain hallmark verification.",
        closing: "Take your time exploring - you're in Preview Mode so nothing saves to the live system yet. Let me know what you think!"
      };
    }
    return {
      greeting: `Hey ${partnerName}!`,
      intro: "Welcome to Brew & Board Coffee!",
      improvements: ["Latest platform updates and improvements"],
      overview: "A B2B coffee catering platform for Nashville businesses.",
      closing: "Explore freely in Preview Mode - nothing saves to the live system."
    };
  };

  const welcomeContent = getWelcomeContent();

  return (
    <div className="min-h-screen" style={{ background: 'linear-gradient(135deg, #1a0f09 0%, #2d1810 50%, #3d2418 100%)' }}>
      {/* Preview Mode Banner */}
      {isPreviewMode && (
        <div className="bg-amber-500 text-amber-950 px-4 py-2 text-center text-sm font-medium flex items-center justify-center gap-2">
          <Eye className="h-4 w-4" />
          Preview Mode - Data will not be saved
        </div>
      )}

      {/* Welcome Modal */}
      <Dialog open={showWelcomeModal && !showPinChangeModal} onOpenChange={setShowWelcomeModal}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-2xl font-serif text-amber-900 flex items-center gap-2">
              <Coffee className="h-6 w-6" />
              {welcomeContent.greeting}
            </DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4 text-sm">
            <p className="text-gray-700">{welcomeContent.intro}</p>
            
            <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-4">
              <h4 className="font-semibold text-emerald-800 mb-2 flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4" />
                Recent Improvements
              </h4>
              <ul className="space-y-1 text-emerald-700">
                {welcomeContent.improvements.map((item, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <span className="text-emerald-500 mt-1">•</span>
                    {item}
                  </li>
                ))}
              </ul>
            </div>
            
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
              <h4 className="font-semibold text-amber-800 mb-2 flex items-center gap-2">
                <Sparkles className="h-4 w-4" />
                What This Platform Does
              </h4>
              <p className="text-amber-700">{welcomeContent.overview}</p>
            </div>
            
            <p className="text-gray-600 italic">{welcomeContent.closing}</p>
            
            <Button 
              onClick={handleDismissWelcome}
              className="w-full bg-amber-800 hover:bg-amber-900"
              data-testid="button-enter-dashboard"
            >
              Enter My Dashboard
              <ChevronRight className="h-4 w-4 ml-2" />
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* PIN Change Modal */}
      <Dialog open={showPinChangeModal} onOpenChange={() => {}}>
        <DialogContent className="max-w-md" onPointerDownOutside={(e) => e.preventDefault()}>
          <DialogHeader>
            <DialogTitle className="text-xl font-serif text-amber-900 flex items-center gap-2">
              <Lock className="h-5 w-5" />
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
                className="text-center text-2xl tracking-widest"
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
                className="text-center text-2xl tracking-widest"
                data-testid="input-confirm-pin"
              />
            </div>
            
            {pinError && (
              <p className="text-red-600 text-sm flex items-center gap-2">
                <AlertTriangle className="h-4 w-4" />
                {pinError}
              </p>
            )}
            
            <Button 
              onClick={handlePinChange}
              className="w-full bg-amber-800 hover:bg-amber-900"
              disabled={newPin.length !== 4 || confirmPin.length !== 4}
              data-testid="button-set-pin"
            >
              Set My PIN
            </Button>
            
            <p className="text-xs text-gray-500 text-center">
              Your initial PIN ({partnerName === "Sarah" ? "777" : "444"}) will be deactivated after this.
            </p>
          </div>
        </DialogContent>
      </Dialog>

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
              <p className="text-amber-200/70 text-sm">Hey {partnerName} 👋</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {isPreviewMode && (
              <Badge className="bg-amber-500/20 text-amber-300 border-amber-500/30">
                <Eye className="h-3 w-3 mr-1" />
                Preview Mode
              </Badge>
            )}
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
              className="rounded-xl p-4 border border-amber-700/30"
              style={{ background: 'linear-gradient(135deg, rgba(92, 64, 51, 0.3) 0%, rgba(61, 36, 24, 0.3) 100%)' }}
            >
              <div className="flex items-center justify-between mb-2">
                <stat.icon className="h-5 w-5 text-amber-400" />
                <span className="text-xs text-emerald-400">{stat.trend}</span>
              </div>
              <p className="text-2xl font-bold text-white">{stat.value}</p>
              <p className="text-xs text-amber-200/70">{stat.label}</p>
            </div>
          ))}
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Accordion type="single" collapsible className="space-y-4">
            <AccordionItem value="quick-actions" className="border border-amber-700/30 rounded-xl overflow-hidden" style={{ background: 'linear-gradient(135deg, rgba(92, 64, 51, 0.2) 0%, rgba(61, 36, 24, 0.2) 100%)' }}>
              <AccordionTrigger className="px-6 py-4 text-white hover:no-underline hover:bg-amber-900/20">
                <div className="flex items-center gap-3">
                  <Play className="h-5 w-5 text-amber-400" />
                  <span className="font-semibold">Quick Actions</span>
                </div>
              </AccordionTrigger>
              <AccordionContent className="px-6 pb-4">
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  <Link href="/order">
                    <Button variant="outline" className="w-full justify-start border-amber-700/50 text-amber-200 hover:bg-amber-900/30" data-testid="button-new-order">
                      <ShoppingCart className="h-4 w-4 mr-2" />
                      New Order
                    </Button>
                  </Link>
                  <Link href="/vendors">
                    <Button variant="outline" className="w-full justify-start border-amber-700/50 text-amber-200 hover:bg-amber-900/30" data-testid="button-view-vendors">
                      <Store className="h-4 w-4 mr-2" />
                      View Vendors
                    </Button>
                  </Link>
                  <Link href="/portfolio">
                    <Button variant="outline" className="w-full justify-start border-amber-700/50 text-amber-200 hover:bg-amber-900/30" data-testid="button-portfolio">
                      <FileText className="h-4 w-4 mr-2" />
                      Portfolio
                    </Button>
                  </Link>
                  <Link href="/scanner">
                    <Button variant="outline" className="w-full justify-start border-amber-700/50 text-amber-200 hover:bg-amber-900/30" data-testid="button-scanner">
                      <MapPin className="h-4 w-4 mr-2" />
                      Scanner
                    </Button>
                  </Link>
                  <Button 
                    variant="outline" 
                    className="w-full justify-start border-amber-700/50 text-amber-200 hover:bg-amber-900/30"
                    onClick={toggleSandbox}
                    data-testid="button-toggle-sandbox"
                  >
                    <FlaskConical className="h-4 w-4 mr-2" />
                    {sandboxMode ? "Exit Sandbox" : "Enter Sandbox"}
                  </Button>
                  <Link href="/developers">
                    <Button variant="outline" className="w-full justify-start border-amber-700/50 text-amber-200 hover:bg-amber-900/30" data-testid="button-dev-hub">
                      <Shield className="h-4 w-4 mr-2" />
                      Dev Hub
                    </Button>
                  </Link>
                </div>
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="system-overview" className="border border-amber-700/30 rounded-xl overflow-hidden" style={{ background: 'linear-gradient(135deg, rgba(92, 64, 51, 0.2) 0%, rgba(61, 36, 24, 0.2) 100%)' }}>
              <AccordionTrigger className="px-6 py-4 text-white hover:no-underline hover:bg-amber-900/20">
                <div className="flex items-center gap-3">
                  <BarChart3 className="h-5 w-5 text-amber-400" />
                  <span className="font-semibold">System Overview</span>
                </div>
              </AccordionTrigger>
              <AccordionContent className="px-6 pb-4">
                <div className="space-y-4 text-amber-200/80">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="p-4 rounded-lg bg-amber-900/20 border border-amber-700/30">
                      <h4 className="font-semibold text-amber-200 mb-2">Platform Features</h4>
                      <ul className="text-sm space-y-1">
                        <li>• Order Scheduling with Calendar</li>
                        <li>• Portfolio/CRM Management</li>
                        <li>• Document Scanner & PDF Creation</li>
                        <li>• Meeting Presentation Builder</li>
                        <li>• Virtual Host Multi-Location Orders</li>
                        <li>• Blockchain Hallmark Verification</li>
                      </ul>
                    </div>
                    <div className="p-4 rounded-lg bg-amber-900/20 border border-amber-700/30">
                      <h4 className="font-semibold text-amber-200 mb-2">Business Tools</h4>
                      <ul className="text-sm space-y-1">
                        <li>• 1099 Compliance Portal</li>
                        <li>• Regional Manager System</li>
                        <li>• Franchise Management</li>
                        <li>• Partner Hub (You're here!)</li>
                        <li>• Developer Documentation</li>
                        <li>• Bug Reporting System</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="error-reports" className="border border-amber-700/30 rounded-xl overflow-hidden" style={{ background: 'linear-gradient(135deg, rgba(92, 64, 51, 0.2) 0%, rgba(61, 36, 24, 0.2) 100%)' }}>
              <AccordionTrigger className="px-6 py-4 text-white hover:no-underline hover:bg-amber-900/20">
                <div className="flex items-center gap-3">
                  <Bug className="h-5 w-5 text-amber-400" />
                  <span className="font-semibold">Bug Reports</span>
                  {errorReports.length > 0 && (
                    <Badge className="bg-rose-500/20 text-rose-300 border-rose-500/30 ml-2">
                      {errorReports.length}
                    </Badge>
                  )}
                </div>
              </AccordionTrigger>
              <AccordionContent className="px-6 pb-4">
                {loadingReports ? (
                  <div className="text-center py-4 text-amber-200/60">Loading reports...</div>
                ) : errorReports.length === 0 ? (
                  <div className="text-center py-4 text-amber-200/60">
                    <CheckCircle2 className="h-8 w-8 mx-auto mb-2 text-emerald-400" />
                    <p>No bug reports - everything is running smoothly!</p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {errorReports.slice(0, 5).map((report) => (
                      <div 
                        key={report.id}
                        className="p-3 rounded-lg bg-amber-900/20 border border-amber-700/30"
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-medium text-amber-200">{report.title}</span>
                          <Badge 
                            className={
                              report.status === 'resolved' 
                                ? 'bg-emerald-500/20 text-emerald-300' 
                                : report.severity === 'critical'
                                ? 'bg-rose-500/20 text-rose-300'
                                : 'bg-amber-500/20 text-amber-300'
                            }
                          >
                            {report.status}
                          </Badge>
                        </div>
                        <p className="text-xs text-amber-200/60 mt-1">{report.category} • {new Date(report.createdAt).toLocaleDateString()}</p>
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
          transition={{ delay: 0.4 }}
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

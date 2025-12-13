import { useState, useEffect } from "react";
import { useLocation, Link } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import {
  Menu,
  X,
  FileText,
  Mail,
  TrendingUp,
  ShieldCheck,
  Code,
  Shield,
  Lock,
  Coffee,
  CheckCircle,
  Building2,
  MapPin,
  Bug,
  Send,
  Palette,
  Check
} from "lucide-react";
import { useTheme } from "@/contexts/ThemeContext";
import { themeCategories } from "@/data/themes";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";

const DEVELOPER_PIN = "0424";
const PARTNER_PINS = ["444", "5555"]; // Sid and Sarah
const CURRENT_VERSION = "1.1.9";

interface AppVersion {
  version: string;
  changelog: string;
  releaseNotes?: string;
  releasedAt: string;
  isCurrent: boolean;
  hallmarkId?: string;
}

export function SettingsMenu() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const { currentTheme, setTheme, availableThemes } = useTheme();
  const [isOpen, setIsOpen] = useState(false);
  const [showDevLogin, setShowDevLogin] = useState(false);
  const [showAdminLogin, setShowAdminLogin] = useState(false);
  const [showChangelog, setShowChangelog] = useState(false);
  const [showThemeSelector, setShowThemeSelector] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string>("coffee");
  const [versions, setVersions] = useState<AppVersion[]>([]);
  const [currentVersion, setCurrentVersion] = useState<AppVersion | null>(null);
  const [pin, setPin] = useState("");
  const [adminPin, setAdminPin] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  
  // Report Issue state
  const [showReportIssue, setShowReportIssue] = useState(false);
  const [reportForm, setReportForm] = useState({
    title: "",
    description: "",
    reporterName: "",
    reporterEmail: "",
    category: "general",
    severity: "medium",
  });
  const [isSubmittingReport, setIsSubmittingReport] = useState(false);

  useEffect(() => {
    async function fetchVersions() {
      try {
        const [currentRes, historyRes] = await Promise.all([
          fetch('/api/hallmark/version/current'),
          fetch('/api/hallmark/version/history')
        ]);
        
        if (currentRes.ok) {
          const current = await currentRes.json();
          setCurrentVersion(current);
        }
        
        if (historyRes.ok) {
          const history = await historyRes.json();
          setVersions(history);
        }
      } catch (error) {
        console.log('Version info not available');
      }
    }
    
    fetchVersions();
  }, []);

  const handleDevLogin = () => {
    setIsLoading(true);
    
    setTimeout(() => {
      if (pin === DEVELOPER_PIN) {
        const devUser = {
          id: "developer-admin",
          email: "dev@brewandboard.coffee",
          businessName: "Brew & Board Developer",
          contactName: "Developer Admin",
          isDeveloper: true
        };
        localStorage.setItem("coffee_user", JSON.stringify(devUser));
        localStorage.setItem("coffee_dev_auth", "true");
        const thirtyDays = 30 * 24 * 60 * 60 * 1000;
        localStorage.setItem("coffee_session_expiry", String(Date.now() + thirtyDays));
        
        toast({
          title: "Developer Access Granted",
          description: "Full access enabled. Welcome to Brew & Board!",
        });
        setShowDevLogin(false);
        setPin("");
        setIsOpen(false);
        setLocation("/developers");
      } else {
        toast({
          title: "Access Denied",
          description: "Invalid developer PIN.",
          variant: "destructive"
        });
      }
      setIsLoading(false);
    }, 500);
  };

  const handleAdminLogin = () => {
    setIsLoading(true);
    
    setTimeout(() => {
      if (PARTNER_PINS.includes(adminPin)) {
        toast({
          title: "Partner Access Granted",
          description: "Welcome to the Partner Hub.",
        });
        setShowAdminLogin(false);
        setAdminPin("");
        setIsOpen(false);
        setLocation("/partner");
      } else {
        toast({
          title: "Access Denied",
          description: "Invalid admin PIN.",
          variant: "destructive"
        });
      }
      setIsLoading(false);
    }, 500);
  };

  const handleDevKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && pin.length === 4) {
      handleDevLogin();
    }
  };

  const handleAdminKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && adminPin.length === 4) {
      handleAdminLogin();
    }
  };

  const handleSubmitReport = async () => {
    if (!reportForm.title.trim() || !reportForm.description.trim()) {
      toast({
        title: "Missing Information",
        description: "Please provide a title and description.",
        variant: "destructive"
      });
      return;
    }

    setIsSubmittingReport(true);
    try {
      const response = await fetch("/api/error-reports", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...reportForm,
          pageUrl: window.location.href,
        }),
      });

      if (response.ok) {
        toast({
          title: "Report Submitted",
          description: "Thank you! Our team will review your report.",
        });
        setShowReportIssue(false);
        setReportForm({
          title: "",
          description: "",
          reporterName: "",
          reporterEmail: "",
          category: "general",
          severity: "medium",
        });
      } else {
        throw new Error("Failed to submit report");
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to submit report. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsSubmittingReport(false);
    }
  };

  const menuItems = [
    { icon: FileText, label: "Terms & Conditions", href: "/terms" },
    { icon: Mail, label: "Contact Us", href: "/contact" },
    { icon: TrendingUp, label: "Investors", href: "/investor" },
    { icon: Building2, label: "Franchise", href: "/franchise" },
  ];

  return (
    <>
      <Sheet open={isOpen} onOpenChange={setIsOpen}>
        <SheetTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            className="text-amber-200 hover:text-amber-100 hover:bg-amber-800/30"
            data-testid="button-settings-menu"
          >
            <Menu className="h-5 w-5" />
          </Button>
        </SheetTrigger>
        <SheetContent 
          side="right" 
          className="w-[280px] border-amber-800/30"
          style={{ background: 'linear-gradient(135deg, #1a0f09 0%, #2d1810 100%)' }}
        >
          <SheetHeader className="border-b border-amber-800/30 pb-4">
            <SheetTitle className="text-amber-100 font-serif">Settings & More</SheetTitle>
          </SheetHeader>
          
          <div className="py-4 space-y-1">
            {/* Navigation Links */}
            {menuItems.map((item) => (
              <Link key={item.href} href={item.href}>
                <button
                  onClick={() => setIsOpen(false)}
                  className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-amber-200/80 hover:text-amber-100 hover:bg-amber-800/30 transition-colors text-left"
                  data-testid={`menu-link-${item.label.toLowerCase().replace(/\s+/g, '-')}`}
                >
                  <item.icon className="h-4 w-4 text-amber-400" />
                  <span className="text-sm">{item.label}</span>
                </button>
              </Link>
            ))}
            
            <div className="my-3 border-t border-amber-800/30" />
            
            {/* Regional Manager Access */}
            <Link href="/regional">
              <button
                onClick={() => setIsOpen(false)}
                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-amber-200/80 hover:text-amber-100 hover:bg-amber-800/30 transition-colors text-left"
                data-testid="menu-regional"
              >
                <MapPin className="h-4 w-4 text-amber-400" />
                <span className="text-sm">Regional Manager</span>
              </button>
            </Link>
            
            {/* Admin & Developer Access */}
            <button
              onClick={() => {
                setShowAdminLogin(true);
                setIsOpen(false);
              }}
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-amber-200/80 hover:text-amber-100 hover:bg-amber-800/30 transition-colors text-left"
              data-testid="menu-admin"
            >
              <ShieldCheck className="h-4 w-4 text-amber-400" />
              <span className="text-sm">Admin Panel</span>
            </button>
            
            <button
              onClick={() => {
                setShowDevLogin(true);
                setIsOpen(false);
              }}
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-amber-200/80 hover:text-amber-100 hover:bg-amber-800/30 transition-colors text-left"
              data-testid="menu-developer"
            >
              <Code className="h-4 w-4 text-amber-400" />
              <span className="text-sm">Developer Hub</span>
            </button>
            
            <div className="my-3 border-t border-amber-800/30" />
            
            {/* Version Info */}
            <button
              onClick={() => {
                setShowChangelog(true);
                setIsOpen(false);
              }}
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-amber-200/80 hover:text-amber-100 hover:bg-amber-800/30 transition-colors text-left"
              data-testid="menu-version"
            >
              <Shield className="h-4 w-4 text-amber-400" />
              <div className="flex flex-col">
                <span className="text-sm">Version & Changelog</span>
                <span className="text-xs text-amber-400/60">v{currentVersion?.version || CURRENT_VERSION}</span>
              </div>
            </button>
            
            <div className="my-3 border-t border-amber-800/30" />
            
            {/* Theme Selector */}
            <button
              onClick={() => {
                setShowThemeSelector(true);
                setIsOpen(false);
              }}
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-amber-200/80 hover:text-amber-100 hover:bg-amber-800/30 transition-colors text-left"
              data-testid="menu-themes"
            >
              <Palette className="h-4 w-4 text-amber-400" />
              <div className="flex flex-col">
                <span className="text-sm">App Themes</span>
                <span className="text-xs text-amber-400/60">{currentTheme.name}</span>
              </div>
            </button>
            
            <div className="my-3 border-t border-amber-800/30" />
            
            {/* Report Issue */}
            <button
              onClick={() => {
                setShowReportIssue(true);
                setIsOpen(false);
              }}
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-red-300/80 hover:text-red-200 hover:bg-red-900/20 transition-colors text-left"
              data-testid="menu-report-issue"
            >
              <Bug className="h-4 w-4 text-red-400" />
              <div className="flex flex-col">
                <span className="text-sm">Report an Issue</span>
                <span className="text-xs text-red-400/60">Found a bug? Let us know</span>
              </div>
            </button>
          </div>
        </SheetContent>
      </Sheet>

      {/* Developer Login Dialog */}
      <Dialog open={showDevLogin} onOpenChange={setShowDevLogin}>
        <DialogContent className="sm:max-w-[320px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Lock className="h-5 w-5 text-primary" />
              Developer Access
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 pt-2">
            <p className="text-sm text-muted-foreground">
              Enter your developer PIN to access the Developer Hub.
            </p>
            <Input
              type="password"
              placeholder="Enter 4-digit PIN"
              maxLength={4}
              value={pin}
              onChange={(e) => setPin(e.target.value.replace(/\D/g, ""))}
              onKeyDown={handleDevKeyDown}
              className="text-center text-lg tracking-widest"
              data-testid="input-dev-pin"
              autoFocus
            />
            <Button 
              onClick={handleDevLogin} 
              className="w-full"
              disabled={pin.length !== 4 || isLoading}
              data-testid="button-dev-submit"
            >
              {isLoading ? "Verifying..." : "Access Developer Hub"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Admin Login Dialog */}
      <Dialog open={showAdminLogin} onOpenChange={setShowAdminLogin}>
        <DialogContent className="sm:max-w-[320px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <ShieldCheck className="h-5 w-5 text-primary" />
              Admin Access
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 pt-2">
            <p className="text-sm text-muted-foreground">
              Enter your admin PIN to access the Admin Panel.
            </p>
            <Input
              type="password"
              placeholder="Enter 4-digit PIN"
              maxLength={4}
              value={adminPin}
              onChange={(e) => setAdminPin(e.target.value.replace(/\D/g, ""))}
              onKeyDown={handleAdminKeyDown}
              className="text-center text-lg tracking-widest"
              data-testid="input-admin-pin"
              autoFocus
            />
            <Button 
              onClick={handleAdminLogin} 
              className="w-full"
              disabled={adminPin.length !== 4 || isLoading}
              data-testid="button-admin-submit"
            >
              {isLoading ? "Verifying..." : "Access Admin Panel"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Changelog Dialog */}
      <Dialog open={showChangelog} onOpenChange={setShowChangelog}>
        <DialogContent className="sm:max-w-[480px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Coffee className="h-5 w-5 text-amber-600" />
              Brew & Board Coffee
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 pt-2">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-semibold text-lg">
                  Version {currentVersion?.version || CURRENT_VERSION}
                </p>
                <p className="text-xs text-muted-foreground">
                  {currentVersion?.releasedAt 
                    ? `Released ${new Date(currentVersion.releasedAt).toLocaleDateString()}`
                    : "Current Release"
                  }
                </p>
              </div>
              {currentVersion?.hallmarkId && (
                <div className="flex items-center gap-1 px-2 py-1 rounded-full bg-emerald-500/10 text-emerald-600 text-xs">
                  <Shield className="h-3 w-3" />
                  <span>Blockchain Verified</span>
                </div>
              )}
            </div>
            
            <ScrollArea className="h-[300px] pr-4">
              {versions.length > 0 ? (
                <div className="space-y-4">
                  {versions.map((version, index) => (
                    <div 
                      key={version.version} 
                      className={`p-4 rounded-lg border ${
                        version.isCurrent 
                          ? 'bg-amber-500/5 border-amber-500/30' 
                          : 'bg-muted/30 border-border/50'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-semibold">v{version.version}</span>
                          {version.isCurrent && (
                            <span className="text-[10px] px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-600">
                              Current
                            </span>
                          )}
                        </div>
                        <span className="text-xs text-muted-foreground">
                          {new Date(version.releasedAt).toLocaleDateString()}
                        </span>
                      </div>
                      <div className="text-sm text-muted-foreground whitespace-pre-wrap">
                        {version.changelog}
                      </div>
                      {version.hallmarkId && (
                        <div className="mt-2 pt-2 border-t border-border/30">
                          <div className="flex items-center gap-1 text-xs text-emerald-600">
                            <CheckCircle className="h-3 w-3" />
                            <span>Blockchain hallmarked</span>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <Shield className="h-12 w-12 mx-auto mb-3 opacity-30" />
                  <p>Version {CURRENT_VERSION}</p>
                  <p className="text-sm mt-1">Changelog not available</p>
                </div>
              )}
            </ScrollArea>
            
            <div className="flex justify-between items-center pt-2 border-t">
              <Link href="/blockchain-tutorial">
                <Button variant="ghost" size="sm" className="text-xs gap-1" onClick={() => setShowChangelog(false)}>
                  <Shield className="h-3 w-3" />
                  Learn about Hallmarks
                </Button>
              </Link>
              <Button variant="outline" size="sm" onClick={() => setShowChangelog(false)}>
                Close
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Report Issue Dialog */}
      <Dialog open={showReportIssue} onOpenChange={setShowReportIssue}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Bug className="h-5 w-5 text-red-500" />
              Report an Issue
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 pt-2">
            <p className="text-sm text-muted-foreground">
              Found a bug or something not working right? Let us know and our team will look into it.
            </p>
            
            <div className="space-y-3">
              <div>
                <label className="text-sm font-medium">Issue Title *</label>
                <Input
                  placeholder="Brief description of the problem"
                  value={reportForm.title}
                  onChange={(e) => setReportForm({ ...reportForm, title: e.target.value })}
                  data-testid="input-report-title"
                />
              </div>
              
              <div>
                <label className="text-sm font-medium">Description *</label>
                <Textarea
                  placeholder="What happened? What were you trying to do?"
                  value={reportForm.description}
                  onChange={(e) => setReportForm({ ...reportForm, description: e.target.value })}
                  rows={4}
                  data-testid="input-report-description"
                />
              </div>
              
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-sm font-medium">Category</label>
                  <Select
                    value={reportForm.category}
                    onValueChange={(value) => setReportForm({ ...reportForm, category: value })}
                  >
                    <SelectTrigger data-testid="select-report-category">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="general">General</SelectItem>
                      <SelectItem value="payment">Payment Issue</SelectItem>
                      <SelectItem value="order">Order Problem</SelectItem>
                      <SelectItem value="login">Login/Access</SelectItem>
                      <SelectItem value="display">Display/UI</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <label className="text-sm font-medium">Severity</label>
                  <Select
                    value={reportForm.severity}
                    onValueChange={(value) => setReportForm({ ...reportForm, severity: value })}
                  >
                    <SelectTrigger data-testid="select-report-severity">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">Low - Minor issue</SelectItem>
                      <SelectItem value="medium">Medium - Needs attention</SelectItem>
                      <SelectItem value="high">High - Blocking work</SelectItem>
                      <SelectItem value="critical">Critical - System down</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-sm font-medium">Your Name (optional)</label>
                  <Input
                    placeholder="Name"
                    value={reportForm.reporterName}
                    onChange={(e) => setReportForm({ ...reportForm, reporterName: e.target.value })}
                    data-testid="input-report-name"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Email (optional)</label>
                  <Input
                    type="email"
                    placeholder="email@example.com"
                    value={reportForm.reporterEmail}
                    onChange={(e) => setReportForm({ ...reportForm, reporterEmail: e.target.value })}
                    data-testid="input-report-email"
                  />
                </div>
              </div>
            </div>
            
            <div className="flex gap-2 justify-end pt-2">
              <Button 
                variant="outline" 
                onClick={() => setShowReportIssue(false)}
              >
                Cancel
              </Button>
              <Button 
                onClick={handleSubmitReport}
                disabled={isSubmittingReport || !reportForm.title.trim() || !reportForm.description.trim()}
                className="bg-red-600 hover:bg-red-700"
                data-testid="button-submit-report"
              >
                {isSubmittingReport ? (
                  "Submitting..."
                ) : (
                  <>
                    <Send className="h-4 w-4 mr-2" />
                    Submit Report
                  </>
                )}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Theme Selector Dialog */}
      <Dialog open={showThemeSelector} onOpenChange={setShowThemeSelector}>
        <DialogContent className="sm:max-w-[600px] max-h-[80vh]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Palette className="h-5 w-5 text-amber-600" />
              Choose Your Theme
            </DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4">
            {/* Category Tabs */}
            <div className="flex flex-wrap gap-2">
              {themeCategories.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.id)}
                  className={`px-3 py-1.5 rounded-full text-sm font-medium transition-all ${
                    selectedCategory === cat.id
                      ? "bg-amber-600 text-white"
                      : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                  }`}
                  data-testid={`theme-category-${cat.id}`}
                >
                  <span className="mr-1">{cat.icon}</span>
                  {cat.name}
                </button>
              ))}
            </div>
            
            {/* Theme Grid */}
            <ScrollArea className="h-[400px] pr-4">
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {availableThemes
                  .filter((t) => t.category === selectedCategory)
                  .map((theme) => (
                    <button
                      key={theme.id}
                      onClick={() => {
                        setTheme(theme.id);
                        toast({
                          title: "Theme Applied",
                          description: `Switched to ${theme.name}`,
                        });
                      }}
                      className={`relative p-3 rounded-xl border-2 transition-all ${
                        currentTheme.id === theme.id
                          ? "border-amber-500 ring-2 ring-amber-500/30"
                          : "border-slate-200 hover:border-amber-300"
                      }`}
                      data-testid={`theme-option-${theme.id}`}
                    >
                      {/* Theme Preview */}
                      <div className={`h-16 rounded-lg bg-gradient-to-br ${theme.colors.primary} mb-2 relative overflow-hidden`}>
                        {theme.watermark && (
                          <img
                            src={theme.watermark}
                            alt=""
                            className="absolute inset-0 w-full h-full object-contain opacity-30 p-2"
                          />
                        )}
                        <div className={`absolute bottom-1 left-1 right-1 h-2 rounded ${theme.colors.accent} opacity-80`} />
                      </div>
                      
                      {/* Theme Name */}
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-medium text-slate-700 truncate">
                          {theme.name}
                        </span>
                        {currentTheme.id === theme.id && (
                          <Check className="h-4 w-4 text-amber-600 flex-shrink-0" />
                        )}
                      </div>
                    </button>
                  ))}
              </div>
            </ScrollArea>
            
            {/* Current Theme Info */}
            <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
              <div>
                <p className="text-sm font-medium text-slate-700">Current Theme</p>
                <p className="text-xs text-slate-500">{currentTheme.name}</p>
              </div>
              <div className={`w-12 h-8 rounded-lg bg-gradient-to-br ${currentTheme.colors.primary}`} />
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}

export default SettingsMenu;

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
  Building2
} from "lucide-react";
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
import { ScrollArea } from "@/components/ui/scroll-area";
import { useToast } from "@/hooks/use-toast";

const DEVELOPER_PIN = "0424";
const ADMIN_PIN = "4444";
const CURRENT_VERSION = "1.0.0";

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
  const [isOpen, setIsOpen] = useState(false);
  const [showDevLogin, setShowDevLogin] = useState(false);
  const [showAdminLogin, setShowAdminLogin] = useState(false);
  const [showChangelog, setShowChangelog] = useState(false);
  const [versions, setVersions] = useState<AppVersion[]>([]);
  const [currentVersion, setCurrentVersion] = useState<AppVersion | null>(null);
  const [pin, setPin] = useState("");
  const [adminPin, setAdminPin] = useState("");
  const [isLoading, setIsLoading] = useState(false);

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
      if (adminPin === ADMIN_PIN) {
        toast({
          title: "Admin Access Granted",
          description: "Welcome to the Admin Panel.",
        });
        setShowAdminLogin(false);
        setAdminPin("");
        setIsOpen(false);
        setLocation("/admin");
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
    </>
  );
}

export default SettingsMenu;

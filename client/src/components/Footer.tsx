import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Code, Lock, Shield, Coffee, ExternalLink, CheckCircle, Mail, TrendingUp, FileText, ShieldCheck } from "lucide-react";
import { useLocation, Link } from "wouter";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { ScrollArea } from "@/components/ui/scroll-area";

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

export function Footer() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
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

  return (
    <>
      <motion.footer
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="fixed bottom-0 left-0 right-0 z-30"
        style={{ 
          background: 'linear-gradient(135deg, #1a0f09 0%, #2d1810 50%, #3d2216 100%)'
        }}
      >
        <div className="container max-w-5xl mx-auto px-4 py-2">
          {/* Top row - Navigation Links */}
          <div className="flex items-center justify-center gap-4 text-xs text-amber-200/70 mb-1.5 flex-wrap">
            <Link href="/terms">
              <button
                className="flex items-center gap-1 hover:text-amber-400 transition-colors"
                data-testid="link-terms"
              >
                <FileText className="h-3 w-3" />
                <span>Terms & Conditions</span>
              </button>
            </Link>
            <span className="text-amber-700/50">•</span>
            <Link href="/contact">
              <button
                className="flex items-center gap-1 hover:text-amber-400 transition-colors"
                data-testid="link-contact"
              >
                <Mail className="h-3 w-3" />
                <span>Contact Us</span>
              </button>
            </Link>
            <span className="text-amber-700/50">•</span>
            <Link href="/investor">
              <button
                className="flex items-center gap-1 hover:text-amber-400 transition-colors font-semibold"
                data-testid="link-investor"
              >
                <TrendingUp className="h-3 w-3" />
                <span>Investors & Franchise</span>
              </button>
            </Link>
            <span className="text-amber-700/50">•</span>
            <button
              onClick={() => setShowAdminLogin(true)}
              className="flex items-center gap-1 hover:text-amber-400 transition-colors"
              data-testid="button-admin-login"
            >
              <ShieldCheck className="h-3 w-3" />
              <span>Admin</span>
            </button>
          </div>
          
          {/* Bottom row - Company info */}
          <div className="flex items-center justify-center gap-2 text-[10px] text-amber-300/50">
            <span>Powered by</span>
            <a 
              href="https://darkwavestudios.io" 
              target="_blank" 
              rel="noopener noreferrer"
              className="font-serif font-semibold text-amber-200/70 hover:text-amber-400 transition-colors underline-offset-2 hover:underline"
              data-testid="link-darkwave"
            >
              Darkwave Studios, LLC
            </a>
            <span className="mx-0.5">•</span>
            <span>&copy; 2025</span>
            <span className="mx-0.5">•</span>
            <button
              onClick={() => setShowChangelog(true)}
              className="flex items-center gap-1 text-amber-300/50 hover:text-amber-400 transition-colors"
              data-testid="button-version"
            >
              <Shield className="h-2.5 w-2.5" />
              <span>v{currentVersion?.version || CURRENT_VERSION}</span>
            </button>
            <span className="mx-0.5">•</span>
            <button
              onClick={() => setShowDevLogin(true)}
              className="flex items-center gap-1 text-amber-300/50 hover:text-amber-400 transition-colors"
              data-testid="button-dev-login"
            >
              <Code className="h-2.5 w-2.5" />
              <span>Developer</span>
            </button>
          </div>
        </div>
      </motion.footer>

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

export default Footer;

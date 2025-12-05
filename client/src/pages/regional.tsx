import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import { 
  ArrowLeft, MapPin, Users, Package, DollarSign, TrendingUp, 
  Building2, Phone, Mail, Briefcase, Calendar, Activity,
  CreditCard, FileText, UserCircle, LogOut, RefreshCw,
  Globe, Target, Clock, CheckCircle, AlertCircle, Download,
  ChevronDown, ChevronUp, Star, Sparkles, Shield, Lock, AlertTriangle,
  BarChart3, Rocket, Award, CheckCircle2
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import QRCode from "react-qr-code";

interface Region {
  id: string;
  name: string;
  code: string;
  state: string;
  cities: string[] | null;
  status: string;
  targetRevenue: string | null;
}

interface RegionalManager {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  pin?: string | null;
  role: string;
  regionId: string | null;
  title: string | null;
  photoUrl: string | null;
  linkedinUrl: string | null;
  isActive: boolean;
  mustChangePin?: boolean;
  hasSeenWelcome?: boolean;
  hireDate: string | null;
  salesTarget: string | null;
}

interface RegionStats {
  totalClients: number;
  totalOrders: number;
  totalRevenue: string;
  activeManagers: number;
}

export default function RegionalDashboard() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loginPin, setLoginPin] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  
  const [manager, setManager] = useState<RegionalManager | null>(null);
  const [region, setRegion] = useState<Region | null>(null);
  const [stats, setStats] = useState<RegionStats | null>(null);
  const [activeTab, setActiveTab] = useState("overview");
  
  // Modal states
  const [showWelcomeModal, setShowWelcomeModal] = useState(false);
  const [showPinChangeModal, setShowPinChangeModal] = useState(false);
  const [newPin, setNewPin] = useState("");
  const [confirmPin, setConfirmPin] = useState("");
  const [pinChangeLoading, setPinChangeLoading] = useState(false);
  
  // 30-day persistence option
  const [rememberMe, setRememberMe] = useState(false);
  
  // Partner-only: All managers list
  const [allManagers, setAllManagers] = useState<RegionalManager[]>([]);
  const [allRegions, setAllRegions] = useState<Region[]>([]);

  useEffect(() => {
    const storedSession = localStorage.getItem("regional_session");
    if (storedSession) {
      const data = JSON.parse(storedSession);
      
      // Check if session has expired
      if (data.expiresAt && Date.now() > data.expiresAt) {
        localStorage.removeItem("regional_session");
        return;
      }
      
      if (data.token && data.manager) {
        setManager(data.manager);
        setRegion(data.region);
        setIsAuthenticated(true);
        fetchStats(data.token);
        
        // Partner: fetch all managers
        if (data.manager.role === "partner") {
          fetchAllManagers(data.token);
        }
        
        // Check if PIN change is still required
        if (data.manager.mustChangePin) {
          setShowPinChangeModal(true);
        } else if (data.manager.role === "partner" && !data.manager.hasSeenWelcome) {
          setShowWelcomeModal(true);
        }
      }
    }
  }, []);

  const getSessionToken = (): string => {
    const storedSession = localStorage.getItem("regional_session");
    if (storedSession) {
      const data = JSON.parse(storedSession);
      return data.token || "";
    }
    return "";
  };

  const fetchStats = async (token?: string) => {
    const sessionToken = token || getSessionToken();
    if (!sessionToken) return;
    
    try {
      const response = await fetch("/api/regional/my-stats", {
        headers: {
          "x-regional-token": sessionToken
        }
      });
      if (response.ok) {
        const data = await response.json();
        setStats(data);
      } else if (response.status === 401) {
        handleLogout();
      }
    } catch (error) {
      console.error("Failed to fetch stats:", error);
    }
  };

  // Fetch all managers for partner view
  const fetchAllManagers = async (token?: string) => {
    const sessionToken = token || getSessionToken();
    if (!sessionToken) return;
    
    try {
      const response = await fetch("/api/regional/all-managers", {
        headers: {
          "x-regional-token": sessionToken
        }
      });
      if (response.ok) {
        const data = await response.json();
        setAllManagers(data.managers || []);
        setAllRegions(data.regions || []);
      }
    } catch (error) {
      console.error("Failed to fetch all managers:", error);
    }
  };

  // Handle PIN change
  const handlePinChange = async () => {
    if (newPin !== confirmPin) {
      toast({
        title: "PINs Don't Match",
        description: "Please make sure both PINs are the same.",
        variant: "destructive"
      });
      return;
    }
    
    if (newPin.length !== 4 || !/^\d{4}$/.test(newPin)) {
      toast({
        title: "Invalid PIN",
        description: "PIN must be exactly 4 digits.",
        variant: "destructive"
      });
      return;
    }
    
    setPinChangeLoading(true);
    
    try {
      const response = await fetch("/api/regional-managers/change-pin", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-regional-token": getSessionToken()
        },
        body: JSON.stringify({ newPin })
      });
      
      if (response.ok) {
        const data = await response.json();
        setManager(data.manager);
        
        // Update stored session
        const storedSession = localStorage.getItem("regional_session");
        if (storedSession) {
          const sessionData = JSON.parse(storedSession);
          sessionData.manager = data.manager;
          localStorage.setItem("regional_session", JSON.stringify(sessionData));
        }
        
        setShowPinChangeModal(false);
        setNewPin("");
        setConfirmPin("");
        
        toast({
          title: "PIN Updated!",
          description: "Your new PIN is now active. Please remember it for future logins."
        });
        
        // If partner hasn't seen welcome, show welcome modal
        if (manager?.role === "partner" && !manager?.hasSeenWelcome) {
          setShowWelcomeModal(true);
        }
      } else {
        const error = await response.json();
        toast({
          title: "Error",
          description: error.error || "Failed to update PIN",
          variant: "destructive"
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update PIN. Please try again.",
        variant: "destructive"
      });
    } finally {
      setPinChangeLoading(false);
    }
  };

  // Acknowledge welcome modal
  const acknowledgeWelcome = async () => {
    try {
      const response = await fetch("/api/regional-managers/acknowledge-welcome", {
        method: "POST",
        headers: {
          "x-regional-token": getSessionToken()
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setManager(data.manager);
        
        // Update stored session
        const storedSession = localStorage.getItem("regional_session");
        if (storedSession) {
          const sessionData = JSON.parse(storedSession);
          sessionData.manager = data.manager;
          localStorage.setItem("regional_session", JSON.stringify(sessionData));
        }
      }
    } catch (error) {
      console.error("Failed to acknowledge welcome:", error);
    }
    
    setShowWelcomeModal(false);
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await fetch("/api/regional-managers/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ pin: loginPin })
      });

      if (!response.ok) {
        const error = await response.json();
        toast({
          title: "Access Denied",
          description: error.error || "Invalid PIN",
          variant: "destructive"
        });
        setLoginPin("");
        setIsLoading(false);
        return;
      }

      const data = await response.json();
      
      // Set session expiry based on remember me choice
      const sessionExpiry = rememberMe 
        ? Date.now() + (30 * 24 * 60 * 60 * 1000) // 30 days
        : Date.now() + (24 * 60 * 60 * 1000); // 24 hours
      
      // Store session with server-generated token
      localStorage.setItem("regional_session", JSON.stringify({
        token: data.token,
        manager: data.manager,
        region: data.region,
        expiresAt: sessionExpiry,
        rememberMe: rememberMe
      }));
      setManager(data.manager);
      setRegion(data.region);
      setIsAuthenticated(true);
      
      if (data.token) {
        // Fetch stats using the server-generated token
        fetchStats(data.token);
        
        // If partner, fetch all managers
        if (data.manager.role === "partner") {
          fetchAllManagers(data.token);
        }
      }

      // Check if PIN change is required
      if (data.manager.mustChangePin) {
        setShowPinChangeModal(true);
      } else if (data.manager.role === "partner" && !data.manager.hasSeenWelcome) {
        // Show welcome modal for partner if not seen
        setShowWelcomeModal(true);
      }

      toast({
        title: "Welcome!",
        description: `Hello, ${data.manager.name}!`
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Login failed. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = async () => {
    const token = getSessionToken();
    if (token) {
      try {
        await fetch("/api/regional-managers/logout", {
          method: "POST",
          headers: { "x-regional-token": token }
        });
      } catch (error) {
        console.error("Logout error:", error);
      }
    }
    localStorage.removeItem("regional_session");
    setManager(null);
    setRegion(null);
    setStats(null);
    setIsAuthenticated(false);
    setLoginPin("");
  };

  const seedDemoData = async () => {
    try {
      const response = await fetch("/api/regional-managers/seed-demo", {
        method: "POST"
      });
      if (response.ok) {
        toast({
          title: "Demo Data Created",
          description: "Use PIN 1234 to login as demo regional manager"
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create demo data",
        variant: "destructive"
      });
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-amber-100">
        <div className="max-w-md mx-auto px-4 py-20">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <Card className="border-0 shadow-2xl overflow-hidden">
              <div className="bg-gradient-to-r from-amber-700 to-amber-800 p-6 text-white">
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-white/20 rounded-xl">
                    <Building2 className="h-8 w-8" />
                  </div>
                  <div>
                    <h1 className="text-2xl font-serif font-bold">Regional Manager Portal</h1>
                    <p className="text-amber-100 text-sm">Brew & Board Coffee</p>
                  </div>
                </div>
              </div>
              
              <CardContent className="p-6">
                <form onSubmit={handleLogin} className="space-y-4">
                  <div className="space-y-2">
                    <Label className="text-xs uppercase tracking-widest text-muted-foreground font-semibold">
                      Enter Your 4-Digit PIN
                    </Label>
                    <Input
                      type="password"
                      inputMode="numeric"
                      maxLength={4}
                      value={loginPin}
                      onChange={(e) => setLoginPin(e.target.value.replace(/\D/g, ''))}
                      className="text-center text-2xl tracking-[0.5em] font-mono h-14"
                      placeholder="••••"
                      data-testid="input-regional-pin"
                    />
                  </div>
                  
                  <div className="space-y-3 bg-muted/50 p-3 rounded-lg border border-border/30">
                    <div className="flex items-center space-x-2">
                      <Checkbox 
                        id="persist-regional-login" 
                        checked={rememberMe}
                        onCheckedChange={(checked) => setRememberMe(checked === true)}
                        data-testid="checkbox-regional-remember"
                      />
                      <label
                        htmlFor="persist-regional-login"
                        className="text-sm font-medium leading-none cursor-pointer"
                      >
                        Keep me logged in for 30 days
                      </label>
                    </div>
                    
                    <AnimatePresence>
                      {rememberMe && (
                        <motion.div 
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: "auto" }}
                          exit={{ opacity: 0, height: 0 }}
                          className="flex items-start gap-2 text-amber-600 text-xs bg-amber-50 dark:bg-amber-950/30 p-2 rounded"
                        >
                          <AlertTriangle className="h-4 w-4 flex-shrink-0 mt-0.5" />
                          <span>Warning: Your account will be accessible to anyone who uses this device.</span>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                  
                  <Button 
                    type="submit" 
                    className="w-full bg-amber-700 hover:bg-amber-800"
                    disabled={loginPin.length !== 4 || isLoading}
                    data-testid="button-regional-login"
                  >
                    {isLoading ? "Authenticating..." : "Access Dashboard"}
                  </Button>
                </form>

                <div className="mt-6 pt-6 border-t">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setLocation("/")}
                    className="w-full text-muted-foreground"
                    data-testid="button-back-home"
                  >
                    <ArrowLeft className="h-4 w-4 mr-2" /> Back to Main Site
                  </Button>
                </div>

                <div className="mt-4 text-center">
                  <Button
                    variant="link"
                    size="sm"
                    onClick={seedDemoData}
                    className="text-xs text-muted-foreground"
                  >
                    Create Demo Manager (PIN: 1234)
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    );
  }

  // Block access if PIN change is required
  const isPinChangeRequired = manager?.mustChangePin === true;

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-amber-100">
      {/* Blocking overlay when PIN change required */}
      {isPinChangeRequired && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 flex items-center justify-center">
          <Card className="max-w-md mx-4 border-0 shadow-2xl">
            <CardContent className="p-8 text-center">
              <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-amber-500 to-orange-600 rounded-2xl flex items-center justify-center">
                <Lock className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-xl font-bold mb-2">PIN Change Required</h3>
              <p className="text-muted-foreground mb-4">
                Please set your personal PIN to continue accessing the dashboard.
              </p>
              <Button 
                onClick={() => setShowPinChangeModal(true)}
                className="w-full bg-gradient-to-r from-amber-600 to-orange-600"
              >
                Set My PIN Now
              </Button>
            </CardContent>
          </Card>
        </div>
      )}
      
      <div className="max-w-7xl mx-auto px-4 py-6">
        <header className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setLocation("/")}
              data-testid="button-back"
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div>
              <h1 className="text-2xl font-serif font-bold text-amber-900">
                Regional Dashboard
              </h1>
              <p className="text-sm text-muted-foreground flex items-center gap-2">
                <MapPin className="h-4 w-4" />
                {region?.name || "No Region Assigned"}
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <Badge variant="outline" className="bg-emerald-500/10 text-emerald-700 border-emerald-200">
              <CheckCircle className="h-3 w-3 mr-1" /> Active
            </Badge>
            <Button
              variant="outline"
              size="sm"
              onClick={handleLogout}
              data-testid="button-logout"
            >
              <LogOut className="h-4 w-4 mr-2" /> Logout
            </Button>
          </div>
        </header>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6"
        >
          <Card className="bg-gradient-to-r from-amber-700 via-amber-800 to-amber-900 text-white border-0">
            <CardContent className="p-6">
              <div className="flex flex-wrap gap-6 items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded-full bg-white/20 flex items-center justify-center">
                    <UserCircle className="h-10 w-10" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold">{manager?.name}</h2>
                    <p className="text-amber-200">{manager?.title}</p>
                    <div className="flex items-center gap-3 mt-1 text-sm text-amber-200">
                      <span className="flex items-center gap-1">
                        <Mail className="h-3 w-3" /> {manager?.email}
                      </span>
                      {manager?.phone && (
                        <span className="flex items-center gap-1">
                          <Phone className="h-3 w-3" /> {manager?.phone}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="text-center p-3 bg-white/10 rounded-lg">
                    <Users className="h-5 w-5 mx-auto mb-1" />
                    <p className="text-2xl font-bold">{stats?.totalClients || 0}</p>
                    <p className="text-xs text-amber-200">Clients</p>
                  </div>
                  <div className="text-center p-3 bg-white/10 rounded-lg">
                    <Package className="h-5 w-5 mx-auto mb-1" />
                    <p className="text-2xl font-bold">{stats?.totalOrders || 0}</p>
                    <p className="text-xs text-amber-200">Orders</p>
                  </div>
                  <div className="text-center p-3 bg-white/10 rounded-lg">
                    <DollarSign className="h-5 w-5 mx-auto mb-1" />
                    <p className="text-2xl font-bold">${stats?.totalRevenue || "0"}</p>
                    <p className="text-xs text-amber-200">Revenue</p>
                  </div>
                  <div className="text-center p-3 bg-white/10 rounded-lg">
                    <Target className="h-5 w-5 mx-auto mb-1" />
                    <p className="text-2xl font-bold">${manager?.salesTarget || "0"}</p>
                    <p className="text-xs text-amber-200">Target</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-4 lg:w-auto lg:inline-grid">
            <TabsTrigger value="overview" data-testid="tab-overview">
              <Activity className="h-4 w-4 mr-2" /> Overview
            </TabsTrigger>
            <TabsTrigger value="crm" data-testid="tab-crm">
              <Users className="h-4 w-4 mr-2" /> CRM
            </TabsTrigger>
            <TabsTrigger value="orders" data-testid="tab-orders">
              <Package className="h-4 w-4 mr-2" /> Orders
            </TabsTrigger>
            <TabsTrigger value="business-card" data-testid="tab-business-card">
              <CreditCard className="h-4 w-4 mr-2" /> Business Card
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="mt-6">
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Globe className="h-5 w-5 text-amber-600" />
                    Territory
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Region</span>
                      <span className="font-medium">{region?.name}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Code</span>
                      <Badge variant="outline">{region?.code}</Badge>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">State</span>
                      <span className="font-medium">{region?.state}</span>
                    </div>
                    <div className="flex justify-between items-start">
                      <span className="text-muted-foreground">Cities</span>
                      <div className="text-right">
                        {region?.cities?.map((city, i) => (
                          <Badge key={i} variant="secondary" className="ml-1 mb-1">
                            {city}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="h-5 w-5 text-emerald-600" />
                    Performance
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span>Revenue vs Target</span>
                        <span className="font-medium">
                          {((parseFloat(stats?.totalRevenue || "0") / parseFloat(manager?.salesTarget || "1")) * 100).toFixed(0)}%
                        </span>
                      </div>
                      <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-gradient-to-r from-emerald-500 to-teal-500 rounded-full"
                          style={{ width: `${Math.min(100, (parseFloat(stats?.totalRevenue || "0") / parseFloat(manager?.salesTarget || "1")) * 100)}%` }}
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4 pt-2">
                      <div className="text-center p-3 bg-emerald-50 rounded-lg">
                        <p className="text-2xl font-bold text-emerald-700">{stats?.activeManagers || 1}</p>
                        <p className="text-xs text-muted-foreground">Team Members</p>
                      </div>
                      <div className="text-center p-3 bg-amber-50 rounded-lg">
                        <p className="text-2xl font-bold text-amber-700">${region?.targetRevenue || "0"}</p>
                        <p className="text-xs text-muted-foreground">Region Target</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Clock className="h-5 w-5 text-blue-600" />
                    Quick Actions
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <Button className="w-full justify-start" variant="outline" onClick={() => setActiveTab("crm")}>
                    <Users className="h-4 w-4 mr-2" /> View Clients
                  </Button>
                  <Button className="w-full justify-start" variant="outline" onClick={() => setActiveTab("orders")}>
                    <Package className="h-4 w-4 mr-2" /> View Orders
                  </Button>
                  <Button className="w-full justify-start" variant="outline" onClick={() => setActiveTab("business-card")}>
                    <CreditCard className="h-4 w-4 mr-2" /> Generate Business Card
                  </Button>
                  <Button className="w-full justify-start" variant="outline">
                    <FileText className="h-4 w-4 mr-2" /> Export Report
                  </Button>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="crm" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Your Clients (Tenant-Isolated)</CardTitle>
                <CardDescription>
                  CRM data is separated by account. You only see clients assigned to your territory.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-12 text-muted-foreground">
                  <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p className="text-lg font-medium">No clients yet</p>
                  <p className="text-sm">Start adding clients to build your territory CRM</p>
                  <Button className="mt-4">
                    Add First Client
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="orders" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Territory Orders</CardTitle>
                <CardDescription>
                  Orders from clients in your assigned territory
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-12 text-muted-foreground">
                  <Package className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p className="text-lg font-medium">No orders yet</p>
                  <p className="text-sm">Orders will appear here once clients place them</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="business-card" className="mt-6">
            <div className="grid md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Digital Business Card</CardTitle>
                  <CardDescription>
                    Share your professional details with clients
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="bg-gradient-to-br from-amber-800 to-amber-900 text-white rounded-xl p-6 shadow-xl">
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <h3 className="text-xl font-serif font-bold">Brew & Board Coffee</h3>
                        <p className="text-amber-200 text-sm">Premium B2B Catering</p>
                      </div>
                      <div className="text-right">
                        <Badge className="bg-amber-600/50 text-white border-0">
                          {region?.code}
                        </Badge>
                      </div>
                    </div>
                    
                    <div className="border-t border-amber-700/50 pt-4 mt-4">
                      <h4 className="text-lg font-semibold">{manager?.name}</h4>
                      <p className="text-amber-200 text-sm">{manager?.title}</p>
                      
                      <div className="mt-3 space-y-1 text-sm">
                        <p className="flex items-center gap-2">
                          <Mail className="h-4 w-4 text-amber-300" />
                          {manager?.email}
                        </p>
                        {manager?.phone && (
                          <p className="flex items-center gap-2">
                            <Phone className="h-4 w-4 text-amber-300" />
                            {manager?.phone}
                          </p>
                        )}
                        <p className="flex items-center gap-2">
                          <MapPin className="h-4 w-4 text-amber-300" />
                          {region?.name}, {region?.state}
                        </p>
                      </div>
                    </div>
                    
                    <div className="mt-4 pt-4 border-t border-amber-700/50 text-center">
                      <p className="text-xs text-amber-300">brewandboard.coffee</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>QR Code</CardTitle>
                  <CardDescription>
                    Scan to view contact details
                  </CardDescription>
                </CardHeader>
                <CardContent className="flex flex-col items-center">
                  <div className="bg-white p-4 rounded-xl shadow-lg">
                    <QRCode
                      value={`https://brewandboard.coffee/contact/${manager?.id || 'demo'}`}
                      size={180}
                      level="H"
                    />
                  </div>
                  <p className="text-sm text-muted-foreground mt-4 text-center">
                    Share this QR code with potential clients
                  </p>
                  <Button className="mt-4" variant="outline">
                    <Download className="h-4 w-4 mr-2" /> Download Card
                  </Button>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>

      {/* Partner Team Accordion Section - Only visible to Partners */}
      {manager?.role === "partner" && (
        <div className="max-w-7xl mx-auto px-4 pb-8">
          <Card className="border-0 shadow-xl overflow-hidden">
            <CardHeader className="bg-gradient-to-r from-purple-600 to-indigo-700 text-white">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-white/20 rounded-lg">
                  <Users className="h-6 w-6" />
                </div>
                <div>
                  <CardTitle className="text-white flex items-center gap-2">
                    Team Overview 
                    <Sparkles className="h-4 w-4 text-yellow-300" />
                  </CardTitle>
                  <CardDescription className="text-purple-200">
                    All regional managers across territories
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-6">
              {allManagers.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No regional managers yet</p>
                  <p className="text-sm">New managers can join with PIN 5555</p>
                </div>
              ) : (
                <Accordion type="single" collapsible className="space-y-3">
                  {allManagers.map((mgr, index) => {
                    const mgrRegion = allRegions.find(r => r.id === mgr.regionId);
                    return (
                      <AccordionItem 
                        key={mgr.id} 
                        value={mgr.id}
                        className="border rounded-xl overflow-hidden bg-gradient-to-r from-slate-50 to-white shadow-sm hover:shadow-md transition-all"
                      >
                        <AccordionTrigger className="px-4 py-3 hover:no-underline">
                          <div className="flex items-center gap-4 w-full">
                            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center text-white font-bold text-lg shadow-lg">
                              {mgr.name.charAt(0)}
                            </div>
                            <div className="flex-1 text-left">
                              <div className="flex items-center gap-2">
                                <span className="font-semibold">{mgr.name}</span>
                                {mgr.role === "partner" && (
                                  <Badge className="bg-gradient-to-r from-purple-500 to-indigo-600 text-white text-xs">
                                    <Star className="h-3 w-3 mr-1" /> Partner
                                  </Badge>
                                )}
                                {mgr.role === "regional_manager" && (
                                  <Badge variant="outline" className="text-xs">
                                    Regional Manager
                                  </Badge>
                                )}
                              </div>
                              <p className="text-sm text-muted-foreground">
                                {mgrRegion?.name || "Unassigned"} • {mgr.title}
                              </p>
                            </div>
                            <div className="text-right mr-4">
                              {mgr.isActive ? (
                                <Badge className="bg-green-100 text-green-700 border-green-200">
                                  <CheckCircle className="h-3 w-3 mr-1" /> Active
                                </Badge>
                              ) : (
                                <Badge variant="secondary">Inactive</Badge>
                              )}
                            </div>
                          </div>
                        </AccordionTrigger>
                        <AccordionContent className="px-4 pb-4">
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
                            <div className="bg-slate-50 rounded-lg p-4">
                              <div className="flex items-center gap-2 text-muted-foreground mb-2">
                                <Mail className="h-4 w-4" />
                                <span className="text-xs font-medium">EMAIL</span>
                              </div>
                              <p className="text-sm font-medium truncate">{mgr.email}</p>
                            </div>
                            <div className="bg-slate-50 rounded-lg p-4">
                              <div className="flex items-center gap-2 text-muted-foreground mb-2">
                                <MapPin className="h-4 w-4" />
                                <span className="text-xs font-medium">TERRITORY</span>
                              </div>
                              <p className="text-sm font-medium">
                                {mgrRegion ? `${mgrRegion.name}, ${mgrRegion.state}` : "Not assigned"}
                              </p>
                            </div>
                            <div className="bg-slate-50 rounded-lg p-4">
                              <div className="flex items-center gap-2 text-muted-foreground mb-2">
                                <Target className="h-4 w-4" />
                                <span className="text-xs font-medium">SALES TARGET</span>
                              </div>
                              <p className="text-sm font-medium">
                                ${parseFloat(mgr.salesTarget || "0").toLocaleString()}
                              </p>
                            </div>
                          </div>
                        </AccordionContent>
                      </AccordionItem>
                    );
                  })}
                </Accordion>
              )}
            </CardContent>
          </Card>

          {/* Business Intelligence Section - Partner Only */}
          <Card className="border-0 shadow-xl overflow-hidden mt-6">
            <CardHeader className="bg-gradient-to-r from-emerald-600 to-teal-700 text-white">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-white/20 rounded-lg">
                  <BarChart3 className="h-6 w-6" />
                </div>
                <div>
                  <CardTitle className="text-white flex items-center gap-2">
                    Business Intelligence 
                    <Sparkles className="h-4 w-4 text-yellow-300" />
                  </CardTitle>
                  <CardDescription className="text-emerald-200">
                    Valuation tracking, milestones, and growth metrics
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-6 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="p-4 rounded-xl bg-gradient-to-br from-emerald-50 to-teal-50 border border-emerald-200">
                  <div className="flex items-center gap-2 mb-2">
                    <DollarSign className="h-5 w-5 text-emerald-600" />
                    <span className="font-semibold text-emerald-800">Current Stage</span>
                  </div>
                  <p className="text-2xl font-bold text-emerald-700">MVP</p>
                  <p className="text-sm text-emerald-600">Pre-Revenue</p>
                </div>
                <div className="p-4 rounded-xl bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-200">
                  <div className="flex items-center gap-2 mb-2">
                    <Target className="h-5 w-5 text-blue-600" />
                    <span className="font-semibold text-blue-800">Est. Valuation</span>
                  </div>
                  <p className="text-2xl font-bold text-blue-700">$500K - $2M</p>
                  <p className="text-sm text-blue-600">MVP Stage</p>
                </div>
                <div className="p-4 rounded-xl bg-gradient-to-br from-purple-50 to-violet-50 border border-purple-200">
                  <div className="flex items-center gap-2 mb-2">
                    <Building2 className="h-5 w-5 text-purple-600" />
                    <span className="font-semibold text-purple-800">Market Size</span>
                  </div>
                  <p className="text-2xl font-bold text-purple-700">$60B</p>
                  <p className="text-sm text-purple-600">Corporate Catering</p>
                </div>
                <div className="p-4 rounded-xl bg-gradient-to-br from-amber-50 to-orange-50 border border-amber-200">
                  <div className="flex items-center gap-2 mb-2">
                    <TrendingUp className="h-5 w-5 text-amber-600" />
                    <span className="font-semibold text-amber-800">Growth Rate</span>
                  </div>
                  <p className="text-2xl font-bold text-amber-700">50%</p>
                  <p className="text-sm text-amber-600">Faster than industry</p>
                </div>
              </div>

              <div className="border rounded-xl bg-white/50 backdrop-blur p-4">
                <h4 className="font-semibold text-lg mb-4 flex items-center gap-2">
                  <Rocket className="h-5 w-5 text-indigo-600" />
                  Valuation Scenarios
                </h4>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left py-2 px-3 font-semibold">Stage</th>
                        <th className="text-left py-2 px-3 font-semibold">ARR Target</th>
                        <th className="text-left py-2 px-3 font-semibold">Multiple</th>
                        <th className="text-left py-2 px-3 font-semibold">Valuation</th>
                        <th className="text-left py-2 px-3 font-semibold">Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr className="border-b bg-emerald-50/50">
                        <td className="py-2 px-3 font-medium">MVP (Current)</td>
                        <td className="py-2 px-3">Pre-Revenue</td>
                        <td className="py-2 px-3">-</td>
                        <td className="py-2 px-3 font-semibold text-emerald-700">$500K - $2M</td>
                        <td className="py-2 px-3"><Badge className="bg-emerald-100 text-emerald-700 border-emerald-200">Active</Badge></td>
                      </tr>
                      <tr className="border-b">
                        <td className="py-2 px-3 font-medium">Seed</td>
                        <td className="py-2 px-3">$100K</td>
                        <td className="py-2 px-3">4-6x</td>
                        <td className="py-2 px-3 font-semibold">$1.5M - $3M</td>
                        <td className="py-2 px-3"><Badge variant="outline">Target</Badge></td>
                      </tr>
                      <tr className="border-b">
                        <td className="py-2 px-3 font-medium">Series A</td>
                        <td className="py-2 px-3">$500K</td>
                        <td className="py-2 px-3">5-7x</td>
                        <td className="py-2 px-3 font-semibold">$5M - $10M</td>
                        <td className="py-2 px-3"><Badge variant="outline">Milestone</Badge></td>
                      </tr>
                      <tr className="border-b">
                        <td className="py-2 px-3 font-medium">Growth</td>
                        <td className="py-2 px-3">$3M</td>
                        <td className="py-2 px-3">6-10x</td>
                        <td className="py-2 px-3 font-semibold">$18M - $30M</td>
                        <td className="py-2 px-3"><Badge variant="outline">Vision</Badge></td>
                      </tr>
                      <tr>
                        <td className="py-2 px-3 font-medium">Scale (ezCater)</td>
                        <td className="py-2 px-3">$50M+</td>
                        <td className="py-2 px-3">10x+</td>
                        <td className="py-2 px-3 font-semibold">$500M+</td>
                        <td className="py-2 px-3"><Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-200">Aspirational</Badge></td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="border rounded-xl bg-white/50 backdrop-blur p-4">
                  <h4 className="font-semibold text-lg mb-4 flex items-center gap-2">
                    <Award className="h-5 w-5 text-amber-600" />
                    Premium Value Drivers
                  </h4>
                  <div className="space-y-2">
                    <div className="flex items-center gap-3 p-2 rounded-lg bg-gradient-to-r from-amber-50/50 to-transparent">
                      <CheckCircle2 className="h-4 w-4 text-emerald-500 flex-shrink-0" />
                      <div>
                        <p className="font-medium text-sm">Blockchain Verification</p>
                        <p className="text-xs text-muted-foreground">+10-15% premium</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 p-2 rounded-lg bg-gradient-to-r from-amber-50/50 to-transparent">
                      <CheckCircle2 className="h-4 w-4 text-emerald-500 flex-shrink-0" />
                      <div>
                        <p className="font-medium text-sm">B2B Focus</p>
                        <p className="text-xs text-muted-foreground">+15-20% vs consumer</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 p-2 rounded-lg bg-gradient-to-r from-amber-50/50 to-transparent">
                      <CheckCircle2 className="h-4 w-4 text-emerald-500 flex-shrink-0" />
                      <div>
                        <p className="font-medium text-sm">Virtual Host Multi-Location</p>
                        <p className="text-xs text-muted-foreground">+10% unique capability</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 p-2 rounded-lg bg-gradient-to-r from-amber-50/50 to-transparent">
                      <CheckCircle2 className="h-4 w-4 text-emerald-500 flex-shrink-0" />
                      <div>
                        <p className="font-medium text-sm">Franchise Model</p>
                        <p className="text-xs text-muted-foreground">Scalability multiplier</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="border rounded-xl bg-white/50 backdrop-blur p-4">
                  <h4 className="font-semibold text-lg mb-4 flex items-center gap-2">
                    <Users className="h-5 w-5 text-blue-600" />
                    Revenue Projections
                  </h4>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b">
                          <th className="text-left py-1 px-2 font-semibold text-xs">Tier</th>
                          <th className="text-left py-1 px-2 font-semibold text-xs">Price</th>
                          <th className="text-left py-1 px-2 font-semibold text-xs">500 Subs</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr className="border-b">
                          <td className="py-1 px-2">Starter</td>
                          <td className="py-1 px-2">$29/mo</td>
                          <td className="py-1 px-2 text-emerald-600 font-medium">$174K/yr</td>
                        </tr>
                        <tr className="border-b">
                          <td className="py-1 px-2">Professional</td>
                          <td className="py-1 px-2">$79/mo</td>
                          <td className="py-1 px-2 text-emerald-600 font-medium">$474K/yr</td>
                        </tr>
                        <tr>
                          <td className="py-1 px-2">Enterprise</td>
                          <td className="py-1 px-2">$199/mo</td>
                          <td className="py-1 px-2 text-emerald-600 font-medium">$1.19M/yr</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                  <p className="text-xs text-muted-foreground mt-3">Plus: 15% service fees, hallmark minting, franchise fees</p>
                </div>
              </div>

              <div className="border rounded-xl bg-gradient-to-br from-indigo-50 to-purple-50 p-4">
                <h4 className="font-semibold text-lg mb-4 flex items-center gap-2">
                  <Target className="h-5 w-5 text-indigo-600" />
                  Key Metrics to Track
                </h4>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="text-center p-3 bg-white/60 rounded-lg">
                    <p className="text-xs text-muted-foreground mb-1">Monthly Active Users</p>
                    <p className="text-xl font-bold text-indigo-700">--</p>
                  </div>
                  <div className="text-center p-3 bg-white/60 rounded-lg">
                    <p className="text-xs text-muted-foreground mb-1">MRR</p>
                    <p className="text-xl font-bold text-indigo-700">$0</p>
                  </div>
                  <div className="text-center p-3 bg-white/60 rounded-lg">
                    <p className="text-xs text-muted-foreground mb-1">Orders/Month</p>
                    <p className="text-xl font-bold text-indigo-700">--</p>
                  </div>
                  <div className="text-center p-3 bg-white/60 rounded-lg">
                    <p className="text-xs text-muted-foreground mb-1">Churn Rate</p>
                    <p className="text-xl font-bold text-indigo-700">--</p>
                  </div>
                </div>
                <p className="text-xs text-muted-foreground mt-3 text-center">Target: NRR &gt;110%, Churn &lt;6%, Rule of 40</p>
              </div>

              <div className="border rounded-xl bg-white/50 backdrop-blur p-4">
                <h4 className="font-semibold text-lg mb-3 flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-emerald-600" />
                  Comparable: ezCater (Market Leader)
                </h4>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                  <div>
                    <p className="text-muted-foreground">Valuation</p>
                    <p className="font-bold text-lg">$1.6B</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Total Funding</p>
                    <p className="font-bold text-lg">$425M+</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Restaurant Network</p>
                    <p className="font-bold text-lg">82,000+</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Founded</p>
                    <p className="font-bold text-lg">2007</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* PIN Change Modal */}
      <Dialog open={showPinChangeModal} onOpenChange={() => {}}>
        <DialogContent className="sm:max-w-md" onPointerDownOutside={(e) => e.preventDefault()}>
          <DialogHeader>
            <div className="flex items-center gap-3 mb-2">
              <div className="p-3 bg-gradient-to-br from-amber-500 to-orange-600 rounded-xl text-white">
                <Lock className="h-6 w-6" />
              </div>
              <div>
                <DialogTitle className="text-xl">Set Your Personal PIN</DialogTitle>
                <DialogDescription>
                  Create a unique 4-digit PIN for secure access
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <Shield className="h-5 w-5 text-amber-600 mt-0.5" />
                <div className="text-sm text-amber-800">
                  <p className="font-medium">Security First</p>
                  <p className="text-amber-700">Choose a PIN you'll remember but others can't guess. Avoid birthdays or simple patterns.</p>
                </div>
              </div>
            </div>
            
            <div className="space-y-3">
              <div>
                <Label htmlFor="newPin">New PIN</Label>
                <Input
                  id="newPin"
                  type="password"
                  inputMode="numeric"
                  maxLength={4}
                  placeholder="••••"
                  value={newPin}
                  onChange={(e) => setNewPin(e.target.value.replace(/\D/g, '').slice(0, 4))}
                  className="text-center text-2xl tracking-[0.5em] font-mono"
                  data-testid="input-new-pin"
                />
              </div>
              <div>
                <Label htmlFor="confirmPin">Confirm PIN</Label>
                <Input
                  id="confirmPin"
                  type="password"
                  inputMode="numeric"
                  maxLength={4}
                  placeholder="••••"
                  value={confirmPin}
                  onChange={(e) => setConfirmPin(e.target.value.replace(/\D/g, '').slice(0, 4))}
                  className="text-center text-2xl tracking-[0.5em] font-mono"
                  data-testid="input-confirm-pin"
                />
              </div>
            </div>
          </div>
          
          <Button 
            onClick={handlePinChange}
            disabled={pinChangeLoading || newPin.length !== 4 || confirmPin.length !== 4}
            className="w-full bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700"
            data-testid="button-save-pin"
          >
            {pinChangeLoading ? (
              <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <CheckCircle className="h-4 w-4 mr-2" />
            )}
            Save My PIN
          </Button>
        </DialogContent>
      </Dialog>

      {/* Welcome Modal for Sid (Partner) */}
      <Dialog open={showWelcomeModal} onOpenChange={setShowWelcomeModal}>
        <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <div className="text-center mb-6">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", duration: 0.6 }}
                className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-purple-500 via-pink-500 to-orange-500 rounded-2xl mb-4 shadow-2xl"
              >
                <Sparkles className="h-10 w-10 text-white" />
              </motion.div>
              <DialogTitle className="text-3xl font-serif bg-gradient-to-r from-purple-600 to-orange-600 bg-clip-text text-transparent">
                Welcome to the Team, Sid!
              </DialogTitle>
              <DialogDescription className="text-lg mt-2">
                Your partner journey with Brew & Board begins now
              </DialogDescription>
            </div>
          </DialogHeader>
          
          <div className="space-y-6">
            {/* Vision Section */}
            <div className="bg-gradient-to-r from-slate-50 to-purple-50 rounded-xl p-6 border border-purple-100">
              <h3 className="font-serif text-xl font-bold text-slate-800 mb-3 flex items-center gap-2">
                <Target className="h-5 w-5 text-purple-600" />
                Our Vision
              </h3>
              <p className="text-slate-600 leading-relaxed">
                Brew & Board is reimagining B2B catering for Nashville's thriving business community. 
                We connect meeting planners with premium local vendors—coffee roasters, artisan bakeries, 
                and specialty food providers—delivering curated experiences that elevate every business meeting.
              </p>
            </div>

            {/* Growth Strategy */}
            <div className="bg-gradient-to-r from-amber-50 to-orange-50 rounded-xl p-6 border border-amber-100">
              <h3 className="font-serif text-xl font-bold text-slate-800 mb-3 flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-amber-600" />
                Scaling Together
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-full bg-amber-200 flex items-center justify-center font-bold text-amber-700">1</div>
                  <div>
                    <p className="font-semibold text-slate-700">Nashville First</p>
                    <p className="text-slate-500">Dominate the local market with premium service</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-full bg-amber-200 flex items-center justify-center font-bold text-amber-700">2</div>
                  <div>
                    <p className="font-semibold text-slate-700">Regional Expansion</p>
                    <p className="text-slate-500">Build regional manager network across Tennessee</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-full bg-amber-200 flex items-center justify-center font-bold text-amber-700">3</div>
                  <div>
                    <p className="font-semibold text-slate-700">Franchise Model</p>
                    <p className="text-slate-500">Enable entrepreneurs with proven playbook</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-full bg-amber-200 flex items-center justify-center font-bold text-amber-700">4</div>
                  <div>
                    <p className="font-semibold text-slate-700">National Brand</p>
                    <p className="text-slate-500">Become the go-to B2B catering platform</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Partner Role */}
            <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl p-6 border border-green-100">
              <h3 className="font-serif text-xl font-bold text-slate-800 mb-3 flex items-center gap-2">
                <Star className="h-5 w-5 text-green-600" />
                Your Role as Partner
              </h3>
              <ul className="space-y-2 text-slate-600">
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <span>Full visibility into all business operations and metrics</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <span>Oversee all regional managers and territories</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <span>Access to customer database and CRM insights</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <span>Strategic decision-making input on growth initiatives</span>
                </li>
              </ul>
            </div>

            {/* Revenue Potential */}
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-6 border border-blue-100">
              <h3 className="font-serif text-xl font-bold text-slate-800 mb-3 flex items-center gap-2">
                <DollarSign className="h-5 w-5 text-blue-600" />
                Revenue Model
              </h3>
              <div className="grid grid-cols-3 gap-4 text-center">
                <div>
                  <p className="text-2xl font-bold text-blue-600">15%</p>
                  <p className="text-xs text-slate-500">Service Fee</p>
                </div>
                <div>
                  <p className="text-2xl font-bold text-purple-600">$29-199</p>
                  <p className="text-xs text-slate-500">Subscriptions</p>
                </div>
                <div>
                  <p className="text-2xl font-bold text-green-600">$25K+</p>
                  <p className="text-xs text-slate-500">Franchise Fees</p>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-6 pt-4 border-t">
            <Button 
              onClick={acknowledgeWelcome}
              className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 py-6 text-lg"
              data-testid="button-acknowledge-welcome"
            >
              <Sparkles className="h-5 w-5 mr-2" />
              Let's Build Something Great Together
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

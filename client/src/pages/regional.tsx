import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { motion } from "framer-motion";
import { 
  ArrowLeft, MapPin, Users, Package, DollarSign, TrendingUp, 
  Building2, Phone, Mail, Briefcase, Calendar, Activity,
  CreditCard, FileText, UserCircle, LogOut, RefreshCw,
  Globe, Target, Clock, CheckCircle, AlertCircle, Download
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
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
  pin: string | null;
  role: string;
  regionId: string | null;
  title: string | null;
  photoUrl: string | null;
  linkedinUrl: string | null;
  isActive: boolean;
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

  useEffect(() => {
    const storedSession = localStorage.getItem("regional_session");
    if (storedSession) {
      const data = JSON.parse(storedSession);
      if (data.token && data.manager) {
        setManager(data.manager);
        setRegion(data.region);
        setIsAuthenticated(true);
        fetchStats(data.token);
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
      // Store session with server-generated token
      localStorage.setItem("regional_session", JSON.stringify({
        token: data.token,
        manager: data.manager,
        region: data.region
      }));
      setManager(data.manager);
      setRegion(data.region);
      setIsAuthenticated(true);
      
      if (data.token) {
        // Fetch stats using the server-generated token
        fetchStats(data.token);
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-amber-100">
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
    </div>
  );
}

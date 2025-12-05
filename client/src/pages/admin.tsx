import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Link, useLocation } from "wouter";
import {
  ChevronLeft,
  Shield,
  Lock,
  Search,
  FileCheck,
  Users,
  Activity,
  Database,
  Eye,
  ExternalLink,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  RefreshCw,
  Filter,
  Download,
  Coffee,
  Wallet,
  Hash,
  Server,
  CreditCard,
  Bitcoin,
  Code2,
  Building2,
  MapPin,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";

const DEVELOPER_PIN = "0424";
const PARTNER_PIN = "4444";
const REGIONAL_MANAGER_PIN = "5555";

interface Hallmark {
  id: number;
  serialNumber: string;
  prefix: string;
  assetType: string;
  assetName?: string;
  userId?: string;
  issuedBy: string;
  isCompanyHallmark: boolean;
  contentHash: string;
  status: string;
  solanaTxSignature?: string;
  solanaNetwork?: string;
  solanaSlot?: number;
  solanaConfirmedAt?: string;
  verificationCount: number;
  lastVerifiedAt?: string;
  issuedAt: string;
}

interface SystemStats {
  totalCompanyHallmarks: number;
  totalUserHallmarks: number;
  totalVerifications: number;
  activeProfiles: number;
  blockchain: {
    configured: boolean;
    network: string;
    currentSlot: number;
    walletBalance: number;
    walletAddress: string;
    rpcEndpoint: string;
  };
}

interface SystemHealth {
  api: 'healthy' | 'degraded' | 'offline' | 'checking';
  database: 'healthy' | 'degraded' | 'offline' | 'checking';
  stripe: 'healthy' | 'degraded' | 'offline' | 'checking';
  coinbase: 'healthy' | 'degraded' | 'offline' | 'checking';
  blockchain: 'healthy' | 'degraded' | 'offline' | 'checking';
}

function StatusIndicator({ status }: { status: string }) {
  const colors = {
    healthy: 'bg-emerald-500',
    degraded: 'bg-amber-500',
    offline: 'bg-red-500',
    checking: 'bg-gray-400 animate-pulse',
  };
  return (
    <div className={`w-2.5 h-2.5 rounded-full ${colors[status as keyof typeof colors] || colors.checking}`} />
  );
}

export default function AdminPage() {
  const { toast } = useToast();
  const [, setLocation] = useLocation();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [showPinDialog, setShowPinDialog] = useState(true);
  const [pin, setPin] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  
  const [stats, setStats] = useState<SystemStats | null>(null);
  const [health, setHealth] = useState<SystemHealth>({
    api: 'checking',
    database: 'checking',
    stripe: 'checking',
    coinbase: 'checking',
    blockchain: 'checking',
  });
  const [hallmarks, setHallmarks] = useState<Hallmark[]>([]);
  const [totalHallmarks, setTotalHallmarks] = useState(0);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterType, setFilterType] = useState<string>("all");
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [selectedHallmark, setSelectedHallmark] = useState<Hallmark | null>(null);
  const [searchTimeout, setSearchTimeout] = useState<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const adminAuth = localStorage.getItem("coffee_admin_auth");
    if (adminAuth === "true") {
      setIsAuthenticated(true);
      setShowPinDialog(false);
    }
  }, []);

  useEffect(() => {
    if (isAuthenticated) {
      fetchData();
      checkHealth();
    }
  }, [isAuthenticated]);

  const handlePinSubmit = async () => {
    setIsLoading(true);
    setTimeout(async () => {
      if (pin === DEVELOPER_PIN) {
        localStorage.setItem("coffee_admin_auth", "true");
        setIsAuthenticated(true);
        setShowPinDialog(false);
        toast({ title: "Developer Access Granted", description: "Welcome to the Developer Portal" });
      } else if (pin === PARTNER_PIN) {
        try {
          const response = await fetch("/api/regional/login", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ pin: PARTNER_PIN })
          });
          if (response.ok) {
            const data = await response.json();
            localStorage.setItem("regional_session", JSON.stringify({
              token: data.token,
              manager: data.manager,
              region: data.region
            }));
            toast({ title: "Partner Access Granted", description: "Welcome, Partner!" });
            setLocation("/regional");
          } else {
            toast({ title: "Access Error", description: "Partner login failed", variant: "destructive" });
          }
        } catch {
          toast({ title: "Access Error", description: "Connection failed", variant: "destructive" });
        }
      } else if (pin === REGIONAL_MANAGER_PIN) {
        toast({ 
          title: "Regional Manager", 
          description: "Use this PIN on the Regional Dashboard to create your account" 
        });
        setLocation("/regional");
      } else {
        toast({ title: "Access Denied", description: "Invalid PIN", variant: "destructive" });
      }
      setIsLoading(false);
    }, 500);
  };

  const handleLogout = () => {
    localStorage.removeItem("coffee_admin_auth");
    setIsAuthenticated(false);
    setShowPinDialog(true);
    setPin("");
  };

  const fetchData = async (query?: string, type?: string) => {
    setIsRefreshing(true);
    try {
      const searchParams = new URLSearchParams();
      searchParams.set('limit', '200');
      if (query && query.trim()) {
        searchParams.set('q', query.trim());
      }
      if (type && type !== 'all') {
        if (type === 'company' || type === 'user') {
          searchParams.set('type', type);
        } else {
          searchParams.set('assetType', type);
        }
      }
      
      const [statsRes, searchRes] = await Promise.all([
        fetch('/api/hallmark/stats'),
        fetch(`/api/hallmark/admin/search?${searchParams.toString()}`),
      ]);
      
      if (statsRes.ok) {
        const statsData = await statsRes.json();
        setStats(statsData);
      }
      
      if (searchRes.ok) {
        const searchData = await searchRes.json();
        setHallmarks(searchData.hallmarks || []);
        setTotalHallmarks(searchData.total || 0);
      }
    } catch (error) {
      console.error('Failed to fetch data:', error);
    } finally {
      setIsRefreshing(false);
    }
  };
  
  const handleSearch = (query: string) => {
    setSearchQuery(query);
    if (searchTimeout) {
      clearTimeout(searchTimeout);
    }
    const timeout = setTimeout(() => {
      fetchData(query, filterType);
    }, 300);
    setSearchTimeout(timeout);
  };
  
  const handleFilterChange = (type: string) => {
    setFilterType(type);
    fetchData(searchQuery, type);
  };

  const checkHealth = async () => {
    const newHealth: SystemHealth = { ...health };
    
    try {
      const res = await fetch('/api/health', { signal: AbortSignal.timeout(5000) });
      if (res.ok) {
        const data = await res.json();
        newHealth.api = 'healthy';
        newHealth.database = data.database === 'healthy' ? 'healthy' : 'offline';
      } else {
        newHealth.api = 'degraded';
      }
    } catch {
      newHealth.api = 'offline';
    }

    try {
      const res = await fetch('/api/hallmark/blockchain/status', { signal: AbortSignal.timeout(5000) });
      if (res.ok) {
        const data = await res.json();
        newHealth.blockchain = data.configured ? 'healthy' : 'offline';
      }
    } catch {
      newHealth.blockchain = 'offline';
    }

    try {
      const res = await fetch('/api/config/stripe', { signal: AbortSignal.timeout(5000) });
      const data = await res.json();
      newHealth.stripe = data.isConfigured ? 'healthy' : 'offline';
    } catch {
      newHealth.stripe = 'offline';
    }

    try {
      const res = await fetch('/api/config/coinbase', { signal: AbortSignal.timeout(5000) });
      const data = await res.json();
      newHealth.coinbase = data.isConfigured ? 'healthy' : 'offline';
    } catch {
      newHealth.coinbase = 'offline';
    }

    setHealth(newHealth);
  };


  if (!isAuthenticated) {
    return (
      <>
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center"
          >
            <div className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center shadow-2xl">
              <Shield className="h-10 w-10 text-white" />
            </div>
            <h1 className="font-serif text-3xl font-bold text-white mb-2">Admin Portal</h1>
            <p className="text-slate-400 mb-8">Brew & Board Coffee — Secure Access</p>
          </motion.div>
        </div>

        <Dialog open={showPinDialog} onOpenChange={() => {}}>
          <DialogContent className="sm:max-w-[380px] bg-slate-900 border-slate-700">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2 text-white">
                <Lock className="h-5 w-5 text-amber-500" />
                Admin / Developer Login
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4 pt-2">
              <p className="text-sm text-slate-400">
                Enter your access PIN to continue.
              </p>
              
              <div className="grid grid-cols-3 gap-2 text-xs">
                <div className="p-2 rounded-lg bg-slate-800/50 border border-slate-700/50 text-center">
                  <Code2 className="h-4 w-4 mx-auto mb-1 text-emerald-400" />
                  <span className="text-slate-400">Developer</span>
                </div>
                <div className="p-2 rounded-lg bg-slate-800/50 border border-slate-700/50 text-center">
                  <Building2 className="h-4 w-4 mx-auto mb-1 text-amber-400" />
                  <span className="text-slate-400">Partner</span>
                </div>
                <div className="p-2 rounded-lg bg-slate-800/50 border border-slate-700/50 text-center">
                  <MapPin className="h-4 w-4 mx-auto mb-1 text-blue-400" />
                  <span className="text-slate-400">Regional</span>
                </div>
              </div>

              <Input
                type="password"
                placeholder="Enter 4-digit PIN"
                maxLength={4}
                value={pin}
                onChange={(e) => setPin(e.target.value.replace(/\D/g, ""))}
                onKeyDown={(e) => e.key === "Enter" && pin.length === 4 && handlePinSubmit()}
                className="text-center text-lg tracking-widest bg-slate-800 border-slate-700 text-white"
                data-testid="input-admin-pin"
                autoFocus
              />
              <div className="flex gap-2">
                <Link href="/dashboard" className="flex-1">
                  <Button variant="outline" className="w-full border-slate-700 text-slate-300">
                    Cancel
                  </Button>
                </Link>
                <Button
                  onClick={handlePinSubmit}
                  className="flex-1 bg-amber-600 hover:bg-amber-700"
                  disabled={pin.length !== 4 || isLoading}
                  data-testid="button-admin-submit"
                >
                  {isLoading ? "Verifying..." : "Access"}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white overflow-x-hidden">
      <div className="p-4 md:p-8 max-w-7xl mx-auto overflow-x-hidden">
        <header className="flex flex-col md:flex-row md:items-center justify-between mb-6 md:mb-8 gap-4">
          <div className="flex items-center gap-3 md:gap-4 min-w-0">
            <Link href="/dashboard">
              <Button variant="ghost" size="icon" className="text-slate-400 hover:text-white flex-shrink-0" data-testid="button-back">
                <ChevronLeft className="h-5 w-5" />
              </Button>
            </Link>
            <div className="min-w-0">
              <h1 className="font-serif text-xl md:text-3xl font-bold flex items-center gap-2 md:gap-3 flex-wrap">
                <div className="p-1.5 md:p-2 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex-shrink-0">
                  <Code2 className="h-5 w-5 md:h-6 md:w-6 text-white" />
                </div>
                <span>Developer Portal</span>
                <Badge className="bg-emerald-500/20 text-emerald-400 border-emerald-500/30 text-xs">
                  Full Access
                </Badge>
              </h1>
              <p className="text-slate-400 mt-1 text-sm md:text-base">System monitoring, hallmark registry & blockchain tools</p>
            </div>
          </div>
          <div className="flex items-center gap-2 flex-shrink-0">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => { fetchData(); checkHealth(); }}
              disabled={isRefreshing}
              className="text-slate-400 hover:text-white"
            >
              <RefreshCw className={`h-4 w-4 mr-1 md:mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
              <span className="hidden sm:inline">Refresh</span>
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleLogout}
              className="text-slate-400 hover:text-red-400"
              data-testid="button-admin-logout"
            >
              <Lock className="h-4 w-4 mr-1 md:mr-2" />
              <span className="hidden sm:inline">Logout</span>
            </Button>
          </div>
        </header>

        {/* System Health */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8"
        >
          {[
            { name: 'API', status: health.api, icon: Server },
            { name: 'Database', status: health.database, icon: Database },
            { name: 'Blockchain', status: health.blockchain, icon: Shield },
            { name: 'Stripe', status: health.stripe, icon: CreditCard },
            { name: 'Coinbase', status: health.coinbase, icon: Bitcoin },
          ].map((service) => (
            <Card key={service.name} className="bg-slate-800/50 border-slate-700">
              <CardContent className="p-4 flex items-center gap-3">
                <service.icon className="h-5 w-5 text-slate-400" />
                <div className="flex-1">
                  <p className="text-sm font-medium text-white">{service.name}</p>
                </div>
                <StatusIndicator status={service.status} />
              </CardContent>
            </Card>
          ))}
        </motion.div>

        {/* Stats Overview */}
        {stats && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8"
          >
            <Card className="bg-slate-800/50 border-slate-700">
              <CardContent className="p-6">
                <div className="flex items-center gap-3 mb-2">
                  <Coffee className="h-5 w-5 text-amber-500" />
                  <span className="text-slate-400 text-sm">Company Hallmarks</span>
                </div>
                <p className="text-3xl font-bold text-white">{stats.totalCompanyHallmarks}</p>
              </CardContent>
            </Card>
            <Card className="bg-slate-800/50 border-slate-700">
              <CardContent className="p-6">
                <div className="flex items-center gap-3 mb-2">
                  <Users className="h-5 w-5 text-blue-500" />
                  <span className="text-slate-400 text-sm">User Hallmarks</span>
                </div>
                <p className="text-3xl font-bold text-white">{stats.totalUserHallmarks}</p>
              </CardContent>
            </Card>
            <Card className="bg-slate-800/50 border-slate-700">
              <CardContent className="p-6">
                <div className="flex items-center gap-3 mb-2">
                  <Activity className="h-5 w-5 text-emerald-500" />
                  <span className="text-slate-400 text-sm">Verifications</span>
                </div>
                <p className="text-3xl font-bold text-white">{stats.totalVerifications}</p>
              </CardContent>
            </Card>
            <Card className="bg-slate-800/50 border-slate-700">
              <CardContent className="p-6">
                <div className="flex items-center gap-3 mb-2">
                  <Wallet className="h-5 w-5 text-purple-500" />
                  <span className="text-slate-400 text-sm">Wallet Balance</span>
                </div>
                <p className="text-3xl font-bold text-white">
                  {stats.blockchain.walletBalance.toFixed(4)} SOL
                </p>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Hallmark Registry */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card className="bg-slate-800/50 border-slate-700">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-white flex items-center gap-2">
                    <FileCheck className="h-5 w-5 text-emerald-500" />
                    On-Chain Document Registry
                  </CardTitle>
                  <CardDescription className="text-slate-400">
                    Search and view all blockchain-verified hallmarks
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {/* Search and Filters */}
              <div className="flex flex-col md:flex-row gap-4 mb-6">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <Input
                    placeholder="Search by serial number, name, hash, or user ID..."
                    value={searchQuery}
                    onChange={(e) => handleSearch(e.target.value)}
                    className="pl-10 bg-slate-900 border-slate-700 text-white placeholder:text-slate-500"
                    data-testid="input-hallmark-search"
                  />
                </div>
                <Select value={filterType} onValueChange={handleFilterChange}>
                  <SelectTrigger className="w-[180px] bg-slate-900 border-slate-700 text-white">
                    <Filter className="h-4 w-4 mr-2" />
                    <SelectValue placeholder="Filter by type" />
                  </SelectTrigger>
                  <SelectContent className="bg-slate-900 border-slate-700">
                    <SelectItem value="all">All Hallmarks</SelectItem>
                    <SelectItem value="company">Company Only</SelectItem>
                    <SelectItem value="user">User Only</SelectItem>
                    <SelectItem value="application">Application</SelectItem>
                    <SelectItem value="founder">Founder</SelectItem>
                    <SelectItem value="app_version">App Version</SelectItem>
                    <SelectItem value="document">Document</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Results count */}
              <div className="text-sm text-slate-400 mb-4">
                Showing {hallmarks.length} of {totalHallmarks} hallmarks
              </div>
              
              {/* Hallmarks List */}
              <ScrollArea className="h-[400px]">
                <div className="space-y-3">
                  {hallmarks.length === 0 ? (
                    <div className="text-center py-12 text-slate-400">
                      <Hash className="h-12 w-12 mx-auto mb-4 opacity-30" />
                      <p>No hallmarks found</p>
                      <p className="text-sm">Try adjusting your search or filters</p>
                    </div>
                  ) : (
                    hallmarks.map((hallmark) => (
                      <motion.div
                        key={hallmark.id}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="p-4 rounded-lg bg-slate-900/50 border border-slate-700 hover:border-slate-600 cursor-pointer transition-all"
                        onClick={() => setSelectedHallmark(hallmark)}
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <code className="font-mono text-sm font-semibold text-emerald-400">
                                {hallmark.serialNumber}
                              </code>
                              <Badge 
                                variant="outline" 
                                className={`text-[10px] ${
                                  hallmark.isCompanyHallmark 
                                    ? 'border-amber-500/50 text-amber-400' 
                                    : 'border-blue-500/50 text-blue-400'
                                }`}
                              >
                                {hallmark.isCompanyHallmark ? 'Company' : 'User'}
                              </Badge>
                              <Badge variant="outline" className="text-[10px] border-slate-600 text-slate-400">
                                {hallmark.assetType}
                              </Badge>
                              {hallmark.solanaTxSignature && (
                                <Badge className="bg-emerald-500/20 text-emerald-400 border-emerald-500/30 text-[10px]">
                                  On-Chain
                                </Badge>
                              )}
                            </div>
                            <p className="text-sm text-white mb-1">{hallmark.assetName || 'Untitled'}</p>
                            <p className="text-xs text-slate-500 font-mono truncate max-w-md">
                              {hallmark.contentHash}
                            </p>
                          </div>
                          <div className="text-right text-xs text-slate-400">
                            <p>{new Date(hallmark.issuedAt).toLocaleDateString()}</p>
                            <p className="flex items-center gap-1 mt-1">
                              <Eye className="h-3 w-3" />
                              {hallmark.verificationCount} verifications
                            </p>
                          </div>
                        </div>
                      </motion.div>
                    ))
                  )}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </motion.div>

        {/* Hallmark Detail Dialog */}
        <Dialog open={!!selectedHallmark} onOpenChange={() => setSelectedHallmark(null)}>
          <DialogContent className="sm:max-w-[500px] bg-slate-900 border-slate-700 text-white">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5 text-emerald-500" />
                Hallmark Details
              </DialogTitle>
            </DialogHeader>
            {selectedHallmark && (
              <div className="space-y-4">
                <div className="p-4 rounded-lg bg-slate-800 border border-slate-700">
                  <p className="text-xs text-slate-400 mb-1">Serial Number</p>
                  <code className="font-mono text-lg font-bold text-emerald-400">
                    {selectedHallmark.serialNumber}
                  </code>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs text-slate-400 mb-1">Asset Type</p>
                    <p className="text-sm font-medium">{selectedHallmark.assetType}</p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-400 mb-1">Status</p>
                    <Badge className={selectedHallmark.status === 'active' ? 'bg-emerald-500' : 'bg-red-500'}>
                      {selectedHallmark.status}
                    </Badge>
                  </div>
                  <div>
                    <p className="text-xs text-slate-400 mb-1">Issued By</p>
                    <p className="text-sm font-medium">{selectedHallmark.issuedBy}</p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-400 mb-1">Issued At</p>
                    <p className="text-sm font-medium">{new Date(selectedHallmark.issuedAt).toLocaleString()}</p>
                  </div>
                </div>

                <div>
                  <p className="text-xs text-slate-400 mb-1">Content Hash (SHA-256)</p>
                  <code className="text-xs font-mono text-slate-300 break-all bg-slate-800 p-2 rounded block">
                    {selectedHallmark.contentHash}
                  </code>
                </div>

                {selectedHallmark.solanaTxSignature && (
                  <div className="p-4 rounded-lg bg-emerald-500/10 border border-emerald-500/30">
                    <p className="text-xs text-emerald-400 mb-2 flex items-center gap-1">
                      <CheckCircle className="h-3 w-3" />
                      Blockchain Verified
                    </p>
                    <div className="space-y-2">
                      <div>
                        <p className="text-xs text-slate-400">Transaction Signature</p>
                        <code className="text-xs font-mono text-emerald-300 break-all">
                          {selectedHallmark.solanaTxSignature}
                        </code>
                      </div>
                      <div className="flex gap-4 text-xs">
                        <div>
                          <p className="text-slate-400">Network</p>
                          <p className="text-white">{selectedHallmark.solanaNetwork}</p>
                        </div>
                        <div>
                          <p className="text-slate-400">Slot</p>
                          <p className="text-white">{selectedHallmark.solanaSlot}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                <div className="flex gap-2 pt-2">
                  <Link href={`/verify/${selectedHallmark.serialNumber}`} className="flex-1">
                    <Button className="w-full bg-emerald-600 hover:bg-emerald-700">
                      <ExternalLink className="h-4 w-4 mr-2" />
                      View Verification Page
                    </Button>
                  </Link>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}

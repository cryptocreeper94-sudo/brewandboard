import { useState, useEffect } from "react";
import { Link } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import {
  ChevronLeft,
  Code2,
  Key,
  Lock,
  Zap,
  Coffee,
  FileJson,
  Copy,
  Check,
  ExternalLink,
  Terminal,
  Database,
  Shield,
  Sparkles,
  BookOpen,
  Webhook,
  Clock,
  Home,
  Truck,
  CheckCircle2,
  Circle,
  AlertCircle,
  Bike,
  Car,
  CreditCard,
  Calendar,
  MessageSquare,
  MapPin,
  Activity,
  Server,
  Wifi,
  WifiOff,
  Bitcoin,
  RefreshCw,
  Wallet,
  Hash,
  FileCheck,
  Search,
  Eye,
  QrCode,
  Download,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useToast } from "@/hooks/use-toast";
import { BusinessCardPreview } from "@/components/BusinessCard";
import { DocumentExportPanel } from "@/components/DocumentExport";

interface HallmarkStats {
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

interface CompanyHallmark {
  id: number;
  serialNumber: string;
  assetType: string;
  assetName?: string;
  contentHash: string;
  status: string;
  solanaTxSignature?: string;
  verificationCount: number;
  issuedAt: string;
}

const API_ENDPOINTS = [
  {
    method: "GET",
    path: "/api/clients",
    description: "Retrieve all clients for a user",
    params: "userId (query)",
    response: "Array of client objects",
  },
  {
    method: "POST",
    path: "/api/clients",
    description: "Create a new client",
    params: "userId, name, contactName, contactEmail, industry, etc.",
    response: "Created client object",
  },
  {
    method: "GET",
    path: "/api/notes",
    description: "Retrieve portfolio notes",
    params: "userId (query)",
    response: "Array of CRM note objects",
  },
  {
    method: "POST",
    path: "/api/notes",
    description: "Create a new portfolio note",
    params: "userId, title, content, templateType, clientId, etc.",
    response: "Created note object",
  },
  {
    method: "GET",
    path: "/api/scheduled-orders",
    description: "Retrieve scheduled orders",
    params: "userId (query)",
    response: "Array of scheduled order objects",
  },
  {
    method: "POST",
    path: "/api/scheduled-orders",
    description: "Create a new order (2hr lead time required)",
    params: "userId, vendorId, deliveryDate, deliveryTime, etc.",
    response: "Created order with events",
  },
  {
    method: "GET",
    path: "/api/documents",
    description: "Retrieve scanned documents",
    params: "userId, search, category (query)",
    response: "Array of document objects",
  },
  {
    method: "POST",
    path: "/api/documents",
    description: "Upload scanned document with OCR text",
    params: "userId, title, category, extractedText, imageData, etc.",
    response: "Created document object",
  },
];

const CODE_EXAMPLES = {
  javascript: `// Fetch clients using the Brew & Board API
const response = await fetch('/api/clients?userId=your-user-id', {
  headers: {
    'Content-Type': 'application/json',
  }
});
const clients = await response.json();

// Create a new order
const order = await fetch('/api/scheduled-orders', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    userId: 'your-user-id',
    vendorId: 'vendor-123',
    deliveryDate: '2024-12-15',
    deliveryTime: '09:00',
    deliveryAddress: '123 Business St, Nashville TN',
    items: [
      { name: 'Latte', quantity: 5, price: 4.50 }
    ],
    totalAmount: 22.50
  })
});`,
  python: `import requests

# Fetch clients
response = requests.get(
    'https://your-app.replit.app/api/clients',
    params={'userId': 'your-user-id'}
)
clients = response.json()

# Create a new order
order_data = {
    'userId': 'your-user-id',
    'vendorId': 'vendor-123',
    'deliveryDate': '2024-12-15',
    'deliveryTime': '09:00',
    'deliveryAddress': '123 Business St, Nashville TN',
    'items': [{'name': 'Latte', 'quantity': 5, 'price': 4.50}],
    'totalAmount': 22.50
}
response = requests.post(
    'https://your-app.replit.app/api/scheduled-orders',
    json=order_data
)`,
  curl: `# Fetch clients
curl -X GET "https://your-app.replit.app/api/clients?userId=your-user-id"

# Create a new order
curl -X POST "https://your-app.replit.app/api/scheduled-orders" \\
  -H "Content-Type: application/json" \\
  -d '{
    "userId": "your-user-id",
    "vendorId": "vendor-123",
    "deliveryDate": "2024-12-15",
    "deliveryTime": "09:00",
    "deliveryAddress": "123 Business St, Nashville TN",
    "items": [{"name": "Latte", "quantity": 5, "price": 4.50}],
    "totalAmount": 22.50
  }'`,
};

type HealthStatus = 'healthy' | 'degraded' | 'offline' | 'checking';

interface SystemHealth {
  api: HealthStatus;
  database: HealthStatus;
  stripe: HealthStatus;
  coinbase: HealthStatus;
  lastChecked: Date | null;
}

function StatusLight({ status, size = 'md' }: { status: HealthStatus; size?: 'sm' | 'md' | 'lg' }) {
  const sizeClasses = {
    sm: 'w-2 h-2',
    md: 'w-3 h-3',
    lg: 'w-4 h-4'
  };
  
  const statusColors = {
    healthy: 'bg-emerald-500 shadow-emerald-500/50',
    degraded: 'bg-amber-500 shadow-amber-500/50',
    offline: 'bg-red-500 shadow-red-500/50',
    checking: 'bg-gray-400 animate-pulse'
  };
  
  return (
    <div className={`${sizeClasses[size]} rounded-full ${statusColors[status]} shadow-lg`} />
  );
}

function StatusBadge({ status }: { status: HealthStatus }) {
  const statusText = {
    healthy: 'Operational',
    degraded: 'Degraded',
    offline: 'Offline',
    checking: 'Checking...'
  };
  
  const statusColors = {
    healthy: 'bg-emerald-100 text-emerald-700 border-emerald-200',
    degraded: 'bg-amber-100 text-amber-700 border-amber-200',
    offline: 'bg-red-100 text-red-700 border-red-200',
    checking: 'bg-gray-100 text-gray-700 border-gray-200'
  };
  
  return (
    <Badge variant="outline" className={statusColors[status]}>
      {statusText[status]}
    </Badge>
  );
}

function MethodBadge({ method }: { method: string }) {
  const colors: Record<string, string> = {
    GET: "bg-emerald-500/10 text-emerald-700 border-emerald-200",
    POST: "bg-blue-500/10 text-blue-700 border-blue-200",
    PUT: "bg-amber-500/10 text-amber-700 border-amber-200",
    DELETE: "bg-red-500/10 text-red-700 border-red-200",
  };
  return (
    <Badge variant="outline" className={`font-mono text-xs ${colors[method] || ""}`}>
      {method}
    </Badge>
  );
}

export default function DevelopersPage() {
  const { toast } = useToast();
  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState("javascript");
  const [email, setEmail] = useState("");
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [checkedTasks, setCheckedTasks] = useState<Record<string, boolean>>(() => {
    const saved = localStorage.getItem('bb_dev_tasks');
    return saved ? JSON.parse(saved) : {};
  });

  const toggleTask = (taskId: string) => {
    setCheckedTasks(prev => {
      const updated = { ...prev, [taskId]: !prev[taskId] };
      localStorage.setItem('bb_dev_tasks', JSON.stringify(updated));
      return updated;
    });
  };

  const TaskCheckbox = ({ id, label, isPreChecked = false }: { id: string; label: string; isPreChecked?: boolean }) => {
    const isChecked = isPreChecked || checkedTasks[id];
    return (
      <div 
        className={`flex items-center gap-3 text-sm cursor-pointer group ${isPreChecked ? 'opacity-75' : ''}`}
        onClick={() => !isPreChecked && toggleTask(id)}
        data-testid={`task-${id}`}
      >
        {isChecked ? (
          <CheckCircle2 className="h-4 w-4 text-emerald-500 flex-shrink-0" />
        ) : (
          <Circle className="h-4 w-4 text-gray-400 group-hover:text-amber-500 flex-shrink-0 transition-colors" />
        )}
        <span className={isChecked ? "text-emerald-700 line-through" : "group-hover:text-amber-700 transition-colors"}>
          {label}
        </span>
      </div>
    );
  };
  const [health, setHealth] = useState<SystemHealth>({
    api: 'checking',
    database: 'checking',
    stripe: 'checking',
    coinbase: 'checking',
    lastChecked: null
  });
  const [hallmarkStats, setHallmarkStats] = useState<HallmarkStats | null>(null);
  const [companyHallmarks, setCompanyHallmarks] = useState<CompanyHallmark[]>([]);
  const [hallmarkSearch, setHallmarkSearch] = useState("");
  const [isSeeding, setIsSeeding] = useState(false);
  
  useEffect(() => {
    const devAuth = localStorage.getItem("coffee_dev_auth");
    if (devAuth === "true") {
      setIsAuthenticated(true);
    } else {
      window.location.href = "/";
    }
  }, []);
  
  const fetchHallmarkData = async () => {
    try {
      const [statsRes, hallmarksRes] = await Promise.all([
        fetch('/api/hallmark/stats'),
        fetch('/api/hallmark/company'),
      ]);
      
      if (statsRes.ok) {
        const stats = await statsRes.json();
        setHallmarkStats(stats);
      }
      
      if (hallmarksRes.ok) {
        const hallmarks = await hallmarksRes.json();
        setCompanyHallmarks(hallmarks);
      }
    } catch (error) {
      console.error('Failed to fetch hallmark data:', error);
    }
  };
  
  const seedInitialHallmarks = async () => {
    setIsSeeding(true);
    try {
      const res = await fetch('/api/hallmark/seed', { method: 'POST' });
      if (res.ok) {
        const data = await res.json();
        toast({
          title: "Hallmarks Seeded",
          description: `App: ${data.app?.hallmark?.serialNumber}, Dev: ${data.developer?.hallmark?.serialNumber}`
        });
        fetchHallmarkData();
      }
    } catch (error) {
      toast({ title: "Seeding Failed", variant: "destructive" });
    } finally {
      setIsSeeding(false);
    }
  };
  
  useEffect(() => {
    if (isAuthenticated) {
      fetchHallmarkData();
    }
  }, [isAuthenticated]);

  const checkHealth = async () => {
    setIsRefreshing(true);
    const newHealth: SystemHealth = {
      api: 'checking',
      database: 'checking',
      stripe: 'checking',
      coinbase: 'checking',
      lastChecked: new Date()
    };

    try {
      const healthResponse = await fetch('/api/health', { 
        signal: AbortSignal.timeout(5000) 
      });
      if (healthResponse.ok) {
        const healthData = await healthResponse.json();
        newHealth.api = 'healthy';
        newHealth.database = healthData.database === 'healthy' ? 'healthy' : 'offline';
      } else {
        newHealth.api = 'degraded';
        newHealth.database = 'degraded';
      }
    } catch {
      newHealth.api = 'offline';
      newHealth.database = 'offline';
    }

    try {
      const stripeResponse = await fetch('/api/config/stripe', { 
        signal: AbortSignal.timeout(5000) 
      });
      const stripeData = await stripeResponse.json();
      newHealth.stripe = stripeData.isConfigured ? 'healthy' : 'offline';
    } catch {
      newHealth.stripe = 'offline';
    }

    try {
      const coinbaseResponse = await fetch('/api/config/coinbase', { 
        signal: AbortSignal.timeout(5000) 
      });
      const coinbaseData = await coinbaseResponse.json();
      newHealth.coinbase = coinbaseData.isConfigured ? 'healthy' : 'offline';
    } catch {
      newHealth.coinbase = 'offline';
    }

    setHealth(newHealth);
    setIsRefreshing(false);
  };

  useEffect(() => {
    checkHealth();
    const interval = setInterval(checkHealth, 60000);
    return () => clearInterval(interval);
  }, []);

  const getOverallStatus = (): { status: HealthStatus; message: string } => {
    const allServices = [health.api, health.database, health.stripe, health.coinbase];
    const coreServices = [health.api, health.database];
    const paymentServices = [health.stripe, health.coinbase];
    
    if (allServices.every(s => s === 'checking')) {
      return { status: 'checking', message: 'Checking system status...' };
    }
    
    if (coreServices.some(s => s === 'offline')) {
      return { status: 'offline', message: 'Core services are offline' };
    }
    
    if (coreServices.some(s => s === 'degraded')) {
      return { status: 'degraded', message: 'Core services are degraded' };
    }
    
    if (paymentServices.every(s => s === 'offline')) {
      return { status: 'degraded', message: 'Payment services not configured' };
    }
    
    if (paymentServices.some(s => s === 'offline')) {
      return { status: 'degraded', message: 'Some payment services not configured' };
    }
    
    if (allServices.every(s => s === 'healthy')) {
      return { status: 'healthy', message: 'All systems operational' };
    }
    
    return { status: 'degraded', message: 'Some services need attention' };
  };

  const overallStatus = getOverallStatus();

  const copyCode = (code: string, key: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(key);
    toast({ title: "Code copied!", description: "Paste it in your project." });
    setTimeout(() => setCopiedCode(null), 2000);
  };

  const handleEarlyAccess = () => {
    if (!email.includes("@")) {
      toast({ title: "Invalid email", variant: "destructive" });
      return;
    }
    toast({ 
      title: "You're on the list! ☕", 
      description: "We'll notify you when API keys are available." 
    });
    setEmail("");
  };
  
  const handleLogout = () => {
    localStorage.removeItem("coffee_dev_auth");
    window.location.href = "/";
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50 flex items-center justify-center">
        <div className="text-center">
          <Lock className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <p className="text-muted-foreground">Verifying developer access...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50 luxury-pattern grain-overlay relative">
      <div className="p-4 md:p-8 max-w-7xl mx-auto relative z-10">
        <header className="flex items-center justify-between mb-12">
          <div className="flex items-center gap-4">
            <Link href="/dashboard">
              <Button variant="ghost" size="icon" className="hover-3d" data-testid="button-back">
                <ChevronLeft className="h-5 w-5" />
              </Button>
            </Link>
            <div>
              <motion.h1 
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="font-serif text-4xl font-bold flex items-center gap-3"
              >
                <div className="p-2 rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 text-white shine-effect">
                  <Code2 className="h-8 w-8" />
                </div>
                <span className="gradient-text">Developer Hub</span>
                <motion.div
                  animate={{ rotate: [0, 10, -10, 0] }}
                  transition={{ repeat: Infinity, duration: 2 }}
                >
                  <Sparkles className="h-6 w-6 text-amber-500" />
                </motion.div>
              </motion.h1>
              <p className="text-muted-foreground mt-1">Build amazing integrations with Brew & Board</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Link href="/dashboard">
              <Button variant="outline" className="gap-2 hover-3d" data-testid="button-home">
                <Home className="h-4 w-4" /> Dashboard
              </Button>
            </Link>
            <Button 
              variant="ghost" 
              size="sm"
              onClick={handleLogout}
              className="gap-2 text-muted-foreground hover:text-destructive"
              data-testid="button-dev-logout"
            >
              <Lock className="h-4 w-4" /> Logout
            </Button>
          </div>
        </header>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-12"
        >
          <Card className="premium-card overflow-hidden border-0">
            <div className="absolute inset-0 bg-gradient-to-r from-amber-500/10 via-orange-500/5 to-transparent" />
            <CardContent className="p-8 relative">
              <div className="grid md:grid-cols-2 gap-8 items-center">
                <div>
                  <Badge className="mb-4 bg-amber-500/10 text-amber-700 border-amber-200">
                    <Zap className="h-3 w-3 mr-1" /> Coming Soon
                  </Badge>
                  <h2 className="font-serif text-3xl font-bold mb-4 gradient-text">
                    API Early Access
                  </h2>
                  <p className="text-muted-foreground mb-6">
                    Be the first to integrate Brew & Board into your business systems. 
                    Get notified when API keys become available.
                  </p>
                  <div className="flex gap-3">
                    <Input
                      type="email"
                      placeholder="your@email.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="input-premium max-w-xs"
                      data-testid="input-early-access-email"
                    />
                    <Button 
                      onClick={handleEarlyAccess}
                      className="btn-premium text-white"
                      data-testid="button-early-access"
                    >
                      Join Waitlist
                    </Button>
                  </div>
                </div>
                <div className="hidden md:flex justify-center">
                  <motion.div
                    animate={{ y: [0, -10, 0] }}
                    transition={{ repeat: Infinity, duration: 3 }}
                    className="relative"
                  >
                    <div className="w-48 h-48 rounded-3xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center shadow-2xl glow-pulse">
                      <Coffee className="h-24 w-24 text-white" />
                    </div>
                    <motion.div
                      className="absolute -top-4 -right-4 w-12 h-12 rounded-full bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center shadow-lg"
                      animate={{ scale: [1, 1.2, 1] }}
                      transition={{ repeat: Infinity, duration: 2 }}
                    >
                      <Key className="h-6 w-6 text-white" />
                    </motion.div>
                  </motion.div>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <div className="grid md:grid-cols-4 gap-6 mb-12">
          {[
            { icon: Shield, title: "Secure", desc: "PIN-based auth", color: "from-emerald-500 to-teal-600" },
            { icon: Clock, title: "2hr Lead Time", desc: "Order validation", color: "from-blue-500 to-indigo-600" },
            { icon: Database, title: "PostgreSQL", desc: "Reliable storage", color: "from-purple-500 to-pink-600" },
            { icon: Webhook, title: "Webhooks", desc: "Coming soon", color: "from-amber-500 to-orange-600" },
          ].map((item, i) => (
            <motion.div
              key={item.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 + i * 0.1 }}
            >
              <Card className="premium-card hover-3d cursor-pointer group border-0">
                <CardContent className="p-6 text-center">
                  <motion.div
                    whileHover={{ rotate: 360 }}
                    transition={{ duration: 0.6 }}
                    className={`w-14 h-14 mx-auto mb-4 rounded-2xl bg-gradient-to-br ${item.color} flex items-center justify-center shadow-lg`}
                  >
                    <item.icon className="h-7 w-7 text-white" />
                  </motion.div>
                  <h3 className="font-semibold text-lg">{item.title}</h3>
                  <p className="text-sm text-muted-foreground">{item.desc}</p>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* System Health Dashboard */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
          className="mb-12"
        >
          <Card className="premium-card border-0 overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/5 via-amber-500/5 to-red-500/5" />
            <CardHeader className="relative">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2 font-serif text-2xl">
                    <Activity className="h-6 w-6 text-amber-600" />
                    System Health
                  </CardTitle>
                  <CardDescription className="flex items-center gap-2 mt-1">
                    Real-time status of all services
                    {health.lastChecked && (
                      <span className="text-xs text-muted-foreground">
                        • Last checked: {health.lastChecked.toLocaleTimeString()}
                      </span>
                    )}
                  </CardDescription>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={checkHealth}
                  disabled={isRefreshing}
                  className="gap-2"
                  data-testid="button-refresh-health"
                >
                  <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
                  Refresh
                </Button>
              </div>
            </CardHeader>
            <CardContent className="relative">
              <div className="grid md:grid-cols-2 gap-6">
                {/* System Services */}
                <div className="space-y-4">
                  <h3 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide flex items-center gap-2">
                    <Server className="h-4 w-4" />
                    Core Services
                  </h3>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between p-4 rounded-xl bg-white/50 backdrop-blur border border-gray-100" data-testid="health-api-server">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center">
                          <Wifi className="h-5 w-5 text-white" />
                        </div>
                        <div>
                          <p className="font-medium">API Server</p>
                          <p className="text-xs text-muted-foreground">Express.js backend</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <StatusBadge status={health.api} />
                        <StatusLight status={health.api} size="lg" />
                      </div>
                    </div>

                    <div className="flex items-center justify-between p-4 rounded-xl bg-white/50 backdrop-blur border border-gray-100" data-testid="health-database">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-purple-500 to-pink-600 flex items-center justify-center">
                          <Database className="h-5 w-5 text-white" />
                        </div>
                        <div>
                          <p className="font-medium">Database</p>
                          <p className="text-xs text-muted-foreground">PostgreSQL (Neon)</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <StatusBadge status={health.database} />
                        <StatusLight status={health.database} size="lg" />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Payment Services */}
                <div className="space-y-4">
                  <h3 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide flex items-center gap-2">
                    <CreditCard className="h-4 w-4" />
                    Payment Services
                  </h3>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between p-4 rounded-xl bg-white/50 backdrop-blur border border-gray-100" data-testid="health-stripe">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
                          <CreditCard className="h-5 w-5 text-white" />
                        </div>
                        <div>
                          <p className="font-medium">Stripe</p>
                          <p className="text-xs text-muted-foreground">Cards & subscriptions</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <StatusBadge status={health.stripe} />
                        <StatusLight status={health.stripe} size="lg" />
                      </div>
                    </div>

                    <div className="flex items-center justify-between p-4 rounded-xl bg-white/50 backdrop-blur border border-gray-100" data-testid="health-coinbase">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center">
                          <Bitcoin className="h-5 w-5 text-white" />
                        </div>
                        <div>
                          <p className="font-medium">Coinbase Commerce</p>
                          <p className="text-xs text-muted-foreground">Crypto payments</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <StatusBadge status={health.coinbase} />
                        <StatusLight status={health.coinbase} size="lg" />
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Overall Status Summary */}
              <div className={`mt-6 p-4 rounded-xl border ${
                overallStatus.status === 'healthy' 
                  ? 'bg-gradient-to-r from-emerald-50 to-green-50 border-emerald-200' 
                  : overallStatus.status === 'degraded'
                    ? 'bg-gradient-to-r from-amber-50 to-yellow-50 border-amber-200'
                    : overallStatus.status === 'offline'
                      ? 'bg-gradient-to-r from-red-50 to-rose-50 border-red-200'
                      : 'bg-gradient-to-r from-gray-50 to-gray-100 border-gray-200'
              }`}>
                <div className="flex items-center justify-between flex-wrap gap-4">
                  <div className="flex items-center gap-3">
                    <StatusLight status={overallStatus.status} size="lg" />
                    <span className={`text-sm font-semibold ${
                      overallStatus.status === 'healthy' ? 'text-emerald-700' :
                      overallStatus.status === 'degraded' ? 'text-amber-700' :
                      overallStatus.status === 'offline' ? 'text-red-700' : 'text-gray-700'
                    }`}>
                      {overallStatus.message}
                    </span>
                  </div>
                  <div className="flex items-center gap-4 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <StatusLight status="healthy" size="sm" /> Operational
                    </span>
                    <span className="flex items-center gap-1">
                      <StatusLight status="degraded" size="sm" /> Degraded
                    </span>
                    <span className="flex items-center gap-1">
                      <StatusLight status="offline" size="sm" /> Offline
                    </span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Blockchain Hallmark Dashboard */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.28 }}
          className="mb-12"
        >
          <Card className="premium-card border-0 overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/10 via-teal-500/5 to-purple-500/5" />
            <CardHeader className="relative">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2 font-serif text-2xl">
                    <div className="p-2 rounded-lg bg-gradient-to-br from-emerald-500 to-teal-600">
                      <Wallet className="h-5 w-5 text-white" />
                    </div>
                    Blockchain Hallmarks
                  </CardTitle>
                  <CardDescription className="flex items-center gap-2 mt-1">
                    Solana-verified document authenticity system
                    <Badge className="bg-emerald-500/10 text-emerald-700 border-emerald-200">
                      {hallmarkStats?.blockchain?.configured ? 'Connected' : 'Configuring'}
                    </Badge>
                  </CardDescription>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={fetchHallmarkData}
                    className="gap-2"
                  >
                    <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
                    Refresh
                  </Button>
                  {companyHallmarks.length === 0 && (
                    <Button
                      size="sm"
                      onClick={seedInitialHallmarks}
                      disabled={isSeeding}
                      className="gap-2 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700"
                    >
                      {isSeeding ? (
                        <RefreshCw className="h-4 w-4 animate-spin" />
                      ) : (
                        <Sparkles className="h-4 w-4" />
                      )}
                      Seed Initial Hallmarks
                    </Button>
                  )}
                </div>
              </div>
            </CardHeader>
            <CardContent className="relative">
              {/* Blockchain Stats Grid */}
              <div className="grid md:grid-cols-4 gap-4 mb-6">
                <div className="p-4 rounded-xl bg-white/50 backdrop-blur border border-gray-100">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center">
                      <Coffee className="h-5 w-5 text-white" />
                    </div>
                    <span className="text-xs text-muted-foreground">Company</span>
                  </div>
                  <p className="text-2xl font-bold">{hallmarkStats?.totalCompanyHallmarks || 0}</p>
                  <p className="text-xs text-muted-foreground">Official hallmarks</p>
                </div>
                
                <div className="p-4 rounded-xl bg-white/50 backdrop-blur border border-gray-100">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-purple-500 to-pink-600 flex items-center justify-center">
                      <Hash className="h-5 w-5 text-white" />
                    </div>
                    <span className="text-xs text-muted-foreground">Subscriber</span>
                  </div>
                  <p className="text-2xl font-bold">{hallmarkStats?.totalUserHallmarks || 0}</p>
                  <p className="text-xs text-muted-foreground">User hallmarks</p>
                </div>
                
                <div className="p-4 rounded-xl bg-white/50 backdrop-blur border border-gray-100">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center">
                      <Eye className="h-5 w-5 text-white" />
                    </div>
                    <span className="text-xs text-muted-foreground">Verifications</span>
                  </div>
                  <p className="text-2xl font-bold">{hallmarkStats?.totalVerifications || 0}</p>
                  <p className="text-xs text-muted-foreground">Total lookups</p>
                </div>
                
                <div className="p-4 rounded-xl bg-white/50 backdrop-blur border border-gray-100">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center">
                      <FileCheck className="h-5 w-5 text-white" />
                    </div>
                    <span className="text-xs text-muted-foreground">Profiles</span>
                  </div>
                  <p className="text-2xl font-bold">{hallmarkStats?.activeProfiles || 0}</p>
                  <p className="text-xs text-muted-foreground">Minted prefixes</p>
                </div>
              </div>

              {/* Solana Network Info */}
              {hallmarkStats?.blockchain && (
                <div className="p-4 rounded-xl bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-200 mb-6">
                  <div className="flex items-center justify-between flex-wrap gap-4">
                    <div className="flex items-center gap-3">
                      <StatusLight status={hallmarkStats.blockchain.configured ? "healthy" : "offline"} size="lg" />
                      <div>
                        <p className="font-semibold text-emerald-700">Solana {hallmarkStats.blockchain.network}</p>
                        <p className="text-xs text-emerald-600">
                          Slot: {hallmarkStats.blockchain.currentSlot?.toLocaleString() || 'N/A'}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-6 text-xs">
                      <div className="text-right">
                        <p className="text-muted-foreground">Wallet Balance</p>
                        <p className="font-mono font-semibold">{hallmarkStats.blockchain.walletBalance?.toFixed(4) || '0'} SOL</p>
                      </div>
                      <div className="text-right">
                        <p className="text-muted-foreground">Cost per Hallmark</p>
                        <p className="font-mono font-semibold">~$0.00025</p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Company Hallmarks List */}
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide flex items-center gap-2">
                    <Shield className="h-4 w-4" />
                    Company Hallmarks (BB-000...)
                  </h3>
                  <div className="relative w-64">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search hallmarks..."
                      value={hallmarkSearch}
                      onChange={(e) => setHallmarkSearch(e.target.value)}
                      className="pl-10 h-9"
                    />
                  </div>
                </div>
                
                {companyHallmarks.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <Hash className="h-8 w-8 mx-auto mb-2 opacity-50" />
                    <p>No company hallmarks issued yet</p>
                    <p className="text-xs">Click "Seed Initial Hallmarks" to create BB-0000000001 and BB-0000000002</p>
                  </div>
                ) : (
                  <ScrollArea className="h-[200px]">
                    <div className="space-y-2">
                      {companyHallmarks
                        .filter(h => 
                          h.serialNumber.toLowerCase().includes(hallmarkSearch.toLowerCase()) ||
                          h.assetName?.toLowerCase().includes(hallmarkSearch.toLowerCase())
                        )
                        .map((hallmark) => (
                          <div
                            key={hallmark.id}
                            className="flex items-center justify-between p-3 rounded-lg bg-white/50 border border-gray-100 hover:border-emerald-200 transition-all"
                          >
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center">
                                <Shield className="h-4 w-4 text-white" />
                              </div>
                              <div>
                                <code className="font-mono text-sm font-semibold text-emerald-700">
                                  {hallmark.serialNumber}
                                </code>
                                <p className="text-xs text-muted-foreground">{hallmark.assetName || 'Untitled'}</p>
                              </div>
                            </div>
                            <div className="flex items-center gap-4">
                              <div className="text-right text-xs">
                                <p className="text-muted-foreground">{hallmark.verificationCount} views</p>
                                <p className="text-muted-foreground">{new Date(hallmark.issuedAt).toLocaleDateString()}</p>
                              </div>
                              {hallmark.solanaTxSignature && (
                                <Badge className="bg-emerald-500/10 text-emerald-700 border-emerald-200">
                                  <CheckCircle2 className="h-3 w-3 mr-1" />
                                  On-Chain
                                </Badge>
                              )}
                              <Link href={`/verify/${hallmark.serialNumber}`}>
                                <Button variant="ghost" size="icon" className="h-8 w-8">
                                  <QrCode className="h-4 w-4" />
                                </Button>
                              </Link>
                            </div>
                          </div>
                        ))}
                    </div>
                  </ScrollArea>
                )}
              </div>

              {/* Quick Links */}
              <div className="flex flex-wrap gap-2 mt-6 pt-4 border-t">
                <Link href="/my-hallmarks">
                  <Button variant="outline" size="sm" className="gap-2">
                    <Hash className="h-4 w-4" />
                    My Hallmarks
                  </Button>
                </Link>
                <Link href="/verify">
                  <Button variant="outline" size="sm" className="gap-2">
                    <Search className="h-4 w-4" />
                    Verify Hallmark
                  </Button>
                </Link>
                <Link href="/blockchain-tutorial">
                  <Button variant="outline" size="sm" className="gap-2">
                    <BookOpen className="h-4 w-4" />
                    Tutorial
                  </Button>
                </Link>
                <Link href="/admin">
                  <Button variant="outline" size="sm" className="gap-2">
                    <Shield className="h-4 w-4" />
                    Admin Panel
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Digital Business Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.29 }}
          className="mb-12"
        >
          <Card className="premium-card border-0 overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-gray-900/5 via-amber-500/5 to-orange-500/5" />
            <CardHeader className="relative">
              <CardTitle className="flex items-center gap-2 font-serif text-2xl">
                <div className="p-2 rounded-lg bg-gradient-to-br from-gray-800 to-gray-900">
                  <Coffee className="h-5 w-5 text-amber-500" />
                </div>
                Digital Business Card
              </CardTitle>
              <CardDescription>
                Your blockchain-verified business identity. Export as PDF or share digitally.
              </CardDescription>
            </CardHeader>
            <CardContent className="relative">
              <div className="flex flex-col md:flex-row items-center gap-8">
                <BusinessCardPreview />
                <div className="flex-1 space-y-4">
                  <div className="p-4 rounded-xl bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-200">
                    <h4 className="font-semibold text-emerald-700 flex items-center gap-2 mb-2">
                      <Shield className="h-4 w-4" />
                      Blockchain Verified
                    </h4>
                    <p className="text-sm text-emerald-600">
                      Your business card includes a verifiable hallmark that links to your on-chain identity. 
                      Recipients can scan the QR code to verify your credentials.
                    </p>
                  </div>
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div className="p-3 rounded-lg bg-white/50 border border-gray-100">
                      <p className="font-medium">PDF Export</p>
                      <p className="text-xs text-muted-foreground">Standard 3.5" x 2" format</p>
                    </div>
                    <div className="p-3 rounded-lg bg-white/50 border border-gray-100">
                      <p className="font-medium">Digital Share</p>
                      <p className="text-xs text-muted-foreground">Native sharing or clipboard</p>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Professional Document Export */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.295 }}
          className="mb-12"
        >
          <DocumentExportPanel 
            hallmarkCode={companyHallmarks.length > 0 ? companyHallmarks[0]?.serialNumber : undefined} 
          />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mb-12"
        >
          <Card className="premium-card border-0">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 font-serif text-2xl">
                <Terminal className="h-6 w-6 text-amber-600" />
                API Reference
              </CardTitle>
              <CardDescription>
                Complete list of available endpoints
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {API_ENDPOINTS.map((endpoint, i) => (
                  <motion.div
                    key={`${endpoint.method}-${endpoint.path}`}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.4 + i * 0.05 }}
                    className="p-4 rounded-xl bg-white/50 backdrop-blur border border-gray-100 hover:border-amber-200 hover:shadow-lg transition-all group"
                    data-testid={`endpoint-${endpoint.method.toLowerCase()}-${endpoint.path.replace(/\//g, '-')}`}
                  >
                    <div className="flex items-start gap-4">
                      <MethodBadge method={endpoint.method} />
                      <div className="flex-1">
                        <code className="font-mono text-sm font-semibold text-gray-800 group-hover:text-amber-700 transition-colors">
                          {endpoint.path}
                        </code>
                        <p className="text-sm text-muted-foreground mt-1">
                          {endpoint.description}
                        </p>
                        <div className="flex flex-wrap gap-4 mt-2 text-xs">
                          <span className="text-gray-500">
                            <strong>Params:</strong> {endpoint.params}
                          </span>
                          <span className="text-gray-500">
                            <strong>Returns:</strong> {endpoint.response}
                          </span>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.45 }}
          className="mb-12"
        >
          <Card className="premium-card border-0">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 font-serif text-2xl">
                <Truck className="h-6 w-6 text-amber-600" />
                Integration Roadmap
              </CardTitle>
              <CardDescription>
                Upcoming third-party API integrations for automated fulfillment
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Accordion type="multiple" className="space-y-4">
                <AccordionItem value="doordash" className="border rounded-xl bg-white/50 backdrop-blur px-4">
                  <AccordionTrigger className="hover:no-underline py-4" data-testid="accordion-doordash">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-red-500 to-red-600 flex items-center justify-center shadow-lg">
                        <Truck className="h-6 w-6 text-white" />
                      </div>
                      <div className="text-left">
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-lg">DoorDash Drive API</span>
                          <Badge className="bg-red-100 text-red-700 border-red-200">Next Up</Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">Automated delivery dispatch for orders - Priority #1</p>
                      </div>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="pb-4">
                    <div className="ml-16 space-y-3">
                      <TaskCheckbox id="doordash-register" label="Register for DoorDash Drive developer account" />
                      <TaskCheckbox id="doordash-credentials" label="Obtain API credentials (sandbox + production)" />
                      <TaskCheckbox id="doordash-quote" label="Implement delivery quote endpoint" />
                      <TaskCheckbox id="doordash-dispatch" label="Create delivery dispatch on order confirmation" />
                      <TaskCheckbox id="doordash-webhook" label="Webhook integration for real-time tracking" />
                      <TaskCheckbox id="doordash-eta" label="Driver ETA and status updates to customer" />
                      <a href="https://developer.doordash.com/en-US/docs/drive/reference/drive-api" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-amber-600 hover:text-amber-700 text-sm mt-2">
                        View Documentation <ExternalLink className="h-3 w-3" />
                      </a>
                    </div>
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="ubereats" className="border rounded-xl bg-white/50 backdrop-blur px-4">
                  <AccordionTrigger className="hover:no-underline py-4" data-testid="accordion-ubereats">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center shadow-lg">
                        <Car className="h-6 w-6 text-white" />
                      </div>
                      <div className="text-left">
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-lg">Uber Direct API</span>
                          <Badge className="bg-blue-100 text-blue-700 border-blue-200">Priority #2</Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">White-label delivery service - Backup to DoorDash</p>
                      </div>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="pb-4">
                    <div className="ml-16 space-y-3">
                      <TaskCheckbox id="uber-apply" label="Apply for Uber Direct API access" />
                      <TaskCheckbox id="uber-oauth" label="Set up OAuth2 authentication flow" />
                      <TaskCheckbox id="uber-quote" label="Implement delivery quote and creation" />
                      <TaskCheckbox id="uber-tracking" label="Real-time delivery tracking integration" />
                      <TaskCheckbox id="uber-proof" label="Proof of delivery handling" />
                      <a href="https://developer.uber.com/docs/deliveries/overview" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-amber-600 hover:text-amber-700 text-sm mt-2">
                        View Documentation <ExternalLink className="h-3 w-3" />
                      </a>
                    </div>
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="stripe" className="border rounded-xl bg-white/50 backdrop-blur px-4">
                  <AccordionTrigger className="hover:no-underline py-4" data-testid="accordion-stripe">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg">
                        <CreditCard className="h-6 w-6 text-white" />
                      </div>
                      <div className="text-left">
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-lg">Stripe Payments</span>
                          <Badge className="bg-emerald-100 text-emerald-700 border-emerald-200">Live</Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">Secure payment processing & subscriptions - Fully Implemented</p>
                      </div>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="pb-4">
                    <div className="ml-16 space-y-3">
                      <div className="flex items-center gap-3 text-sm">
                        <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                        <span className="text-emerald-700">Stripe account connected</span>
                      </div>
                      <div className="flex items-center gap-3 text-sm">
                        <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                        <span className="text-emerald-700">Checkout session for orders</span>
                      </div>
                      <div className="flex items-center gap-3 text-sm">
                        <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                        <span className="text-emerald-700">Subscription management for tiers (Starter, Pro, Enterprise)</span>
                      </div>
                      <div className="flex items-center gap-3 text-sm">
                        <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                        <span className="text-emerald-700">Webhook endpoints implemented</span>
                      </div>
                      <div className="flex items-center gap-3 text-sm">
                        <Circle className="h-4 w-4 text-gray-400" />
                        <span>Invoice generation for business clients</span>
                      </div>
                      <a href="https://stripe.com/docs/api" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-amber-600 hover:text-amber-700 text-sm mt-2">
                        View Documentation <ExternalLink className="h-3 w-3" />
                      </a>
                    </div>
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="google-calendar" className="border rounded-xl bg-white/50 backdrop-blur px-4">
                  <AccordionTrigger className="hover:no-underline py-4" data-testid="accordion-google-calendar">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-sky-600 flex items-center justify-center shadow-lg">
                        <Calendar className="h-6 w-6 text-white" />
                      </div>
                      <div className="text-left">
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-lg">Google Calendar</span>
                          <Badge className="bg-green-100 text-green-700 border-green-200">Available</Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">Sync orders with meeting schedules</p>
                      </div>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="pb-4">
                    <div className="ml-16 space-y-3">
                      <div className="flex items-center gap-3 text-sm">
                        <Circle className="h-4 w-4 text-gray-400" />
                        <span>Enable Google Calendar integration via Replit</span>
                      </div>
                      <div className="flex items-center gap-3 text-sm">
                        <Circle className="h-4 w-4 text-gray-400" />
                        <span>OAuth consent for calendar access</span>
                      </div>
                      <div className="flex items-center gap-3 text-sm">
                        <Circle className="h-4 w-4 text-gray-400" />
                        <span>Create calendar events for scheduled orders</span>
                      </div>
                      <div className="flex items-center gap-3 text-sm">
                        <Circle className="h-4 w-4 text-gray-400" />
                        <span>Smart suggestions based on meeting times</span>
                      </div>
                      <div className="flex items-center gap-3 text-sm">
                        <Circle className="h-4 w-4 text-gray-400" />
                        <span>Automatic reminders for coffee orders</span>
                      </div>
                    </div>
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="twilio" className="border rounded-xl bg-white/50 backdrop-blur px-4">
                  <AccordionTrigger className="hover:no-underline py-4" data-testid="accordion-twilio">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-rose-500 to-pink-600 flex items-center justify-center shadow-lg">
                        <MessageSquare className="h-6 w-6 text-white" />
                      </div>
                      <div className="text-left">
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-lg">Twilio SMS</span>
                          <Badge className="bg-yellow-100 text-yellow-700 border-yellow-200">Waiting on EIN</Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">SMS notifications for order updates - Pending business registration</p>
                      </div>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="pb-4">
                    <div className="ml-16 space-y-3">
                      <div className="flex items-center gap-3 text-sm">
                        <Circle className="h-4 w-4 text-gray-400" />
                        <span>Set up Twilio account and phone number</span>
                      </div>
                      <div className="flex items-center gap-3 text-sm">
                        <Circle className="h-4 w-4 text-gray-400" />
                        <span>Order confirmation SMS to customers</span>
                      </div>
                      <div className="flex items-center gap-3 text-sm">
                        <Circle className="h-4 w-4 text-gray-400" />
                        <span>Delivery status text updates</span>
                      </div>
                      <div className="flex items-center gap-3 text-sm">
                        <Circle className="h-4 w-4 text-gray-400" />
                        <span>"Coffee is on the way" notifications</span>
                      </div>
                    </div>
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="maps" className="border rounded-xl bg-white/50 backdrop-blur px-4">
                  <AccordionTrigger className="hover:no-underline py-4" data-testid="accordion-maps">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-teal-500 to-cyan-600 flex items-center justify-center shadow-lg">
                        <MapPin className="h-6 w-6 text-white" />
                      </div>
                      <div className="text-left">
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-lg">Google Maps</span>
                          <Badge className="bg-gray-100 text-gray-700 border-gray-200">Future</Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">Address autocomplete & delivery tracking</p>
                      </div>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="pb-4">
                    <div className="ml-16 space-y-3">
                      <div className="flex items-center gap-3 text-sm">
                        <Circle className="h-4 w-4 text-gray-400" />
                        <span>Enable Places API for address autocomplete</span>
                      </div>
                      <div className="flex items-center gap-3 text-sm">
                        <Circle className="h-4 w-4 text-gray-400" />
                        <span>Distance matrix for delivery estimates</span>
                      </div>
                      <div className="flex items-center gap-3 text-sm">
                        <Circle className="h-4 w-4 text-gray-400" />
                        <span>Live map tracking for deliveries</span>
                      </div>
                      <div className="flex items-center gap-3 text-sm">
                        <Circle className="h-4 w-4 text-gray-400" />
                        <span>Vendor location display on map</span>
                      </div>
                    </div>
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="mobile-app" className="border rounded-xl bg-white/50 backdrop-blur px-4">
                  <AccordionTrigger className="hover:no-underline py-4" data-testid="accordion-mobile-app">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center shadow-lg">
                        <Zap className="h-6 w-6 text-white" />
                      </div>
                      <div className="text-left">
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-lg">Mobile App (iOS/Android)</span>
                          <Badge className="bg-purple-100 text-purple-700 border-purple-200">Coming Soon</Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">Native mobile experience for on-the-go ordering</p>
                      </div>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="pb-4">
                    <div className="ml-16 space-y-3">
                      <div className="flex items-center gap-3 text-sm">
                        <Circle className="h-4 w-4 text-gray-400" />
                        <span>React Native or Flutter framework selection</span>
                      </div>
                      <div className="flex items-center gap-3 text-sm">
                        <Circle className="h-4 w-4 text-gray-400" />
                        <span>Push notifications for order updates</span>
                      </div>
                      <div className="flex items-center gap-3 text-sm">
                        <Circle className="h-4 w-4 text-gray-400" />
                        <span>Biometric authentication (Face ID/Touch ID)</span>
                      </div>
                      <div className="flex items-center gap-3 text-sm">
                        <Circle className="h-4 w-4 text-gray-400" />
                        <span>Offline mode with sync</span>
                      </div>
                      <div className="flex items-center gap-3 text-sm">
                        <Circle className="h-4 w-4 text-gray-400" />
                        <span>Apple Pay / Google Pay integration</span>
                      </div>
                      <div className="flex items-center gap-3 text-sm">
                        <Circle className="h-4 w-4 text-gray-400" />
                        <span>App Store & Play Store submission</span>
                      </div>
                    </div>
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <Card className="premium-card border-0">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 font-serif text-2xl">
                <FileJson className="h-6 w-6 text-amber-600" />
                Code Examples
              </CardTitle>
              <CardDescription>
                Quick start with your favorite language
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Tabs value={activeTab} onValueChange={setActiveTab}>
                <TabsList className="mb-4 bg-white/50">
                  <TabsTrigger value="javascript" className="gap-2">
                    JavaScript
                  </TabsTrigger>
                  <TabsTrigger value="python" className="gap-2">
                    Python
                  </TabsTrigger>
                  <TabsTrigger value="curl" className="gap-2">
                    cURL
                  </TabsTrigger>
                </TabsList>

                {Object.entries(CODE_EXAMPLES).map(([lang, code]) => (
                  <TabsContent key={lang} value={lang}>
                    <div className="relative group">
                      <pre className="p-6 rounded-xl bg-gray-900 text-gray-100 overflow-x-auto text-sm font-mono">
                        <code>{code}</code>
                      </pre>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => copyCode(code, lang)}
                        className="absolute top-4 right-4 text-gray-400 hover:text-white hover:bg-white/10"
                        data-testid={`button-copy-${lang}`}
                      >
                        {copiedCode === lang ? (
                          <Check className="h-4 w-4 text-green-400" />
                        ) : (
                          <Copy className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                  </TabsContent>
                ))}
              </Tabs>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="mt-12 text-center"
        >
          <div className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-gradient-to-r from-amber-100 to-orange-100 border border-amber-200">
            <BookOpen className="h-5 w-5 text-amber-600" />
            <span className="text-amber-800 font-medium">
              Full documentation coming soon
            </span>
            <ExternalLink className="h-4 w-4 text-amber-600" />
          </div>
        </motion.div>
      </div>
    </div>
  );
}

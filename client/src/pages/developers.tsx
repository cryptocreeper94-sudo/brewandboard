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
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";

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
  const [health, setHealth] = useState<SystemHealth>({
    api: 'checking',
    database: 'checking',
    stripe: 'checking',
    coinbase: 'checking',
    lastChecked: null
  });
  
  useEffect(() => {
    const devAuth = localStorage.getItem("coffee_dev_auth");
    if (devAuth === "true") {
      setIsAuthenticated(true);
    } else {
      window.location.href = "/";
    }
  }, []);

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
                          <Badge className="bg-amber-100 text-amber-700 border-amber-200">Priority</Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">Automated delivery dispatch for orders</p>
                      </div>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="pb-4">
                    <div className="ml-16 space-y-3">
                      <div className="flex items-center gap-3 text-sm">
                        <Circle className="h-4 w-4 text-gray-400" />
                        <span>Register for DoorDash Drive developer account</span>
                      </div>
                      <div className="flex items-center gap-3 text-sm">
                        <Circle className="h-4 w-4 text-gray-400" />
                        <span>Obtain API credentials (sandbox + production)</span>
                      </div>
                      <div className="flex items-center gap-3 text-sm">
                        <Circle className="h-4 w-4 text-gray-400" />
                        <span>Implement delivery quote endpoint</span>
                      </div>
                      <div className="flex items-center gap-3 text-sm">
                        <Circle className="h-4 w-4 text-gray-400" />
                        <span>Create delivery dispatch on order confirmation</span>
                      </div>
                      <div className="flex items-center gap-3 text-sm">
                        <Circle className="h-4 w-4 text-gray-400" />
                        <span>Webhook integration for real-time tracking</span>
                      </div>
                      <div className="flex items-center gap-3 text-sm">
                        <Circle className="h-4 w-4 text-gray-400" />
                        <span>Driver ETA and status updates to customer</span>
                      </div>
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
                          <Badge className="bg-blue-100 text-blue-700 border-blue-200">Planned</Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">White-label delivery service</p>
                      </div>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="pb-4">
                    <div className="ml-16 space-y-3">
                      <div className="flex items-center gap-3 text-sm">
                        <Circle className="h-4 w-4 text-gray-400" />
                        <span>Apply for Uber Direct API access</span>
                      </div>
                      <div className="flex items-center gap-3 text-sm">
                        <Circle className="h-4 w-4 text-gray-400" />
                        <span>Set up OAuth2 authentication flow</span>
                      </div>
                      <div className="flex items-center gap-3 text-sm">
                        <Circle className="h-4 w-4 text-gray-400" />
                        <span>Implement delivery quote and creation</span>
                      </div>
                      <div className="flex items-center gap-3 text-sm">
                        <Circle className="h-4 w-4 text-gray-400" />
                        <span>Real-time delivery tracking integration</span>
                      </div>
                      <div className="flex items-center gap-3 text-sm">
                        <Circle className="h-4 w-4 text-gray-400" />
                        <span>Proof of delivery handling</span>
                      </div>
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
                          <Badge className="bg-amber-100 text-amber-700 border-amber-200">Priority</Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">Secure payment processing & subscriptions</p>
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
                        <Circle className="h-4 w-4 text-gray-400" />
                        <span>Implement checkout session for orders</span>
                      </div>
                      <div className="flex items-center gap-3 text-sm">
                        <Circle className="h-4 w-4 text-gray-400" />
                        <span>Add subscription management for tiers</span>
                      </div>
                      <div className="flex items-center gap-3 text-sm">
                        <Circle className="h-4 w-4 text-gray-400" />
                        <span>Webhook for payment confirmations</span>
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
                          <Badge className="bg-gray-100 text-gray-700 border-gray-200">Future</Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">SMS notifications for order updates</p>
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
